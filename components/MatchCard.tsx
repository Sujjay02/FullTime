import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Match, MatchSnapshot } from '../types';
import { getCompetitionByCode } from '../constants';
import StarRating from './StarRating';

interface Props {
  match: Match | MatchSnapshot;
  userRating?: number;
  isLogged?: boolean;
  onLog?: () => void;
  compact?: boolean;
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'IN_PLAY': return { label: 'LIVE', cls: 'status-live' };
    case 'PAUSED': return { label: 'HT', cls: 'status-live' };
    case 'FINISHED': return { label: 'FT', cls: 'status-finished' };
    case 'SCHEDULED':
    case 'TIMED': return { label: 'Upcoming', cls: 'status-scheduled' };
    case 'POSTPONED': return { label: 'PPD', cls: 'status-scheduled' };
    default: return { label: status, cls: 'status-scheduled' };
  }
}

function ScoreDisplay({ score, status }: { score: Match['score']; status: string }) {
  const isFinished = ['FINISHED', 'IN_PLAY', 'PAUSED', 'AWARDED'].includes(status);
  if (!isFinished || score.fullTime.home === null) {
    return <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>–</span>;
  }
  return (
    <span style={{
      fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)',
      fontVariantNumeric: 'tabular-nums',
    }}>
      {score.fullTime.home}–{score.fullTime.away}
    </span>
  );
}

function TeamCrest({ crest, name, size = 28 }: { crest?: string; name: string; size?: number }) {
  const [error, setError] = React.useState(false);
  if (error || !crest) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 4,
        background: 'var(--bg-elevated)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 700, color: 'var(--text-muted)',
        flexShrink: 0,
      }}>
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={crest}
      alt={name}
      width={size}
      height={size}
      onError={() => setError(true)}
      style={{ objectFit: 'contain', flexShrink: 0 }}
    />
  );
}

export { TeamCrest };

export default function MatchCard({ match, userRating, isLogged, onLog, compact = false }: Props) {
  const competition = getCompetitionByCode(match.competition.code);
  const { label: statusLabel, cls: statusCls } = getStatusLabel(match.status);
  const dateStr = format(parseISO(match.utcDate), compact ? 'MMM d' : 'EEE MMM d, yyyy');
  const timeStr = format(parseISO(match.utcDate), 'HH:mm');

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: compact ? 12 : 16,
      transition: 'border-color 0.15s, box-shadow 0.15s',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Competition + date row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {competition?.emblem && (
            <img src={competition.emblem} alt="" width={14} height={14} style={{ objectFit: 'contain' }}
              onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
          )}
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            {competition?.flag} {competition?.shortName ?? match.competition.name}
            {match.matchday ? ` · MD${match.matchday}` : ''}
          </span>
        </div>
        <span className={`competition-badge ${statusCls}`} style={{ fontSize: 10 }}>{statusLabel}</span>
      </div>

      {/* Teams + Score */}
      <Link to={`/match/${match.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <TeamCrest crest={match.homeTeam.crest} name={match.homeTeam.shortName ?? match.homeTeam.name} size={28} />
          <span style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {match.homeTeam.shortName ?? match.homeTeam.name}
          </span>
        </div>

        <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 52 }}>
          {['SCHEDULED', 'TIMED'].includes(match.status) ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dateStr}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{timeStr}</span>
            </div>
          ) : (
            <ScoreDisplay score={match.score} status={match.status} />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right',
          }}>
            {match.awayTeam.shortName ?? match.awayTeam.name}
          </span>
          <TeamCrest crest={match.awayTeam.crest} name={match.awayTeam.shortName ?? match.awayTeam.name} size={28} />
        </div>
      </Link>

      {/* Footer */}
      {!compact && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={11} color="var(--text-muted)" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dateStr}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {userRating ? (
              <StarRating value={userRating} readonly size={12} />
            ) : null}
            {onLog && (
              <button
                onClick={e => { e.preventDefault(); onLog(); }}
                className={`btn-log ${isLogged ? 'logged' : ''}`}
              >
                <Eye size={11} />
                {isLogged ? 'Logged' : 'Log'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
