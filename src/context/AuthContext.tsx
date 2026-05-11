"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
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

  const logout = async () => {
    try {
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const syncProfile = async (firebaseUser: User) => {
    try {
      const { syncUser } = await import("@/actions/user");
      const { withRetry } = await import("@/lib/prisma");
      
      const result = await withRetry(() => syncUser({
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        image: firebaseUser.photoURL,
      }));
      
      if (result.success && result.user) {
        setIsProfileComplete(result.user.isProfileCompleted);
      } else {
        // If sync fails but we have a user, assume incomplete to be safe
        setIsProfileComplete(false);
      }
    } catch (err) {
      console.error("Failed to sync user to DB:", err);
      setIsProfileComplete(false);
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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await syncProfile(firebaseUser);
      } else {
        setUser(null);
        setIsProfileComplete(true); // Default to true for non-logged in users
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isProfileComplete, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
