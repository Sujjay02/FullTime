
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MatchCard from './components/MatchCard';
import ReviewModal from './components/ReviewModal';
import EntityProfile from './components/EntityProfile';
import UserProfile from './components/UserProfile';
import { INITIAL_LIVE_MATCHES, INITIAL_EXCITING_MATCHES, INITIAL_HIGHEST_SCORING_MATCHES } from './constants';
// Import from footballService
import { searchEntities, getLiveMatches, getExcitingMatches, getHighestScoringMatches } from './services/footballService';
// Import Firebase services (Wrapper)
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
  orderBy
} from './services/firebase';
import { User, Entity, Review, League, Match } from './types';
import { Loader2, Plus, RefreshCw, Filter, Flame, TrendingUp, AlertCircle, X } from 'lucide-react';

const App: React.FC = () => {
  // Global State
  const [user, setUser] = useState<User | null>(null);
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation State
  const [view, setView] = useState<'HOME' | 'SEARCH' | 'DETAILS' | 'PROFILE'>('HOME');
  
  // Data State
  const [featuredMatches, setFeaturedMatches] = useState<Match[]>(INITIAL_LIVE_MATCHES);
  const [excitingMatches, setExcitingMatches] = useState<Match[]>(INITIAL_EXCITING_MATCHES);
  const [highestScoringMatches, setHighestScoringMatches] = useState<Match[]>(INITIAL_HIGHEST_SCORING_MATCHES);
  
  const [searchResults, setSearchResults] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Profile State
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEntity, setModalEntity] = useState<Entity | null>(null);

  // -- Auth Observer --
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: any) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Anonymous',
          handle: firebaseUser.email || '@user',
          avatar: firebaseUser.photoURL || 'https://picsum.photos/100/100?random=1',
          uid: firebaseUser.uid
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // -- Live Data Logic --

  const fetchLive = async () => {
    setIsRefreshing(true);
    try {
        const liveData = await getLiveMatches(currentLeague || undefined);
        if (liveData && liveData.length > 0) {
            setFeaturedMatches(liveData);
            setError(null);
        } else {
            setFeaturedMatches([]); 
        }
    } catch (err: any) {
        console.warn("Fetch Live error:", err);
        setFeaturedMatches(INITIAL_LIVE_MATCHES); 
        setError(err.message);
    } finally {
        setIsRefreshing(false);
    }
  };

  const fetchExciting = async () => {
    try {
        const data = await getExcitingMatches();
        if (data && data.length > 0) {
            setExcitingMatches(data);
        }
    } catch (err: any) {
        console.warn("Fetch Exciting error:", err);
    }
  };

  const fetchHighestScoring = async () => {
    try {
        const data = await getHighestScoringMatches();
        if (data && data.length > 0) {
            setHighestScoringMatches(data);
        }
    } catch (err: any) {
        console.warn("Fetch Highest Scoring error:", err);
    }
  };

  const fetchReviews = async (entityId: string) => {
      try {
          const q = query(
              collection(db, 'reviews'), 
              where('entityId', '==', entityId),
              orderBy('createdAt', 'desc')
          );
          const snapshot = await getDocs(q);
          const fetchedReviews: Review[] = snapshot.docs.map((doc: any) => ({
              id: doc.id,
              ...doc.data()
          } as Review));
          setReviews(fetchedReviews);
      } catch (err) {
          console.warn("Failed to fetch reviews", err);
          // Fallback to empty array but keep UI running
          setReviews([]); 
      }
  };

  const fetchUserReviews = async (userId: string) => {
      setIsLoading(true);
      try {
          // Use 'where' clause for user ID
          const q = query(
              collection(db, 'reviews'), 
              where('userId', '==', userId),
              orderBy('createdAt', 'desc')
          );
          const snapshot = await getDocs(q);
          const fetchedReviews: Review[] = snapshot.docs.map((doc: any) => ({
              id: doc.id,
              ...doc.data()
          } as Review));
          setUserReviews(fetchedReviews);
      } catch (err) {
          console.warn("Failed to fetch user reviews", err);
          setUserReviews([]);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchLive();
    fetchExciting();
    fetchHighestScoring();

    const apiInterval = setInterval(() => {
        fetchLive();
    }, 300000);

    return () => clearInterval(apiInterval);
  }, [currentLeague]); 

  // -- Handlers --

  const handleLogin = async () => {
      try {
          await signInWithGoogle();
      } catch (err: any) {
          setError("Login failed. Check console or firebase config.");
      }
  };

  const handleLogout = () => {
      logout();
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setView('SEARCH');

    try {
        const results = await searchEntities(query);
        setSearchResults(results);
    } catch (err: any) {
        setSearchResults([]);
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleEntityClick = async (entity: Entity) => {
    setIsLoading(true);
    setError(null);
    setSelectedEntity(entity);
    setView('DETAILS');
    setIsLoading(false);
    window.scrollTo(0, 0);
    // Fetch reviews from firebase
    fetchReviews(entity.id);
  };

  const handleProfileClick = async (profileUser: User) => {
      setProfileUser(profileUser);
      setView('PROFILE');
      window.scrollTo(0, 0);
      await fetchUserReviews(profileUser.id);
  };

  const handleGoToEntityFromProfile = async (entityId: string) => {
     // Since we don't have the full entity object here easily without refetching,
     // we could search for it or try to fetch details.
     // For now, let's assume we can search by ID or handle it via search flow.
     // Optimization: Store minimal entity data in Review to rebuild object or refetch.
     // Simple workaround: Since we have the ID, we can use the searchEntities with ID 
     // BUT currently search is name based. 
     // Let's create a stub entity and let EntityProfile fetch details or just show what we have.
     
     // Note: In a real app, we'd fetch the entity by ID.
     // Here, we check our current lists first.
     const found = [...featuredMatches, ...excitingMatches, ...highestScoringMatches].find(m => m.id === entityId);
     
     if (found) {
         handleEntityClick(found);
     } else {
        // Fallback: Create a skeleton entity with the ID and generic data, let the user see reviews
        // This is imperfect but works for the mock data constraints
        const skeleton: Entity = {
            id: entityId,
            name: 'Loading...',
            type: 'MATCH', // Default assumption
            image: 'https://picsum.photos/800/400',
        };
        // Ideally we would fetch details here.
        handleEntityClick(skeleton);
     }
  };

  const handleRateClick = (entity: Entity, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
        alert("Please login to rate!");
        return;
    }
    setModalEntity(entity);
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!modalEntity || !user) return;
    
    try {
        const newReview: any = {
            entityId: modalEntity.id,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            rating,
            comment,
            createdAt: new Date().toISOString(),
            likes: 0,
            // Capture entity snapshot for profile display
            entityName: modalEntity.name,
            entityImage: modalEntity.image,
            entityType: modalEntity.type
        };
        const docRef = await addDoc(collection(db, 'reviews'), newReview);
        
        // Optimistic update if viewing details
        if (selectedEntity?.id === modalEntity.id) {
             const revWithId: Review = { id: docRef.id, ...newReview };
             setReviews([revWithId, ...reviews]);
        }
    } catch (err: any) {
        console.error("Error adding document: ", err);
        setError("Could not save review. Is Firestore configured?");
    }
  };

  // -- Render Helpers --

  const renderHome = () => (
    <div className="space-y-12 pb-20">
      {/* Hero / Login Call to Action */}
      {!user && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pitch-900 to-dark-900 shadow-2xl border border-dark-700 p-8 md:p-16 text-center">
           <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                 Track your football life.
              </h1>
              <p className="text-lg text-gray-300">
                Rate players, review matches, and keep a diary of the beautiful game. 
                Join the FullTime community today.
              </p>
              <button 
                onClick={handleLogin}
                className="bg-white text-dark-900 hover:bg-pitch-500 hover:text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-105 duration-200"
              >
                Sign In with Google
              </button>
           </div>
           {/* Decorative Background Elements */}
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-pitch-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
           <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>
      )}

      {/* Live Matches Section */}
      <section>
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
               <h2 className="text-xl font-semibold text-gray-200 uppercase tracking-widest border-l-4 border-pitch-500 pl-3">
                 {currentLeague ? `${currentLeague}` : 'Happening Now'}
               </h2>
               {isRefreshing && <Loader2 className="animate-spin text-pitch-500" size={16} />}
            </div>
            
            <div className="flex items-center gap-3">
                {/* League Selector */}
                <div className="relative">
                    <select 
                        value={currentLeague || ''} 
                        onChange={(e) => setCurrentLeague(e.target.value as League || null)}
                        className="appearance-none bg-dark-800 border border-dark-700 text-gray-300 text-sm rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:border-pitch-500 hover:border-gray-600 transition cursor-pointer"
                    >
                        <option value="">All Leagues</option>
                        {Object.values(League).map(l => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                    <Filter size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                <button 
                   onClick={fetchLive}
                   className="text-xs font-bold text-gray-500 hover:text-white transition flex items-center gap-1 bg-dark-800 border border-dark-700 rounded-md py-2 px-3 hover:border-gray-600"
                >
                   <RefreshCw size={12} /> <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMatches.map(match => (
                <div key={match.id} className="relative group animate-in fade-in duration-500">
                    <MatchCard 
                        match={match} 
                        onClick={() => handleEntityClick(match)} 
                    />
                     {/* Quick Rate Button (Desktop) */}
                     <button 
                        onClick={(e) => handleRateClick(match, e)}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-pitch-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-sm z-10"
                        title="Log this match"
                     >
                        <Plus size={16} />
                     </button>
                </div>
            ))}
            {featuredMatches.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                    {currentLeague 
                        ? `No matches found in ${currentLeague} this week.` 
                        : "No recent matches found."}
                </div>
            )}
         </div>
         {featuredMatches.some(m => m.sourceUrl) && (
            <div className="text-right mt-2">
                <a href="https://www.api-football.com" target="_blank" rel="noreferrer" className="text-[10px] text-gray-600 hover:text-gray-400">
                    Data provided by API-Football
                </a>
            </div>
         )}
      </section>

      {/* "Most Exciting Recent Games" Section */}
      <section>
         <div className="flex items-center gap-3 mb-6">
             <h2 className="text-xl font-semibold text-gray-200 uppercase tracking-widest border-l-4 border-orange-500 pl-3">
               Most Exciting (Past 7 Days)
             </h2>
             <Flame className="text-orange-500 animate-pulse" size={20} />
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {excitingMatches.map(match => (
                 <div key={match.id} className="relative group animate-in fade-in duration-700">
                    <MatchCard 
                        match={match}
                        onClick={() => handleEntityClick(match)}
                    />
                    <button 
                        onClick={(e) => handleRateClick(match, e)}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-pitch-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-sm z-10"
                        title="Log this match"
                     >
                        <Plus size={16} />
                     </button>
                 </div>
             ))}
         </div>
      </section>

      {/* "Highest Scoring Games" Section */}
      <section>
         <div className="flex items-center gap-3 mb-6">
             <h2 className="text-xl font-semibold text-gray-200 uppercase tracking-widest border-l-4 border-blue-500 pl-3">
               Highest Scoring (Past 7 Days)
             </h2>
             <TrendingUp className="text-blue-500" size={20} />
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {highestScoringMatches.map(match => (
                 <div key={match.id} className="relative group animate-in fade-in duration-700 delay-100">
                    <MatchCard 
                        match={match}
                        onClick={() => handleEntityClick(match)}
                    />
                    <button 
                        onClick={(e) => handleRateClick(match, e)}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-pitch-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-sm z-10"
                        title="Log this match"
                     >
                        <Plus size={16} />
                     </button>
                 </div>
             ))}
         </div>
      </section>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-6 min-h-[60vh]">
       <div className="flex items-center gap-4 border-b border-dark-700 pb-4">
          <h2 className="text-2xl font-bold text-white">Search Results</h2>
          {isLoading && <Loader2 className="animate-spin text-pitch-500" />}
       </div>

       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {searchResults.map(entity => (
             <div key={entity.id} onClick={() => handleEntityClick(entity)} className="cursor-pointer group">
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-dark-800 border border-dark-700 mb-2 relative shadow-lg">
                   <img src={entity.image} alt={entity.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100" />
                   <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase backdrop-blur-sm">
                      {entity.type}
                   </div>
                </div>
                <h3 className="font-bold text-gray-200 group-hover:text-pitch-500 transition text-sm">{entity.name}</h3>
                <p className="text-xs text-gray-500 truncate">{entity.subtitle}</p>
             </div>
          ))}
       </div>
       {!isLoading && searchResults.length === 0 && (
         <div className="text-center text-gray-500 py-20">
            No results found. Try searching for "Manchester United" or "Real Madrid".
         </div>
       )}
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 font-sans text-gray-100 selection:bg-pitch-500 selection:text-white relative">
      <Header 
         user={user} 
         onLogin={handleLogin} 
         onLogout={handleLogout}
         onSearch={handleSearch}
         onSelectLeague={setCurrentLeague}
         onGoHome={() => { setView('HOME'); setSelectedEntity(null); }}
         onProfileClick={handleProfileClick}
      />
      
      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-2xl border border-red-500 flex items-center gap-3 max-w-sm md:max-w-md">
                <AlertCircle size={20} className="shrink-0" />
                <span className="text-sm font-medium">{error}</span>
                <button onClick={() => setError(null)} className="ml-auto hover:bg-white/20 rounded p-1 transition">
                    <X size={16} />
                </button>
            </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
         {view === 'HOME' && renderHome()}
         {view === 'SEARCH' && renderSearch()}
         {view === 'DETAILS' && selectedEntity && (
           <EntityProfile 
              entity={selectedEntity} 
              reviews={reviews} 
              onRate={(e) => handleRateClick(selectedEntity, e)}
              onUserClick={handleProfileClick}
           />
         )}
         {view === 'PROFILE' && profileUser && (
            <UserProfile 
                user={profileUser}
                reviews={userReviews}
                isOwnProfile={user?.id === profileUser.id}
                onEntityClick={handleGoToEntityFromProfile}
            />
         )}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-700 bg-dark-900 py-12 mt-12">
         <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-pitch-600"></div>
                 <span className="font-bold text-lg text-white">FullTime</span>
             </div>
             <div className="text-sm text-gray-500">
                 © 2024 FullTime. The social network for football lovers.
             </div>
             <div className="flex gap-4">
                 <a href="#" className="text-gray-500 hover:text-white transition">About</a>
                 <a href="#" className="text-gray-500 hover:text-white transition">Terms</a>
                 <a href="#" className="text-gray-500 hover:text-white transition">Privacy</a>
             </div>
         </div>
      </footer>

      {isModalOpen && modalEntity && (
          <ReviewModal 
             entity={modalEntity} 
             onClose={() => setIsModalOpen(false)} 
             onSubmit={handleSubmitReview}
          />
      )}
    </div>
  );
};

export default App;
