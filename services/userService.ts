import type { UserProfile } from '../types';
import { db, doc, getDoc, setDoc, updateDoc } from './firebase';

export async function getOrCreateUser(uid: string, displayName: string, photoURL?: string): Promise<UserProfile> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  const username = displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + uid.slice(0, 4);
  const profile: UserProfile = {
    uid,
    username,
    displayName,
    photoURL,
    bio: '',
    totalWatched: 0,
    createdAt: new Date().toISOString(),
  };

  await setDoc(ref, profile);
  return profile;
}

export async function getUser(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUser(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, 'users', uid), data as Record<string, unknown>);
}
