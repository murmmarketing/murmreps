"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Typewriter from "@/components/Typewriter";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AvatarCircles } from "@/components/ui/avatar-circles";

// Lazy-load Three.js background — not needed for LCP
const DottedSurface = dynamic(
  () => import("@/components/ui/dotted-surface").then((m) => ({ default: m.DottedSurface })),
  { ssr: false }
);

const avatarUrls = [
  "https://avatars.githubusercontent.com/u/16860528",
  "https://avatars.githubusercontent.com/u/20110627",
  "https://avatars.githubusercontent.com/u/106103625",
  "https://avatars.githubusercontent.com/u/59228569",
  "https://avatars.githubusercontent.com/u/89768406",
];

export default function HeroSection() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768);
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(254,66,5,0.08) 0%, transparent 60%), #0a0a0a",
      }}
    >
      {/* Three.js dotted wave background — lazy loaded, desktop only */}
      {isDesktop && <DottedSurface />}
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pb-24 sm:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-6xl">
            Find the best reps,{" "}
            <span className="text-accent">all in one place.</span>
          </h1>
          <Typewriter />
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/products">
              <ShimmerButton className="h-12 px-8 font-heading text-sm">
                Explore products
              </ShimmerButton>
            </Link>
            <Link
              href="/guides/how-to-buy-reps-kakobuy"
              className="inline-flex h-12 items-center rounded-btn border border-accent px-8 font-heading text-sm font-semibold text-accent transition-all duration-200 hover:bg-accent/10"
            >
              How to buy
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <AvatarCircles avatarUrls={avatarUrls} numPeople={2300} />
            <span className="text-sm text-[#9CA3AF]">
              Join 2,300+ repfam members
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-8 flex max-w-lg flex-wrap items-center justify-center divide-x divide-subtle sm:mt-16">
          <div className="px-6 text-center sm:px-10">
            <p className="font-heading text-2xl font-bold text-white">15,000+</p>
            <p className="mt-1 text-sm text-text-secondary">Products</p>
          </div>
          <div className="px-6 text-center sm:px-10">
            <p className="font-heading text-2xl font-bold text-white">8</p>
            <p className="mt-1 text-sm text-text-secondary">Agents</p>
          </div>
          <a
            href="https://reddit.com/r/MurmReps"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 text-center transition-colors hover:text-accent sm:px-10"
          >
            <p className="font-heading text-2xl font-bold text-white">
              r/MurmReps
            </p>
            <p className="mt-1 text-sm text-text-secondary">Community</p>
          </a>
        </div>
      </div>
    </section>
  );
}
