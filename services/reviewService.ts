import type { Review, MatchSnapshot } from '../types';
import {
  db,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  increment,
} from './firebase';

export async function addReview(
  userId: string,
  userDisplayName: string,
  userPhotoURL: string | undefined,
  matchId: number,
  matchSnapshot: MatchSnapshot,
  rating: number,
  content: string,
  spoiler: boolean
): Promise<string> {
  const ref = await addDoc(collection(db, 'reviews'), {
    userId,
    userDisplayName,
    userPhotoURL: userPhotoURL ?? null,
    matchId,
    matchSnapshot,
    rating,
    content,
    spoiler,
    likes: 0,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getMatchReviews(matchId: number): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('matchId', '==', matchId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
}

export async function getRecentReviews(count = 12): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
}

export async function updateReview(
  reviewId: string,
  data: { rating?: number; content?: string; spoiler?: boolean }
) {
  await updateDoc(doc(db, 'reviews', reviewId), data);
}

export async function deleteReview(reviewId: string) {
  await deleteDoc(doc(db, 'reviews', reviewId));
}

export async function likeReview(reviewId: string) {
  await updateDoc(doc(db, 'reviews', reviewId), { likes: increment(1) });
}

export async function getUserReviewForMatch(userId: string, matchId: number): Promise<Review | null> {
  const q = query(
    collection(db, 'reviews'),
    where('userId', '==', userId),
    where('matchId', '==', matchId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Review;
}
