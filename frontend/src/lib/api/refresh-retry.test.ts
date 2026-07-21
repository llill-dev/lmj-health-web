import { beforeEach, describe, expect, it, vi } from 'vitest';

const refreshAccessTokenMock = vi.fn();
const ensureFreshAccessTokenMock = vi.fn();
const runSessionExpiredFlowMock = vi.fn();
const isAccessTokenExpiredMock = vi.fn();
const isSessionExpiry401ExemptMock = vi.fn();

const authState = {
  accessToken: 'old-access',
};

vi.mock('@/store/authStore', () => ({
  useAuthStore: {
    getState: () => authState,
  },
}));

vi.mock('@/lib/auth/sessionRefresh', () => ({
  refreshAccessToken: (...args: unknown[]) => refreshAccessTokenMock(...args),
  ensureFreshAccessToken: (...args: unknown[]) =>
    ensureFreshAccessTokenMock(...args),
}));

vi.mock('@/lib/session/sessionExpiryFlow', () => ({
  runSessionExpiredFlow: (...args: unknown[]) =>
    runSessionExpiredFlowMock(...args),
}));

vi.mock('@/lib/session/sessionExpiryGuards', () => ({
  isAccessTokenExpired: (...args: unknown[]) =>
    isAccessTokenExpiredMock(...args),
  isSessionExpiry401Exempt: (...args: unknown[]) =>
    isSessionExpiry401ExemptMock(...args),
}));

class MockHeaders {
  private readonly values: Record<string, string>;

  constructor(values: Record<string, string> = {}) {
    this.values = values;
  }

  get(name: string) {
    return this.values[name.toLowerCase()] ?? this.values[name] ?? null;
  }
}

class MockResponse {
  readonly ok: boolean;
  readonly headers: MockHeaders;

  constructor(
    readonly status: number,
    private readonly payload: unknown,
    contentType = 'application/json',
    readonly statusText = '',
  ) {
    this.ok = status >= 200 && status < 300;
    this.headers = new MockHeaders({ 'content-type': contentType });
  }

  async json() {
    return this.payload;
  }

  async text() {
    return typeof this.payload === 'string'
      ? this.payload
      : JSON.stringify(this.payload);
  }
}

type XhrPlan = {
  status: number;
  responseText?: string;
};

let xhrPlans: XhrPlan[] = [];
const xhrRequests: Array<Record<string, string>> = [];

class MockXMLHttpRequest {
  status = 0;
  responseText = '';
  upload = { onprogress: null as ((event: ProgressEvent) => void) | null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private readonly headers: Record<string, string> = {};

  open() {}

  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }

  send() {
    xhrRequests.push({ ...this.headers });
    const next = xhrPlans.shift();
    if (!next) {
      this.onerror?.();
      return;
    }

    this.status = next.status;
    this.responseText = next.responseText ?? '';
    this.onload?.();
  }
}

describe('api refresh retry', () => {
  beforeEach(() => {
    authState.accessToken = 'old-access';
    refreshAccessTokenMock.mockReset();
    ensureFreshAccessTokenMock.mockReset();
    runSessionExpiredFlowMock.mockReset();
    isAccessTokenExpiredMock.mockReset();
    isSessionExpiry401ExemptMock.mockReset();
    xhrPlans = [];
    xhrRequests.length = 0;

    isAccessTokenExpiredMock.mockReturnValue(false);
    isSessionExpiry401ExemptMock.mockReturnValue(false);
    ensureFreshAccessTokenMock.mockResolvedValue(true);

    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest as unknown as typeof XMLHttpRequest);
  });

  it('retries a protected fetch request once after refresh succeeds', async () => {
    const fetchMock = vi.mocked(fetch);
    refreshAccessTokenMock.mockImplementation(async () => {
      authState.accessToken = 'new-access';
      return true;
    });

    fetchMock
      .mockResolvedValueOnce(
        new MockResponse(401, {
          message: 'unauthorized',
          messageKey: 'errors.auth.sessionExpired',
        }) as unknown as Response,
      )
      .mockResolvedValueOnce(
        new MockResponse(200, { ok: true }) as unknown as Response,
      );

    const { apiRequest } = await import('@/lib/api');

    await expect(apiRequest('/api/secure/example')).resolves.toEqual({ ok: true });

    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      (fetchMock.mock.calls[1]?.[1] as RequestInit).headers,
    ).toMatchObject({
      Authorization: 'Bearer new-access',
    });
  });

  it('runs the invalidated-session flow when refresh fails after a 401', async () => {
    const fetchMock = vi.mocked(fetch);
    refreshAccessTokenMock.mockResolvedValue(false);

    fetchMock.mockResolvedValueOnce(
      new MockResponse(401, {
        message: 'unauthorized',
        messageKey: 'errors.auth.sessionExpired',
      }) as unknown as Response,
    );

    const { apiRequest, ApiError } = await import('@/lib/api');

    await expect(apiRequest('/api/secure/example')).rejects.toBeInstanceOf(ApiError);
    expect(runSessionExpiredFlowMock).toHaveBeenCalledWith('ar', 'invalidated');
  });

  it('retries a multipart upload once with the refreshed token when the first upload returns 401', async () => {
    refreshAccessTokenMock.mockImplementation(async () => {
      authState.accessToken = 'new-access';
      return true;
    });

    xhrPlans = [
      { status: 401, responseText: JSON.stringify({ message: 'unauthorized' }) },
      { status: 200, responseText: JSON.stringify({ uploaded: true }) },
    ];

    const { apiMultipart } = await import('@/lib/api');

    const result = await apiMultipart('/api/secure/upload', new FormData(), {
      onProgress: vi.fn(),
    });

    expect(result).toEqual({ uploaded: true });
    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1);
    expect(xhrRequests).toHaveLength(2);
    expect(xhrRequests[0]?.Authorization).toBe('Bearer old-access');
    expect(xhrRequests[1]?.Authorization).toBe('Bearer new-access');
  });
});
