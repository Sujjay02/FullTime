import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, parseISO, differenceInYears } from 'date-fns';
import { getPerson, getPersonMatches } from '../services/footballApi';
import type { PersonResponse } from '../services/footballApi';
import type { Match } from '../types';
import { POSITIONS } from '../constants';
import MatchCard from '../components/MatchCard';
import { RowSkeleton } from '../components/LoadingSkeleton';

export default function Player() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<PersonResponse | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMatches, setShowMatches] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPerson(Number(id))
      .then(setPlayer)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load player'))
      .finally(() => setLoading(false));
  }, [id]);

  const loadMatches = async () => {
    if (!id || matches.length > 0) { setShowMatches(true); return; }
    setMatchesLoading(true);
    try {
      const res = await getPersonMatches(Number(id), { limit: 20 });
      setMatches(res.matches ?? []);
      setShowMatches(true);
    } catch { /* ignore */ }
    finally { setMatchesLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
          <div className="skeleton" style={{ width: 100, height: 100, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 14, width: '60%' }} />
          </div>
        </div>
        <RowSkeleton rows={5} />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--red)', fontSize: 15 }}>{error || 'Player not found'}</p>
      </div>
    );
  }

  const age = player.dateOfBirth
    ? differenceInYears(new Date(), parseISO(player.dateOfBirth))
    : null;

  const posShort = player.position ? POSITIONS[player.position] ?? player.position : null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 60px' }}>
      {/* Player header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%)',
        border: '1px solid var(--border)', borderRadius: 12,
        padding: '28px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent) 0%, #006328 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 800, color: '#000',
        }}>
          {player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              {player.name}
            </h1>
            {posShort && (
              <span style={{
                fontSize: 11, fontWeight: 700, background: 'var(--bg-elevated)',
                padding: '2px 8px', borderRadius: 4, color: 'var(--accent)',
                letterSpacing: '0.08em', border: '1px solid var(--accent)',
              }}>
                {posShort}
              </span>
            )}
          </div>

          {player.currentTeam && (
            <Link to={`/team/${player.currentTeam.id}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12,
            }}>
              {player.currentTeam.crest && (
                <img src={player.currentTeam.crest} alt="" width={18} height={18} style={{ objectFit: 'contain' }}
                  onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
              )}
              {player.currentTeam.name}
            </Link>
          )}

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {player.nationality && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nationality</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2 }}>{player.nationality}</div>
              </div>
            )}
            {age !== null && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Age</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2 }}>
                  {age} ({player.dateOfBirth ? format(parseISO(player.dateOfBirth), 'MMM d, yyyy') : ''})
                </div>
              </div>
            )}
            {player.shirtNumber && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Shirt No.</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)', marginTop: 2 }}>#{player.shirtNumber}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contract info */}
      {player.currentTeam?.contract && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 16, marginBottom: 24,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Contract</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {player.currentTeam.contract.start} → {player.currentTeam.contract.until}
          </div>
        </div>
      )}

      {/* Competitions */}
      {player.currentTeam?.runningCompetitions && player.currentTeam.runningCompetitions.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-header"><h2>Competitions</h2></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {player.currentTeam.runningCompetitions.map(c => (
              <Link key={c.id} to={`/league/${c.code}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '4px 10px', fontSize: 13, color: 'var(--text-secondary)',
              }}>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent matches */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="section-header" style={{ marginBottom: 0 }}><h2>Recent Matches</h2></div>
          {!showMatches && (
            <button onClick={loadMatches} className="btn-log" style={{ fontSize: 12 }}>
              {matchesLoading ? 'Loading…' : 'Load matches'}
            </button>
          )}
        </div>

        {matchesLoading && <RowSkeleton rows={5} />}

        {showMatches && matches.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {matches.slice(0, 10).map(m => <MatchCard key={m.id} match={m} compact />)}
          </div>
        )}

        {showMatches && matches.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recent match data available.</p>
        )}
      </div>
    </div>
  );
}
