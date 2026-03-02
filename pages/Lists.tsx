import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { List, Plus, Globe, Lock } from 'lucide-react';
import { getUserLists, createList } from '../services/listService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { MatchList } from '../types';

function CreateListModal({ onClose, onCreated }: { onClose: () => void; onCreated: (list: MatchList) => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    try {
      const id = await createList(user.uid, user.displayName ?? 'Anonymous', user.photoURL ?? undefined, name.trim(), description, isPublic);
      const newList: MatchList = {
        id, userId: user.uid, userDisplayName: user.displayName ?? 'Anonymous',
        userPhotoURL: user.photoURL ?? undefined, name: name.trim(), description,
        matchIds: [], matchSnapshots: [], isPublic, likes: 0,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      onCreated(newList);
      showToast('List created!');
      onClose();
    } catch { showToast('Failed to create list', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Create New List</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>List Name *</label>
            <input className="input-dark" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Champions League Classics" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Description</label>
            <textarea className="textarea-dark" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description…" style={{ width: '100%', minHeight: 80 }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
            <Globe size={14} color={isPublic ? 'var(--accent)' : 'var(--text-muted)'} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Make this list public</span>
          </label>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '7px 14px', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim() || saving} className="btn-primary" style={{ opacity: !name.trim() || saving ? 0.5 : 1 }}>
            {saving ? 'Creating…' : 'Create List'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Lists() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState<MatchList[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/'); return; }
    getUserLists(user.uid)
      .then(setLists)
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <List size={24} color="var(--accent)" />
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>My Lists</h1>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <Plus size={14} /> New List
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 8 }} />)}
        </div>
      )}

      {!loading && lists.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <List size={48} color="var(--border)" style={{ margin: '0 auto 16px', display: 'block' }} />
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 8 }}>No lists yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Create curated collections of your favourite matches
          </p>
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus size={14} /> Create your first list
          </button>
        </div>
      )}

      {!loading && lists.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lists.map(list => (
            <Link key={list.id} to={`/list/${list.id}`} style={{
              display: 'flex', alignItems: 'flex-start', gap: 16,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: 16, transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 8, background: 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <List size={20} color="var(--accent)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{list.name}</span>
                  {list.isPublic
                    ? <Globe size={12} color="var(--text-muted)" />
                    : <Lock size={12} color="var(--text-muted)" />
                  }
                </div>
                {list.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {list.description}
                  </p>
                )}
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {list.matchIds.length} match{list.matchIds.length !== 1 ? 'es' : ''} · Updated {format(parseISO(list.updatedAt), 'MMM d, yyyy')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {createOpen && (
        <CreateListModal
          onClose={() => setCreateOpen(false)}
          onCreated={list => setLists(prev => [list, ...prev])}
        />
      )}
    </div>
  );
}
