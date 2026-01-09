
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection as firebaseCollection, 
  addDoc as firebaseAddDoc, 
  query as firebaseQuery, 
  where as firebaseWhere, 
  getDocs as firebaseGetDocs, 
  orderBy as firebaseOrderBy,
  updateDoc as firebaseUpdateDoc,
  doc as firebaseDoc
} from 'firebase/firestore';

// --- FIREBASE CONFIGURATION ---
// To enable Real Firebase:
// 1. Go to console.firebase.google.com and create a project.
// 2. Register a Web App and copy the config object.
// 3. Paste the values into MANUAL_CONFIG below OR use environment variables.

const MANUAL_CONFIG = {
  apiKey: "AIzaSyCz5-khp8p45VXry13706tdpgq2N92cchg",
  authDomain: "fulltime-football.firebaseapp.com",
  projectId: "fulltime-football",
  storageBucket: "fulltime-football.firebasestorage.app",
  messagingSenderId: "496305068606",
  appId: "1:496305068606:web:340bb3a4fcd9ce67254f6f"
};

// Helper to safely access process.env (prevents crash if process is undefined)
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
  } catch {
    return undefined;
  }
};

const envConfig = {
  apiKey: getEnv('REACT_APP_FIREBASE_API_KEY'),
  authDomain: getEnv('REACT_APP_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('REACT_APP_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('REACT_APP_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('REACT_APP_FIREBASE_APP_ID')
};

// Select Config: Manual takes precedence, then Env, then null
const config = MANUAL_CONFIG.apiKey ? MANUAL_CONFIG : envConfig;

// Validate Config
const isFirebaseConfigured = 
  config.apiKey && 
  config.apiKey.length > 20 && 
  !config.apiKey.includes("INSERT_YOUR_KEY");

// --- INTERFACE DEFINITIONS ---

let auth: any;
let db: any;
let googleProvider: any;

let _signInWithGoogle = async (): Promise<any> => {};
let _logout = async (): Promise<void> => {};
let _onAuthStateChanged = (auth: any, cb: any): any => {};
let _collection = (db: any, name: string): any => {};
let _addDoc = async (ref: any, data: any): Promise<any> => {};
let _getDocs = async (q: any): Promise<any> => {};
let _updateDoc = async (ref: any, data: any): Promise<void> => {};
let _doc = (db: any, path: string, ...pathSegments: string[]): any => {};
let _query = (ref: any, ...constraints: any[]): any => {};
let _where = (field: string, op: string, val: any): any => {};
let _orderBy = (field: string, dir: string): any => {};

// In-Memory Storage for Mock Mode (replaces localStorage)
const memoryStorage = new Map<string, string>();

const safeStorage = {
  getItem: (key: string) => memoryStorage.get(key) || null,
  setItem: (key: string, value: string) => memoryStorage.set(key, value),
  removeItem: (key: string) => memoryStorage.delete(key)
};

// --- IMPLEMENTATION SELECTION ---

if (isFirebaseConfigured) {
  // === REAL FIREBASE MODE ===
  try {
    const app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();

    _signInWithGoogle = async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      } catch (error) {
        console.error("Firebase Login Error", error);
        throw error;
      }
    };

    _logout = async () => {
      await firebaseSignOut(auth);
    };

    _onAuthStateChanged = firebaseOnAuthStateChanged;
    _collection = firebaseCollection;
    _addDoc = firebaseAddDoc;
    _getDocs = firebaseGetDocs;
    _updateDoc = firebaseUpdateDoc;
    _doc = firebaseDoc;
    _query = firebaseQuery;
    _where = firebaseWhere;
    _orderBy = firebaseOrderBy;
    
    console.log("✅ Firebase connected successfully.");
  } catch (err) {
    console.error("Failed to initialize Firebase, falling back to mock mode.", err);
    initMockMode();
  }
} else {
  // === MOCK MODE ===
  console.warn("⚠️ No valid Firebase config found. Running in Offline Mock Mode.");
  initMockMode();
}

