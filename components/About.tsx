
import React from 'react';
import { TrendingUp, Zap, Target, Brain, Sparkles, BarChart3, Trophy, Clock, Star, Users, Search, Shield } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pitch-600/20 to-orange-600/20 border border-pitch-500/50 rounded-full text-sm font-bold text-pitch-300 uppercase tracking-wider mb-6">
          <Sparkles size={16} className="text-orange-400" />
          About FullTime
          <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-[10px]">Beta</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Never Miss a <span className="bg-gradient-to-r from-pitch-400 to-orange-400 bg-clip-text text-transparent">Legendary</span> Match
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
          AI-powered football match discovery that helps you find the most entertaining games worth watching, explore teams, and follow your favorites.
        </p>
      </div>

      {/* Key Features Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-black text-white mb-8 text-center">
          Powerful Features
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-pitch-900/40 to-dark-800 border border-pitch-700/50 rounded-xl p-6 hover:border-pitch-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-pitch-600/20 rounded-lg">
                <Star className="text-yellow-400" size={24} />
              </div>
              <h3 className="text-xl font-black text-white">Favorite Teams</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Save your favorite teams and get a personalized feed of matches featuring them. Never miss when your teams are playing.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/40 to-dark-800 border border-blue-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Users className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-black text-white">Team Profiles</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Explore comprehensive team pages with current squad, recent matches, manager info, formations, and team quality ratings.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-dark-800 border border-purple-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <Shield className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-black text-white">AI Predicted Lineups</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Get AI-generated predicted starting XIs when official lineups aren't available yet, with confidence ratings and watchability scores.
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-900/40 to-dark-800 border border-orange-700/50 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-600/20 rounded-lg">
                <Search className="text-orange-400" size={24} />
              </div>
              <h3 className="text-xl font-black text-white">Smart Discovery</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Find matches by league, team, or player. AI-powered search understands context and delivers the most relevant results.
            </p>
          </div>
        </div>
      </div>

      {/* Watchability Score Section */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-pitch-600/20 rounded-lg">
            <Sparkles className="text-pitch-400" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Watchability Score</h2>
            <p className="text-gray-400 text-sm">How we calculate it</p>
          </div>
        </div>

        <p className="text-gray-300 mb-6 leading-relaxed">
          Our watchability score (0-100) uses advanced AI analysis to evaluate how entertaining a match will be.
          Here's what goes into the calculation:
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-dark-900/50 border border-dark-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Zap className="text-orange-400 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-white mb-1">Match Intensity</h3>
                <p className="text-sm text-gray-400">
                  Goals scored, shots on target, possession battles, and attacking play frequency
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-900/50 border border-dark-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="text-blue-400 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-white mb-1">Drama Factor</h3>
                <p className="text-sm text-gray-400">
                  Comebacks, late goals, close scorelines, and momentum swings
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-900/50 border border-dark-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trophy className="text-yellow-400 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-white mb-1">Team Quality</h3>
                <p className="text-sm text-gray-400">
                  League standings, recent form, head-to-head history, and rivalry intensity
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-900/50 border border-dark-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Target className="text-green-400 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-white mb-1">Match Stakes</h3>
                <p className="text-sm text-gray-400">
                  Title races, relegation battles, derby matches, and knockout stages
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-pitch-900/20 border border-pitch-700/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Brain className="text-pitch-400 mt-1" size={20} />
            <div>
              <h3 className="font-bold text-white mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Our system uses Google's Gemini AI to analyze thousands of data points including
                real-time match events, historical statistics, player performance, tactical setups,
                and crowd engagement to predict match entertainment value.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Ranges */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
          <BarChart3 className="text-pitch-400" size={24} />
          Score Ranges
        </h2>

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-16 text-center">
              <div className="text-2xl font-black text-orange-400">90+</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-orange-500/20 border border-orange-500/50 rounded text-xs font-bold text-orange-300 uppercase">
                  Must Watch
                </span>
                <span className="text-sm font-bold text-white">Legendary</span>
              </div>
              <p className="text-sm text-gray-400">
                Absolute classics - thrillers, comebacks, historic moments, or high-stakes drama
              </p>
            </div>
          </div>

          <div className="h-px bg-dark-700"></div>

          <div className="flex items-center gap-4">
            <div className="w-16 text-center">
              <div className="text-2xl font-black text-pitch-400">75-89</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-pitch-500/20 border border-pitch-500/50 rounded text-xs font-bold text-pitch-300 uppercase">
                  Highly Rated
                </span>
                <span className="text-sm font-bold text-white">Excellent</span>
              </div>
              <p className="text-sm text-gray-400">
                High-quality matches with great attacking play, multiple goals, and entertaining action
              </p>
            </div>
          </div>

          <div className="h-px bg-dark-700"></div>

          <div className="flex items-center gap-4">
            <div className="w-16 text-center">
              <div className="text-2xl font-black text-blue-400">60-74</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-white">Good</span>
              </div>
              <p className="text-sm text-gray-400">
                Solid entertainment value - competitive matches with decent quality and moments of excitement
              </p>
            </div>
          </div>

          <div className="h-px bg-dark-700"></div>

          <div className="flex items-center gap-4">
            <div className="w-16 text-center">
              <div className="text-2xl font-black text-gray-500">{'<60'}</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-gray-400">Average</span>
              </div>
              <p className="text-sm text-gray-400">
                Standard matches - may lack excitement or have defensive/slow-paced gameplay
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-black text-white mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pitch-600/20 rounded-full mb-4">
              <span className="text-2xl font-black text-pitch-400">1</span>
            </div>
            <h3 className="font-bold text-white mb-2">Browse Matches</h3>
            <p className="text-sm text-gray-400">
              Explore live, upcoming, and recent matches from top leagues worldwide
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600/20 rounded-full mb-4">
              <span className="text-2xl font-black text-orange-400">2</span>
            </div>
            <h3 className="font-bold text-white mb-2">Check Watchability</h3>
            <p className="text-sm text-gray-400">
              See AI-powered ratings for match entertainment and quality
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-full mb-4">
              <span className="text-2xl font-black text-blue-400">3</span>
            </div>
            <h3 className="font-bold text-white mb-2">Follow & Track</h3>
            <p className="text-sm text-gray-400">
              Save favorites, explore teams, and get personalized recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-pitch-500/50 transition-all duration-300">
          <Clock className="text-pitch-400 mb-4" size={28} />
          <h3 className="text-lg font-black text-white mb-2">Real-Time Data</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Live scores, lineups, and match events updated in real-time from trusted sources.
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-pitch-500/50 transition-all duration-300">
          <Brain className="text-pitch-400 mb-4" size={28} />
          <h3 className="text-lg font-black text-white mb-2">Smart Insights</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            AI-powered analysis of player form, team quality, and tactical matchups.
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-pitch-500/50 transition-all duration-300">
          <Trophy className="text-pitch-400 mb-4" size={28} />
          <h3 className="text-lg font-black text-white mb-2">Multi-League</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Coverage across Premier League, La Liga, Serie A, Bundesliga, and more.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-8 border-t border-dark-700">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pitch-600 to-green-300 flex items-center justify-center">
            <span className="font-bold text-dark-900 text-lg">F</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl text-white">FullTime</span>
            <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full">
              Beta
            </span>
          </div>
        </div>
        <p className="text-gray-400 text-sm mb-2">
          Built with <span className="text-pitch-400">♥</span> using Google Gemini AI, React, TypeScript, and Firebase
        </p>
        <p className="text-gray-500 text-xs mb-4">
          Match data from API-Football • AI analysis powered by Gemini 2.0
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span>v1.0.0-beta</span>
          <span>•</span>
          <span>© 2026 FullTime</span>
          <span>•</span>
          <span>All Rights Reserved</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(About);
