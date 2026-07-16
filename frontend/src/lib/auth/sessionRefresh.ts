import { post } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { authEndpoints } from "@/lib/auth/endpoints";
import {
  normalizeTokenPair,
  persistAuthSession,
  readStoredAuthSession,
} from "@/lib/auth/session";
import type { RefreshTokenResponse } from "@/lib/auth/types";
import { isAccessTokenExpired } from "@/lib/session/sessionExpiryGuards";
import { useAuthStore } from "@/store/authStore";

let refreshInFlight: Promise<boolean> | null = null;

function applyRefreshedTokens(data: RefreshTokenResponse): boolean {
  const pair = normalizeTokenPair(data as unknown as Record<string, unknown>);
  if (!pair) return false;

  const stored = readStoredAuthSession();
  const user = stored.user;
  if (!user) return false;

  persistAuthSession(pair, {
    userId: user.userId,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    actorIds: user.actorIds,
    patientPublicId: user.patientPublicId,
  });

  useAuthStore.setState({
    accessToken: pair.accessToken,
    refreshToken: pair.refreshToken,
    refreshExpiresAt: pair.refreshExpiresAt ?? null,
    isAuthenticated: true,
  });

  return true;
}

/**
 * Rotate refresh token (single-flight). Returns true when a new access token pair
 * was stored. On 401 the caller must force logout.
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const { refreshToken } = readStoredAuthSession();
    if (!refreshToken) return false;

    try {
      const data = await post<RefreshTokenResponse>(
        authEndpoints.refresh(),
        { refreshToken },
        { locale: "ar", omitAuth: true },
      );

      return applyRefreshedTokens(data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      throw error;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export function isRefreshTokenExpired(refreshExpiresAt: string | null): boolean {
  if (!refreshExpiresAt) return false;
  const expiresMs = Date.parse(refreshExpiresAt);
  if (Number.isNaN(expiresMs)) return false;
  return expiresMs <= Date.now() + 5000;
}

export async function ensureFreshAccessToken(): Promise<boolean> {
  const { accessToken, refreshToken, refreshExpiresAt } =
    readStoredAuthSession();

  if (!accessToken || !refreshToken) return Boolean(accessToken);

  if (isRefreshTokenExpired(refreshExpiresAt)) return false;

  if (!isAccessTokenExpired(accessToken)) return true;

  return refreshAccessToken();
}
