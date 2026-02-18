import React from 'react';
import { Entity, Match } from '../types';
import StarRating from './StarRating';
import { Eye, Activity, Goal, CreditCard, Flame } from 'lucide-react';
import { getScoreBadgeColor, isMustWatch as checkMustWatch } from '../utils/scoreUtils';

interface MatchCardProps {
  match: Entity;
  onClick: (id: string) => void;
  onLog?: (e: React.MouseEvent) => void;
  hoverEffect?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick, hoverEffect = true }) => {
  const isMatch = match.type === 'MATCH';
  const m = isMatch ? (match as Match) : null;
  const isLive = m?.status === 'LIVE';
  const watchScore = m?.watchability || 0;
  const mustWatch = checkMustWatch(watchScore);

  return (
    <div
      onClick={() => onClick(match.id)}
      className={`group relative flex flex-col gap-2 cursor-pointer ${hoverEffect ? 'hover:-translate-y-1 transition duration-300' : ''}`}
    >
      <div className={`relative aspect-[16/10] rounded-xl overflow-hidden border transition ${
        mustWatch ? 'border-orange-500/40' : 'border-white/[0.06] group-hover:border-white/[0.12]'
      }`}>
        <div style={{ background: match.image }} className="absolute inset-0 opacity-30 group-hover:opacity-40 transition duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {isMatch && m?.minute && (
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 ${isLive ? 'bg-red-600 text-white' : 'bg-zinc-800/80 text-zinc-300'}`}>
              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              {m.minute}
            </span>
          )}
          {isMatch && watchScore > 0 && (
            <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase text-white flex items-center gap-1 ${getScoreBadgeColor(watchScore)}`}>
              {mustWatch ? <Flame size={10} className="text-yellow-200 fill-yellow-200" /> : <Eye size={10} />}
              {watchScore.toFixed(1)}
            </div>
          )}
        </div>

        {isMatch && m?.score && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
            <span className="text-white font-mono font-bold text-lg tracking-widest">{m.score}</span>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/40">
          <Activity size={28} className="text-white drop-shadow-lg" />
        </div>
      </div>

      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-zinc-200 leading-tight group-hover:text-pitch-400 transition line-clamp-2">{match.name}</h3>
        {isMatch && m?.events && m.events.length > 0 && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
            {m.events.slice(-1).map((event, idx) => (
              <React.Fragment key={idx}>
                {event.type === 'GOAL' ? <Goal size={11} className="text-emerald-400" /> : <CreditCard size={11} className="text-amber-400" />}
                <span className="font-mono text-[10px]">{event.minute}'</span>
                <span className="truncate">{event.player}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-zinc-500 truncate max-w-[70%]">{match.subtitle}</span>
          {match.rating ? (
            <div className="flex items-center gap-1">
              <StarRating rating={match.rating} size={10} maxRating={1} />
              <span className="text-xs text-zinc-400">{match.rating.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-[10px] text-zinc-600 uppercase font-semibold">Unrated</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MatchCard);
