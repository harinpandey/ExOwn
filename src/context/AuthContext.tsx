"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isProfileComplete: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  isProfileComplete: true
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(true);

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
    <AuthContext.Provider value={{ user, loading, isProfileComplete }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
