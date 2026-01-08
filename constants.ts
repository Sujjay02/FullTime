
import { Match, League } from './types';

export const GENERIC_IMAGES = [
  'https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=1000&auto=format&fit=crop', // Pitch
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1000&auto=format&fit=crop', // Ball
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1000&auto=format&fit=crop', // Stadium
  'https://images.unsplash.com/photo-1579952363873-27f3bde9be2b?q=80&w=1000&auto=format&fit=crop', // Action
  'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80&w=1000&auto=format&fit=crop', // Detail
  'https://images.unsplash.com/photo-1518605348435-26a9787ac60c?q=80&w=1000&auto=format&fit=crop', // Atmosphere
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1000&auto=format&fit=crop', // Goal
  'https://images.unsplash.com/photo-1624880357913-a8539238245b?q=80&w=1000&auto=format&fit=crop'  // Seats
];

/**
 * Deterministically returns a generic soccer image based on an ID string.
 */
export const getGenericImage = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GENERIC_IMAGES.length;
  return GENERIC_IMAGES[index];
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