function initMockMode() {
  auth = { currentUser: null }; 
  db = {}; 

  // Mock User Data
  const MOCK_USER = {
    uid: 'mock-user-local',
    displayName: 'Local Developer',
    email: 'dev@localhost',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  };

  _signInWithGoogle = async () => {
    await new Promise(r => setTimeout(r, 800)); // Simulate network
    safeStorage.setItem('ft_mock_user', JSON.stringify(MOCK_USER));
    auth.currentUser = MOCK_USER;
    window.dispatchEvent(new Event('mock-auth-change'));
    return MOCK_USER;
  };

  _logout = async () => {
    safeStorage.removeItem('ft_mock_user');
    auth.currentUser = null;
    window.dispatchEvent(new Event('mock-auth-change'));
  };

  _onAuthStateChanged = (authInstance: any, callback: any) => {
    const checkUser = () => {
       const u = safeStorage.getItem('ft_mock_user');
       const user = u ? JSON.parse(u) : null;
       authInstance.currentUser = user;
       callback(user);
    };
    
    checkUser(); // Initial check
    window.addEventListener('mock-auth-change', checkUser);
    return () => window.removeEventListener('mock-auth-change', checkUser);
  };

  // Mock Firestore (In-Memory)
  _collection = (db: any, name: string) => ({ type: 'collection', path: name });
  
  // Implement mock doc function
  _doc = (db: any, path: string, id: string) => ({ type: 'doc', path, id });

  // Implement mock updateDoc function
  _updateDoc = async (docRef: any, data: any) => {
      const path = docRef.path;
      const key = `ft_db_${path}`;
      let existing = JSON.parse(safeStorage.getItem(key) || '[]');
      const index = existing.findIndex((d: any) => d.id === docRef.id);
      if (index !== -1) {
          existing[index] = { ...existing[index], ...data };
          safeStorage.setItem(key, JSON.stringify(existing));
      }
      await new Promise(r => setTimeout(r, 400));
  };

  _query = (collectionRef: any, ...constraints: any[]) => ({ 
      type: 'query', 
      collection: collectionRef.path, 
      constraints 
  });

  _where = (field: string, op: string, value: any) => ({ type: 'where', field, op, value });
  _orderBy = (field: string, dir: string) => ({ type: 'orderBy', field, dir });

  _addDoc = async (collectionRef: any, data: any) => {
      const path = collectionRef.path;
      const key = `ft_db_${path}`;
      const existing = JSON.parse(safeStorage.getItem(key) || '[]');
      const newDoc = { id: `doc_${Date.now()}_${Math.random().toString(36).substr(2,9)}`, ...data };
      existing.push(newDoc);
      safeStorage.setItem(key, JSON.stringify(existing));
      await new Promise(r => setTimeout(r, 400));
      return { id: newDoc.id };
  };

  _getDocs = async (queryObj: any) => {
      await new Promise(r => setTimeout(r, 400));
      const path = queryObj.collection || queryObj.path; 
      const key = `ft_db_${path}`;
      let data = JSON.parse(safeStorage.getItem(key) || '[]');

      if (queryObj.constraints) {
          queryObj.constraints.forEach((c: any) => {
              if (c.type === 'where' && c.op === '==') {
                  data = data.filter((d: any) => d[c.field] === c.value);
              }
              if (c.type === 'orderBy') {
                  data.sort((a: any, b: any) => {
                      const valA = a[c.field] || '';
                      const valB = b[c.field] || '';
                      return c.dir === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
                  });
              }
          });
      }

      return {
          docs: data.map((d: any) => ({
              id: d.id,
              data: () => d
          }))
      };
  };
}

// Export the unified interface
export { 
  auth, 
  db, 
  _signInWithGoogle as signInWithGoogle, 
  _logout as logout, 
  _onAuthStateChanged as onAuthStateChanged,
  _collection as collection,
  _addDoc as addDoc,
  _getDocs as getDocs,
  _updateDoc as updateDoc,
  _doc as doc,
  _query as query,
  _where as where,
  _orderBy as orderBy
};
