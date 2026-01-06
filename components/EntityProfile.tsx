import React from 'react';
import { Entity, Review, Match } from '../types';
import StarRating from './StarRating';
import { Trophy, TrendingUp, Newspaper, Users, Goal, Footprints, Shirt, Activity, Star, MapPin, User, Shield } from 'lucide-react';

interface EntityProfileProps {
  entity: Entity;
  reviews: Review[];
  onRate: (e: React.MouseEvent) => void;
}

const getStatIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('goal')) return <Goal size={16} className="text-pitch-500" />;
  if (l.includes('assist')) return <Footprints size={16} className="text-blue-400" />;
  if (l.includes('appearance') || l.includes('match') || l.includes('played')) return <Shirt size={16} className="text-orange-400" />;
  if (l.includes('rating') || l.includes('point')) return <Star size={16} className="text-yellow-400" />;
  if (l.includes('stadium') || l.includes('venue') || l.includes('location')) return <MapPin size={16} className="text-red-400" />;
  if (l.includes('position')) return <TrendingUp size={16} className="text-green-400" />;
  return <Activity size={16} className="text-gray-500" />;
};

const EntityProfile: React.FC<EntityProfileProps> = ({ entity, reviews, onRate }) => {
  const isPersonOrTeam = entity.type === 'PLAYER' || entity.type === 'TEAM' || entity.type === 'MANAGER';
  const match = entity.type === 'MATCH' ? (entity as Match) : null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Backdrop Banner */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-transparent z-10"></div>
        <img src={entity.image} className="w-full h-full object-cover opacity-40 blur-sm" alt="Banner" />
        {entity.imageCredit && (
            <div className="absolute bottom-2 right-4 z-20 text-[10px] text-gray-500 bg-black/50 px-2 py-1 rounded backdrop-blur-md">
                📷 {entity.imageCredit}
            </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32 md:-mt-48 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Poster */}
          <div className="w-48 md:w-64 shrink-0 mx-auto md:mx-0 shadow-2xl rounded-lg overflow-hidden border border-dark-600 bg-dark-800">
            <img src={entity.image} alt={entity.name} className="w-full h-auto object-cover" />
          </div>

          {/* Info Block */}
          <div className="flex-1 text-center md:text-left pt-4 md:pt-16">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-4">
              <h1 className="text-3xl md:text-5xl font-black text-white leading-none">
                {entity.name}
              </h1>
              <span className="text-gray-400 text-lg font-light pb-1">
                {entity.subtitle && entity.subtitle.split('•')[0]}
              </span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
              {entity.rating && (
                <div className="flex items-center gap-2">
                  <StarRating rating={entity.rating} size={20} />
                  <span className="text-gray-300 font-medium">{entity.rating.toFixed(1)}</span>
                </div>
              )}
              <div className="text-xs font-bold text-gray-500 border border-gray-700 px-2 py-1 rounded uppercase">
                {entity.type}
              </div>
            </div>

            {/* Stats Grid (Specific to Teams/Players) */}
            {entity.stats && entity.stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {entity.stats.map((stat, idx) => (
                  <div key={idx} className="bg-dark-800/50 border border-dark-700 rounded p-3 backdrop-blur-sm flex flex-col justify-between h-full">
                    <div className="flex items-center gap-2 mb-1">
                       {getStatIcon(stat.label)}
                       <div className="text-xs text-gray-400 uppercase font-bold truncate" title={stat.label}>{stat.label}</div>
                    </div>
                    <div className="text-lg md:text-xl font-mono text-white font-bold truncate text-pitch-400">{stat.value}</div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-gray-300 leading-relaxed text-sm md:text-base max-w-3xl mb-8">
              {entity.description || "No description available."}
            </p>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 p-4 bg-dark-800/50 rounded-xl border border-dark-700 backdrop-blur-sm">
              <div className="text-center px-4 border-r border-dark-600">
                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Watched</div>
                <div className="text-white font-mono">1,204</div>
              </div>
              <div className="text-center px-4 border-r border-dark-600">
                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Lists</div>
                <div className="text-white font-mono">342</div>
              </div>
              <button
                onClick={onRate}
                className="bg-pitch-600 hover:bg-pitch-500 text-white font-bold py-2 px-6 rounded-md transition ml-2 shadow-lg shadow-pitch-900/20"
              >
                Rate / Review
              </button>
            </div>
          </div>
        </div>

        {/* STARTING LINEUPS SECTION (Matches Only) */}
        {match && match.lineups && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6 border-b border-dark-700 pb-2">
                <Shield size={20} className="text-pitch-500" />
                <h3 className="text-lg font-bold text-gray-200 uppercase tracking-widest">Starting Lineups</h3>
            </div>
            
            {/* Pitch Container */}
            <div className="bg-pitch-900 border border-pitch-600 rounded-xl p-6 relative overflow-hidden shadow-2xl">
               {/* Pitch Pattern */}
               <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49px,#ffffff10_49px,#ffffff10_51px,transparent_51px),linear-gradient(#ffffff05_1px,transparent_1px)] bg-[size:100%_100px,100%_100px] pointer-events-none"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/20 rounded-full pointer-events-none"></div>
               <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20 -translate-x-1/2 pointer-events-none"></div>

               <div className="grid grid-cols-2 gap-8 relative z-10">
                   {/* Home Team */}
                   <div className="text-center sm:text-left">
                       <h4 className="text-white font-black text-xl mb-4 drop-shadow-md flex items-center gap-2">
                          <span className="text-pitch-400">HOME</span> {match.homeTeam}
                       </h4>
                       <div className="space-y-2">
                           {match.lineups.home.map((player, idx) => (
                               <div key={idx} className="flex items-center gap-3 group cursor-pointer hover:bg-white/10 p-1.5 rounded transition">
                                   <span className="font-mono text-pitch-300 font-bold w-6 text-right">{idx + 1}</span>
                                   <div className="flex flex-col">
                                       <span className="text-white font-medium text-sm group-hover:text-pitch-300 transition">{player}</span>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>

                   {/* Away Team */}
                   <div className="text-center sm:text-right">
                       <h4 className="text-white font-black text-xl mb-4 drop-shadow-md flex items-center justify-end gap-2">
                          {match.awayTeam} <span className="text-blue-400">AWAY</span>
                       </h4>
                       <div className="space-y-2">
                           {match.lineups.away.map((player, idx) => (
                               <div key={idx} className="flex items-center justify-end gap-3 group cursor-pointer hover:bg-white/10 p-1.5 rounded transition">
                                   <div className="flex flex-col items-end">
                                       <span className="text-white font-medium text-sm group-hover:text-blue-300 transition">{player}</span>
                                   </div>
                                   <span className="font-mono text-blue-300 font-bold w-6 text-left">{idx + 1}</span>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
            </div>
          </div>
        )}

        {/* Content Section: Reviews & News */}
        <div className="mt-16 grid lg:grid-cols-3 gap-12">
          
          {/* Left Column: Reviews */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6 border-b border-dark-700 pb-2">
               <Users size={18} className="text-pitch-500" />
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                 Popular Reviews
               </h3>
            </div>
            
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map(rev => (
                  <div key={rev.id} className="bg-dark-800 p-6 rounded-lg border border-dark-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold">
                        {rev.userName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-200">Review by <span className="text-white">{rev.userName}</span></div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={rev.rating} size={12} />
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed font-serif italic">"{rev.comment}"</p>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm italic py-8 text-center bg-dark-800/30 rounded border border-dark-700/50">
                   No reviews yet. Be the first to review!
                </div>
              )}
            </div>
          </div>

          {/* Right Column: News & Sidebar Info */}
          <div className="space-y-8">
             
             {/* News Feed */}
             {isPersonOrTeam && entity.news && entity.news.length > 0 && (
                <div>
                   <div className="flex items-center gap-2 mb-4 border-b border-dark-700 pb-2">
                      <Newspaper size={18} className="text-pitch-500" />
                      <h3 className="text-xs font-bold text-gray-500 uppercase">Latest News</h3>
                   </div>
                   <div className="space-y-3">
                      {entity.news.map((item, i) => (
                        <div key={i} className="group cursor-pointer bg-dark-800 hover:bg-dark-700 p-3 rounded border border-dark-700 transition">
                           <h4 className="text-sm font-bold text-gray-200 group-hover:text-pitch-400 transition leading-snug mb-1">
                             {item.title}
                           </h4>
                           <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase font-medium">
                              <span>{item.source}</span>
                              <span>{item.date}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             )}

             {/* Details List */}
             <div>
                <div className="flex items-center gap-2 mb-3 border-b border-dark-700 pb-2">
                    <Trophy size={18} className="text-pitch-500" />
                    <h3 className="text-xs font-bold text-gray-500 uppercase">Information</h3>
                </div>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex justify-between border-b border-dark-700 py-1"><span>Type</span> <span className="text-white">{entity.type}</span></li>
                  <li className="flex justify-between border-b border-dark-700 py-1"><span>Season</span> <span className="text-white">2024/2025</span></li>
                  {entity.type === 'MATCH' && (
                     <li className="flex justify-between border-b border-dark-700 py-1"><span>Competition</span> <span className="text-white">League</span></li>
                  )}
                </ul>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityProfile;