import { GoogleGenAI, Type } from "@google/genai";
import { Entity, EntityType, Match, MatchStatus, League } from "../types";

// Helper to ensure we have a valid key (safe for client-side demo if env is set, 
// though typically this should be proxy-hidden in prod).
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const modelName = "gemini-3-flash-preview";

// Helper to normalize league names to match our Enum
const normalizeLeague = (input: string): string => {
  if (!input) return 'Unknown League';
  const l = input.toLowerCase();
  if (l.includes('premier') || l.includes('epl')) return League.PREMIER_LEAGUE;
  if (l.includes('la liga') || l.includes('laliga')) return League.LA_LIGA;
  if (l.includes('bundesliga')) return League.BUNDESLIGA;
  if (l.includes('serie a')) return League.SERIE_A;
  if (l.includes('ligue 1')) return League.LIGUE_1;
  if (l.includes('champions')) return League.CHAMPIONS_LEAGUE;
  return input; // Return original if no match, though filtering might not catch it
};

// Date helpers for prompt context
const getDateRange = (daysAgo: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - daysAgo);
    
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `from ${fmt(start)} to ${fmt(end)}`;
};

// Centralized Error Handling
const handleApiError = (error: any, context: string): never => {
  console.error(`Gemini Error (${context}):`, error);
  const msg = error?.message || error?.toString() || "Unknown error";

  // Check for common error signatures
  if (msg.includes("403") || msg.includes("API_KEY") || msg.includes("permission")) {
    throw new Error("Access denied. Please check your API Key configuration.");
  }
  if (msg.includes("429") || msg.includes("quota")) {
    throw new Error("Usage limit exceeded. Please try again later.");
  }
  if (msg.includes("503") || msg.includes("500") || msg.includes("overloaded")) {
    throw new Error("AI Service is temporarily unavailable. Please try again later.");
  }
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("Failed to fetch")) {
    throw new Error("Network connection failed. Please check your internet.");
  }
  
  throw new Error(`Failed to load ${context}. Please try refreshing.`);
};

export const searchEntities = async (query: string, context: string = ''): Promise<Entity[]> => {
  if (!query) return [];
  if (!apiKey) {
    console.warn("No API Key provided for Gemini");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Search for soccer entities matching the query: "${query}".
      
      User Context & Interests: ${context || "General football fan"}.
      
      Ranking Logic:
      1. Analyze the query to infer the intended Entity Type (e.g. "Pep" -> MANAGER, "Anfield" -> TEAM/Venue, "City" -> TEAM).
      2. Prioritize entities that match the User Context (e.g. if user likes "Tactics", boost Managers; if user supports "Liverpool", boost Liverpool players).
      3. Rank remaining results by global popularity and relevance.
      4. Find a real, valid image URL for each entity if possible (from news, wikimedia, etc).
      
      Return a list of 3-6 results.
      Provide a subtitle (e.g., "Manager - Man City" or "Premier League 2023").
      Provide a rough community rating estimation (0-5).`,
      config: {
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              type: { type: Type.STRING }, // Will map to EntityType manually to be safe
              subtitle: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              description: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              imageSource: { type: Type.STRING },
            },
            required: ["name", "type", "subtitle"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    
    // Post-process to ensure IDs and Images (using placeholders if needed)
    return data.map((item: any, index: number) => ({
      ...item,
      id: item.id || `gen_${Date.now()}_${index}`,
      image: item.imageUrl || `https://picsum.photos/seed/${item.name.replace(/\s/g, '')}/400/400`,
      imageCredit: item.imageSource,
      type: item.type.toUpperCase() as EntityType
    }));

  } catch (error) {
    handleApiError(error, "Search");
  }
};

