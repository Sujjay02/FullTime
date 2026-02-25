/**
 * API-Football Service (RapidAPI)
 * Better coverage and real-time data than football-data.org
 * Free tier: 100 requests/day
 * Documentation: https://www.api-football.com/documentation-v3
 */

import { Match, League, MatchStatus, LineupPlayer } from '../types';
import { getGenericImage } from '../constants';

const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY || '';

// Request deduplication - prevent multiple identical in-flight API calls
const pendingRequests = new Map<string, Promise<any>>();

const dedupedFetch = async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  if (pendingRequests.has(key)) {
    console.log(`♻️ Reusing pending API-Football request: ${key}`);
    return pendingRequests.get(key) as Promise<T>;
  }
  const promise = fetcher().finally(() => pendingRequests.delete(key));
  pendingRequests.set(key, promise);
  return promise;
};

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
}

interface ApiLineup {
  team: {
    id: number;
    name: string;
  };
  formation: string;
  startXI: Array<{
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
    };
  }>;
  substitutes: Array<{
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
    };
  }>;
}

interface ApiPlayerStats {
  player: {
    id: number;
    name: string;
  };
  statistics: Array<{
    games: {
      position: string;
      rating: string | null;
    };
    goals: {
      total: number | null;
    };
    assists: {
      total: number | null;
    };
  }>;
}

// Map API league IDs to our League enum
const mapLeagueIdToLeague = (leagueId: number, leagueName: string): string => {
  const mapping: Record<number, string> = {
    // Major Leagues
    39: League.PREMIER_LEAGUE,        // Premier League
    140: League.LA_LIGA,              // La Liga
    78: League.BUNDESLIGA,            // Bundesliga
    135: League.SERIE_A,              // Serie A
    61: League.LIGUE_1,               // Ligue 1
    253: League.MLS,                  // MLS

    // European Competitions
    2: League.CHAMPIONS_LEAGUE,       // Champions League
    3: League.EUROPA_LEAGUE,          // Europa League
    848: League.CONFERENCE_LEAGUE,    // Conference League

    // England Cups
    48: League.FA_CUP,                // FA Cup
    45: League.COMMUNITY_SHIELD,      // Community Shield
    46: League.EFL_CUP,               // EFL Cup (Carabao Cup)

    // Spain Cups
    143: League.COPA_DEL_REY,         // Copa del Rey
    556: League.SUPERCOPA_ESPANA,     // Supercopa de España

    // Germany Cups
    81: League.DFB_POKAL,             // DFB-Pokal

    // Italy Cups
    137: League.COPPA_ITALIA,         // Coppa Italia
    547: League.SUPERCOPPA_ITALIANA,  // Supercoppa Italiana

    // France Cups
    66: League.COUPE_DE_FRANCE,       // Coupe de France
    65: League.COUPE_DE_LA_LIGUE,     // Coupe de la Ligue
  };
  return mapping[leagueId] || leagueName;
};

// Map API status to our MatchStatus
const mapFixtureStatus = (status: string, elapsed: number | null): MatchStatus => {
  const statusMap: Record<string, MatchStatus> = {
    '1H': 'LIVE',
    '2H': 'LIVE',
    'HT': 'HT',
    'FT': 'FT',
    'AET': 'FT',
    'PEN': 'FT',
    'LIVE': 'LIVE',
    'NS': 'UPCOMING',
    'TBD': 'UPCOMING',
    'CANC': 'UPCOMING',
    'PST': 'UPCOMING',
  };
  return statusMap[status] || 'UPCOMING';
};

/**
 * Fetch today's fixtures from API-Football
 */
