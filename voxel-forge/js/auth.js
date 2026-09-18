/**
 * auth.js
 * Three ways in:
 *   - Google (Firebase Auth popup)
 *   - GitHub (Firebase Auth popup)
 *   - Guest (a random id kept in localStorage — no account, still persists
 *     on this browser/device)
 * Whichever path a student takes, this module resolves to the same shape:
 *   { id, name, provider, photoURL }
 * so nothing downstream (blockchain.js, network.js, main.js) needs to know
 * or care how the student signed in.
 */
import { GUEST_ID_STORAGE_KEY, PROFILE_STORAGE_PREFIX } from './config.js';

function firebaseReady() {
  return typeof firebase !== 'undefined'
    && window.APP_FIREBASE_CONFIG
    && window.APP_FIREBASE_CONFIG.apiKey
    && !window.APP_FIREBASE_CONFIG.apiKey.startsWith('YOUR_');
}

let firebaseApp = null;
function ensureFirebaseApp() {
  if (!firebaseReady()) return null;
  if (!firebaseApp) firebaseApp = firebase.initializeApp(window.APP_FIREBASE_CONFIG);
  return firebaseApp;
}

function randomGuestId() {
  return 'guest-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_STORAGE_PREFIX + profile.id, JSON.stringify(profile));
  localStorage.setItem('voxelforge:lastUser', profile.id);
  return profile;
}

function loadProfile(id) {
  const raw = localStorage.getItem(PROFILE_STORAGE_PREFIX + id);
  return raw ? JSON.parse(raw) : null;
}

export function firebaseAvailable() {
  return firebaseReady();
}

async function signInWith(providerName) {
  const app = ensureFirebaseApp();
  if (!app) throw new Error('Firebase is not configured — see js/firebaseConfig.js, or use Guest mode.');
  const auth = firebase.auth();
  const provider = providerName === 'google'
    ? new firebase.auth.GoogleAuthProvider()
    : new firebase.auth.GithubAuthProvider();
  const result = await auth.signInWithPopup(provider);
  const user = result.user;
  const profile = {
    id: `${providerName}:${user.uid}`,
    name: user.displayName || user.email || 'Student',
    provider: providerName,
    photoURL: user.photoURL || null
  };
  return saveProfile(profile);
}

export const signInWithGoogle = () => signInWith('google');
export const signInWithGithub = () => signInWith('github');

export function continueAsGuest() {
  let id = localStorage.getItem(GUEST_ID_STORAGE_KEY);
  if (!id) {
    id = randomGuestId();
    localStorage.setItem(GUEST_ID_STORAGE_KEY, id);
  }
  const existing = loadProfile(id);
  const profile = existing || { id, name: `Guest ${id.slice(-4)}`, provider: 'guest', photoURL: null };
  return saveProfile(profile);
}

export function renameCurrentProfile(profile, newName) {
  const updated = { ...profile, name: newName.trim().slice(0, 24) || profile.name };
  return saveProfile(updated);
}

/** Try to silently restore whoever last signed in on this browser. */
export async function tryRestoreSession() {
  const lastId = localStorage.getItem('voxelforge:lastUser');
  if (!lastId) return null;

  if (lastId.startsWith('guest-') || lastId.startsWith('guest:')) {
    return loadProfile(lastId);
  }

  const app = ensureFirebaseApp();
  if (!app) return loadProfile(lastId); // Firebase not configured this session — fall back to the cached profile

  return new Promise(resolve => {
    const unsub = firebase.auth().onAuthStateChanged(user => {
      unsub();
      if (user) {
        const cached = loadProfile(lastId);
        resolve(cached || null);
      } else {
        resolve(null);
      }
    });
  });
}

export async function signOutCurrent() {
  localStorage.removeItem('voxelforge:lastUser');
  if (firebaseReady() && firebase.auth().currentUser) {
    try { await firebase.auth().signOut(); } catch { /* ignore */ }
  }
}
