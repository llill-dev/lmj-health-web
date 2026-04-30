/** مسارات لا يُعتبر فيها 401 انتهاء جلسة المستخدم */
const SESSION_EXEMPT_401_PREFIXES = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/resend-signup-otp',
  '/api/auth/verify-otp',
  '/api/auth/reset-password',
  '/api/auth/resend-reset-otp',
  '/api/auth/verify-reset-otp',
  '/api/auth/new-password',
  '/api/auth/claim-account/request',
  '/api/auth/claim-account/verify',
  '/api/auth/logout-all',
] as const;

function normalizeEndpoint(endpoint: string): string {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return path.split('?')[0] ?? path;
}

export function isSessionExpiry401Exempt(endpoint: string): boolean {
  const path = normalizeEndpoint(endpoint);
  return SESSION_EXEMPT_401_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/** JWT غير موقَّع — قراءة exp فقط للتحذير المبكر قبل الطلب */
export function getJwtExpiryUnix(token: string): number | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    const json = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof json.exp === 'number' ? json.exp : null;
  } catch {
    return null;
  }
}

export function isLikelyJwt(token: string): boolean {
  return token.split('.').length >= 3 && token.length > 20;
}

const CLOCK_SKEW_MS = 5000;

export function isAccessTokenExpired(token: string): boolean {
  if (!isLikelyJwt(token)) return false;
  const exp = getJwtExpiryUnix(token);
  if (exp == null) return false;
  return exp * 1000 <= Date.now() + CLOCK_SKEW_MS;
}
