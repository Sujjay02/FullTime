import React, { useState } from 'react';
import { User, Review, Playlist, Match } from '../types';
import StarRating from './StarRating';
import { Edit2, List, ListVideo, Play } from 'lucide-react';

interface UserProfileProps {
  user: User;
  reviews: Review[];
  playlists?: Playlist[];
  matches?: Match[];
  isOwnProfile: boolean;
  onEntityClick: (entityId: string) => void;
  onMatchClick?: (matchId: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, reviews, playlists = [], matches = [], isOwnProfile, onEntityClick, onMatchClick }) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'playlists'>('reviews');
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / totalReviews).toFixed(1) : '0.0';
  const favorites = reviews.filter(r => r.rating >= 4.5).slice(0, 4);

  return (
    <div className="animate-fade-in pb-20">
      {/* Profile Header */}
      <div className="relative bg-dark-800 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative group">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-dark-900 overflow-hidden shadow-2xl bg-dark-700">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            {isOwnProfile && (
              <button className="absolute bottom-1 right-1 p-1.5 bg-pitch-600 rounded-full text-white hover:bg-pitch-500 transition shadow-lg">
                <Edit2 size={12} />
              </button>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{user.name}</h1>
            <p className="text-zinc-500">{user.handle}</p>
            {user.bio && <p className="text-zinc-400 max-w-lg mx-auto md:mx-0 text-sm">{user.bio}</p>}

            <div className="flex items-center justify-center md:justify-start gap-6 pt-3">
              {[
                { val: totalReviews, label: 'Reviews' },
                { val: playlists.length, label: 'Playlists' },
                { val: avgRating, label: 'Avg Rating' },
              ].map((s, i) => (
                <React.Fragment key={s.label}>
                  {i > 0 && <div className="w-px h-6 bg-white/[0.06]" />}
                  <div className="text-center md:text-left">
                    <span className="block text-lg font-bold text-white font-mono">{s.val}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">{s.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Favorites */}
          {favorites.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Favorites</h3>
              <div className="grid grid-cols-4 gap-3">
                {favorites.map(fav => (
                  <div key={fav.id} onClick={() => onEntityClick(fav.entityId)} className="cursor-pointer group">
                    <div className="aspect-[2/3] rounded-lg bg-dark-700 overflow-hidden border border-white/[0.06] group-hover:border-pitch-500/40 transition">
                      {fav.entityImage ? (
                        <img src={fav.entityImage} alt={fav.entityName} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">No Img</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div>
            <div className="flex gap-4 mb-5 border-b border-white/[0.06] pb-px">
              {[
                { id: 'reviews' as const, icon: <List size={14} />, label: `Reviews (${totalReviews})` },
                { id: 'playlists' as const, icon: <ListVideo size={14} />, label: `Playlists (${playlists.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider transition pb-2.5 border-b-2 ${
                    activeTab === tab.id ? 'text-pitch-400 border-pitch-400' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'reviews' ? (
              <div className="space-y-3">
                {sortedReviews.length > 0 ? sortedReviews.map(review => (
                  <div key={review.id} className="bg-dark-800 border border-white/[0.06] rounded-xl p-4 flex gap-4 hover:border-white/[0.1] transition">
                    <div onClick={() => onEntityClick(review.entityId)} className="w-14 h-20 shrink-0 rounded-lg bg-dark-700 overflow-hidden cursor-pointer">
                      {review.entityImage ? (
                        <img src={review.entityImage} alt="Poster" className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full bg-dark-700" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 onClick={() => onEntityClick(review.entityId)} className="font-semibold text-white hover:text-pitch-400 cursor-pointer leading-tight">
                            {review.entityName || 'Unknown'}
                          </h4>
                          <span className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <StarRating rating={review.rating} size={12} />
                      </div>
                      {review.comment && <p className="text-zinc-400 text-sm mt-1.5 line-clamp-3">"{review.comment}"</p>}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 bg-dark-800/50 rounded-xl border border-white/[0.04] text-zinc-500 text-sm">
                    No reviews yet. Start watching and rating matches!
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {playlists.length > 0 ? playlists.map(playlist => {
                  const playlistMatches = matches.filter(m => playlist.matchIds.includes(m.id));
                  return (
                    <div key={playlist.id} className="bg-dark-800 border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.1] transition">
                      <div className="flex items-center gap-2 mb-1">
                        <ListVideo size={14} className="text-pitch-400" />
                        <h4 className="font-semibold text-white">{playlist.name}</h4>
                      </div>
                      <p className="text-zinc-500 text-sm">{playlist.description}</p>
                      <span className="text-xs text-zinc-600 mt-1 block">
                        {new Date(playlist.createdAt).toLocaleDateString()} · {playlist.matchIds.length} matches
                      </span>
                      {playlistMatches.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {playlistMatches.slice(0, 6).map(match => (
                            <div key={match.id} onClick={() => onMatchClick?.(match.id)} className="relative aspect-video rounded-lg bg-dark-700 overflow-hidden cursor-pointer group border border-white/[0.04] hover:border-pitch-500/30 transition">
                              <div style={{ background: match.image }} className="absolute inset-0 opacity-30 group-hover:opacity-50 transition" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <Play size={20} className="text-white" />
                              </div>
                              <div className="absolute bottom-1 left-1.5 right-1.5">
                                <p className="text-[10px] font-semibold text-white truncate">{match.name}</p>
                                {match.score && <p className="text-[9px] text-pitch-400">{match.score}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {playlist.matchIds.length === 0 && (
                        <div className="text-center py-4 bg-dark-900/50 rounded-lg border border-white/[0.04] text-zinc-600 text-sm mt-3">No matches added yet</div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="text-center py-10 bg-dark-800/50 rounded-xl border border-white/[0.04] text-zinc-500 text-sm">
                    No playlists created yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-dark-800 border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3">Ratings Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = reviews.filter(r => Math.round(r.rating) === stars).length;
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2.5 text-sm">
                    <div className="flex items-center gap-1 w-10 shrink-0">
                      <span className="text-zinc-400 font-mono text-xs">{stars}</span>
                      <StarRating rating={1} maxRating={1} size={10} />
                    </div>
                    <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full bg-pitch-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-zinc-600 text-xs w-5 text-right font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserProfile);
