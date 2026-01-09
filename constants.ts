
import { Match, League } from './types';

// Colorful gradient backgrounds for match cards (no external images needed)
export const GRADIENT_BACKGROUNDS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink-Red
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green-Cyan
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink-Yellow
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Cyan-Purple
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Pastel
  'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)', // Orange-Pink
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Peach
  'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', // Red-Blue
];

/**
 * Deterministically returns a gradient background based on an ID string.
 */
export const getGenericImage = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_BACKGROUNDS.length;
  return GRADIENT_BACKGROUNDS[index];
};

export const INITIAL_LIVE_MATCHES: Match[] = [
  {
    id: 'm1',
    name: 'Man City vs Liverpool',
    type: 'MATCH',
    homeTeam: 'Man City',
    awayTeam: 'Liverpool',
    score: '2 - 2',
    minute: "88'",
    league: League.PREMIER_LEAGUE,
    image: getGenericImage('m1'),
    rating: 4.8,
    subtitle: 'Premier League • Etihad Stadium',
    status: 'LIVE',
    watchability: 13.5,
    events: [
      { id: 'e1', type: 'GOAL', minute: "12'", player: 'Haaland', team: 'HOME' },
      { id: 'e2', type: 'GOAL', minute: "45'", player: 'Salah', team: 'AWAY' },
      { id: 'e3', type: 'GOAL', minute: "67'", player: 'Foden', team: 'HOME' },
      { id: 'e4', type: 'GOAL', minute: "82'", player: 'Nunez', team: 'AWAY' },
    ]
  },
  {
    id: 'm2',
    name: 'Real Madrid vs Barcelona',
    type: 'MATCH',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    score: '0 - 1',
    minute: "HT",
    league: League.LA_LIGA,
    image: getGenericImage('m2'),
    rating: 4.5,
    subtitle: 'La Liga • Santiago Bernabéu',
    status: 'HT',
    watchability: 9.0,
    events: [
      { id: 'e5', type: 'GOAL', minute: "32'", player: 'Lewandowski', team: 'AWAY' }
    ]
  },
  {
    id: 'm3',
    name: 'Bayern Munich vs Dortmund',
    type: 'MATCH',
    homeTeam: 'Bayern',
    awayTeam: 'Dortmund',
    score: '3 - 1',
    minute: "FT",
    league: League.BUNDESLIGA,
    image: getGenericImage('m3'),
    rating: 4.2,
    subtitle: 'Bundesliga • Allianz Arena',
    status: 'FT',
    watchability: 8.5
  },
  {
    id: 'm4',
    name: 'AC Milan vs Inter',
    type: 'MATCH',
    homeTeam: 'AC Milan',
    awayTeam: 'Inter',
    score: '0 - 0',
    minute: "12'",
    league: League.SERIE_A,
    image: getGenericImage('m4'),
    rating: 3.9,
    subtitle: 'Serie A • San Siro',
    status: 'LIVE',
    watchability: 4.0
  }
];

export const INITIAL_EXCITING_MATCHES: Match[] = [
  {
    id: 'ex1',
    name: 'Tottenham vs Chelsea',
    type: 'MATCH',
    homeTeam: 'Tottenham',
    awayTeam: 'Chelsea',
    score: '1 - 4',
    minute: "FT",
    league: League.PREMIER_LEAGUE,
    image: getGenericImage('ex1'),
    rating: 4.9,
    subtitle: 'Premier League • Thriller',
    status: 'FT',
    watchability: 14.5
  },
  {
    id: 'ex2',
    name: 'Leverkusen vs Stuttgart',
    type: 'MATCH',
    homeTeam: 'Leverkusen',
    awayTeam: 'Stuttgart',
    score: '3 - 2',
    minute: "FT",
    league: League.BUNDESLIGA,
    image: getGenericImage('ex2'),
    rating: 4.7,
    subtitle: 'DFB Pokal • Last Minute Winner',
    status: 'FT',
    watchability: 13.8
  }
];

