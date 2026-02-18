
import React, { useMemo, useState } from 'react';
import { Entity, Review, Match, User, LineupPlayer } from '../types';
import StarRating from './StarRating';
import { Trophy, TrendingUp, Users, Goal, Footprints, Shirt, Activity, Star, Shield, Clock, CreditCard, ListPlus, Info, Brain, Sparkles, Zap, BarChart3, AlignLeft, ExternalLink } from 'lucide-react';
import { calculateMatchWatchability, calculatePlayerWatchability, calculateTeamWatchability } from '../services/mlWatchabilityService';

interface EntityProfileProps {
  entity: Entity;
  reviews: Review[];
  onRate: (e: React.MouseEvent) => void;
  onUserClick?: (user: User) => void;
  onAddToPlaylist?: (matchId: string) => void;
  onTeamClick?: (teamName: string, league?: string) => void;
}

const getEventIcon = (type: string, detail?: string) => {
  switch (type) {
    case 'GOAL': return <Goal size={14} className="text-pitch-400" />;
    case 'CARD': return <CreditCard size={14} className={detail?.toLowerCase().includes('red') ? 'text-red-500 fill-red-500' : 'text-yellow-400 fill-yellow-400'} />;
    case 'SUB': return <Activity size={14} className="text-orange-400" />;
    case 'VAR': return <Info size={14} className="text-blue-400" />;
    default: return <Clock size={14} className="text-zinc-500" />;
  }
};

// ============================================================================
// SOFASCORE-STYLE PITCH FORMATION
// ============================================================================

const FORMATION_POSITIONS: Record<string, number[][]> = {
  '4-3-3': [[1], [2, 3, 4, 5], [6, 7, 8], [9, 10, 11]],
  '4-4-2': [[1], [2, 3, 4, 5], [6, 7, 8, 9], [10, 11]],
  '4-2-3-1': [[1], [2, 3, 4, 5], [6, 7], [8, 9, 10], [11]],
  '3-5-2': [[1], [2, 3, 4], [5, 6, 7, 8, 9], [10, 11]],
  '3-4-3': [[1], [2, 3, 4], [5, 6, 7, 8], [9, 10, 11]],
  '4-1-4-1': [[1], [2, 3, 4, 5], [6], [7, 8, 9, 10], [11]],
  '5-3-2': [[1], [2, 3, 4, 5, 6], [7, 8, 9], [10, 11]],
  '4-4-1-1': [[1], [2, 3, 4, 5], [6, 7, 8, 9], [10], [11]],
  '4-5-1': [[1], [2, 3, 4, 5], [6, 7, 8, 9, 10], [11]],
  '5-4-1': [[1], [2, 3, 4, 5, 6], [7, 8, 9, 10], [11]],
  '3-4-1-2': [[1], [2, 3, 4], [5, 6, 7, 8], [9], [10, 11]],
};

const getFormationRows = (formation: string): number[][] => {
  return FORMATION_POSITIONS[formation] || FORMATION_POSITIONS['4-3-3'];
};

