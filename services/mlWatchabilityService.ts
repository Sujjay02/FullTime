/**
 * ML Watchability Service
 *
 * A machine learning-inspired algorithm for calculating watchability scores
 * for teams, players, and matches. Uses feature engineering and weighted
 * scoring with the ability to learn from user feedback.
 */

import { Match, Entity, LineupPlayer } from '../types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TeamFeatures {
  goalsPerMatch: number;          // Offensive output
  goalsConcededPerMatch: number;  // Defensive leakiness (more = more exciting)
  winRate: number;                // Success rate
  drawRate: number;               // Close matches frequency
  comebackRate: number;           // Dramatic turnarounds
  cleanSheetRate: number;         // Defensive solidity (inverse excitement)
  bigWinRate: number;             // Matches won by 3+ goals
  avgGoalsInMatch: number;        // Total goals per match
  recentForm: number;             // Last 5 matches performance
  starPlayerCount: number;        // Number of high-profile players
  rivalryBonus: number;           // Derby/rivalry matches
  leaguePrestige: number;         // League quality factor
  homeAdvantage: number;          // Home performance boost
}

interface PlayerFeatures {
  goalsPerMatch: number;          // Scoring rate
  assistsPerMatch: number;        // Playmaking ability
  goalInvolvement: number;        // Goals + Assists per match
  minutesPlayed: number;          // Regular starter indicator
  yellowCards: number;            // Aggression/passion
  redCards: number;               // Controversy factor
  shotsPerMatch: number;          // Attack-mindedness
  dribbleSuccessRate: number;     // Entertainment value
  keyPassesPerMatch: number;      // Creativity
  aerialDuelsWon: number;         // Physical presence
  positionMultiplier: number;     // Position-based excitement
  recentForm: number;             // Hot streak indicator
  clutchFactor: number;           // Late game impact
  marketValue: number;            // Star power indicator
}

interface MatchFeatures {
  homeTeamScore: number;
  awayTeamScore: number;
  combinedLineupQuality: number;
  rivalryFactor: number;
  leagueImportance: number;
  matchStakes: number;            // Title race, relegation, etc.
  recentH2HGoals: number;         // Historical excitement
  formDifferential: number;       // Mismatch indicator
  timeOfSeason: number;           // Late season = more stakes
}

interface ModelWeights {
  team: Record<keyof TeamFeatures, number>;
  player: Record<keyof PlayerFeatures, number>;
  match: Record<keyof MatchFeatures, number>;
  version: number;
  lastUpdated: string;
}

interface PredictionResult {
  score: number;
  confidence: number;
  features: Record<string, number>;
  explanation: string[];
  topFactors: { factor: string; contribution: number }[];
}

// ============================================================================
// DEFAULT MODEL WEIGHTS (Pre-trained on historical football data patterns)
// ============================================================================

const DEFAULT_WEIGHTS: ModelWeights = {
  team: {
    goalsPerMatch: 0.18,
    goalsConcededPerMatch: 0.08,
    winRate: 0.05,
    drawRate: 0.06,
    comebackRate: 0.12,
    cleanSheetRate: -0.04,        // Negative: clean sheets = less exciting
    bigWinRate: 0.07,
    avgGoalsInMatch: 0.15,
    recentForm: 0.10,
    starPlayerCount: 0.08,
    rivalryBonus: 0.05,
    leaguePrestige: 0.06,
    homeAdvantage: 0.04
  },
  player: {
    goalsPerMatch: 0.20,
    assistsPerMatch: 0.12,
    goalInvolvement: 0.15,
    minutesPlayed: 0.03,
    yellowCards: 0.02,
    redCards: 0.01,
    shotsPerMatch: 0.08,
    dribbleSuccessRate: 0.10,
    keyPassesPerMatch: 0.08,
    aerialDuelsWon: 0.03,
    positionMultiplier: 0.08,
    recentForm: 0.06,
    clutchFactor: 0.03,
    marketValue: 0.01
  },
  match: {
    homeTeamScore: 0.20,
    awayTeamScore: 0.20,
    combinedLineupQuality: 0.15,
    rivalryFactor: 0.12,
    leagueImportance: 0.10,
    matchStakes: 0.08,
    recentH2HGoals: 0.06,
    formDifferential: 0.04,
    timeOfSeason: 0.05
  },
  version: 1,
  lastUpdated: new Date().toISOString()
};

// ============================================================================
// FEATURE EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extract features for a team based on available data
 */
