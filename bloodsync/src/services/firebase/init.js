import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFirebaseConfig } from "./config.js";

let app = null;
let auth = null;
let db = null;

export function getFirebaseApp() {
  const config = getFirebaseConfig();
  if (!config) return null;
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(config);
  }
  return app;
}

export function getFirebaseAuth() {
  if (!getFirebaseApp()) return null;
  if (!auth) {
    auth = getAuth(getFirebaseApp());
    if (import.meta.env.VITE_FIREBASE_USE_EMULATORS === "true") {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    }
  }
  return auth;
}

export function getFirestoreDb() {
  if (!getFirebaseApp()) return null;
  if (!db) {
    db = getFirestore(getFirebaseApp());
    if (import.meta.env.VITE_FIREBASE_USE_EMULATORS === "true") {
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
    }
  }
  return db;
}

export { isFirebaseConfigured } from "./config.js";
