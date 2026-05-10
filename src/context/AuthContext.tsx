"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isProfileComplete: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  isProfileComplete: true,
  logout: async () => {},
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

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      // Sync Firebase user to our PostgreSQL database
      if (firebaseUser) {
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
          }
        } catch (err) {
          console.error("Failed to sync user to DB:", err);
        }
      } else {
        setIsProfileComplete(true);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isProfileComplete, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
