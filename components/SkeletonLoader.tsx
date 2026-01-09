
import React from 'react';

export const MatchCardSkeleton: React.FC = () => (
  <div className="group relative flex flex-col gap-2 animate-pulse">
    <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-dark-700 bg-dark-800">
      <div className="absolute inset-0 bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 bg-[length:200%_100%] animate-shimmer"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-dark-700 rounded w-3/4"></div>
      <div className="h-3 bg-dark-700 rounded w-1/2"></div>
    </div>
  </div>
);

export const EntityProfileSkeleton: React.FC = () => (
  <div className="animate-pulse pb-20">
    {/* Hero Skeleton */}
    <div className="relative h-96 bg-dark-800 border-b border-dark-700">
      <div className="absolute inset-0 bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 bg-[length:200%_100%] animate-shimmer"></div>
    </div>

    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Title Skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-dark-700 rounded w-1/3"></div>
        <div className="h-4 bg-dark-700 rounded w-1/4"></div>
      </div>

      {/* Content Skeleton */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 bg-dark-700 rounded w-1/4"></div>
          <div className="h-4 bg-dark-700 rounded w-full"></div>
          <div className="h-4 bg-dark-700 rounded w-5/6"></div>
          <div className="h-4 bg-dark-700 rounded w-4/6"></div>
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-dark-700 rounded"></div>
          <div className="h-32 bg-dark-700 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export const SearchResultsSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="flex gap-4 p-4 bg-dark-800 border border-dark-700 rounded-lg">
        <div className="w-20 h-28 bg-dark-700 rounded"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-dark-700 rounded w-3/4"></div>
          <div className="h-4 bg-dark-700 rounded w-1/2"></div>
          <div className="h-3 bg-dark-700 rounded w-full"></div>
        </div>
      </div>
    ))}
  </div>
);
