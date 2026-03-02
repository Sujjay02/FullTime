import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { getCompetitionMatches, getDateRangeMatches } from '../services/footballApi';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';
import { MatchCardSkeleton } from '../components/LoadingSkeleton';
import ReviewModal from '../components/ReviewModal';
import type { Match } from '../types';
import { COMPETITIONS } from '../constants';

const STATUS_OPTS = [
  { label: 'All', value: '' },
  { label: 'Live', value: 'IN_PLAY,PAUSED' },
  { label: 'Finished', value: 'FINISHED' },
  { label: 'Upcoming', value: 'SCHEDULED,TIMED' },
];

export default function Matches() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();

  const competitionFilter = params.get('competition') ?? '';
  const statusFilter = params.get('status') ?? '';

  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(params.get('from') ?? subDays(new Date(), 3).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(params.get('to') ?? addDays(new Date(), 3).toISOString().split('T')[0]);

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewTarget, setReviewTarget] = useState<Match | null>(null);

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        let result: Match[] = [];
        if (competitionFilter) {
          const res = await getCompetitionMatches(competitionFilter, {
            dateFrom, dateTo,
            status: statusFilter || undefined,
          });
          result = res.matches;
        } else {
          const res = await getDateRangeMatches(dateFrom, dateTo);
          result = res.matches;
        }
        if (statusFilter) {
          const statuses = statusFilter.split(',');
          result = result.filter(m => statuses.includes(m.status));
        }
        setMatches(result);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load matches');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [competitionFilter, statusFilter, dateFrom, dateTo]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 60px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px', letterSpacing: '-0.02em' }}>Matches</h1>

      {/* Filters */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 8, padding: 16, marginBottom: 24,
        display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
          <Filter size={14} />
          <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Filters</span>
        </div>

        <div>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Competition</label>
          <select
            className="input-dark"
            value={competitionFilter}
            onChange={e => set('competition', e.target.value)}
          >
            <option value="">All competitions</option>
            {COMPETITIONS.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Status</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {STATUS_OPTS.map(opt => (
              <button
                key={opt.value}
                onClick={() => set('status', opt.value)}
                style={{
                  padding: '5px 10px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
                  background: statusFilter === opt.value ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: statusFilter === opt.value ? '#000' : 'var(--text-secondary)',
                  border: 'none', fontWeight: 500,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>From</label>
          <input type="date" className="input-dark" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>

        <div>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>To</label>
          <input type="date" className="input-dark" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      {/* Results */}
      {error && (
        <div style={{
          background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)',
          borderRadius: 6, padding: '12px 16px', marginBottom: 16,
          fontSize: 13, color: 'var(--red)',
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {Array.from({ length: 9 }).map((_, i) => <MatchCardSkeleton key={i} />)}
        </div>
      ) : matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>No matches found</p>
          <p style={{ fontSize: 13 }}>Try adjusting your filters or date range</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            {matches.length} match{matches.length !== 1 ? 'es' : ''}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {matches.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                onLog={user && m.status === 'FINISHED' ? () => setReviewTarget(m) : undefined}
              />
            ))}
          </div>
        </>
      )}

      {reviewTarget && (
        <ReviewModal
          match={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSaved={() => {}}
        />
      )}
    </div>
  );
}
