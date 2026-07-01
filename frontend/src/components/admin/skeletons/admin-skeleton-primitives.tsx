"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/utils";

export const ADMIN_SKELETON_PULSE =
  "animate-pulse rounded-md bg-gradient-to-r from-[#E5E7EB] via-[#F3F4F6] to-[#E5E7EB] bg-[length:200%_100%] animate-shimmer";

export const ADMIN_SKELETON_SHIMMER_DURATION = "1.5s";

export function AdminSkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(ADMIN_SKELETON_PULSE, className)}
      style={{
        animationDuration: ADMIN_SKELETON_SHIMMER_DURATION,
      }}
      aria-hidden
    />
  );
}

export function AdminLoadingShell({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(className)}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function createStaggeredDelay(
  index: number,
  baseDelay: number = 50,
): number {
  return index * baseDelay;
}
