
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MatchCard from './components/MatchCard';
import ReviewModal from './components/ReviewModal';
import EntityProfile from './components/EntityProfile';
import UserProfile from './components/UserProfile';
import LeagueDashboard from './components/LeagueDashboard';
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
import { Loader2, Plus, RefreshCw, Filter, Flame, TrendingUp, AlertCircle, X, ListPlus } from 'lucide-react';

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

  const fetchPlaylists = async (userId: string) => {
    try {
      const q = query(collection(db, 'playlists'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      setPlaylists(snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as Playlist)));
    } catch (err) { console.warn(err); }
  };

  const handleCreatePlaylist = async (name: string) => {
    if (!user) return;
    const newPlaylist = {
      name,
      description: 'A custom collection of matches.',
      userId: user.id,
      matchIds: [],
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'playlists'), newPlaylist);
    setPlaylists([...playlists, { id: docRef.id, ...newPlaylist } as Playlist]);
  };

  const handleAddToPlaylist = async (playlistId: string, matchId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist || playlist.matchIds.includes(matchId)) return;
    
    const updatedIds = [...playlist.matchIds, matchId];
    await updateDoc(doc(db, 'playlists', playlistId), { matchIds: updatedIds });
    setPlaylists(playlists.map(p => p.id === playlistId ? { ...p, matchIds: updatedIds } : p));
    setIsPlaylistModalOpen(false);
  };

  const fetchLive = async () => {
    setIsRefreshing(true);
    try {
        const liveData = await getLiveMatches(currentLeague || undefined);
        setFeaturedMatches(liveData);
    } catch (err: any) { setFeaturedMatches(INITIAL_LIVE_MATCHES); }
    finally { setIsRefreshing(false); }
  };

  const fetchReviews = async (entityId: string) => {
      try {
          const q = query(collection(db, 'reviews'), where('entityId', '==', entityId), orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(q);
          setReviews(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Review)));
      } catch (err) { setReviews([]); }
  };

  useEffect(() => {
    fetchLive();
    getExcitingMatches().then(setExcitingMatches);
    getHighestScoringMatches().then(setHighestScoringMatches);
  }, [currentLeague]);

  const handleSearch = async (query: string) => {
    setIsLoading(true); setView('SEARCH');
    try { setSearchResults(await searchEntities(query)); } catch (err) { setSearchResults([]); }
    finally { setIsLoading(false); }
  };

  const handleEntityClick = (entity: Entity) => {
    setSelectedEntity(entity); setView('DETAILS');
    window.scrollTo(0, 0); fetchReviews(entity.id);
  };

  const handlePlaylistClick = (matchId: string) => {
    if (!user) { alert("Please login to create playlists."); return; }
    setPlaylistMatchId(matchId);
    setIsPlaylistModalOpen(true);
  };

  const handleViewLeagues = async () => {
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
  };

  return (
    <div className="min-h-screen bg-dark-900 font-sans text-gray-100 relative">
      <Header 
         user={user} 
         onLogin={signInWithGoogle} onLogout={logout} onSearch={handleSearch}
         onSelectLeague={(l) => { setCurrentLeague(l); setView('HOME'); }}
         onGoHome={() => setView('HOME')}
         onProfileClick={(u) => { setProfileUser(u); setView('PROFILE'); }}
         onViewLeagues={handleViewLeagues}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
         {view === 'HOME' && (
           <div className="space-y-12">
              <section>
                <div className="flex justify-between items-center mb-6 border-l-4 border-pitch-500 pl-4">
                  <h2 className="text-xl font-bold text-white uppercase tracking-widest">Happening Now</h2>
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
           <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {searchResults.map(e => (
                <div key={e.id} onClick={() => handleEntityClick(e)} className="cursor-pointer group bg-dark-800 rounded p-2 border border-dark-700 hover:border-pitch-500 transition">
                   <div className="aspect-[3/4] rounded overflow-hidden mb-2"><img src={e.image} className="w-full h-full object-cover"/></div>
                   <div className="text-sm font-bold text-white truncate">{e.name}</div>
                   <div className="text-[10px] text-gray-500 uppercase">{e.type}</div>
                </div>
              ))}
           </div>
         )}

         {view === 'DETAILS' && selectedEntity && (
           <EntityProfile 
              entity={selectedEntity} 
              reviews={reviews} 
              onRate={() => { setModalEntity(selectedEntity); setIsModalOpen(true); }} 
              onAddToPlaylist={handlePlaylistClick}
           />
         )}

         {view === 'PROFILE' && profileUser && (
           <UserProfile user={profileUser} reviews={userReviews} isOwnProfile={user?.id === profileUser.id} onEntityClick={(id) => handleEntityClick({ id, name: '...', type: 'MATCH', image: getGenericImage(id)})} />
         )}

         {view === 'LEAGUES' && (
           <LeagueDashboard metrics={leagueMetrics} onLeagueClick={(l) => { setCurrentLeague(l); setView('HOME'); }} onMatchClick={handleEntityClick} isLoading={isLoading} />
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

      {isModalOpen && modalEntity && <ReviewModal entity={modalEntity} onClose={() => setIsModalOpen(false)} onSubmit={() => {}} />}
    </div>
  );
};

export default App;
