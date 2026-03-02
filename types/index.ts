// ── Football API Types ─────────────────────────────────────────────────────

export interface Competition {
  id: number;
  name: string;
  code: string;
  type: 'LEAGUE' | 'CUP';
  emblem?: string;
  area: { id: number; name: string; code: string; flag?: string };
  currentSeason?: Season;
  numberOfAvailableSeasons?: number;
  lastUpdated?: string;
}

export interface Season {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number | null;
  winner?: Team | null;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest?: string;
  address?: string;
  website?: string;
  founded?: number;
  clubColors?: string;
  venue?: string;
  coach?: Person;
  squad?: Player[];
  runningCompetitions?: Pick<Competition, 'id' | 'name' | 'code' | 'type' | 'emblem'>[];
  lastUpdated?: string;
}

export interface Player {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  section?: string;
  position?: string;
  shirtNumber?: number | null;
  lastUpdated?: string;
  currentTeam?: Pick<Team, 'id' | 'name' | 'crest' | 'venue'> & {
    contract?: { start: string; until: string };
  };
}

export interface Person {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  section?: string;
  contract?: { start: string; until: string };
}

export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'SUSPENDED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'AWARDED';

export interface Score {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  duration: string;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday?: number | null;
  stage: string;
  group?: string | null;
  lastUpdated: string;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  referees?: { id: number; name: string; type: string; nationality?: string }[];
  competition: Competition;
  season?: Season;
  odds?: { msg?: string; homeWin?: number; draw?: number; awayWin?: number };
}

export interface Standing {
  position: number;
  team: Pick<Team, 'id' | 'name' | 'shortName' | 'tla' | 'crest'>;
  playedGames: number;
  form?: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface StandingsTable {
  stage: string;
  type: string;
  group?: string | null;
  table: Standing[];
}

export interface TopScorer {
  player: Player;
  team: Pick<Team, 'id' | 'name' | 'crest'>;
  playedMatches: number;
  goals: number;
  assists: number | null;
  penalties: number | null;
}

// ── User / Social Types ────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  favoriteTeamId?: number;
  favoriteTeamName?: string;
  totalWatched: number;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  matchId: number;
  matchSnapshot: MatchSnapshot;
  rating: number;
  content: string;
  spoiler: boolean;
  createdAt: string;
  likes: number;
}

export interface WatchLog {
  id: string;
  userId: string;
  matchId: number;
  matchSnapshot: MatchSnapshot;
  watchedDate: string;
  rating?: number;
  createdAt: string;
}

export interface WatchlistEntry {
  id: string;
  userId: string;
  matchId: number;
  matchSnapshot: MatchSnapshot;
  addedAt: string;
}

export interface MatchList {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  name: string;
  description?: string;
  matchIds: number[];
  matchSnapshots: MatchSnapshot[];
  isPublic: boolean;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface MatchSnapshot {
  id: number;
  utcDate: string;
  status: MatchStatus;
  homeTeam: { id: number; name: string; shortName: string; crest?: string };
  awayTeam: { id: number; name: string; shortName: string; crest?: string };
  score: Score;
  competition: { id: number; name: string; code: string; emblem?: string };
}

export interface Activity {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  type: 'REVIEW' | 'LOG' | 'WATCHLIST' | 'LIST' | 'FOLLOW';
  matchId?: number;
  matchSnapshot?: MatchSnapshot;
  reviewId?: string;
  listId?: string;
  listName?: string;
  targetUserId?: string;
  targetUserDisplayName?: string;
  rating?: number;
  content?: string;
  createdAt: string;
}

// ── App Types ──────────────────────────────────────────────────────────────

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type CompetitionCode = 'PL' | 'PD' | 'SA' | 'BL1' | 'FL1' | 'CL' | 'FAC' | 'DFB' | 'CDR' | 'CIT' | 'LFR';

export interface CompetitionConfig {
  id: number;
  code: CompetitionCode | string;
  name: string;
  shortName: string;
  country: string;
  flag: string;
  emblem?: string;
  type: 'LEAGUE' | 'CUP';
  color: string;
}
