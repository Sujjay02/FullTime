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

const TeamProfile: React.FC<TeamProfileProps> = ({ teamName, league, onBack, onMatchClick, onPlayerClick, onToggleFavorite, isFavorited = false }) => {
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-52 bg-dark-800 rounded-xl mb-5" />
          <div className="h-10 bg-dark-800 rounded-lg w-1/3 mb-4" />
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
        <p className="text-zinc-500">Failed to load team data</p>
        <button onClick={onBack} className="mt-4 px-5 py-2 bg-pitch-600 hover:bg-pitch-500 rounded-lg transition text-white text-sm font-semibold">Go Back</button>
      </div>
    );
  }

  const getAccentColor = (score: number) => score >= 8.5 ? 'text-orange-400' : score >= 7 ? 'text-amber-400' : 'text-zinc-400';
  const getAccentGrad = (score: number) => score >= 8.5 ? 'from-orange-600 to-orange-800' : score >= 7 ? 'from-amber-600 to-amber-800' : 'from-zinc-600 to-zinc-800';

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-white transition group">
        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-sm">Back</span>
      </button>

      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-dark-800 border border-white/[0.06] p-6 md:p-8">
        <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${getAccentGrad(teamData.avgWatchability)} rounded-full blur-3xl opacity-10`} />

        <div className="relative z-10 flex flex-col md:flex-row items-start gap-5">
          <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br ${getAccentGrad(teamData.avgWatchability)} flex items-center justify-center text-white font-black text-3xl shadow-xl shrink-0`}>
            {teamName.substring(0, 2).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h1 className="text-3xl font-bold text-white">{teamData.name}</h1>
              {teamData.avgWatchability >= 8 && <Flame className="text-orange-500 fill-orange-500" size={22} />}
              {onToggleFavorite && <FavoriteButton isFavorited={isFavorited} onToggle={() => onToggleFavorite(teamData.name)} size={20} />}
            </div>
            <p className="text-zinc-500 mb-4">{teamData.league}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Formation', value: teamData.formation },
                { label: 'Team Quality', value: `${teamData.avgWatchability.toFixed(1)}/10`, color: getAccentColor(teamData.avgWatchability) },
                { label: 'Manager', value: teamData.manager.name },
                { label: 'Tactical Rating', value: `${teamData.manager.watchability.toFixed(1)}/10`, color: getAccentColor(teamData.manager.watchability) },
              ].map((s) => (
                <div key={s.label} className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/[0.04]">
                  <div className="text-xs text-zinc-500 mb-0.5">{s.label}</div>
                  <div className={`text-lg font-bold truncate ${s.color || 'text-white'}`}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manager */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Trophy size={14} className="text-violet-400" /> Manager
        </h2>
        <div className="bg-dark-800 rounded-xl p-5 border border-white/[0.06] max-w-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
              {teamData.manager.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{teamData.manager.name}</h3>
              <p className="text-sm text-zinc-500">{teamData.manager.nationality} · {teamData.manager.age} years old</p>
              <div className="mt-1.5 px-2 py-0.5 bg-violet-500/15 border border-violet-500/30 rounded text-xs font-semibold text-violet-300 inline-flex items-center gap-1">
                <TrendingUp size={10} /> Tactical: {teamData.manager.watchability.toFixed(1)}/10
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/[0.06]">
        {[
          { id: 'squad' as const, label: `Squad (${teamData.squad.length})` },
          { id: 'matches' as const, label: 'Recent Matches' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 px-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === tab.id ? 'text-pitch-400 border-pitch-400' : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'squad' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {teamData.squad.map((player: LineupPlayer, idx: number) => {
            const playerEntity: Entity = {
              id: `${teamData.id}_player_${idx}`,
              name: player.name,
              type: 'PLAYER',
              subtitle: `${player.position} · #${player.number}`,
              watchability: player.watchability,
              image: '',
              stats: { goals: player.goals || 0, assists: player.assists || 0 }
            };
            return <EnhancedPlayerCard key={idx} player={playerEntity} onClick={onPlayerClick} />;
          })}
        </div>
      )}

      {activeTab === 'matches' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {teamData.recentMatches.map((match: Match) => (
            <EnhancedMatchCard key={match.id} match={match} onClick={() => onMatchClick(match)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamProfile;
