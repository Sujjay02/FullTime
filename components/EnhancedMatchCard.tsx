/**
 * Enhanced Match Card Component
 * Modern design with animations, live indicators, and better UX
 */

import React, { useState } from 'react';
import { Entity, Match } from '../types';
import StarRating from './StarRating';
import { Eye, Activity, Goal, CreditCard, Flame, TrendingUp, Users, Trophy } from 'lucide-react';
import { getScoreBadgeColor, isMustWatch as checkMustWatch } from '../utils/scoreUtils';

interface EnhancedMatchCardProps {
  match: Entity;
  onClick: (id: string) => void;
  onLog?: (e: React.MouseEvent) => void;
  hoverEffect?: boolean;
}

const EnhancedMatchCard: React.FC<EnhancedMatchCardProps> = ({
  match,
  onClick,
  onLog,
  hoverEffect = true
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isMatch = match.type === 'MATCH';
  const m = isMatch ? (match as Match) : null;
  const isLive = m?.status === 'LIVE';
  const isUpcoming = m?.status === 'UPCOMING';

  // Watchability logic
  const watchScore = m?.watchability || 0;
  const mustWatch = checkMustWatch(watchScore);

  // Check if it's a cup match
  const isCupMatch = m?.league && (
    m.league.includes('Cup') ||
    m.league.includes('Champions') ||
    m.league.includes('Europa') ||
    m.league.includes('Copa')
  );

  return (
    <div
      onClick={() => onClick(match.id)}
      className={`group relative flex flex-col gap-2 cursor-pointer
        ${hoverEffect ? 'hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 ease-out' : ''}`}
    >
      {/* Gradient Background Container with glow effect */}
      <div className={`relative aspect-[16/9] rounded-xl overflow-hidden border shadow-lg transition-all duration-300
          ${mustWatch
            ? 'border-orange-500/60 shadow-orange-500/20 group-hover:shadow-orange-500/40 group-hover:shadow-xl'
            : 'border-dark-700 group-hover:border-pitch-500/50 group-hover:shadow-pitch-500/10'
          }
          ${isLive ? 'ring-2 ring-red-500/50 ring-offset-2 ring-offset-dark-900' : ''}
      `}>
        {/* Background image */}
        <div
          style={{ background: match.image }}
          className={`absolute inset-0 transition-all duration-700 ease-out
            ${imageLoaded ? 'opacity-50' : 'opacity-0'}
            ${hoverEffect ? 'group-hover:opacity-60 group-hover:scale-110' : ''}
          `}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent"></div>

        {/* Radial glow for must-watch matches */}
        {mustWatch && (
          <div className="absolute inset-0 bg-gradient-radial from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        )}

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 items-start z-10">
          {/* Live/Time Indicator */}
          {isMatch && m?.minute && (
            <div className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-sm transition-all duration-300
              ${isLive
                ? 'bg-red-600/90 text-white group-hover:bg-red-500'
                : isUpcoming
                  ? 'bg-blue-600/80 text-white'
                  : 'bg-gray-800/80 text-gray-200'
              }`}>
              {isLive && (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span className="font-mono">{m.minute}</span>
                </>
              )}
              {isUpcoming && (
                <>
                  <Activity size={12} className="animate-pulse" />
                  <span>{m.minute}</span>
                </>
              )}
              {!isLive && !isUpcoming && <span className="font-mono">{m.minute}</span>}
            </div>
          )}

          {/* Watchability Badge */}
          {isMatch && watchScore > 0 && (
            <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase text-white shadow-xl flex items-center gap-1.5 backdrop-blur-md transition-all duration-300 ${getScoreBadgeColor(watchScore)} group-hover:scale-105`}>
              {mustWatch ? (
                <Flame size={11} className="text-yellow-200 fill-yellow-200 animate-pulse" />
              ) : watchScore >= 8 ? (
                <TrendingUp size={11} className="animate-bounce" />
              ) : (
                <Eye size={11} />
              )}
              <span className="truncate max-w-[60px]">
                {mustWatch ? 'MUST SEE' : watchScore >= 8 ? 'HOT' : 'WATCH'}
              </span>
              <span className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-[9px]">
                {watchScore.toFixed(1)}
              </span>
            </div>
          )}

          {/* Cup indicator */}
          {isCupMatch && (
            <div className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-purple-600/80 text-purple-100 flex items-center gap-1 backdrop-blur-sm">
              <Trophy size={10} />
              <span>CUP</span>
            </div>
          )}
        </div>

        {/* Score Overlay (Bottom right) */}
        {isMatch && m?.score && (
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xl px-4 py-1.5 rounded-lg border border-white/10 shadow-lg transition-all duration-300 group-hover:bg-black/80 group-hover:scale-110">
            <span className="text-white font-mono font-bold text-xl tracking-wider drop-shadow-lg">
              {m.score}
            </span>
          </div>
        )}

        {/* Hover Overlay Action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Activity size={40} className="text-white drop-shadow-2xl animate-pulse" />
            <span className="text-white text-xs font-bold uppercase tracking-wider">View Details</span>
          </div>
        </div>

        {/* Bottom gradient for text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none"></div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col px-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-bold text-gray-100 leading-tight group-hover:text-pitch-300 transition-colors duration-200 line-clamp-2 flex-1">
            {match.name}
          </h3>
        </div>

        {/* Latest Events Ticker */}
        {isMatch && m?.events && m.events.length > 0 && (
          <div className="mt-1.5 flex flex-col gap-1">
            {m.events.slice(-2).map((event, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-xs text-pitch-400 bg-dark-800/40 px-2 py-1 rounded-md animate-in slide-in-from-left-2 fade-in duration-500 hover:bg-dark-800/60 transition-colors"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {event.type === 'GOAL' ? (
                  <Goal size={12} className="text-green-400 flex-shrink-0" />
                ) : (
                  <CreditCard size={12} className="text-yellow-400 flex-shrink-0" />
                )}
                <span className="font-bold font-mono text-[10px]">{event.minute}'</span>
                <span className="truncate text-[11px]">
                  {event.player} <span className="text-gray-500">({event.team === 'HOME' ? m.homeTeam.substring(0,3).toUpperCase() : m.awayTeam.substring(0,3).toUpperCase()})</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom row: subtitle and rating */}
        <div className="flex justify-between items-center mt-2 gap-2">
          <span className="text-xs text-gray-500 truncate flex-1 font-medium">
            {match.subtitle}
          </span>
          {match.rating ? (
            <div className="flex items-center gap-1.5 bg-dark-800/50 px-2 py-0.5 rounded-md">
              <StarRating rating={match.rating} size={11} maxRating={1} />
              <span className="text-xs text-yellow-400 font-bold font-mono">
                {match.rating.toFixed(1)}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-gray-600 uppercase font-bold tracking-wide">
              Not Rated
            </span>
          )}
        </div>
      </div>

      {/* Subtle border glow effect */}
      <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100
        ${mustWatch
          ? 'shadow-[0_0_20px_rgba(249,115,22,0.3)]'
          : 'shadow-[0_0_15px_rgba(132,204,22,0.2)]'
        }`}
      />
    </div>
  );
};

export default EnhancedMatchCard;
