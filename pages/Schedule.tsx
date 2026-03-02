import React, { useEffect, useState } from 'react';
import { format, addDays, parseISO, startOfDay, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDateRangeMatches } from '../services/footballApi';
import type { Match } from '../types';
import { getCompetitionByCode, COMPETITIONS } from '../constants';
import { Link } from 'react-router-dom';
import { TeamCrest } from '../components/MatchCard';

function groupByDate(matches: Match[]): Record<string, Match[]> {
  const groups: Record<string, Match[]> = {};
  for (const m of matches) {
    const date = m.utcDate.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(m);
  }
  return groups;
}

export default function Schedule() {
  const [weekStart, setWeekStart] = useState(startOfDay(new Date()));
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [compFilter, setCompFilter] = useState('');

  const dateFrom = format(weekStart, 'yyyy-MM-dd');
  const dateTo = format(addDays(weekStart, 6), 'yyyy-MM-dd');

  useEffect(() => {
    setLoading(true);
    setError('');
    getDateRangeMatches(dateFrom, dateTo, compFilter || undefined)
      .then(res => setMatches(res.matches))
      .catch(e => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo, compFilter]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const grouped = groupByDate(matches.filter(m =>
    !compFilter || m.competition.code === compFilter
  ));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Schedule</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <select
            className="input-dark"
            value={compFilter}
            onChange={e => setCompFilter(e.target.value)}
            style={{ fontSize: 13 }}
          >
            <option value="">All competitions</option>
            {COMPETITIONS.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => setWeekStart(d => addDays(d, -7))}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', padding: '0 8px', whiteSpace: 'nowrap' }}>
              {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <button
              onClick={() => setWeekStart(d => addDays(d, 7))}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Day tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd');
          const count = grouped[key]?.length ?? 0;
          const isToday = isSameDay(day, new Date());
          return (
            <a href={`#day-${key}`} key={key} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '8px 14px', borderRadius: 6, flexShrink: 0,
              background: count > 0 ? 'var(--bg-card)' : 'transparent',
              border: isToday ? '1px solid var(--accent)' : '1px solid transparent',
              textDecoration: 'none',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {format(day, 'EEE')}
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: isToday ? 'var(--accent)' : 'var(--text-primary)' }}>
                {format(day, 'd')}
              </span>
              {count > 0 && (
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{count}</span>
              )}
            </a>
          );
        })}
      </div>

      {error && (
        <div style={{ background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)', borderRadius: 6, padding: '12px 16px', fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: 6 }} />
          ))}
        </div>
      )}

      {!loading && (
        days.map(day => {
          const key = format(day, 'yyyy-MM-dd');
          const dayMatches = grouped[key] ?? [];
          if (dayMatches.length === 0) return null;
          return (
            <div key={key} id={`day-${key}`} style={{ marginBottom: 32 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em',
                marginBottom: 12, textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {isSameDay(day, new Date()) && (
                  <span style={{ background: 'var(--accent)', color: '#000', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>TODAY</span>
                )}
                {format(day, 'EEEE, d MMMM')}
              </div>

              {/* Group by competition */}
              {Object.entries(
                dayMatches.reduce((acc, m) => {
                  const k = m.competition.code;
                  if (!acc[k]) acc[k] = [];
                  acc[k].push(m);
                  return acc;
                }, {} as Record<string, Match[]>)
              ).map(([compCode, compMatches]) => {
                const comp = getCompetitionByCode(compCode);
                return (
                  <div key={compCode} style={{ marginBottom: 16 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 10px', background: 'var(--bg-elevated)', borderRadius: 4, marginBottom: 2,
                    }}>
                      {comp?.emblem && (
                        <img src={comp.emblem} alt="" width={14} height={14} style={{ objectFit: 'contain' }}
                          onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                      )}
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                        {comp?.flag} {comp?.name ?? compCode}
                      </span>
                    </div>
                    {compMatches.map(m => {
                      const isLive = m.status === 'IN_PLAY' || m.status === 'PAUSED';
                      const isFinished = m.status === 'FINISHED';
                      return (
                        <Link key={m.id} to={`/match/${m.id}`} style={{
                          display: 'grid', gridTemplateColumns: '60px 1fr auto 1fr 60px',
                          alignItems: 'center', gap: 12, padding: '10px 10px',
                          borderBottom: '1px solid var(--border)', transition: 'background 0.1s',
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          <span style={{ fontSize: 12, color: isLive ? 'var(--red)' : 'var(--text-muted)', fontWeight: isLive ? 600 : 400, textAlign: 'center' }}>
                            {isLive ? 'LIVE' : format(parseISO(m.utcDate), 'HH:mm')}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', textAlign: 'right' }}>
                              {m.homeTeam.shortName}
                            </span>
                            <TeamCrest crest={m.homeTeam.crest} name={m.homeTeam.shortName} size={20} />
                          </div>
                          <div style={{ textAlign: 'center', minWidth: 48 }}>
                            {isFinished || isLive ? (
                              <span style={{
                                fontSize: 15, fontWeight: 800, color: isLive ? 'var(--red)' : 'var(--text-primary)',
                                fontVariantNumeric: 'tabular-nums',
                              }}>
                                {m.score.fullTime.home ?? 0}–{m.score.fullTime.away ?? 0}
                              </span>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>vs</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TeamCrest crest={m.awayTeam.crest} name={m.awayTeam.shortName} size={20} />
                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                              {m.awayTeam.shortName}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                            {isFinished ? 'FT' : ''}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })
      )}

      {!loading && Object.keys(grouped).length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 16 }}>No fixtures this week</p>
        </div>
      )}
    </div>
  );
}
