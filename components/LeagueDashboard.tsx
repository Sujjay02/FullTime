
import React, { useState, useMemo } from 'react';
import { LeagueMetric, League, Match } from '../types';
import { Search, TrendingUp, Trophy, ArrowRight, Activity, Flame } from 'lucide-react';
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
    <div className="space-y-8 min-h-[60vh] animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-dark-700 pb-6">
        <div>
           <h2 className="text-2xl font-black text-white flex items-center gap-3">
             <Trophy className="text-pitch-500" /> League Watchability Index
           </h2>
           <p className="text-gray-400 text-sm mt-1">
             Ranked by the average excitement score of their recent matches.
           </p>
        </div>

        <div className="relative w-full md:w-64">
           <input 
              type="text" 
              placeholder="Search leagues..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:border-pitch-500 focus:outline-none"
           />
           <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pitch-500 mb-4"></div>
             <p className="text-gray-400 text-sm">Loading league data...</p>
          </div>
      ) : filteredMetrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <Trophy size={48} className="text-gray-600 mb-4" />
             <h3 className="text-xl font-bold text-gray-400 mb-2">No League Data Available</h3>
             <p className="text-gray-500 text-sm max-w-md">
               Unable to fetch league metrics. This could be due to API limitations.
               Check the browser console for details or try refreshing the page.
             </p>
          </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
           {filteredMetrics.map((metric, index) => (
             <div 
               key={metric.id} 
               className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden hover:border-pitch-600/50 transition duration-300 group"
             >
                <div className="flex flex-col lg:flex-row">
                   
                   {/* League Stats Column */}
                   <div className="p-6 lg:w-1/3 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-dark-700 bg-dark-800/50">
                      <div>
                         <div className="flex items-center gap-4 mb-2">
                             <div className="w-12 h-12 bg-white rounded-full p-2 flex items-center justify-center shadow-lg">
                                {metric.logo ? (
                                    <img src={metric.logo} alt={metric.name} className="max-w-full max-h-full" />
                                ) : (
                                    <span className="font-bold text-black text-xs">{metric.name.substring(0,2)}</span>
                                )}
                             </div>
                             <div>
                                <h3 className="text-xl font-bold text-white">{metric.name}</h3>
                                <span className="text-xs text-gray-500 uppercase font-bold">Rank #{index + 1}</span>
                             </div>
                         </div>
                         
                         <div className="mt-6">
                            <div className="flex justify-between items-end mb-1">
                               <span className="text-xs font-bold text-gray-400 uppercase">Watchability Score</span>
                               <span className={`text-3xl font-black font-mono ${getScoreTextColor(metric.avgWatchability)}`}>
                                 {metric.avgWatchability.toFixed(1)}
                               </span>
                            </div>
                            <div className="h-2 bg-dark-900 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full ${getProgressBarColor(metric.avgWatchability)} transition-all duration-1000`} 
                                 style={{ width: `${(metric.avgWatchability / 15) * 100}%` }}
                               ></div>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2">
                               Based on avg of last {metric.matchCount} matches
                            </p>
                         </div>
                      </div>

                      <button 
                        onClick={() => onLeagueClick(metric.name as League)}
                        className="mt-6 flex items-center justify-between w-full px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded text-sm text-white font-bold transition group-hover:bg-pitch-600"
                      >
                         <span>View Matches</span>
                         <ArrowRight size={16} />
                      </button>
                   </div>

                   {/* Featured Match Column */}
                   <div className="p-6 lg:w-2/3 bg-gradient-to-br from-dark-800 to-dark-900">
                      <div className="flex items-center gap-2 mb-4">
                         <Flame className="text-orange-500" size={18} />
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Most Exciting Match</span>
                      </div>
                      
                      {metric.topMatch ? (
                          <div className="max-w-md">
                             <MatchCard match={metric.topMatch} onClick={() => onMatchClick(metric.topMatch!)} hoverEffect={false} />
                          </div>
                      ) : (
                          <div className="text-gray-500 text-sm italic">No recent match data available.</div>
                      )}
                   </div>
                </div>
             </div>
           ))}

           {filteredMetrics.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                 No leagues found matching "{searchTerm}".
              </div>
           )}
        </div>
      )}
    </div>
  );
};

export default React.memo(LeagueDashboard);
