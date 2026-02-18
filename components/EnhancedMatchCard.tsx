import React from 'react';
import { Entity, Match } from '../types';
import StarRating from './StarRating';
import { Activity, Goal, CreditCard, Flame, TrendingUp, Eye, Trophy } from 'lucide-react';
import { getScoreBadgeColor, isMustWatch as checkMustWatch } from '../utils/scoreUtils';

interface EnhancedMatchCardProps {
  match: Entity;
  onClick: (id: string) => void;
  onLog?: (e: React.MouseEvent) => void;
  hoverEffect?: boolean;
}

const EnhancedMatchCard: React.FC<EnhancedMatchCardProps> = ({ match, onClick, hoverEffect = true }) => {
  const isMatch = match.type === 'MATCH';
  const m = isMatch ? (match as Match) : null;
  const isLive = m?.status === 'LIVE';
  const isUpcoming = m?.status === 'UPCOMING';
  const watchScore = m?.watchability || 0;
  const mustWatch = checkMustWatch(watchScore);

  const isCupMatch = m?.league && (
    m.league.includes('Cup') || m.league.includes('Champions') || m.league.includes('Europa') || m.league.includes('Copa')
  );

  return (
    <div
      onClick={() => onClick(match.id)}
      className={`group relative flex flex-col gap-2 cursor-pointer ${hoverEffect ? 'hover:-translate-y-1 transition-all duration-300 ease-out' : ''}`}
    >
      {/* Card visual */}
      <div className={`relative aspect-[16/10] rounded-xl overflow-hidden border transition-all duration-300 ${
        mustWatch ? 'border-orange-500/40 shadow-lg shadow-orange-500/10' :
        isLive ? 'border-red-500/40 shadow-lg shadow-red-500/10' :
        'border-white/[0.06] group-hover:border-white/[0.12]'
      }`}>
        {/* Background */}
        <div style={{ background: match.image }} className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isMatch && m?.minute && (
            <div className={`px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm ${
              isLive ? 'bg-red-600/90 text-white' : isUpcoming ? 'bg-blue-600/80 text-white' : 'bg-zinc-800/80 text-zinc-200'
            }`}>
              {isLive && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
              )}
              <span className="font-mono">{m.minute}</span>
            </div>
          )}

          {isMatch && watchScore > 0 && (
            <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase text-white flex items-center gap-1 backdrop-blur-sm ${getScoreBadgeColor(watchScore)}`}>
              {mustWatch ? <Flame size={10} className="text-yellow-200 fill-yellow-200" /> : watchScore >= 8 ? <TrendingUp size={10} /> : <Eye size={10} />}
              <span>{mustWatch ? 'MUST SEE' : watchScore >= 8 ? 'HOT' : 'WATCH'}</span>
              <span className="bg-black/25 px-1 py-px rounded text-[9px] font-mono">{watchScore.toFixed(1)}</span>
            </div>
          )}

          {isCupMatch && (
            <div className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-violet-600/80 text-violet-100 flex items-center gap-1 backdrop-blur-sm">
              <Trophy size={9} /> CUP
            </div>
          )}
        </div>

        {/* Score */}
        {isMatch && m?.score && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
            <span className="text-white font-mono font-bold text-lg tracking-wider">{m.score}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-1">
            <Activity size={28} className="text-white drop-shadow-lg" />
            <span className="text-white text-[10px] font-bold uppercase tracking-wider">View Details</span>
          </div>
        </div>
      </div>

      {/* Text content */}
      <div className="flex flex-col px-0.5">
        <h3 className="text-sm font-semibold text-zinc-200 leading-tight group-hover:text-pitch-400 transition-colors line-clamp-2">
          {match.name}
        </h3>

        {isMatch && m?.events && m.events.length > 0 && (
          <div className="mt-1.5 flex flex-col gap-0.5">
            {m.events.slice(-2).map((event, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-zinc-400">
                {event.type === 'GOAL' ? <Goal size={11} className="text-emerald-400 shrink-0" /> : <CreditCard size={11} className="text-amber-400 shrink-0" />}
                <span className="font-mono text-[10px] text-zinc-500">{event.minute}'</span>
                <span className="truncate text-[11px]">{event.player}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-1.5 gap-2">
          <span className="text-xs text-zinc-500 truncate flex-1">{match.subtitle}</span>
          {match.rating ? (
            <div className="flex items-center gap-1">
              <StarRating rating={match.rating} size={10} maxRating={1} />
              <span className="text-xs text-amber-400 font-semibold font-mono">{match.rating.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-[10px] text-zinc-600 uppercase font-semibold">Unrated</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMatchCard;
