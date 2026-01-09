/**
 * Hybrid Football Service
 * Combines real API data with AI-powered analysis for best accuracy
 */

import { Match } from '../types';
import { fetchTodaysMatches } from './footballDataApi';
import { GoogleGenAI, Type } from "@google/genai";
import { getCachedData, setCachedData } from './cacheService';

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });
const modelName = "gemini-3-flash-preview";

/**
 * Enrich real match data with AI-powered watchability analysis
 */
const enrichMatchWithAI = async (match: Match): Promise<Match> => {
  if (!apiKey) return match;

  try {
    const prompt = `Analyze this football match and provide a watchability score (0-10) and brief reason:

Match: ${match.name}
League: ${match.league}
Status: ${match.status}
Score: ${match.score}
${match.minute ? `Time: ${match.minute}` : ''}

Consider:
- Match importance and stakes
- Team quality and rivalry
- Current score excitement
- League competitiveness

Return JSON with: { "watchability": number, "reason": string }`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            watchability: { type: Type.NUMBER },
            reason: { type: Type.STRING }
          }
        }
      }
    });

    const analysis = JSON.parse(response.text || '{"watchability": 7.0, "reason": "Standard match"}');

    return {
      ...match,
      watchability: analysis.watchability,
      description: analysis.reason
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return match;
  }
};

/**
 * Get today's matches with AI-enhanced watchability scores
 * Uses real API data + AI analysis
 */
export const getHybridLiveMatches = async (leagueName?: string): Promise<Match[]> => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const cacheKey = `hybrid_live_${dateStr}_${leagueName || 'all'}`;

  // Check cache first
  const cached = getCachedData<Match[]>(cacheKey);
  if (cached) {
    console.log(`✅ Hybrid cache hit: ${cacheKey}`);
    return cached;
  }

  try {
    // Step 1: Fetch real match data from API
    console.log('📡 Fetching real match data from API...');
    let matches = await fetchTodaysMatches();

    if (matches.length === 0) {
      console.log('⚠️ No API data, falling back to AI-only mode');
      // Fallback to AI-only if API fails
      return [];
    }

    // Step 2: Filter by league if specified
    if (leagueName) {
      matches = matches.filter(m => m.league === leagueName);
    }

    // Step 3: Enrich with AI analysis (in batches to avoid rate limits)
    console.log(`🤖 Enriching ${matches.length} matches with AI analysis...`);

    // Process in batches of 3 to avoid rate limits
    const enrichedMatches: Match[] = [];
    for (let i = 0; i < matches.length; i += 3) {
      const batch = matches.slice(i, i + 3);
      const enrichedBatch = await Promise.all(
        batch.map(match => enrichMatchWithAI(match))
      );
      enrichedMatches.push(...enrichedBatch);

      // Small delay between batches
      if (i + 3 < matches.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Cache for 30 minutes (shorter than before since we have real data)
    setCachedData(cacheKey, enrichedMatches, 1800);
    console.log(`✅ Hybrid matches ready: ${enrichedMatches.length} with AI analysis`);

    return enrichedMatches;
  } catch (error) {
    console.error('❌ Hybrid service error:', error);
    return [];
  }
};

/**
 * Calculate watchability for a batch of matches (more efficient)
 */
export const batchAnalyzeWatchability = async (matches: Match[]): Promise<Match[]> => {
  if (!apiKey || matches.length === 0) return matches;

  try {
    const matchesData = matches.map(m => ({
      name: m.name,
      league: m.league,
      status: m.status,
      score: m.score,
      minute: m.minute
    }));

    const prompt = `Analyze these ${matches.length} football matches and rate their watchability (0-10):

${JSON.stringify(matchesData, null, 2)}

For each match, consider:
- Match importance
- Team quality
- Score excitement
- League prestige

Return array of { "matchIndex": number, "watchability": number, "reason": string }`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              matchIndex: { type: Type.NUMBER },
              watchability: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            }
          }
        }
      }
    });

    const analyses = JSON.parse(response.text || '[]');

    return matches.map((match, index) => {
      const analysis = analyses.find((a: any) => a.matchIndex === index);
      if (analysis) {
        return {
          ...match,
          watchability: analysis.watchability,
          description: analysis.reason
        };
      }
      return match;
    });
  } catch (error) {
    console.error('Batch analysis error:', error);
    return matches;
  }
};
