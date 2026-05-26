"use client";

import { useEffect, useState } from "react";

interface CinematicLoaderProps {
  onComplete: () => void;
}

export default function CinematicLoader({ onComplete }: CinematicLoaderProps) {
  const [stage, setStage] = useState(1);
  const [isDissolving, setIsDissolving] = useState(false);

  useEffect(() => {
    // Stage 1 (0-300ms): Background Mesh Glimpse
    // Stage 2 (300ms): Logo Scales In
    const logoTimeout = setTimeout(() => {
      setStage(2);
    }, 300);

    // Stage 3 (650ms): Taglines Stagger In
    const taglineTimeout = setTimeout(() => {
      setStage(3);
    }, 650);

    // Stage 4 (1300ms): Start Dissolving Loader
    const dissolveTimeout = setTimeout(() => {
      setIsDissolving(true);
    }, 1300);

    // Stage 5 (1550ms): Complete Transition
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 1550);

    return () => {
      clearTimeout(logoTimeout);
      clearTimeout(taglineTimeout);
      clearTimeout(dissolveTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0d0718] overflow-hidden select-none transition-opacity duration-[250ms] ease-out ${
        isDissolving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* 1. Cinematic Noise Texture */}
      <div className="noise-overlay" />

      {/* 2. Layered Ambient Mesh Gradients */}
      {/* Spotlight behind logo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.18)_0%,transparent_60%)] pointer-events-none z-[2]" />
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(8,4,13,0.92)_100%)] pointer-events-none z-[3]" />

      {/* Floating Blobs (Ultra slow motion) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#1b0d35] filter blur-[90px] opacity-75 pointer-events-none z-[1] animate-[floatGlow_8s_ease-in-out_infinite]" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#270b4b] filter blur-[110px] opacity-60 pointer-events-none z-[1] animate-[floatGlow_10s_ease-in-out_infinite_1s]" />
      <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-[#8b5cf6]/8 filter blur-[85px] pointer-events-none z-[1] animate-[floatGlow_7s_ease-in-out_infinite_2s]" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-[#a855f7]/6 filter blur-[95px] pointer-events-none z-[1] animate-[floatGlow_9s_ease-in-out_infinite_0.5s]" />

      {/* 3. Central Content System */}
      <div className="relative z-20 flex flex-col items-center gap-6">
        {/* Ambient bloom spotlight specifically behind the logo */}
        <div className="absolute w-44 h-44 -translate-y-2 rounded-full bg-purple-500/10 filter blur-[32px] pointer-events-none" />

        {/* Logo container */}
        {stage >= 2 && (
          <div className="flex items-center gap-4 animate-[scaleInLogo_600ms_cubic-bezier(0.16,1,0.3,1)_both]">
            {/* Custom stylized gradient "X" representation of exchange and commerce */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]"
            >
              <path
                d="M10 26L26 10M26 10H16.5M26 10V19.5"
                stroke="url(#x-gradient-1)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M26 26L10 10M10 10H19.5M10 10V19.5"
                stroke="url(#x-gradient-2)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="x-gradient-1" x1="10" y1="26" x2="26" y2="10" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" />
                  <stop offset="1" stopColor="#c084fc" />
                </linearGradient>
                <linearGradient id="x-gradient-2" x1="26" y1="26" x2="10" y2="10" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.15)]">
              ExOwn
            </span>
          </div>
        )}

        {/* Tagline Container */}
        {stage >= 3 && (
          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-light tracking-[0.18em] text-white/60 uppercase">
            {["Exchange.", "Own.", "Repeat."].map((word, i) => (
              <span
                key={word}
                style={{
                  animation: `letterRevealWord 450ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms both`,
                }}
                className="inline-block"
              >
                {word}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
