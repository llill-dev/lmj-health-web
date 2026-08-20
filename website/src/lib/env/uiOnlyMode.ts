/**
 * UI-only mock mode — development only. Always disabled in production builds
 * even if VITE_UI_ONLY is accidentally set to true.
 */
export function isUiOnlyMode(): boolean {
  if (import.meta.env.PROD) return false;
  return import.meta.env.VITE_UI_ONLY === 'true';
}

/** Log once at startup if production was built with UI-only flag set. */
export function warnIfProductionUiOnlyMisconfigured(): void {
  if (!import.meta.env.PROD) return;
  if (import.meta.env.VITE_UI_ONLY === 'true') {
    console.error(
      '[LMJ] VITE_UI_ONLY=true was set for a production build; mock mode is forcibly disabled.',
    );
  }
}
