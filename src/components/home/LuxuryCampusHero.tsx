"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ShieldCheck, Sparkles, RefreshCw, Users } from "lucide-react";

const easeLuxury = [0.22, 1, 0.36, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export default function LuxuryCampusHero() {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.78, ease: easeLuxury };

  return (
    <section className="relative isolate overflow-hidden bg-[#F5F4EF] px-3 py-5 sm:px-5 sm:py-8">
      <div className="pointer-events-none absolute -right-28 -top-36 h-[28rem] w-[28rem] rounded-full bg-[#DCE9E1]/80 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-[-8rem] h-[26rem] w-[26rem] rounded-full bg-[#E8DFD0]/70 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/35 shadow-[0_22px_70px_rgba(26,48,39,0.08)] backdrop-blur-2xl lg:min-h-[510px] lg:grid-cols-[1.02fr_0.98fr]">
        <div className="relative z-10 flex flex-col justify-center p-6 sm:p-10 lg:p-14">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            variants={reveal}
            transition={transition}
            className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/55 px-3.5 py-2 text-xs font-semibold tracking-[0.14em] text-[#426257] shadow-sm backdrop-blur-xl"
          >
            <Sparkles size={14} />
            THE CAMPUS EDIT
          </motion.div>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.08 }}
            className="max-w-xl text-[clamp(2.5rem,6vw,5.3rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-[#14251E]"
          >
            Good finds.
            <br />
            <span className="font-serif font-normal italic text-[#547565]">Better stories.</span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.22 }}
            className="mt-6 max-w-md text-base leading-7 text-[#5A6C63] sm:text-lg"
          >
            A considered marketplace for campus life—discover pre-loved essentials, rent what you need, and pass good things forward.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.32 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <motion.div whileHover={reduceMotion ? undefined : { scale: 1.035 }} whileTap={reduceMotion ? undefined : { scale: 0.94, y: 2 }}>
              <Link
                href="/search"
                className="group inline-flex items-center gap-3 rounded-full bg-[#1E5646] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(30,86,70,0.22)] transition-shadow hover:shadow-[0_15px_32px_rgba(30,86,70,0.3)]"
              >
                Explore the edit
                <ArrowUpRight size={17} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
            <Link href="/sell" className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/55 px-5 py-3.5 text-sm font-semibold text-[#254B3D] backdrop-blur-xl transition-colors hover:bg-white/85">
              List something
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full px-3 py-3 text-sm font-semibold text-[#426257] transition-colors hover:text-[#1E5646]">
              Join ExOwn Circle <ArrowUpRight size={15} />
            </Link>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.55 }}
            className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#66776E]"
          >
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} /> Campus-first trust</span>
            <span className="inline-flex items-center gap-1.5"><RefreshCw size={14} /> Give good things another life</span>
          </motion.div>
        </div>

        <div className="relative min-h-[310px] p-3 sm:min-h-[420px] sm:p-5 lg:min-h-full">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92, rotate: 2, x: 16 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, x: 0 }}
            transition={{ duration: reduceMotion ? 0 : 1.05, ease: easeLuxury, delay: reduceMotion ? 0 : 0.15 }}
            className="relative h-full min-h-[300px] overflow-hidden rounded-[1.65rem] border border-white/70 bg-[#D9E2DC] shadow-[0_24px_60px_rgba(22,43,34,0.16)]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=88')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12251D]/65 via-[#12251D]/5 to-white/10" />
            <div className="absolute left-5 top-5 rounded-full border border-white/60 bg-white/35 px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-white backdrop-blur-xl">
              PRE-LOVED · RE-LOVED
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-xs font-medium tracking-[0.16em] text-white/80">A MORE THOUGHTFUL WAY TO SHOP</p>
              <p className="mt-2 max-w-sm text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">Find your next favourite.</p>
            </div>
          </motion.div>

          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -7, 0], rotate: [0, 1.2, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-7 left-0 max-w-[230px] rounded-2xl border border-white/75 bg-white/70 p-4 shadow-[0_16px_40px_rgba(20,37,30,0.12)] backdrop-blur-2xl sm:bottom-10 sm:left-2"
          >
            <div className="flex items-center gap-2 text-[#1E5646]"><Users size={16} /><span className="text-xs font-semibold">Made for campus life</span></div>
            <p className="mt-2 text-sm leading-5 text-[#52665B]">A community where useful things keep finding new owners.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
