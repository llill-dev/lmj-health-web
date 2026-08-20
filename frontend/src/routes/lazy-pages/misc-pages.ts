import { lazyWithRetry } from "@/lib/routing/lazyWithRetry";

export const ConnectionTestPage = lazyWithRetry(
  () => import("@/pages/connection-test/ConnectionTestPage"),
);
export const NotFoundPage = lazyWithRetry(
  () => import("@/pages/not-found/NotFoundPage"),
);
