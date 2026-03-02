import React from 'react';
import { Link } from 'react-router-dom';
import { LEAGUE_COMPETITIONS, CUP_COMPETITIONS } from '../constants';

export default function Leagues() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 32px', letterSpacing: '-0.02em' }}>Competitions</h1>

      <div style={{ marginBottom: 40 }}>
        <div className="section-header"><h2>Top 5 Leagues</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {LEAGUE_COMPETITIONS.map(comp => (
            <Link key={comp.code} to={`/league/${comp.code}`} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '16px 20px',
              transition: 'border-color 0.15s, transform 0.15s',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = comp.color;
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--border)';
                el.style.transform = 'none';
              }}
            >
              {comp.emblem && (
                <img src={comp.emblem} alt="" width={48} height={48} style={{ objectFit: 'contain', flexShrink: 0 }}
                  onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
              )}
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{comp.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {comp.flag} {comp.country}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="section-header"><h2>Cup Competitions</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {CUP_COMPETITIONS.map(comp => (
            <Link key={comp.code} to={`/league/${comp.code}`} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '16px 20px',
              transition: 'border-color 0.15s, transform 0.15s',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = comp.color;
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--border)';
                el.style.transform = 'none';
              }}
            >
              {comp.emblem && (
                <img src={comp.emblem} alt="" width={48} height={48} style={{ objectFit: 'contain', flexShrink: 0 }}
                  onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
              )}
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{comp.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {comp.flag} {comp.country} · Cup
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
