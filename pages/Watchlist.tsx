import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Clock, Trash2 } from 'lucide-react';
import { getUserWatchlist, removeFromWatchlist } from '../services/watchService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RowSkeleton } from '../components/LoadingSkeleton';
import { TeamCrest } from '../components/MatchCard';
import type { WatchlistEntry } from '../types';

export default function Watchlist() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/'); return; }
    getUserWatchlist(user.uid)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const handleRemove = async (entryId: string) => {
    try {
      await removeFromWatchlist(entryId);
      setEntries(prev => prev.filter(e => e.id !== entryId));
      showToast('Removed from watchlist');
    } catch { showToast('Failed to remove', 'error'); }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <Clock size={24} color="var(--accent)" />
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Watchlist</h1>
      </div>

      {loading && <RowSkeleton rows={6} />}

      {!loading && entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Clock size={48} color="var(--border)" style={{ margin: '0 auto 16px', display: 'block' }} />
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 8 }}>Your watchlist is empty</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Add upcoming matches you plan to watch
          </p>
          <Link to="/schedule" className="btn-primary" style={{ display: 'inline-flex' }}>View Schedule</Link>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {entries.map(entry => {
            const m = entry.matchSnapshot;
            const isUpcoming = ['SCHEDULED', 'TIMED'].includes(m.status);
            return (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '14px 16px',
              }}>
                <div style={{ flexShrink: 0, width: 60, textAlign: 'center' }}>
                  {isUpcoming ? (
                    <>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {format(parseISO(m.utcDate), 'MMM d')}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {format(parseISO(m.utcDate), 'HH:mm')}
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {format(parseISO(m.utcDate), 'MMM d')}
                    </span>
                  )}
                </div>

                <Link to={`/match/${m.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                    <TeamCrest crest={m.homeTeam.crest} name={m.homeTeam.shortName} size={22} />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.homeTeam.shortName}
                    </span>
                  </div>
                  {m.status === 'FINISHED' && m.score.fullTime.home !== null ? (
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                      {m.score.fullTime.home}–{m.score.fullTime.away}
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>vs</span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      {m.awayTeam.shortName}
                    </span>
                    <TeamCrest crest={m.awayTeam.crest} name={m.awayTeam.shortName} size={22} />
                  </div>
                </Link>

                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, paddingLeft: 4 }}>
                  {m.competition.name.split(' ')[0]}
                </span>

                <button
                  onClick={() => handleRemove(entry.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
