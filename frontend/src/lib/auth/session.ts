import {
  clearAllAuthCookies,
  readAuthRefreshExpiresAt,
  readAuthRefreshToken,
  readAuthToken,
  readAuthUser,
  writeAuthRefreshExpiresAt,
  writeAuthRefreshToken,
  writeAuthToken,
  writeAuthUser,
  type PersistedUser,
} from "@/lib/cookies";
import type { AuthActorIds } from "@/lib/auth/types";

export type AuthTokenPair = {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt?: string | null;
};

export type AuthSessionUser = {
  userId: string;
  role: string;
  fullName?: string;
  email?: string;
  phone?: string;
  actorIds?: AuthActorIds;
  patientPublicId?: string | null;
  accountStatus?: string;
};

const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/** Accept new API fields and legacy `token` during backend transition. */
export function normalizeTokenPair(
  raw: Record<string, unknown>,
): AuthTokenPair | null {
  const accessToken =
    (typeof raw.accessToken === "string" && raw.accessToken) ||
    (typeof raw.access_token === "string" && raw.access_token) ||
    (typeof raw.token === "string" && raw.token) ||
    null;

  const refreshToken =
    (typeof raw.refreshToken === "string" && raw.refreshToken) ||
    (typeof raw.refresh_token === "string" && raw.refresh_token) ||
    null;

  if (!accessToken || !refreshToken) return null;

  const refreshExpiresAt =
    (typeof raw.refreshExpiresAt === "string" && raw.refreshExpiresAt) ||
    (typeof raw.refresh_expires_at === "string" && raw.refresh_expires_at) ||
    null;

  return { accessToken, refreshToken, refreshExpiresAt };
}

export function cookieMaxAgeFromRefreshExpires(
  refreshExpiresAt?: string | null,
): number {
  if (!refreshExpiresAt) return DEFAULT_COOKIE_MAX_AGE;
  const expiresMs = Date.parse(refreshExpiresAt);
  if (Number.isNaN(expiresMs)) return DEFAULT_COOKIE_MAX_AGE;
  const seconds = Math.floor((expiresMs - Date.now()) / 1000);
  return Math.max(60, Math.min(seconds, DEFAULT_COOKIE_MAX_AGE));
}

export function toPersistedUser(user: AuthSessionUser): PersistedUser {
  return {
    userId: user.userId,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    actorIds: Object.fromEntries(
      Object.entries(user.actorIds ?? {}).map(([key, value]) => [
        key,
        value ?? undefined,
      ]),
    ) as Record<string, string | undefined>,
    patientPublicId: user.patientPublicId,
  };
}

export function persistAuthSession(
  pair: AuthTokenPair,
  user: AuthSessionUser,
): void {
  const maxAge = cookieMaxAgeFromRefreshExpires(pair.refreshExpiresAt);
  writeAuthToken(pair.accessToken, maxAge);
  writeAuthRefreshToken(pair.refreshToken, maxAge);
  if (pair.refreshExpiresAt) {
    writeAuthRefreshExpiresAt(pair.refreshExpiresAt, maxAge);
  }
  writeAuthUser(toPersistedUser(user), maxAge);
}

export function readStoredAuthSession(): {
  accessToken: string | null;
  refreshToken: string | null;
  refreshExpiresAt: string | null;
  user: PersistedUser | null;
} {
  return {
    accessToken: readAuthToken(),
    refreshToken: readAuthRefreshToken(),
    refreshExpiresAt: readAuthRefreshExpiresAt(),
    user: readAuthUser(),
  };
}

export function clearAuthSession(): void {
  clearAllAuthCookies();
}
