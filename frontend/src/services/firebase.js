import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  onDisconnect, 
  serverTimestamp 
} from 'firebase/database';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
export const isDemoMode = !apiKey || apiKey.includes('DEMO_KEY') || apiKey.includes('YOUR_API_KEY');

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'satmoggle-demo.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://satmoggle-demo-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'satmoggle-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'satmoggle-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef'
};

let app, auth, db, rtdb;

if (!isDemoMode) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    rtdb = getDatabase(app);
    console.log('🔥 Live Firebase SDK initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize live Firebase SDK:', err);
  }
} else {
  console.warn('⚠️ SATmoggle is running in DEMO / LOCAL MODE. Configure VITE_FIREBASE_* in .env to connect live cloud database.');
}

export { app, auth, db, rtdb };

// --- DEMO / MOCK STORAGE FOR LOCAL TESTING ---
const MOCK_USER_KEY = 'satmoggle_mock_user';
const MOCK_PROFILE_KEY = 'satmoggle_mock_profile';
const MOCK_ROOMS_KEY = 'satmoggle_mock_rooms';

export function getMockUser() {
  const saved = localStorage.getItem(MOCK_USER_KEY);
  if (saved) return JSON.parse(saved);
  const defaultUser = { uid: `usr_demo_${Math.floor(Math.random()*9000+1000)}`, email: 'guest@satmoggle.edu', isAnonymous: true };
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(defaultUser));
  return defaultUser;
}

export function getMockProfile(uid) {
  const saved = localStorage.getItem(MOCK_PROFILE_KEY);
  if (saved) return JSON.parse(saved);
  const defaultProfile = {
    uid,
    username: 'DemoChampion',
    email: 'guest@satmoggle.edu',
    eloRating: 1250,
    gamesPlayed: 12,
    wins: 8,
    winRate: 66.7,
    subjectStats: {
      math: { correct: 45, total: 60, elo: 1260 },
      english: { correct: 38, total: 50, elo: 1240 }
    },
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(defaultProfile));
  return defaultProfile;
}

// --- AUTH SERVICES ---
export async function loginWithEmail(email, password) {
  if (isDemoMode) {
    const user = { uid: 'usr_' + btoa(email).slice(0,8), email, isAnonymous: false };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    const profile = getMockProfile(user.uid);
    profile.email = email;
    profile.username = email.split('@')[0];
    localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(profile));
    return user;
  }
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}
export const loginUser = loginWithEmail;

export async function registerWithEmail(email, password, username) {
  if (isDemoMode) {
    const user = { uid: 'usr_' + btoa(email).slice(0,8), email, isAnonymous: false };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    const profile = {
      uid: user.uid,
      username: username || email.split('@')[0],
      email,
      eloRating: 1200,
      gamesPlayed: 0,
      wins: 0,
      winRate: 0,
      subjectStats: { math: { correct: 0, total: 0, elo: 1200 }, english: { correct: 0, total: 0, elo: 1200 } },
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(profile));
    return user;
  }
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });
  await createProfileInFirestore(cred.user.uid, { username, email });
  return cred.user;
}
export const registerUser = registerWithEmail;

export async function loginAnonymously(username = 'GuestChallenger') {
  if (isDemoMode) {
    const user = { uid: `usr_anon_${Math.floor(Math.random()*90000+10000)}`, isAnonymous: true };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    const profile = {
      uid: user.uid,
      username,
      eloRating: 1200,
      gamesPlayed: 0,
      wins: 0,
      winRate: 0,
      subjectStats: { math: { correct: 0, total: 0, elo: 1200 }, english: { correct: 0, total: 0, elo: 1200 } },
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(profile));
    return user;
  }
  const cred = await signInAnonymously(auth);
  await createProfileInFirestore(cred.user.uid, { username });
  return cred.user;
}

export async function logoutUser() {
  if (isDemoMode) {
    localStorage.removeItem(MOCK_USER_KEY);
    return;
  }
  return fbSignOut(auth);
}

// --- FIRESTORE PROFILE SERVICES ---
export async function createProfileInFirestore(uid, { username, email = null }) {
  if (isDemoMode) return getMockProfile(uid);
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    const newProfile = {
      uid,
      username: username || `Challenger_${uid.slice(0,5)}`,
      email,
      eloRating: 1200,
      gamesPlayed: 0,
      wins: 0,
      winRate: 0,
      subjectStats: {
        math: { correct: 0, total: 0, elo: 1200 },
        english: { correct: 0, total: 0, elo: 1200 }
      },
      createdAt: new Date().toISOString()
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }
  return snap.data();
}

