
import { GoogleGenAI, Type } from "@google/genai";
import { Entity, EntityType, Match, MatchStatus, League, LeagueMetric } from "../types";
import { getCachedData, setCachedData } from "./cacheService";
import { INITIAL_LIVE_MATCHES, INITIAL_EXCITING_MATCHES, INITIAL_HIGHEST_SCORING_MATCHES, getGenericImage } from "../constants";

// Initialize Gemini API client directly with process.env.API_KEY following strict guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = "gemini-3-flash-preview";

const normalizeLeague = (input: string): string => {
  if (!input) return 'Unknown League';
  const l = input.toLowerCase();
  if (l.includes('premier')) return League.PREMIER_LEAGUE;
  if (l.includes('la liga')) return League.LA_LIGA;
  if (l.includes('bundesliga')) return League.BUNDESLIGA;
  if (l.includes('serie a')) return League.SERIE_A;
  if (l.includes('ligue 1')) return League.LIGUE_1;
  if (l.includes('mls')) return League.MLS;
  if (l.includes('champions')) return League.CHAMPIONS_LEAGUE;
  return input;
};

const handleApiError = (error: any, context: string, fallback: any) => {
  console.warn(`Gemini Error (${context}):`, error);
  return fallback;
};

const LINEUP_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    homeTeam: { type: Type.STRING },
    awayTeam: { type: Type.STRING },
    score: { type: Type.STRING },
    minute: { type: Type.STRING },
    status: { type: Type.STRING },
    league: { type: Type.STRING },
    watchability: { type: Type.NUMBER },
    formationHome: { type: Type.STRING },
    formationAway: { type: Type.STRING },
    lineupHome: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          number: { type: Type.NUMBER },
          position: { type: Type.STRING },
          goals: { type: Type.NUMBER, description: "Total goals this season" },
          assists: { type: Type.NUMBER, description: "Total assists this season" }
        }
      }
    },
    lineupAway: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          number: { type: Type.NUMBER },
          position: { type: Type.STRING },
          goals: { type: Type.NUMBER, description: "Total goals this season" },
          assists: { type: Type.NUMBER, description: "Total assists this season" }
        }
      }
    },
    benchHome: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          number: { type: Type.NUMBER },
          position: { type: Type.STRING },
          goals: { type: Type.NUMBER },
          assists: { type: Type.NUMBER }
        }
      }
    },
    benchAway: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          number: { type: Type.NUMBER },
          position: { type: Type.STRING },
          goals: { type: Type.NUMBER },
          assists: { type: Type.NUMBER }
        }
      }
    },
    events: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING }, // GOAL, CARD, SUB
          minute: { type: Type.STRING },
          player: { type: Type.STRING },
          playerOut: { type: Type.STRING },
          team: { type: Type.STRING }, // HOME or AWAY
          detail: { type: Type.STRING }
        }
      }
    }
  }
};

/**
 * Helper to ensure we have valid home and away team names even if AI deviates from schema keys.
 */
const extractTeams = (item: any) => {
  const home = item.homeTeam || item.home || item.teamHome || "Home Team";
  const away = item.awayTeam || item.away || item.teamAway || "Away Team";
  return { home, away };
};

