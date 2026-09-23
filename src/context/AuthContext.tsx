"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, setPersistence, browserLocalPersistence, onIdTokenChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

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

  const ensureServerSession = async (firebaseUser: User) => {
    try {
      const idToken = await firebaseUser.getIdToken(true);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "same-origin",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn("[ensureServerSession] Non-200 session response:", errorData.error || response.statusText);
      }
    } catch (err) {
      console.error("[ensureServerSession] Network error creating server session:", err);
    }
  };

  const syncProfile = async (firebaseUser: User) => {
    try {
      const { syncUser } = await import("@/actions/user");

      const result = await syncUser({
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        image: firebaseUser.photoURL,
      });

      if (result.success && result.user) {
        setIsProfileComplete(result.user.isProfileCompleted);
      } else {
        setIsProfileComplete(true);
      }
    } catch (err) {
      console.error("Failed to sync user to DB:", err);
      setIsProfileComplete(true);
    }
  };

  const logout = async () => {
    try {
      const { signOut } = await import("firebase/auth");
      await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" }).catch(() => {});
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

    // 1. Set Persistence (survive browser close)
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error("Auth persistence error:", err);
    });

    // 2. Auth State Change (handle login/logout)
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser); // Immediately update client auth state
          await ensureServerSession(firebaseUser);
          await syncProfile(firebaseUser);
        } else {
          await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" }).catch(() => {});
          setUser(null);
          setIsProfileComplete(true);
        }
      } catch (err) {
        console.error("Auth status listener error:", err);
      } finally {
        setLoading(false);
      }
    });

    // 3. ID Token Change (handle token refresh)
    const unsubscribeToken = onIdTokenChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          await ensureServerSession(firebaseUser);
        }
      } catch (err) {
        console.error("Token sync failed:", err);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isProfileComplete, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