const PitchPlayerDot: React.FC<{
  player: LineupPlayer;
  isHome: boolean;
  size?: 'sm' | 'md';
}> = ({ player, isHome, size = 'md' }) => {
  const isMd = size === 'md';
  return (
    <div className="flex flex-col items-center gap-0.5 group relative">
      <div className="absolute bottom-full mb-2 hidden group-hover:block z-50">
        <div className="bg-dark-800 text-white text-[10px] py-1.5 px-3 rounded border border-white/[0.08] shadow-2xl whitespace-nowrap flex items-center gap-3 backdrop-blur-sm">
          <span className="font-bold">{player.name}</span>
          <div className="w-px h-3 bg-white/[0.06]"></div>
          <div className="flex items-center gap-1">
            <Goal size={10} className="text-pitch-400" />
            <span className="font-bold">{player.goals || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Footprints size={10} className="text-blue-400" />
            <span className="font-bold">{player.assists || 0}</span>
          </div>
        </div>
        <div className="w-2 h-2 bg-dark-800 border-r border-b border-white/[0.08] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
      </div>

      <div className={`${isMd ? 'w-9 h-9' : 'w-7 h-7'} rounded-full flex items-center justify-center font-mono font-bold border-2 shadow-lg cursor-pointer transition hover:scale-110 ${
        isHome
          ? 'bg-pitch-600 border-pitch-400 text-white'
          : 'bg-blue-600 border-blue-400 text-white'
      } ${isMd ? 'text-xs' : 'text-[10px]'}`}>
        {player.number}
      </div>
      <span className={`${isMd ? 'text-[10px]' : 'text-[8px]'} text-white font-medium text-center leading-tight max-w-[60px] truncate drop-shadow-lg`}>
        {(player.name || '').split(' ').pop()}
      </span>
    </div>
  );
};

const PitchFormation: React.FC<{
  homePlayers: LineupPlayer[];
  awayPlayers: LineupPlayer[];
  homeFormation: string;
  awayFormation: string;
}> = ({ homePlayers, awayPlayers, homeFormation, awayFormation }) => {
  const homeRows = getFormationRows(homeFormation);
  const awayRows = getFormationRows(awayFormation);

  const mapPlayersToRows = (players: LineupPlayer[], rows: number[][]): LineupPlayer[][] => {
    const result: LineupPlayer[][] = [];
    let playerIdx = 0;
    for (const row of rows) {
      const rowPlayers: LineupPlayer[] = [];
      for (let i = 0; i < row.length && playerIdx < players.length; i++) {
        rowPlayers.push(players[playerIdx]);
        playerIdx++;
      }
      result.push(rowPlayers);
    }
    return result;
  };

  const homeFormationRows = mapPlayersToRows(homePlayers, homeRows);
  const awayFormationRows = mapPlayersToRows(awayPlayers, awayRows);

  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '68/105' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#2d8a4e] to-[#1a6b35]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/20"></div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/30"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-16 border-b border-l border-r border-white/15 rounded-b-sm"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-16 border-t border-l border-r border-white/15 rounded-t-sm"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 border-b border-l border-r border-white/10 rounded-b-sm"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-6 border-t border-l border-r border-white/10 rounded-t-sm"></div>
        <div className="absolute top-0 left-0 w-4 h-4 border-b border-r border-white/10 rounded-br-full"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-b border-l border-white/10 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-t border-r border-white/10 rounded-tr-full"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-t border-l border-white/10 rounded-tl-full"></div>
        <div className="absolute inset-2 border border-white/20 rounded-sm"></div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-1/2 flex flex-col justify-around py-4 px-4">
        {homeFormationRows.map((row, rowIdx) => (
          <div key={`home-${rowIdx}`} className="flex justify-around items-center px-2">
            {row.map((player, pIdx) => (
              <PitchPlayerDot key={`h-${rowIdx}-${pIdx}`} player={player} isHome={true} size="sm" />
            ))}
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1/2 flex flex-col-reverse justify-around py-4 px-4">
        {awayFormationRows.map((row, rowIdx) => (
          <div key={`away-${rowIdx}`} className="flex justify-around items-center px-2">
            {row.map((player, pIdx) => (
              <PitchPlayerDot key={`a-${rowIdx}-${pIdx}`} player={player} isHome={false} size="sm" />
            ))}
          </div>
        ))}
      </div>

      <div className="absolute top-2 left-3 text-[10px] font-bold text-white/60 bg-black/30 px-2 py-0.5 rounded">
        {homeFormation}
      </div>
      <div className="absolute bottom-2 right-3 text-[10px] font-bold text-white/60 bg-black/30 px-2 py-0.5 rounded">
        {awayFormation}
      </div>
    </div>
  );
};

// ============================================================================
// SOFASCORE-STYLE SCORECARD
// ============================================================================

const SofaScorecard: React.FC<{
  match: Match;
  isLive: boolean;
  isUpcoming: boolean;
  onTeamClick?: (teamName: string, league?: string) => void;
}> = ({ match, isLive, isUpcoming, onTeamClick }) => {
  const [homeScore, awayScore] = (match.score || 'vs').split(/[-–]/).map(s => s.trim());

  return (
    <div className="bg-dark-800 rounded-2xl border border-white/[0.06] overflow-hidden shadow-2xl">
      <div className="bg-dark-900/80 px-6 py-3 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-zinc-400" />
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{match.league}</span>
        </div>
        <div className="flex items-center gap-3">
          {match.isPredictedLineup && (
            <span className="text-[9px] px-2 py-0.5 rounded bg-blue-900/40 border border-blue-700/50 text-blue-400 font-bold uppercase">Predicted</span>
          )}
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 ${
            isLive ? 'bg-red-600/20 border border-red-500/50 text-red-400' :
            match.status === 'FT' ? 'bg-white/[0.05] border border-white/[0.06] text-zinc-300' :
            'bg-blue-900/30 border border-blue-600/40 text-blue-400'
          }`}>
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>}
            {match.minute || match.status || 'Upcoming'}
          </div>
        </div>
      </div>

      <div className="px-6 py-8 md:py-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex-1 flex flex-col items-center gap-3">
            <button
              onClick={() => onTeamClick?.(match.homeTeam, match.league)}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/[0.05] border-2 border-white/[0.08] flex items-center justify-center hover:border-pitch-500 transition group"
            >
              <span className="text-xl md:text-2xl font-black text-white group-hover:text-pitch-400 transition">
                {match.homeTeam.substring(0, 3).toUpperCase()}
              </span>
            </button>
            <button
              onClick={() => onTeamClick?.(match.homeTeam, match.league)}
              className="text-sm md:text-base font-bold text-white text-center hover:text-pitch-400 transition leading-tight max-w-[120px]"
            >
              {match.homeTeam}
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 px-6">
            {isUpcoming ? (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-zinc-500">VS</span>
                <span className="text-xs text-zinc-500 mt-2">{match.minute}</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <span className="text-5xl md:text-6xl font-black tabular-nums text-white">{homeScore}</span>
                  <span className="text-2xl md:text-3xl font-light text-zinc-600">-</span>
                  <span className="text-5xl md:text-6xl font-black tabular-nums text-white">{awayScore}</span>
                </div>
                {match.status === 'HT' && (
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Half Time</span>
                )}
              </>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center gap-3">
            <button
              onClick={() => onTeamClick?.(match.awayTeam, match.league)}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/[0.05] border-2 border-white/[0.08] flex items-center justify-center hover:border-blue-500 transition group"
            >
              <span className="text-xl md:text-2xl font-black text-white group-hover:text-blue-400 transition">
                {match.awayTeam.substring(0, 3).toUpperCase()}
              </span>
            </button>
            <button
              onClick={() => onTeamClick?.(match.awayTeam, match.league)}
              className="text-sm md:text-base font-bold text-white text-center hover:text-blue-400 transition leading-tight max-w-[120px]"
            >
              {match.awayTeam}
            </button>
          </div>
        </div>

        {match.events && match.events.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/[0.06] max-w-2xl mx-auto">
            <div className="flex justify-between gap-4">
              <div className="flex-1 flex flex-col gap-1">
                {match.events.filter(e => e.team === 'HOME' && e.type === 'GOAL').map((ev, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                    <Goal size={11} className="text-pitch-400 shrink-0" />
                    <span className="truncate">{ev.player}</span>
                    <span className="text-zinc-600 font-mono text-[10px]">{ev.minute}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-1 items-end">
                {match.events.filter(e => e.team === 'AWAY' && e.type === 'GOAL').map((ev, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="text-zinc-600 font-mono text-[10px]">{ev.minute}</span>
                    <span className="truncate">{ev.player}</span>
                    <Goal size={11} className="text-pitch-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// LIST-STYLE LINEUP ROW
// ============================================================================

const LineupListRow: React.FC<{ player: LineupPlayer; isHome: boolean; idx: number }> = ({ player, isHome, idx }) => {
  const mlScore = useMemo(() => calculatePlayerWatchability(player), [player]);

  return (
    <div className={`flex items-center gap-3 py-2 px-3 hover:bg-white/[0.04] transition rounded ${!isHome && 'flex-row-reverse'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border shrink-0 ${
        isHome ? 'bg-pitch-900/60 border-pitch-600/60 text-pitch-300' : 'bg-blue-900/60 border-blue-600/60 text-blue-300'
      }`}>
        {player.number}
      </div>
      <div className={`flex-1 min-w-0 ${!isHome && 'text-right'}`}>
        <div className="text-xs font-medium text-white truncate">{player.name}</div>
        <div className={`flex items-center gap-2 text-[9px] text-zinc-500 ${!isHome && 'justify-end'}`}>
          <span className="uppercase font-bold">{player.position}</span>
          {(player.goals || 0) > 0 && (
            <span className="flex items-center gap-0.5 text-pitch-400">
              <Goal size={8} /> {player.goals}
            </span>
          )}
          {(player.assists || 0) > 0 && (
            <span className="flex items-center gap-0.5 text-blue-400">
              <Footprints size={8} /> {player.assists}
            </span>
          )}
        </div>
      </div>
      {mlScore.score >= 7 && (
        <div className="text-[9px] font-bold text-purple-400 bg-purple-900/30 px-1.5 py-0.5 rounded">
          {mlScore.score.toFixed(1)}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SOFASCORE EMBED COMPONENT
// ============================================================================

const SofaScoreEmbed: React.FC<{ homeTeam: string; awayTeam: string }> = ({ homeTeam, awayTeam }) => {
  const searchQuery = encodeURIComponent(`${homeTeam} ${awayTeam}`);
  const sofascoreUrl = `https://www.sofascore.com/search?q=${searchQuery}`;

  return (
    <div className="bg-dark-800 border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-dark-900/60 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <img src="https://www.sofascore.com/favicon.ico" alt="SofaScore" className="w-4 h-4" />
          <span className="text-xs font-bold text-zinc-300">SofaScore</span>
        </div>
        <a
          href={sofascoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
        >
          View on SofaScore <ExternalLink size={10} />
        </a>
      </div>
      <div className="p-6">
        <iframe
          src={`https://widgets.sofascore.com/embed/tournament/17/season/61643?widgetTitle=Premier%20League`}
          style={{ width: '100%', height: '400px', border: 'none' }}
          title="SofaScore Widget"
          allow="autoplay"
          className="rounded-lg"
        />
      </div>
    </div>
  );
};

// ============================================================================
// MATCH TABS
// ============================================================================

type MatchTab = 'summary' | 'lineups' | 'stats' | 'timeline' | 'sofascore';

// ============================================================================
// MAIN ENTITY PROFILE
// ============================================================================

const EntityProfile: React.FC<EntityProfileProps> = ({ entity, reviews, onRate, onUserClick, onAddToPlaylist, onTeamClick }) => {
  const match = entity.type === 'MATCH' ? (entity as Match) : null;
  const isUpcoming = match?.status === 'UPCOMING';
  const isLive = match?.status === 'LIVE' || match?.status === 'HT';
  const [activeTab, setActiveTab] = useState<MatchTab>('summary');

  // ML Watchability Predictions
  const mlPrediction = useMemo(() => {
    if (match) {
      return calculateMatchWatchability(
        match.homeTeam,
        match.awayTeam,
        match.lineups?.home || [],
        match.lineups?.away || [],
        match.league
      );
    }
    if (entity.type === 'PLAYER') {
      return calculatePlayerWatchability(entity);
    }
    if (entity.type === 'TEAM') {
      return calculateTeamWatchability(entity.name, entity.recentMatches, entity.league);
    }
    return null;
  }, [entity, match]);

  const groupPlayers = (players: LineupPlayer[]) => {
    return {
      GK: players.filter(p => {
        const pos = p.position?.toUpperCase() || '';
        return pos === 'G' || pos === 'GK' || pos.includes('GOALKEEPER') || pos.includes('GOALIE');
      }),
      DEF: players.filter(p => {
        const pos = p.position?.toUpperCase() || '';
        return pos === 'D' || ['DEF', 'DF', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'DEFENDER'].some(x => pos.includes(x));
      }),
      MID: players.filter(p => {
        const pos = p.position?.toUpperCase() || '';
        return pos === 'M' || ['MID', 'MF', 'CM', 'CDM', 'CAM', 'LM', 'RM', 'MIDFIELDER'].some(x => pos.includes(x));
      }),
      FWD: players.filter(p => {
        const pos = p.position?.toUpperCase() || '';
        return pos === 'F' || ['FWD', 'FW', 'ST', 'CF', 'LW', 'RW', 'FORWARD', 'STRIKER', 'ATTACKER'].some(x => pos.includes(x));
      })
    };
  };

  const handleReviewerClick = (rev: Review) => {
    if (onUserClick) {
      onUserClick({
        id: rev.userId,
        name: rev.userName,
        handle: `@${rev.userName.toLowerCase().replace(/\s/g, '')}`,
        avatar: rev.userAvatar || 'https://ui-avatars.com/api/?name=User',
      });
    }
  };

  // Compute match event stats
  const matchStats = useMemo(() => {
    if (!match || !match.events) return null;
    const homeGoals = match.events.filter(e => e.team === 'HOME' && e.type === 'GOAL').length;
    const awayGoals = match.events.filter(e => e.team === 'AWAY' && e.type === 'GOAL').length;
    const homeYellows = match.events.filter(e => e.team === 'HOME' && e.type === 'CARD' && e.detail?.toLowerCase().includes('yellow')).length;
    const awayYellows = match.events.filter(e => e.team === 'AWAY' && e.type === 'CARD' && e.detail?.toLowerCase().includes('yellow')).length;
    const homeReds = match.events.filter(e => e.team === 'HOME' && e.type === 'CARD' && e.detail?.toLowerCase().includes('red')).length;
    const awayReds = match.events.filter(e => e.team === 'AWAY' && e.type === 'CARD' && e.detail?.toLowerCase().includes('red')).length;
    const homeSubs = match.events.filter(e => e.team === 'HOME' && e.type === 'SUB').length;
    const awaySubs = match.events.filter(e => e.team === 'AWAY' && e.type === 'SUB').length;
    return { homeGoals, awayGoals, homeYellows, awayYellows, homeReds, awayReds, homeSubs, awaySubs };
  }, [match]);

  // ============================================================================
  // MATCH VIEW (SofaScore-style)
  // ============================================================================
  if (match) {
    const hasLineups = (match.lineups?.home?.length || 0) > 0 || (match.lineups?.away?.length || 0) > 0;
    const hasEvents = (match.events?.length || 0) > 0;

    const tabs: { id: MatchTab; label: string; icon: React.ReactNode; show: boolean }[] = [
      { id: 'summary', label: 'Summary', icon: <AlignLeft size={14} />, show: true },
      { id: 'lineups', label: 'Lineups', icon: <Shield size={14} />, show: hasLineups },
      { id: 'stats', label: 'Stats', icon: <BarChart3 size={14} />, show: hasEvents },
      { id: 'timeline', label: 'Timeline', icon: <Clock size={14} />, show: hasEvents && !isUpcoming },
      { id: 'sofascore', label: 'SofaScore', icon: <ExternalLink size={14} />, show: true },
    ];

    return (
      <div className="animate-fade-in pb-20 max-w-4xl mx-auto px-4">
        {/* Scorecard */}
        <SofaScorecard
          match={match}
          isLive={isLive}
          isUpcoming={isUpcoming}
          onTeamClick={onTeamClick}
        />

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={onRate} className="bg-pitch-600 hover:bg-pitch-500 text-white font-bold py-2 px-5 rounded-lg transition shadow-lg shadow-pitch-900/40 text-sm">
            Rate / Review
          </button>
          <button
            onClick={() => onAddToPlaylist?.(match.id)}
            className="bg-dark-800 hover:bg-white/[0.08] text-zinc-200 font-bold py-2 px-5 rounded-lg border border-white/[0.06] flex items-center gap-2 transition text-sm"
          >
            <ListPlus size={14} /> Add to List
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-1 bg-dark-800 rounded-xl p-1 border border-white/[0.06] overflow-x-auto">
          {tabs.filter(t => t.show).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-pitch-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6 space-y-6">
          {/* ============ SUMMARY TAB ============ */}
          {activeTab === 'summary' && (
            <div className="space-y-6 animate-fade-in">
              {/* ML Watchability Card */}
              {mlPrediction && (
                <div className="bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-dark-900 border border-purple-600/30 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain size={18} className="text-purple-400" />
                      <div>
                        <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles size={10} /> ML Watchability
                        </h3>
                        <p className="text-[9px] text-zinc-500">{Math.round(mlPrediction.confidence * 100)}% confidence</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">
                        {mlPrediction.score.toFixed(1)}<span className="text-xs text-zinc-500">/10</span>
                      </div>
                      <div className={`text-[9px] font-bold uppercase mt-0.5 ${
                        mlPrediction.score >= 8 ? 'text-orange-400' : mlPrediction.score >= 6 ? 'text-purple-400' : 'text-zinc-400'
                      }`}>
                        {mlPrediction.score >= 9 ? 'Must Watch' :
                         mlPrediction.score >= 8 ? 'Highly Recommended' :
                         mlPrediction.score >= 6 ? 'Worth Watching' : 'Average'}
                      </div>
                    </div>
                  </div>
                  {mlPrediction.topFactors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-purple-700/30">
                      {mlPrediction.topFactors.slice(0, 4).map((f, i) => (
                        <span key={i} className={`text-[9px] font-medium px-2 py-1 rounded-full ${
                          f.contribution > 0 ? 'bg-pitch-900/40 text-pitch-300' : 'bg-red-900/20 text-red-300'
                        }`}>
                          {f.factor} {f.contribution > 0 ? '+' : ''}{(f.contribution * 10).toFixed(1)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quick formation preview */}
              {hasLineups && (
                <div className="bg-dark-800 border border-white/[0.06] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-dark-900/50 border-b border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Formation</span>
                    <button
                      onClick={() => setActiveTab('lineups')}
                      className="text-[10px] text-pitch-400 hover:text-pitch-300 font-bold transition"
                    >
                      View Full Lineups
                    </button>
                  </div>
                  <div className="p-4">
                    <PitchFormation
                      homePlayers={match.lineups?.home || []}
                      awayPlayers={match.lineups?.away || []}
                      homeFormation={match.formation?.home || '4-3-3'}
                      awayFormation={match.formation?.away || '4-3-3'}
                    />
                  </div>
                </div>
              )}

              {/* Key events summary */}
              {hasEvents && !isUpcoming && (
                <div className="bg-dark-800 border border-white/[0.06] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-dark-900/50 border-b border-white/[0.06]">
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Key Events</span>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {match.events?.slice(0, 8).map((ev, i) => (
                      <div key={i} className={`flex items-center gap-3 px-4 py-3 ${ev.team === 'AWAY' ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-2 flex-1 min-w-0 ${ev.team === 'AWAY' ? 'justify-end text-right' : ''}`}>
                          {getEventIcon(ev.type, ev.detail)}
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{ev.player}</div>
                            {ev.playerOut && <div className="text-[9px] text-zinc-500">Off: {ev.playerOut}</div>}
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-dark-900 border border-white/[0.06] flex items-center justify-center font-mono font-bold text-pitch-500 text-[11px] shrink-0">
                          {ev.minute}
                        </div>
                        <div className="flex-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Community reviews */}
              <div className="bg-dark-800 border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-dark-900/50 border-b border-white/[0.06] flex items-center gap-2">
                  <Users size={14} className="text-pitch-500" />
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Reviews</span>
                </div>
                <div className="p-4">
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.slice(0, 4).map(rev => (
                        <div key={rev.id} className="flex gap-3">
                          <img
                            src={rev.userAvatar}
                            onClick={() => handleReviewerClick(rev)}
                            className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition shrink-0"
                            alt={rev.userName}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-white cursor-pointer hover:text-pitch-400 transition" onClick={() => handleReviewerClick(rev)}>
                                {rev.userName}
                              </span>
                              <StarRating rating={rev.rating} size={10} />
                            </div>
                            <p className="text-zinc-400 text-xs leading-relaxed">{rev.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-zinc-500 text-sm">
                      No reviews yet. Be the first to share your analysis!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============ LINEUPS TAB ============ */}
          {activeTab === 'lineups' && hasLineups && (
            <div className="space-y-6 animate-fade-in">
              {/* Pitch formation */}
              <div className="bg-dark-800 border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-dark-900/50 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Pitch View</span>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500">
                    <span><span className="inline-block w-2 h-2 rounded-full bg-pitch-600 mr-1"></span>{match.homeTeam} ({match.formation?.home})</span>
                    <span><span className="inline-block w-2 h-2 rounded-full bg-blue-600 mr-1"></span>{match.awayTeam} ({match.formation?.away})</span>
                  </div>
                </div>
                <div className="p-4">
                  <PitchFormation
                    homePlayers={match.lineups?.home || []}
                    awayPlayers={match.lineups?.away || []}
                    homeFormation={match.formation?.home || '4-3-3'}
                    awayFormation={match.formation?.away || '4-3-3'}
                  />
                </div>
              </div>

              {/* List view - SofaScore style side-by-side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Home lineup list */}
                <div className="bg-dark-800 border border-white/[0.06] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-dark-900/50 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-pitch-600"></div>
                      <span className="text-xs font-bold text-white">{match.homeTeam}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{match.formation?.home}</span>
                    </div>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {(match.lineups?.home || []).map((p, i) => (
                      <LineupListRow key={i} player={p} isHome={true} idx={i} />
                    ))}
                  </div>
                  {match.bench?.home && match.bench.home.length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-dark-900/30 border-t border-white/[0.06]">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Substitutes</span>
                      </div>
                      <div className="divide-y divide-white/[0.04] opacity-70">
                        {match.bench.home.map((p, i) => (
                          <LineupListRow key={`bench-h-${i}`} player={p} isHome={true} idx={i} />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Away lineup list */}
                <div className="bg-dark-800 border border-white/[0.06] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-dark-900/50 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-[10px] text-zinc-500 font-mono">{match.formation?.away}</span>
                      <span className="text-xs font-bold text-white">{match.awayTeam}</span>
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    </div>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {(match.lineups?.away || []).map((p, i) => (
                      <LineupListRow key={i} player={p} isHome={false} idx={i} />
                    ))}
                  </div>
                  {match.bench?.away && match.bench.away.length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-dark-900/30 border-t border-white/[0.06]">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider text-right block">Substitutes</span>
                      </div>
                      <div className="divide-y divide-white/[0.04] opacity-70">
                        {match.bench.away.map((p, i) => (
                          <LineupListRow key={`bench-a-${i}`} player={p} isHome={false} idx={i} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============ STATS TAB ============ */}
          {activeTab === 'stats' && matchStats && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-dark-800 border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-dark-900/50 border-b border-white/[0.06]">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Match Statistics</span>
                </div>
                <div className="p-6 space-y-6">
                  {/* Stat bars */}
                  {[
                    { label: 'Goals', home: matchStats.homeGoals, away: matchStats.awayGoals },
                    { label: 'Yellow Cards', home: matchStats.homeYellows, away: matchStats.awayYellows },
                    { label: 'Red Cards', home: matchStats.homeReds, away: matchStats.awayReds },
                    { label: 'Substitutions', home: matchStats.homeSubs, away: matchStats.awaySubs },
                  ].filter(s => s.home + s.away > 0).map((stat, i) => {
                    const total = Math.max(stat.home + stat.away, 1);
                    const homePercent = (stat.home / total) * 100;
                    const awayPercent = (stat.away / total) * 100;

                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-white w-8 text-left">{stat.home}</span>
                          <span className="text-xs text-zinc-400 uppercase font-bold tracking-wider">{stat.label}</span>
                          <span className="text-sm font-bold text-white w-8 text-right">{stat.away}</span>
                        </div>
                        <div className="flex gap-1 h-2">
                          <div className="flex-1 bg-white/[0.05] rounded-full overflow-hidden flex justify-end">
                            <div
                              className="h-full bg-pitch-500 rounded-full transition-all duration-500"
                              style={{ width: `${homePercent}%` }}
                            />
                          </div>
                          <div className="flex-1 bg-white/[0.05] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${awayPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {matchStats.homeGoals + matchStats.awayGoals === 0 &&
                   matchStats.homeYellows + matchStats.awayYellows === 0 && (
                    <div className="text-center text-zinc-500 text-sm py-4">
                      No detailed statistics available yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============ TIMELINE TAB ============ */}
          {activeTab === 'timeline' && hasEvents && !isUpcoming && (
            <div className="animate-fade-in">
              <div className="bg-dark-800 border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-dark-900/50 border-b border-white/[0.06]">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Match Timeline</span>
                </div>
                <div className="relative py-4">
                  {/* Center line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.06]"></div>

                  {match.events?.map((ev, i) => (
                    <div key={i} className={`flex items-center gap-3 px-4 py-2 ${ev.team === 'AWAY' ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-1 min-w-0 ${ev.team === 'AWAY' ? 'text-right' : ''}`}>
                        <div className={`inline-flex items-center gap-2 bg-dark-900 border border-white/[0.06] rounded-lg px-3 py-2 ${ev.team === 'AWAY' ? 'flex-row-reverse' : ''}`}>
                          <div className="p-1.5 bg-dark-800 rounded">{getEventIcon(ev.type, ev.detail)}</div>
                          <div className={ev.team === 'AWAY' ? 'text-right' : ''}>
                            <div className="text-xs font-bold text-white">{ev.player}</div>
                            {ev.playerOut && <div className="text-[9px] text-zinc-500">Off: {ev.playerOut}</div>}
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 w-10 h-10 rounded-full bg-dark-800 border-2 border-white/[0.08] flex items-center justify-center font-mono font-bold text-pitch-500 text-[11px] shadow-lg shrink-0">
                        {ev.minute}
                      </div>

                      <div className="flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============ SOFASCORE TAB ============ */}
          {activeTab === 'sofascore' && (
            <div className="animate-fade-in">
              <SofaScoreEmbed homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // NON-MATCH ENTITY VIEW (Player / Team)
  // ============================================================================
  return (
    <div className="animate-fade-in pb-20">
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent z-10"></div>
        <div style={{ background: entity.image }} className="w-full h-full opacity-20" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32 md:-mt-40 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-44 md:w-56 shrink-0 mx-auto md:mx-0 shadow-2xl rounded-lg overflow-hidden border border-white/[0.08]">
            <div style={{ background: entity.image }} className="w-full aspect-[3/4]" />
          </div>

          <div className="flex-1 text-center md:text-left pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-black text-white">{entity.name}</h1>
              <span className="text-zinc-400 font-light text-lg">{entity.league}</span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
              {entity.rating ? <StarRating rating={entity.rating} size={18} showValue /> : <span className="text-xs text-zinc-500 italic">Be the first to rate</span>}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button onClick={onRate} className="bg-pitch-600 hover:bg-pitch-500 text-white font-bold py-2 px-6 rounded transition shadow-lg shadow-pitch-900/40">
                Rate / Review
              </button>
            </div>
          </div>
        </div>

        {/* ML Watchability Prediction Card */}
        {mlPrediction && (
          <div className="mt-8 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-dark-900 border border-purple-600/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500 flex items-center justify-center">
                  <Brain size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={12} /> ML Watchability Score
                  </h3>
                  <p className="text-[10px] text-zinc-500">AI-powered prediction - {Math.round(mlPrediction.confidence * 100)}% confidence</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white">
                  {mlPrediction.score.toFixed(1)}
                  <span className="text-sm text-zinc-500">/10</span>
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${
                  mlPrediction.score >= 8 ? 'text-orange-400' :
                  mlPrediction.score >= 6 ? 'text-purple-400' :
                  'text-zinc-400'
                }`}>
                  {mlPrediction.score >= 9 ? 'Must Watch' :
                   mlPrediction.score >= 8 ? 'Highly Recommended' :
                   mlPrediction.score >= 6 ? 'Worth Watching' :
                   'Average'}
                </div>
              </div>
            </div>
            {mlPrediction.topFactors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-purple-700/30">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap size={10} /> Key Factors
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {mlPrediction.topFactors.slice(0, 6).map((factor, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-lg text-[10px] font-medium flex items-center justify-between ${
                        factor.contribution > 0
                          ? 'bg-pitch-900/40 border border-pitch-700/50 text-pitch-300'
                          : 'bg-red-900/20 border border-red-700/30 text-red-300'
                      }`}
                    >
                      <span className="truncate">{factor.factor}</span>
                      <span className={`font-bold ml-2 ${factor.contribution > 0 ? 'text-pitch-400' : 'text-red-400'}`}>
                        {factor.contribution > 0 ? '+' : ''}{(factor.contribution * 10).toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Player Profile Section */}
        {entity.type === 'PLAYER' && (
          <div className="mt-16 space-y-8">
            {entity.description && (
              <div className="bg-dark-800 border border-white/[0.06] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4 border-l-4 border-yellow-500 pl-4">
                  <Star className="text-yellow-500" size={20} />
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">Why Watch This Player</h3>
                </div>
                <p className="text-zinc-300 leading-relaxed">{entity.description}</p>
              </div>
            )}

            {typeof entity.stats === 'object' && 'goals' in entity.stats && (
              <div className="bg-gradient-to-br from-pitch-900/40 via-yellow-900/20 to-dark-900 border border-pitch-600/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6 border-l-4 border-pitch-500 pl-4">
                  <Trophy className="text-pitch-400" size={20} />
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">Season Statistics</h3>
                  {entity.league && <span className="text-xs text-zinc-500">{entity.league}</span>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shirt className="text-pitch-400" size={18} />
                      <span className="text-xs text-zinc-400 uppercase font-bold">Number</span>
                    </div>
                    <p className="text-3xl font-black text-white">{entity.stats.number || '-'}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Goal className="text-pitch-400" size={18} />
                      <span className="text-xs text-zinc-400 uppercase font-bold">Goals</span>
                    </div>
                    <p className="text-3xl font-black text-pitch-400">{entity.stats.goals}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Footprints className="text-blue-400" size={18} />
                      <span className="text-xs text-zinc-400 uppercase font-bold">Assists</span>
                    </div>
                    <p className="text-3xl font-black text-blue-400">{entity.stats.assists}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="text-zinc-400" size={18} />
                      <span className="text-xs text-zinc-400 uppercase font-bold">Appearances</span>
                    </div>
                    <p className="text-3xl font-black text-white">{entity.stats.appearances}</p>
                  </div>
                </div>
              </div>
            )}

            {entity.recentForm && (
              <div className="bg-dark-800 border border-white/[0.06] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4 border-l-4 border-orange-500 pl-4">
                  <TrendingUp className="text-orange-500" size={20} />
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">Recent Form</h3>
                </div>
                <p className="text-zinc-300 leading-relaxed">{entity.recentForm}</p>
              </div>
            )}

            {entity.nextMatch && (
              <div className="bg-dark-800 border border-white/[0.06] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4 border-l-4 border-blue-500 pl-4">
                  <Activity className="text-blue-500" size={20} />
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">Next Match</h3>
                </div>
                <p className="text-zinc-300 leading-relaxed">{entity.nextMatch}</p>
              </div>
            )}
          </div>
        )}

        {/* Team sections */}
        {entity.type === 'TEAM' && (entity.squad || entity.recentMatches || entity.upcomingMatches) && (
          <div className="mt-16 space-y-8">
            {entity.squad && entity.squad.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6 border-l-4 border-pitch-500 pl-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">Current Squad</h3>
                    <span className="text-xs text-zinc-500">{entity.squad.length} Players</span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    {entity.league && <span className="mr-3">{entity.league}</span>}
                    {entity.formation && (
                      <span className="px-2 py-1 bg-pitch-900/40 border border-pitch-700/50 rounded text-pitch-400 font-mono font-bold">
                        {entity.formation}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {entity.squad.map((player, idx) => (
                    <div key={idx} className="bg-dark-800 border border-white/[0.06] rounded-lg p-4 hover:border-pitch-600 transition group">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-pitch-900 border border-pitch-600 flex items-center justify-center font-mono text-sm font-black text-pitch-300 shrink-0">
                          {player.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate group-hover:text-pitch-400 transition">{player.name}</h4>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">{player.position}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                              <Goal size={10} className="text-pitch-400" />
                              <span className="text-xs font-bold text-zinc-300">{player.goals || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Footprints size={10} className="text-blue-400" />
                              <span className="text-xs font-bold text-zinc-300">{player.assists || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entity.avgWatchability && (
              <div className="bg-gradient-to-br from-pitch-900/40 via-orange-900/20 to-dark-900 border border-pitch-600/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-pitch-600/20 border border-pitch-500 flex items-center justify-center">
                      <TrendingUp size={24} className="text-pitch-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Average Match Watchability</h3>
                      <p className="text-2xl font-black text-white mt-1">{entity.avgWatchability.toFixed(1)}<span className="text-sm text-zinc-500">/10</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">Based on recent performances</p>
                    <p className="text-[10px] text-pitch-400 font-bold uppercase tracking-wide mt-1">
                      {entity.avgWatchability >= 8 ? 'Must Watch Team' : entity.avgWatchability >= 6 ? 'Exciting Team' : 'Competitive Team'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {entity.recentMatches && entity.recentMatches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6 border-l-4 border-pitch-500 pl-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">Recent Matches</h3>
                  <span className="text-xs text-zinc-500">Last 5 Games</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {entity.recentMatches.map((m) => (
                    <div key={m.id} className="bg-dark-800 border border-white/[0.06] rounded-lg p-4 hover:border-pitch-600 transition group cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">{m.league}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          m.watchability && m.watchability >= 8 ? 'bg-orange-900/40 text-orange-400' :
                          m.watchability && m.watchability >= 6 ? 'bg-pitch-900/40 text-pitch-400' :
                          'bg-dark-900 text-zinc-500'
                        }`}>
                          {m.watchability?.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-center mb-2">
                        <div className="text-xs text-zinc-400 mb-1">{m.homeTeam}</div>
                        <div className="text-2xl font-black text-white font-mono">{m.score}</div>
                        <div className="text-xs text-zinc-400 mt-1">{m.awayTeam}</div>
                      </div>
                      <div className="text-[10px] text-zinc-600 text-center uppercase font-bold mt-2 pt-2 border-t border-white/[0.04]">
                        {m.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entity.upcomingMatches && entity.upcomingMatches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6 border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">Upcoming Fixtures</h3>
                  <span className="text-xs text-zinc-500">Next 3 Games</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {entity.upcomingMatches.map((m) => (
                    <div key={m.id} className="bg-gradient-to-br from-blue-900/20 to-dark-900 border border-blue-700/30 rounded-lg p-5 hover:border-blue-500 transition group cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] text-blue-400 font-bold uppercase">{m.league}</span>
                        {m.watchability && (
                          <div className="flex items-center gap-1">
                            <Activity size={12} className="text-blue-400" />
                            <span className="text-[10px] font-black text-blue-400">{m.watchability.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-center mb-2">
                        <div className="text-sm text-zinc-300 mb-2">{m.homeTeam}</div>
                        <div className="text-xs text-zinc-500 font-bold">VS</div>
                        <div className="text-sm text-zinc-300 mt-2">{m.awayTeam}</div>
                      </div>
                      <div className="text-[10px] text-blue-500 text-center uppercase font-bold mt-3 pt-3 border-t border-blue-900/30">
                        {m.minute || 'Upcoming'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews section for non-match entities */}
        <div className="mt-20">
          <div className="flex items-center gap-2 mb-8 border-b border-white/[0.06] pb-2">
            <Users size={18} className="text-pitch-500" />
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Community Discussion</h3>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {reviews.length > 0 ? reviews.map(rev => (
              <div key={rev.id} className="bg-dark-800 p-6 rounded-lg border border-white/[0.06] hover:border-white/[0.1] transition">
                <div className="flex items-center gap-3 mb-4">
                  <img src={rev.userAvatar} onClick={() => handleReviewerClick(rev)} className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition" alt={rev.userName} />
                  <div>
                    <div className="text-sm font-bold text-white cursor-pointer hover:text-pitch-400 transition" onClick={() => handleReviewerClick(rev)}>{rev.userName}</div>
                    <StarRating rating={rev.rating} size={10} />
                  </div>
                </div>
                <p className="text-zinc-300 text-sm italic font-serif leading-relaxed">"{rev.comment}"</p>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center text-zinc-500 italic bg-dark-800/30 rounded border border-dashed border-white/[0.06]">
                No reviews yet. Share your tactical analysis!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EntityProfile);
