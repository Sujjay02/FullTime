/**
 * Loading Skeleton Component
 * Modern shimmer loading animations
 */

import React from 'react';

interface LoadingSkeletonProps {
  type?: 'match' | 'player' | 'list';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'match', count = 4 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'match') {
    return (
      <>
        {skeletons.map((i) => (
          <div key={i} className="animate-pulse">
            {/* Image skeleton */}
            <div className="relative aspect-[16/9] rounded-lg bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 bg-[length:200%_100%] animate-shimmer overflow-hidden">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>

              {/* Badge skeleton */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <div className="h-5 w-16 bg-dark-600 rounded"></div>
                <div className="h-5 w-28 bg-dark-600 rounded"></div>
              </div>

              {/* Score skeleton */}
              <div className="absolute bottom-2 right-2 h-8 w-20 bg-dark-600/60 rounded"></div>
            </div>

            {/* Text skeleton */}
            <div className="mt-2 space-y-2">
              <div className="h-4 bg-dark-700 rounded w-3/4"></div>
              <div className="h-3 bg-dark-800 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'player') {
    return (
      <>
        {skeletons.map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg">
            <div className="h-12 w-12 bg-dark-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-dark-700 rounded w-3/4"></div>
              <div className="h-3 bg-dark-800 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  // List type
  return (
    <>
      {skeletons.map((i) => (
        <div key={i} className="animate-pulse p-4 bg-dark-800/30 rounded-lg">
          <div className="space-y-3">
            <div className="h-4 bg-dark-700 rounded w-1/4"></div>
            <div className="h-3 bg-dark-800 rounded w-3/4"></div>
            <div className="h-3 bg-dark-800 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
