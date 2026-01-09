
import React from 'react';
import { TrendingUp, Zap, Target, Brain, Sparkles, BarChart3, Trophy, Clock } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-2 bg-pitch-600/20 border border-pitch-500/50 rounded-full text-sm font-bold text-pitch-300 uppercase tracking-wider mb-6">
          About FullTime
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Never Miss a <span className="text-pitch-400">Legendary</span> Match
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
          AI-powered football match discovery that helps you find the most entertaining games worth watching.
        </p>
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

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <Clock className="text-pitch-400 mb-4" size={32} />
          <h3 className="text-xl font-black text-white mb-2">Real-Time Updates</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Live match data, scores, and events updated in real-time. Get instant notifications
            when legendary matches are happening.
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <Brain className="text-pitch-400 mb-4" size={32} />
          <h3 className="text-xl font-black text-white mb-2">Personalized Recommendations</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            AI learns from your viewing history and preferences to suggest matches you'll love.
            Never miss games from your favorite teams or leagues.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-8 border-t border-dark-700">
        <p className="text-gray-400 text-sm">
          Built with <span className="text-pitch-400">♥</span> using Google Gemini AI, React, and Firebase
        </p>
        <p className="text-gray-500 text-xs mt-2">
          All match data is sourced from public football APIs and verified through AI analysis
        </p>
      </div>
    </div>
  );
};

export default React.memo(About);
