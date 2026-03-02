import React from 'react';
import { Link } from 'react-router-dom';
import type { Standing } from '../types';
import { TeamCrest } from './MatchCard';

interface Props {
  standings: Standing[];
  highlightTeamId?: number;
  compact?: boolean;
}

function FormDot({ result }: { result: string }) {
  const cls = result === 'W' ? 'form-w' : result === 'D' ? 'form-d' : 'form-l';
  return (
    <div className={cls} style={{
      width: 8, height: 8, borderRadius: '50%',
      display: 'inline-block', flexShrink: 0,
      title: result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss',
    }} title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'} />
  );
}

export default function LeagueTable({ standings, highlightTeamId, compact = false }: Props) {
  if (!standings.length) return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No standings available.</p>;

  const championsZone = 4;
  const europaZone = 6;
  const relegationZone = standings.length - 3;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ minWidth: compact ? 'auto' : 640 }}>
        <thead>
          <tr>
            <th style={{ width: 32, textAlign: 'center' }}>#</th>
            <th>Team</th>
            <th style={{ textAlign: 'center', width: 36 }}>P</th>
            <th style={{ textAlign: 'center', width: 36 }}>W</th>
            <th style={{ textAlign: 'center', width: 36 }}>D</th>
            <th style={{ textAlign: 'center', width: 36 }}>L</th>
            {!compact && <th style={{ textAlign: 'center', width: 48 }}>GF</th>}
            {!compact && <th style={{ textAlign: 'center', width: 48 }}>GA</th>}
            <th style={{ textAlign: 'center', width: 48 }}>GD</th>
            <th style={{ textAlign: 'center', width: 48, fontWeight: 700, color: 'var(--text-primary)' }}>Pts</th>
            {!compact && <th>Form</th>}
          </tr>
        </thead>
        <tbody>
          {standings.map(s => {
            const isHighlighted = s.team.id === highlightTeamId;
            const inChampions = s.position <= championsZone;
            const inEuropa = s.position > championsZone && s.position <= europaZone;
            const inRelegation = s.position > relegationZone;

            return (
              <tr
                key={s.team.id}
                className={isHighlighted ? 'pos-highlight' : ''}
                style={{ position: 'relative' }}
              >
                <td style={{ textAlign: 'center', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 4, bottom: 4, width: 3, borderRadius: 2,
                    background: inChampions ? '#1e90ff' : inEuropa ? '#ff9800' : inRelegation ? 'var(--red)' : 'transparent',
                  }} />
                  <span style={{
                    fontWeight: isHighlighted ? 700 : 400,
                    color: isHighlighted ? 'var(--accent)' : 'var(--text-muted)',
                  }}>
                    {s.position}
                  </span>
                </td>
                <td>
                  <Link to={`/team/${s.team.id}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TeamCrest crest={s.team.crest} name={s.team.tla ?? s.team.shortName} size={20} />
                    <span style={{ fontSize: 13, color: isHighlighted ? 'var(--accent)' : 'var(--text-primary)', fontWeight: isHighlighted ? 600 : 400 }}>
                      {compact ? (s.team.tla ?? s.team.shortName) : s.team.name}
                    </span>
                  </Link>
                </td>
                <td style={{ textAlign: 'center' }}>{s.playedGames}</td>
                <td style={{ textAlign: 'center' }}>{s.won}</td>
                <td style={{ textAlign: 'center' }}>{s.draw}</td>
                <td style={{ textAlign: 'center' }}>{s.lost}</td>
                {!compact && <td style={{ textAlign: 'center' }}>{s.goalsFor}</td>}
                {!compact && <td style={{ textAlign: 'center' }}>{s.goalsAgainst}</td>}
                <td style={{ textAlign: 'center', color: s.goalDifference > 0 ? 'var(--accent)' : s.goalDifference < 0 ? 'var(--red)' : 'var(--text-secondary)' }}>
                  {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>{s.points}</td>
                {!compact && s.form && (
                  <td>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                      {s.form.split(',').slice(-5).map((r, i) => <FormDot key={i} result={r} />)}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {!compact && (
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {[
            { color: '#1e90ff', label: 'Champions League' },
            { color: '#ff9800', label: 'Europa League' },
            { color: 'var(--red)', label: 'Relegation' },
          ].map(z => (
            <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: z.color }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{z.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
