/**
 * Team Service
 * Fetches team information, recent matches, and squad data
 */

import { Match, Entity, LineupPlayer } from '../types';
import { GoogleGenAI } from '@google/genai';
import { getGenericImage } from '../constants';

const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const modelName = 'gemini-2.0-flash-exp';

interface TeamData {
  id: string;
  name: string;
  league: string;
  logo: string;
  recentMatches: Match[];
  squad: LineupPlayer[];
  manager: {
    name: string;
    watchability: number;
    nationality: string;
    age: number;
  };
  formation: string;
  avgWatchability: number;
}

/**
 * Get team information using AI
 */
export const getTeamData = async (teamName: string, league?: string): Promise<TeamData | null> => {
  // Check cache first
  const cacheKey = `team_${teamName}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Cache valid for 1 hour
      if (age < 3600000) {
        console.log(`✅ Using cached team data for ${teamName}`);
        return data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  if (!GEMINI_API_KEY) {
    console.warn('⚠️ No Gemini API key for team data');
    return null;
  }

  try {
    const prompt = `You are a professional football/soccer analyst. Provide comprehensive information about a team.

**Team**: ${teamName}
**League**: ${league || 'Unknown'}

**Task**: Provide:
1. Current squad (25-30 key players with positions and watchability)
2. Manager information with watchability rating
3. Last 5 matches with results
4. Typical formation
5. Average team watchability

**Watchability Guidelines**:
- Players: 0-10 based on skill, form, excitement
- Manager: 0-10 based on tactical prowess, achievements, style

**Response Format** (JSON only, no markdown):
{
  "teamId": "team_unique_id",
  "teamName": "${teamName}",
  "league": "${league || 'League'}",
  "logo": "https://example.com/logo.png",
  "formation": "4-3-3",
  "squad": [
    {"name": "Player Name", "number": 1, "position": "GK", "watchability": 7.5},
    ...25-30 players
  ],
  "manager": {
    "name": "Manager Name",
    "watchability": 8.5,
    "nationality": "Country",
    "age": 50
  },
  "recentMatches": [
    {
      "opponent": "Opponent Team",
      "result": "W",
      "score": "3-1",
      "date": "2025-01-05",
      "competition": "League Name"
    },
    ...5 matches
  ],
  "avgWatchability": 7.2
}

Respond ONLY with valid JSON, no other text.`;

    console.log(`🤖 Generating team data for ${teamName}...`);
    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt
    });
    console.log('📦 AI Response:', result);
    const responseText = result.text || result.response?.text() || '';

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in AI response');
      return null;
    }

    const aiData = JSON.parse(jsonMatch[0]);

    // Convert to our format
    const teamData: TeamData = {
      id: aiData.teamId || `team_${teamName.replace(/\s+/g, '_').toLowerCase()}`,
      name: aiData.teamName || teamName,
      league: aiData.league || league || 'League',
      logo: aiData.logo || getGenericImage(`team_${teamName}`),
      formation: aiData.formation || '4-3-3',
      squad: aiData.squad.map((p: any) => ({
        name: p.name,
        number: p.number,
        position: p.position,
        watchability: Math.min(Math.max(p.watchability || 6.5, 0), 10),
        goals: 0,
        assists: 0
      })),
      manager: {
        name: aiData.manager.name,
        watchability: Math.min(Math.max(aiData.manager.watchability || 7.0, 0), 10),
        nationality: aiData.manager.nationality || 'Unknown',
        age: aiData.manager.age || 50
      },
      recentMatches: aiData.recentMatches.map((m: any, idx: number) => ({
        id: `recent_${teamName}_${idx}`,
        name: `${teamName} vs ${m.opponent}`,
        type: 'MATCH' as const,
        homeTeam: m.result === 'W' || m.result === 'D' ? teamName : m.opponent,
        awayTeam: m.result === 'W' || m.result === 'D' ? m.opponent : teamName,
        score: m.score,
        league: m.competition,
        status: 'FT' as const,
        minute: 'FT',
        subtitle: `${m.competition} • ${m.date}`,
        image: getGenericImage(`match_${idx}`),
        watchability: 7.0
      })),
      avgWatchability: Math.min(Math.max(aiData.avgWatchability || 7.0, 0), 10)
    };

    // Cache the team data
    localStorage.setItem(cacheKey, JSON.stringify({
      data: teamData,
      timestamp: Date.now()
    }));

    console.log(`✅ Team data generated for ${teamName}`);
    return teamData;
  } catch (error) {
    console.error(`❌ Failed to get team data for ${teamName}:`, error);
    return null;
  }
};

/**
 * Extract team names from match
 */
export const getTeamNamesFromMatch = (match: Match): { home: string; away: string } => {
  return {
    home: match.homeTeam,
    away: match.awayTeam
  };
};
