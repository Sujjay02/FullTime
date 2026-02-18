import React, { useState, useMemo } from 'react';
import { LeagueMetric, League, Match } from '../types';
import { Search, TrendingUp, Trophy, ArrowRight, Flame } from 'lucide-react';
import MatchCard from './MatchCard';
import { getScoreTextColor, getProgressBarColor } from '../utils/scoreUtils';

interface LeagueDashboardProps {
  metrics: LeagueMetric[];
  onLeagueClick: (league: League) => void;
  onMatchClick: (match: Match) => void;
  isLoading: boolean;
}

const LeagueDashboard: React.FC<LeagueDashboardProps> = ({ metrics, onLeagueClick, onMatchClick, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMetrics = useMemo(() => {
    return metrics
      .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.avgWatchability - a.avgWatchability);
  }, [metrics, searchTerm]);

  return (
    <div className="space-y-8 min-h-[60vh] animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Trophy className="text-pitch-400" size={24} /> League Watchability Index
          </h2>
          <p className="text-zinc-500 text-sm mt-1">Ranked by average excitement score of recent matches.</p>
        </div>
        <div className="relative w-full md:w-60">
          <input
            type="text"
            placeholder="Search leagues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.06] rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-white/[0.12] focus:outline-none transition"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pitch-500 mb-4" />
          <p className="text-zinc-500 text-sm">Loading league data...</p>
        </div>
      ) : filteredMetrics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Trophy size={40} className="text-zinc-700 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400 mb-2">No League Data Available</h3>
          <p className="text-zinc-600 text-sm max-w-md">Unable to fetch league metrics. Try refreshing the page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredMetrics.map((metric, index) => (
            <div key={metric.id} className="bg-dark-800 border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.1] transition duration-300 group">
              <div className="flex flex-col lg:flex-row">
                {/* Stats */}
                <div className="p-5 lg:w-1/3 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white rounded-full p-1.5 flex items-center justify-center shadow-md">
                        {metric.logo ? <img src={metric.logo} alt={metric.name} className="max-w-full max-h-full" /> : <span className="font-bold text-black text-xs">{metric.name.substring(0, 2)}</span>}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{metric.name}</h3>
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Rank #{index + 1}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-xs font-semibold text-zinc-500 uppercase">Watchability</span>
                        <span className={`text-2xl font-bold font-mono ${getScoreTextColor(metric.avgWatchability)}`}>{metric.avgWatchability.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 bg-dark-900 rounded-full overflow-hidden">
                        <div className={`h-full ${getProgressBarColor(metric.avgWatchability)} transition-all duration-1000 rounded-full`} style={{ width: `${(metric.avgWatchability / 15) * 100}%` }} />
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-1.5">Based on {metric.matchCount} recent matches</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onLeagueClick(metric.name as League)}
                    className="mt-5 flex items-center justify-between w-full px-3.5 py-2 bg-white/[0.05] hover:bg-pitch-600 rounded-lg text-sm text-white font-semibold transition"
                  >
                    <span>View Matches</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* Featured Match */}
                <div className="p-5 lg:w-2/3">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="text-orange-500" size={16} />
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Top Match</span>
                  </div>
                  {metric.topMatch ? (
                    <div className="max-w-sm">
                      <MatchCard match={metric.topMatch} onClick={() => onMatchClick(metric.topMatch!)} hoverEffect={false} />
                    </div>
                  ) : (
                    <div className="text-zinc-600 text-sm">No recent match data.</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(LeagueDashboard);