export const getEntityDetails = async (name: string, type: EntityType): Promise<Entity | null> => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Provide a detailed profile for the soccer entity: "${name}" of type "${type}".
      
      1. Biography/Description: Max 100 words.
      2. Community Rating: 0-5.
      3. Key Stats: 
         - If PLAYER: Goals (Current Season), Assists (Current Season), Appearances (Current Season), Nationality, Position.
         - If TEAM: League Position, Points, Stadium, Manager.
         - If MATCH: Venue, Attendance.
      4. Latest News: 3 recent headlines about this entity.
      5. Image: Find a specific, high-quality image URL for this entity.
      
      6. IF TYPE IS "MATCH": Find the STARTING LINEUPS (Starting XI) for both the Home and Away teams. 
         If the match is in the future, provide Predicted Lineups.
         Return these in the 'lineups' field with 'home' and 'away' arrays of strings.

      Use Google Search to ensure stats, news, and lineups are current for the 2024/2025 season.`,
      config: {
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            description: { type: Type.STRING },
            rating: { type: Type.NUMBER },
            imageUrl: { type: Type.STRING },
            imageSource: { type: Type.STRING },
            stats: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                }
              }
            },
            news: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                   title: { type: Type.STRING },
                   source: { type: Type.STRING },
                   date: { type: Type.STRING },
                }
              }
            },
            lineups: {
                type: Type.OBJECT,
                properties: {
                    home: { type: Type.ARRAY, items: { type: Type.STRING }},
                    away: { type: Type.ARRAY, items: { type: Type.STRING }}
                }
            }
          },
          required: ["name", "description"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      id: `gen_detail_${Date.now()}`,
      type,
      image: data.imageUrl || `https://picsum.photos/seed/${name.replace(/\s/g, '')}/800/600`,
      imageCredit: data.imageSource,
      ...data
    };

  } catch (error) {
    handleApiError(error, "Details");
  }
};

export const getLiveMatches = async (): Promise<Match[]> => {
  if (!apiKey) {
      console.warn("API Key missing, skipping live fetch.");
      return []; 
  }

  try {
    const now = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `It is currently ${now} UTC.
      Perform a Google Search to find real-time soccer scores for matches happening *right now*.
      
      Priority 1: Matches currently in-play (LIVE) in Major European Leagues (Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League).
      Priority 2: Matches currently in-play (LIVE) in other global leagues (e.g., Championship, MLS, Brasileirão, Saudi Pro League).
      Priority 3: If NO matches are live, return the most recent high-profile matches that finished today or are upcoming today.

      Return a JSON list.
      Include score, current minute (e.g. "32'", "HT", "FT"), homeTeam, awayTeam, and key events (goals/red cards).
      
      Also calculate a "Watchability Score" (0-15) for each match using this weighted formula as a guide:
      Score = (Total Goals * 1.5) + (Approx Shots On Target * 0.5) + (Comeback Factor [0-2] * 2) + (Tension Bonus [1-3]).
      
      **IMAGE INSTRUCTION**: Find a high-quality cityscape or landmark image URL of the CITY where the match is taking place (e.g. "Manchester city skyline" or "Madrid architecture"). Do not use images of players or close-ups of the stadium.
      
      Format events as an array of objects: { type: 'GOAL'|'CARD', minute: string, player: string, team: 'HOME'|'AWAY' }.
      `,
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
                imageUrl: { type: Type.STRING },
                imageSource: { type: Type.STRING },
                events: {
                   type: Type.ARRAY,
                   items: {
                      type: Type.OBJECT,
                      properties: {
                         type: { type: Type.STRING },
                         minute: { type: Type.STRING },
                         player: { type: Type.STRING },
                         team: { type: Type.STRING },
                      }
                   }
                }
             }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sourceUrl = groundingChunks?.[0]?.web?.uri;

    return data.map((item: any) => ({
      id: `match_${item.homeTeam.replace(/\s/g, '').toLowerCase()}_vs_${item.awayTeam.replace(/\s/g, '').toLowerCase()}`,
      name: `${item.homeTeam} vs ${item.awayTeam}`,
      type: 'MATCH',
      homeTeam: item.homeTeam,
      awayTeam: item.awayTeam,
      score: item.score || '0 - 0',
      minute: item.minute || '0\'',
      league: normalizeLeague(item.league),
      status: (item.status?.toUpperCase() as MatchStatus) || 'LIVE',
      image: item.imageUrl || `https://picsum.photos/seed/${item.homeTeam.replace(/\s/g, '')}vs${item.awayTeam.replace(/\s/g, '')}/800/400`,
      imageCredit: item.imageSource,
      subtitle: `${normalizeLeague(item.league)} • Live`,
      rating: 0,
      watchability: item.watchability || 0,
      events: item.events || [],
      sourceUrl
    }));
  } catch (error) {
    handleApiError(error, "Live Matches");
  }
};