export const fetchTodaysFixtures = async (): Promise<Match[]> => {
  if (!API_KEY) {
    console.warn('⚠️ No API-Football key found');
    return [];
  }

  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `apif_today_${today}`;

  return dedupedFetch(cacheKey, async () => {
  // Check cache first (cache for 2 minutes to save API calls)
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Cache valid for 2 minutes (120000ms)
      if (age < 120000) {
        console.log('✅ Using cached API-Football data');
        return data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/fixtures?date=${today}`, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    if (!response.ok) {
      console.error(`API-Football Error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const fixtures: ApiFixture[] = data.response || [];

    // Include major leagues AND cup competitions
    const includedLeagueIds = [
      // Major Leagues
      39, 140, 78, 135, 61, 253,
      // European Competitions
      2, 3, 848,
      // Cup Competitions
      48, 45, 46, 143, 556, 81, 137, 547, 66, 65
    ];

    const matches: Match[] = fixtures
      .filter(f => includedLeagueIds.includes(f.league.id))
      .slice(0, 30) // Get more matches to include cups
      .map((fixture) => {
        const homeScore = fixture.goals.home ?? 0;
        const awayScore = fixture.goals.away ?? 0;
        const status = mapFixtureStatus(fixture.fixture.status.short, fixture.fixture.status.elapsed);

        let minute = '';
        if (status === 'LIVE' && fixture.fixture.status.elapsed) {
          minute = `${fixture.fixture.status.elapsed}'`;
        } else if (status === 'HT') {
          minute = 'HT';
        } else if (status === 'FT') {
          minute = 'FT';
        } else if (status === 'UPCOMING') {
          const matchTime = new Date(fixture.fixture.date);
          minute = matchTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }

        const matchId = `apif_${fixture.fixture.id}`;

        return {
          id: matchId,
          name: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
          type: 'MATCH' as const,
          homeTeam: fixture.teams.home.name,
          awayTeam: fixture.teams.away.name,
          score: status === 'UPCOMING' ? 'vs' : `${homeScore} - ${awayScore}`,
          minute,
          league: mapLeagueIdToLeague(fixture.league.id, fixture.league.name),
          status,
          subtitle: `${mapLeagueIdToLeague(fixture.league.id, fixture.league.name)} • ${minute}`,
          image: getGenericImage(matchId),
          watchability: 7.0,
          rating: 0,
          events: [],
          lineups: { home: [], away: [] },
          bench: { home: [], away: [] },
          formation: { home: '4-3-3', away: '4-3-3' }
        };
      });

    // Cache the results
    localStorage.setItem(cacheKey, JSON.stringify({
      data: matches,
      timestamp: Date.now()
    }));

    console.log(`✅ API-Football: Fetched ${matches.length} fixtures`);
    return matches;
  } catch (error) {
    console.error('❌ API-Football error:', error);
    return [];
  }
  }); // end dedupedFetch
};

/**
 * Fetch live fixtures (currently in progress)
 */
export const fetchLiveFixtures = async (): Promise<Match[]> => {
  if (!API_KEY) return [];

  // Cache live matches for 30 seconds (shorter cache for real-time updates)
  const cacheKey = 'apif_live_matches';
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Cache valid for 30 seconds only
      if (age < 30000) {
        return data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/fixtures?live=all`, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    if (!response.ok) return [];

    const data = await response.json();
    const fixtures: ApiFixture[] = data.response || [];

    // Filter to major leagues and cups
    const majorLeagueIds = [
      39, 140, 78, 135, 61, 253,  // Leagues
      2, 3, 848,                   // European
      48, 45, 46, 143, 556, 81, 137, 547, 66, 65  // Cups
    ];

    const liveMatches: Match[] = fixtures
      .filter(f => majorLeagueIds.includes(f.league.id))
      .map((fixture) => {
        const homeScore = fixture.goals.home ?? 0;
        const awayScore = fixture.goals.away ?? 0;
        const minute = fixture.fixture.status.elapsed ? `${fixture.fixture.status.elapsed}'` : 'LIVE';

        return {
          id: `apif_${fixture.fixture.id}`,
          name: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
          type: 'MATCH' as const,
          homeTeam: fixture.teams.home.name,
          awayTeam: fixture.teams.away.name,
          score: `${homeScore} - ${awayScore}`,
          minute,
          league: mapLeagueIdToLeague(fixture.league.id, fixture.league.name),
          status: fixture.fixture.status.short === 'HT' ? 'HT' : 'LIVE',
          subtitle: `${mapLeagueIdToLeague(fixture.league.id, fixture.league.name)} • ${minute}`,
          image: getGenericImage(`apif_${fixture.fixture.id}`),
          watchability: 8.0,
          rating: 0,
          events: [],
          lineups: { home: [], away: [] },
          bench: { home: [], away: [] },
          formation: { home: '4-3-3', away: '4-3-3' }
        };
      });

    // Cache the live matches
    localStorage.setItem(cacheKey, JSON.stringify({
      data: liveMatches,
      timestamp: Date.now()
    }));

    console.log(`✅ API-Football: Found ${liveMatches.length} live matches`);
    return liveMatches;
  } catch (error) {
    console.error('❌ API-Football live error:', error);
    return [];
  }
};

/**
 * Fetch upcoming fixtures (next 3 days)
 */
