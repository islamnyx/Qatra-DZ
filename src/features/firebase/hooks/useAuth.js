/**
 * TODO (Firebase team): implement sign-in (phone, email, or anonymous).
 *
 * Example:
 *   import { signInAnonymously } from "firebase/auth";
 *   import { getFirebaseAuth } from "../init.js";
 */
import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    (async () => {
      const { getFirebaseAuth } = await import("../init.js");
      const auth = await getFirebaseAuth();
      if (!auth) {
        setLoading(false);
        return;
      }
      const { onAuthStateChanged } = await import("firebase/auth");
      unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    })();
    return () => unsubscribe();
  }, []);

  return { user, loading, isSignedIn: Boolean(user) };
}
