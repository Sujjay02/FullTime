import React from 'react';
import { Users } from 'lucide-react';

export default function Members() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <Users size={24} color="var(--accent)" />
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Members</h1>
      </div>

      <div style={{
        textAlign: 'center', padding: '80px 0',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12,
      }}>
        <Users size={56} color="var(--border)" style={{ margin: '0 auto 20px', display: 'block' }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Coming Soon</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto' }}>
          Member discovery, follow friends, and see what other football fans are watching is coming in a future update.
        </p>
      </div>
    </div>
  );
}
