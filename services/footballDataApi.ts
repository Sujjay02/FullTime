/**
 * Football Data API Service
 * Free tier: 10 requests/minute, supports major European leagues
 * Documentation: https://www.football-data.org/documentation/quickstart
 */

import { Match, League, MatchStatus, LineupPlayer } from '../types';
import { getGenericImage } from '../constants';

const API_BASE_URL = 'https://api.football-data.org/v4';
const API_KEY = import.meta.env.VITE_FOOTBALL_DATA_API_KEY || '';

interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  minute?: number;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
  };
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  competition: {
    name: string;
    code: string;
  };
}

// Map API competition codes to our League enum
const mapCompetitionToLeague = (code: string): string => {
  const mapping: Record<string, string> = {
    'PL': League.PREMIER_LEAGUE,
    'PD': League.LA_LIGA,
    'BL1': League.BUNDESLIGA,
    'SA': League.SERIE_A,
    'FL1': League.LIGUE_1,
    'CL': League.CHAMPIONS_LEAGUE
  };
  return mapping[code] || code;
};

// Map API status to our MatchStatus
const mapStatus = (status: string, minute?: number): MatchStatus => {
  if (status === 'IN_PLAY') return 'LIVE';
  if (status === 'PAUSED') return 'HT';
  if (status === 'FINISHED') return 'FT';
  if (status === 'SCHEDULED' || status === 'TIMED') return 'UPCOMING';
  return 'UPCOMING';
};

/**
 * Fetch today's matches from football-data.org API
 */
export const fetchTodaysMatches = async (): Promise<Match[]> => {
  if (!API_KEY) {
    console.warn('⚠️ No Football Data API key found. Using fallback data.');
    return [];
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    const response = await fetch(`${API_BASE_URL}/matches?date=${today}`, {
      headers: {
        'X-Auth-Token': API_KEY
      }
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const matches: ApiMatch[] = data.matches || [];

    // Convert API matches to our Match format
    const convertedMatches: Match[] = matches
      .filter(m => {
        // Filter to only major leagues we support
        const league = mapCompetitionToLeague(m.competition.code);
        return Object.values(League).includes(league as League);
      })
      .slice(0, 8) // Limit to 8 matches to avoid overwhelming the UI
      .map((match) => {
        const homeScore = match.score.fullTime.home ?? match.score.halfTime.home ?? 0;
        const awayScore = match.score.fullTime.away ?? match.score.halfTime.away ?? 0;
        const status = mapStatus(match.status, match.minute);

        let minute = '';
        if (status === 'LIVE' && match.minute) {
          minute = `${match.minute}'`;
        } else if (status === 'HT') {
          minute = 'HT';
        } else if (status === 'FT') {
          minute = 'FT';
        } else if (status === 'UPCOMING') {
          const matchTime = new Date(match.utcDate);
          minute = matchTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }

        const matchId = `api_${match.id}`;

        return {
          id: matchId,
          name: `${match.homeTeam.shortName || match.homeTeam.name} vs ${match.awayTeam.shortName || match.awayTeam.name}`,
          type: 'MATCH' as const,
          homeTeam: match.homeTeam.shortName || match.homeTeam.name,
          awayTeam: match.awayTeam.shortName || match.awayTeam.name,
          score: status === 'UPCOMING' ? 'vs' : `${homeScore} - ${awayScore}`,
          minute,
          league: mapCompetitionToLeague(match.competition.code),
          status,
          subtitle: `${mapCompetitionToLeague(match.competition.code)} • ${minute}`,
          image: getGenericImage(matchId),
          watchability: 7.0, // Will be calculated by AI
          rating: 0,
          events: [],
          lineups: { home: [], away: [] },
          bench: { home: [], away: [] },
          formation: { home: '4-3-3', away: '4-3-3' }
        };
      });

    console.log(`✅ Fetched ${convertedMatches.length} matches from Football Data API`);
    return convertedMatches;
  } catch (error) {
    console.error('❌ Error fetching from Football Data API:', error);
    return [];
  }
};

/**
 * Fetch match details including lineups (requires additional API call)
 */
export const fetchMatchDetails = async (matchId: number): Promise<any> => {
  if (!API_KEY) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
      headers: {
        'X-Auth-Token': API_KEY
      }
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching match details:', error);
    return null;
  }
};

/**
 * Fetch standings for a specific league
 */
export const fetchLeagueStandings = async (leagueCode: string): Promise<any> => {
  if (!API_KEY) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/competitions/${leagueCode}/standings`, {
      headers: {
        'X-Auth-Token': API_KEY
      }
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching standings:', error);
    return null;
  }
};
