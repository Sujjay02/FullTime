import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { BookOpen, Trash2 } from 'lucide-react';
import { getUserWatchLog, removeFromLog } from '../services/watchService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/StarRating';
import { RowSkeleton } from '../components/LoadingSkeleton';
import type { WatchLog } from '../types';
import { TeamCrest } from '../components/MatchCard';

function groupByMonth(logs: WatchLog[]): Record<string, WatchLog[]> {
  const groups: Record<string, WatchLog[]> = {};
  for (const l of logs) {
    const key = format(parseISO(l.watchedDate), 'MMMM yyyy');
    if (!groups[key]) groups[key] = [];
    groups[key].push(l);
  }
  return groups;
}

export default function Diary() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<WatchLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/'); return; }
    getUserWatchLog(user.uid)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const handleRemove = async (logId: string) => {
    if (!confirm('Remove from diary?')) return;
    try {
      await removeFromLog(logId);
      setLogs(prev => prev.filter(l => l.id !== logId));
      showToast('Removed from diary');
    } catch { showToast('Failed to remove', 'error'); }
  };

  const totalWatched = logs.length;
  const avgRating = logs.filter(l => l.rating).length > 0
    ? logs.filter(l => l.rating).reduce((s, l) => s + (l.rating ?? 0), 0) / logs.filter(l => l.rating).length
    : 0;

  const grouped = groupByMonth(logs);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <BookOpen size={24} color="var(--accent)" />
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>My Diary</h1>
      </div>

      {/* Stats */}
      {!loading && totalWatched > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12, marginBottom: 32,
        }}>
          {[
            { label: 'Matches Logged', value: totalWatched },
            { label: 'Avg Rating', value: avgRating > 0 ? avgRating.toFixed(1) : '–' },
            { label: 'This Year', value: logs.filter(l => parseISO(l.watchedDate).getFullYear() === new Date().getFullYear()).length },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: 16, textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {loading && <RowSkeleton rows={8} />}

      {!loading && logs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <BookOpen size={48} color="var(--border)" style={{ margin: '0 auto 16px', display: 'block' }} />
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 8 }}>No matches logged yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Start logging matches you've watched to build your diary
          </p>
          <Link to="/matches" className="btn-primary" style={{ display: 'inline-flex' }}>Browse Matches</Link>
        </div>
      )}

      {!loading && Object.entries(grouped).map(([month, monthLogs]) => (
        <div key={month} style={{ marginBottom: 32 }}>
          <div className="section-header">
            <h2>{month}</h2>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>({monthLogs.length})</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {monthLogs.map(log => {
              const m = log.matchSnapshot;
              return (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '12px 14px',
                  transition: 'border-color 0.15s',
                }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 48, flexShrink: 0 }}>
                    {format(parseISO(log.watchedDate), 'MMM d')}
                  </span>

                  <Link to={`/match/${m.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                      <TeamCrest crest={m.homeTeam.crest} name={m.homeTeam.shortName} size={20} />
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.homeTeam.shortName}
                      </span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                      {m.score.fullTime.home ?? '–'}–{m.score.fullTime.away ?? '–'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
                        {m.awayTeam.shortName}
                      </span>
                      <TeamCrest crest={m.awayTeam.crest} name={m.awayTeam.shortName} size={20} />
                    </div>
                  </Link>

                  {log.rating && (
                    <div style={{ flexShrink: 0 }}>
                      <StarRating value={log.rating} readonly size={12} />
                    </div>
                  )}

                  <button
                    onClick={() => handleRemove(log.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 4, flexShrink: 0,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
