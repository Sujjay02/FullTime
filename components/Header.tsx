import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Menu, X, User as UserIcon, LogOut, BarChart2, Loader2, ChevronDown } from 'lucide-react';
import { User, League } from '../types';
import { useDebounce } from '../hooks/useDebounce';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
  onSelectLeague: (league: League | null) => void;
  onGoHome: () => void;
  onProfileClick: (user: User) => void;
  onViewLeagues: () => void;
  onViewAbout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout, onSearch, onSelectLeague, onGoHome, onProfileClick, onViewLeagues, onViewAbout }) => {
  const [query, setQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showLeagueDropdown, setShowLeagueDropdown] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const leagueRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      setIsSearching(true);
      onSearch(debouncedQuery);
      setTimeout(() => setIsSearching(false), 500);
    }
  }, [debouncedQuery, onSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (leagueRef.current && !leagueRef.current.contains(e.target as Node)) setShowLeagueDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length >= 2) setIsSearching(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-dark-950/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <button onClick={onGoHome} className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-pitch-600 flex items-center justify-center shadow-lg shadow-pitch-600/20">
            <span className="font-black text-white text-sm">F</span>
          </div>
          <span className="font-bold text-lg text-white group-hover:text-pitch-400 transition hidden sm:block">FullTime</span>
        </button>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          <button onClick={onGoHome} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-md hover:bg-white/[0.05] transition">Home</button>
          <button onClick={onViewLeagues} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-md hover:bg-white/[0.05] transition flex items-center gap-1.5">
            <BarChart2 size={14} /> Leagues
          </button>
          <div ref={leagueRef} className="relative">
            <button onClick={() => setShowLeagueDropdown(!showLeagueDropdown)} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-md hover:bg-white/[0.05] transition flex items-center gap-1">
              Filter <ChevronDown size={12} />
            </button>
            {showLeagueDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-56 bg-dark-800 border border-white/[0.08] rounded-lg shadow-2xl py-1 max-h-80 overflow-y-auto z-50">
                <button onClick={() => { onSelectLeague(null); setShowLeagueDropdown(false); }} className="w-full text-left px-3 py-2 text-sm text-pitch-400 font-semibold hover:bg-white/[0.05] transition">All Matches</button>
                <div className="h-px bg-white/[0.06] my-1" />
                {Object.values(League).map(league => (
                  <button key={league} onClick={() => { onSelectLeague(league); setShowLeagueDropdown(false); }} className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.05] transition">{league}</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={onViewAbout} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-md hover:bg-white/[0.05] transition">About</button>
        </nav>

        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input type="text" value={query} onChange={handleQueryChange} placeholder="Search matches, players, teams..." className="w-full bg-white/[0.05] border border-transparent focus:border-white/[0.1] rounded-lg py-1.5 pl-9 pr-8 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:bg-white/[0.07] transition" />
            {isSearching ? <Loader2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pitch-400 animate-spin" /> : <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />}
            {query && <button type="button" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"><X size={12} /></button>}
          </form>
        </div>

        <div className="flex items-center gap-2">
          {!user ? (
            <button onClick={onLogin} className="hidden sm:flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-pitch-600 hover:bg-pitch-500 rounded-lg transition shadow-sm">Sign In</button>
          ) : (
            <div ref={menuRef} className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 hover:opacity-80 transition">
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full ring-1 ring-white/10" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-dark-800 border border-white/[0.08] rounded-lg shadow-2xl py-1 z-50">
                  <div className="px-3 py-2.5 border-b border-white/[0.06]">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.handle}</p>
                  </div>
                  <button onClick={() => { onProfileClick(user); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.05] flex items-center gap-2 transition"><UserIcon size={14} /> Profile</button>
                  <button onClick={() => { onLogout(); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/[0.05] flex items-center gap-2 transition"><LogOut size={14} /> Log Out</button>
                </div>
              )}
            </div>
          )}
          <button className="md:hidden text-zinc-400 hover:text-white p-1" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <div className="md:hidden border-t border-white/[0.06] bg-dark-950/95 backdrop-blur-xl px-4 py-3 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="w-full bg-white/[0.05] rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-zinc-500 focus:outline-none" />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          </form>
          <div className="flex flex-col gap-1">
            <button onClick={() => { onGoHome(); setShowMobileMenu(false); }} className="text-left py-2 px-3 text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] rounded-md transition">Home</button>
            <button onClick={() => { onViewLeagues(); setShowMobileMenu(false); }} className="text-left py-2 px-3 text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] rounded-md transition">Leagues</button>
            <button onClick={() => { onViewAbout(); setShowMobileMenu(false); }} className="text-left py-2 px-3 text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] rounded-md transition">About</button>
            {!user && <button onClick={() => { onLogin(); setShowMobileMenu(false); }} className="text-left py-2 px-3 text-sm text-pitch-400 font-semibold hover:bg-white/[0.05] rounded-md transition">Sign In</button>}
          </div>
        </div>
      )}
    </header>
  );
};

export default React.memo(Header);
