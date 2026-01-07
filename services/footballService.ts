import { Entity, EntityType, Match, MatchStatus, League, LineupPlayer } from "../types";
import { getCachedData, setCachedData } from "./cacheService";
import { INITIAL_LIVE_MATCHES, INITIAL_EXCITING_MATCHES, INITIAL_HIGHEST_SCORING_MATCHES } from "../constants";

// Configuration
const API_KEY = '5dd5cbde6103584e1500b93af8ac77b0';
const BASE_URL = 'https://v3.football.api-sports.io';
const HEADERS = {
  'x-rapidapi-host': 'v3.football.api-sports.io',
  'x-rapidapi-key': API_KEY
};

// Map Enum strings to API-Football League IDs (Top 10)
const LEAGUE_IDS: Record<string, number> = {
    [League.PREMIER_LEAGUE]: 39,
    [League.LA_LIGA]: 140,
    [League.BUNDESLIGA]: 78,
    [League.SERIE_A]: 135,
    [League.LIGUE_1]: 61,
    [League.PRIMEIRA_LIGA]: 94,
    [League.EREDIVISIE]: 88,
    [League.BRASILEIRAO]: 71,
    [League.MLS]: 253,
    [League.CHAMPIONS_LEAGUE]: 2
};

// Create a Set of allowed IDs for efficient filtering
const ALLOWED_LEAGUE_IDS = new Set(Object.values(LEAGUE_IDS));

// --- Helpers ---

// Generate a scenic image for the city using a generative AI proxy
const getCityImage = (city: string) => {
    if (!city) return 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=800&auto=format&fit=crop';
    const prompt = `${city} city soccer stadium skyline architecture dramatic lighting`;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=450&nologo=true&seed=${encodeURIComponent(city)}`;
};

// Map API-Football Status to our MatchStatus
const mapStatus = (statusShort: string): MatchStatus => {
    switch (statusShort) {
        case '1H': case '2H': case 'ET': case 'P': case 'BT': case 'LIVE': return 'LIVE';
        case 'HT': return 'HT';
        case 'FT': case 'AET': case 'PEN': return 'FT';
        case 'NS': case 'TBD': return 'UPCOMING';
        case 'PST': case 'CANC': case 'ABD': case 'SUSP': return 'PPD';
        default: return 'LIVE'; 
    }
};

// Calculate internal watchability score
const calculateWatchability = (homeGoals: number, awayGoals: number, status: string): number => {
    const totalGoals = homeGoals + awayGoals;
    const diff = Math.abs(homeGoals - awayGoals);
    let score = (totalGoals * 2) + (diff <= 1 ? 3 : 0);
    if (['1H', '2H', 'ET', 'LIVE'].includes(status)) score += 2;
    return Math.min(score, 15);
};

// Extract lineups if available
const extractLineups = (fixture: any): { home: LineupPlayer[], away: LineupPlayer[] } | undefined => {
    if (!fixture.lineups || fixture.lineups.length < 2) return undefined;
    const homeData = fixture.lineups[0];
    const awayData = fixture.lineups[1];
    if (!homeData?.startXI || !awayData?.startXI) return undefined;

    return {
        home: homeData.startXI.map((p: any) => ({
            name: p.player.name,
            number: p.player.number,
            position: p.player.pos,
            grid: p.player.grid
        })),
        away: awayData.startXI.map((p: any) => ({
            name: p.player.name,
            number: p.player.number,
            position: p.player.pos,
            grid: p.player.grid
        }))
    };
};

// Transform API Fixture to our Match Entity
const transformFixture = (fixture: any): Match => {
    const homeGoals = fixture.goals.home ?? 0;
    const awayGoals = fixture.goals.away ?? 0;
    const venueCity = fixture.fixture.venue.city || 'Unknown City';
    
    return {
        id: `api_${fixture.fixture.id}`,
        name: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
        type: 'MATCH',
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        score: `${homeGoals} - ${awayGoals}`,
        minute: fixture.fixture.status.elapsed ? `${fixture.fixture.status.elapsed}'` : fixture.fixture.status.short,
        league: fixture.league.name,
        status: mapStatus(fixture.fixture.status.short),
        image: getCityImage(venueCity),
        imageCredit: 'AI Generated',
        subtitle: `${fixture.league.name} • ${venueCity}`,
        rating: 0,
        watchability: calculateWatchability(homeGoals, awayGoals, fixture.fixture.status.short),
        events: [],
        lineups: extractLineups(fixture),
        sourceUrl: `https://www.api-football.com`
    };
};

const getDateParams = (daysAgo: number) => {
    const today = new Date();
    const past = new Date(today);
    past.setDate(today.getDate() - daysAgo);
    return {
        from: past.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0]
    };
};

// --- API Methods ---

