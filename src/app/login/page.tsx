"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureServerSession } from "@/lib/auth-session-client";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Bike, BookOpen, ShoppingBag } from "lucide-react";
import Link from "next/link";

// Detect if browser is mobile or likely to block popups
// Always use popup flow for authentication
function isMobileOrRestrictedBrowser(): boolean {
  // Disabled mobile detection to enforce popup usage across all devices
  return false;
}

import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/";
  const redirect = rawRedirect.startsWith("/login") ? "/" : rawRedirect;
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [email, setEmail] = useState("");
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [isEmailLinkSignIn, setIsEmailLinkSignIn] = useState(false);

  const completeEmailLinkSignIn = async (emailAddress: string) => {
    if (!auth || !isSignInWithEmailLink(auth, window.location.href)) return;
    setIsLoading(true);
    setError("");
    try {
      const result = await signInWithEmailLink(auth, emailAddress.trim(), window.location.href);
      window.localStorage.removeItem("exown_email_for_signin");
      const savedRedirect = window.localStorage.getItem("exown_email_link_redirect") || redirect;
      window.localStorage.removeItem("exown_email_link_redirect");
      await ensureServerSession(result.user);
      const { syncUser } = await import("@/actions/user");
      await syncUser({
        id: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        image: result.user.photoURL,
      });
      window.history.replaceState({}, document.title, "/login");
      window.location.href = savedRedirect.startsWith("/login") ? "/" : savedRedirect;
    } catch (err: any) {
      console.error("Email-link sign-in error:", err);
      if (err.code === "auth/account-exists-with-different-credential") {
        setError("This email already uses another sign-in method. Continue with Google using this email to access your existing ExOwn account.");
      } else if (err.code === "auth/invalid-action-code") {
        setError("This sign-in link has expired or was already used. Request a new email link.");
      } else {
        setError(err.message || "Email sign-in failed. Please request a new link.");
      }
      setIsLoading(false);
    }
  };

  const handleSendEmailLink = async () => {
    if (!agreedToTerms) {
      setError("Please agree to the Terms & Conditions and Privacy Policy to continue.");
      return;
    }
    if (!auth) {
      setError("Firebase Authentication is not configured.");
      return;
    }
    const emailAddress = email.trim().toLowerCase();
    if (!emailAddress) {
      setError("Enter your email address to continue.");
      return;
    }
    setIsLoading(true);
    setError("");
    setEmailLinkSent(false);
    try {
      await sendSignInLinkToEmail(auth, emailAddress, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem("exown_email_for_signin", emailAddress);
      window.localStorage.setItem("exown_email_link_redirect", redirect);
      setEmailLinkSent(true);
    } catch (err: any) {
      console.error("Send email sign-in link error:", err);
      if (err.code === "auth/operation-not-allowed") {
        setError("Email-link sign-in is not enabled in Firebase yet. Enable Email link (passwordless sign-in) in Firebase Authentication settings.");
      } else {
        setError(err.message || "Could not send the sign-in link. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!auth || !isSignInWithEmailLink(auth, window.location.href)) return;
    setIsEmailLinkSignIn(true);
    const savedEmail = window.localStorage.getItem("exown_email_for_signin");
    if (savedEmail) {
      setEmail(savedEmail);
      void completeEmailLinkSignIn(savedEmail);
    } else {
      setError("Please enter the email address where you received this sign-in link.");
    }
  // Process a Firebase email sign-in link once on page load.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle redirect result after mobile sign-in returns
  useEffect(() => {
    if (!auth) return;
    
    // Only show loading if we don't have a user yet
    if (!user) {
      setIsLoading(true);
      getRedirectResult(auth)
        .then(async (result) => {
          if (result?.user) {
            await ensureServerSession(result.user);
            const { syncUser } = await import("@/actions/user");
            await syncUser({
              id: result.user.uid,
              email: result.user.email,
              name: result.user.displayName,
              image: result.user.photoURL,
            });
            window.location.href = redirect;
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
  }, [user, redirect]);

  // If already logged in, redirect away
  useEffect(() => {
    if (user && !loading && !isLoading) {
      // Use a full-page redirect after the server session is established
      ensureServerSession(user)
        .catch((err) => console.warn("Session refresh error during redirect:", err))
        .finally(() => {
          window.location.href = redirect;
        });
    }
  }, [user, loading, isLoading, redirect]);

  const handleGoogleSignIn = async () => {
    if (!agreedToTerms) {
      setError("Please agree to the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

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
          const result = await signInWithPopup(auth, provider);
          await ensureServerSession(result.user);
          const { syncUser } = await import("@/actions/user");
          await syncUser({
            id: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
            image: result.user.photoURL,
          });
          window.location.href = redirect;
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
    <main className="min-h-[calc(100vh-72px)] bg-[#F3F6F5] dark:bg-[#0B1511] px-4 py-8 sm:py-12 flex items-center justify-center">
      <section className="w-full max-w-5xl overflow-hidden rounded-2xl border border-[#E1E8E4] dark:border-[#26352E] bg-white dark:bg-[#111D17] shadow-sm grid md:grid-cols-[0.88fr_1.12fr]">
        <aside className="relative min-h-[230px] md:min-h-[590px] overflow-hidden bg-[#1E5646] text-white p-7 sm:p-10 flex flex-col">
          <Link href="/" className="inline-flex items-center gap-2.5 w-fit">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 border border-white/20 text-white font-black text-lg">E</span>
            <span className="text-xl font-bold tracking-tight">ExOwn</span>
          </Link>
          <div className="relative z-10 mt-8 md:mt-12 max-w-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D6E8DF]">Exchange. Own. Repeat.</p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight tracking-tight">Your campus.<br />Your marketplace.</h1>
            <p className="mt-4 max-w-xs text-sm sm:text-base leading-7 text-white/80">Find useful things around you, pass on what you no longer need, and make student life a little easier.</p>
          </div>
          <div aria-hidden="true" className="relative mt-8 md:mt-auto md:pt-12">
            <div className="absolute bottom-2 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-[#EAF2EF]/10 blur-2xl" />
            <div className="relative mx-auto flex max-w-[310px] items-end justify-center gap-3">
              <div className="mb-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm -rotate-6">
                <BookOpen size={34} strokeWidth={1.6} />
                <span className="mt-2 block text-[10px] font-semibold tracking-wide text-white/80">BOOKS</span>
              </div>
              <div className="rounded-3xl border border-white/20 bg-[#F7F9F8] p-5 text-[#1E5646] shadow-sm">
                <ShoppingBag size={64} strokeWidth={1.4} />
                <span className="mt-3 block text-center text-xs font-bold tracking-wide">EXOWN</span>
              </div>
              <div className="mb-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm rotate-6">
                <Bike size={34} strokeWidth={1.6} />
                <span className="mt-2 block text-[10px] font-semibold tracking-wide text-white/80">CAMPUS</span>
              </div>
            </div>
            <div className="mx-auto mt-3 h-1.5 max-w-[280px] rounded-full bg-white/20" />
          </div>
          <p className="mt-6 text-xs text-white/60">A marketplace made for student life.</p>
        </aside>

        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 md:px-14 md:py-12">
          <div className="mb-7">
            <p className="text-sm font-semibold text-[#1E5646] dark:text-[#A9CDBB]">Welcome back</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#13221D] dark:text-[#F1F5F2]">Sign in to ExOwn</h2>
            <p className="mt-2 text-sm leading-6 text-[#66766F] dark:text-[#A3B2AA]">Use your email to continue to your campus marketplace.</p>
          </div>

          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}
          {!auth && !error && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
              Authentication service is unavailable. Please check your configuration.
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading || !auth || !agreedToTerms}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#DCE4DF] bg-white px-4 py-3.5 text-sm font-semibold text-[#23352D] transition hover:bg-[#F7F9F8] focus:outline-none focus:ring-2 focus:ring-[#1E5646]/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#34443B] dark:bg-[#17241C] dark:text-[#F1F5F2] dark:hover:bg-[#1D2C22]"
          >
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1E5646] border-t-transparent" />
            ) : (
              <>
                <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5">
                  <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.9 6-15Z"/>
                  <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4.1 2-6.8 2-5.2 0-9.6-3.5-11.2-8.2H5.9v5.2A20 20 0 0 0 24 44Z"/>
                  <path fill="#FBBC05" d="M12.8 27.8a12 12 0 0 1 0-7.6V15H5.9a20 20 0 0 0 0 18l6.9-5.2Z"/>
                  <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 5.9 29.5 4 24 4A20 20 0 0 0 5.9 15l6.9 5.2c1.6-4.7 6-8.1 11.2-8.1Z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9AA7A0]">
            <span className="h-px flex-1 bg-[#E4EAE6] dark:bg-[#2B3A31]" />
            <span>Or continue with email</span>
            <span className="h-px flex-1 bg-[#E4EAE6] dark:bg-[#2B3A31]" />
          </div>

          <div className="space-y-2.5">
            <label htmlFor="email-sign-in" className="block text-sm font-semibold text-[#34483D] dark:text-[#D9E3DC]">Email address</label>
            <input
              id="email-sign-in"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailLinkSent(false); }}
              placeholder="you@example.com"
              disabled={isLoading}
              className="w-full rounded-xl border border-[#DCE4DF] bg-white px-4 py-3.5 text-sm text-[#13221D] outline-none transition placeholder:text-[#9AA7A0] focus:border-[#1E5646] focus:ring-4 focus:ring-[#1E5646]/10 disabled:opacity-60 dark:border-[#34443B] dark:bg-[#17241C] dark:text-[#F1F5F2]"
            />
            {emailLinkSent && (
              <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-5 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                Sign-in link sent. Open it from this device to finish signing in.
              </div>
            )}
            <button
              type="button"
              onClick={() => isEmailLinkSignIn ? void completeEmailLinkSignIn(email) : void handleSendEmailLink()}
              disabled={isLoading || !auth || !agreedToTerms || !email.trim()}
              className="w-full rounded-xl bg-[#1E5646] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#174637] focus:outline-none focus:ring-4 focus:ring-[#1E5646]/15 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isLoading ? "Please wait…" : isEmailLinkSignIn ? "Complete email sign-in" : "Email me a sign-in link"}
            </button>
            <p className="pt-1 text-xs leading-5 text-[#74837B] dark:text-[#A3B2AA]">No password needed. The secure link confirms access to your email inbox.</p>
          </div>

          <div className="mt-6 rounded-xl bg-[#F7F9F8] px-4 py-3.5 dark:bg-[#17241C]">
            <label htmlFor="terms-consent-checkbox" className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-[#52645A] dark:text-[#B8C7BE]">
              <input
                id="terms-consent-checkbox"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (e.target.checked && error.includes("Terms & Conditions")) setError("");
                }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#C8D4CC] accent-[#1E5646] focus:ring-[#1E5646]"
              />
              <span>I agree to ExOwn’s <Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1E5646] underline underline-offset-2 dark:text-[#A9CDBB]">Terms &amp; Conditions</Link> and <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1E5646] underline underline-offset-2 dark:text-[#A9CDBB]">Privacy Policy</Link>.</span>
            </label>
          </div>

          <div className="mt-7 flex items-center justify-between text-xs text-[#7A8981] dark:text-[#A3B2AA]">
            <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-[#1E5646] dark:hover:text-[#A9CDBB]"><ArrowRight size={14} className="rotate-180" /> Back to ExOwn</Link>
            <span>Secure student access</span>
          </div>
        </div>
      </section>
    </main>
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
