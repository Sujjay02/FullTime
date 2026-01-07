
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
  position?: string;
  grid?: string;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  image?: string;
  imageCredit?: string;
  subtitle?: string; // e.g., "FWD - Manchester City" or "Premier League • Week 12"
  rating?: number; // Average rating
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
  rating: number; // 0.5 to 5.0
  comment: string;
  createdAt: string;
  likes: number;
  // Snapshot details for Profile display
  entityName?: string;
  entityImage?: string;
  entityType?: string;
}

export interface User {
  id: string;
  name: string;
  handle: string; // email or custom handle
  avatar: string;
  bio?: string;
  uid?: string; // Firebase UID
}

export type MatchStatus = 'LIVE' | 'FT' | 'HT' | 'UPCOMING' | 'PPD';

export interface MatchEvent {
  id: string;
  type: 'GOAL' | 'CARD' | 'SUB';
  minute: string;
  player: string;
  team: 'HOME' | 'AWAY';
  detail?: string;
}

export interface Match extends Entity {
  type: 'MATCH';
  homeTeam: string;
  awayTeam: string;
  score?: string;
  minute?: string; // e.g., "45+2'" or "FT"
  league: string;
  status?: MatchStatus;
  events?: MatchEvent[];
  sourceUrl?: string;
  watchability?: number; // 0 to 15 scale
  lineups?: {
    home: LineupPlayer[];
    away: LineupPlayer[];
  };
}

export enum League {
  PREMIER_LEAGUE = 'Premier League',
  LA_LIGA = 'La Liga',
  BUNDESLIGA = 'Bundesliga',
  SERIE_A = 'Serie A',
  LIGUE_1 = 'Ligue 1',
  PRIMEIRA_LIGA = 'Primeira Liga',
  EREDIVISIE = 'Eredivisie',
  BRASILEIRAO = 'Brasileirão',
  MLS = 'MLS',
  CHAMPIONS_LEAGUE = 'Champions League'
}
