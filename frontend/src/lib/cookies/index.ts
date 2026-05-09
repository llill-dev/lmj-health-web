/**
 * Cookie utilities for auth persistence.
 *
 * Why cookies over localStorage?
 * ─ Cookies survive cross-tab sharing automatically.
 * ─ SameSite=Strict mitigates CSRF.
 * ─ Secure flag enforces HTTPS in production.
 * ─ Max-Age provides automatic expiry (localStorage never expires).
 *
 * Note: HttpOnly cannot be set from JavaScript — that requires server-side
 * Set-Cookie. If/when the backend issues httpOnly cookies directly, remove
 * the manual write here and rely on the browser to attach the cookie.
 */

/** Cookie names used across the app — change in one place if needed. */
export const COOKIE_NAMES = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
} as const;

/** 7 days in seconds — should match backend JWT expiry. */
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7;

// ─────────────────────────────────────────────────────────────────────────────
// Core primitives
// ─────────────────────────────────────────────────────────────────────────────

function buildCookieString(
  name: string,
  value: string,
  maxAge: number,
): string {
  const isSecure =
    typeof window !== 'undefined' && window.location.protocol === 'https:';
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'SameSite=Strict',
  ];
  if (isSecure) parts.push('Secure');
  return parts.join('; ');
}

export function setCookie(
  name: string,
  value: string,
  maxAge = DEFAULT_MAX_AGE,
): void {
  if (typeof document === 'undefined') return;
  document.cookie = buildCookieString(name, value, maxAge);
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  // Setting Max-Age=0 immediately expires the cookie.
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Strict`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth-specific helpers
// ─────────────────────────────────────────────────────────────────────────────

export function readAuthToken(): string | null {
  return getCookie(COOKIE_NAMES.TOKEN);
}

export function writeAuthToken(token: string, maxAge = DEFAULT_MAX_AGE): void {
  setCookie(COOKIE_NAMES.TOKEN, token, maxAge);
}

export function clearAuthToken(): void {
  deleteCookie(COOKIE_NAMES.TOKEN);
}

// ── User data (non-sensitive profile fields for role-based routing) ──────────

export type PersistedUser = {
  userId: string;
  role: string;
  fullName?: string;
  email?: string;
  phone?: string;
  actorIds?: Record<string, string | undefined>;
  patientPublicId?: string | null;
};

export function readAuthUser(): PersistedUser | null {
  const raw = getCookie(COOKIE_NAMES.USER);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedUser;
    if (!parsed?.userId || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAuthUser(
  user: PersistedUser,
  maxAge = DEFAULT_MAX_AGE,
): void {
  setCookie(COOKIE_NAMES.USER, JSON.stringify(user), maxAge);
}

export function clearAuthUser(): void {
  deleteCookie(COOKIE_NAMES.USER);
}

/** Clear all auth cookies at once (logout). */
export function clearAllAuthCookies(): void {
  clearAuthToken();
  clearAuthUser();
}
