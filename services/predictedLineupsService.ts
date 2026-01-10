/**
 * Predicted Lineups Service
 * Provides AI-generated predicted lineups when actual lineups aren't available
 */

import { LineupPlayer } from '../types';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const modelName = 'gemini-2.0-flash-exp';

interface PredictedLineups {
  home: LineupPlayer[];
  away: LineupPlayer[];
  bench: {
    home: LineupPlayer[];
    away: LineupPlayer[];
  };
  homeFormation: string;
  awayFormation: string;
  confidence: 'high' | 'medium' | 'low';
  isPredicted: true;
}

/**
 * Get predicted lineups using Gemini AI
 */
export const getPredictedLineups = async (
  homeTeam: string,
  awayTeam: string,
  league: string
): Promise<PredictedLineups | null> => {
  // Check cache first (cache for 6 hours - predicted lineups don't change)
  const cacheKey = `predicted_lineup_${homeTeam}_${awayTeam}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Cache valid for 6 hours
      if (age < 21600000) {
        console.log('✅ Using cached predicted lineups');
        return data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  if (!GEMINI_API_KEY) {
    console.warn('⚠️ No Gemini API key for predicted lineups');
    return null;
  }

  try {
    const prompt = `You are a professional football/soccer analyst. Predict the most likely starting XI and formation for an upcoming match.

**Match Details**:
- Home Team: ${homeTeam}
- Away Team: ${awayTeam}
- Competition: ${league}

**Task**: Provide predicted lineups based on:
1. Recent team form and typical formations
2. Key players and star performers
3. Tactical approach of each team
4. Common formations used by each team

**IMPORTANT GUIDELINES**:
- Use REAL player names from current squads (2024-2025 season)
- Provide realistic formations (e.g., 4-3-3, 4-2-3-1, 3-5-2)
- Include 11 starters + 7 substitutes per team
- Rate each player's watchability (0-10) based on:
  - Star quality: 9-10 (Salah, Haaland, Mbappé)
  - Elite: 8-8.9 (Saka, Rodri, De Bruyne)
  - Quality starters: 6.5-7.9
  - Squad players: 5.5-6.4
  - Bench/reserves: 4-5.4

**Response Format** (JSON only, no markdown):
{
  "homeFormation": "4-3-3",
  "awayFormation": "4-2-3-1",
  "homeStarting": [
    {"name": "Player Name", "number": 1, "position": "GK", "watchability": 7.5},
    ...11 players total
  ],
  "awayStarting": [
    {"name": "Player Name", "number": 1, "position": "GK", "watchability": 7.5},
    ...11 players total
  ],
  "homeBench": [
    {"name": "Player Name", "number": 12, "position": "GK", "watchability": 6.0},
    ...7 players total
  ],
  "awayBench": [
    {"name": "Player Name", "number": 12, "position": "GK", "watchability": 6.0},
    ...7 players total
  ],
  "confidence": "high"
}

**Confidence Levels**:
- "high": Strong knowledge of both teams' typical lineups
- "medium": Good knowledge but some uncertainty
- "low": Limited information, educated guess

Respond ONLY with valid JSON, no other text.`;

    console.log('🤖 Generating predicted lineups with Gemini AI...');
    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt
    });
    const responseText = result.text || '';

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in AI response');
      return null;
    }

    const aiData = JSON.parse(jsonMatch[0]);

    // Convert to our format
    const predicted: PredictedLineups = {
      home: aiData.homeStarting.map((p: any) => ({
        name: p.name,
        number: p.number,
        position: p.position,
        watchability: Math.min(Math.max(p.watchability || 6.5, 0), 10),
        goals: 0,
        assists: 0
      })),
      away: aiData.awayStarting.map((p: any) => ({
        name: p.name,
        number: p.number,
        position: p.position,
        watchability: Math.min(Math.max(p.watchability || 6.5, 0), 10),
        goals: 0,
        assists: 0
      })),
      bench: {
        home: aiData.homeBench.map((p: any) => ({
          name: p.name,
          number: p.number,
          position: p.position,
          watchability: Math.min(Math.max(p.watchability || 5.5, 0), 10),
          goals: 0,
          assists: 0
        })),
        away: aiData.awayBench.map((p: any) => ({
          name: p.name,
          number: p.number,
          position: p.position,
          watchability: Math.min(Math.max(p.watchability || 5.5, 0), 10),
          goals: 0,
          assists: 0
        }))
      },
      homeFormation: aiData.homeFormation || '4-3-3',
      awayFormation: aiData.awayFormation || '4-3-3',
      confidence: aiData.confidence || 'medium',
      isPredicted: true
    };

    // Cache the predicted lineups
    localStorage.setItem(cacheKey, JSON.stringify({
      data: predicted,
      timestamp: Date.now()
    }));

    console.log(`✅ Predicted lineups generated (confidence: ${predicted.confidence})`);
    return predicted;
  } catch (error) {
    console.error('❌ Failed to generate predicted lineups:', error);
    return null;
  }
};

/**
 * Calculate overall lineup watchability score
 */
export const calculateLineupWatchability = (
  homeLineup: LineupPlayer[],
  awayLineup: LineupPlayer[]
): number => {
  const allPlayers = [...homeLineup, ...awayLineup];

  if (allPlayers.length === 0) return 5.0;

  // Calculate average watchability
  const avgWatchability = allPlayers.reduce((sum, p) => sum + (p.watchability || 6.5), 0) / allPlayers.length;

  // Find star players (watchability >= 8.5)
  const starPlayers = allPlayers.filter(p => (p.watchability || 0) >= 8.5).length;

  // Base score from average
  let score = avgWatchability;

  // Bonus for star players (up to +1.5)
  score += Math.min(starPlayers * 0.3, 1.5);

  return Math.min(Math.max(score, 0), 10);
};
