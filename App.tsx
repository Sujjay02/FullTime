import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import Toast from './components/Toast';

import Home from './pages/Home';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import Player from './pages/Player';
import Team from './pages/Team';
import League from './pages/League';
import Leagues from './pages/Leagues';
import Schedule from './pages/Schedule';
import Diary from './pages/Diary';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import Search from './pages/Search';
import Members from './pages/Members';

function NotFound() {
  return (
    <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
      <div style={{ fontSize: 72, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.04em', lineHeight: 1 }}>
        404
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '16px 0 8px', color: 'var(--text-primary)' }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        The page you're looking for doesn't exist.
      </p>
      <a href="/" className="btn-primary" style={{ display: 'inline-flex' }}>Go home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/match/:id" element={<MatchDetail />} />
                <Route path="/player/:id" element={<Player />} />
                <Route path="/team/:id" element={<Team />} />
                <Route path="/leagues" element={<Leagues />} />
                <Route path="/league/:code" element={<League />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/diary" element={<Diary />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/profile/:uid" element={<Profile />} />
                <Route path="/lists" element={<Lists />} />
                <Route path="/list/:id" element={<ListDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/members" element={<Members />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Toast />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
