import { beforeEach, describe, expect, it, vi } from 'vitest';

const postMock = vi.fn();
const persistAuthSessionMock = vi.fn();
const readStoredAuthSessionMock = vi.fn();
const setAuthStateMock = vi.fn();

vi.mock('@/lib/api', () => ({
  ApiError: class ApiError extends Error {
    status: number;

    constructor(status: number) {
      super(`api_${status}`);
      this.status = status;
    }
  },
  post: (...args: unknown[]) => postMock(...args),
}));

vi.mock('@/lib/auth/session', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/session')>(
    '@/lib/auth/session',
  );

  return {
    ...actual,
    persistAuthSession: (...args: unknown[]) => persistAuthSessionMock(...args),
    readStoredAuthSession: () => readStoredAuthSessionMock(),
  };
});

vi.mock('@/store/authStore', () => ({
  useAuthStore: {
    setState: (...args: unknown[]) => setAuthStateMock(...args),
  },
}));

describe('sessionRefresh', () => {
  beforeEach(() => {
    postMock.mockReset();
    persistAuthSessionMock.mockReset();
    readStoredAuthSessionMock.mockReset();
    setAuthStateMock.mockReset();
  });

  it('stores the rotated access and refresh tokens after a successful refresh', async () => {
    readStoredAuthSessionMock.mockReturnValue({
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
      refreshExpiresAt: '2030-01-01T00:00:00.000Z',
      user: {
        userId: 'user-1',
        role: 'doctor',
        fullName: 'أحمد الطبيب',
        email: 'doctor@example.com',
        phone: '+963912345678',
        actorIds: { doctorId: 'doctor-1' },
        patientPublicId: null,
      },
    });

    postMock.mockResolvedValue({
      message: 'refreshed',
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      refreshExpiresAt: '2031-01-01T00:00:00.000Z',
    });

    const { refreshAccessToken } = await import('@/lib/auth/sessionRefresh');

    await expect(refreshAccessToken()).resolves.toBe(true);

    expect(postMock).toHaveBeenCalledWith(
      '/api/auth/refresh',
      { refreshToken: 'old-refresh' },
      { locale: 'ar', omitAuth: true },
    );
    expect(persistAuthSessionMock).toHaveBeenCalledWith(
      {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        refreshExpiresAt: '2031-01-01T00:00:00.000Z',
      },
      expect.objectContaining({
        userId: 'user-1',
        role: 'doctor',
      }),
    );
    expect(setAuthStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        refreshExpiresAt: '2031-01-01T00:00:00.000Z',
        isAuthenticated: true,
      }),
    );
  });

  it('uses a single in-flight refresh request for concurrent callers', async () => {
    let resolvePost: ((value: unknown) => void) | null = null;

    readStoredAuthSessionMock.mockReturnValue({
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
      refreshExpiresAt: '2030-01-01T00:00:00.000Z',
      user: {
        userId: 'user-1',
        role: 'doctor',
      },
    });

    postMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve;
        }),
    );

    const { refreshAccessToken } = await import('@/lib/auth/sessionRefresh');

    const first = refreshAccessToken();
    const second = refreshAccessToken();

    expect(postMock).toHaveBeenCalledTimes(1);

    resolvePost?.({
      message: 'refreshed',
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      refreshExpiresAt: '2031-01-01T00:00:00.000Z',
    });

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
  });

  it('treats an invalid refresh expiry string as expired', async () => {
    const { isRefreshTokenExpired } = await import('@/lib/auth/sessionRefresh');

    expect(isRefreshTokenExpired('not-a-date')).toBe(true);
  });
});
