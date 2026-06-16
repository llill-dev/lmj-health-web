import { lazy } from "react";

export const ConnectionTestPage = lazy(
  () => import("@/pages/connection-test/ConnectionTestPage"),
);
export const NotFoundPage = lazy(
  () => import("@/pages/not-found/NotFoundPage"),
);
