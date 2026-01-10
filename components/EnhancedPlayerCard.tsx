/**
 * Enhanced Player Card Component
 * Modern design with initials-based avatars and animations
 */

import React from 'react';
import { Entity } from '../types';
import { TrendingUp, Flame } from 'lucide-react';

interface EnhancedPlayerCardProps {
  player: Entity;
  onClick: (player: Entity) => void;
}

const EnhancedPlayerCard: React.FC<EnhancedPlayerCardProps> = ({ player, onClick }) => {
  // Extract player initials from name
  const getInitials = (name: string): string => {
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Generate gradient based on player name for unique colors
  const getGradient = (name: string): string => {
    const gradients = [
      'from-pitch-600 to-pitch-800',
      'from-blue-600 to-blue-800',
      'from-purple-600 to-purple-800',
      'from-orange-600 to-orange-800',
      'from-red-600 to-red-800',
      'from-green-600 to-green-800',
      'from-yellow-600 to-yellow-800',
      'from-pink-600 to-pink-800',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  const initials = getInitials(player.name);
  const gradient = getGradient(player.name);
  const watchability = player.watchability || 0;
  const isHotPlayer = watchability >= 8.5;

  return (
    <div
      onClick={() => onClick(player)}
      className="cursor-pointer group relative"
    >
      {/* Card Container */}
      <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 hover:border-yellow-500 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-yellow-500/20">

        {/* Hot Player Indicator */}
        {isHotPlayer && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-orange-500/90 text-white px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm">
              <Flame size={10} className="fill-yellow-200 text-yellow-200 animate-pulse" />
              HOT
            </div>
          </div>
        )}

        {/* Avatar with Initials */}
        <div className="relative mb-3">
          <div className={`aspect-square rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {initials}
          </div>

          {/* Watchability Ring */}
          {watchability >= 7 && (
            <div className="absolute inset-0 rounded-full border-2 border-yellow-400/50 animate-pulse"></div>
          )}
        </div>

        {/* Player Info */}
        <div className="text-center space-y-2">
          {/* Name */}
          <div className="text-sm font-bold text-white truncate group-hover:text-yellow-400 transition-colors">
            {player.name}
          </div>

          {/* Subtitle */}
          <div className="text-xs text-gray-400 truncate">
            {player.subtitle}
          </div>

          {/* Stats */}
          {typeof player.stats === 'object' && 'goals' in player.stats && (
            <div className="flex justify-center gap-3 text-xs">
              <div className="flex items-center gap-1 bg-pitch-900/50 px-2 py-1 rounded border border-pitch-700">
                <span className="text-pitch-400 font-black">{player.stats.goals}</span>
                <span className="text-gray-500 font-medium">G</span>
              </div>
              <div className="flex items-center gap-1 bg-blue-900/50 px-2 py-1 rounded border border-blue-700">
                <span className="text-blue-400 font-black">{player.stats.assists}</span>
                <span className="text-gray-500 font-medium">A</span>
              </div>
            </div>
          )}

          {/* Rating & Watchability */}
          <div className="flex justify-center gap-2 items-center">
            {player.rating && (
              <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded text-xs font-bold text-yellow-300 flex items-center gap-1">
                <span>{player.rating.toFixed(1)}</span>
                <span className="text-[10px]">⭐</span>
              </div>
            )}

            {watchability >= 7 && (
              <div className="px-2 py-1 bg-orange-500/20 border border-orange-500/50 rounded text-xs font-bold text-orange-300 flex items-center gap-1">
                <TrendingUp size={10} />
                <span>{watchability.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-yellow-500/0 via-yellow-500/0 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default EnhancedPlayerCard;
