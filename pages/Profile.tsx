import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Settings } from 'lucide-react';
import { getUser } from '../services/userService';
import { getUserReviews } from '../services/reviewService';
import { getUserWatchLog } from '../services/watchService';
import { getUserLists } from '../services/listService';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { RowSkeleton } from '../components/LoadingSkeleton';
import { TeamCrest } from '../components/MatchCard';
import type { UserProfile, Review, WatchLog, MatchList } from '../types';

type Tab = 'reviews' | 'diary' | 'lists';

export default function Profile() {
  const { uid } = useParams<{ uid: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [diary, setDiary] = useState<WatchLog[]>([]);
  const [lists, setLists] = useState<MatchList[]>([]);
  const [tab, setTab] = useState<Tab>('reviews');
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  const isOwn = currentUser?.uid === uid;

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    getUser(uid)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    setTabLoading(true);
    const load = async () => {
      try {
        if (tab === 'reviews') {
          setReviews(await getUserReviews(uid));
        } else if (tab === 'diary') {
          setDiary(await getUserWatchLog(uid));
        } else if (tab === 'lists') {
          setLists(await getUserLists(uid));
        }
      } finally {
        setTabLoading(false);
      }
    };
    load();
  }, [uid, tab]);

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
          <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 20, width: '30%', marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 13, width: '50%' }} />
          </div>
        </div>
        <RowSkeleton rows={6} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Profile not found</p>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>
      {/* Profile header */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '24px 28px', marginBottom: 24,
        display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap',
      }}>
        {profile.photoURL ? (
          <img src={profile.photoURL} alt="" width={80} height={80} style={{ borderRadius: '50%', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
            background: 'var(--accent)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#000',
          }}>
            {profile.displayName[0].toUpperCase()}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              {profile.displayName}
            </h1>
            {isOwn && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>
                You
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>@{profile.username}</div>
          {profile.bio && (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.6 }}>{profile.bio}</p>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Member since {format(parseISO(profile.createdAt), 'MMMM yyyy')}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20, flexShrink: 0, flexWrap: 'wrap' }}>
          {[
            { label: 'Logged', value: profile.totalWatched },
            { label: 'Reviews', value: reviews.length },
            { label: 'Avg ★', value: avgRating > 0 ? avgRating.toFixed(1) : '–' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {([
          { id: 'reviews', label: 'Reviews' },
          { id: 'diary', label: 'Diary' },
          { id: 'lists', label: 'Lists' },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tabLoading && <RowSkeleton rows={6} />}

      {/* Reviews tab */}
      {!tabLoading && tab === 'reviews' && (
        reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reviews.map(review => {
              const m = review.matchSnapshot;
              return (
                <div key={review.id} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <Link to={`/match/${m.id}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TeamCrest crest={m.homeTeam.crest} name={m.homeTeam.shortName} size={22} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {m.homeTeam.shortName} {m.score.fullTime.home ?? '–'}–{m.score.fullTime.away ?? '–'} {m.awayTeam.shortName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {m.competition.name} · {format(parseISO(review.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <TeamCrest crest={m.awayTeam.crest} name={m.awayTeam.shortName} size={22} />
                    </Link>
                    <StarRating value={review.rating} readonly size={13} />
                  </div>
                  {review.content && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      {review.content.length > 200 ? review.content.slice(0, 200) + '…' : review.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
            {isOwn ? 'You haven\'t reviewed any matches yet.' : 'No reviews yet.'}
          </p>
        )
      )}

      {/* Diary tab */}
      {!tabLoading && tab === 'diary' && (
        diary.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {diary.map(log => {
              const m = log.matchSnapshot;
              return (
                <Link key={log.id} to={`/match/${m.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '12px 14px',
                }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 48, flexShrink: 0 }}>
                    {format(parseISO(log.watchedDate), 'MMM d')}
                  </span>
                  <TeamCrest crest={m.homeTeam.crest} name={m.homeTeam.shortName} size={20} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>
                    {m.homeTeam.shortName} {m.score.fullTime.home ?? '–'}–{m.score.fullTime.away ?? '–'} {m.awayTeam.shortName}
                  </span>
                  <TeamCrest crest={m.awayTeam.crest} name={m.awayTeam.shortName} size={20} />
                  {log.rating && <StarRating value={log.rating} readonly size={12} />}
                </Link>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>No diary entries.</p>
        )
      )}

      {/* Lists tab */}
      {!tabLoading && tab === 'lists' && (
        lists.filter(l => l.isPublic || isOwn).length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lists.filter(l => l.isPublic || isOwn).map(list => (
              <Link key={list.id} to={`/list/${list.id}`} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '14px 16px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{list.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {list.matchIds.length} matches
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>No public lists.</p>
        )
      )}
    </div>
  );
}
