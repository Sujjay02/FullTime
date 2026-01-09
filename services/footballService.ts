
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

// Request deduplication - prevent multiple identical API calls
const pendingRequests = new Map<string, Promise<any>>();

const dedupedApiCall = async <T>(key: string, apiCall: () => Promise<T>): Promise<T> => {
  if (pendingRequests.has(key)) {
    console.log(`♻️ Reusing pending request: ${key}`);
    return pendingRequests.get(key) as Promise<T>;
  }

  const promise = apiCall().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
};

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
          assists: { type: Type.NUMBER, description: "Total assists this season" },
          watchability: { type: Type.NUMBER, description: "Player excitement rating 0-10 based on form, skills, impact" }
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
          assists: { type: Type.NUMBER, description: "Total assists this season" },
          watchability: { type: Type.NUMBER, description: "Player excitement rating 0-10 based on form, skills, impact" }
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
          assists: { type: Type.NUMBER },
          watchability: { type: Type.NUMBER, description: "Player excitement rating 0-10" }
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
          assists: { type: Type.NUMBER },
          watchability: { type: Type.NUMBER, description: "Player excitement rating 0-10" }
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
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  // Use date in cache key to auto-expire at day change
  const cacheKey = `live_${dateStr}_${leagueName || 'all'}`;
  const cached = getCachedData<Match[]>(cacheKey);
  if (cached) {
    console.log(`✅ Cache hit: ${cacheKey}`);
    return cached;
  }
  if (!process.env.API_KEY) return INITIAL_LIVE_MATCHES;

  const dedupKey = `live_${dateStr}_${leagueName || 'all'}`;
  return dedupedApiCall(dedupKey, async () => {
    try {
      console.log(`🚀 Fetching TODAY'S matches: ${dateStr}`);
      const response = await ai.models.generateContent({
      model: modelName,
      contents: `CRITICAL: Use Google Search to find REAL football matches happening on ${dateStr}.

SEARCH QUERY REQUIREMENTS:
- Search: "football matches today ${dateStr} ${leagueName || 'Premier League La Liga Bundesliga'}"
- Use sites: livescore.com, espn.com, bbc.com/sport, flashscore.com
- Verify ALL data comes from ${dateStr} ONLY

REQUIRED: Find EXACTLY 4 REAL matches from ${dateStr}:
${leagueName ? `- MUST be from ${leagueName}` : '- From: Premier League, La Liga, Bundesliga, Serie A, or Champions League'}
- Include LIVE matches first, then FT, then UPCOMING
- NO fictional data - all teams, scores, times must be VERIFIED real

For EACH match provide:
1. Confirmed team names (verify spelling from official sources)
2. REAL current score or "vs" if upcoming
3. Actual match status (LIVE with minute, HT, FT, or UPCOMING with time)
4. Verified starting lineups (11 players each with real jersey numbers)
5. Real formations currently being used
6. Actual match events with exact times
7. Player stats (goals/assists this season - VERIFY from transfermarkt or similar)
8. Player watchability scores (0-10) based on current form and stats

VALIDATE: Cross-reference at least 2 sources before including any data.`,
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
  });
};

export const getExcitingMatches = async (): Promise<Match[]> => {
  const now = new Date();
  // Get current week number for cache key
  const weekNumber = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  const cacheKey = `exciting_week_${weekNumber}`;

  const cached = getCachedData<Match[]>(cacheKey);
  if (cached) {
    console.log(`✅ Cache hit: ${cacheKey}`);
    return cached;
  }
  if (!process.env.API_KEY) return INITIAL_EXCITING_MATCHES;

  const dedupKey = `exciting_week_${weekNumber}`;
  return dedupedApiCall(dedupKey, async () => {
    try {
      // Get start of current week (Monday)
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const startDate = startOfWeek.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];

      console.log(`🚀 Fetching THIS WEEK'S exciting matches: ${startDate} to ${endDate}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `CRITICAL: Use Google Search to find the MOST EXCITING completed football matches from THIS WEEK (${startDate} to ${endDate}).

SEARCH STRATEGY:
- Search: "best football matches this week ${startDate} ${endDate} highlights goals"
- Focus on matches with 4+ goals, comebacks, late winners, or dramatic finishes
- Use: espn.com, bbc.com/sport, goal.com, whoscored.com
- ONLY include matches that actually happened between ${startDate} and ${endDate}

REQUIRED: Find EXACTLY 4 REAL exciting matches:
- Each must have happened THIS WEEK (${startDate} to ${endDate})
- Must have high entertainment value (comebacks, many goals, close finishes)
- From major leagues: Premier League, La Liga, Bundesliga, Serie A, Champions League
- All matches must be FINISHED (FT status)

For EACH match provide:
1. REAL team names (verify from match reports)
2. Final score
3. Exact date the match was played (YYYY-MM-DD format)
4. Actual starting lineups from that specific match
5. Real formations used
6. All goal events with scorer names and exact minutes
7. Cards and substitutions
8. Player stats verified from that match
9. Watchability score 8-10 (these should all be exciting!)

VERIFICATION: Each match must be verified from official match reports or live score sites.`,
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
  });
};

export const getHighestScoringMatches = async (): Promise<Match[]> => {
  const cacheKey = 'high_scoring_v2';
  const cached = getCachedData<Match[]>(cacheKey);
  if (cached) return cached;
  if (!process.env.API_KEY) return INITIAL_HIGHEST_SCORING_MATCHES;

  return dedupedApiCall('high_scoring', async () => {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      const startDate = sevenDaysAgo.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];

      console.log(`🚀 High-scoring matches: ${startDate} to ${endDate}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Find EXACTLY 4 high-scoring matches (5+ goals) between ${startDate} and ${endDate} (last 7 days ONLY). NO old matches. For EACH match, use ACTUAL lineups from THAT SPECIFIC DATE. Include: match date, lineups, formations, goal events, stats.`,
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
  });
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

  // Check cache first
  const cacheKey = `search_${query.toLowerCase()}`;
  const cached = getCachedData<Entity[]>(cacheKey);
  if (cached) {
    console.log(`✅ Search cache hit: ${cacheKey}`);
    return cached;
  }

  // Dedupe concurrent searches for same query
  const dedupKey = `search_${query}`;
  return dedupedApiCall(dedupKey, async () => {
    try {
      console.log(`🔍 Searching for: "${query}"`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Search: "${query}". Return 5-8 results. If TEAM: include squad, formation, league, recent matches, fixtures, avg watchability.`,
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
              league: { type: Type.STRING, description: "League the team plays in" },
              formation: { type: Type.STRING, description: "Preferred formation (e.g., '4-3-3')" },
              avgWatchability: { type: Type.NUMBER, description: "Average watchability of team's matches" },
              squad: {
                type: Type.ARRAY,
                description: "Current squad - ALL players in the team",
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
    const results = data.map((item: any, idx: number) => {
      const entity: Entity = {
        id: `s_${idx}_${Date.now()}`,
        name: item.name,
        type: (item.type?.toUpperCase() as EntityType) || 'TEAM',
        image: getGenericImage(item.name),
        subtitle: item.subtitle,
        rating: item.rating,
        avgWatchability: item.avgWatchability,
        league: item.league,
        formation: item.formation,
        squad: item.squad || []
      };

      // Convert recent/upcoming matches...
      if (item.recentMatches) entity.recentMatches = item.recentMatches.map((m: any, mIdx: number) => ({
        id: `recent_${entity.id}_${mIdx}`,
        name: `${extractTeams(m).home} vs ${extractTeams(m).away}`,
        type: 'MATCH' as const,
        homeTeam: extractTeams(m).home,
        awayTeam: extractTeams(m).away,
        score: m.score || '0-0',
        minute: m.minute || 'FT',
        status: (m.status?.toUpperCase() as MatchStatus) || 'FT',
        league: normalizeLeague(m.league),
        subtitle: `${normalizeLeague(m.league)} • ${m.minute || 'FT'}`,
        image: getGenericImage(`recent_${entity.id}_${mIdx}`),
        watchability: m.watchability || 5.0,
        formation: { home: m.formationHome || "4-3-3", away: m.formationAway || "4-3-3" },
        lineups: { home: m.lineupHome || [], away: m.lineupAway || [] },
        bench: { home: m.benchHome || [], away: m.benchAway || [] },
        events: m.events || []
      }));

      if (item.upcomingMatches) entity.upcomingMatches = item.upcomingMatches.map((m: any, mIdx: number) => ({
        id: `upcoming_${entity.id}_${mIdx}`,
        name: `${extractTeams(m).home} vs ${extractTeams(m).away}`,
        type: 'MATCH' as const,
        homeTeam: extractTeams(m).home,
        awayTeam: extractTeams(m).away,
        score: m.score || 'vs',
        minute: m.minute || 'UPCOMING',
        status: 'UPCOMING' as const,
        league: normalizeLeague(m.league),
        subtitle: `${normalizeLeague(m.league)} • Upcoming`,
        image: getGenericImage(`upcoming_${entity.id}_${mIdx}`),
        watchability: m.watchability || 7.0,
        formation: { home: m.formationHome || "4-3-3", away: m.formationAway || "4-3-3" },
        lineups: { home: m.lineupHome || [], away: m.lineupAway || [] },
        bench: { home: m.benchHome || [], away: m.benchAway || [] },
        events: []
      }));

      return entity;
    });

    // Cache search results for 10 minutes
    setCachedData(cacheKey, results, 600);
    console.log(`✅ Search complete: ${results.length} results`);

    return results;
  } catch (error) {
    console.error('❌ Search error:', error);
    return [];
  }
  });
};

/**
 * Get most exciting players to watch today
 * Returns top performers, in-form players, and players with upcoming high-stakes matches
 */
export const getExcitingPlayers = async (): Promise<Entity[]> => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const cacheKey = `exciting_players_${dateStr}`;

  const cached = getCachedData<Entity[]>(cacheKey);
  if (cached) {
    console.log(`✅ Cache hit: ${cacheKey}`);
    return cached;
  }
  if (!process.env.API_KEY) return [];

  const dedupKey = `exciting_players_${dateStr}`;
  return dedupedApiCall(dedupKey, async () => {
    try {
      console.log(`🚀 Fetching exciting players for TODAY: ${dateStr}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `CRITICAL: Use Google Search to find the MOST IN-FORM football players for January 2026.

SEARCH STRATEGY:
- Search: "best football players January 2026 in form top scorers"
- Search: "player of the week month ${dateStr} Premier League La Liga Bundesliga"
- Use: whoscored.com, transfermarkt.com, espn.com/soccer, goal.com
- Focus on 2025-26 season stats

REQUIRED: Find EXACTLY 6 REAL players currently in exceptional form:
1. Must be actively playing in January 2026
2. Mix of positions: forwards, midfielders, defenders
3. From major European leagues
4. Based on ACTUAL recent performances (December 2025 - January 2026)

For EACH player provide VERIFIED data:
1. Full real name (verify spelling)
2. Current club (confirm active roster January 2026)
3. Position and jersey number (verify from official club site)
4. 2025-26 season stats:
   - Goals scored (exact number from transfermarkt/whoscored)
   - Assists (exact number)
   - Appearances (matches played)
5. Recent form analysis:
   - Performance in last 5 matches
   - Any goals/assists in those matches
   - Overall form rating
6. Playing style and excitement factor (based on actual characteristics)
7. Next real fixture details
8. Excitement rating 7-10 (these should all be top performers)

VERIFICATION: Cross-check all stats from at least 2 sources (transfermarkt + whoscored/espn).`,
        config: {
          tools: [{googleSearch: {}}],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Player full name" },
                team: { type: Type.STRING, description: "Current club" },
                position: { type: Type.STRING, description: "Playing position" },
                number: { type: Type.NUMBER, description: "Jersey number" },
                league: { type: Type.STRING, description: "League they play in" },
                goals: { type: Type.NUMBER, description: "Goals this season" },
                assists: { type: Type.NUMBER, description: "Assists this season" },
                appearances: { type: Type.NUMBER, description: "Appearances this season" },
                recentForm: { type: Type.STRING, description: "Brief recent form description" },
                excitementFactor: { type: Type.STRING, description: "Why exciting to watch" },
                nextMatch: { type: Type.STRING, description: "Next match details" },
                rating: { type: Type.NUMBER, description: "Excitement rating 0-10" }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text || "[]");
      const players = data.map((item: any, idx: number) => {
        const playerId = `player_${item.name.replace(/\s/g, '').toLowerCase()}`;
        return {
          id: playerId,
          name: item.name,
          type: 'PLAYER' as EntityType,
          image: getGenericImage(playerId),
          subtitle: `${item.position} • ${item.team}`,
          rating: item.rating || 7.5,
          league: normalizeLeague(item.league),
          description: item.excitementFactor, // Use excitement factor as description
          stats: {
            goals: item.goals || 0,
            assists: item.assists || 0,
            appearances: item.appearances || 0,
            number: item.number
          },
          recentForm: item.recentForm,
          excitementFactor: item.excitementFactor,
          nextMatch: item.nextMatch
        };
      });

      // Cache for 24 hours (expires at day change)
      setCachedData(cacheKey, players, 86400);
      console.log(`✅ Fetched ${players.length} exciting players`);

      return players;
    } catch (error) {
      console.error('❌ Exciting players error:', error);
      return [];
    }
  });
};
