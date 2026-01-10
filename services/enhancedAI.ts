/**
 * Enhanced AI Service
 * Improved prompts, validation, and retry logic for Gemini AI
 */

import { GoogleGenAI } from '@google/genai';
import { LineupPlayer } from '../types';

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

/**
 * Retry logic for AI calls with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on authentication errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Enhanced lineup enrichment with better prompts and validation
 */
export async function enhanceLineupsWithAI(
  homePlayers: LineupPlayer[],
  awayPlayers: LineupPlayer[],
  homeTeam: string,
  awayTeam: string
): Promise<{
  home: LineupPlayer[];
  away: LineupPlayer[];
} | null> {
  try {
    const modelName = 'gemini-2.0-flash-exp';

    // Enhanced prompt with better structure and examples
    const prompt = `You are a professional football/soccer analyst. Analyze these lineups and provide watchability scores and stats.

**MATCH**: ${homeTeam} vs ${awayTeam}

**HOME TEAM (${homeTeam})**:
${homePlayers.map((p, i) => `${i + 1}. ${p.name} (#${p.number}, ${p.position})`).join('\n')}

**AWAY TEAM (${awayTeam})**:
${awayPlayers.map((p, i) => `${i + 1}. ${p.name} (#${p.number}, ${p.position})`).join('\n')}

**YOUR TASK**:
For EACH player, provide:
1. **Watchability score (0-10)**: Based on:
   - Current form (recent performances)
   - Technical ability & flair
   - Goal/assist threat
   - Fan excitement factor
   - Big-game experience

2. **Season stats**:
   - Total goals this season (realistic numbers)
   - Total assists this season (realistic numbers)

**SCORING GUIDELINES**:
- World-class stars (Salah, Haaland, Mbappé): 9.0-10.0
- Elite players (Saka, Rodri, De Bruyne): 8.0-8.9
- Quality starters (solid regulars): 6.5-7.9
- Squad players: 5.5-6.4
- Bench/reserves: 4.0-5.4

**IMPORTANT**:
- Use REAL player names from the lineups above
- Provide REALISTIC season stats (don't exaggerate)
- Consider player position for goals/assists (defenders = low goals)
- Be consistent with scoring

**OUTPUT FORMAT** (JSON only, no other text):
{
  "home": [
    {"name": "Player Name", "watchability": 8.5, "goals": 12, "assists": 7},
    ...
  ],
  "away": [
    {"name": "Player Name", "watchability": 7.0, "goals": 5, "assists": 3},
    ...
  ]
}

Return ONLY valid JSON, nothing else.`;

    const result = await retryWithBackoff(async () => {
      const response = await genAI.models.generateContent({
        model: modelName,
        contents: prompt
      });
      return response.text || response.response?.text() || '';
    });

    // Extract and validate JSON
    const jsonMatch = result.trim().match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No valid JSON found in AI response');
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!parsed.home || !parsed.away || !Array.isArray(parsed.home) || !Array.isArray(parsed.away)) {
      console.error('❌ Invalid AI response structure');
      return null;
    }

    // Merge AI data with original lineups
    const enrichHome = homePlayers.map(player => {
      const aiData = parsed.home.find((p: any) =>
        p.name?.toLowerCase().includes(player.name.toLowerCase()) ||
        player.name.toLowerCase().includes(p.name?.toLowerCase())
      );

      return {
        ...player,
        watchability: validateWatchability(aiData?.watchability),
        goals: Math.max(0, Math.min(aiData?.goals || 0, 50)), // Cap at 50
        assists: Math.max(0, Math.min(aiData?.assists || 0, 30)) // Cap at 30
      };
    });

    const enrichAway = awayPlayers.map(player => {
      const aiData = parsed.away.find((p: any) =>
        p.name?.toLowerCase().includes(player.name.toLowerCase()) ||
        player.name.toLowerCase().includes(p.name?.toLowerCase())
      );

      return {
        ...player,
        watchability: validateWatchability(aiData?.watchability),
        goals: Math.max(0, Math.min(aiData?.goals || 0, 50)),
        assists: Math.max(0, Math.min(aiData?.assists || 0, 30))
      };
    });

    console.log(`✅ AI enriched ${enrichHome.length + enrichAway.length} players`);

    return {
      home: enrichHome,
      away: enrichAway
    };

  } catch (error: any) {
    console.error('❌ AI enrichment failed:', error?.message || error);

    // Provide helpful error messages
    if (error?.message?.includes('403')) {
      console.error('🔑 API Key forbidden. Check https://aistudio.google.com/apikey');
    } else if (error?.message?.includes('429')) {
      console.error('⏰ Rate limit exceeded. Try again in a few minutes.');
    }

    return null;
  }
}

/**
 * Validate and normalize watchability scores
 */
function validateWatchability(score: any): number {
  const num = parseFloat(score);

  if (isNaN(num)) return 6.0; // Default fallback

  // Ensure 0-10 range
  return Math.max(0, Math.min(num, 10));
}

/**
 * Enhanced match analysis with better context
 */
export async function analyzeMatchExcitement(
  homeTeam: string,
  awayTeam: string,
  league: string,
  status: string = 'UPCOMING'
): Promise<{
  watchability: number;
  description: string;
  keyPlayers: string[];
} | null> {
  try {
    const modelName = 'gemini-2.0-flash-exp';

    const prompt = `You are a football analyst. Analyze this match for excitement level.

**MATCH**: ${homeTeam} vs ${awayTeam}
**COMPETITION**: ${league}
**STATUS**: ${status}

**ANALYSIS REQUIRED**:
1. **Watchability Score (0-10)**:
   - Historical rivalry: Does this match have history/tension?
   - Team form: Are teams in good form?
   - League position: Title race? Relegation battle?
   - Star players: Do they have exciting players?
   - Recent meetings: Any memorable recent matches?

2. **Match Description** (1-2 sentences):
   - Why is this match interesting (or not)?
   - What makes it worth watching?

3. **Key Players** (3-5 players to watch):
   - Names of standout players from both teams
   - Players who could decide the match

**SCORING GUIDE**:
- 9.0-10.0: Must-watch (El Clásico, big derbies, title deciders)
- 8.0-8.9: Very exciting (top 6 clashes, cup finals)
- 7.0-7.9: Entertaining (good teams, competitive match)
- 6.0-6.9: Decent (mid-table, one big team)
- 5.0-5.9: Average (routine fixture)
- Below 5.0: Low excitement

**OUTPUT** (JSON only):
{
  "watchability": 8.5,
  "description": "Fierce rivalry between top teams fighting for Champions League spots",
  "keyPlayers": ["Mohamed Salah", "Erling Haaland", "Kevin De Bruyne"]
}`;

    const result = await retryWithBackoff(async () => {
      const response = await genAI.models.generateContent({
        model: modelName,
        contents: prompt
      });
      return response.text || response.response?.text() || '';
    });

    const jsonMatch = result.trim().match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      watchability: validateWatchability(parsed.watchability),
      description: parsed.description || '',
      keyPlayers: Array.isArray(parsed.keyPlayers) ? parsed.keyPlayers.slice(0, 5) : []
    };

  } catch (error: any) {
    console.error('❌ Match analysis failed:', error?.message || error);
    return null;
  }
}

/**
 * Get player form analysis
 */
export async function analyzePlayerForm(
  playerName: string,
  teamName: string
): Promise<{
  formRating: number; // 0-10
  recentPerformance: string;
  strengths: string[];
  stats: { goals: number; assists: number; appearances: number };
} | null> {
  try {
    const modelName = 'gemini-2.0-flash-exp';

    const prompt = `Analyze ${playerName} (${teamName}) current form and performance.

**PLAYER**: ${playerName}
**TEAM**: ${teamName}

**PROVIDE**:
1. Form rating (0-10): How well are they playing recently?
2. Recent performance (1 sentence): Summary of last 5-10 games
3. Key strengths (2-3 items): What makes them good?
4. Season stats: Goals, assists, appearances (realistic estimates)

**OUTPUT** (JSON only):
{
  "formRating": 8.5,
  "recentPerformance": "Excellent form with 5 goals in last 6 games",
  "strengths": ["Clinical finishing", "Pace and dribbling", "Big-game mentality"],
  "stats": {
    "goals": 18,
    "assists": 7,
    "appearances": 25
  }
}`;

    const result = await retryWithBackoff(async () => {
      const response = await genAI.models.generateContent({
        model: modelName,
        contents: prompt
      });
      return response.text || response.response?.text() || '';
    });

    const jsonMatch = result.trim().match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      formRating: validateWatchability(parsed.formRating),
      recentPerformance: parsed.recentPerformance || '',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      stats: {
        goals: Math.max(0, Math.min(parsed.stats?.goals || 0, 50)),
        assists: Math.max(0, Math.min(parsed.stats?.assists || 0, 30)),
        appearances: Math.max(0, Math.min(parsed.stats?.appearances || 0, 60))
      }
    };

  } catch (error: any) {
    console.error('❌ Player analysis failed:', error?.message || error);
    return null;
  }
}
