"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: string[];
  className?: string;
  children: React.ReactNode;
}

export function ShineBorder({
  borderRadius = 12,
  borderWidth = 1.5,
  duration = 12,
  color = ["#FE4205", "#FF6B35", "#FFA066"],
  className,
  children,
}: ShineBorderProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ borderRadius }}
    >
      {/* Animated conic gradient border */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          borderRadius,
          padding: borderWidth,
          background: `conic-gradient(from var(--shine-angle), ${color.join(", ")}, transparent 40%)`,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          animation: `shine-spin ${duration}s linear infinite`,
        }}
      />
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}
