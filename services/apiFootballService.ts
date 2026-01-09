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
    39: League.PREMIER_LEAGUE,    // Premier League
    140: League.LA_LIGA,          // La Liga
    78: League.BUNDESLIGA,        // Bundesliga
    135: League.SERIE_A,          // Serie A
    61: League.LIGUE_1,           // Ligue 1
    2: League.CHAMPIONS_LEAGUE,   // Champions League
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

  try {
    const today = new Date().toISOString().split('T')[0];

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

    // Filter to major leagues and convert
    const majorLeagueIds = [39, 140, 78, 135, 61, 2]; // PL, La Liga, Bundesliga, Serie A, Ligue 1, UCL

    const matches: Match[] = fixtures
      .filter(f => majorLeagueIds.includes(f.league.id))
      .slice(0, 20) // Get more matches
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

    console.log(`✅ API-Football: Fetched ${matches.length} fixtures`);
    return matches;
  } catch (error) {
    console.error('❌ API-Football error:', error);
    return [];
  }
};

/**
 * Fetch live fixtures (currently in progress)
 */
export const fetchLiveFixtures = async (): Promise<Match[]> => {
  if (!API_KEY) return [];

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

    // Filter to major leagues
    const majorLeagueIds = [39, 140, 78, 135, 61, 2];

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

    console.log(`✅ API-Football: Found ${liveMatches.length} live matches`);
    return liveMatches;
  } catch (error) {
    console.error('❌ API-Football live error:', error);
    return [];
  }
};

/**
 * Fetch detailed lineup for a specific match
 */
export const fetchMatchLineups = async (fixtureId: number): Promise<{ home: LineupPlayer[]; away: LineupPlayer[] } | null> => {
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

    return {
      home: convertLineup(homeLineup),
      away: convertLineup(awayLineup)
    };
  } catch (error) {
    console.error('❌ Lineup fetch error:', error);
    return null;
  }
};
