/**
 * Enhanced API-Football Service
 * Primary data source for all features
 * Gemini AI used only as fallback
 */

import { Match, League, MatchStatus, Entity } from '../types';
import { fetchTodaysFixtures, fetchLiveFixtures } from './apiFootballService';
import { getGenericImage } from '../constants';

const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY || '';

/**
 * Calculate watchability score based on match data
 * Works for live, finished, AND upcoming matches
 */
const calculateWatchability = (match: {
  goalsHome: number;
  goalsAway: number;
  status: string;
  leagueId: number;
  homeTeam: string;
  awayTeam: string;
}): number => {
  let score = 5.0; // Base score

  // FOR FINISHED/LIVE MATCHES: Score based on goals
  if (match.status === 'FT' || match.status === 'LIVE' || match.status === 'HT') {
    // High-scoring matches are more exciting
    const totalGoals = match.goalsHome + match.goalsAway;
    score += Math.min(totalGoals * 0.5, 3.0);

    // Close matches are more exciting
    const goalDiff = Math.abs(match.goalsHome - match.goalsAway);
    if (goalDiff === 0) score += 1.0;
    else if (goalDiff === 1) score += 0.5;

    // Live matches get bonus
    if (match.status === 'LIVE' || match.status === 'HT') score += 1.0;
  }

  // FOR UPCOMING MATCHES: Score based on rivalry and team quality
  if (match.status === 'UPCOMING') {
    // Big team matchups (heuristic based on team names)
    const bigTeams = [
      'Manchester United', 'Manchester City', 'Liverpool', 'Arsenal', 'Chelsea', 'Tottenham',
      'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla',
      'Bayern Munich', 'Borussia Dortmund', 'RB Leipzig',
      'Juventus', 'Inter', 'Milan', 'Napoli', 'Roma',
      'PSG', 'Lyon', 'Marseille', 'Monaco'
    ];

    const homeIsBig = bigTeams.some(team => match.homeTeam.includes(team));
    const awayIsBig = bigTeams.some(team => match.awayTeam.includes(team));

    if (homeIsBig && awayIsBig) {
      score += 2.5; // Both teams are big - exciting match!
    } else if (homeIsBig || awayIsBig) {
      score += 1.0; // One big team
    }

    // Derby/rivalry bonus (same city or known rivals)
    if (
      (match.homeTeam.includes('Manchester') && match.awayTeam.includes('Manchester')) ||
      (match.homeTeam.includes('Madrid') && match.awayTeam.includes('Madrid')) ||
      (match.homeTeam.includes('Milan') && match.awayTeam.includes('Milan')) ||
      (match.homeTeam.includes('Liverpool') && match.awayTeam.includes('Everton')) ||
      (match.homeTeam.includes('Everton') && match.awayTeam.includes('Liverpool')) ||
      (match.homeTeam.includes('Arsenal') && match.awayTeam.includes('Tottenham')) ||
      (match.homeTeam.includes('Tottenham') && match.awayTeam.includes('Arsenal'))
    ) {
      score += 1.5; // Derby match!
    }
  }

  // Cup competitions get bonus (knockout excitement!)
  const cupCompetitions = [
    48, 45, 46,    // FA Cup, Community Shield, EFL Cup
    143, 556,      // Copa del Rey, Supercopa
    81,            // DFB-Pokal
    137, 547,      // Coppa Italia, Supercoppa
    66, 65         // Coupe de France, Coupe de la Ligue
  ];
  if (cupCompetitions.includes(match.leagueId)) {
    score += 1.0; // Cup match excitement bonus
  }

  // Top leagues get slight boost
  const topLeagues = [39, 140, 78, 135, 61, 2, 3]; // PL, La Liga, UCL, etc.
  if (topLeagues.includes(match.leagueId)) {
    score += 0.5;
  }

  // European knockout competitions get extra bonus
  const europeanKnockout = [2, 3, 848]; // UCL, UEL, UECL
  if (europeanKnockout.includes(match.leagueId)) {
    score += 0.5; // European nights are special!
  }

  return Math.min(Math.max(score, 0), 10);
};

/**
 * Get exciting matches from past week (finished matches only)
 * Optimized to use fewer API calls - fetches from top 3 leagues only
 * Falls back to today's matches if API fails
 */