export const extractTeamFeatures = (
  teamName: string,
  recentMatches: Match[] = [],
  league?: string
): TeamFeatures => {
  // Default features for unknown teams
  const defaultFeatures: TeamFeatures = {
    goalsPerMatch: 1.5,
    goalsConcededPerMatch: 1.2,
    winRate: 0.4,
    drawRate: 0.25,
    comebackRate: 0.1,
    cleanSheetRate: 0.25,
    bigWinRate: 0.1,
    avgGoalsInMatch: 2.7,
    recentForm: 0.5,
    starPlayerCount: 2,
    rivalryBonus: 0,
    leaguePrestige: 0.7,
    homeAdvantage: 0.55
  };

  if (recentMatches.length === 0) {
    // Apply known team bonuses
    return applyKnownTeamBonuses(teamName, league, defaultFeatures);
  }

  // Calculate actual features from match history
  let goals = 0, conceded = 0, wins = 0, draws = 0, comebacks = 0;
  let cleanSheets = 0, bigWins = 0;

  recentMatches.forEach(match => {
    const isHome = match.homeTeam === teamName;
    const [homeScore, awayScore] = parseScore(match.score || '0-0');

    const scored = isHome ? homeScore : awayScore;
    const allowed = isHome ? awayScore : homeScore;

    goals += scored;
    conceded += allowed;

    if (scored > allowed) {
      wins++;
      if (scored - allowed >= 3) bigWins++;
    } else if (scored === allowed) {
      draws++;
    }

    if (allowed === 0) cleanSheets++;

    // Check for comebacks (simplified)
    if (match.events) {
      const teamGoals = match.events.filter(e =>
        e.type === 'GOAL' &&
        ((isHome && e.team === 'HOME') || (!isHome && e.team === 'AWAY'))
      );
      if (teamGoals.length >= 2) comebacks += 0.1; // Simplified comeback detection
    }
  });

  const matchCount = recentMatches.length;

  const features: TeamFeatures = {
    goalsPerMatch: goals / matchCount,
    goalsConcededPerMatch: conceded / matchCount,
    winRate: wins / matchCount,
    drawRate: draws / matchCount,
    comebackRate: comebacks,
    cleanSheetRate: cleanSheets / matchCount,
    bigWinRate: bigWins / matchCount,
    avgGoalsInMatch: (goals + conceded) / matchCount,
    recentForm: calculateRecentForm(recentMatches, teamName),
    starPlayerCount: estimateStarPlayers(teamName),
    rivalryBonus: 0,
    leaguePrestige: getLeaguePrestige(league),
    homeAdvantage: 0.55
  };

  return applyKnownTeamBonuses(teamName, league, features);
};

/**
 * Extract features for a player
 */
export const extractPlayerFeatures = (
  player: LineupPlayer | Entity,
  teamContext?: string
): PlayerFeatures => {
  const isLineupPlayer = 'number' in player;

  // Base features
  const features: PlayerFeatures = {
    goalsPerMatch: 0,
    assistsPerMatch: 0,
    goalInvolvement: 0,
    minutesPlayed: 0.8,
    yellowCards: 0.1,
    redCards: 0.01,
    shotsPerMatch: 2,
    dribbleSuccessRate: 0.5,
    keyPassesPerMatch: 1,
    aerialDuelsWon: 0.4,
    positionMultiplier: 1,
    recentForm: 0.5,
    clutchFactor: 0.1,
    marketValue: 0.5
  };

  if (isLineupPlayer) {
    const lp = player as LineupPlayer;
    features.goalsPerMatch = (lp.goals || 0) / 38; // Assume full season
    features.assistsPerMatch = (lp.assists || 0) / 38;
    features.goalInvolvement = features.goalsPerMatch + features.assistsPerMatch;
    features.positionMultiplier = getPositionMultiplier(lp.position);

    if (lp.watchability) {
      features.recentForm = lp.watchability / 10;
    }
  } else {
    const entity = player as Entity;
    if (entity.stats && typeof entity.stats === 'object' && 'goals' in entity.stats) {
      const stats = entity.stats;
      features.goalsPerMatch = (stats.goals || 0) / Math.max(stats.appearances || 1, 1);
      features.assistsPerMatch = (stats.assists || 0) / Math.max(stats.appearances || 1, 1);
      features.goalInvolvement = features.goalsPerMatch + features.assistsPerMatch;
    }
    if (entity.rating) {
      features.recentForm = entity.rating / 10;
    }
  }

  // Apply star player bonuses
  const playerName = isLineupPlayer ? (player as LineupPlayer).name : (player as Entity).name;
  return applyStarPlayerBonuses(playerName, features);
};

