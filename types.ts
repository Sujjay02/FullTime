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
  rating: number; // 0.5 to 5.0
  comment: string;
  createdAt: string;
  likes: number;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
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
    home: string[];
    away: string[];
  };
}

export enum League {
  PREMIER_LEAGUE = 'Premier League',
  LA_LIGA = 'La Liga',
  BUNDESLIGA = 'Bundesliga',
  SERIE_A = 'Serie A',
  LIGUE_1 = 'Ligue 1',
  CHAMPIONS_LEAGUE = 'Champions League'
}