export const getExcitingMatches = async (): Promise<Match[]> => {
  if (!apiKey) return [];

  const range = getDateRange(7);

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Find 4 recent "Must Watch" soccer matches strictly from the last 7 days (${range}) across major leagues (Premier League, La Liga, Bundesliga, Serie A, Champions League).
      Criteria for "Must Watch": High drama, comebacks, upsets, or intense rivalries.
      
      Return a JSON list.
      Include score, homeTeam, awayTeam, league, and specific events that made it exciting.
      Calculate a high Watchability Score (12-15).
      
      **IMAGE INSTRUCTION**: Find a high-quality cityscape or landmark image URL of the CITY where the match is taking place (e.g. "Manchester city skyline" or "Madrid architecture"). Do not use images of players or close-ups of the stadium.
      
      Format events as an array of objects: { type: 'GOAL'|'CARD', minute: string, player: string, team: 'HOME'|'AWAY' }.
      `,
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
                league: { type: Type.STRING },
                watchability: { type: Type.NUMBER },
                summary: { type: Type.STRING, description: "One sentence why it was exciting" },
                imageUrl: { type: Type.STRING },
                imageSource: { type: Type.STRING },
                events: {
                   type: Type.ARRAY,
                   items: {
                      type: Type.OBJECT,
                      properties: {
                         type: { type: Type.STRING },
                         minute: { type: Type.STRING },
                         player: { type: Type.STRING },
                         team: { type: Type.STRING },
                      }
                   }
                }
             }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sourceUrl = groundingChunks?.[0]?.web?.uri;

    return data.map((item: any) => ({
      id: `exciting_${item.homeTeam.replace(/\s/g, '').toLowerCase()}_vs_${item.awayTeam.replace(/\s/g, '').toLowerCase()}`,
      name: `${item.homeTeam} vs ${item.awayTeam}`,
      type: 'MATCH',
      homeTeam: item.homeTeam,
      awayTeam: item.awayTeam,
      score: item.score || 'FT',
      minute: 'FT',
      league: normalizeLeague(item.league),
      status: 'FT' as MatchStatus,
      image: item.imageUrl || `https://picsum.photos/seed/${item.homeTeam.replace(/\s/g, '')}vs${item.awayTeam.replace(/\s/g, '')}exciting/800/400`,
      imageCredit: item.imageSource,
      subtitle: item.summary || `${normalizeLeague(item.league)} • Thriller`,
      rating: 4.5 + (Math.random() * 0.5), 
      watchability: item.watchability || 13,
      events: item.events || [],
      sourceUrl
    }));

  } catch (error) {
    handleApiError(error, "Exciting Matches");
  }
};

export const getHighestScoringMatches = async (): Promise<Match[]> => {
  if (!apiKey) return [];

  const range = getDateRange(7);

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Find 4 soccer matches strictly from the last 7 days (${range}) that had the HIGHEST total number of goals scored (sum of home + away goals).
      Search across major leagues (Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League).
      Sort by total goals descending (e.g. 5+ goals preferred).
      
      Return a JSON list.
      Include score, homeTeam, awayTeam, league.
      
      **IMAGE INSTRUCTION**: Find a high-quality cityscape or landmark image URL of the CITY where the match is taking place (e.g. "Manchester city skyline" or "Madrid architecture"). Do not use images of players or close-ups of the stadium.
      
      Format events as an array of objects: { type: 'GOAL'|'CARD', minute: string, player: string, team: 'HOME'|'AWAY' }.
      `,
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
                league: { type: Type.STRING },
                watchability: { type: Type.NUMBER },
                summary: { type: Type.STRING, description: "Short summary like '8 Goal Thriller'" },
                imageUrl: { type: Type.STRING },
                imageSource: { type: Type.STRING },
                events: {
                   type: Type.ARRAY,
                   items: {
                      type: Type.OBJECT,
                      properties: {
                         type: { type: Type.STRING },
                         minute: { type: Type.STRING },
                         player: { type: Type.STRING },
                         team: { type: Type.STRING },
                      }
                   }
                }
             }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sourceUrl = groundingChunks?.[0]?.web?.uri;

    return data.map((item: any) => ({
      id: `high_score_${item.homeTeam.replace(/\s/g, '').toLowerCase()}_vs_${item.awayTeam.replace(/\s/g, '').toLowerCase()}`,
      name: `${item.homeTeam} vs ${item.awayTeam}`,
      type: 'MATCH',
      homeTeam: item.homeTeam,
      awayTeam: item.awayTeam,
      score: item.score || 'FT',
      minute: 'FT',
      league: normalizeLeague(item.league),
      status: 'FT' as MatchStatus,
      image: item.imageUrl || `https://picsum.photos/seed/${item.homeTeam.replace(/\s/g, '')}vs${item.awayTeam.replace(/\s/g, '')}high/800/400`,
      imageCredit: item.imageSource,
      subtitle: item.summary || `${normalizeLeague(item.league)} • Goal Fest`,
      rating: 4.2 + (Math.random() * 0.8), 
      watchability: item.watchability || 12,
      events: item.events || [],
      sourceUrl
    }));

  } catch (error) {
    handleApiError(error, "Highest Scoring");
  }
};