export const getLiveMatches = async (leagueName?: string): Promise<Match[]> => {
  const cacheKey = `live_v2_${leagueName || 'all'}`;
  const cached = getCachedData<Match[]>(cacheKey);
  if (cached) return cached;
  if (!process.env.API_KEY) return INITIAL_LIVE_MATCHES;

  try {
    const now = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Find live or recent soccer matches for today ${now}. 
      For each match, provide the ACCURATE Starting XI, Bench, and Events.
      Include goals/assists season stats. 
      If no matches are currently live, find the latest completed or upcoming ones for TODAY.`,
      config: {
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: LINEUP_SCHEMA
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    const matches = data.map((item: any) => {
      const { home, away } = extractTeams(item);
      const id = `match_${home}_${away}`.replace(/\s/g, '').toLowerCase();
      const leagueStr = normalizeLeague(item.league);

      // Debug logging for lineups
      console.log(`Match: ${home} vs ${away}`);
      console.log('Home lineup:', item.lineupHome?.length || 0, 'players');
      console.log('Away lineup:', item.lineupAway?.length || 0, 'players');

      return {
        id,
        name: `${home} vs ${away}`,
        type: 'MATCH',
        homeTeam: home,
        awayTeam: away,
        score: item.score || '0-0',
        minute: item.minute || 'UPCOMING',
        league: leagueStr,
        status: (item.status?.toUpperCase() as MatchStatus) || 'LIVE',
        image: getGenericImage(id),
        watchability: item.watchability || 5,
        subtitle: `${leagueStr} • ${item.minute || 'Upcoming'}`,
        formation: { home: item.formationHome || "4-3-3", away: item.formationAway || "4-3-3" },
        lineups: { home: item.lineupHome || [], away: item.lineupAway || [] },
        bench: { home: item.benchHome || [], away: item.benchAway || [] },
        events: item.events || []
      };
    });

    setCachedData(cacheKey, matches, 300);
    return matches;
  } catch (error) {
    return handleApiError(error, "Live Matches", INITIAL_LIVE_MATCHES);
  }
};

export const getExcitingMatches = async (): Promise<Match[]> => {
  const cacheKey = 'exciting_v2';
  const cached = getCachedData<Match[]>(cacheKey);
  if (cached) return cached;
  if (!process.env.API_KEY) return INITIAL_EXCITING_MATCHES;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Find 4 high-drama soccer matches from the last 7 days with full lineups, season stats, and event timelines.",
      config: {
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: LINEUP_SCHEMA }
      }
    });
    const data = JSON.parse(response.text || "[]");
    const matches = data.map((item: any) => {
      const { home, away } = extractTeams(item);
      const id = `ex_${home}_${away}`.replace(/\s/g, '').toLowerCase();
      const leagueStr = normalizeLeague(item.league);
      return {
        id,
        name: `${home} vs ${away}`,
        type: 'MATCH',
        homeTeam: home,
        awayTeam: away,
        score: item.score || '0-0',
        minute: "FT",
        status: 'FT',
        league: leagueStr,
        subtitle: `${leagueStr} • Thriller`,
        image: getGenericImage(id),
        watchability: item.watchability || 12,
        lineups: { home: item.lineupHome || [], away: item.lineupAway || [] },
        bench: { home: item.benchHome || [], away: item.benchAway || [] },
        events: item.events || []
      };
    });
    setCachedData(cacheKey, matches, 3600);
    return matches;
  } catch (error) {
    return handleApiError(error, "Exciting", INITIAL_EXCITING_MATCHES);
  }
};

export const getHighestScoringMatches = async (): Promise<Match[]> => {
  const cacheKey = 'high_scoring_v2';
  const cached = getCachedData<Match[]>(cacheKey);
  if (cached) return cached;
  if (!process.env.API_KEY) return INITIAL_HIGHEST_SCORING_MATCHES;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Find 4 high-scoring soccer matches from the last 7 days with full match data and player season stats.",
      config: {
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: LINEUP_SCHEMA }
      }
    });
    const data = JSON.parse(response.text || "[]");
    const matches = data.map((item: any) => {
      const { home, away } = extractTeams(item);
      const id = `hs_${home}_${away}`.replace(/\s/g, '').toLowerCase();
      const leagueStr = normalizeLeague(item.league);
      return {
        id,
        name: `${home} vs ${away}`,
        type: 'MATCH',
        homeTeam: home,
        awayTeam: away,
        score: item.score || '0-0',
        league: leagueStr,
        subtitle: `${leagueStr} • Goal Fest`,
        status: 'FT',
        image: getGenericImage(id),
        lineups: { home: item.lineupHome || [], away: item.lineupAway || [] },
        bench: { home: item.benchHome || [], away: item.benchAway || [] },
        events: item.events || []
      } as Match;
    });
    setCachedData(cacheKey, matches, 3600);
    return matches;
  } catch (error) {
    return handleApiError(error, "Scoring", INITIAL_HIGHEST_SCORING_MATCHES);
  }
};

export const getLeagueMetrics = async (): Promise<LeagueMetric[]> => {
  if (!process.env.API_KEY) return [];
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Rank the top 5 European soccer leagues based on current season entertainment and watchability. Include the 'match of the week' for each league with its lineups.",
      config: {
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              leagueName: { type: Type.STRING },
              avgWatchability: { type: Type.NUMBER },
              matchCount: { type: Type.NUMBER, description: "Number of matches analyzed" },
              topMatch: LINEUP_SCHEMA
            }
          }
        }
      }
    });
    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, idx: number) => {
      const lgName = normalizeLeague(item.leagueName);
      let mappedTopMatch: Match | undefined = undefined;
      
      if (item.topMatch) {
         const { home, away } = extractTeams(item.topMatch);
         const tmId = `tm_${lgName}_${idx}`.replace(/\s/g, '');
         mappedTopMatch = {
            id: tmId,
            name: `${home} vs ${away}`,
            type: 'MATCH',
            homeTeam: home,
            awayTeam: away,
            score: item.topMatch.score || '0-0',
            minute: item.topMatch.minute || 'FT',
            status: (item.topMatch.status?.toUpperCase() as MatchStatus) || 'FT',
            league: lgName,
            subtitle: `${lgName} • Featured`,
            image: getGenericImage(tmId),
            watchability: item.topMatch.watchability || 8.0,
            formation: { home: item.topMatch.formationHome || "4-3-3", away: item.topMatch.formationAway || "4-3-3" },
            lineups: { home: item.topMatch.lineupHome || [], away: item.topMatch.lineupAway || [] },
            bench: { home: item.topMatch.benchHome || [], away: item.topMatch.benchAway || [] },
            events: item.topMatch.events || []
         };
      }

      return {
        id: `lg_${idx}`,
        name: lgName,
        avgWatchability: item.avgWatchability || 7.0,
        matchCount: item.matchCount || 10,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(lgName)}&background=random&color=fff`,
        topMatch: mappedTopMatch
      };
    });
  } catch (error) {
    return [];
  }
};

export const searchEntities = async (query: string): Promise<Entity[]> => {
  if (!process.env.API_KEY || !query) return [];
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Search for soccer entities: "${query}".`,
      config: {
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              rating: { type: Type.NUMBER }
            }
          }
        }
      }
    });
    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, idx: number) => ({
      ...item,
      id: `s_${idx}_${Date.now()}`,
      image: getGenericImage(item.name),
      type: (item.type?.toUpperCase() as EntityType) || 'TEAM'
    }));
  } catch (error) {
    return [];
  }
};
