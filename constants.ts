
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
      home: [
        { number: 31, name: 'Ederson' }, { number: 2, name: 'Walker' }, { number: 3, name: 'Dias' }, { number: 25, name: 'Akanji' }, 
        { number: 24, name: 'Gvardiol' }, { number: 16, name: 'Rodri' }, { number: 20, name: 'Silva' }, { number: 17, name: 'De Bruyne' }, 
        { number: 47, name: 'Foden' }, { number: 11, name: 'Doku' }, { number: 9, name: 'Haaland' }
      ],
      away: [
        { number: 1, name: 'Alisson' }, { number: 66, name: 'Alexander-Arnold' }, { number: 4, name: 'Van Dijk' }, { number: 5, name: 'Konate' }, 
        { number: 26, name: 'Robertson' }, { number: 10, name: 'Mac Allister' }, { number: 8, name: 'Szoboszlai' }, { number: 17, name: 'Jones' }, 
        { number: 11, name: 'Salah' }, { number: 7, name: 'Diaz' }, { number: 9, name: 'Nunez' }
      ]
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
      home: [
        { number: 13, name: 'Lunin' }, { number: 2, name: 'Carvajal' }, { number: 22, name: 'Rudiger' }, { number: 3, name: 'Militao' }, 
        { number: 23, name: 'Mendy' }, { number: 18, name: 'Tchouameni' }, { number: 15, name: 'Valverde' }, { number: 5, name: 'Bellingham' }, 
        { number: 11, name: 'Rodrygo' }, { number: 7, name: 'Vinicius Jr' }, { number: 9, name: 'Mbappe' }
      ],
      away: [
        { number: 1, name: 'Ter Stegen' }, { number: 23, name: 'Kounde' }, { number: 33, name: 'Cubarsi' }, { number: 4, name: 'Araujo' }, 
        { number: 2, name: 'Cancelo' }, { number: 22, name: 'Gundogan' }, { number: 21, name: 'De Jong' }, { number: 8, name: 'Pedri' }, 
        { number: 27, name: 'Yamal' }, { number: 11, name: 'Raphinha' }, { number: 9, name: 'Lewandowski' }
      ]
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
        home: [
          { number: 1, name: 'Neuer' }, { number: 6, name: 'Kimmich' }, { number: 4, name: 'De Ligt' }, { number: 15, name: 'Dier' }, 
          { number: 19, name: 'Davies' }, { number: 8, name: 'Goretzka' }, { number: 27, name: 'Laimer' }, { number: 10, name: 'Sane' }, 
          { number: 25, name: 'Muller' }, { number: 42, name: 'Musiala' }, { number: 9, name: 'Kane' }
        ],
        away: [
          { number: 1, name: 'Kobel' }, { number: 26, name: 'Ryerson' }, { number: 15, name: 'Hummels' }, { number: 4, name: 'Schlotterbeck' }, 
          { number: 22, name: 'Maatsen' }, { number: 20, name: 'Sabitzer' }, { number: 23, name: 'Can' }, { number: 10, name: 'Sancho' }, 
          { number: 19, name: 'Brandt' }, { number: 27, name: 'Adeyemi' }, { number: 14, name: 'Fullkrug' }
        ]
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
    events: [],
    lineups: {
        home: [
          { number: 16, name: 'Maignan' }, { number: 2, name: 'Calabria' }, { number: 23, name: 'Tomori' }, { number: 46, name: 'Gabbia' }, 
          { number: 19, name: 'Hernandez' }, { number: 7, name: 'Adli' }, { number: 14, name: 'Reijnders' }, { number: 11, name: 'Pulisic' }, 
          { number: 8, name: 'Loftus-Cheek' }, { number: 10, name: 'Leao' }, { number: 9, name: 'Giroud' }
        ],
        away: [
          { number: 1, name: 'Sommer' }, { number: 28, name: 'Pavard' }, { number: 15, name: 'Acerbi' }, { number: 95, name: 'Bastoni' }, 
          { number: 36, name: 'Darmian' }, { number: 23, name: 'Barella' }, { number: 20, name: 'Calhanoglu' }, { number: 22, name: 'Mkhitaryan' }, 
          { number: 32, name: 'Dimarco' }, { number: 9, name: 'Thuram' }, { number: 10, name: 'Martinez' }
        ]
    }
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
        home: [
          { number: 13, name: 'Vicario' }, { number: 23, name: 'Porro' }, { number: 17, name: 'Romero' }, { number: 37, name: 'Van de Ven' }, 
          { number: 38, name: 'Udogie' }, { number: 8, name: 'Bissouma' }, { number: 29, name: 'Sarr' }, { number: 21, name: 'Kulusevski' }, 
          { number: 10, name: 'Maddison' }, { number: 22, name: 'Johnson' }, { number: 7, name: 'Son' }
        ],
        away: [
          { number: 1, name: 'Sanchez' }, { number: 24, name: 'James' }, { number: 6, name: 'Silva' }, { number: 2, name: 'Disasi' }, 
          { number: 26, name: 'Colwill' }, { number: 25, name: 'Caicedo' }, { number: 8, name: 'Fernandez' }, { number: 20, name: 'Palmer' }, 
          { number: 23, name: 'Gallagher' }, { number: 7, name: 'Sterling' }, { number: 15, name: 'Jackson' }
        ]
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
    ],
    lineups: {
        home: [
          { number: 17, name: 'Kovar' }, { number: 2, name: 'Stanisic' }, { number: 4, name: 'Tah' }, { number: 12, name: 'Tapsoba' }, 
          { number: 30, name: 'Frimpong' }, { number: 8, name: 'Andrich' }, { number: 34, name: 'Xhaka' }, { number: 20, name: 'Grimaldo' }, 
          { number: 7, name: 'Hofmann' }, { number: 10, name: 'Wirtz' }, { number: 14, name: 'Schick' }
        ],
        away: [
          { number: 33, name: 'Nubel' }, { number: 20, name: 'Stergiou' }, { number: 2, name: 'Anton' }, { number: 21, name: 'Ito' }, 
          { number: 7, name: 'Mittelstadt' }, { number: 16, name: 'Karazor' }, { number: 6, name: 'Stiller' }, { number: 18, name: 'Leweling' }, 
          { number: 8, name: 'Millot' }, { number: 27, name: 'Fuhrich' }, { number: 26, name: 'Undav' }
        ]
    }
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
    events: [],
    lineups: {
        home: [
          { number: 62, name: 'Kelleher' }, { number: 66, name: 'Alexander-Arnold' }, { number: 32, name: 'Matip' }, { number: 4, name: 'Van Dijk' }, 
          { number: 21, name: 'Tsimikas' }, { number: 8, name: 'Szoboszlai' }, { number: 10, name: 'Mac Allister' }, { number: 38, name: 'Gravenberch' }, 
          { number: 11, name: 'Salah' }, { number: 9, name: 'Nunez' }, { number: 7, name: 'Diaz' }
        ],
        away: [
          { number: 17, name: 'Leno' }, { number: 2, name: 'Tete' }, { number: 3, name: 'Bassey' }, { number: 13, name: 'Ream' }, 
          { number: 33, name: 'Robinson' }, { number: 26, name: 'Palhinha' }, { number: 6, name: 'Reed' }, { number: 22, name: 'Iwobi' }, 
          { number: 18, name: 'Pereira' }, { number: 8, name: 'Wilson' }, { number: 7, name: 'Jimenez' }
        ]
    }
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
    events: [],
    lineups: {
        home: [
          { number: 13, name: 'Gazzaniga' }, { number: 20, name: 'Couto' }, { number: 25, name: 'E. Garcia' }, { number: 5, name: 'Blind' }, 
          { number: 3, name: 'Gutierrez' }, { number: 23, name: 'Martin' }, { number: 14, name: 'A. Garcia' }, { number: 11, name: 'Valery' }, 
          { number: 10, name: 'Torre' }, { number: 16, name: 'Savio' }, { number: 9, name: 'Dovbyk' }
        ],
        away: [
          { number: 13, name: 'Oblak' }, { number: 2, name: 'Gimenez' }, { number: 20, name: 'Witsel' }, { number: 22, name: 'Hermoso' }, 
          { number: 17, name: 'Riquelme' }, { number: 5, name: 'De Paul' }, { number: 6, name: 'Koke' }, { number: 14, name: 'Llorente' }, 
          { number: 12, name: 'Lino' }, { number: 7, name: 'Griezmann' }, { number: 19, name: 'Morata' }
        ]
    }
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
      events: [],
      lineups: {
          home: [
            { number: 22, name: 'Pope' }, { number: 2, name: 'Trippier' }, { number: 5, name: 'Schar' }, { number: 4, name: 'Botman' }, 
            { number: 33, name: 'Burn' }, { number: 36, name: 'Longstaff' }, { number: 39, name: 'Guimaraes' }, { number: 32, name: 'Anderson' }, 
            { number: 24, name: 'Almiron' }, { number: 9, name: 'Wilson' }, { number: 10, name: 'Gordon' }
          ],
          away: [
            { number: 18, name: 'Foderingham' }, { number: 15, name: 'Ahmedhodzic' }, { number: 12, name: 'Egan' }, { number: 19, name: 'Robinson' }, 
            { number: 20, name: 'Bogle' }, { number: 8, name: 'Hamer' }, { number: 21, name: 'Souza' }, { number: 28, name: 'McAtee' }, 
            { number: 14, name: 'Thomas' }, { number: 10, name: 'Archer' }, { number: 11, name: 'Traore' }
          ]
      }
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
      events: [],
      lineups: {
          home: [
            { number: 1, name: 'Neuer' }, { number: 40, name: 'Mazraoui' }, { number: 4, name: 'De Ligt' }, { number: 3, name: 'Kim' }, 
            { number: 19, name: 'Davies' }, { number: 6, name: 'Kimmich' }, { number: 27, name: 'Laimer' }, { number: 10, name: 'Sane' }, 
            { number: 42, name: 'Musiala' }, { number: 11, name: 'Coman' }, { number: 9, name: 'Kane' }
          ],
          away: [
            { number: 1, name: 'Schuhen' }, { number: 14, name: 'Klarer' }, { number: 23, name: 'Gjasula' }, { number: 5, name: 'Maglica' }, 
            { number: 26, name: 'Bader' }, { number: 11, name: 'Kempe' }, { number: 32, name: 'Holland' }, { number: 15, name: 'Nurnberger' }, 
            { number: 6, name: 'Mehlem' }, { number: 24, name: 'Pfeiffer' }, { number: 27, name: 'Skarke' }
          ]
      }
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
      events: [],
      lineups: {
          home: [
            { number: 22, name: 'Raya' }, { number: 18, name: 'Tomiyasu' }, { number: 2, name: 'Saliba' }, { number: 6, name: 'Gabriel' }, 
            { number: 35, name: 'Zinchenko' }, { number: 8, name: 'Odegaard' }, { number: 41, name: 'Rice' }, { number: 29, name: 'Havertz' }, 
            { number: 7, name: 'Saka' }, { number: 9, name: 'Jesus' }, { number: 11, name: 'Martinelli' }
          ],
          away: [
            { number: 30, name: 'Samba' }, { number: 24, name: 'Gradit' }, { number: 4, name: 'Danso' }, { number: 14, name: 'Medina' }, 
            { number: 29, name: 'Frankowski' }, { number: 26, name: 'Mendy' }, { number: 6, name: 'Abdul Samed' }, { number: 11, name: 'Haidara' }, 
            { number: 7, name: 'Sotoca' }, { number: 9, name: 'Wahi' }, { number: 20, name: 'Fulgini' }
          ]
      }
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
      events: [],
      lineups: {
          home: [
            { number: 1, name: 'Musso' }, { number: 2, name: 'Toloi' }, { number: 6, name: 'Palomino' }, { number: 42, name: 'Scalvini' }, 
            { number: 77, name: 'Zappacosta' }, { number: 15, name: 'De Roon' }, { number: 7, name: 'Koopmeiners' }, { number: 22, name: 'Ruggeri' }, 
            { number: 10, name: 'Boga' }, { number: 17, name: 'Hojlund' }, { number: 11, name: 'Lookman' }
          ],
          away: [
            { number: 13, name: 'Ochoa' }, { number: 66, name: 'Lovato' }, { number: 17, name: 'Fazio' }, { number: 98, name: 'Pirola' }, 
            { number: 87, name: 'Candreva' }, { number: 41, name: 'Nicolussi' }, { number: 18, name: 'Coulibaly' }, { number: 3, name: 'Bradaric' }, 
            { number: 10, name: 'Vilhena' }, { number: 29, name: 'Dia' }, { number: 99, name: 'Piatek' }
          ]
      }
    }
];

// Deprecated MOCK_USER, kept for fallback if needed
export const MOCK_USER = {
  id: 'u1',
  name: 'Pep Fanatico',
  handle: '@tiktakactics',
  avatar: 'https://picsum.photos/100/100?random=50',
  bio: 'Watching football since 1998. Tactical analysis enthusiast.'
};
