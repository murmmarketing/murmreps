"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface AvatarCirclesProps {
  avatarUrls: string[];
  numPeople?: number;
  className?: string;
}

export function AvatarCircles({
  avatarUrls,
  numPeople,
  className,
}: AvatarCirclesProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-3">
        {avatarUrls.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={url}
            alt={`User ${i + 1}`}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full border-2 border-[#0a0a0a] object-cover"
          />
        ))}
        {numPeople != null && (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0a0a0a] bg-[#1a1a1a] text-xs font-medium text-[#9CA3AF]">
            +{numPeople > 999 ? `${(numPeople / 1000).toFixed(1)}k` : numPeople}
          </div>
        )}
      </div>
    </div>
  );
}
