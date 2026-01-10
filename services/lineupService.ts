/**
 * Hybrid Lineup Service
 * Combines real API-Football lineups with Gemini AI enrichment
 * Falls back to predicted lineups when actual lineups unavailable
 */

import { LineupPlayer } from '../types';
import { fetchMatchLineups } from './apiFootballService';
import { enhanceLineupsWithAI } from './enhancedAI';
import { getPredictedLineups, calculateLineupWatchability } from './predictedLineupsService';

interface EnrichedLineups {
  home: LineupPlayer[];
  away: LineupPlayer[];
  bench: {
    home: LineupPlayer[];
    away: LineupPlayer[];
  };
  homeFormation: string;
  awayFormation: string;
  isPredicted?: boolean;
  confidence?: 'high' | 'medium' | 'low';
  lineupWatchability?: number;
}

/**
 * Get real lineups from API-Football and enrich with AI watchability scores
 * Falls back to predicted lineups if actual lineups unavailable
 */
export const getEnrichedLineups = async (
  fixtureId: number,
  homeTeam: string,
  awayTeam: string,
  league?: string
): Promise<EnrichedLineups | null> => {
  // Check cache first (cache for 30 minutes - lineups don't change often)
  const cacheKey = `lineups_${fixtureId}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Cache valid for 30 minutes
      if (age < 1800000) {
        console.log('✅ Using cached lineups');
        return data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  try {
    // Step 1: Try to get real lineups from API-Football
    console.log(`🏟️ Fetching real lineups for fixture ${fixtureId}...`);
    const apiLineups = await fetchMatchLineups(fixtureId);

    if (!apiLineups) {
      console.log('⚠️ No actual lineups available, generating predicted lineups...');

      // Step 1b: Fall back to predicted lineups
      const predicted = await getPredictedLineups(homeTeam, awayTeam, league || 'League');

      if (predicted) {
        const lineupWatchability = calculateLineupWatchability(predicted.home, predicted.away);

        const enrichedLineups = {
          home: predicted.home,
          away: predicted.away,
          bench: predicted.bench,
          homeFormation: predicted.homeFormation,
          awayFormation: predicted.awayFormation,
          isPredicted: true,
          confidence: predicted.confidence,
          lineupWatchability
        };

        // Cache the predicted lineups (shorter cache time)
        localStorage.setItem(cacheKey, JSON.stringify({
          data: enrichedLineups,
          timestamp: Date.now()
        }));

        console.log(`✅ Predicted lineups generated (confidence: ${predicted.confidence}, watchability: ${lineupWatchability.toFixed(1)})`);
        return enrichedLineups;
      }

      return null;
    }

    // Step 2: Enrich actual lineups with Enhanced AI for watchability scores
    console.log('🤖 Enriching actual lineups with AI...');
    const aiEnrichment = await enhanceLineupsWithAI(
      apiLineups.home,
      apiLineups.away,
      homeTeam,
      awayTeam
    );

    let enrichedHome = apiLineups.home;
    let enrichedAway = apiLineups.away;

    if (aiEnrichment) {
      enrichedHome = aiEnrichment.home;
      enrichedAway = aiEnrichment.away;
    } else {
      // AI failed, use defaults
      console.log('⚠️ AI enrichment unavailable, using default scores');
      enrichedHome = apiLineups.home.map(p => ({ ...p, watchability: 6.5, goals: 0, assists: 0 }));
      enrichedAway = apiLineups.away.map(p => ({ ...p, watchability: 6.5, goals: 0, assists: 0 }));
    }

    const lineupWatchability = calculateLineupWatchability(enrichedHome, enrichedAway);

    const enrichedLineups = {
      home: enrichedHome,
      away: enrichedAway,
      bench: {
        home: apiLineups.bench?.home.map(p => ({ ...p, watchability: 5.5 })) || [],
        away: apiLineups.bench?.away.map(p => ({ ...p, watchability: 5.5 })) || []
      },
      homeFormation: apiLineups.formation?.home || '4-3-3',
      awayFormation: apiLineups.formation?.away || '4-3-3',
      isPredicted: false,
      lineupWatchability
    };

    // Cache the enriched lineups
    localStorage.setItem(cacheKey, JSON.stringify({
      data: enrichedLineups,
      timestamp: Date.now()
    }));

    console.log(`✅ Actual lineups enriched successfully (watchability: ${lineupWatchability.toFixed(1)})`);
    return enrichedLineups;
  } catch (error) {
    console.error('❌ Failed to get enriched lineups:', error);
    return null;
  }
};

// Old enrichLineupsWithAI function removed - now using enhancedAI.ts

/**
 * Extract fixture ID from match ID (format: "apif_12345")
 */
export const extractFixtureId = (matchId: string): number | null => {
  const match = matchId.match(/apif_(\d+)/);
  return match ? parseInt(match[1]) : null;
};
