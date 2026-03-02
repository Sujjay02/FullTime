import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Calendar, Star, Users } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { getTodaysMatches, getDateRangeMatches, getCompetitionMatches } from '../services/footballApi';
import { getRecentReviews } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';
import StarRating from '../components/StarRating';
import { MatchCardSkeleton } from '../components/LoadingSkeleton';
import type { Match, Review } from '../types';
import { LEAGUE_COMPETITIONS, CUP_COMPETITIONS } from '../constants';
import ReviewModal from '../components/ReviewModal';

function SectionHeader({ title, linkTo, linkLabel }: { title: string; linkTo?: string; linkLabel?: string }) {
  return (
    <div className="section-header" style={{ marginBottom: 16 }}>
      <h2>{title}</h2>
      {linkTo && (
        <Link to={linkTo} style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 3, marginLeft: 8 }}>
          {linkLabel ?? 'See all'} <ArrowRight size={11} />
        </Link>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const m = review.matchSnapshot;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        {review.userPhotoURL ? (
          <img src={review.userPhotoURL} alt="" width={32} height={32} style={{ borderRadius: '50%' }} />
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#000',
          }}>
            {review.userDisplayName[0].toUpperCase()}
          </div>
        )}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{review.userDisplayName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {format(parseISO(review.createdAt), 'MMM d, yyyy')}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <StarRating value={review.rating} readonly size={13} />
        </div>
      </div>

      <Link to={`/match/${m.id}`} style={{ display: 'block', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          <span>{m.homeTeam.shortName}</span>
          {m.status === 'FINISHED' && m.score.fullTime.home !== null ? (
            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
              {m.score.fullTime.home}–{m.score.fullTime.away}
            </span>
          ) : <span>vs</span>}
          <span>{m.awayTeam.shortName}</span>
        </div>
      </Link>

      {review.content && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {review.content.length > 160 ? review.content.slice(0, 160) + '…' : review.content}
        </p>
      )}
    </div>
  );
}

function FixtureRow({ match }: { match: Match }) {
  const dateStr = format(parseISO(match.utcDate), 'EEE HH:mm');
  return (
    <Link to={`/match/${match.id}`} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0', borderBottom: '1px solid var(--border)',
      transition: 'opacity 0.15s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
    >
      <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 72, flexShrink: 0 }}>{dateStr}</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, textAlign: 'right' }}>
        {match.homeTeam.shortName}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, padding: '0 4px' }}>vs</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>
        {match.awayTeam.shortName}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
        {match.competition.name.split(' ')[0]}
      </span>
    </Link>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [recentFinished, setRecentFinished] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState<Match | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = addDays(new Date(), 7).toISOString().split('T')[0];
        const lastWeek = addDays(new Date(), -7).toISOString().split('T')[0];

        const [todayRes, upcomingRes, pastRes, reviews] = await Promise.allSettled([
          getTodaysMatches(),
          getDateRangeMatches(today, nextWeek),
          getDateRangeMatches(lastWeek, today),
          getRecentReviews(8),
        ]);

        if (todayRes.status === 'fulfilled') {
          setLiveMatches(todayRes.value.matches.slice(0, 6));
        }
        if (upcomingRes.status === 'fulfilled') {
          setUpcoming(upcomingRes.value.matches.filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED').slice(0, 8));
        }
        if (pastRes.status === 'fulfilled') {
          setRecentFinished(pastRes.value.matches.filter(m => m.status === 'FINISHED').slice(0, 6));
        }
        if (reviews.status === 'fulfilled') {
          setRecentReviews(reviews.value);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 60px' }}>

      {/* Hero */}
      <div style={{
        padding: '48px 0 40px',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)',
        marginBottom: 40,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: 12,
        }}>
          The social platform for football
        </div>
        <h1 style={{
          fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)',
          margin: '0 0 12px', lineHeight: 1.1,
        }}>
          Track every match<br />you've ever watched
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: '0 0 28px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
          Log matches, rate them, write reviews. Discover what the community thinks about the beautiful game.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            <Star size={14} color="var(--accent)" fill="var(--accent)" />
            Rate matches
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            <Calendar size={14} color="var(--accent)" fill="none" />
            Log your diary
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            <Users size={14} color="var(--accent)" fill="none" />
            Follow fans
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            <TrendingUp size={14} color="var(--accent)" fill="none" />
            See trends
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(280px, 320px)', gap: 40 }}>
        {/* Main column */}
        <div>
          {/* Today's matches / Live */}
          <div style={{ marginBottom: 40 }}>
            <SectionHeader
              title={liveMatches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED') ? 'Live Now' : "Today's Matches"}
              linkTo="/matches"
            />
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {[1, 2, 3].map(i => <MatchCardSkeleton key={i} />)}
              </div>
            ) : liveMatches.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {liveMatches.map(m => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    onLog={user ? () => setReviewTarget(m) : undefined}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                No matches today. Check the <Link to="/schedule" style={{ color: 'var(--accent)' }}>schedule</Link> for upcoming fixtures.
              </div>
            )}
          </div>

          {/* Recent finished */}
          {recentFinished.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <SectionHeader title="Recent Results" linkTo="/matches?status=FINISHED" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {recentFinished.slice(0, 6).map(m => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    onLog={user ? () => setReviewTarget(m) : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent community reviews */}
          {recentReviews.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <SectionHeader title="Recent Reviews" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentReviews.map(r => <ReviewCard key={r.id} review={r} />)}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Upcoming fixtures */}
          <div>
            <SectionHeader title="Upcoming" linkTo="/schedule" />
            {upcoming.length > 0 ? (
              <div>
                {upcoming.slice(0, 8).map(m => <FixtureRow key={m.id} match={m} />)}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No upcoming fixtures found.</p>
            )}
          </div>

          {/* Leagues */}
          <div>
            <SectionHeader title="Leagues" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {LEAGUE_COMPETITIONS.map(comp => (
                <Link key={comp.code} to={`/league/${comp.code}`} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 6,
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 16 }}>{comp.flag}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{comp.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{comp.country}</div>
                  </div>
                </Link>
              ))}
              <div style={{ margin: '8px 0 4px', padding: '8px 10px 4px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Cups
                </span>
              </div>
              {CUP_COMPETITIONS.map(comp => (
                <Link key={comp.code} to={`/league/${comp.code}`} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 6,
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 16 }}>{comp.flag}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{comp.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{comp.country}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {reviewTarget && (
        <ReviewModal
          match={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSaved={() => {}}
        />
      )}
    </div>
  );
}
