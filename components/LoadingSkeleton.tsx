import React from 'react';

export function MatchCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 8,
      padding: 16,
      border: '1px solid var(--border)',
    }}>
      <div className="skeleton" style={{ height: 10, width: '60%', marginBottom: 12 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        <div className="skeleton" style={{ height: 14, flex: 1 }} />
        <div className="skeleton" style={{ height: 20, width: 40 }} />
        <div className="skeleton" style={{ height: 14, flex: 1 }} />
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 4 }} />
      </div>
    </div>
  );
}

export function RowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 0',
          borderBottom: '1px solid var(--border)',
        }}>
          <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 14, flex: 1 }} />
          <div className="skeleton" style={{ height: 14, width: 60 }} />
        </div>
      ))}
    </>
  );
}

export function ProfileSkeleton() {
  return (
    <div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24 }}>
        <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: '60%' }} />
        </div>
      </div>
      <RowSkeleton rows={6} />
    </div>
  );
}

export default function PageLoadingSkeleton() {
  return (
    <div style={{ padding: '40px 0' }}>
      <div className="skeleton" style={{ height: 28, width: '30%', marginBottom: 32 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {Array.from({ length: 6 }).map((_, i) => <MatchCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
