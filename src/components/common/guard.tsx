"use client";

import { ReactNode } from "react";

interface GuardProps {
  allowed: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Guard({ allowed, fallback = null, children }: GuardProps) {
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
