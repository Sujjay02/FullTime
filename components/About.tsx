import React from 'react';
import { TrendingUp, Zap, Target, Brain, Sparkles, BarChart3, Trophy, Clock, Star, Users, Search, Shield } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 pb-20 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pitch-600/10 border border-pitch-500/30 rounded-full text-sm font-semibold text-pitch-300 uppercase tracking-wider mb-5">
          <Sparkles size={14} className="text-orange-400" /> About FullTime
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Never Miss a <span className="text-pitch-400">Legendary</span> Match
        </h1>
        <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          AI-powered football match discovery that helps you find the most entertaining games, explore teams, and follow your favorites.
        </p>
      </div>

      {/* Features */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: <Star className="text-amber-400" size={22} />, title: 'Favorite Teams', desc: 'Save your favorite teams and get a personalized feed of matches featuring them.', color: 'from-amber-900/20 to-dark-800 border-amber-700/30' },
            { icon: <Users className="text-blue-400" size={22} />, title: 'Team Profiles', desc: 'Comprehensive team pages with squad, recent matches, manager info, and quality ratings.', color: 'from-blue-900/20 to-dark-800 border-blue-700/30' },
            { icon: <Shield className="text-violet-400" size={22} />, title: 'AI Predicted Lineups', desc: 'AI-generated predicted starting XIs with confidence ratings and watchability scores.', color: 'from-violet-900/20 to-dark-800 border-violet-700/30' },
            { icon: <Search className="text-orange-400" size={22} />, title: 'Smart Discovery', desc: 'AI-powered search that understands context and delivers relevant results.', color: 'from-orange-900/20 to-dark-800 border-orange-700/30' },
          ].map(f => (
            <div key={f.title} className={`bg-gradient-to-br ${f.color} border rounded-xl p-5 hover:border-opacity-60 transition`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/[0.05] rounded-lg">{f.icon}</div>
                <h3 className="text-lg font-bold text-white">{f.title}</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Watchability */}
      <div className="bg-dark-800 border border-white/[0.06] rounded-xl p-6 mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-pitch-600/15 rounded-lg"><Sparkles className="text-pitch-400" size={22} /></div>
          <div>
            <h2 className="text-xl font-bold text-white">Watchability Score</h2>
            <p className="text-zinc-500 text-sm">How we calculate it</p>
          </div>
        </div>
        <p className="text-zinc-400 mb-5 leading-relaxed text-sm">
          Our watchability score uses AI analysis to evaluate how entertaining a match will be, considering multiple factors:
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { icon: <Zap className="text-orange-400" size={18} />, title: 'Match Intensity', desc: 'Goals, shots, possession battles, attacking frequency' },
            { icon: <TrendingUp className="text-blue-400" size={18} />, title: 'Drama Factor', desc: 'Comebacks, late goals, close scorelines, momentum swings' },
            { icon: <Trophy className="text-amber-400" size={18} />, title: 'Team Quality', desc: 'League standings, form, head-to-head, rivalry intensity' },
            { icon: <Target className="text-emerald-400" size={18} />, title: 'Match Stakes', desc: 'Title races, relegation, derbies, knockout stages' },
          ].map(f => (
            <div key={f.title} className="bg-dark-900/50 border border-white/[0.04] rounded-lg p-3.5 flex items-start gap-3">
              <div className="mt-0.5 shrink-0">{f.icon}</div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-0.5">{f.title}</h3>
                <p className="text-xs text-zinc-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3.5 bg-pitch-900/15 border border-pitch-700/30 rounded-lg flex items-start gap-3">
          <Brain className="text-pitch-400 mt-0.5 shrink-0" size={18} />
          <div>
            <h3 className="font-semibold text-white text-sm mb-1">AI-Powered</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Using Gemini AI to analyze real-time match events, historical stats, player performance, and tactical setups.
            </p>
          </div>
        </div>
      </div>

      {/* Score Ranges */}
      <div className="bg-dark-800 border border-white/[0.06] rounded-xl p-6 mb-10">
        <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
          <BarChart3 className="text-pitch-400" size={20} /> Score Ranges
        </h2>
        <div className="space-y-3">
          {[
            { range: '9+', label: 'Must Watch', color: 'text-orange-400', badge: 'bg-orange-500/15 border-orange-500/30 text-orange-300' },
            { range: '7-9', label: 'Highly Rated', color: 'text-pitch-400', badge: 'bg-pitch-500/15 border-pitch-500/30 text-pitch-300' },
            { range: '5-7', label: 'Good', color: 'text-blue-400', badge: '' },
            { range: '<5', label: 'Average', color: 'text-zinc-500', badge: '' },
          ].map((s, i) => (
            <React.Fragment key={s.range}>
              {i > 0 && <div className="h-px bg-white/[0.04]" />}
              <div className="flex items-center gap-4">
                <div className="w-12 text-center">
                  <div className={`text-xl font-bold ${s.color}`}>{s.range}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {s.badge && <span className={`px-2 py-0.5 ${s.badge} border rounded text-xs font-semibold uppercase`}>{s.label}</span>}
                    <span className="text-sm font-semibold text-white">{s.label}</span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-dark-800 border border-white/[0.06] rounded-xl p-6 mb-10">
        <h2 className="text-xl font-bold text-white mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Browse Matches', desc: 'Explore live, upcoming, and recent matches from top leagues', color: 'bg-pitch-600/15 text-pitch-400' },
            { step: '2', title: 'Check Watchability', desc: 'See AI-powered ratings for entertainment and quality', color: 'bg-orange-600/15 text-orange-400' },
            { step: '3', title: 'Follow & Track', desc: 'Save favorites, explore teams, get recommendations', color: 'bg-blue-600/15 text-blue-400' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 ${s.color} rounded-full mb-3`}>
                <span className="text-lg font-bold">{s.step}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">{s.title}</h3>
              <p className="text-sm text-zinc-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional features */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: <Clock className="text-pitch-400" size={22} />, title: 'Real-Time Data', desc: 'Live scores, lineups, and events updated in real-time.' },
          { icon: <Brain className="text-pitch-400" size={22} />, title: 'Smart Insights', desc: 'AI analysis of player form, team quality, and tactics.' },
          { icon: <Trophy className="text-pitch-400" size={22} />, title: 'Multi-League', desc: 'Premier League, La Liga, Serie A, Bundesliga, and more.' },
        ].map(f => (
          <div key={f.title} className="bg-dark-800 border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition">
            <div className="mb-3">{f.icon}</div>
            <h3 className="text-base font-bold text-white mb-1">{f.title}</h3>
            <p className="text-zinc-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center pt-6 border-t border-white/[0.06]">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-pitch-600 flex items-center justify-center">
            <span className="font-black text-white text-sm">F</span>
          </div>
          <span className="font-bold text-lg text-white">FullTime</span>
        </div>
        <p className="text-zinc-500 text-sm mb-1">Built with Gemini AI, React, TypeScript, and Firebase</p>
        <p className="text-zinc-600 text-xs">v1.0.0-beta · 2026 FullTime</p>
      </div>
    </div>
  );
};

export default React.memo(About);
