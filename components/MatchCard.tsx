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

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick, onLog, hoverEffect = true }) => {
  const isMatch = match.type === 'MATCH';
  const m = isMatch ? (match as Match) : null;
  const isLive = m?.status === 'LIVE';
  
  // Watchability logic
  const watchScore = m?.watchability || 0;
  const mustWatch = checkMustWatch(watchScore);

  return (
    <div 
      onClick={() => onClick(match.id)}
      className={`group relative flex flex-col gap-2 cursor-pointer ${hoverEffect ? 'hover:-translate-y-1 transition duration-300' : ''}`}
    >
      {/* Gradient Background Container */}
      <div className={`relative aspect-[16/9] rounded-lg overflow-hidden border shadow-md transition group-hover:shadow-pitch-900/20
          ${mustWatch ? 'border-orange-500/50 shadow-orange-900/20' : 'border-dark-700 group-hover:border-pitch-600/50'}`}>
        <div
          style={{ background: match.image }}
          className="absolute inset-0 opacity-40 group-hover:opacity-50 transition duration-500"
        />

        {/* Overlay gradient for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

        {/* Live Indicator or Score */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            {isMatch && m?.minute && (
                <span className={`px-2 py-0.5 rounded text-xs font-bold shadow-sm flex items-center gap-1 ${isLive ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                    {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                    {m.minute}
                </span>
            )}
            
            {/* Watchability Badge */}
            {isMatch && watchScore > 0 && (
                <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-white shadow-lg flex items-center gap-1 ${getScoreBadgeColor(watchScore)}`}>
                    {mustWatch ? <Flame size={10} className="text-yellow-200 fill-yellow-200 animate-pulse" /> : <Eye size={10} />}
                    {mustWatch ? 'MUST WATCH' : 'Watchability'} <span className="bg-black/20 px-1 rounded ml-1">{watchScore.toFixed(1)}</span>
                </div>
            )}
        </div>
        
        {/* Score Overlay (Centered) */}
        {isMatch && m?.score && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-white/10">
             <span className="text-white font-mono font-bold text-lg tracking-widest">{m.score}</span>
          </div>
        )}

        {/* Hover Overlay Action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/40 backdrop-blur-[1px]">
           <Activity size={32} className="text-white drop-shadow-lg" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col">
        <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold text-gray-100 leading-tight group-hover:text-pitch-400 transition line-clamp-2">
                {match.name}
            </h3>
        </div>
        
        {/* Latest Events Ticker */}
        {isMatch && m?.events && m.events.length > 0 && (
          <div className="mt-1 flex flex-col gap-1">
             {m.events.slice(-1).map((event, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-pitch-400 animate-in slide-in-from-left-2 fade-in duration-300">
                    {event.type === 'GOAL' ? <Goal size={12} /> : <CreditCard size={12} />}
                    <span className="font-bold">{event.minute}</span>
                    <span className="truncate max-w-[120px]">{event.player} ({event.team === 'HOME' ? m.homeTeam.substring(0,3) : m.awayTeam.substring(0,3)})</span>
                </div>
             ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-1">
             <span className="text-xs text-gray-500 truncate max-w-[70%]">{match.subtitle}</span>
             {match.rating ? (
                 <div className="flex items-center gap-1">
                     <StarRating rating={match.rating} size={10} maxRating={1} />
                     <span className="text-xs text-gray-400">{match.rating.toFixed(1)}</span>
                 </div>
             ) : (
                <span className="text-[10px] text-gray-600 uppercase font-bold">Not Rated</span>
             )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MatchCard);