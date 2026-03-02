import type { WatchLog, WatchlistEntry, MatchSnapshot } from '../types';
import {
  db,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
} from './firebase';

// ── Watch Log ──────────────────────────────────────────────────────────────

export async function logMatch(
  userId: string,
  matchId: number,
  matchSnapshot: MatchSnapshot,
  watchedDate: string,
  rating?: number
): Promise<string> {
  const ref = await addDoc(collection(db, 'watchLogs'), {
    userId,
    matchId,
    matchSnapshot,
    watchedDate,
    rating: rating ?? null,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getUserWatchLog(userId: string): Promise<WatchLog[]> {
  const q = query(
    collection(db, 'watchLogs'),
    where('userId', '==', userId),
    orderBy('watchedDate', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WatchLog));
}

export async function getUserLogForMatch(userId: string, matchId: number): Promise<WatchLog | null> {
  const q = query(
    collection(db, 'watchLogs'),
    where('userId', '==', userId),
    where('matchId', '==', matchId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as WatchLog;
}

export async function removeFromLog(logId: string) {
  await deleteDoc(doc(db, 'watchLogs', logId));
}

export async function updateLogRating(logId: string, rating: number) {
  await updateDoc(doc(db, 'watchLogs', logId), { rating });
}

// ── Watchlist ──────────────────────────────────────────────────────────────

export async function addToWatchlist(
  userId: string,
  matchId: number,
  matchSnapshot: MatchSnapshot
): Promise<string> {
  const ref = await addDoc(collection(db, 'watchlist'), {
    userId,
    matchId,
    matchSnapshot,
    addedAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getUserWatchlist(userId: string): Promise<WatchlistEntry[]> {
  const q = query(
    collection(db, 'watchlist'),
    where('userId', '==', userId),
    orderBy('addedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WatchlistEntry));
}

export async function getWatchlistEntry(userId: string, matchId: number): Promise<WatchlistEntry | null> {
  const q = query(
    collection(db, 'watchlist'),
    where('userId', '==', userId),
    where('matchId', '==', matchId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as WatchlistEntry;
}

export async function removeFromWatchlist(entryId: string) {
  await deleteDoc(doc(db, 'watchlist', entryId));
}
