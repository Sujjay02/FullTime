import React from 'react';
import { Entity } from '../types';
import { TrendingUp, Flame } from 'lucide-react';

interface EnhancedPlayerCardProps {
  player: Entity;
  onClick: (player: Entity) => void;
}

const getInitials = (name: string): string => {
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getGradient = (name: string): string => {
  const gradients = [
    'from-emerald-600 to-emerald-800', 'from-blue-600 to-blue-800', 'from-violet-600 to-violet-800',
    'from-orange-600 to-orange-800', 'from-rose-600 to-rose-800', 'from-teal-600 to-teal-800',
    'from-amber-600 to-amber-800', 'from-pink-600 to-pink-800',
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

const EnhancedPlayerCard: React.FC<EnhancedPlayerCardProps> = ({ player, onClick }) => {
  const initials = getInitials(player.name);
  const gradient = getGradient(player.name);
  const watchability = player.watchability || 0;
  const isHotPlayer = watchability >= 8.5;

  return (
    <div onClick={() => onClick(player)} className="cursor-pointer group relative">
      <div className="bg-dark-800 rounded-xl p-4 border border-white/[0.06] hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1">
        {isHotPlayer && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-orange-500/90 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-0.5">
              <Flame size={9} className="fill-yellow-200 text-yellow-200" /> HOT
            </div>
          </div>
        )}

        <div className="relative mb-3">
          <div className={`aspect-square rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-105 transition-transform duration-300`}>
            {initials}
          </div>
          {watchability >= 7 && (
            <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-pulse" />
          )}
        </div>

        <div className="text-center space-y-1.5">
          <div className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">{player.name}</div>
          <div className="text-xs text-zinc-500 truncate">{player.subtitle}</div>

          {typeof player.stats === 'object' && player.stats && 'goals' in player.stats && (
            <div className="flex justify-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-700/40">
                <span className="text-emerald-400 font-bold">{player.stats.goals}</span>
                <span className="text-zinc-500">G</span>
              </div>
              <div className="flex items-center gap-1 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-700/40">
                <span className="text-blue-400 font-bold">{player.stats.assists}</span>
                <span className="text-zinc-500">A</span>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-2 items-center">
            {player.rating && (
              <div className="px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded text-xs font-semibold text-amber-300">
                {player.rating.toFixed(1)}
              </div>
            )}
            {watchability >= 7 && (
              <div className="px-1.5 py-0.5 bg-orange-500/15 border border-orange-500/30 rounded text-xs font-semibold text-orange-300 flex items-center gap-0.5">
                <TrendingUp size={9} /> {watchability.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPlayerCard;
