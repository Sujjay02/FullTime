
export type EntityType = 'MATCH' | 'PLAYER' | 'TEAM' | 'MANAGER';

export interface Stat {
  label: string;
  value: string | number;
}

export interface NewsItem {
  title: string;
  source: string;
  date: string;
}

export interface LineupPlayer {
  name: string;
  number: number | string;
  position: string; // GK, DEF, MID, FWD
  role?: string; // e.g. "Captain", "Playmaker"
  goals?: number;
  assists?: number;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  image?: string;
  imageCredit?: string;
  subtitle?: string; 
  rating?: number;
  description?: string;
  stats?: Stat[];
  news?: NewsItem[];
}

export interface Review {
  id: string;
  entityId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; 
  comment: string;
  createdAt: string;
  likes: number;
  entityName?: string;
  entityImage?: string;
  entityType?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  userId: string;
  matchIds: string[];
  createdAt: string;
  // Metadata for cover
  coverImage?: string;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio?: string;
  uid?: string;
}

export type MatchStatus = 'LIVE' | 'FT' | 'HT' | 'UPCOMING' | 'PPD';

export interface MatchEvent {
  id: string;
  type: 'GOAL' | 'CARD' | 'SUB' | 'VAR';
  minute: string;
  player: string;
  playerOut?: string; // For subs
  team: 'HOME' | 'AWAY';
  detail?: string; // e.g. "Yellow", "Red", "Penalty"
}

export interface Match extends Entity {
  type: 'MATCH';
  homeTeam: string;
  awayTeam: string;
  score?: string;
  minute?: string; 
  league: string;
  status?: MatchStatus;
  events?: MatchEvent[];
  sourceUrl?: string;
  watchability?: number;
  formation?: {
    home: string; // e.g. "4-3-3"
    away: string;
  };
  lineups?: {
    home: LineupPlayer[];
    away: LineupPlayer[];
  };
  bench?: {
    home: LineupPlayer[];
    away: LineupPlayer[];
  };
}

export interface LeagueMetric {
  id: string;
  name: string;
  avgWatchability: number;
  matchCount: number;
  topMatch?: Match;
  logo?: string;
}

export enum League {
  PREMIER_LEAGUE = 'Premier League',
  LA_LIGA = 'La Liga',
  BUNDESLIGA = 'Bundesliga',
  SERIE_A = 'Serie A',
  LIGUE_1 = 'Ligue 1',
  MLS = 'MLS',
  CHAMPIONS_LEAGUE = 'Champions League'
}
