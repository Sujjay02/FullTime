
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import Header from './components/Header';
import EnhancedMatchCard from './components/EnhancedMatchCard';
import EnhancedPlayerCard from './components/EnhancedPlayerCard';
import LoadingSkeleton from './components/LoadingSkeleton';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';

const ReviewModal = lazy(() => import('./components/ReviewModal'));
const EntityProfile = lazy(() => import('./components/EntityProfile'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const LeagueDashboard = lazy(() => import('./components/LeagueDashboard'));
const About = lazy(() => import('./components/About'));
const TeamProfile = lazy(() => import('./components/TeamProfile'));
import { INITIAL_LIVE_MATCHES, INITIAL_EXCITING_MATCHES, INITIAL_HIGHEST_SCORING_MATCHES, getGenericImage } from './constants';
import {
  searchEntities,
  getLiveMatches,
  getExcitingMatches,
  getHighestScoringMatches,
  getLeagueMetrics,
  getExcitingPlayers
} from './services/footballService';
import { getHybridLiveMatches } from './services/hybridFootballService';
import { fetchTodaysFixtures, fetchLiveFixtures } from './services/apiFootballService';
import { getEnrichedLineups, extractFixtureId } from './services/lineupService';
import {
  getExcitingMatchesFromAPI,
  getHighestScoringMatchesFromAPI,
  getTopPlayersFromAPI,
  searchFromAPI
} from './services/apiFootballEnhanced';
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
import { Loader2, Plus, RefreshCw, Filter, Flame, TrendingUp, AlertCircle, X, ListPlus, Users, Star } from 'lucide-react';
import { getCachedData, setCachedData } from './services/cacheService';
import { getUserFavorites, addFavoriteTeam, removeFavoriteTeam, UserFavorites } from './services/favoritesService';

const App: React.FC = () => {
  const { toasts, removeToast, success, error: showError, info } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today'>('all');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'HOME' | 'SEARCH' | 'DETAILS' | 'PROFILE' | 'LEAGUES' | 'ABOUT' | 'TEAM'>('HOME');
  const [selectedTeam, setSelectedTeam] = useState<{ name: string; league?: string } | null>(null);
  const [previousView, setPreviousView] = useState<typeof view>('HOME');
  const [favorites, setFavorites] = useState<UserFavorites>({ teams: [], players: [], leagues: [] });
  const [favoriteMatches, setFavoriteMatches] = useState<Match[]>([]);

  // URL routing - sync view with URL
  useEffect(() => {
    const syncViewFromUrl = () => {
      const path = window.location.pathname;
      if (path === '/' || path === '/home') {
        setView('HOME');
      } else if (path === '/leagues') {
        setView('LEAGUES');
      } else if (path === '/about') {
        setView('ABOUT');
      } else if (path.startsWith('/profile')) {
        setView('PROFILE');
      } else if (path.startsWith('/search')) {
        setView('SEARCH');
      } else if (path.startsWith('/match')) {
        setView('DETAILS');
      }

      // Extract league from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const leagueParam = urlParams.get('league');
      if (leagueParam && Object.values(League).includes(leagueParam as League)) {
        setCurrentLeague(leagueParam as League);
      }
    };

    syncViewFromUrl();

    // Listen for browser back/forward
    window.addEventListener('popstate', syncViewFromUrl);
    return () => window.removeEventListener('popstate', syncViewFromUrl);
  }, []);

  // Update URL when view changes
  const updateUrl = useCallback((newView: typeof view, params?: Record<string, string>) => {
    const urlMap = {
      'HOME': '/',
      'LEAGUES': '/leagues',
      'ABOUT': '/about',
      'PROFILE': '/profile',
      'SEARCH': '/search',
      'DETAILS': '/match'
    };

    let url = urlMap[newView] || '/';

    if (params) {
      const searchParams = new URLSearchParams(params);
      url += '?' + searchParams.toString();
    }

    window.history.pushState({}, '', url);
  }, []);
  
  const [featuredMatches, setFeaturedMatches] = useState<Match[]>(INITIAL_LIVE_MATCHES);
  const [excitingMatches, setExcitingMatches] = useState<Match[]>(INITIAL_EXCITING_MATCHES);
  const [highestScoringMatches, setHighestScoringMatches] = useState<Match[]>(INITIAL_HIGHEST_SCORING_MATCHES);
  const [excitingPlayers, setExcitingPlayers] = useState<Entity[]>([]);

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
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

        // Load user favorites
        const userFavorites = await getUserFavorites(firebaseUser.uid);
        setFavorites(userFavorites);
      } else {
        setUser(null);
        setPlaylists([]);
        setFavorites({ teams: [], players: [], leagues: [] });
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
    try {
      const newPlaylist = {
        name,
        description: 'A custom collection of matches.',
        userId: user.id,
        matchIds: [],
        createdAt: new Date().toISOString()
      };
      console.log('Creating playlist:', newPlaylist);
      const docRef = await addDoc(collection(db, 'playlists'), newPlaylist);
      console.log('Playlist created with ID:', docRef.id);
      const playlist = { id: docRef.id, ...newPlaylist } as Playlist;
      setPlaylists(prev => [...prev, playlist]);

      // Clear cache to force refresh
      const cacheKey = `playlists_${user.id}`;
      setCachedData(cacheKey, [...playlists, playlist], 600);

      setIsPlaylistModalOpen(false);
      success(`Playlist "${name}" created successfully!`);
    } catch (error: any) {
      console.error('Failed to create playlist:', error);
      showError(`Failed to create playlist: ${error.message}`);
    }
  }, [user, playlists, success, showError]);

  const handleAddToPlaylist = useCallback(async (playlistId: string, matchId: string) => {
    try {
      const playlist = playlists.find(p => p.id === playlistId);
      if (!playlist) {
        showError('Playlist not found');
        return;
      }

      if (playlist.matchIds.includes(matchId)) {
        info('Match already in playlist');
        return;
      }

      const updatedIds = [...playlist.matchIds, matchId];
      await updateDoc(doc(db, 'playlists', playlistId), { matchIds: updatedIds });

      setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, matchIds: updatedIds } : p));
      setIsPlaylistModalOpen(false);
      success('Match added to playlist!');
    } catch (error: any) {
      console.error('Failed to add to playlist:', error);
      showError(`Failed to add match: ${error.message}`);
    }
  }, [playlists, success, showError, info]);

  const fetchLive = useCallback(async (forceRefresh: boolean = false) => {
    setIsRefreshing(true);
    try {
        // If forcing refresh, clear all caches
        if (forceRefresh) {
          const cacheKey = `live_v2_${currentLeague || 'all'}`;
          const hybridCacheKey = `hybrid_live_${new Date().toISOString().split('T')[0]}_${currentLeague || 'all'}`;
          const apiFootballCacheKey = `apif_today_${new Date().toISOString().split('T')[0]}`;
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(hybridCacheKey);
          localStorage.removeItem(apiFootballCacheKey);
        }

        let liveData: Match[] = [];

        // TIER 1: Try API-Football first (best real-time coverage)
        console.log('🏆 Tier 1: Trying API-Football (RapidAPI)...');
        liveData = await fetchTodaysFixtures();

        // Filter by league if specified
        if (liveData.length > 0 && currentLeague) {
          liveData = liveData.filter(m => m.league === currentLeague);
        }

        if (liveData.length > 0) {
          console.log(`✅ Using API-Football: ${liveData.length} matches loaded`);
        }

        // TIER 2: If API-Football fails, try football-data.org hybrid
        if (liveData.length === 0) {
          console.log('🥈 Tier 2: Trying football-data.org hybrid...');
          liveData = await getHybridLiveMatches(currentLeague || undefined);
          if (liveData.length > 0) {
            console.log(`✅ Using football-data.org hybrid: ${liveData.length} matches loaded`);
          }
        }

        // TIER 3: If both APIs fail, fall back to AI-only mode
        if (liveData.length === 0) {
          console.log('🥉 Tier 3: Falling back to Gemini AI-only mode...');
          liveData = await getLiveMatches(currentLeague || undefined);
          if (liveData.length > 0) {
            console.log(`✅ Using Gemini AI: ${liveData.length} matches generated`);
          }
        }

        setFeaturedMatches(liveData);

        if (forceRefresh) {
          success('Matches refreshed!');
        }
    } catch (err: any) {
      console.error('❌ All data sources failed:', err);
      setFeaturedMatches(INITIAL_LIVE_MATCHES);
      if (forceRefresh) {
        showError('Failed to refresh matches');
      }
    }
    finally { setIsRefreshing(false); }
  }, [currentLeague, success, showError]);

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

  // Progressive data loading - load in stages for faster initial render
  useEffect(() => {
    // Stage 1: Load cached live matches immediately
    fetchLive(false);

    // Stage 2: Load other matches progressively (API-first with Gemini fallback)
    setTimeout(async () => {
      try {
        console.log('🎯 Fetching exciting matches from API...');
        let exciting = await getExcitingMatchesFromAPI();

        // Fallback to Gemini if API fails
        if (exciting.length === 0) {
          console.log('🤖 API returned no data, falling back to Gemini...');
          exciting = await getExcitingMatches();
        }

        setExcitingMatches(exciting);
      } catch (err) {
        console.error('Failed to load exciting matches:', err);
        setExcitingMatches(await getExcitingMatches());
      }
    }, 100);

    setTimeout(async () => {
      try {
        console.log('🎯 Fetching highest scoring matches from API...');
        let highScoring = await getHighestScoringMatchesFromAPI();

        // Fallback to Gemini if API fails
        if (highScoring.length === 0) {
          console.log('🤖 API returned no data, falling back to Gemini...');
          highScoring = await getHighestScoringMatches();
        }

        setHighestScoringMatches(highScoring);
      } catch (err) {
        console.error('Failed to load highest scoring matches:', err);
        setHighestScoringMatches(await getHighestScoringMatches());
      }
    }, 200);

    // Stage 3: Load exciting players (API-first with Gemini fallback)
    setTimeout(async () => {
      try {
        console.log('🎯 Fetching top players from API...');
        let players = await getTopPlayersFromAPI();

        // Fallback to Gemini if API fails
        if (players.length === 0) {
          console.log('🤖 API returned no data, falling back to Gemini...');
          players = await getExcitingPlayers();
        }

        setExcitingPlayers(players);
      } catch (err) {
        console.error('Failed to load top players:', err);
        setExcitingPlayers(await getExcitingPlayers());
      }
    }, 300);

    // Stage 4: Real-time live match updates (like SofaScore)
    // Check for live matches every 30 seconds
    const liveInterval = setInterval(async () => {
      console.log('⚽ Checking for live match updates...');

      try {
        // Fetch only live fixtures from API-Football
        const liveMatches = await fetchLiveFixtures();

        if (liveMatches.length > 0) {
          // Update featured matches with latest live data
          setFeaturedMatches(prev => {
            const nonLiveMatches = prev.filter(m => m.status !== 'LIVE');
            return [...liveMatches, ...nonLiveMatches];
          });
          console.log(`✅ Updated ${liveMatches.length} live matches`);
        }
      } catch (error) {
        console.error('Failed to update live matches:', error);
      }
    }, 30000); // 30 seconds for live matches

    // Stage 5: Full refresh every 3 minutes for non-live matches
    const fullRefreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing all matches in background...');
      fetchLive(false); // Don't show toast for auto-refresh
    }, 180000); // 3 minutes

    return () => {
      clearInterval(liveInterval);
      clearInterval(fullRefreshInterval);
    };
  }, [currentLeague]); // Re-fetch when league changes

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true); setView('SEARCH');
    try {
      console.log(`🔍 Searching API for "${query}"...`);
      let results = await searchFromAPI(query);

      // Fallback to Gemini if API returns no results
      if (results.length === 0) {
        console.log('🤖 No API results, falling back to Gemini search...');
        results = await searchEntities(query);
      }

      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults(await searchEntities(query)); // Fallback to Gemini
    }
    finally { setIsLoading(false); }
  }, []);

  const handleEntityClick = useCallback(async (entity: Entity) => {
    setSelectedEntity(entity); setView('DETAILS');
    window.scrollTo(0, 0); fetchReviews(entity.id);

    // If it's a match from API-Football, fetch real or predicted lineups
    if (entity.type === 'MATCH' && entity.id.startsWith('apif_')) {
      const fixtureId = extractFixtureId(entity.id);

      if (fixtureId && 'homeTeam' in entity && 'awayTeam' in entity) {
        try {
          console.log(`📋 Fetching lineups for ${entity.homeTeam} vs ${entity.awayTeam}...`);
          const lineupData = await getEnrichedLineups(
            fixtureId,
            entity.homeTeam,
            entity.awayTeam,
            'league' in entity ? entity.league : undefined
          );

          if (lineupData) {
            // Update the selected entity with lineups (real or predicted)
            setSelectedEntity(prev => prev ? {
              ...prev,
              lineups: {
                home: lineupData.home,
                away: lineupData.away
              },
              bench: lineupData.bench,
              formation: {
                home: lineupData.homeFormation,
                away: lineupData.awayFormation
              },
              isPredictedLineup: lineupData.isPredicted,
              lineupConfidence: lineupData.confidence,
              lineupWatchability: lineupData.lineupWatchability
            } as Entity : null);

            const type = lineupData.isPredicted ? 'Predicted' : 'Actual';
            console.log(`✅ ${type} lineups loaded (watchability: ${lineupData.lineupWatchability?.toFixed(1)})`);
          }
        } catch (error) {
          console.error('❌ Failed to fetch lineups:', error);
        }
      }
    }
  }, [fetchReviews]);

  const handlePlaylistClick = useCallback((matchId: string) => {
    if (!user) { alert("Please login to create playlists."); return; }
    setPlaylistMatchId(matchId);
    setIsPlaylistModalOpen(true);
  }, [user]);

  const handleViewLeagues = useCallback(async () => {
    setView('LEAGUES');
    updateUrl('LEAGUES');
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
  }, [leagueMetrics.length, updateUrl]);

  const handleSelectLeague = useCallback((l: League | null) => {
    setCurrentLeague(l);
    setView('HOME');
    const params = l ? { league: l } : {};
    updateUrl('HOME', params);
  }, [updateUrl]);

  const handleGoHome = useCallback(() => {
    setView('HOME');
    setCurrentLeague(null);
    updateUrl('HOME');
  }, [updateUrl]);

  const handleGoBack = useCallback(() => {
    setView(previousView);
    window.scrollTo(0, 0);
  }, [previousView]);

  const handleTeamClick = useCallback((teamName: string, league?: string) => {
    setPreviousView(view);
    setSelectedTeam({ name: teamName, league });
    setView('TEAM');
    updateUrl('TEAM', { team: teamName });
  }, [view, updateUrl]);

  const handleProfileClick = useCallback((u: User) => {
    setProfileUser(u);
    setView('PROFILE');
    updateUrl('PROFILE', { user: u.id });
  }, [updateUrl]);

  const handleViewAbout = useCallback(() => {
    setView('ABOUT');
    updateUrl('ABOUT');
  }, [updateUrl]);

  const handleOpenReviewModal = useCallback(() => {
    if (selectedEntity) {
      setModalEntity(selectedEntity);
      setIsModalOpen(true);
    }
  }, [selectedEntity]);

  const handleCloseReviewModal = useCallback(() => setIsModalOpen(false), []);

  const handleSubmitReview = useCallback(async (rating: number, comment: string) => {
    if (!user || !modalEntity) {
      showError("Please login to submit a review.");
      return;
    }

    try {
      const review = {
        entityId: modalEntity.id,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        rating,
        comment,
        createdAt: new Date().toISOString(),
        likes: 0,
        entityName: modalEntity.name,
        entityImage: modalEntity.image,
        entityType: modalEntity.type
      };

      console.log('Submitting review:', review);
      const docRef = await addDoc(collection(db, 'reviews'), review);
      console.log('Review saved with ID:', docRef.id);

      // Add to reviews state
      setReviews(prev => [{ id: docRef.id, ...review }, ...prev]);

      success("Review submitted successfully!");
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      showError(`Failed to submit review: ${error.message}`);
    }
  }, [user, modalEntity, success, showError]);

  const handleLeagueClick = useCallback((l: League) => {
    setCurrentLeague(l);
    setView('HOME');
    updateUrl('HOME', { league: l });
  }, [updateUrl]);

  const handleToggleFavoriteTeam = useCallback(async (teamName: string) => {
    if (!user) {
      showError('Please login to add favorites');
      return;
    }

    try {
      const isFavorited = favorites.teams.includes(teamName);

      if (isFavorited) {
        await removeFavoriteTeam(user.id, teamName);
        setFavorites(prev => ({
          ...prev,
          teams: prev.teams.filter(t => t !== teamName)
        }));
        success(`Removed ${teamName} from favorites`);
      } else {
        await addFavoriteTeam(user.id, teamName);
        setFavorites(prev => ({
          ...prev,
          teams: [...prev.teams, teamName]
        }));
        success(`Added ${teamName} to favorites`);
      }
    } catch (error: any) {
      showError(`Failed to update favorites: ${error.message}`);
    }
  }, [user, favorites, success, showError]);

  // Filter matches by league and date
  const filteredFeaturedMatches = useMemo(() => {
    let matches = featuredMatches;

    // Filter by league
    if (currentLeague) {
      matches = matches.filter(m => m.league === currentLeague);
    }

    // Filter by date
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      matches = matches.filter(m => {
        // Assuming matches have a date field or we can extract from the match data
        return true; // For now, keep all matches
      });
    }

    return matches;
  }, [featuredMatches, currentLeague, dateFilter]);

  const filteredExcitingMatches = useMemo(() => {
    return currentLeague
      ? excitingMatches.filter(m => m.league === currentLeague)
      : excitingMatches;
  }, [excitingMatches, currentLeague]);

  const filteredHighestScoringMatches = useMemo(() => {
    return currentLeague
      ? highestScoringMatches.filter(m => m.league === currentLeague)
      : highestScoringMatches;
  }, [highestScoringMatches, currentLeague]);

  // Filter matches featuring favorite teams
  const filteredFavoriteMatches = useMemo(() => {
    if (favorites.teams.length === 0) return [];

    const allMatches = [...featuredMatches, ...excitingMatches, ...highestScoringMatches];
    const uniqueMatches = Array.from(new Map(allMatches.map(m => [m.id, m])).values());

    return uniqueMatches.filter(match =>
      favorites.teams.some(team =>
        match.homeTeam === team || match.awayTeam === team
      )
    ).slice(0, 8); // Limit to 8 matches
  }, [featuredMatches, excitingMatches, highestScoringMatches, favorites.teams]);

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
         onViewAbout={handleViewAbout}
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

              {/* Favorite Teams Section */}
              {user && filteredFavoriteMatches.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-6 border-l-4 border-yellow-500 pl-4">
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest">My Favorite Teams</h2>
                    <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredFavoriteMatches.map(m => (
                      <EnhancedMatchCard key={m.id} match={m} onClick={() => handleEntityClick(m)} />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="flex justify-between items-center mb-6 border-l-4 border-pitch-500 pl-4">
                  <h2 className="text-xl font-bold text-white uppercase tracking-widest">
                    Happening Now
                    {isRefreshing && <span className="ml-2 text-xs text-pitch-400 animate-pulse">• Live</span>}
                  </h2>
                  <button
                    onClick={() => fetchLive(true)}
                    disabled={isRefreshing}
                    className="text-xs text-gray-500 hover:text-pitch-400 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-dark-900 hover:scrollbar-thumb-pitch-600">
                   {isRefreshing && filteredFeaturedMatches.length === 0 ? (
                     <>
                       <div className="flex-shrink-0 w-80"><LoadingSkeleton type="match" count={1} /></div>
                       <div className="flex-shrink-0 w-80"><LoadingSkeleton type="match" count={1} /></div>
                       <div className="flex-shrink-0 w-80"><LoadingSkeleton type="match" count={1} /></div>
                       <div className="flex-shrink-0 w-80"><LoadingSkeleton type="match" count={1} /></div>
                     </>
                   ) : filteredFeaturedMatches.length > 0 ? filteredFeaturedMatches.map(m => (
                     <div key={m.id} className="relative group flex-shrink-0 w-80 snap-start">
                        <EnhancedMatchCard match={m} onClick={() => handleEntityClick(m)} />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition z-10">
                           <button onClick={(e) => { e.stopPropagation(); setModalEntity(m); setIsModalOpen(true); }} className="p-1.5 bg-black/60 rounded-full text-white hover:bg-pitch-600"><Plus size={14}/></button>
                           <button onClick={(e) => { e.stopPropagation(); handlePlaylistClick(m.id); }} className="p-1.5 bg-black/60 rounded-full text-white hover:bg-blue-600"><ListPlus size={14}/></button>
                        </div>
                     </div>
                   )) : (
                     <div className="w-full text-center py-12 text-gray-500">
                       No matches found for {currentLeague}. Try selecting a different league.
                     </div>
                   )}
                </div>
              </section>

              <section>
                 <div className="flex items-center gap-2 mb-6 border-l-4 border-orange-500 pl-4">
                   <h2 className="text-xl font-bold text-white uppercase tracking-widest">Weekly Highlights</h2>
                   <Flame size={18} className="text-orange-500" />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading && filteredExcitingMatches.length === 0 ? (
                      <LoadingSkeleton type="match" count={4} />
                    ) : filteredExcitingMatches.length > 0 ? filteredExcitingMatches.map(m => <EnhancedMatchCard key={m.id} match={m} onClick={() => handleEntityClick(m)} />) : (
                      <div className="col-span-full text-center py-12 text-gray-500">
                        No exciting matches found for {currentLeague}.
                      </div>
                    )}
                 </div>
              </section>

              {excitingPlayers.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-6 border-l-4 border-yellow-500 pl-4">
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest">Exciting Players to Watch</h2>
                    <Users size={18} className="text-yellow-500" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {excitingPlayers.map(player => (
                      <EnhancedPlayerCard
                        key={player.id}
                        player={player}
                        onClick={handleEntityClick}
                      />
                    ))}
                  </div>
                </section>
              )}
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
                onTeamClick={handleTeamClick}
             />
           </Suspense>
         )}

         {view === 'PROFILE' && profileUser && (
           <Suspense fallback={<div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-pitch-500" size={40} /></div>}>
             <UserProfile
               user={profileUser}
               reviews={userReviews}
               playlists={playlists.filter((p: Playlist) => p.userId === profileUser.id)}
               matches={[...featuredMatches, ...excitingMatches, ...highestScoringMatches]}
               isOwnProfile={user?.id === profileUser.id}
               onEntityClick={(id: string) => handleEntityClick({ id, name: '...', type: 'MATCH', image: getGenericImage(id)})}
               onMatchClick={(id: string) => {
                 // Find the full match object from state
                 const allMatches = [...featuredMatches, ...excitingMatches, ...highestScoringMatches];
                 const match = allMatches.find(m => m.id === id);
                 if (match) {
                   handleEntityClick(match);
                 }
               }}
             />
           </Suspense>
         )}

         {view === 'LEAGUES' && (
           <Suspense fallback={<div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-pitch-500" size={40} /></div>}>
             <LeagueDashboard metrics={leagueMetrics} onLeagueClick={handleLeagueClick} onMatchClick={handleEntityClick} isLoading={isLoading} />
           </Suspense>
         )}

         {view === 'ABOUT' && (
           <Suspense fallback={<div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-pitch-500" size={40} /></div>}>
             <About />
           </Suspense>
         )}

         {view === 'TEAM' && selectedTeam && (
           <Suspense fallback={<div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-pitch-500" size={40} /></div>}>
             <TeamProfile
               teamName={selectedTeam.name}
               league={selectedTeam.league}
               onBack={handleGoBack}
               onMatchClick={handleEntityClick}
               onPlayerClick={handleEntityClick}
               onToggleFavorite={handleToggleFavoriteTeam}
               isFavorited={favorites.teams.includes(selectedTeam.name)}
             />
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
          <ReviewModal entity={modalEntity} onClose={handleCloseReviewModal} onSubmit={handleSubmitReview} />
        </Suspense>
      )}

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default App;
