import type { MatchList, MatchSnapshot } from '../types';
import {
  db,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
} from './firebase';

export async function createList(
  userId: string,
  userDisplayName: string,
  userPhotoURL: string | undefined,
  name: string,
  description: string,
  isPublic: boolean
): Promise<string> {
  const ref = await addDoc(collection(db, 'lists'), {
    userId,
    userDisplayName,
    userPhotoURL: userPhotoURL ?? null,
    name,
    description,
    matchIds: [],
    matchSnapshots: [],
    isPublic,
    likes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getUserLists(userId: string): Promise<MatchList[]> {
  const q = query(
    collection(db, 'lists'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MatchList));
}

export async function getList(listId: string): Promise<MatchList | null> {
  const snap = await getDoc(doc(db, 'lists', listId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as MatchList;
}

export async function getPublicLists(count = 12): Promise<MatchList[]> {
  const q = query(
    collection(db, 'lists'),
    where('isPublic', '==', true),
    orderBy('likes', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MatchList));
}

export async function addMatchToList(listId: string, matchId: number, matchSnapshot: MatchSnapshot) {
  const listRef = doc(db, 'lists', listId);
  const snap = await getDoc(listRef);
  if (!snap.exists()) return;

  const data = snap.data() as MatchList;
  if (data.matchIds.includes(matchId)) return;

  await updateDoc(listRef, {
    matchIds: [...data.matchIds, matchId],
    matchSnapshots: [...data.matchSnapshots, matchSnapshot],
    updatedAt: new Date().toISOString(),
  });
}

export async function removeMatchFromList(listId: string, matchId: number) {
  const listRef = doc(db, 'lists', listId);
  const snap = await getDoc(listRef);
  if (!snap.exists()) return;

  const data = snap.data() as MatchList;
  await updateDoc(listRef, {
    matchIds: data.matchIds.filter(id => id !== matchId),
    matchSnapshots: data.matchSnapshots.filter(m => m.id !== matchId),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateList(listId: string, data: Partial<Pick<MatchList, 'name' | 'description' | 'isPublic'>>) {
  await updateDoc(doc(db, 'lists', listId), { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteList(listId: string) {
  await deleteDoc(doc(db, 'lists', listId));
}

export async function likeList(listId: string) {
  await updateDoc(doc(db, 'lists', listId), { likes: increment(1) });
}
