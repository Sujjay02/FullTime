import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { Match, MatchSnapshot } from '../types';
import { addReview, updateReview } from '../services/reviewService';
import { logMatch } from '../services/watchService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { HalfStarRating } from './StarRating';

function toSnapshot(match: Match): MatchSnapshot {
  return {
    id: match.id,
    utcDate: match.utcDate,
    status: match.status,
    homeTeam: { id: match.homeTeam.id, name: match.homeTeam.name, shortName: match.homeTeam.shortName, crest: match.homeTeam.crest },
    awayTeam: { id: match.awayTeam.id, name: match.awayTeam.name, shortName: match.awayTeam.shortName, crest: match.awayTeam.crest },
    score: match.score,
    competition: { id: match.competition.id, name: match.competition.name, code: match.competition.code, emblem: match.competition.emblem },
  };
}

interface Props {
  match: Match;
  existingReviewId?: string;
  existingRating?: number;
  existingContent?: string;
  existingSpoiler?: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function ReviewModal({
  match,
  existingReviewId,
  existingRating = 0,
  existingContent = '',
  existingSpoiler = false,
  onClose,
  onSaved,
}: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rating, setRating] = useState(existingRating);
  const [content, setContent] = useState(existingContent);
  const [spoiler, setSpoiler] = useState(existingSpoiler);
  const [saving, setSaving] = useState(false);
  const [watchedDate, setWatchedDate] = useState(new Date().toISOString().split('T')[0]);

  const isEditing = !!existingReviewId;

  const handleSave = async () => {
    if (!user || rating === 0) return;
    setSaving(true);
    try {
      const snapshot = toSnapshot(match);
      if (isEditing && existingReviewId) {
        await updateReview(existingReviewId, { rating, content, spoiler });
      } else {
        await addReview(
          user.uid,
          user.displayName ?? 'Anonymous',
          user.photoURL ?? undefined,
          match.id,
          snapshot,
          rating,
          content,
          spoiler
        );
        await logMatch(user.uid, match.id, snapshot, watchedDate, rating);
      }
      showToast(isEditing ? 'Review updated!' : 'Review saved!');
      onSaved();
      onClose();
    } catch (err) {
      showToast('Failed to save review', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {isEditing ? 'Edit Review' : 'Log & Review'}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {match.homeTeam.shortName} vs {match.awayTeam.shortName}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Rating */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>
              Rating *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <HalfStarRating value={rating} onChange={setRating} size={24} />
              {rating > 0 && (
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--star)' }}>{rating.toFixed(1)}</span>
              )}
            </div>
          </div>

          {/* Watch Date */}
          {!isEditing && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>
                Watched on
              </label>
              <input
                type="date"
                className="input-dark"
                value={watchedDate}
                onChange={e => setWatchedDate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* Review text */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>
              Review <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span>
            </label>
            <textarea
              className="textarea-dark"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What did you think of this match?"
              style={{ width: '100%' }}
            />
          </div>

          {/* Spoiler toggle */}
          {content && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={spoiler}
                onChange={e => setSpoiler(e.target.checked)}
                style={{ accentColor: 'var(--accent)', width: 14, height: 14 }}
              />
              <AlertTriangle size={12} color={spoiler ? 'var(--yellow)' : 'var(--text-muted)'} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Contains spoilers</span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8, justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 4,
              padding: '7px 16px', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={rating === 0 || saving}
            className="btn-primary"
            style={{ opacity: rating === 0 || saving ? 0.5 : 1 }}
          >
            {saving ? 'Saving…' : isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
