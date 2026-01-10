/**
 * Team Profile Component
 * Displays team information, recent matches, squad, and manager
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Trophy, TrendingUp, Flame } from 'lucide-react';
import { getTeamData } from '../services/teamService';
import { Entity, Match, LineupPlayer } from '../types';
import EnhancedMatchCard from './EnhancedMatchCard';
import EnhancedPlayerCard from './EnhancedPlayerCard';
import LoadingSkeleton from './LoadingSkeleton';
import FavoriteButton from './FavoriteButton';

interface TeamProfileProps {
  teamName: string;
  league?: string;
  onBack: () => void;
  onMatchClick: (match: Match) => void;
  onPlayerClick: (player: Entity) => void;
  onToggleFavorite?: (teamName: string) => void;
  isFavorited?: boolean;
}

const TeamProfile: React.FC<TeamProfileProps> = ({
  teamName,
  league,
  onBack,
  onMatchClick,
  onPlayerClick,
  onToggleFavorite,
  isFavorited = false
}) => {
  const [teamData, setTeamData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'squad' | 'matches'>('squad');

  useEffect(() => {
    const fetchTeamData = async () => {
      setIsLoading(true);
      try {
        const data = await getTeamData(teamName, league);
        setTeamData(data);
      } catch (error) {
        console.error('Failed to fetch team data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [teamName, league]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-64 bg-dark-800 rounded-xl mb-6"></div>
          <div className="h-12 bg-dark-800 rounded-lg w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <LoadingSkeleton type="match" count={4} />
          </div>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Failed to load team data</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-pitch-600 hover:bg-pitch-500 rounded-lg transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const getWatchabilityColor = (score: number) => {
    if (score >= 8.5) return 'text-orange-400';
    if (score >= 7) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getWatchabilityBg = (score: number) => {
    if (score >= 8.5) return 'from-orange-600 to-orange-800';
    if (score >= 7) return 'from-yellow-600 to-yellow-800';
    return 'from-gray-600 to-gray-800';
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back</span>
      </button>

      {/* Team Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 border border-dark-700 p-8 shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/60-lines.png')] opacity-5"></div>

        {/* Glow Effect */}
        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${getWatchabilityBg(teamData.avgWatchability)} rounded-full blur-3xl opacity-20`}></div>

        <div className="relative z-10 flex items-start gap-6">
          {/* Team Logo */}
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getWatchabilityBg(teamData.avgWatchability)} flex items-center justify-center text-white font-black text-4xl shadow-2xl`}>
            {teamName.substring(0, 2).toUpperCase()}
          </div>

          {/* Team Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-white">{teamData.name}</h1>
              {teamData.avgWatchability >= 8 && (
                <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={28} />
              )}
              {onToggleFavorite && (
                <FavoriteButton
                  isFavorited={isFavorited}
                  onToggle={() => onToggleFavorite(teamData.name)}
                  size={24}
                />
              )}
            </div>
            <p className="text-lg text-gray-400 mb-4">{teamData.league}</p>

            {/* Team Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Formation</div>
                <div className="text-2xl font-bold text-white">{teamData.formation}</div>
              </div>

              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Team Quality</div>
                <div className={`text-2xl font-bold ${getWatchabilityColor(teamData.avgWatchability)}`}>
                  {teamData.avgWatchability.toFixed(1)}/10
                </div>
              </div>

              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Manager</div>
                <div className="text-lg font-bold text-white truncate">{teamData.manager.name}</div>
              </div>

              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Manager Rating</div>
                <div className={`text-2xl font-bold ${getWatchabilityColor(teamData.manager.watchability)}`}>
                  {teamData.manager.watchability.toFixed(1)}/10
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manager Card */}
      <section>
        <div className="flex items-center gap-2 mb-6 border-l-4 border-purple-500 pl-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-widest">Manager</h2>
          <Trophy size={18} className="text-purple-500" />
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 hover:border-purple-500 transition-all duration-300 max-w-md">
          <div className="flex items-start gap-4">
            {/* Manager Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-black text-2xl shadow-lg">
              {teamData.manager.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
            </div>

            {/* Manager Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">{teamData.manager.name}</h3>
              <p className="text-sm text-gray-400 mb-3">
                {teamData.manager.nationality} • {teamData.manager.age} years old
              </p>

              {/* Manager Watchability */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-xs font-bold text-purple-300 flex items-center gap-1">
                  <TrendingUp size={12} />
                  <span>Tactical Rating: {teamData.manager.watchability.toFixed(1)}/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-dark-700">
        <button
          onClick={() => setActiveTab('squad')}
          className={`pb-3 px-4 font-bold transition-all ${
            activeTab === 'squad'
              ? 'text-pitch-400 border-b-2 border-pitch-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Squad ({teamData.squad.length})
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`pb-3 px-4 font-bold transition-all ${
            activeTab === 'matches'
              ? 'text-pitch-400 border-b-2 border-pitch-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Recent Matches
        </button>
      </div>

      {/* Squad Tab */}
      {activeTab === 'squad' && (
        <section>
          <div className="flex items-center gap-2 mb-6 border-l-4 border-yellow-500 pl-4">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest">Current Squad</h2>
            <Users size={18} className="text-yellow-500" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {teamData.squad.map((player: LineupPlayer, idx: number) => {
              const playerEntity: Entity = {
                id: `${teamData.id}_player_${idx}`,
                name: player.name,
                type: 'PLAYER',
                subtitle: `${player.position} • #${player.number}`,
                watchability: player.watchability,
                image: '',
                stats: {
                  goals: player.goals || 0,
                  assists: player.assists || 0
                }
              };

              return (
                <EnhancedPlayerCard
                  key={idx}
                  player={playerEntity}
                  onClick={onPlayerClick}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Matches Tab */}
      {activeTab === 'matches' && (
        <section>
          <div className="flex items-center gap-2 mb-6 border-l-4 border-orange-500 pl-4">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest">Recent Matches</h2>
            <Trophy size={18} className="text-orange-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamData.recentMatches.map((match: Match) => (
              <EnhancedMatchCard
                key={match.id}
                match={match}
                onClick={() => onMatchClick(match)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TeamProfile;
