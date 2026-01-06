import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MatchCard from './components/MatchCard';
import ReviewModal from './components/ReviewModal';
import EntityProfile from './components/EntityProfile';
import { INITIAL_LIVE_MATCHES, INITIAL_EXCITING_MATCHES, INITIAL_HIGHEST_SCORING_MATCHES, MOCK_USER } from './constants';
import { searchEntities, getEntityDetails, getLiveMatches, getExcitingMatches, getHighestScoringMatches } from './services/geminiService';
import { User, Entity, Review, League, Match } from './types';
import { Loader2, Plus, RefreshCw, Filter, Flame, TrendingUp, AlertCircle, X } from 'lucide-react';

const App: React.FC = () => {
  // Global State
  const [user, setUser] = useState<User | null>(null);
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation State (Simple Router)
  const [view, setView] = useState<'HOME' | 'SEARCH' | 'DETAILS'>('HOME');
  
  // Data State
  const [featuredMatches, setFeaturedMatches] = useState<Match[]>(INITIAL_LIVE_MATCHES);
  const [excitingMatches, setExcitingMatches] = useState<Match[]>(INITIAL_EXCITING_MATCHES);
  const [highestScoringMatches, setHighestScoringMatches] = useState<Match[]>(INITIAL_HIGHEST_SCORING_MATCHES);
  
  const [searchResults, setSearchResults] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEntity, setModalEntity] = useState<Entity | null>(null);

  // Computed
  const filteredMatches = currentLeague 
    ? featuredMatches.filter(m => m.league === currentLeague)
    : featuredMatches;

  // -- Live Data Logic --

  const fetchLive = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
        const liveData = await getLiveMatches();
        if (liveData && liveData.length > 0) {
            setFeaturedMatches(liveData);
        } else {
            // Keep existing/mock data if empty to avoid blank screen
            setFeaturedMatches(INITIAL_LIVE_MATCHES);
        }
    } catch (err: any) {
        console.warn("Fetch Live error:", err);
        setFeaturedMatches(INITIAL_LIVE_MATCHES); // Fallback
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
        // Silent fail for secondary sections or show partial error
        console.warn("Fetch Exciting error:", err);
        // Don't override main error if it exists, or maybe stack? keeping it simple.
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

  useEffect(() => {
    // Initial fetch
    fetchLive();
    fetchExciting();
    fetchHighestScoring();

    // Set up polling interval to fetch fresh live data every 60 seconds
    const apiInterval = setInterval(() => {
        fetchLive();
    }, 60000);

    return () => {
        clearInterval(apiInterval);
    };
  }, []);

  // -- Handlers --

  const handleLogin = () => setUser(MOCK_USER);
  const handleLogout = () => setUser(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setView('SEARCH');

    try {
        // Build Personalized Context
        let contextParts: string[] = [];
        if (user) {
            contextParts.push(`User Profile: ${user.bio}`);
            const userReviews = reviews.filter(r => r.userId === user.id);
            const reviewedIds = new Set(userReviews.map(r => r.entityId));
            const allKnownEntities = [...featuredMatches, ...excitingMatches, ...highestScoringMatches, ...searchResults, ...(selectedEntity ? [selectedEntity] : [])];
            const reviewedNames = allKnownEntities
                .filter(e => reviewedIds.has(e.id))
                .map(e => e.name);
            
            if (reviewedNames.length > 0) {
                contextParts.push(`User Interests (Reviewed): ${Array.from(new Set(reviewedNames)).join(', ')}`);
            }
        }
        
        if (currentLeague) {
            contextParts.push(`Current Browsing Filter: ${currentLeague}`);
        }

        const context = contextParts.join('. ');
        
        const results = await searchEntities(query, context);
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
    let detailedEntity = entity;
    
    try {
        // Always fetch details to get fresh stats/news even if we have some data
        const details = await getEntityDetails(entity.name, entity.type);
        if (details) detailedEntity = { ...entity, ...details };
    } catch (err: any) {
        // Soft error: show what we have but warn user
        setError(`Could not load full details: ${err.message}`);
    }
    
    setSelectedEntity(detailedEntity);
    setView('DETAILS');
    setIsLoading(false);
    window.scrollTo(0, 0);
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

  const handleSubmitReview = (rating: number, comment: string) => {
    if (!modalEntity || !user) return;
    const newReview: Review = {
        id: `rev_${Date.now()}`,
        entityId: modalEntity.id,
        userId: user.id,
        userName: user.name,
        rating,
        comment,
        createdAt: new Date().toISOString(),
        likes: 0
    };
    setReviews([newReview, ...reviews]);
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
                Get Started — It's Free
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
            {filteredMatches.map(match => (
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
            {filteredMatches.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                    {currentLeague 
                        ? `No matches found in ${currentLeague} at the moment.` 
                        : "No live matches found."}
                </div>
            )}
         </div>
         {filteredMatches.some(m => m.sourceUrl) && (
            <div className="text-right mt-2">
                <a href={filteredMatches.find(m => m.sourceUrl)?.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-gray-600 hover:text-gray-400">
                    Data sourced via Google Search
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
         </div>
         {excitingMatches.some(m => m.sourceUrl) && (
            <div className="text-right mt-2">
                <a href={excitingMatches.find(m => m.sourceUrl)?.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-gray-600 hover:text-gray-400">
                    Data sourced via Google Search
                </a>
            </div>
         )}
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
         </div>
         {highestScoringMatches.some(m => m.sourceUrl) && (
            <div className="text-right mt-2">
                <a href={highestScoringMatches.find(m => m.sourceUrl)?.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-gray-600 hover:text-gray-400">
                    Data sourced via Google Search
                </a>
            </div>
         )}
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
            No results found. Try searching for "Messi" or "World Cup Final".
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
              reviews={reviews.filter(r => r.entityId === selectedEntity.id)} 
              onRate={(e) => handleRateClick(selectedEntity, e)}
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
                 © 2024 FullTime. The social network for football lovers. Data provided by Gemini AI.
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