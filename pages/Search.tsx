import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Users, Layers } from 'lucide-react';
import { getCompetitionTeams, getCompetitionMatches } from '../services/footballApi';
import type { Team, Match } from '../types';
import { COMPETITIONS } from '../constants';
import { TeamCrest } from '../components/MatchCard';
import MatchCard from '../components/MatchCard';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [query, setQuery] = useState(q);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const next = new URLSearchParams();
    next.set('q', query.trim());
    setParams(next);
  };

  useEffect(() => {
    if (!q) return;
    const search = async () => {
      setLoading(true);
      setHasSearched(true);
      const lq = q.toLowerCase();

      // Search teams from multiple leagues
      const teamResults: Team[] = [];
      const matchResults: Match[] = [];

      const codes = COMPETITIONS.filter(c => c.type === 'LEAGUE').map(c => c.code);

      await Promise.allSettled(
        codes.map(async code => {
          try {
            const res = await getCompetitionTeams(code);
            const matched = res.teams.filter(t =>
              t.name.toLowerCase().includes(lq) ||
              t.shortName?.toLowerCase().includes(lq) ||
              t.tla?.toLowerCase().includes(lq)
            );
            teamResults.push(...matched);
          } catch { /* ignore */ }
        })
      );

      // Search recent matches
      const today = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await Promise.allSettled(
        codes.map(async code => {
          try {
            const res = await getCompetitionMatches(code, { dateFrom: from, dateTo: today });
            const matched = res.matches.filter(m =>
              m.homeTeam.name.toLowerCase().includes(lq) ||
              m.awayTeam.name.toLowerCase().includes(lq)
            );
            matchResults.push(...matched);
          } catch { /* ignore */ }
        })
      );

      const uniqueTeams = Array.from(new Map(teamResults.map(t => [t.id, t])).values());
      const uniqueMatches = Array.from(new Map(matchResults.map(m => [m.id, m])).values());

      setTeams(uniqueTeams.slice(0, 12));
      setMatches(uniqueMatches.slice(0, 12));
      setLoading(false);
    };
    search();
  }, [q]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px', letterSpacing: '-0.02em' }}>Search</h1>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <SearchIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-dark"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search teams, matches…"
            style={{ width: '100%', paddingLeft: 40, height: 42, fontSize: 15 }}
            autoFocus
          />
        </div>
        <button type="submit" className="btn-primary" style={{ height: 42, paddingLeft: 20, paddingRight: 20 }}>
          Search
        </button>
      </form>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          Searching across all competitions…
        </div>
      )}

      {!loading && hasSearched && teams.length === 0 && matches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <SearchIcon size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: 16 }}>No results for "{q}"</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Try a different team or player name</p>
        </div>
      )}

      {!loading && teams.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div className="section-header"><h2>Teams</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {teams.map(team => (
              <Link key={team.id} to={`/team/${team.id}`} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '12px 14px',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
              >
                <TeamCrest crest={team.crest} name={team.tla ?? team.shortName} size={32} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {team.name}
                  </div>
                  {team.venue && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{team.venue}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <div>
          <div className="section-header"><h2>Matches</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
            {matches.map(m => <MatchCard key={m.id} match={m} compact />)}
          </div>
        </div>
      )}

      {!hasSearched && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <SearchIcon size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: 15 }}>Search for teams and matches</p>
        </div>
      )}
    </div>
  );
}
