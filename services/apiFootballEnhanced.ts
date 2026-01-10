/**
 * Enhanced API-Football Service
 * Primary data source for all features
 * Gemini AI used only as fallback
 */

import { Match, League, MatchStatus, Entity, Player } from '../types';
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
 * Get exciting matches from API-Football
 * Sorted by watchability score
 */
export const getExcitingMatchesFromAPI = async (): Promise<Match[]> => {
  const cacheKey = 'api_exciting_matches';
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      if (age < 180000) { // 3 minutes cache
        console.log('✅ Using cached exciting matches');
        return data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  try {
    // Get today's fixtures
    const allMatches = await fetchTodaysFixtures();

    // Calculate watchability and sort
    const matchesWithScores = allMatches.map(match => {
      const homeScore = parseInt(match.score.split('-')[0]) || 0;
      const awayScore = parseInt(match.score.split('-')[1]) || 0;
      const leagueIdMap: Record<string, number> = {
        // Leagues
        'Premier League': 39, 'La Liga': 140, 'Bundesliga': 78,
        'Serie A': 135, 'Ligue 1': 61, 'MLS': 253,
        // European
        'Champions League': 2, 'Europa League': 3, 'Conference League': 848,
        // England Cups
        'FA Cup': 48, 'Community Shield': 45, 'EFL Cup': 46,
        // Spain Cups
        'Copa del Rey': 143, 'Supercopa de España': 556,
        // Germany Cups
        'DFB-Pokal': 81,
        // Italy Cups
        'Coppa Italia': 137, 'Supercoppa Italiana': 547,
        // France Cups
        'Coupe de France': 66, 'Coupe de la Ligue': 65
      };

      const watchability = calculateWatchability({
        goalsHome: homeScore,
        goalsAway: awayScore,
        status: match.status,
        leagueId: leagueIdMap[match.league] || 0,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam
      });

      return {
        ...match,
        watchability
      };
    });

    // Sort by watchability and take top matches
    const excitingMatches = matchesWithScores
      .sort((a, b) => b.watchability - a.watchability)
      .slice(0, 8);

    // Cache the results
    localStorage.setItem(cacheKey, JSON.stringify({
      data: excitingMatches,
      timestamp: Date.now()
    }));

    console.log(`✅ Found ${excitingMatches.length} exciting matches from API`);
    return excitingMatches;
  } catch (error) {
    console.error('❌ Failed to get exciting matches from API:', error);
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
      if (age < 3600000) { // 1 hour cache
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
