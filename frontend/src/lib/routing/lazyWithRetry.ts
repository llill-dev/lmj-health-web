import { lazy, type ComponentType } from "react";

const RELOAD_FLAG_KEY = "lmj:chunk-reload-attempted";

/**
 * Wraps React.lazy() to recover from stale-chunk deploy races.
 *
 * A tab that stayed open (or was resumed from bfcache) across a deploy still holds the
 * previous build's index.html and route table. When it later triggers a dynamic
 * import() for a route chunk, the hashed asset file for that chunk may no longer exist
 * on the server (the new build replaced /assets entirely) — the import rejects with a
 * "Failed to fetch dynamically imported module" error, and the user sees a blank/broken
 * page (observed live on the login page after logout).
 *
 * The fix is a one-time full page reload: it fetches the current index.html, which
 * references the current build's chunk graph, resolving the mismatch. A sessionStorage
 * flag prevents an infinite reload loop if the import keeps failing for another reason
 * (e.g. an actual network outage) — the second failure surfaces to the route's error
 * boundary instead of reloading forever.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const mod = await factory();
      // A successful import means the current build is loadable — clear any stale flag
      // from a previous, unrelated reload so future genuine failures can retry again.
      window.sessionStorage.removeItem(RELOAD_FLAG_KEY);
      return mod;
    } catch (error) {
      const alreadyReloaded = window.sessionStorage.getItem(RELOAD_FLAG_KEY) === "1";
      if (alreadyReloaded) {
        throw error;
      }
      window.sessionStorage.setItem(RELOAD_FLAG_KEY, "1");
      window.location.reload();
      // Reload is async; keep the lazy() promise pending so React doesn't render a
      // broken fallback in the brief window before the navigation completes.
      return new Promise<{ default: T }>(() => {});
    }
  });
}