export const getExcitingMatchesFromAPI = async (): Promise<Match[]> => {
  const cacheKey = 'api_exciting_matches_v2';
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      if (age < 1800000) { // 30 min cache for exciting matches
        console.log('✅ Using cached exciting matches (past week highlights)');
        return data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  // If no API key, use today's finished matches as fallback
  if (!API_KEY) {
    console.warn('⚠️ No API key for weekly highlights, using today\'s matches');
    return getExcitingMatchesFromTodaysFixtures();
  }

  try {
    // Only fetch from top 3 leagues to minimize API calls (Premier League, La Liga, Champions League)
    const priorityLeagues = [39, 140, 2];
    const leagueNames: Record<number, string> = {
      39: 'Premier League',
      140: 'La Liga',
      2: 'Champions League'
    };

    const allMatches: Match[] = [];
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3); // Reduced to 3 days for fresher content

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Fetch finished matches from priority leagues in parallel (3 concurrent API calls)
    const leagueResults = await Promise.allSettled(
      priorityLeagues.map(async (leagueId) => {
        const response = await fetch(
          `${API_BASE_URL}/fixtures?league=${leagueId}&season=${today.getFullYear()}&from=${formatDate(threeDaysAgo)}&to=${formatDate(today)}&status=FT`,
          {
            headers: {
              'x-rapidapi-key': API_KEY,
              'x-rapidapi-host': 'v3.football.api-sports.io'
            }
          }
        );

        if (!response.ok) return [];

        const data = await response.json();
        const fixtures = data.response || [];
        const matches: Match[] = [];

        fixtures.forEach((fixture: any) => {
          const homeScore = fixture.goals.home ?? 0;
          const awayScore = fixture.goals.away ?? 0;
          const totalGoals = homeScore + awayScore;

          if (totalGoals >= 2) {
            const watchability = calculateWatchability({
              goalsHome: homeScore,
              goalsAway: awayScore,
              status: 'FT',
              leagueId: leagueId,
              homeTeam: fixture.teams.home.name,
              awayTeam: fixture.teams.away.name
            });

            matches.push({
              id: `apif_${fixture.fixture.id}`,
              name: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
              type: 'MATCH' as const,
              homeTeam: fixture.teams.home.name,
              awayTeam: fixture.teams.away.name,
              score: `${homeScore}-${awayScore}`,
              league: leagueNames[leagueId] || 'League',
              status: 'FT' as MatchStatus,
              minute: 'FT',
              watchability,
              image: getGenericImage(`apif_${fixture.fixture.id}`)
            });
          }
        });

        return matches;
      })
    );

    for (const result of leagueResults) {
      if (result.status === 'fulfilled') {
        allMatches.push(...result.value);
      }
    }

    // If no matches found, fall back to today's fixtures
    if (allMatches.length === 0) {
      console.log('⚠️ No weekly highlights from API, using today\'s matches');
      return getExcitingMatchesFromTodaysFixtures();
    }

    // Sort by watchability and take top 8 matches
    const excitingMatches = allMatches
      .sort((a, b) => (b.watchability || 0) - (a.watchability || 0))
      .slice(0, 8);

    // Cache the results
    localStorage.setItem(cacheKey, JSON.stringify({
      data: excitingMatches,
      timestamp: Date.now()
    }));

    console.log(`✅ Found ${excitingMatches.length} exciting matches from past week`);
    return excitingMatches;
  } catch (error) {
    console.error('❌ Failed to get exciting matches from API:', error);
    return getExcitingMatchesFromTodaysFixtures();
  }
};

/**
 * Fallback: Get exciting matches from today's fixtures
 */
const getExcitingMatchesFromTodaysFixtures = async (): Promise<Match[]> => {
  try {
    const todayMatches = await fetchTodaysFixtures();

    // Filter to finished matches with goals and calculate watchability
    const excitingMatches = todayMatches
      .filter(m => m.status === 'FT' && m.score && m.score !== 'vs')
      .map(match => {
        const scoreParts = (match.score || '0-0').replace(' ', '').split('-');
        const home = parseInt(scoreParts[0]) || 0;
        const away = parseInt(scoreParts[1]) || 0;
        const totalGoals = home + away;
        return {
          ...match,
          watchability: Math.min(5 + totalGoals * 0.7 + (Math.abs(home - away) <= 1 ? 1 : 0), 10)
        };
      })
      .filter(m => (m.watchability || 0) >= 6)
      .sort((a, b) => (b.watchability || 0) - (a.watchability || 0))
      .slice(0, 8);

    console.log(`✅ Using ${excitingMatches.length} exciting matches from today's fixtures`);
    return excitingMatches;
  } catch (error) {
    console.error('❌ Fallback to today\'s fixtures also failed:', error);
    return [];
  }
};

