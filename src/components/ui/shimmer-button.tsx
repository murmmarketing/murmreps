"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children: React.ReactNode;
}

export function ShimmerButton({
  shimmerColor = "#FFA066",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shimmerSize = "0.1em",
  borderRadius = "12px",
  shimmerDuration = "2.5s",
  background = "#FE4205",
  className,
  children,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      style={{
        borderRadius,
        background,
      }}
      {...props}
    >
      {/* Shimmer effect */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <div
          className="absolute inset-0 -translate-x-full animate-[shimmer-slide_2.5s_ease-in-out_infinite]"
          style={{
            background: `linear-gradient(90deg, transparent, ${shimmerColor}40, transparent)`,
            animationDuration: shimmerDuration,
          }}
        />
      </div>
      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          borderRadius,
          boxShadow: `0 0 20px ${background}60, 0 0 40px ${background}30`,
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
