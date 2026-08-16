import { beforeEach, describe, expect, it, vi } from "vitest";

const readStoredAuthSessionMock = vi.fn();
const clearAuthSessionMock = vi.fn();

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>(
    "@/lib/auth/session",
  );

  return {
    ...actual,
    clearAuthSession: () => clearAuthSessionMock(),
    readStoredAuthSession: () => readStoredAuthSessionMock(),
  };
});

describe("authStore initFromCookies", () => {
  beforeEach(() => {
    vi.resetModules();
    readStoredAuthSessionMock.mockReset();
    clearAuthSessionMock.mockReset();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("clears a partial stored session that only has a refresh token", async () => {
    readStoredAuthSessionMock.mockReturnValue({
      accessToken: null,
      refreshToken: "stale-refresh-token",
      refreshExpiresAt: "2031-01-01T00:00:00.000Z",
      user: null,
    });

    const { useAuthStore } = await import("@/store/authStore");

    expect(clearAuthSessionMock).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