/**
 * Get highest scoring matches from API-Football
 */
export const getHighestScoringMatchesFromAPI = async (): Promise<Match[]> => {
  const cacheKey = 'api_highest_scoring_matches';
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      if (age < 180000) { // 3 minutes cache
        console.log('✅ Using cached highest scoring matches');
        return data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  try {
    // Get today's fixtures
    const allMatches = await fetchTodaysFixtures();

    // Filter to finished matches and calculate total goals
    const scoredMatches = allMatches
      .filter(match => match.status === 'FT' || match.status === 'LIVE')
      .map(match => {
        const homeScore = parseInt(match.score.split('-')[0]) || 0;
        const awayScore = parseInt(match.score.split('-')[1]) || 0;
        const totalGoals = homeScore + awayScore;

        return {
          ...match,
          totalGoals,
          watchability: Math.min(5 + totalGoals * 0.7, 10)
        };
      })
      .filter(match => match.totalGoals > 0); // Only matches with goals

    // Sort by total goals
    const highestScoring = scoredMatches
      .sort((a, b) => b.totalGoals - a.totalGoals)
      .slice(0, 8);

    // Cache the results
    localStorage.setItem(cacheKey, JSON.stringify({
      data: highestScoring,
      timestamp: Date.now()
    }));

    console.log(`✅ Found ${highestScoring.length} high-scoring matches from API`);
    return highestScoring;
  } catch (error) {
    console.error('❌ Failed to get highest scoring matches from API:', error);
    return [];
  }
};

/**
 * Get top players from API-Football
 * Uses player statistics endpoint
 */
export const getTopPlayersFromAPI = async (): Promise<Entity[]> => {
  const cacheKey = 'api_top_players';
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      if (age < 1800000) { // 30 min cache
        console.log('✅ Using cached top players');
        return data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  if (!API_KEY) {
    console.warn('⚠️ No API key for top players');
    return [];
  }

  try {
    // Fetch top scorers from Premier League (league 39)
    const season = new Date().getFullYear();
    const response = await fetch(
      `${API_BASE_URL}/players/topscorers?league=39&season=${season}`,
      {
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      }
    );

    if (!response.ok) {
      console.error('❌ Failed to fetch top players');
      return [];
    }

    const data = await response.json();
    const playersData = data.response || [];

    const players: Entity[] = playersData.slice(0, 8).map((p: any) => {
      const goals = p.statistics[0]?.goals?.total || 0;
      const assists = p.statistics[0]?.goals?.assists || 0;
      const rating = parseFloat(p.statistics[0]?.games?.rating || '7.0');

      return {
        id: `player_${p.player.id}`,
        name: p.player.name,
        type: 'PLAYER' as const,
        subtitle: `${p.statistics[0]?.team?.name} • ${goals} goals, ${assists} assists`,
        image: p.player.photo || getGenericImage(`player_${p.player.id}`),
        watchability: Math.min(5 + (goals * 0.3) + (assists * 0.2), 10),
        rating,
        stats: {
          goals,
          assists,
          appearances: p.statistics[0]?.games?.appearences || 0,
          position: p.statistics[0]?.games?.position || 'Forward'
        }
      };
    });

    // Cache the results
    localStorage.setItem(cacheKey, JSON.stringify({
      data: players,
      timestamp: Date.now()
    }));

    console.log(`✅ Found ${players.length} top players from API`);
    return players;
  } catch (error) {
    console.error('❌ Failed to get top players from API:', error);
    return [];
  }
};

/**
 * Search for matches and players from API-Football
 */
export const searchFromAPI = async (query: string): Promise<Entity[]> => {
  if (!query || query.length < 2) return [];

  try {
    const results: Entity[] = [];

    // Search in today's matches
    const todayMatches = await fetchTodaysFixtures();
    const matchResults = todayMatches.filter(match =>
      match.name.toLowerCase().includes(query.toLowerCase()) ||
      match.homeTeam.toLowerCase().includes(query.toLowerCase()) ||
      match.awayTeam.toLowerCase().includes(query.toLowerCase()) ||
      match.league.toLowerCase().includes(query.toLowerCase())
    );

    results.push(...matchResults);

    console.log(`✅ Found ${results.length} results from API for "${query}"`);
    return results.slice(0, 10); // Limit to 10 results
  } catch (error) {
    console.error('❌ Search failed:', error);
    return [];
  }
};
