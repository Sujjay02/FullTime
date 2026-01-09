
import React, { useState } from 'react';
import { User, Review, Playlist, Match } from '../types';
import StarRating from './StarRating';
import { Edit2, List, ListVideo, ChevronRight, Play } from 'lucide-react';

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
  // Sort reviews by date descending
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Calculate stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / totalReviews).toFixed(1) 
    : '0.0';

  // Extract unique "Favorites" (High rated items)
  const favorites = reviews
    .filter(r => r.rating >= 4.5)
    .slice(0, 4);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Profile Header */}
      <div className="relative bg-dark-800 border-b border-dark-700">
        <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center md:items-end gap-8">
           
           <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-dark-900 overflow-hidden shadow-2xl bg-dark-600">
                 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              {isOwnProfile && (
                <button className="absolute bottom-2 right-2 p-2 bg-pitch-600 rounded-full text-white hover:bg-pitch-500 transition shadow-lg">
                   <Edit2 size={14} />
                </button>
              )}
           </div>

           <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-3xl md:text-4xl font-black text-white">{user.name}</h1>
              <p className="text-gray-400 font-medium">{user.handle}</p>
              {user.bio && <p className="text-gray-300 max-w-lg mx-auto md:mx-0 text-sm leading-relaxed">{user.bio}</p>}
              
              <div className="flex items-center justify-center md:justify-start gap-6 pt-4">
                 <div className="text-center md:text-left">
                    <span className="block text-xl font-bold text-white font-mono">{totalReviews}</span>
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Reviews</span>
                 </div>
                 <div className="w-px h-8 bg-dark-700"></div>
                 <div className="text-center md:text-left">
                    <span className="block text-xl font-bold text-white font-mono">{playlists.length}</span>
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Playlists</span>
                 </div>
                 <div className="w-px h-8 bg-dark-700"></div>
                 <div className="text-center md:text-left">
                    <span className="block text-xl font-bold text-white font-mono">{avgRating}</span>
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Avg Rating</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-10">
        
        {/* Main Content: Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Favorites Section */}
           {favorites.length > 0 && (
             <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Favorites / High Rated</h3>
                <div className="grid grid-cols-4 gap-4">
                   {favorites.map(fav => (
                      <div key={fav.id} onClick={() => onEntityClick(fav.entityId)} className="cursor-pointer group">
                         <div className="aspect-[2/3] rounded bg-dark-700 overflow-hidden relative shadow-lg border border-dark-600/50 group-hover:border-pitch-500/50 transition">
                            {fav.entityImage ? (
                                <img src={fav.entityImage} alt={fav.entityName} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Img</div>
                            )}
                            <div className="absolute top-1 right-1">
                               <StarRating rating={fav.rating} size={8} maxRating={1} />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}

           <div>
              <div className="flex items-center justify-between mb-6 border-b border-dark-700 pb-2">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition pb-2 border-b-2 ${
                        activeTab === 'reviews'
                          ? 'text-pitch-400 border-pitch-400'
                          : 'text-gray-400 border-transparent hover:text-gray-300'
                      }`}
                    >
                      <List size={16} />
                      Reviews ({totalReviews})
                    </button>
                    <button
                      onClick={() => setActiveTab('playlists')}
                      className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition pb-2 border-b-2 ${
                        activeTab === 'playlists'
                          ? 'text-pitch-400 border-pitch-400'
                          : 'text-gray-400 border-transparent hover:text-gray-300'
                      }`}
                    >
                      <ListVideo size={16} />
                      Playlists ({playlists.length})
                    </button>
                  </div>
              </div>

              {activeTab === 'reviews' ? (
                <div className="space-y-4">
                   {sortedReviews.length > 0 ? (
                      sortedReviews.map(review => (
                         <div key={review.id} className="bg-dark-800 border border-dark-700 rounded-lg p-5 flex gap-5 hover:border-dark-600 transition">
                            <div
                               onClick={() => onEntityClick(review.entityId)}
                               className="w-16 h-24 shrink-0 rounded bg-dark-700 overflow-hidden cursor-pointer shadow-md"
                            >
                               {review.entityImage ? (
                                  <img src={review.entityImage} alt="Poster" className="w-full h-full object-cover" />
                               ) : (
                                  <div className="w-full h-full bg-dark-600"></div>
                               )}
                            </div>

                            <div className="flex-1">
                               <div className="flex justify-between items-start mb-1">
                                  <div>
                                     <h4
                                       onClick={() => onEntityClick(review.entityId)}
                                       className="font-bold text-white hover:text-pitch-400 cursor-pointer text-lg leading-tight"
                                     >
                                        {review.entityName || 'Unknown Entity'}
                                     </h4>
                                     <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <StarRating rating={review.rating} size={14} />
                               </div>

                               {review.comment && (
                                  <p className="text-gray-300 text-sm leading-relaxed font-serif mt-2 line-clamp-3">
                                     "{review.comment}"
                                  </p>
                               )}
                            </div>
                         </div>
                      ))
                   ) : (
                      <div className="text-center py-12 bg-dark-800/50 rounded border border-dark-700/50 text-gray-500 italic">
                         No reviews yet. Start watching and rating matches!
                      </div>
                   )}
                </div>
              ) : (
                <div className="space-y-4">
                   {playlists.length > 0 ? (
                      playlists.map(playlist => {
                        const playlistMatches = matches.filter(m => playlist.matchIds.includes(m.id));
                        return (
                          <div key={playlist.id} className="bg-dark-800 border border-dark-700 rounded-lg p-5 hover:border-dark-600 transition">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <ListVideo size={16} className="text-pitch-400" />
                                  <h4 className="font-bold text-white text-lg">{playlist.name}</h4>
                                </div>
                                <p className="text-gray-400 text-sm">{playlist.description}</p>
                                <span className="text-xs text-gray-500 mt-1 block">
                                  Created {new Date(playlist.createdAt).toLocaleDateString()} • {playlist.matchIds.length} matches
                                </span>
                              </div>
                            </div>

                            {playlistMatches.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                                {playlistMatches.slice(0, 6).map(match => (
                                  <div
                                    key={match.id}
                                    onClick={() => onMatchClick && onMatchClick(match.id)}
                                    className="relative aspect-video rounded bg-dark-700 overflow-hidden cursor-pointer group border border-dark-600 hover:border-pitch-500/50 transition"
                                  >
                                    <div
                                      style={{ background: match.image }}
                                      className="absolute inset-0 opacity-40 group-hover:opacity-60 transition"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                      <Play size={24} className="text-white" />
                                    </div>
                                    <div className="absolute bottom-1 left-1 right-1">
                                      <p className="text-[10px] font-bold text-white truncate">{match.name}</p>
                                      {match.score && <p className="text-[9px] text-pitch-400">{match.score}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {playlist.matchIds.length === 0 && (
                              <div className="text-center py-6 bg-dark-900/50 rounded border border-dark-700/50 text-gray-500 text-sm italic">
                                No matches added yet
                              </div>
                            )}
                          </div>
                        );
                      })
                   ) : (
                      <div className="text-center py-12 bg-dark-800/50 rounded border border-dark-700/50 text-gray-500 italic">
                         No playlists created yet. Create your first playlist to organize your favorite matches!
                      </div>
                   )}
                </div>
              )}
           </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-8">
           <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Ratings Distribution</h3>
              <div className="space-y-2">
                 {[5,4,3,2,1].map(stars => {
                    const count = reviews.filter(r => Math.round(r.rating) === stars).length;
                    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                       <div key={stars} className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1 w-12 shrink-0">
                             <span className="text-gray-400 font-mono">{stars}</span>
                             <StarRating rating={1} maxRating={1} size={10} />
                          </div>
                          <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                             <div className="h-full bg-pitch-600" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="text-gray-500 text-xs w-6 text-right">{count}</span>
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
