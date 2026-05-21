/**
 * Lazy Firebase initialization — only loads SDK when configured.
 */
import { getFirebaseConfig } from "./config.js";

let appInstance = null;
let dbInstance = null;
let authInstance = null;

export function isFirebaseConfigured() {
  const { config } = getFirebaseConfig();
  return Boolean(config);
}

export async function getFirebaseApp() {
  if (appInstance) return appInstance;
  const { config } = getFirebaseConfig();
  if (!config) return null;

  const { initializeApp, getApps, getApp } = await import("firebase/app");
  appInstance = getApps().length ? getApp() : initializeApp(config);
  return appInstance;
}

export async function getFirestoreDb() {
  if (dbInstance) return dbInstance;
  const app = await getFirebaseApp();
  if (!app) return null;

  const { getFirestore, connectFirestoreEmulator } = await import("firebase/firestore");
  dbInstance = getFirestore(app);

  if (import.meta.env.VITE_FIREBASE_USE_EMULATORS === "true") {
    try {
      connectFirestoreEmulator(dbInstance, "127.0.0.1", 8080);
    } catch {
      /* already connected */
    }
  }

  return dbInstance;
}

export async function getFirebaseAuth() {
  if (authInstance) return authInstance;
  const app = await getFirebaseApp();
  if (!app) return null;

  const { getAuth, connectAuthEmulator } = await import("firebase/auth");
  authInstance = getAuth(app);

  if (import.meta.env.VITE_FIREBASE_USE_EMULATORS === "true") {
    try {
      connectAuthEmulator(authInstance, "http://127.0.0.1:9099");
    } catch {
      /* already connected */
    }
  }

  return authInstance;
}
