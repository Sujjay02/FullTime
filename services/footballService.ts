
import { GoogleGenAI, Type } from "@google/genai";
import { Entity, EntityType, Match, MatchStatus, League, LeagueMetric } from "../types";
import { getCachedData, setCachedData } from "./cacheService";
import { INITIAL_LIVE_MATCHES, INITIAL_EXCITING_MATCHES, INITIAL_HIGHEST_SCORING_MATCHES, INITIAL_LEAGUE_METRICS, getGenericImage } from "../constants";

// Initialize Gemini API client directly with process.env.API_KEY following strict guidelines
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('⚠️ No Gemini API key found! Set GEMINI_API_KEY in your environment.');
}
const ai = new GoogleGenAI({ apiKey: apiKey || '' });
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
  console.error(`❌ Gemini API Error (${context}):`, error);

  if (error?.message?.includes('403')) {
    console.error('🔑 API Key Issue: Your Gemini API key is forbidden. Check:');
    console.error('   1. Go to https://aistudio.google.com/apikey');
    console.error('   2. Add fulltime-football.web.app to allowed domains');
    console.error('   3. Or generate a new unrestricted API key');
  } else if (error?.message?.includes('401')) {
    console.error('🔑 API Key Invalid: Generate a new key at https://aistudio.google.com/apikey');
  } else if (error?.message?.includes('429')) {
    console.error('⏰ Rate Limit: Too many requests. Try again in a few minutes.');
  }

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
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Find TOP 4-6 soccer matches from THIS WEEK (${weekStartStr} to ${dateStr}).

CRITICAL REQUIREMENTS:
1. Focus on MAJOR leagues: Premier League, La Liga, Bundesliga, Serie A, Champions League, Ligue 1
2. For EACH match, you MUST provide:
   - Complete Starting XI for BOTH teams (11 players each with name, number, position)
   - Bench players for BOTH teams (at least 5 subs each)
   - Match events (goals, cards, substitutions) with exact minute
   - Player season stats (goals and assists for each player)
3. Use REAL data from recent matches (last 7 days only)
4. DO NOT return matches without complete lineups
5. Ensure player names, numbers, and positions are ACCURATE

Example player format:
{
  "name": "Mohamed Salah",
  "number": 11,
  "position": "FWD",
  "goals": 15,
  "assists": 8
}`,
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
    console.log('🔍 API returned', data.length, 'matches');

    const matches = data.map((item: any, idx: number) => {
      const { home, away } = extractTeams(item);
      const id = `match_${home}_${away}`.replace(/\s/g, '').toLowerCase();
      const leagueStr = normalizeLeague(item.league);

      // Detailed logging for lineups
      const homeLineupCount = item.lineupHome?.length || 0;
      const awayLineupCount = item.lineupAway?.length || 0;
      const homeBenchCount = item.benchHome?.length || 0;
      const awayBenchCount = item.benchAway?.length || 0;

      console.log(`\n📊 Match ${idx + 1}: ${home} vs ${away}`);
      console.log(`   League: ${leagueStr} | Score: ${item.score || 'N/A'}`);
      console.log(`   ✅ Home XI: ${homeLineupCount} players | Bench: ${homeBenchCount}`);
      console.log(`   ✅ Away XI: ${awayLineupCount} players | Bench: ${awayBenchCount}`);
      console.log(`   ⚽ Events: ${item.events?.length || 0}`);

      if (homeLineupCount === 0 || awayLineupCount === 0) {
        console.warn(`   ⚠️ WARNING: Missing lineups for ${home} vs ${away}`);
      }

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

    setCachedData(cacheKey, matches, 1800); // Cache for 30 minutes
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
      contents: `Find 4 high-drama soccer matches from the last 7 days.

REQUIREMENTS:
- Must include COMPLETE Starting XI for BOTH teams (11 players each)
- Must include Bench players (5+ subs per team)
- Must include ALL match events (goals, cards, subs) with minutes
- Must include player season stats (goals, assists)
- Focus on exciting matches with comebacks, late goals, or high stakes
- Only use REAL matches with VERIFIED lineups`,
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
      contents: `Find 4 high-scoring soccer matches (5+ total goals) from the last 7 days.