export async function getUserProfile(uid) {
  if (isDemoMode) return getMockProfile(uid);
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

export function subscribeToUserProfile(uid, callback) {
  if (isDemoMode) {
    callback(getMockProfile(uid));
    return () => {};
  }
  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

export async function updateUserEloAndStats(uid, { eloDelta, isWin, subject = 'math', correctAnswers = 0, totalQuestions = 0 }) {
  if (isDemoMode) {
    const profile = getMockProfile(uid);
    profile.eloRating = Math.max(100, (profile.eloRating || 1200) + eloDelta);
    profile.gamesPlayed = (profile.gamesPlayed || 0) + 1;
    if (isWin) profile.wins = (profile.wins || 0) + 1;
    profile.winRate = Number(((profile.wins / profile.gamesPlayed) * 100).toFixed(1));
    
    if (profile.subjectStats && profile.subjectStats[subject]) {
      profile.subjectStats[subject].correct += correctAnswers;
      profile.subjectStats[subject].total += totalQuestions;
      profile.subjectStats[subject].elo = Math.max(100, profile.subjectStats[subject].elo + eloDelta);
    }
    localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(profile));
    return profile;
  }

  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const data = snap.data();

  const newElo = Math.max(100, (data.eloRating || 1200) + eloDelta);
  const gamesPlayed = (data.gamesPlayed || 0) + 1;
  const wins = (data.wins || 0) + (isWin ? 1 : 0);
  const winRate = Number(((wins / gamesPlayed) * 100).toFixed(1));

  const subjectStats = data.subjectStats || { math: { correct: 0, total: 0, elo: 1200 }, english: { correct: 0, total: 0, elo: 1200 } };
  if (subjectStats[subject]) {
    subjectStats[subject].correct += correctAnswers;
    subjectStats[subject].total += totalQuestions;
    subjectStats[subject].elo = Math.max(100, (subjectStats[subject].elo || 1200) + eloDelta);
  }

  await updateDoc(userRef, { eloRating: newElo, gamesPlayed, wins, winRate, subjectStats });
}

// --- REALTIME DATABASE ROOM SERVICES ---
export function getRoomsList(callback) {
  if (isDemoMode) {
    // Return sample public rooms in demo mode
    const demoRooms = {
      'SAT101': {
        hostId: 'usr_demo_host1',
        hostName: 'IvyBound_Eric',
        status: 'LOBBY',
        isPublic: true,
        settings: { mode: 'BOMB_PARTY', difficulty: 'H', gameSize: 10, subject: 'math', bombTimer: 75 },
        playersCount: 3
      },
      'MATH99': {
        hostId: 'usr_demo_host2',
        hostName: 'CalcQueen',
        status: 'LOBBY',
        isPublic: true,
        settings: { mode: 'CLASSIC', difficulty: 'MIXED', gameSize: 15, subject: 'both', bombTimer: 75 },
        playersCount: 2
      }
    };
    callback(demoRooms);
    return () => {};
  }

  const roomsRef = ref(rtdb, 'rooms');
  return onValue(roomsRef, (snap) => {
    callback(snap.val() || {});
  });
}

export async function createRoom(roomCode, hostId, hostName, settings) {
  const roomData = {
    hostId,
    hostName,
    status: 'LOBBY', // LOBBY | PLAYING | FINISHED
    isPublic: true,
    createdAt: Date.now(),
    settings: {
      mode: settings.mode || 'BOMB_PARTY',
      difficulty: settings.difficulty || 'MIXED',
      gameSize: settings.gameSize || 10,
      subject: settings.subject || 'both',
      bombTimer: settings.bombTimer || 75 // Default 1:15 as approved by user
    },
    players: {
      [hostId]: {
        id: hostId,
        username: hostName,
        elo: 1200,
        isReady: true,
        score: 0,
        isAlive: true
      }
    }
  };

  if (isDemoMode) {
    const rooms = JSON.parse(localStorage.getItem(MOCK_ROOMS_KEY) || '{}');
    rooms[roomCode] = roomData;
    localStorage.setItem(MOCK_ROOMS_KEY, JSON.stringify(rooms));
    return roomData;
  }

  const roomRef = ref(rtdb, `rooms/${roomCode}`);
  await set(roomRef, roomData);
  return roomData;
}

export async function joinRoom(roomCode, player) {
  if (isDemoMode) {
    const rooms = JSON.parse(localStorage.getItem(MOCK_ROOMS_KEY) || '{}');
    if (!rooms[roomCode]) throw new Error('Room not found!');
    rooms[roomCode].players = rooms[roomCode].players || {};
    rooms[roomCode].players[player.id] = {
      id: player.id,
      username: player.username,
      elo: player.elo || 1200,
      isReady: true,
      score: 0,
      isAlive: true
    };
    localStorage.setItem(MOCK_ROOMS_KEY, JSON.stringify(rooms));
    return rooms[roomCode];
  }

  const roomRef = ref(rtdb, `rooms/${roomCode}`);
  const snap = await get(roomRef);
  if (!snap.exists()) throw new Error('Room not found!');
  
  const playerRef = ref(rtdb, `rooms/${roomCode}/players/${player.id}`);
  await set(playerRef, {
    id: player.id,
    username: player.username,
    elo: player.elo || 1200,
    isReady: true,
    score: 0,
    isAlive: true
  });
  return snap.val();
}

export function subscribeToRoom(roomCode, callback) {
  if (isDemoMode) {
    const rooms = JSON.parse(localStorage.getItem(MOCK_ROOMS_KEY) || '{}');
    callback(rooms[roomCode] || null);
    // Simple polling for demo mode changes
    const interval = setInterval(() => {
      const r = JSON.parse(localStorage.getItem(MOCK_ROOMS_KEY) || '{}');
      callback(r[roomCode] || null);
    }, 1000);
    return () => clearInterval(interval);
  }

  const roomRef = ref(rtdb, `rooms/${roomCode}`);
  return onValue(roomRef, (snap) => {
    callback(snap.val());
  });
}

export async function updateRoomStatus(roomCode, status, gameState = null) {
  if (isDemoMode) {
    const rooms = JSON.parse(localStorage.getItem(MOCK_ROOMS_KEY) || '{}');
    if (rooms[roomCode]) {
      rooms[roomCode].status = status;
      if (gameState) rooms[roomCode].gameState = gameState;
      localStorage.setItem(MOCK_ROOMS_KEY, JSON.stringify(rooms));
    }
    return;
  }

  const updates = { status };
  if (gameState) updates.gameState = gameState;
  await update(ref(rtdb, `rooms/${roomCode}`), updates);
}