const fetchFromApi = async (endpoint: string, params: Record<string, string>, ttl: number) => {
    if (!API_KEY) throw new Error("API Key missing");
    
    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${endpoint}?${queryString}`;
    const cacheKey = `${endpoint}_${queryString}`;

    const cached = getCachedData(cacheKey);
    if (cached) {
        console.log(`[Cache Hit] Serving ${cacheKey} from local storage.`);
        return cached;
    }

    console.log(`[Network Request] Fetching ${url} ...`);

    try {
        const response = await fetch(url, { headers: HEADERS });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || `API Error: ${response.status}`);
        }
        
        const json = await response.json();
        
        const hasErrors = Array.isArray(json.errors) 
            ? json.errors.length > 0 
            : Object.keys(json.errors).length > 0;

        if (hasErrors) {
            const errorDetail = JSON.stringify(json.errors);
            console.error("API-Football Error:", json.errors);
            throw new Error(`API Error: ${errorDetail}`);
        }

        const data = json.response;
        setCachedData(cacheKey, data, ttl);
        return data;
    } catch (error) {
        console.error(`Fetch error for ${url}:`, error);
        throw error;
    }
};

export const getLiveMatches = async (leagueName?: string): Promise<Match[]> => {
    try {
        let params: Record<string, string> = { live: 'all' };
        
        if (leagueName && LEAGUE_IDS[leagueName]) {
            params.league = LEAGUE_IDS[leagueName].toString();
        }

        let data = await fetchFromApi('/fixtures', params, 600); 

        // If no live matches, fetch today's matches to ensure content exists for "This Week" requirement
        if (!data || data.length === 0) {
            console.log("No live matches, fetching today's fixtures...");
            const { from, to } = getDateParams(0); // Today
            const leagueId = (leagueName && LEAGUE_IDS[leagueName]) 
                ? LEAGUE_IDS[leagueName] 
                : LEAGUE_IDS[League.PREMIER_LEAGUE]; // Fallback to PL
            
            params = {
                from,
                to,
                league: leagueId.toString(),
                season: '2024'
            };
            
            data = await fetchFromApi('/fixtures', params, 3600);
        }
        
        // Filter strictly if using 'all' live matches (only top leagues)
        const filteredData = data.filter((item: any) => ALLOWED_LEAGUE_IDS.has(item.league.id));
        
        const matches = filteredData.map(transformFixture);
        
        // Sort: Live/In-Play first, then by date
        matches.sort((a, b) => {
             if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
             if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;
             return 0;
        });

        return matches.length > 0 ? matches : INITIAL_LIVE_MATCHES;
    } catch (error) {
        console.warn("Live API failed, using mock:", error);
        if (leagueName) {
            return INITIAL_LIVE_MATCHES.filter(m => m.league === leagueName);
        }
        return INITIAL_LIVE_MATCHES;
    }
};

export const getExcitingMatches = async (leagueName?: string): Promise<Match[]> => {
    try {
        const leagueId = (leagueName && LEAGUE_IDS[leagueName]) 
            ? LEAGUE_IDS[leagueName] 
            : LEAGUE_IDS[League.PREMIER_LEAGUE];

        const { from, to } = getDateParams(7);

        const params: Record<string, string> = { 
            league: leagueId.toString(),
            season: '2024', // Ensure this matches current API season
            from,
            to
        }; 
        
        // Cache for 1 Hour
        const data = await fetchFromApi('/fixtures', params, 3600);
        
        const matches: Match[] = data.map(transformFixture);
        
        const exciting = matches
            .filter(m => {
                const [h, a] = (m.score || "0 - 0").split(' - ').map(Number);
                // Simple exciting logic: 3+ goals or very close game
                return (h + a >= 3) || (Math.abs(h - a) <= 1);
            })
            .sort((a, b) => (b.watchability || 0) - (a.watchability || 0))
            .slice(0, 4);

        return exciting.length > 0 ? exciting : INITIAL_EXCITING_MATCHES;
    } catch (error) {
        console.warn("Exciting API failed, using mock:", error);
        return INITIAL_EXCITING_MATCHES;
    }
};

export const getHighestScoringMatches = async (leagueName?: string): Promise<Match[]> => {
    try {
        // Same restrictions as above apply
        const leagueId = (leagueName && LEAGUE_IDS[leagueName]) 
            ? LEAGUE_IDS[leagueName] 
            : LEAGUE_IDS[League.PREMIER_LEAGUE];

        const { from, to } = getDateParams(7);

        const params: Record<string, string> = { 
            league: leagueId.toString(),
            season: '2024',
            from,
            to
        };

        const data = await fetchFromApi('/fixtures', params, 3600);
        
        const matches: Match[] = data.map(transformFixture);
        
        const highest = matches
            .sort((a, b) => {
                const [h1, a1] = (a.score || "0 - 0").split(' - ').map(Number);
                const [h2, a2] = (b.score || "0 - 0").split(' - ').map(Number);
                return (h2 + a2) - (h1 + a1);
            })
            .slice(0, 4);

        return highest.length > 0 ? highest : INITIAL_HIGHEST_SCORING_MATCHES;
    } catch (error) {
        console.warn("Highest Scoring API failed, using mock:", error);
        return INITIAL_HIGHEST_SCORING_MATCHES;
    }
};

export const searchEntities = async (query: string): Promise<Entity[]> => {
    if (!query) return [];

    try {
        const data = await fetchFromApi('/teams', { search: query }, 86400); 
        
        return data.slice(0, 6).map((item: any) => ({
            id: `team_${item.team.id}`,
            name: item.team.name,
            type: 'TEAM',
            image: item.team.logo,
            subtitle: item.venue.city ? `Team • ${item.venue.city}` : 'Football Team',
            rating: 4.0,
            description: `Professional football club based in ${item.venue.city}. Plays at ${item.venue.name} (Capacity: ${item.venue.capacity}).`,
            stats: [
                { label: 'Founded', value: item.team.founded || 'Unknown' },
                { label: 'Venue', value: item.venue.name },
                { label: 'Capacity', value: item.venue.capacity }
            ]
        }));
    } catch (error) {
        console.warn("Search API failed:", error);
        return [];
    }
};

export const getEntityDetails = async (entity: Entity): Promise<Entity | null> => {
    return entity; 
};