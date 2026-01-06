import { Match, League } from './types';

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
    image: 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?q=80&w=800&auto=format&fit=crop', // Manchester
    rating: 4.8,
    subtitle: 'Premier League • Etihad Stadium',
    status: 'LIVE',
    watchability: 13.5,
    events: [
      { id: 'e1', type: 'GOAL', minute: "12'", player: 'Haaland', team: 'HOME' },
      { id: 'e2', type: 'GOAL', minute: "45'", player: 'Salah', team: 'AWAY' },
      { id: 'e3', type: 'GOAL', minute: "67'", player: 'Foden', team: 'HOME' },
      { id: 'e4', type: 'GOAL', minute: "82'", player: 'Nunez', team: 'AWAY' },
    ],
    lineups: {
      home: ['Ederson', 'Walker', 'Dias', 'Akanji', 'Gvardiol', 'Rodri', 'Silva', 'De Bruyne', 'Foden', 'Doku', 'Haaland'],
      away: ['Alisson', 'Alexander-Arnold', 'Van Dijk', 'Konate', 'Robertson', 'Mac Allister', 'Szoboszlai', 'Jones', 'Salah', 'Diaz', 'Nunez']
    }
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
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=800&auto=format&fit=crop', // Madrid
    rating: 4.5,
    subtitle: 'La Liga • Santiago Bernabéu',
    status: 'HT',
    watchability: 9.0,
    events: [
      { id: 'e5', type: 'GOAL', minute: "32'", player: 'Lewandowski', team: 'AWAY' }
    ],
    lineups: {
      home: ['Lunin', 'Carvajal', 'Rudiger', 'Militao', 'Mendy', 'Tchouameni', 'Valverde', 'Bellingham', 'Rodrygo', 'Vinicius Jr', 'Mbappe'],
      away: ['Ter Stegen', 'Kounde', 'Cubarsi', 'Araujo', 'Cancelo', 'Gundogan', 'De Jong', 'Pedri', 'Yamal', 'Raphinha', 'Lewandowski']
    }
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
    image: 'https://images.unsplash.com/photo-1595867865334-72594de84315?q=80&w=800&auto=format&fit=crop', // Munich
    rating: 4.2,
    subtitle: 'Bundesliga • Allianz Arena',
    status: 'FT',
    watchability: 8.5,
    events: [],
    lineups: {
        home: ['Neuer', 'Kimmich', 'De Ligt', 'Dier', 'Davies', 'Goretzka', 'Laimer', 'Sane', 'Muller', 'Musiala', 'Kane'],
        away: ['Kobel', 'Ryerson', 'Hummels', 'Schlotterbeck', 'Maatsen', 'Sabitzer', 'Can', 'Sancho', 'Brandt', 'Adeyemi', 'Fullkrug']
    }
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
    image: 'https://images.unsplash.com/photo-1619379018423-2868bd332eb4?q=80&w=800&auto=format&fit=crop', // Milan
    rating: 3.9,
    subtitle: 'Serie A • San Siro',
    status: 'LIVE',
    watchability: 4.0,
    events: []
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
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop', // London
    rating: 4.9,
    subtitle: 'Premier League • Thriller',
    status: 'FT',
    watchability: 14.5,
    events: [
        { id: 'ex_e1', type: 'GOAL', minute: "6'", player: 'Kulusevski', team: 'HOME' },
        { id: 'ex_e2', type: 'CARD', minute: "33'", player: 'Romero (Red)', team: 'HOME' },
        { id: 'ex_e3', type: 'GOAL', minute: "35'", player: 'Palmer', team: 'AWAY' },
        { id: 'ex_e4', type: 'GOAL', minute: "75'", player: 'Jackson', team: 'AWAY' }
    ],
    lineups: {
        home: ['Vicario', 'Porro', 'Romero', 'Van de Ven', 'Udogie', 'Bissouma', 'Sarr', 'Kulusevski', 'Maddison', 'Johnson', 'Son'],
        away: ['Sanchez', 'James', 'Silva', 'Disasi', 'Colwill', 'Caicedo', 'Fernandez', 'Palmer', 'Gallagher', 'Sterling', 'Jackson']
    }
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
    image: 'https://images.unsplash.com/photo-1627918820061-0f73f4e245c7?q=80&w=800&auto=format&fit=crop', // Industrial/Germany generic
    rating: 4.7,
    subtitle: 'DFB Pokal • Last Minute Winner',
    status: 'FT',
    watchability: 13.8,
    events: [
        { id: 'ex_e5', type: 'GOAL', minute: "90'", player: 'Tah', team: 'HOME' }
    ]
  },
  {
    id: 'ex3',
    name: 'Liverpool vs Fulham',
    type: 'MATCH',
    homeTeam: 'Liverpool',
    awayTeam: 'Fulham',
    score: '4 - 3',
    minute: "FT",
    league: League.PREMIER_LEAGUE,
    image: 'https://images.unsplash.com/photo-1605206979282-329b37c02c63?q=80&w=800&auto=format&fit=crop', // Liverpool
    rating: 4.8,
    subtitle: 'Premier League • Anfield',
    status: 'FT',
    watchability: 14.2,
    events: []
  },
  {
    id: 'ex4',
    name: 'Girona vs Atletico',
    type: 'MATCH',
    homeTeam: 'Girona',
    awayTeam: 'Atletico',
    score: '4 - 3',
    minute: "FT",
    league: League.LA_LIGA,
    image: 'https://images.unsplash.com/photo-1563810247656-7a718c541740?q=80&w=800&auto=format&fit=crop', // Girona
    rating: 4.6,
    subtitle: 'La Liga • High Scoring',
    status: 'FT',
    watchability: 13.0,
    events: []
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
      image: 'https://images.unsplash.com/photo-1596277063857-41a49f57297e?q=80&w=800&auto=format&fit=crop', // Newcastle area
      rating: 4.5,
      subtitle: 'Premier League • Goal Fest',
      status: 'FT',
      watchability: 14.0,
      events: []
    },
    {
      id: 'hs2',
      name: 'Bayern Munich vs Darmstadt',
      type: 'MATCH',
      homeTeam: 'Bayern',
      awayTeam: 'Darmstadt',
      score: '8 - 0',
      minute: "FT",
      league: League.BUNDESLIGA,
      image: 'https://images.unsplash.com/photo-1595867865334-72594de84315?q=80&w=800&auto=format&fit=crop', // Munich
      rating: 4.4,
      subtitle: 'Bundesliga • Domination',
      status: 'FT',
      watchability: 13.5,
      events: []
    },
    {
      id: 'hs3',
      name: 'Arsenal vs Lens',
      type: 'MATCH',
      homeTeam: 'Arsenal',
      awayTeam: 'Lens',
      score: '6 - 0',
      minute: "FT",
      league: League.CHAMPIONS_LEAGUE,
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop', // London
      rating: 4.6,
      subtitle: 'UCL • Group Stage',
      status: 'FT',
      watchability: 12.5,
      events: []
    },
    {
      id: 'hs4',
      name: 'Atalanta vs Salernitana',
      type: 'MATCH',
      homeTeam: 'Atalanta',
      awayTeam: 'Salernitana',
      score: '8 - 2',
      minute: "FT",
      league: League.SERIE_A,
      image: 'https://images.unsplash.com/photo-1635241161466-16f5c8bc3413?q=80&w=800&auto=format&fit=crop', // Bergamo (generic Italy)
      rating: 4.3,
      subtitle: 'Serie A • 10 Goals',
      status: 'FT',
      watchability: 14.8,
      events: []
    }
];

export const MOCK_USER = {
  id: 'u1',
  name: 'Pep Fanatico',
  handle: '@tiktakactics',
  avatar: 'https://picsum.photos/100/100?random=50',
  bio: 'Watching football since 1998. Tactical analysis enthusiast.'
};