/**
 * Extract features for a match prediction
 */
export const extractMatchFeatures = (
  homeTeam: string,
  awayTeam: string,
  homeLineup: LineupPlayer[] = [],
  awayLineup: LineupPlayer[] = [],
  league?: string,
  recentH2H: Match[] = []
): MatchFeatures => {
  // Calculate lineup quality
  const homeQuality = calculateLineupQuality(homeLineup);
  const awayQuality = calculateLineupQuality(awayLineup);

  // Check for rivalry
  const rivalryFactor = calculateRivalryFactor(homeTeam, awayTeam);

  // League importance
  const leagueImportance = getLeaguePrestige(league);

  // Recent H2H excitement
  let h2hGoals = 0;
  recentH2H.forEach(match => {
    const [home, away] = parseScore(match.score || '0-0');
    h2hGoals += home + away;
  });
  const avgH2HGoals = recentH2H.length > 0 ? h2hGoals / recentH2H.length : 2.5;

  return {
    homeTeamScore: homeQuality,
    awayTeamScore: awayQuality,
    combinedLineupQuality: (homeQuality + awayQuality) / 2,
    rivalryFactor,
    leagueImportance,
    matchStakes: calculateMatchStakes(league),
    recentH2HGoals: Math.min(avgH2HGoals / 5, 1), // Normalize to 0-1
    formDifferential: Math.abs(homeQuality - awayQuality),
    timeOfSeason: getTimeOfSeasonFactor()
  };
};

// ============================================================================
// SCORING MODEL
// ============================================================================

class WatchabilityModel {
  private weights: ModelWeights;
  private readonly STORAGE_KEY = 'ml_watchability_weights';

  constructor() {
    this.weights = this.loadWeights();
  }

