import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStandings, getCompetitionMatches, getTopScorers } from '../services/footballApi';
import { getCompetitionByCode } from '../constants';
import type { StandingsTable, Match, TopScorer } from '../types';
import LeagueTable from '../components/LeagueTable';
import MatchCard from '../components/MatchCard';
import { RowSkeleton } from '../components/LoadingSkeleton';
import { TeamCrest } from '../components/MatchCard';

type Tab = 'table' | 'results' | 'fixtures' | 'scorers';

export default function League() {
  const { code } = useParams<{ code: string }>();
  const competition = getCompetitionByCode(code ?? '');

  const [tab, setTab] = useState<Tab>('table');
  const [standings, setStandings] = useState<StandingsTable[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setError('');

    const loadTab = async () => {
      try {
        if (tab === 'table' && standings.length === 0) {
          const res = await getStandings(code);
          setStandings(res.standings);
        } else if ((tab === 'results' || tab === 'fixtures') && matches.length === 0) {
          const status = tab === 'results' ? 'FINISHED' : 'SCHEDULED,TIMED';
          const res = await getCompetitionMatches(code, { status });
          setMatches(res.matches);
        } else if (tab === 'scorers' && scorers.length === 0) {
          const res = await getTopScorers(code);
          setScorers(res.scorers);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadTab();
  }, [code, tab]);

  // Reset when switching away
  const handleTabChange = (t: Tab) => {
    if (t !== tab) {
      setMatches([]);
      setError('');
    }
    setTab(t);
  };

  const filteredMatches = tab === 'results'
    ? matches.filter(m => m.status === 'FINISHED').slice(0, 20)
    : matches.filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED').slice(0, 20);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        {competition?.emblem && (
          <img src={competition.emblem} alt="" width={56} height={56} style={{ objectFit: 'contain' }}
            onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
        )}
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>
            {competition?.flag} {competition?.country ?? 'Europe'}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            {competition?.name ?? code}
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {competition?.type === 'CUP' ? 'Cup Competition' : 'League'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24, gap: 0, overflowX: 'auto' }}>
        {([
          { id: 'table', label: 'Table' },
          { id: 'results', label: 'Results' },
          { id: 'fixtures', label: 'Fixtures' },
          { id: 'scorers', label: 'Top Scorers' },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id)} className={`tab-btn ${tab === t.id ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)',
          borderRadius: 6, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--red)',
        }}>
          {error}
        </div>
      )}

      {loading && tab === 'table' && <RowSkeleton rows={20} />}
      {loading && (tab === 'results' || tab === 'fixtures') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 90, borderRadius: 8 }} />
          ))}
        </div>
      )}
      {loading && tab === 'scorers' && <RowSkeleton rows={10} />}

      {!loading && tab === 'table' && standings.length > 0 && (
        <LeagueTable standings={standings[0]?.table ?? []} />
      )}

      {!loading && (tab === 'results' || tab === 'fixtures') && (
        filteredMatches.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        ) : !loading && !error ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {tab === 'results' ? 'No results yet.' : 'No upcoming fixtures.'}
          </p>
        ) : null
      )}

      {!loading && tab === 'scorers' && scorers.length > 0 && (
        <div>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>#</th>
                <th>Player</th>
                <th>Club</th>
                <th style={{ textAlign: 'center' }}>Goals</th>
                <th style={{ textAlign: 'center' }}>Assists</th>
                <th style={{ textAlign: 'center' }}>Played</th>
              </tr>
            </thead>
            <tbody>
              {scorers.map((s, i) => (
                <tr key={s.player.id}>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>
                    <Link to={`/player/${s.player.id}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                      {s.player.name}
                    </Link>
                    {s.player.nationality && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.player.nationality}</div>
                    )}
                  </td>
                  <td>
                    <Link to={`/team/${s.team.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <TeamCrest crest={s.team.crest} name={s.team.name} size={18} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.team.name}</span>
                    </Link>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent)', fontSize: 16 }}>{s.goals}</td>
                  <td style={{ textAlign: 'center' }}>{s.assists ?? '–'}</td>
                  <td style={{ textAlign: 'center' }}>{s.playedMatches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'scorers' && scorers.length === 0 && !error && (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No scorer data available.</p>
      )}
    </div>
  );
}
