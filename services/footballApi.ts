import type { Match, Team, Player, Competition, StandingsTable, TopScorer } from '../types';

const API_KEY = (import.meta as any).env?.VITE_FOOTBALL_DATA_API_KEY ?? '';
const BASE_URL = 'https://api.football-data.org/v4';

// Simple in-memory cache (avoids burning the 10 req/min free tier limit)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

async function fetchAPI<T = unknown>(path: string): Promise<T> {
  const key = path;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data as T;
  }

  if (!API_KEY) {
    throw new Error('VITE_FOOTBALL_DATA_API_KEY is not set. Add it to your .env file.');
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': API_KEY },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Football API ${res.status}: ${text || res.statusText}`);
  }

  const data = (await res.json()) as T;
  cache.set(key, { data, ts: Date.now() });
  return data;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

// ── Competitions ───────────────────────────────────────────────────────────

export async function getAvailableCompetitions(): Promise<{ competitions: Competition[] }> {
  return fetchAPI('/competitions');
}

// ── Matches ────────────────────────────────────────────────────────────────

export interface MatchesResponse {
  filters: Record<string, unknown>;
  resultSet: { count: number; first?: string; last?: string; played?: number };
  competition: Competition;
  matches: Match[];
}

export async function getCompetitionMatches(
  code: string,
  opts: {
    matchday?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    season?: number;
  } = {}
): Promise<MatchesResponse> {
  const q = buildQuery({
    matchday: opts.matchday,
    status: opts.status,
    dateFrom: opts.dateFrom,
    dateTo: opts.dateTo,
    season: opts.season,
  });
  return fetchAPI(`/competitions/${code}/matches${q}`);
}

export async function getMatch(id: number): Promise<{ match: Match }> {
  return fetchAPI(`/matches/${id}`);
}

export async function getTodaysMatches(): Promise<{ matches: Match[] }> {
  const today = new Date().toISOString().split('T')[0];
  return fetchAPI(`/matches${buildQuery({ dateFrom: today, dateTo: today })}`);
}

export async function getDateRangeMatches(
  dateFrom: string,
  dateTo: string,
  competitions?: string
): Promise<{ matches: Match[] }> {
  return fetchAPI(
    `/matches${buildQuery({ dateFrom, dateTo, competitions })}`
  );
}

// ── Standings ──────────────────────────────────────────────────────────────

export interface StandingsResponse {
  filters: Record<string, unknown>;
  area: { id: number; name: string; code: string; flag?: string };
  competition: Competition;
  season: { id: number; startDate: string; endDate: string; currentMatchday: number | null };
  standings: StandingsTable[];
}

export async function getStandings(code: string): Promise<StandingsResponse> {
  return fetchAPI(`/competitions/${code}/standings`);
}

// ── Teams ──────────────────────────────────────────────────────────────────

export interface TeamResponse {
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
  runningCompetitions?: Pick<Competition, 'id' | 'name' | 'code' | 'type'>[];
  coach?: { id: number; name: string; nationality?: string };
  squad: Player[];
  staff: unknown[];
  lastUpdated?: string;
}

export async function getTeam(id: number): Promise<TeamResponse> {
  return fetchAPI(`/teams/${id}`);
}

export async function getTeamMatches(
  id: number,
  opts: { status?: string; limit?: number; competitions?: string } = {}
): Promise<{ matches: Match[] }> {
  return fetchAPI(`/teams/${id}/matches${buildQuery(opts)}`);
}

export async function getCompetitionTeams(code: string): Promise<{ teams: Team[] }> {
  return fetchAPI(`/competitions/${code}/teams`);
}

// ── Persons / Players ──────────────────────────────────────────────────────

export interface PersonResponse extends Player {
  currentTeam?: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest?: string;
    venue?: string;
    address?: string;
    website?: string;
    founded?: number;
    clubColors?: string;
    runningCompetitions?: Pick<Competition, 'id' | 'name' | 'code'>[];
    contract?: { start: string; until: string };
  };
}

export async function getPerson(id: number): Promise<PersonResponse> {
  return fetchAPI(`/persons/${id}`);
}

export async function getPersonMatches(
  id: number,
  opts: { limit?: number; offset?: number } = {}
): Promise<{ matches: Match[] }> {
  return fetchAPI(`/persons/${id}/matches${buildQuery(opts)}`);
}

// ── Scorers ────────────────────────────────────────────────────────────────

export interface ScorersResponse {
  competition: Competition;
  season: { id: number; startDate: string; endDate: string; currentMatchday: number | null };
  scorers: TopScorer[];
}

export async function getTopScorers(code: string, limit = 20): Promise<ScorersResponse> {
  return fetchAPI(`/competitions/${code}/scorers${buildQuery({ limit })}`);
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function clearCache() {
  cache.clear();
}
