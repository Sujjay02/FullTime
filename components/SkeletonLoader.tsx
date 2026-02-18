import React from 'react';

export const MatchCardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="aspect-[16/10] rounded-xl bg-dark-800" />
    <div className="mt-2 space-y-1.5">
      <div className="h-4 bg-dark-800 rounded w-3/4" />
      <div className="h-3 bg-dark-800 rounded w-1/2" />
    </div>
  </div>
);

export const PlayerCardSkeleton: React.FC = () => (
  <div className="animate-pulse bg-dark-800 rounded-xl p-4 border border-white/[0.06]">
    <div className="aspect-square rounded-full bg-dark-700 mb-3" />
    <div className="space-y-1.5">
      <div className="h-4 bg-dark-700 rounded mx-auto w-2/3" />
      <div className="h-3 bg-dark-700 rounded mx-auto w-1/2" />
    </div>
  </div>
);

export default MatchCardSkeleton;
