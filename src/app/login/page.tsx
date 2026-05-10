"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  GoogleAuthProvider 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// Detect if browser is mobile or likely to block popups
function isMobileOrRestrictedBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return /Android|iPhone|iPad|iPod|Mobile|webOS/i.test(ua);
}

import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle redirect result after mobile sign-in returns
  useEffect(() => {
    if (!auth) return;
    
    // Only show loading if we don't have a user yet
    if (!user) {
      setIsLoading(true);
      getRedirectResult(auth)
        .then((result) => {
          if (result?.user) {
            router.push(redirect);
          }
        })
        .catch((err) => {
          if (err.code !== "auth/no-current-user") {
            console.error("Redirect sign-in error:", err);
            setError(err.message || "Sign-in failed. Please try again.");
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      // If user already exists, ensure loading is false
      setIsLoading(false);
    }
  }, [user, auth, redirect, router]);

  // If already logged in, redirect away
  useEffect(() => {
    if (user && !isLoading) {
      // Use window.location for a more robust redirect if router.push feels stuck
      router.push(redirect);
    }
  }, [user, isLoading, redirect, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (!auth) {
        throw new Error("Firebase Auth is not initialized.");
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      if (isMobileOrRestrictedBrowser()) {
        // Mobile: use redirect (no popup, full page redirect)
        await signInWithRedirect(auth, provider);
        // Page will redirect away — code below won't run
      } else {
        // Desktop: use popup for better UX
        try {
          await signInWithPopup(auth, provider);
          router.push(redirect);
        } catch (popupErr: any) {
          // Popup blocked — fall back to redirect
          if (
            popupErr.code === "auth/popup-blocked" ||
            popupErr.code === "auth/cancelled-popup-request"
          ) {
            await signInWithRedirect(auth, provider);
          } else {
            throw popupErr;
          }
        }
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md flex flex-col justify-center min-h-[calc(100vh-200px)]">
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm text-center">
        <div className="mb-6">
          <img src="/exown-logo.png" alt="ExOwn Logo" className="h-16 mx-auto" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Welcome to ExOwn
        </h1>
        <p className="text-gray-500 mb-8">Exchange. Own. Repeat. Sign in with your university email to access the marketplace safely.</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 text-left">
            {error}
          </div>
        )}

        {!auth && !error && (
          <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 p-4 rounded-xl text-sm mb-6 text-left font-medium">
            Authentication service unavailable. Please check your configuration.
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading || !auth}
          className="w-full py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="text-sm text-gray-500 mt-6">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </div>

      <Link href="/" className="mt-8 text-center text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-2">
        <ArrowRight className="rotate-180" size={16} /> Back to Home
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
