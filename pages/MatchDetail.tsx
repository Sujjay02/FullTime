import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Eye, MessageSquare, Heart, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import { getMatch } from '../services/footballApi';
import { getMatchReviews, deleteReview } from '../services/reviewService';
import { getUserLogForMatch, removeFromLog, getWatchlistEntry, addToWatchlist, removeFromWatchlist } from '../services/watchService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';
import { TeamCrest } from '../components/MatchCard';
import { getCompetitionByCode } from '../constants';
import type { Match, Review, WatchLog, WatchlistEntry, MatchSnapshot } from '../types';

function toSnapshot(match: Match): MatchSnapshot {
  return {
    id: match.id, utcDate: match.utcDate, status: match.status,
    homeTeam: { id: match.homeTeam.id, name: match.homeTeam.name, shortName: match.homeTeam.shortName, crest: match.homeTeam.crest },
    awayTeam: { id: match.awayTeam.id, name: match.awayTeam.name, shortName: match.awayTeam.shortName, crest: match.awayTeam.crest },
    score: match.score,
    competition: { id: match.competition.id, name: match.competition.name, code: match.competition.code, emblem: match.competition.emblem },
  };
}

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [match, setMatch] = useState<Match | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myLog, setMyLog] = useState<WatchLog | null>(null);
  const [myWatchlist, setMyWatchlist] = useState<WatchlistEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [spoilerVisible, setSpoilerVisible] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [matchRes, reviewsRes] = await Promise.all([
        getMatch(Number(id)),
        getMatchReviews(Number(id)),
      ]);
      setMatch(matchRes.match);
      setReviews(reviewsRes);

      if (user) {
        const [log, wl] = await Promise.all([
          getUserLogForMatch(user.uid, Number(id)),
          getWatchlistEntry(user.uid, Number(id)),
        ]);
        setMyLog(log);
        setMyWatchlist(wl);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id, user]);

  const handleWatchlist = async () => {
    if (!user || !match) return;
    try {
      if (myWatchlist) {
        await removeFromWatchlist(myWatchlist.id);
        setMyWatchlist(null);
        showToast('Removed from watchlist');
      } else {
        await addToWatchlist(user.uid, match.id, toSnapshot(match));
        const wl = await getWatchlistEntry(user.uid, match.id);
        setMyWatchlist(wl);
        showToast('Added to watchlist');
      }
    } catch { showToast('Error updating watchlist', 'error'); }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await deleteReview(reviewId);
      setReviews(r => r.filter(x => x.id !== reviewId));
      showToast('Review deleted');
    } catch { showToast('Failed to delete', 'error'); }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
        <div className="skeleton" style={{ height: 220, borderRadius: 8, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 14, width: '60%' }} />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--red)', fontSize: 15, marginBottom: 8 }}>{error || 'Match not found'}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          This may be due to API rate limits. Try again in a moment.
        </p>
      </div>
    );
  }

  const competition = getCompetitionByCode(match.competition.code);
  const isFinished = match.status === 'FINISHED' || match.status === 'AWARDED';
  const isUpcoming = match.status === 'SCHEDULED' || match.status === 'TIMED';
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%)',
        border: '1px solid var(--border)', borderRadius: 12,
        padding: '32px 24px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          background: `linear-gradient(135deg, ${competition?.color ?? '#333'} 0%, transparent 70%)`,
        }} />

        {/* Competition info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          {competition?.emblem && (
            <img src={competition.emblem} alt="" width={20} height={20} style={{ objectFit: 'contain' }}
              onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
          )}
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            {competition?.flag} {match.competition.name}
            {match.matchday ? ` · Matchday ${match.matchday}` : ''}
            {match.stage && match.stage !== 'REGULAR_SEASON' ? ` · ${match.stage.replace(/_/g, ' ')}` : ''}
          </span>
          {isLive && (
            <span className="competition-badge status-live" style={{ marginLeft: 4 }}>LIVE</span>
          )}
        </div>

        {/* Teams + Score */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center', gap: 24, textAlign: 'center',
        }}>
          {/* Home */}
          <Link to={`/team/${match.homeTeam.id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <TeamCrest crest={match.homeTeam.crest} name={match.homeTeam.shortName} size={72} />
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{match.homeTeam.name}</span>
          </Link>

          {/* Score / date */}
          <div style={{ textAlign: 'center', minWidth: 100 }}>
            {isFinished && match.score.fullTime.home !== null ? (
              <>
                <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {match.score.fullTime.home}–{match.score.fullTime.away}
                </div>
                {match.score.halfTime.home !== null && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    HT: {match.score.halfTime.home}–{match.score.halfTime.away}
                  </div>
                )}
              </>
            ) : isLive && match.score.fullTime.home !== null ? (
              <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--red)', letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {match.score.fullTime.home}–{match.score.fullTime.away}
              </div>
            ) : (
              <>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-muted)' }}>vs</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {format(parseISO(match.utcDate), 'EEE d MMM')}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {format(parseISO(match.utcDate), 'HH:mm')}
                </div>
              </>
            )}
          </div>

          {/* Away */}
          <Link to={`/team/${match.awayTeam.id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <TeamCrest crest={match.awayTeam.crest} name={match.awayTeam.shortName} size={72} />
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{match.awayTeam.name}</span>
          </Link>
        </div>

        {/* Community rating */}
        {avgRating > 0 && (
          <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Community Rating
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <StarRating value={avgRating} readonly size={18} />
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--star)' }}>{avgRating.toFixed(1)}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>({reviews.length})</span>
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      {user && (
        <div style={{
          display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap',
        }}>
          {isFinished && (
            <button
              onClick={() => { setEditingReview(null); setReviewModalOpen(true); }}
              className="btn-primary"
              style={{ gap: 6 }}
            >
              <Eye size={14} />
              {myLog ? 'Edit Review' : 'Log & Review'}
            </button>
          )}
          {!isFinished && (
            <button
              onClick={handleWatchlist}
              className="btn-log"
              style={{
                padding: '8px 14px', fontSize: 13,
                ...(myWatchlist ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-muted)' } : {}),
              }}
            >
              {myWatchlist ? '✓ On Watchlist' : '+ Add to Watchlist'}
            </button>
          )}
          {myLog && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--accent-muted)', borderRadius: 4, border: '1px solid var(--accent)' }}>
              <StarRating value={myLog.rating ?? 0} readonly size={13} />
              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Your rating</span>
            </div>
          )}
        </div>
      )}

      {/* Date/venue info */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 8, padding: 16, marginBottom: 24,
        display: 'flex', flexWrap: 'wrap', gap: 20,
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Date</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
            {format(parseISO(match.utcDate), 'EEEE, d MMMM yyyy')}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Kick-off</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
            {format(parseISO(match.utcDate), 'HH:mm')} UTC
          </div>
        </div>
        {match.referees && match.referees.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Referee</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
              {match.referees[0].name}
            </div>
          </div>
        )}
      </div>

      {/* Reviews section */}
      <div>
        <div className="section-header">
          <h2>Reviews <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12, textTransform: 'none', letterSpacing: 'normal' }}>({reviews.length})</span></h2>
        </div>

        {reviews.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '32px 0',
            color: 'var(--text-muted)', fontSize: 14,
          }}>
            No reviews yet.{isFinished && ' Be the first to review this match.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map(review => {
              const isOwn = user?.uid === review.userId;
              const showContent = !review.spoiler || spoilerVisible[review.id];
              return (
                <div key={review.id} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {review.userPhotoURL ? (
                        <img src={review.userPhotoURL} alt="" width={36} height={36} style={{ borderRadius: '50%', flexShrink: 0 }} />
                      ) : (
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0,
                        }}>
                          {review.userDisplayName[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {review.userDisplayName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          <StarRating value={review.rating} readonly size={12} />
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {format(parseISO(review.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isOwn && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => { setEditingReview(review); setReviewModalOpen(true); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 4 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {review.content && (
                    <>
                      {review.spoiler && !showContent ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AlertTriangle size={13} color="var(--yellow)" />
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Spoiler warning – </span>
                          <button
                            onClick={() => setSpoilerVisible(prev => ({ ...prev, [review.id]: true }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 12, padding: 0 }}
                          >
                            Show anyway
                          </button>
                        </div>
                      ) : (
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                          {review.content}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review modal */}
      {reviewModalOpen && match && (
        <ReviewModal
          match={match}
          existingReviewId={editingReview?.id}
          existingRating={editingReview?.rating}
          existingContent={editingReview?.content}
          existingSpoiler={editingReview?.spoiler}
          onClose={() => { setReviewModalOpen(false); setEditingReview(null); }}
          onSaved={loadData}
        />
      )}
    </div>
  );
}
