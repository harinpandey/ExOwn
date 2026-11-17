"use client";

import type { User } from "firebase/auth";

// The auth state listener and the login page can both request the same
// session cookie. Share an in-flight request per ID token to avoid duplicate
// POSTs and unnecessary pressure on the auth rate limiter.
const pendingSessions = new Map<string, Promise<void>>();

export async function ensureServerSession(firebaseUser: User): Promise<void> {
  const idToken = await firebaseUser.getIdToken();
  const existingRequest = pendingSessions.get(idToken);
  if (existingRequest) {
    return existingRequest;
  }

  const request = (async () => {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "same-origin",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || response.statusText || "Could not create a secure session.");
    }
  })();

  pendingSessions.set(idToken, request);
  try {
    await request;
  } finally {
    if (pendingSessions.get(idToken) === request) {
      pendingSessions.delete(idToken);
    }
  }
}