export const fetchUpcomingFixtures = async (): Promise<Match[]> => {
  if (!API_KEY) {
    console.warn('⚠️ No API-Football key found');
    return [];
  }

  // Check cache first (cache for 10 minutes for upcoming matches)
  const cacheKey = 'apif_upcoming';
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Cache valid for 10 minutes (600000ms)
      if (age < 600000) {
        console.log('✅ Using cached upcoming fixtures');
        return data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  try {
    // Get fixtures for next 3 days
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    // Fetch fixtures for next 3 days
    const dates = [formatDate(tomorrow), formatDate(dayAfter), formatDate(threeDaysLater)];
    const allMatches: Match[] = [];

    // Major leagues and cups
    const includedLeagueIds = [
      39, 140, 78, 135, 61, 253,  // Leagues
      2, 3, 848,                   // European
      48, 45, 46, 143, 556, 81, 137, 547, 66, 65  // Cups
    ];

    // Fetch all 3 days in parallel instead of sequentially
    const fetchDay = async (date: string): Promise<Match[]> => {
      try {
        const response = await fetch(`${API_BASE_URL}/fixtures?date=${date}`, {
          headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': 'v3.football.api-sports.io'
          }
        });

        if (!response.ok) return [];

        const data = await response.json();
        const fixtures: ApiFixture[] = data.response || [];

        return fixtures
          .filter(f => includedLeagueIds.includes(f.league.id))
          .filter(f => f.fixture.status.short === 'NS' || f.fixture.status.short === 'TBD')
          .map((fixture) => {
            const matchTime = new Date(fixture.fixture.date);
            const timeStr = matchTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const dateStr = matchTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            const matchId = `apif_${fixture.fixture.id}`;

            let watchability = 6.0;
            const bigTeams = [
              'Manchester United', 'Manchester City', 'Liverpool', 'Arsenal', 'Chelsea', 'Tottenham',
              'Real Madrid', 'Barcelona', 'Atletico Madrid',
              'Bayern Munich', 'Borussia Dortmund',
              'Juventus', 'Inter', 'AC Milan', 'Napoli',
              'PSG', 'Marseille'
            ];
            const homeIsBig = bigTeams.some(t => fixture.teams.home.name.includes(t));
            const awayIsBig = bigTeams.some(t => fixture.teams.away.name.includes(t));
            if (homeIsBig && awayIsBig) watchability = 9.0;
            else if (homeIsBig || awayIsBig) watchability = 7.5;

            return {
              id: matchId,
              name: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
              type: 'MATCH' as const,
              homeTeam: fixture.teams.home.name,
              awayTeam: fixture.teams.away.name,
              score: 'vs',
              minute: `${dateStr} • ${timeStr}`,
              league: mapLeagueIdToLeague(fixture.league.id, fixture.league.name),
              status: 'UPCOMING' as MatchStatus,
              subtitle: `${mapLeagueIdToLeague(fixture.league.id, fixture.league.name)} • ${dateStr}`,
              image: getGenericImage(matchId),
              watchability,
              rating: 0,
              events: [],
              lineups: { home: [], away: [] },
              bench: { home: [], away: [] },
              formation: { home: '4-3-3', away: '4-3-3' }
            };
          });
      } catch (err) {
        console.error(`Failed to fetch fixtures for ${date}:`, err);
        return [];
      }
    };

    const dayResults = await Promise.all(dates.map(fetchDay));
    for (const matches of dayResults) {
      allMatches.push(...matches);
    }

    // Sort by watchability and take top 12
    const sortedMatches = allMatches
      .sort((a, b) => (b.watchability || 0) - (a.watchability || 0))
      .slice(0, 12);

    // Cache the results
    localStorage.setItem(cacheKey, JSON.stringify({
      data: sortedMatches,
      timestamp: Date.now()
    }));

    console.log(`✅ API-Football: Fetched ${sortedMatches.length} upcoming fixtures`);
    return sortedMatches;
  } catch (error) {
    console.error('❌ API-Football upcoming error:', error);
    return [];
  }
};

/**
 * Fetch detailed lineup for a specific match
 */
export const fetchMatchLineups = async (fixtureId: number): Promise<{
  home: LineupPlayer[];
  away: LineupPlayer[];
  bench?: { home: LineupPlayer[]; away: LineupPlayer[] };
  formation?: { home: string; away: string };
} | null> => {
  if (!API_KEY) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/fixtures/lineups?fixture=${fixtureId}`, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const lineups: ApiLineup[] = data.response || [];

    if (lineups.length < 2) return null;

    const homeLineup = lineups[0];
    const awayLineup = lineups[1];

    const convertLineup = (lineup: ApiLineup): LineupPlayer[] => {
      return lineup.startXI.map(p => ({
        name: p.player.name,
        number: p.player.number,
        position: p.player.pos,
        goals: 0,
        assists: 0,
        watchability: 7.0
      }));
    };

    const convertBench = (lineup: ApiLineup): LineupPlayer[] => {
      return lineup.substitutes.map(p => ({
        name: p.player.name,
        number: p.player.number,
        position: p.player.pos,
        goals: 0,
        assists: 0,
        watchability: 6.0
      }));
    };

    return {
      home: convertLineup(homeLineup),
      away: convertLineup(awayLineup),
      bench: {
        home: convertBench(homeLineup),
        away: convertBench(awayLineup)
      },
      formation: {
        home: homeLineup.formation || '4-3-3',
        away: awayLineup.formation || '4-3-3'
      }
    };
  } catch (error) {
    console.error('❌ Lineup fetch error:', error);
    return null;
  }
};
