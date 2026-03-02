import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Trash2, Edit2, Globe, Lock } from 'lucide-react';
import { getList, deleteList, removeMatchFromList, updateList } from '../services/listService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TeamCrest } from '../components/MatchCard';
import type { MatchList } from '../types';

export default function ListDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [list, setList] = useState<MatchList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getList(id).then(setList).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('Delete this list?')) return;
    try {
      await deleteList(id);
      showToast('List deleted');
      navigate('/lists');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleRemoveMatch = async (matchId: number) => {
    if (!id) return;
    try {
      await removeMatchFromList(id, matchId);
      setList(prev => prev ? {
        ...prev,
        matchIds: prev.matchIds.filter(x => x !== matchId),
        matchSnapshots: prev.matchSnapshots.filter(m => m.id !== matchId),
      } : null);
      showToast('Match removed from list');
    } catch { showToast('Error', 'error'); }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <div className="skeleton" style={{ height: 100, borderRadius: 8, marginBottom: 24 }} />
      </div>
    );
  }

  if (!list) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>List not found</p>
      </div>
    );
  }

  const isOwner = user?.uid === list.userId;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 8, padding: 20, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{list.name}</h1>
              {list.isPublic
                ? <Globe size={14} color="var(--text-muted)" />
                : <Lock size={14} color="var(--text-muted)" />
              }
            </div>
            {list.description && <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 8px' }}>{list.description}</p>}
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              by {list.userDisplayName} · {list.matchIds.length} match{list.matchIds.length !== 1 ? 'es' : ''}
            </div>
          </div>
          {isOwner && (
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button
                onClick={handleDelete}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 8px', cursor: 'pointer', color: 'var(--red)' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {list.matchSnapshots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <p>No matches in this list yet.</p>
          <Link to="/matches" style={{ color: 'var(--accent)', fontSize: 13 }}>Browse matches to add</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {list.matchSnapshots.map(m => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '12px 14px',
            }}>
              <Link to={`/match/${m.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 44, flexShrink: 0 }}>
                  {format(parseISO(m.utcDate), 'MMM d')}
                </span>
                <TeamCrest crest={m.homeTeam.crest} name={m.homeTeam.shortName} size={20} />
                <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{m.homeTeam.shortName}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {m.score.fullTime.home ?? '–'}–{m.score.fullTime.away ?? '–'}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, textAlign: 'right' }}>{m.awayTeam.shortName}</span>
                <TeamCrest crest={m.awayTeam.crest} name={m.awayTeam.shortName} size={20} />
              </Link>
              {isOwner && (
                <button
                  onClick={() => handleRemoveMatch(m.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
