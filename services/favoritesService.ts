/**
 * Favorites Service
 * Manages user's favorite teams and personalized content
 */

import { db, collection, doc, setDoc, getDoc, updateDoc } from './firebase';

export interface UserFavorites {
  teams: string[]; // Team names
  players: string[]; // Player IDs
  leagues: string[]; // League names
}

/**
 * Get user's favorites from Firestore
 */
export const getUserFavorites = async (userId: string): Promise<UserFavorites> => {
  try {
    const docRef = doc(db, 'favorites', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserFavorites;
    }

    // Return empty favorites if none exist
    return {
      teams: [],
      players: [],
      leagues: []
    };
  } catch (error) {
    console.error('Failed to get favorites:', error);
    return {
      teams: [],
      players: [],
      leagues: []
    };
  }
};

/**
 * Save user's favorites to Firestore
 */
export const saveUserFavorites = async (userId: string, favorites: UserFavorites): Promise<void> => {
  try {
    const docRef = doc(db, 'favorites', userId);
    await setDoc(docRef, favorites, { merge: true });
    console.log('✅ Favorites saved');
  } catch (error) {
    console.error('Failed to save favorites:', error);
    throw error;
  }
};

/**
 * Add a team to favorites
 */
export const addFavoriteTeam = async (userId: string, teamName: string): Promise<void> => {
  try {
    const favorites = await getUserFavorites(userId);

    if (!favorites.teams.includes(teamName)) {
      favorites.teams.push(teamName);
      await saveUserFavorites(userId, favorites);
    }
  } catch (error) {
    console.error('Failed to add favorite team:', error);
    throw error;
  }
};

/**
 * Remove a team from favorites
 */
export const removeFavoriteTeam = async (userId: string, teamName: string): Promise<void> => {
  try {
    const favorites = await getUserFavorites(userId);
    favorites.teams = favorites.teams.filter(t => t !== teamName);
    await saveUserFavorites(userId, favorites);
  } catch (error) {
    console.error('Failed to remove favorite team:', error);
    throw error;
  }
};

/**
 * Check if a team is favorited
 */
export const isFavoriteTeam = (favorites: UserFavorites, teamName: string): boolean => {
  return favorites.teams.includes(teamName);
};

/**
 * Add a player to favorites
 */
export const addFavoritePlayer = async (userId: string, playerId: string): Promise<void> => {
  try {
    const favorites = await getUserFavorites(userId);

    if (!favorites.players.includes(playerId)) {
      favorites.players.push(playerId);
      await saveUserFavorites(userId, favorites);
    }
  } catch (error) {
    console.error('Failed to add favorite player:', error);
    throw error;
  }
};

/**
 * Remove a player from favorites
 */
export const removeFavoritePlayer = async (userId: string, playerId: string): Promise<void> => {
  try {
    const favorites = await getUserFavorites(userId);
    favorites.players = favorites.players.filter(p => p !== playerId);
    await saveUserFavorites(userId, favorites);
  } catch (error) {
    console.error('Failed to remove favorite player:', error);
    throw error;
  }
};

/**
 * Check if a player is favorited
 */
export const isFavoritePlayer = (favorites: UserFavorites, playerId: string): boolean => {
  return favorites.players.includes(playerId);
};
