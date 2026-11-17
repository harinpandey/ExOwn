"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { User, setPersistence, browserLocalPersistence, onIdTokenChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureServerSession } from "@/lib/auth-session-client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isProfileComplete: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isProfileComplete: true,
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const lastSyncedUid = useRef<string | null>(null);
  const activeUid = useRef<string | null>(null);

  const syncProfile = async (firebaseUser: User) => {
    try {
      const { syncUser } = await import("@/actions/user");

      const result = await syncUser({
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        image: firebaseUser.photoURL,
      });

      if (activeUid.current === firebaseUser.uid) {
        setIsProfileComplete(result.success && result.user
          ? result.user.isProfileCompleted
          : true);
      }
    } catch (err) {
      console.error("Failed to sync user to DB:", err);
      if (activeUid.current === firebaseUser.uid) {
        setIsProfileComplete(true);
      }
    }
  };

  const logout = async () => {
    try {
      const { signOut } = await import("firebase/auth");
      await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" }).catch(() => {});
      activeUid.current = null;
      lastSyncedUid.current = null;
      setUser(null);
      setIsProfileComplete(true);
      if (auth) await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await syncProfile(user);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let active = true;

    // Persist the Firebase session across browser restarts.
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error("Auth persistence error:", err);
    });

    // A single ID-token listener handles sign-in, sign-out, and token refresh.
    // Do not force-refresh inside this callback: doing so can trigger another
    // onIdTokenChanged event and cause redundant session-cookie requests.
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      try {
        if (!active) return;

        if (firebaseUser) {
          activeUid.current = firebaseUser.uid;
          setUser(firebaseUser);
          await ensureServerSession(firebaseUser);

          if (!active || activeUid.current !== firebaseUser.uid) return;

          if (lastSyncedUid.current !== firebaseUser.uid) {
            lastSyncedUid.current = firebaseUser.uid;
            await syncProfile(firebaseUser);
          }
        } else {
          activeUid.current = null;
          lastSyncedUid.current = null;
          await fetch("/api/auth/session", {
            method: "DELETE",
            credentials: "same-origin",
          }).catch(() => {});

          if (active) {
            setUser(null);
            setIsProfileComplete(true);
          }
        }
      } catch (err) {
        console.error("Auth/token synchronization failed:", err);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isProfileComplete, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
