
import React from 'react';
import { Entity, Review, Match, User, MatchEvent, LineupPlayer } from '../types';
import StarRating from './StarRating';
import { Trophy, TrendingUp, Users, Goal, Footprints, Shirt, Activity, Star, MapPin, Shield, Clock, CreditCard, ChevronDown, ListPlus, CheckCircle2, Info } from 'lucide-react';

interface EntityProfileProps {
  entity: Entity;
  reviews: Review[];
  onRate: (e: React.MouseEvent) => void;
  onUserClick?: (user: User) => void;
  onAddToPlaylist?: (matchId: string) => void;
}

const getEventIcon = (type: string, detail?: string) => {
  switch (type) {
    case 'GOAL': return <Goal size={14} className="text-pitch-400" />;
    case 'CARD': return <CreditCard size={14} className={detail?.toLowerCase().includes('red') ? 'text-red-500 fill-red-500' : 'text-yellow-400 fill-yellow-400'} />;
    case 'SUB': return <Activity size={14} className="text-orange-400" />;
    case 'VAR': return <Info size={14} className="text-blue-400" />;
    default: return <Clock size={14} className="text-gray-500" />;
  }
};

const PlayerItem: React.FC<{ player: LineupPlayer; isHome: boolean }> = ({ player, isHome }) => (
  <div className={`flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-1.5 rounded transition ${!isHome && 'flex-row-reverse'} relative`}>
    {/* Stats Tooltip */}
    <div className={`absolute bottom-full mb-2 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200 ${isHome ? 'left-0' : 'right-0'}`}>
       <div className="bg-dark-700 text-white text-[10px] py-1.5 px-3 rounded border border-dark-600 shadow-2xl whitespace-nowrap flex items-center gap-3 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <Goal size={10} className="text-pitch-400" />
            <span className="font-bold">{player.goals || 0}</span>
          </div>
          <div className="w-px h-3 bg-dark-600"></div>
          <div className="flex items-center gap-1">
            <Footprints size={10} className="text-blue-400" />
            <span className="font-bold">{player.assists || 0}</span>
          </div>
          <span className="text-gray-400 uppercase font-bold text-[8px] ml-1">Season</span>
       </div>
       <div className={`w-2 h-2 bg-dark-700 border-r border-b border-dark-600 rotate-45 absolute -bottom-1 ${isHome ? 'left-4' : 'right-4'}`}></div>
    </div>

    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border shrink-0 ${isHome ? 'bg-pitch-900 border-pitch-600 text-pitch-300' : 'bg-dark-800 border-blue-600 text-blue-300'}`}>
      {player.number}
    </div>
    <div className={`flex flex-col min-w-0 ${!isHome && 'items-end'}`}>
      <span className="text-white font-medium text-xs group-hover:text-pitch-300 transition truncate">{player.name}</span>
      <span className="text-[9px] text-gray-500 uppercase font-bold">{player.position}</span>
    </div>
  </div>
);

const LineupGroup = ({ title, players, isHome }: { title: string, players: LineupPlayer[], isHome: boolean }) => {
  if (players.length === 0) return null;
  return (
    <div className="mb-4">
      <div className={`text-[9px] font-black text-gray-500 uppercase tracking-tighter mb-2 border-b border-white/5 pb-1 ${!isHome && 'text-right'}`}>
        {title}
      </div>
      <div className="space-y-1">
        {players.map((p, i) => <PlayerItem key={i} player={p} isHome={isHome} />)}
      </div>
    </div>
  );
};

const EntityProfile: React.FC<EntityProfileProps> = ({ entity, reviews, onRate, onUserClick, onAddToPlaylist }) => {
  const match = entity.type === 'MATCH' ? (entity as Match) : null;
  const isUpcoming = match?.status === 'UPCOMING';
  const isLive = match?.status === 'LIVE' || match?.status === 'HT';

  const groupPlayers = (players: LineupPlayer[]) => {
    return {
      GK: players.filter(p => p.position.includes('GK') || p.position.includes('Goalkeeper')),
      DEF: players.filter(p => ['DEF', 'DF', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'Defender'].some(pos => p.position.includes(pos)) && !p.position.includes('GK')),
      MID: players.filter(p => ['MID', 'MF', 'CM', 'CDM', 'CAM', 'LM', 'RM', 'Midfielder'].some(pos => p.position.includes(pos))),
      FWD: players.filter(p => ['FWD', 'FW', 'ST', 'CF', 'LW', 'RW', 'Forward', 'Striker'].some(pos => p.position.includes(pos)))
    };
  };

  const handleReviewerClick = (rev: Review) => {
    if (onUserClick) {
      onUserClick({
        id: rev.userId,
        name: rev.userName,
        handle: `@${rev.userName.toLowerCase().replace(/\s/g, '')}`,
        avatar: rev.userAvatar || 'https://ui-avatars.com/api/?name=User',
      });
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent z-10"></div>
        <img src={entity.image} className="w-full h-full object-cover opacity-30 blur-sm" alt="Banner" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32 md:-mt-40 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-44 md:w-56 shrink-0 mx-auto md:mx-0 shadow-2xl rounded-lg overflow-hidden border border-dark-600 bg-dark-800">
            <img src={entity.image} alt={entity.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 text-center md:text-left pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-black text-white">{entity.name}</h1>
              <span className="text-gray-400 font-light text-lg">{match?.league}</span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
              {entity.rating ? <StarRating rating={entity.rating} size={18} showValue /> : <span className="text-xs text-gray-500 italic">Be the first to rate</span>}
              <div className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase flex items-center gap-1.5 ${isUpcoming ? 'bg-blue-900/40 border-blue-700/50 text-blue-400' : 'bg-pitch-900/40 border-pitch-700/50 text-pitch-400'}`}>
                {isUpcoming ? <Info size={10}/> : <CheckCircle2 size={10}/>}
                {isUpcoming ? 'Predicted Lineup' : 'Confirmed Squad'}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button onClick={onRate} className="bg-pitch-600 hover:bg-pitch-500 text-white font-bold py-2 px-6 rounded transition shadow-lg shadow-pitch-900/40">
                Rate / Review
              </button>
              {match && (
                <button 
                  onClick={() => onAddToPlaylist?.(match.id)}
                  className="bg-dark-800 hover:bg-dark-700 text-gray-200 font-bold py-2 px-6 rounded border border-dark-700 flex items-center gap-2 transition"
                >
                  <ListPlus size={16} /> Add to List
                </button>
              )}
            </div>
          </div>
        </div>

        {match && (
          <div className="mt-16 space-y-16">
            <div>
              <div className="flex items-center justify-between mb-8 border-b border-dark-700 pb-3">
                <div className="flex items-center gap-2">
                  <Shield size={20} className="text-pitch-500" />
                  <h3 className="text-sm font-black text-gray-200 uppercase tracking-widest">
                    {isUpcoming ? 'Expected Lineups' : 'Official Match Squads'}
                  </h3>
                </div>
                <div className="flex gap-6 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                  <span>Home: <b className="text-pitch-400">{match.formation?.home}</b></span>
                  <span>Away: <b className="text-blue-400">{match.formation?.away}</b></span>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                {/* Home Squad View */}
                <div className="space-y-6">
                   <div className="bg-pitch-900/20 border border-pitch-600/30 rounded-xl p-8 relative overflow-hidden min-h-[500px]">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grass.png')] opacity-5"></div>
                      <div className="relative z-10">
                        <h4 className="text-pitch-400 font-black text-sm uppercase tracking-widest mb-8 border-b border-pitch-600/20 pb-2">{match.homeTeam} XI</h4>
                        {(() => {
                           const grouped = groupPlayers(match.lineups?.home || []);
                           return (
                             <div className="space-y-6">
                               <LineupGroup title="Goalkeeper" players={grouped.GK} isHome={true} />
                               <LineupGroup title="Defenders" players={grouped.DEF} isHome={true} />
                               <LineupGroup title="Midfielders" players={grouped.MID} isHome={true} />
                               <LineupGroup title="Attackers" players={grouped.FWD} isHome={true} />
                             </div>
                           );
                        })()}
                      </div>
                   </div>
                   <div className="bg-dark-800/50 border border-dark-700 p-6 rounded-xl">
                      <h5 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Bench</h5>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                         {match.bench?.home.map((p, i) => (
                           <div key={i} className="flex items-center gap-2">
                             <span className="w-5 h-5 flex items-center justify-center rounded bg-dark-900 border border-dark-700 text-[9px] font-mono text-gray-500">{p.number}</span>
                             <span className="text-[11px] text-gray-300 truncate">{p.name}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                {/* Away Squad View */}
                <div className="space-y-6">
                   <div className="bg-blue-900/10 border border-blue-600/30 rounded-xl p-8 relative overflow-hidden min-h-[500px]">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grass.png')] opacity-5"></div>
                      <div className="relative z-10 text-right">
                        <h4 className="text-blue-400 font-black text-sm uppercase tracking-widest mb-8 border-b border-blue-600/20 pb-2">{match.awayTeam} XI</h4>
                        {(() => {
                           const grouped = groupPlayers(match.lineups?.away || []);
                           return (
                             <div className="space-y-6">
                               <LineupGroup title="Goalkeeper" players={grouped.GK} isHome={false} />
                               <LineupGroup title="Defenders" players={grouped.DEF} isHome={false} />
                               <LineupGroup title="Midfielders" players={grouped.MID} isHome={false} />
                               <LineupGroup title="Attackers" players={grouped.FWD} isHome={false} />
                             </div>
                           );
                        })()}
                      </div>
                   </div>
                   <div className="bg-dark-800/50 border border-dark-700 p-6 rounded-xl">
                      <h5 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4 text-right">Bench</h5>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-right">
                         {match.bench?.away.map((p, i) => (
                           <div key={i} className="flex flex-row-reverse items-center gap-2">
                             <span className="w-5 h-5 flex items-center justify-center rounded bg-dark-900 border border-dark-700 text-[9px] font-mono text-gray-500">{p.number}</span>
                             <span className="text-[11px] text-gray-300 truncate">{p.name}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Chronological Timeline */}
            {!isUpcoming && match.events && match.events.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-2 mb-8 border-b border-dark-700 pb-3">
                  <Clock size={20} className="text-pitch-500" />
                  <h3 className="text-sm font-black text-gray-200 uppercase tracking-widest">Match Timeline</h3>
                </div>
                <div className="relative space-y-4 max-w-3xl mx-auto before:absolute before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-dark-700 before:hidden md:before:block">
                   {match.events.map((ev, i) => (
                     <div key={i} className={`flex items-center gap-4 w-full ${ev.team === 'AWAY' ? 'md:flex-row-reverse' : ''}`}>
                        <div className="hidden md:block w-1/2 text-right">
                           {ev.team === 'HOME' && (
                             <div className="bg-dark-800 border border-dark-700 rounded-lg p-3 inline-flex items-center gap-3">
                                <div>
                                  <div className="text-xs font-bold text-white">{ev.player}</div>
                                  {ev.playerOut && <div className="text-[9px] text-gray-500 uppercase">Off: {ev.playerOut}</div>}
                                </div>
                                <div className="p-2 bg-dark-900 rounded">{getEventIcon(ev.type, ev.detail)}</div>
                             </div>
                           )}
                        </div>
                        
                        <div className="relative z-10 w-12 h-12 rounded-full bg-dark-800 border-2 border-dark-700 flex items-center justify-center font-mono font-black text-pitch-500 text-xs shadow-xl">
                           {ev.minute}
                        </div>

                        <div className="flex-1 md:w-1/2 md:flex-none">
                           {ev.team === 'AWAY' ? (
                             <div className="bg-dark-800 border border-dark-700 rounded-lg p-3 flex items-center gap-3">
                                <div className="p-2 bg-dark-900 rounded">{getEventIcon(ev.type, ev.detail)}</div>
                                <div>
                                  <div className="text-xs font-bold text-white">{ev.player}</div>
                                  {ev.playerOut && <div className="text-[9px] text-gray-500 uppercase">Off: {ev.playerOut}</div>}
                                </div>
                             </div>
                           ) : (
                             <div className="md:hidden bg-dark-800 border border-dark-700 rounded-lg p-3 flex items-center gap-3">
                                <div className="p-2 bg-dark-900 rounded">{getEventIcon(ev.type, ev.detail)}</div>
                                <div>
                                  <div className="text-xs font-bold text-white">{ev.player}</div>
                                  {ev.playerOut && <div className="text-[9px] text-gray-500 uppercase">Off: {ev.playerOut}</div>}
                                </div>
                             </div>
                           )}
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-20">
          <div className="flex items-center gap-2 mb-8 border-b border-dark-700 pb-2">
            <Users size={18} className="text-pitch-500" />
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Community Discussion</h3>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {reviews.length > 0 ? reviews.map(rev => (
              <div key={rev.id} className="bg-dark-800 p-6 rounded-lg border border-dark-700 hover:border-dark-600 transition">
                <div className="flex items-center gap-3 mb-4">
                  <img src={rev.userAvatar} onClick={() => handleReviewerClick(rev)} className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition" alt={rev.userName} />
                  <div>
                    <div className="text-sm font-bold text-white cursor-pointer hover:text-pitch-400 transition" onClick={() => handleReviewerClick(rev)}>{rev.userName}</div>
                    <StarRating rating={rev.rating} size={10} />
                  </div>
                </div>
                <p className="text-gray-300 text-sm italic font-serif leading-relaxed">"{rev.comment}"</p>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center text-gray-500 italic bg-dark-800/30 rounded border border-dashed border-dark-700">
                No reviews yet. Share your tactical analysis!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EntityProfile);
