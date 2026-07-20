import { delay, http, HttpResponse } from 'msw';
import type { LoginResponse } from '@/lib/auth/types';
import {
  loginResponseFactory,
  logoutAllResponseFactory,
  logoutResponseFactory,
} from '@/test/factories/auth';

type LoginResolver =
  | LoginResponse
  | { status: number; body: Record<string, unknown> }
  | (() => Promise<LoginResponse | { status: number; body: Record<string, unknown> }>);

let loginResolver: LoginResolver = loginResponseFactory();
let logoutCurrentShouldFail = false;
let logoutAllShouldFail = false;
let loginDelayMs = 0;

function endpoint(path: string) {
  return `*/api/auth/${path}`;
}

export function mockLoginSuccess(response?: Partial<LoginResponse>) {
  loginResolver = loginResponseFactory(response);
}

export function mockLoginFailure(status: number, body: Record<string, unknown>) {
  loginResolver = { status, body };
}

export function mockLoginPending(delayMs: number, response?: Partial<LoginResponse>) {
  loginDelayMs = delayMs;
  loginResolver = loginResponseFactory(response);
}

export function mockLogoutFailure(scope: 'current' | 'all') {
  if (scope === 'current') logoutCurrentShouldFail = true;
  if (scope === 'all') logoutAllShouldFail = true;
}

export function resetAuthHandlers() {
  loginResolver = loginResponseFactory();
  logoutCurrentShouldFail = false;
  logoutAllShouldFail = false;
  loginDelayMs = 0;
}

export const authHandlers = [
  http.post(endpoint('login'), async () => {
    if (loginDelayMs > 0) {
      await delay(loginDelayMs);
      loginDelayMs = 0;
    }

    const resolved =
      typeof loginResolver === 'function'
        ? await loginResolver()
        : loginResolver;

    if ('status' in resolved) {
      return HttpResponse.json(resolved.body, { status: resolved.status });
    }

    return HttpResponse.json(resolved);
  }),
  http.post(endpoint('logout'), () => {
    if (logoutCurrentShouldFail) {
      return HttpResponse.json(
        { message: 'تعذّر تسجيل الخروج', messageKey: 'logout.failed' },
        { status: 500 },
      );
    }

    return HttpResponse.json(logoutResponseFactory());
  }),
  http.post(endpoint('logout-all'), () => {
    if (logoutAllShouldFail) {
      return HttpResponse.json(
        { message: 'تعذّر تسجيل الخروج من جميع الأجهزة', messageKey: 'logoutAll.failed' },
        { status: 500 },
      );
    }

    return HttpResponse.json(logoutAllResponseFactory());
  }),
];
