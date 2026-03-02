import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTeam, getTeamMatches, getStandings } from '../services/footballApi';
import type { TeamResponse } from '../services/footballApi';
import type { Match, Standing } from '../types';
import { POSITIONS } from '../constants';
import MatchCard from '../components/MatchCard';
import LeagueTable from '../components/LeagueTable';
import { RowSkeleton } from '../components/LoadingSkeleton';

type Tab = 'squad' | 'results' | 'fixtures' | 'table';

export default function Team() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<TeamResponse | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [tab, setTab] = useState<Tab>('squad');
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTeam(Number(id))
      .then(setTeam)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load team'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || tab === 'squad') return;
    setDataLoading(true);

    const load = async () => {
      try {
        if (tab === 'results') {
          const res = await getTeamMatches(Number(id), { status: 'FINISHED', limit: 15 });
          setMatches(res.matches ?? []);
        } else if (tab === 'fixtures') {
          const res = await getTeamMatches(Number(id), { status: 'SCHEDULED,TIMED', limit: 15 });
          setMatches(res.matches ?? []);
        } else if (tab === 'table' && team?.runningCompetitions?.[0]) {
          const comp = team.runningCompetitions.find(c => c.type === 'LEAGUE');
          if (comp) {
            const res = await getStandings(comp.code);
            const main = res.standings.find(s => s.type === 'TOTAL');
            setStandings(main?.table ?? []);
          }
        }
      } catch { /* ignore */ }
      finally { setDataLoading(false); }
    };

    load();
  }, [id, tab, team]);

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
        <div className="skeleton" style={{ height: 120, borderRadius: 8, marginBottom: 24 }} />
        <RowSkeleton rows={10} />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--red)', fontSize: 15 }}>{error || 'Team not found'}</p>
      </div>
    );
  }

  const squadByPosition = (team.squad ?? []).reduce((acc, p) => {
    const section = p.section ?? p.position ?? 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(p);
    return acc;
  }, {} as Record<string, typeof team.squad>);

  const posOrder = ['Goalkeeper', 'Defender', 'Defence', 'Midfielder', 'Midfield', 'Forward', 'Offence', 'Other'];
  const sortedSections = Object.keys(squadByPosition).sort((a, b) =>
    (posOrder.indexOf(a) ?? 99) - (posOrder.indexOf(b) ?? 99)
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%)',
        border: '1px solid var(--border)', borderRadius: 12,
        padding: '28px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      }}>
        {team.crest ? (
          <img src={team.crest} alt={team.name} width={100} height={100} style={{ objectFit: 'contain', flexShrink: 0 }}
            onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
        ) : (
          <div style={{
            width: 100, height: 100, borderRadius: 12, background: 'var(--bg-elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: 'var(--text-muted)',
          }}>
            {team.tla}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {team.name}
          </h1>
          {team.founded && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Founded {team.founded}</div>
          )}
          {team.venue && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>📍 {team.venue}</div>
          )}
          {team.clubColors && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>🎨 {team.clubColors}</div>
          )}
        </div>

        {/* Competitions */}
        {team.runningCompetitions && team.runningCompetitions.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {team.runningCompetitions.map(c => (
              <Link key={c.id} to={`/league/${c.code}`} style={{
                fontSize: 12, color: 'var(--text-secondary)',
                background: 'var(--bg-elevated)', padding: '3px 8px',
                borderRadius: 4, border: '1px solid var(--border)',
              }}>
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Coach */}
      {team.coach && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 20 }}>👤</div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Manager</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{team.coach.name}</div>
            {team.coach.nationality && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{team.coach.nationality}</div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto' }}>
        {([
          { id: 'squad', label: 'Squad' },
          { id: 'results', label: 'Results' },
          { id: 'fixtures', label: 'Fixtures' },
          { id: 'table', label: 'League Table' },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {dataLoading && <RowSkeleton rows={10} />}

      {!dataLoading && tab === 'squad' && (
        <div>
          {sortedSections.map(section => (
            <div key={section} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                {section}s
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {(squadByPosition[section] ?? []).map(player => (
                  <Link key={player.id} to={`/player/${player.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '10px 12px',
                    transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--bg-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                      flexShrink: 0,
                    }}>
                      {player.shirtNumber ?? '–'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {player.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {POSITIONS[player.position ?? ''] ?? player.position ?? ''}
                        {player.nationality ? ` · ${player.nationality}` : ''}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(squadByPosition).length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No squad data available.</p>
          )}
        </div>
      )}

      {!dataLoading && (tab === 'results' || tab === 'fixtures') && (
        matches.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {matches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {tab === 'results' ? 'No results available.' : 'No upcoming fixtures.'}
          </p>
        )
      )}

      {!dataLoading && tab === 'table' && (
        standings.length > 0 ? (
          <LeagueTable standings={standings} highlightTeamId={team.id} />
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No standings available.</p>
        )
      )}
    </div>
  );
}
