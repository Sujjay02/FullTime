
import React, { useState } from 'react';
import { Search, Menu, User as UserIcon, LogOut, Settings, BarChart2 } from 'lucide-react';
import { User, League } from '../types';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
  onSelectLeague: (league: League | null) => void;
  onGoHome: () => void;
  onProfileClick: (user: User) => void;
  onViewLeagues: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout, onSearch, onSelectLeague, onGoHome, onProfileClick, onViewLeagues }) => {
  const [query, setQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleProfileNav = () => {
    if (user) {
      onProfileClick(user);
      setShowUserMenu(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-900/95 backdrop-blur-md border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <button onClick={onGoHome} className="flex items-center gap-2 group">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pitch-600 to-green-300 flex items-center justify-center">
                <span className="font-bold text-dark-900 text-lg">F</span>
             </div>
             <span className="font-bold text-xl tracking-tight text-white group-hover:text-pitch-500 transition">FullTime</span>
          </button>

          <nav className="hidden md:flex items-center gap-6">
             <button onClick={onGoHome} className="text-gray-300 hover:text-white text-sm font-medium transition">Home</button>
             
             <div className="relative group">
               <button className="text-gray-300 hover:text-white text-sm font-medium transition flex items-center gap-1">
                 Leagues
               </button>
               {/* Dropdown for leagues */}
               <div className="absolute top-full left-0 mt-2 w-56 bg-dark-800 border border-dark-700 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                  <div className="py-2">
                    <button 
                        onClick={onViewLeagues}
                        className="w-full text-left px-4 py-2 text-sm text-pitch-400 font-bold hover:text-pitch-300 hover:bg-dark-700 transition flex items-center gap-2"
                    >
                        <BarChart2 size={14} /> League Dashboard
                    </button>
                    <div className="border-t border-dark-700 my-1"></div>
                    {Object.values(League).map(league => (
                      <button 
                        key={league}
                        onClick={() => onSelectLeague(league)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-700 transition"
                      >
                        {league}
                      </button>
                    ))}
                    <div className="border-t border-dark-700 my-1"></div>
                     <button 
                        onClick={() => onSelectLeague(null)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-700 transition"
                      >
                        All Matches
                      </button>
                  </div>
               </div>
             </div>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
           <form onSubmit={handleSearchSubmit} className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search matches, players, teams..." 
                className="w-full bg-dark-800 border border-transparent focus:border-dark-600 rounded-full py-1.5 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:bg-dark-700 transition"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
           </form>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {!user ? (
            <button 
              onClick={onLogin}
              className="hidden sm:block text-gray-300 font-bold text-sm hover:text-white tracking-wide uppercase"
            >
              Sign In
            </button>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                 <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-dark-600" />
                 <span className="hidden lg:block text-sm font-medium text-gray-200">{user.handle}</span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded shadow-xl py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                   <div className="px-4 py-2 border-b border-dark-700 mb-2 cursor-pointer" onClick={handleProfileNav}>
                      <p className="text-white font-medium text-sm truncate">{user.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user.handle}</p>
                   </div>
                   <button onClick={handleProfileNav} className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-700 flex items-center gap-2">
                     <UserIcon size={14} /> Profile
                   </button>
                   <button className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-700 flex items-center gap-2">
                     <Settings size={14} /> Settings
                   </button>
                   <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-dark-700 flex items-center gap-2">
                     <LogOut size={14} /> Log Out
                   </button>
                </div>
              )}
            </div>
          )}
          
          <button 
            className="sm:hidden text-gray-300" 
            onClick={() => onSelectLeague(null)} // Simplified mobile trigger
          >
             <Menu size={24} />
          </button>
        </div>

      </div>
      
      {/* Mobile Search (visible only on small screens) */}
      <div className="sm:hidden border-t border-dark-700 p-2 bg-dark-900">
         <form onSubmit={handleSearchSubmit} className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..." 
                className="w-full bg-dark-800 border-none rounded py-2 pl-9 pr-3 text-sm text-white"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
         </form>
      </div>
    </header>
  );
};

export default Header;
