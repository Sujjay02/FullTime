
import { GoogleGenAI, Type } from "@google/genai";
import { Entity, EntityType, Match, MatchStatus, League } from "../types";
import { getGenericImage } from "../constants";

// Initialize Gemini API client with Vite env vars
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: geminiApiKey });
const modelName = "gemini-3-flash-preview";

const normalizeLeague = (input: string): string => {
  if (!input) return 'Unknown League';
  const l = input.toLowerCase();
  if (l.includes('premier') || l.includes('epl')) return League.PREMIER_LEAGUE;
  if (l.includes('la liga') || l.includes('laliga')) return League.LA_LIGA;
  if (l.includes('bundesliga')) return League.BUNDESLIGA;
  if (l.includes('serie a')) return League.SERIE_A;
  if (l.includes('ligue 1')) return League.LIGUE_1;
  if (l.includes('champions')) return League.CHAMPIONS_LEAGUE;
  return input;
};

const handleApiError = (error: any, context: string): never => {
  console.error(`Gemini Error (${context}):`, error);
  throw new Error(`Failed to load ${context}. Please try refreshing.`);
};

export const searchEntities = async (query: string, context: string = ''): Promise<Entity[]> => {
  if (!query || !geminiApiKey) return [];
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Search for soccer entities matching: "${query}". Return a JSON list of 3-6 results.`,
      config: {
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              description: { type: Type.STRING },
            },
            required: ["name", "type", "subtitle"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, index: number) => {
      const id = `gen_${Date.now()}_${index}`;
      return {
        ...item,
        id,
        image: getGenericImage(id + item.name),
        type: item.type.toUpperCase() as EntityType
      };
    });
  } catch (error) {
    handleApiError(error, "Search");
  }
};

export const getLiveMatches = async (): Promise<Match[]> => {
  if (!geminiApiKey) return [];
  try {
    const now = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Search for live soccer scores as of ${now} UTC. Return JSON list.`,
      config: {
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                homeTeam: { type: Type.STRING },
                awayTeam: { type: Type.STRING },
                score: { type: Type.STRING },
                minute: { type: Type.STRING },
                league: { type: Type.STRING },
                status: { type: Type.STRING },
                watchability: { type: Type.NUMBER },
             }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => {
      const id = `m_${item.homeTeam}_${item.awayTeam}`.replace(/\s/g, '').toLowerCase();
      return {
        id,
        name: `${item.homeTeam} vs ${item.awayTeam}`,
        type: 'MATCH',
        homeTeam: item.homeTeam,
        awayTeam: item.awayTeam,
        score: item.score || '0 - 0',
        minute: item.minute || '0\'',
        league: normalizeLeague(item.league),
        status: (item.status?.toUpperCase() as MatchStatus) || 'LIVE',
        image: getGenericImage(id),
        subtitle: `${normalizeLeague(item.league)} • Live`,
        rating: 0,
        watchability: item.watchability || 0,
        events: []
      };
    });
  } catch (error) {
    handleApiError(error, "Live Matches");
  }
};
