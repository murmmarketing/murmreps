"use client";

import Link from "next/link";
import Typewriter from "@/components/Typewriter";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AvatarCircles } from "@/components/ui/avatar-circles";

const avatarUrls = [
  "https://avatars.githubusercontent.com/u/16860528",
  "https://avatars.githubusercontent.com/u/20110627",
  "https://avatars.githubusercontent.com/u/106103625",
  "https://avatars.githubusercontent.com/u/59228569",
  "https://avatars.githubusercontent.com/u/89768406",
];

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(254,66,5,0.08) 0%, transparent 60%), #0a0a0a",
      }}
    >
      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${8 + i * 7.5}%`,
              bottom: `-${10 + (i % 5) * 8}px`,
              opacity: 0.03 + (i % 3) * 0.01,
              animation: `float-up ${14 + (i % 6) * 3}s linear ${i * 1.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.04; }
          90% { opacity: 0.04; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
      `}</style>
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32">
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
              href="/guide"
              className="inline-flex h-12 items-center rounded-btn border border-accent px-8 font-heading text-sm font-semibold text-accent transition-all duration-200 hover:bg-accent/10"
            >
              Tutorial
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
        <div className="mx-auto mt-16 flex max-w-lg items-center justify-center divide-x divide-subtle">
          <div className="px-6 text-center sm:px-10">
            <p className="font-heading text-2xl font-bold text-white">2000+</p>
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
