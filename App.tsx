
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import Header from './components/Header';
import MatchCard from './components/MatchCard';

const ReviewModal = lazy(() => import('./components/ReviewModal'));
const EntityProfile = lazy(() => import('./components/EntityProfile'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const LeagueDashboard = lazy(() => import('./components/LeagueDashboard'));
import { INITIAL_LIVE_MATCHES, INITIAL_EXCITING_MATCHES, INITIAL_HIGHEST_SCORING_MATCHES, getGenericImage } from './constants';
import { 
  searchEntities, 
  getLiveMatches, 
  getExcitingMatches, 
  getHighestScoringMatches,
  getLeagueMetrics 
} from './services/footballService';
import { 
  auth, 
  signInWithGoogle, 
  logout, 
  db,
  onAuthStateChanged,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc
} from './services/firebase';
import { User, Entity, Review, League, Match, LeagueMetric, Playlist } from './types';
import { Loader2, Plus, RefreshCw, Filter, Flame, TrendingUp, AlertCircle, X, ListPlus, Users } from 'lucide-react';
import { getCachedData, setCachedData } from './services/cacheService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'HOME' | 'SEARCH' | 'DETAILS' | 'PROFILE' | 'LEAGUES'>('HOME');
  
  const [featuredMatches, setFeaturedMatches] = useState<Match[]>(INITIAL_LIVE_MATCHES);
  const [excitingMatches, setExcitingMatches] = useState<Match[]>(INITIAL_EXCITING_MATCHES);
  const [highestScoringMatches, setHighestScoringMatches] = useState<Match[]>(INITIAL_HIGHEST_SCORING_MATCHES);
  
  const [searchResults, setSearchResults] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  
  const [leagueMetrics, setLeagueMetrics] = useState<LeagueMetric[]>([]);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [modalEntity, setModalEntity] = useState<Entity | null>(null);
  const [playlistMatchId, setPlaylistMatchId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: any) => {
      if (firebaseUser) {
        const u = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Anonymous',
          handle: firebaseUser.email || '@user',
          avatar: firebaseUser.photoURL || 'https://ui-avatars.com/api/?name=User',
          uid: firebaseUser.uid
        };
        setUser(u);
        fetchPlaylists(firebaseUser.uid);
      } else {
        setUser(null);
        setPlaylists([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPlaylists = useCallback(async (userId: string) => {
    const cacheKey = `playlists_${userId}`;
    const cached = getCachedData<Playlist[]>(cacheKey);

    if (cached) {
      setPlaylists(cached);
      return;
    }

    try {
      const q = query(
        collection(db, 'playlists'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const playlistsData = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as Playlist));
      setPlaylists(playlistsData);
      setCachedData(cacheKey, playlistsData, 600); // Cache for 10 minutes
    } catch (err) { console.warn(err); }
  }, []);

  const handleCreatePlaylist = useCallback(async (name: string) => {
    if (!user) return;
    const newPlaylist = {
      name,
      description: 'A custom collection of matches.',
      userId: user.id,
      matchIds: [],
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'playlists'), newPlaylist);
    setPlaylists(prev => [...prev, { id: docRef.id, ...newPlaylist } as Playlist]);
  }, [user]);

  const handleAddToPlaylist = useCallback(async (playlistId: string, matchId: string) => {
    setPlaylists(prev => {
      const playlist = prev.find(p => p.id === playlistId);
      if (!playlist || playlist.matchIds.includes(matchId)) return prev;

      const updatedIds = [...playlist.matchIds, matchId];
      updateDoc(doc(db, 'playlists', playlistId), { matchIds: updatedIds });
      return prev.map(p => p.id === playlistId ? { ...p, matchIds: updatedIds } : p);
    });
    setIsPlaylistModalOpen(false);
  }, []);

  const fetchLive = useCallback(async () => {
    setIsRefreshing(true);
    try {
        const liveData = await getLiveMatches(currentLeague || undefined);
        setFeaturedMatches(liveData);
    } catch (err: any) { setFeaturedMatches(INITIAL_LIVE_MATCHES); }
    finally { setIsRefreshing(false); }
  }, [currentLeague]);

  const fetchReviews = useCallback(async (entityId: string) => {
      const cacheKey = `reviews_${entityId}`;
      const cached = getCachedData<Review[]>(cacheKey);

      if (cached) {
        setReviews(cached);
        return;
      }

      try {
          const q = query(collection(db, 'reviews'), where('entityId', '==', entityId), orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(q);
          const reviewsData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Review));
          setReviews(reviewsData);
          setCachedData(cacheKey, reviewsData, 300); // Cache for 5 minutes
      } catch (err) { setReviews([]); }
  }, []);

  // Auto-refresh live matches every 30 seconds
  useEffect(() => {
    fetchLive();

    const interval = setInterval(() => {
      console.log('Auto-refreshing live matches...');
      fetchLive();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchLive]);

  useEffect(() => {
    getExcitingMatches().then(setExcitingMatches);
    getHighestScoringMatches().then(setHighestScoringMatches);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true); setView('SEARCH');
    try { setSearchResults(await searchEntities(query)); } catch (err) { setSearchResults([]); }
    finally { setIsLoading(false); }
  }, []);

  const handleEntityClick = useCallback((entity: Entity) => {
    setSelectedEntity(entity); setView('DETAILS');
    window.scrollTo(0, 0); fetchReviews(entity.id);
  }, [fetchReviews]);

  const handlePlaylistClick = useCallback((matchId: string) => {
    if (!user) { alert("Please login to create playlists."); return; }
    setPlaylistMatchId(matchId);
    setIsPlaylistModalOpen(true);
  }, [user]);

  const handleViewLeagues = useCallback(async () => {
    setView('LEAGUES');
    if (leagueMetrics.length === 0) {
      setIsLoading(true);
      try {
        const metrics = await getLeagueMetrics();
        setLeagueMetrics(metrics);
      } catch (err) {
        console.error("Failed to fetch league metrics", err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [leagueMetrics.length]);

  const handleSelectLeague = useCallback((l: League | null) => {
    setCurrentLeague(l);
    setView('HOME');
  }, []);

  const handleGoHome = useCallback(() => setView('HOME'), []);

  const handleProfileClick = useCallback((u: User) => {
    setProfileUser(u);
    setView('PROFILE');
  }, []);

  const handleOpenReviewModal = useCallback(() => {
    if (selectedEntity) {
      setModalEntity(selectedEntity);
      setIsModalOpen(true);
    }
  }, [selectedEntity]);

  const handleCloseReviewModal = useCallback(() => setIsModalOpen(false), []);

  const handleLeagueClick = useCallback((l: League) => {
    setCurrentLeague(l);
    setView('HOME');
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 font-sans text-gray-100 relative">
      <Header
         user={user}
         onLogin={signInWithGoogle}
         onLogout={logout}
         onSearch={handleSearch}
         onSelectLeague={handleSelectLeague}
         onGoHome={handleGoHome}
         onProfileClick={handleProfileClick}
         onViewLeagues={handleViewLeagues}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
         {view === 'HOME' && (
           <div className="space-y-12">
              {/* Hero/Signup Section */}
              {!user && (
                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pitch-900 via-pitch-800 to-dark-900 border border-pitch-700/50 p-8 md:p-12 mb-16 shadow-2xl">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/60-lines.png')] opacity-10"></div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-pitch-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>

                  <div className="relative z-10 max-w-3xl">
                    <div className="inline-block px-3 py-1 bg-pitch-600/30 border border-pitch-500/50 rounded-full text-xs font-bold text-pitch-300 uppercase tracking-wider mb-4">
                      Live Match Data • AI-Powered Insights
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                      Never Miss a <span className="text-pitch-400">Legendary</span> Match Again
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                      Get real-time match updates, AI-powered watchability scores, and personalized recommendations.
                      Join the community and discover which matches are truly worth your time.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={signInWithGoogle}
                        className="bg-pitch-600 hover:bg-pitch-500 text-white font-bold py-4 px-8 rounded-lg transition shadow-lg shadow-pitch-900/40 flex items-center justify-center gap-2 text-lg"
                      >
                        <Users size={20} />
                        Sign Up with Google
                      </button>
                      <button
                        onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
                        className="bg-dark-800 hover:bg-dark-700 border border-dark-600 text-white font-bold py-4 px-8 rounded-lg transition flex items-center justify-center gap-2 text-lg"
                      >
                        <TrendingUp size={20} />
                        Explore Matches
                      </button>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                      <div>
                        <div className="text-3xl font-black text-pitch-400 mb-1">Live</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Updates</div>
                      </div>
                      <div>
                        <div className="text-3xl font-black text-pitch-400 mb-1">AI</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Powered</div>
                      </div>
                      <div>
                        <div className="text-3xl font-black text-pitch-400 mb-1">Free</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Forever</div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <section>
                <div className="flex justify-between items-center mb-6 border-l-4 border-pitch-500 pl-4">
                  <h2 className="text-xl font-bold text-white uppercase tracking-widest">
                    Happening Now
                    {isRefreshing && <span className="ml-2 text-xs text-pitch-400 animate-pulse">• Live</span>}
                  </h2>
                  <button onClick={fetchLive} className="text-xs text-gray-500 hover:text-pitch-400 flex items-center gap-1">
                    <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} /> Refresh
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {featuredMatches.map(m => (
                     <div key={m.id} className="relative group">
                        <MatchCard match={m} onClick={() => handleEntityClick(m)} />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition z-10">
                           <button onClick={(e) => { e.stopPropagation(); setModalEntity(m); setIsModalOpen(true); }} className="p-1.5 bg-black/60 rounded-full text-white hover:bg-pitch-600"><Plus size={14}/></button>
                           <button onClick={(e) => { e.stopPropagation(); handlePlaylistClick(m.id); }} className="p-1.5 bg-black/60 rounded-full text-white hover:bg-blue-600"><ListPlus size={14}/></button>
                        </div>
                     </div>
                   ))}
                </div>
              </section>
              
              <section>
                 <div className="flex items-center gap-2 mb-6 border-l-4 border-orange-500 pl-4">
                   <h2 className="text-xl font-bold text-white uppercase tracking-widest">Weekly Highlights</h2>
                   <Flame size={18} className="text-orange-500" />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {excitingMatches.map(m => <MatchCard key={m.id} match={m} onClick={() => handleEntityClick(m)} />)}
                 </div>
              </section>
           </div>
         )}

         {view === 'SEARCH' && (
           <>
             {isLoading ? (
               <div className="flex flex-col items-center justify-center py-20">
                 <Loader2 className="animate-spin text-pitch-500 mb-4" size={48} />
                 <p className="text-gray-400 text-sm">Searching...</p>
               </div>
             ) : searchResults.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                 {searchResults.map(e => (
                   <div key={e.id} onClick={() => handleEntityClick(e)} className="cursor-pointer group bg-dark-800 rounded p-2 border border-dark-700 hover:border-pitch-500 transition">
                     <div className="aspect-[3/4] rounded overflow-hidden mb-2"><img src={e.image} className="w-full h-full object-cover"/></div>
                     <div className="text-sm font-bold text-white truncate">{e.name}</div>
                     <div className="text-[10px] text-gray-500 uppercase">{e.type}</div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                 <AlertCircle size={48} className="mb-4" />
                 <p>No results found. Try a different search.</p>
               </div>
             )}
           </>
         )}

         {view === 'DETAILS' && selectedEntity && (
           <Suspense fallback={<div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-pitch-500" size={40} /></div>}>
             <EntityProfile
                entity={selectedEntity}
                reviews={reviews}
                onRate={handleOpenReviewModal}
                onAddToPlaylist={handlePlaylistClick}
             />
           </Suspense>
         )}

         {view === 'PROFILE' && profileUser && (
           <Suspense fallback={<div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-pitch-500" size={40} /></div>}>
             <UserProfile user={profileUser} reviews={userReviews} isOwnProfile={user?.id === profileUser.id} onEntityClick={(id) => handleEntityClick({ id, name: '...', type: 'MATCH', image: getGenericImage(id)})} />
           </Suspense>
         )}

         {view === 'LEAGUES' && (
           <Suspense fallback={<div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-pitch-500" size={40} /></div>}>
             <LeagueDashboard metrics={leagueMetrics} onLeagueClick={handleLeagueClick} onMatchClick={handleEntityClick} isLoading={isLoading} />
           </Suspense>
         )}
      </main>

      {/* Playlist Modal */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-dark-800 border border-dark-700 rounded-lg w-full max-w-sm p-6 space-y-4">
              <div className="flex justify-between items-center">
                 <h3 className="font-bold text-white">Add to List</h3>
                 <button onClick={() => setIsPlaylistModalOpen(false)}><X size={18}/></button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                 {playlists.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => handleAddToPlaylist(p.id, playlistMatchId!)}
                      className="w-full text-left p-3 rounded bg-dark-900 border border-dark-700 hover:border-pitch-500 transition flex justify-between items-center"
                    >
                       <span className="text-sm">{p.name}</span>
                       <span className="text-[10px] text-gray-500">{p.matchIds.length} items</span>
                    </button>
                 ))}
                 <button 
                  onClick={() => { const n = prompt("List Name?"); if(n) handleCreatePlaylist(n); }}
                  className="w-full p-3 rounded border border-dashed border-dark-600 text-gray-500 text-sm hover:text-white transition"
                 >
                   + Create New List
                 </button>
              </div>
           </div>
        </div>
      )}

      {isModalOpen && modalEntity && (
        <Suspense fallback={null}>
          <ReviewModal entity={modalEntity} onClose={handleCloseReviewModal} onSubmit={() => {}} />
        </Suspense>
      )}
    </div>
  );
};

export default App;