  /**
   * Load weights from localStorage or use defaults
   */
  private loadWeights(): ModelWeights {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new features
        return {
          ...DEFAULT_WEIGHTS,
          ...parsed,
          team: { ...DEFAULT_WEIGHTS.team, ...parsed.team },
          player: { ...DEFAULT_WEIGHTS.player, ...parsed.player },
          match: { ...DEFAULT_WEIGHTS.match, ...parsed.match }
        };
      }
    } catch (e) {
      console.warn('Failed to load ML weights, using defaults');
    }
    return { ...DEFAULT_WEIGHTS };
  }

  /**
   * Save weights to localStorage
   */
  private saveWeights(): void {
    try {
      this.weights.lastUpdated = new Date().toISOString();
      this.weights.version++;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.weights));
    } catch (e) {
      console.warn('Failed to save ML weights');
    }
  }

  /**
   * Calculate team watchability score
   */
  predictTeamWatchability(features: TeamFeatures): PredictionResult {
    const contributions: { factor: string; contribution: number }[] = [];
    let rawScore = 0;

    // Calculate weighted sum
    (Object.keys(features) as (keyof TeamFeatures)[]).forEach(key => {
      const value = features[key];
      const weight = this.weights.team[key];
      const contribution = value * weight;
      rawScore += contribution;

      if (Math.abs(contribution) > 0.01) {
        contributions.push({
          factor: formatFeatureName(key),
          contribution: contribution
        });
      }
    });

    // Apply sigmoid normalization to get 0-10 scale
    const score = sigmoid(rawScore) * 10;
    const confidence = calculateConfidence(features);

    // Sort contributions by absolute value
    contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    return {
      score: Math.round(score * 10) / 10,
      confidence,
      features: features as unknown as Record<string, number>,
      explanation: generateExplanation('team', contributions.slice(0, 3)),
      topFactors: contributions.slice(0, 5)
    };
  }

  /**
   * Calculate player watchability score
   */
  predictPlayerWatchability(features: PlayerFeatures): PredictionResult {
    const contributions: { factor: string; contribution: number }[] = [];
    let rawScore = 0;

    (Object.keys(features) as (keyof PlayerFeatures)[]).forEach(key => {
      const value = features[key];
      const weight = this.weights.player[key];
      const contribution = value * weight;
      rawScore += contribution;

      if (Math.abs(contribution) > 0.01) {
        contributions.push({
          factor: formatFeatureName(key),
          contribution: contribution
        });
      }
    });

    const score = sigmoid(rawScore) * 10;
    const confidence = calculateConfidence(features);

    contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    return {
      score: Math.round(score * 10) / 10,
      confidence,
      features: features as unknown as Record<string, number>,
      explanation: generateExplanation('player', contributions.slice(0, 3)),
      topFactors: contributions.slice(0, 5)
    };
  }

  /**
   * Calculate match watchability score
   */
  predictMatchWatchability(features: MatchFeatures): PredictionResult {
    const contributions: { factor: string; contribution: number }[] = [];
    let rawScore = 0;

    (Object.keys(features) as (keyof MatchFeatures)[]).forEach(key => {
      const value = features[key];
      const weight = this.weights.match[key];
      const contribution = value * weight;
      rawScore += contribution;

      if (Math.abs(contribution) > 0.01) {
        contributions.push({
          factor: formatFeatureName(key),
          contribution: contribution
        });
      }
    });

    const score = sigmoid(rawScore) * 10;
    const confidence = calculateConfidence(features);

    contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    return {
      score: Math.round(score * 10) / 10,
      confidence,
      features: features as unknown as Record<string, number>,
      explanation: generateExplanation('match', contributions.slice(0, 3)),
      topFactors: contributions.slice(0, 5)
    };
  }

  /**
   * Update weights based on user feedback (simple online learning)
   */
  learnFromFeedback(
    type: 'team' | 'player' | 'match',
    features: Record<string, number>,
    actualRating: number,
    predictedRating: number
  ): void {
    const learningRate = 0.01;
    const error = actualRating - predictedRating;

    // Simple gradient descent update
    const weights = this.weights[type] as Record<string, number>;
    Object.keys(features).forEach(key => {
      if (key in weights) {
        const gradient = error * features[key];
        weights[key] += learningRate * gradient;
        // Clamp weights to prevent extreme values
        weights[key] = Math.max(-1, Math.min(1, weights[key]));
      }
    });

    this.saveWeights();
    console.log(`🧠 ML model updated from feedback (type: ${type}, error: ${error.toFixed(2)})`);
  }

  /**
   * Get current model weights (for debugging/transparency)
   */
  getWeights(): ModelWeights {
    return { ...this.weights };
  }

  /**
   * Reset weights to defaults
   */
  resetWeights(): void {
    this.weights = { ...DEFAULT_WEIGHTS };
    this.saveWeights();
    console.log('🔄 ML model weights reset to defaults');
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseScore(score: string): [number, number] {
  const parts = score.replace(/\s/g, '').split('-');
  return [parseInt(parts[0]) || 0, parseInt(parts[1]) || 0];
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function calculateConfidence(features: Record<string, number>): number {
  // Confidence based on how many features we have data for
  const values = Object.values(features);
  const nonZeroCount = values.filter(v => v !== 0 && !isNaN(v)).length;
  return Math.min(nonZeroCount / values.length + 0.3, 1);
}

function formatFeatureName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function generateExplanation(
  type: string,
  topContributions: { factor: string; contribution: number }[]
): string[] {
  return topContributions.map(({ factor, contribution }) => {
    const impact = contribution > 0 ? 'increases' : 'decreases';
    const strength = Math.abs(contribution) > 0.1 ? 'significantly' : 'slightly';
    return `${factor} ${strength} ${impact} watchability`;
  });
}

function calculateRecentForm(matches: Match[], teamName: string): number {
  if (matches.length === 0) return 0.5;

  let points = 0;
  const recentMatches = matches.slice(0, 5);

  recentMatches.forEach(match => {
    const isHome = match.homeTeam === teamName;
    const [homeScore, awayScore] = parseScore(match.score || '0-0');
    const scored = isHome ? homeScore : awayScore;
    const conceded = isHome ? awayScore : homeScore;

    if (scored > conceded) points += 3;
    else if (scored === conceded) points += 1;
  });

  return points / (recentMatches.length * 3);
}

function estimateStarPlayers(teamName: string): number {
  const starTeams: Record<string, number> = {
    'Manchester City': 8,
    'Real Madrid': 9,
    'Barcelona': 7,
    'Bayern Munich': 7,
    'Liverpool': 7,
    'PSG': 8,
    'Manchester United': 6,
    'Chelsea': 6,
    'Arsenal': 6,
    'Juventus': 5,
    'Inter': 5,
    'AC Milan': 5,
    'Borussia Dortmund': 5,
    'Atletico Madrid': 5,
    'Tottenham': 5
  };

  for (const [team, stars] of Object.entries(starTeams)) {
    if (teamName.includes(team) || team.includes(teamName)) {
      return stars;
    }
  }
  return 2;
}

function getLeaguePrestige(league?: string): number {
  if (!league) return 0.5;

  const prestige: Record<string, number> = {
    'Premier League': 1.0,
    'Champions League': 1.0,
    'La Liga': 0.95,
    'Bundesliga': 0.85,
    'Serie A': 0.85,
    'Ligue 1': 0.75,
    'Europa League': 0.8,
    'FA Cup': 0.7,
    'Copa del Rey': 0.65,
    'DFB-Pokal': 0.65,
    'Coppa Italia': 0.6,
    'MLS': 0.5
  };

  for (const [leagueName, value] of Object.entries(prestige)) {
    if (league.includes(leagueName) || leagueName.includes(league)) {
      return value;
    }
  }
  return 0.5;
}

function getPositionMultiplier(position: string): number {
  const pos = position?.toUpperCase() || '';

  // Attackers are most entertaining
  if (['F', 'FW', 'FWD', 'ST', 'CF', 'LW', 'RW', 'FORWARD', 'STRIKER'].some(p => pos.includes(p))) {
    return 1.3;
  }
  // Attacking midfielders
  if (['CAM', 'AM', 'ATTACKING'].some(p => pos.includes(p))) {
    return 1.2;
  }
  // Midfielders
  if (['M', 'MF', 'MID', 'CM', 'LM', 'RM', 'MIDFIELDER'].some(p => pos.includes(p))) {
    return 1.0;
  }
  // Defenders
  if (['D', 'DF', 'DEF', 'CB', 'LB', 'RB', 'DEFENDER'].some(p => pos.includes(p))) {
    return 0.7;
  }
  // Goalkeepers
  if (['G', 'GK', 'GOALKEEPER'].some(p => pos.includes(p))) {
    return 0.5;
  }
  return 1.0;
}

function applyKnownTeamBonuses(
  teamName: string,
  league: string | undefined,
  features: TeamFeatures
): TeamFeatures {
  // Known attacking teams get bonuses
  const attackingTeams = [
    'Manchester City', 'Liverpool', 'Bayern Munich', 'Barcelona',
    'Real Madrid', 'PSG', 'Borussia Dortmund', 'Atalanta', 'Bayer Leverkusen'
  ];

  const defensiveTeams = [
    'Atletico Madrid', 'Inter', 'Juventus'
  ];

  for (const team of attackingTeams) {
    if (teamName.includes(team) || team.includes(teamName)) {
      features.goalsPerMatch *= 1.2;
      features.avgGoalsInMatch *= 1.15;
      break;
    }
  }

  for (const team of defensiveTeams) {
    if (teamName.includes(team) || team.includes(teamName)) {
      features.cleanSheetRate *= 1.3;
      break;
    }
  }

  return features;
}

function applyStarPlayerBonuses(playerName: string, features: PlayerFeatures): PlayerFeatures {
  // Known star players get watchability bonuses
  const starPlayers: Record<string, { goals: number; assists: number; dribble: number }> = {
    'Haaland': { goals: 1.5, assists: 0.8, dribble: 0.9 },
    'Mbappe': { goals: 1.3, assists: 1.1, dribble: 1.4 },
    'Vinicius': { goals: 1.1, assists: 1.2, dribble: 1.5 },
    'Salah': { goals: 1.3, assists: 1.2, dribble: 1.2 },
    'De Bruyne': { goals: 0.9, assists: 1.5, dribble: 1.1 },
    'Bellingham': { goals: 1.2, assists: 1.1, dribble: 1.2 },
    'Saka': { goals: 1.1, assists: 1.2, dribble: 1.3 },
    'Foden': { goals: 1.1, assists: 1.1, dribble: 1.3 },
    'Palmer': { goals: 1.2, assists: 1.2, dribble: 1.1 },
    'Yamal': { goals: 1.0, assists: 1.3, dribble: 1.4 },
    'Messi': { goals: 1.2, assists: 1.4, dribble: 1.5 },
    'Ronaldo': { goals: 1.4, assists: 0.9, dribble: 1.0 }
  };

  for (const [name, bonuses] of Object.entries(starPlayers)) {
    if (playerName.toLowerCase().includes(name.toLowerCase())) {
      features.goalsPerMatch *= bonuses.goals;
      features.assistsPerMatch *= bonuses.assists;
      features.dribbleSuccessRate *= bonuses.dribble;
      features.marketValue = 1.0;
      break;
    }
  }

  return features;
}

function calculateLineupQuality(lineup: LineupPlayer[]): number {
  if (lineup.length === 0) return 0.5;

  let totalQuality = 0;
  lineup.forEach(player => {
    const features = extractPlayerFeatures(player);
    totalQuality += features.goalInvolvement + features.recentForm;
  });

  return Math.min(totalQuality / lineup.length, 1);
}

function calculateRivalryFactor(homeTeam: string, awayTeam: string): number {
  const rivalries = [
    ['Manchester United', 'Manchester City'],
    ['Manchester United', 'Liverpool'],
    ['Liverpool', 'Everton'],
    ['Arsenal', 'Tottenham'],
    ['Chelsea', 'Arsenal'],
    ['Real Madrid', 'Barcelona'],
    ['Real Madrid', 'Atletico Madrid'],
    ['Barcelona', 'Atletico Madrid'],
    ['AC Milan', 'Inter'],
    ['Juventus', 'Inter'],
    ['Bayern Munich', 'Borussia Dortmund'],
    ['PSG', 'Marseille']
  ];

  for (const [team1, team2] of rivalries) {
    if (
      (homeTeam.includes(team1) && awayTeam.includes(team2)) ||
      (homeTeam.includes(team2) && awayTeam.includes(team1))
    ) {
      return 1.0;
    }
  }

  // Check for same city derbies
  const cities = ['Manchester', 'Milan', 'Madrid', 'London', 'Liverpool'];
  for (const city of cities) {
    if (homeTeam.includes(city) && awayTeam.includes(city)) {
      return 0.8;
    }
  }

  return 0;
}

function calculateMatchStakes(league?: string): number {
  if (!league) return 0.5;

  // Cup competitions and European knockout = higher stakes
  if (league.includes('Champions') || league.includes('Europa')) return 0.9;
  if (league.includes('Cup') || league.includes('Copa') || league.includes('Pokal')) return 0.7;

  return 0.5;
}

function getTimeOfSeasonFactor(): number {
  const month = new Date().getMonth();
  // April, May = end of season, high stakes
  if (month >= 3 && month <= 4) return 0.9;
  // December, January = busy period
  if (month === 11 || month === 0) return 0.7;
  // August, September = start of season
  if (month >= 7 && month <= 8) return 0.6;
  return 0.5;
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const mlModel = new WatchabilityModel();

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Calculate team watchability score with ML model
 */
export const calculateTeamWatchability = (
  teamName: string,
  recentMatches: Match[] = [],
  league?: string
): PredictionResult => {
  const features = extractTeamFeatures(teamName, recentMatches, league);
  return mlModel.predictTeamWatchability(features);
};

/**
 * Calculate player watchability score with ML model
 */
export const calculatePlayerWatchability = (
  player: LineupPlayer | Entity,
  teamContext?: string
): PredictionResult => {
  const features = extractPlayerFeatures(player, teamContext);
  return mlModel.predictPlayerWatchability(features);
};

/**
 * Calculate match watchability score with ML model
 */
export const calculateMatchWatchability = (
  homeTeam: string,
  awayTeam: string,
  homeLineup: LineupPlayer[] = [],
  awayLineup: LineupPlayer[] = [],
  league?: string,
  recentH2H: Match[] = []
): PredictionResult => {
  const features = extractMatchFeatures(homeTeam, awayTeam, homeLineup, awayLineup, league, recentH2H);
  return mlModel.predictMatchWatchability(features);
};

/**
 * Train the model with user feedback
 */
export const trainWithFeedback = (
  type: 'team' | 'player' | 'match',
  features: Record<string, number>,
  userRating: number,
  predictedRating: number
): void => {
  mlModel.learnFromFeedback(type, features, userRating, predictedRating);
};

/**
 * Get model info for debugging
 */
export const getModelInfo = () => ({
  weights: mlModel.getWeights(),
  version: mlModel.getWeights().version
});

/**
 * Reset model to defaults
 */
export const resetModel = () => mlModel.resetWeights();

export default {
  calculateTeamWatchability,
  calculatePlayerWatchability,
  calculateMatchWatchability,
  trainWithFeedback,
  getModelInfo,
  resetModel
};
