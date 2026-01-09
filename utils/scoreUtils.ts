/**
 * Utility functions for watchability score color coding
 */

/**
 * Get text color class based on watchability score
 */
export const getScoreTextColor = (score: number): string => {
  if (score > 10) return 'text-pitch-400';
  if (score > 6) return 'text-yellow-400';
  return 'text-gray-400';
};

/**
 * Get background gradient class for watchability badge
 */
export const getScoreBadgeColor = (score: number): string => {
  if (score > 12) return 'bg-gradient-to-r from-orange-500 to-red-600';
  if (score > 8) return 'bg-pitch-600';
  return 'bg-gray-600';
};

/**
 * Get progress bar background color
 */
export const getProgressBarColor = (score: number): string => {
  if (score > 10) return 'bg-pitch-500';
  if (score > 6) return 'bg-yellow-500';
  return 'bg-gray-600';
};

/**
 * Check if match is must-watch based on score
 */
export const isMustWatch = (score: number): boolean => {
  return score > 12;
};
