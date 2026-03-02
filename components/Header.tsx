import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, LogOut, User, BookOpen, Clock, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, profile, signIn, signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const navLinks = [
    { to: '/matches', label: 'Matches' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/leagues', label: 'Leagues' },
    { to: '/members', label: 'Members' },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header style={{
      background: 'rgba(20,24,28,0.97)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 56, gap: 24 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#000',
            }}>
              FT
            </div>
            <span style={{
              fontSize: 16, fontWeight: 700, letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              display: 'none',
            }}
              className="logo-text"
            >
              FullTime
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 500,
                  color: isActive(l.to) ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { if (!isActive(l.to)) (e.target as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { if (!isActive(l.to)) (e.target as HTMLElement).style.color = 'var(--text-secondary)'; }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 320, display: 'flex' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                className="input-dark"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search matches, players, teams…"
                style={{ width: '100%', paddingLeft: 32, fontSize: 13, height: 34 }}
              />
            </div>
          </form>

          {/* Auth area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {!user ? (
              <button
                onClick={signIn}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: 13 }}
              >
                Sign in
              </button>
            ) : (
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-primary)', padding: '4px 6px', borderRadius: 4,
                  }}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName ?? ''}
                      style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--accent)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000',
                    }}>
                      {(user.displayName ?? 'A')[0].toUpperCase()}
                    </div>
                  )}
                  <ChevronDown size={12} color="var(--text-muted)" />
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 4,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 8, minWidth: 200, padding: 4,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    zIndex: 200,
                  }}>
                    <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {user.displayName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        @{profile?.username}
                      </div>
                    </div>
                    {[
                      { to: `/profile/${user.uid}`, icon: <User size={13} />, label: 'Profile' },
                      { to: `/diary`, icon: <BookOpen size={13} />, label: 'Diary' },
                      { to: `/watchlist`, icon: <Clock size={13} />, label: 'Watchlist' },
                      { to: `/lists`, icon: <List size={13} />, label: 'My Lists' },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', borderRadius: 4, width: '100%',
                          color: 'var(--text-secondary)', fontSize: 13, transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', borderRadius: 4, width: '100%',
                          color: 'var(--text-muted)', fontSize: 13, background: 'none',
                          border: 'none', cursor: 'pointer', transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <LogOut size={13} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(o => !o)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', padding: 4, display: 'none',
              }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav style={{
            borderTop: '1px solid var(--border)', padding: '12px 0',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  padding: '10px 4px',
                  fontSize: 14, fontWeight: 500,
                  color: isActive(l.to) ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .logo-text { display: inline !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
