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
            <div className="relative aspect-[16/10] rounded-xl bg-dark-800 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 bg-[length:200%_100%] animate-shimmer" />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <div className="h-5 w-14 bg-dark-700 rounded-md" />
                <div className="h-5 w-24 bg-dark-700 rounded-md" />
              </div>
            </div>
            <div className="mt-2.5 space-y-1.5">
              <div className="h-4 bg-dark-800 rounded w-3/4" />
              <div className="h-3 bg-dark-800 rounded w-1/2" />
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
          <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl">
            <div className="h-12 w-12 bg-dark-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-dark-700 rounded w-3/4" />
              <div className="h-3 bg-dark-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {skeletons.map((i) => (
        <div key={i} className="animate-pulse p-4 bg-dark-800/30 rounded-xl">
          <div className="space-y-3">
            <div className="h-4 bg-dark-700 rounded w-1/4" />
            <div className="h-3 bg-dark-800 rounded w-3/4" />
          </div>
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