REQUIREMENTS:
- Must include COMPLETE Starting XI for BOTH teams (11 players each)
- Must include Bench players (5+ subs per team)
- Must include ALL goal events with scorer names and minutes
- Must include player season stats (goals, assists)
- Focus on matches with 5+ combined goals
- Only use REAL matches with VERIFIED lineups and scores`,
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
  if (!apiKey) {
    console.warn('⚠️ No API key - returning static league metrics');
    return INITIAL_LEAGUE_METRICS;
  }

  try {
    console.log('🏆 Fetching league metrics...');
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
    );

    const apiCall = ai.models.generateContent({
      model: modelName,
      contents: "Rank the top 5 European soccer leagues (Premier League, La Liga, Bundesliga, Serie A, Ligue 1) based on current season entertainment and watchability. Include the 'match of the week' for each league with its lineups.",
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

    const response = await Promise.race([apiCall, timeoutPromise]) as any;
    console.log('✅ League metrics fetched successfully');
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
    console.error('❌ Error fetching league metrics:', error);
    return handleApiError(error, "League Metrics", INITIAL_LEAGUE_METRICS);
  }
};

export const searchEntities = async (query: string): Promise<Entity[]> => {
  if (!process.env.API_KEY || !query) return [];
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Search for soccer entities: "${query}". If searching for a TEAM, include their last 5 matches (with full match details, lineups, and watchability scores) and next 3 upcoming matches.`,
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
              rating: { type: Type.NUMBER },
              avgWatchability: { type: Type.NUMBER, description: "Average watchability of team's matches" },
              recentMatches: {
                type: Type.ARRAY,
                description: "Last 5 matches played by this team",
                items: LINEUP_SCHEMA
              },
              upcomingMatches: {
                type: Type.ARRAY,
                description: "Next 3 upcoming matches for this team",
                items: LINEUP_SCHEMA
              }
            }
          }
        }
      }
    });
    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, idx: number) => {
      const entity: Entity = {
        id: `s_${idx}_${Date.now()}`,
        name: item.name,
        type: (item.type?.toUpperCase() as EntityType) || 'TEAM',
        image: getGenericImage(item.name),
        subtitle: item.subtitle,
        rating: item.rating,
        avgWatchability: item.avgWatchability
      };

      // Convert recent matches if team
      if (item.recentMatches && Array.isArray(item.recentMatches)) {
        entity.recentMatches = item.recentMatches.map((m: any, mIdx: number) => {
          const { home, away } = extractTeams(m);
          const matchId = `recent_${entity.id}_${mIdx}`;
          return {
            id: matchId,
            name: `${home} vs ${away}`,
            type: 'MATCH' as const,
            homeTeam: home,
            awayTeam: away,
            score: m.score || '0-0',
            minute: m.minute || 'FT',
            status: (m.status?.toUpperCase() as MatchStatus) || 'FT',
            league: normalizeLeague(m.league),
            subtitle: `${normalizeLeague(m.league)} • ${m.minute || 'FT'}`,
            image: getGenericImage(matchId),
            watchability: m.watchability || 5.0,
            formation: { home: m.formationHome || "4-3-3", away: m.formationAway || "4-3-3" },
            lineups: { home: m.lineupHome || [], away: m.lineupAway || [] },
            bench: { home: m.benchHome || [], away: m.benchAway || [] },
            events: m.events || []
          };
        });
      }

      // Convert upcoming matches if team
      if (item.upcomingMatches && Array.isArray(item.upcomingMatches)) {
        entity.upcomingMatches = item.upcomingMatches.map((m: any, mIdx: number) => {
          const { home, away } = extractTeams(m);
          const matchId = `upcoming_${entity.id}_${mIdx}`;
          return {
            id: matchId,
            name: `${home} vs ${away}`,
            type: 'MATCH' as const,
            homeTeam: home,
            awayTeam: away,
            score: m.score || 'vs',
            minute: m.minute || 'UPCOMING',
            status: 'UPCOMING' as const,
            league: normalizeLeague(m.league),
            subtitle: `${normalizeLeague(m.league)} • ${m.minute || 'Upcoming'}`,
            image: getGenericImage(matchId),
            watchability: m.watchability || 7.0,
            formation: { home: m.formationHome || "4-3-3", away: m.formationAway || "4-3-3" },
            lineups: { home: m.lineupHome || [], away: m.lineupAway || [] },
            bench: { home: m.benchHome || [], away: m.benchAway || [] },
            events: []
          };
        });
      }

      return entity;
    });
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};
