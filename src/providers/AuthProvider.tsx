"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "@/firebase/firebase-client";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { AuthContextType, AuthUser } from "@/types/backend/auth";
import { FirestoreService } from "@/firebase/firestoreService";
import { getAdminByEmail } from "@/services/auth";

const AuthContext = createContext<AuthContextType>({
  user: null,

  signInWithGoogle: async () => {
    throw new Error("AuthProvider not found");
  },
  signOut: async () => {
    throw new Error("AuthProvider not found");
  },
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // const unsubscribe = onAuthStateChanged(auth, async (user) => {
    //   if (user?.email) {
    //     const adminDoc = await getAdminByEmail(user.email)
    //     console.log(adminDoc, "--admin doc--");

    //     if (adminDoc) {
    //       setUser({
    //         id: adminDoc.id,
    //         email: adminDoc.email,
    //         role: "admin",
    //       });
    //     }
    //   }

    //   //  console.log(user, "--Auth state--");
    // });

    // return () => unsubscribe();
  }, []);

  const googleLogin = async () => {
    const result = await signInWithPopup(auth, googleProvider);

    // Check if user exists in Firestore
    const token = await result.user.getIdToken();

    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

  };

  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    return signOut(auth);
  };

  const value: AuthContextType = {
    user,
    signInWithGoogle: googleLogin,
    signOut: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