export const INITIAL_HIGHEST_SCORING_MATCHES: Match[] = [
    {
      id: 'hs1',
      name: 'Newcastle vs Sheffield Utd',
      type: 'MATCH',
      homeTeam: 'Newcastle',
      awayTeam: 'Sheffield Utd',
      score: '8 - 0',
      minute: "FT",
      league: League.PREMIER_LEAGUE,
      image: getGenericImage('hs1'),
      rating: 4.5,
      subtitle: 'Premier League • Goal Fest',
      status: 'FT',
      watchability: 14.0
    }
];

export const MOCK_USER = {
  id: 'u1',
  name: 'Pep Fanatico',
  handle: '@tiktakactics',
  avatar: 'https://ui-avatars.com/api/?name=Pep+Fanatico&background=random',
  bio: 'Watching football since 1998. Tactical analysis enthusiast.'
};

// Static fallback league metrics (updated periodically)
export const INITIAL_LEAGUE_METRICS = [
  {
    id: 'lg_1',
    name: League.PREMIER_LEAGUE,
    avgWatchability: 9.2,
    matchCount: 15,
    logo: 'https://ui-avatars.com/api/?name=PL&background=3d195b&color=fff&bold=true',
    topMatch: {
      id: 'tm_pl_1',
      name: 'Arsenal vs Chelsea',
      type: 'MATCH' as const,
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      score: '2-1',
      minute: 'FT',
      status: 'FT' as const,
      league: League.PREMIER_LEAGUE,
      subtitle: 'Premier League • Emirates Stadium',
      image: getGenericImage('tm_pl_1'),
      watchability: 11.5
    }
  },
  {
    id: 'lg_2',
    name: League.LA_LIGA,
    avgWatchability: 8.8,
    matchCount: 12,
    logo: 'https://ui-avatars.com/api/?name=LL&background=ff6900&color=fff&bold=true',
    topMatch: {
      id: 'tm_ll_1',
      name: 'Real Madrid vs Atletico',
      type: 'MATCH' as const,
      homeTeam: 'Real Madrid',
      awayTeam: 'Atletico Madrid',
      score: '3-2',
      minute: 'FT',
      status: 'FT' as const,
      league: League.LA_LIGA,
      subtitle: 'La Liga • Santiago Bernabéu',
      image: getGenericImage('tm_ll_1'),
      watchability: 12.0
    }
  },
  {
    id: 'lg_3',
    name: League.BUNDESLIGA,
    avgWatchability: 8.5,
    matchCount: 14,
    logo: 'https://ui-avatars.com/api/?name=BL&background=d20515&color=fff&bold=true',
    topMatch: {
      id: 'tm_bl_1',
      name: 'Bayern vs Leverkusen',
      type: 'MATCH' as const,
      homeTeam: 'Bayern Munich',
      awayTeam: 'Bayer Leverkusen',
      score: '4-3',
      minute: 'FT',
      status: 'FT' as const,
      league: League.BUNDESLIGA,
      subtitle: 'Bundesliga • Allianz Arena',
      image: getGenericImage('tm_bl_1'),
      watchability: 13.0
    }
  },
  {
    id: 'lg_4',
    name: League.SERIE_A,
    avgWatchability: 7.9,
    matchCount: 13,
    logo: 'https://ui-avatars.com/api/?name=SA&background=024494&color=fff&bold=true',
    topMatch: {
      id: 'tm_sa_1',
      name: 'Inter vs AC Milan',
      type: 'MATCH' as const,
      homeTeam: 'Inter Milan',
      awayTeam: 'AC Milan',
      score: '1-1',
      minute: 'FT',
      status: 'FT' as const,
      league: League.SERIE_A,
      subtitle: 'Serie A • San Siro',
      image: getGenericImage('tm_sa_1'),
      watchability: 9.5
    }
  },
  {
    id: 'lg_5',
    name: League.LIGUE_1,
    avgWatchability: 7.3,
    matchCount: 11,
    logo: 'https://ui-avatars.com/api/?name=L1&background=dae025&color=000&bold=true',
    topMatch: {
      id: 'tm_l1_1',
      name: 'PSG vs Marseille',
      type: 'MATCH' as const,
      homeTeam: 'PSG',
      awayTeam: 'Marseille',
      score: '3-0',
      minute: 'FT',
      status: 'FT' as const,
      league: League.LIGUE_1,
      subtitle: 'Ligue 1 • Parc des Princes',
      image: getGenericImage('tm_l1_1'),
      watchability: 10.0
    }
  }
];
