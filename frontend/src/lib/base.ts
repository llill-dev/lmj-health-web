import { useAuthStore } from '@/store/authStore';
import {
  isAccessTokenExpired,
  isSessionExpiry401Exempt,
} from '@/lib/session/sessionExpiryGuards';

function normalizeApiOrigin(value: string | undefined): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

export const API_BASE_URL = normalizeApiOrigin(import.meta.env.VITE_API_ORIGIN);

const UI_ONLY = import.meta.env.VITE_UI_ONLY === 'true';

// ─────────────────────────────────────────────────────────────────────────────
// ApiError — carries the full HTTP context so callers can inspect status codes,
// messageKey (for i18n), and the raw JSON body without any information loss.
// ─────────────────────────────────────────────────────────────────────────────
export class ApiError extends Error {
  /** HTTP status code (e.g. 401, 403, 404, 500) */
  readonly status: number;
  /** Backend i18n key e.g. "errors.auth.invalidCredentials" */
  readonly messageKey: string | null;
  /** Full parsed response body */
  readonly body: Record<string, unknown>;

  constructor(
    status: number,
    messageKey: string | null,
    body: Record<string, unknown>,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.messageKey = messageKey;
    this.body = body;
  }
}

/**
 * رسائل واجهة المستخدم: لا نعرض رمز HTTP (مثل 400) عندما يعيد السيرفر نصاً
 * يشرح السبب (قواعد العمل، التحقق، إلخ). الرمز يبقى متاحاً على `ApiError.status`.
 */
function userFacingHttpErrorMessage(
  status: number,
  backendMsg: string,
  statusText: string,
  locale: 'ar' | 'en',
): string {
  const trimmed = backendMsg.trim();
  if (trimmed) return trimmed;
  if (locale === 'ar') {
    if (status === 401) return 'انتهت الجلسة أو غير مصرّح بالوصول.';
    if (status === 403) return 'غير مصرّح بتنفيذ هذه العملية.';
    if (status === 404) return 'المورد غير موجود.';
    if (status >= 500)
      return 'تعذّر إكمال الطلب بسبب خطأ في الخادم. حاول لاحقاً.';
    return 'تعذّر إكمال الطلب.';
  }
  if (status === 401) return 'Session expired or unauthorized.';
  if (status === 403) return 'You are not allowed to perform this action.';
  if (status === 404) return 'Resource not found.';
  if (status >= 500)
    return 'The server could not complete the request. Please try again later.';
  return statusText || 'Request failed';
}

// ─────────────────────────────────────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────────────────────────────────────
export type ApiOptions = RequestInit & {
  token?: string;
  /** لا يُرفق Bearer من المخزن (تسجيل دخول، تسجيل، إلخ). */
  omitAuth?: boolean;
  signal?: AbortSignal;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  locale?: 'ar' | 'en';
};

// ─────────────────────────────────────────────────────────────────────────────
// Core request function
// ─────────────────────────────────────────────────────────────────────────────
function scheduleSessionExpiryHandling(locale: 'ar' | 'en'): void {
  void import('@/lib/session/sessionExpiryFlow').then((m) =>
    m.runSessionExpiredFlow(locale),
  );
}

/** استجابة 401 مع طلب كان يحمل توكن مصادقة → انتهاء الجلسة (مع استثناء مسارات /api/auth العامة). */
function maybeHandleUnauthorizedSession(
  endpoint: string,
  locale: 'ar' | 'en',
  hadBearerToken: boolean,
): void {
  if (!hadBearerToken) return;
  if (isSessionExpiry401Exempt(endpoint)) return;
  scheduleSessionExpiryHandling(locale);
}

/** فحص JWT محلياً؛ إن انتهت الصلاحية يُفعَّل تسجيل الخروج ثم يُرمى خطأ لإيقاف الطلب */
function ensureAccessTokenLive(
  endpoint: string,
  locale: 'ar' | 'en',
  token: string,
  omitAuth: boolean,
): void {
  if (omitAuth || !token) return;
  if (isSessionExpiry401Exempt(endpoint)) return;
  if (!isAccessTokenExpired(token)) return;
  scheduleSessionExpiryHandling(locale);
  throw new ApiError(
    401,
    'errors.auth.sessionExpired',
    {},
    locale === 'ar'
      ? 'انتهت صلاحية جلسة الدخول.'
      : 'Session expired.',
  );
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  if (UI_ONLY) return undefined as unknown as T;

  const {
    token: providedToken,
    omitAuth = false,
    headers,
    signal,
    onError,
    locale = 'ar',
    ...rest
  } = options;

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token =
    omitAuth === true
      ? ''
      : providedToken !== undefined
        ? providedToken
        : useAuthStore.getState().token || '';

  ensureAccessTokenLive(endpoint, locale, token, omitAuth === true);

  const isFormData = rest.body instanceof FormData;

  const finalHeaders: Record<string, string> = {
    ...(!headers || !('x-lang' in (headers as object))
      ? { 'x-lang': locale }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string> | undefined),
  };

  const hadBearerToken = Boolean(token && finalHeaders.Authorization);

  if (!isFormData && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    headers: finalHeaders,
    cache: 'no-store',
    signal,
    ...rest,
  };

  try {
    const res = await fetch(url, config);

    // ── Parse body (JSON preferred, fall back to text) ──
    const contentType = res.headers.get('content-type') ?? '';
    let body: Record<string, unknown> = {};
    let rawText = '';

    if (contentType.includes('application/json')) {
      try {
        body = (await res.json()) as Record<string, unknown>;
      } catch {
        // empty body
      }
    } else {
      rawText = await res.text().catch(() => '');
    }

    if (!res.ok) {
      if (res.status === 401) {
        maybeHandleUnauthorizedSession(endpoint, locale, hadBearerToken);
      }

      // Prefer messageKey-keyed message, then body.message/error, then statusText
      const backendMsg =
        (body.message as string | undefined) ||
        (body.error as string | undefined) ||
        rawText ||
        res.statusText;

      const messageKey = (body.messageKey as string | undefined) ?? null;

      const displayMsg = userFacingHttpErrorMessage(
        res.status,
        typeof backendMsg === 'string' ? backendMsg : String(backendMsg ?? ''),
        res.statusText,
        locale,
      );

      const err = new ApiError(res.status, messageKey, body, displayMsg);
      onError?.(err);
      throw err;
    }

    return (Object.keys(body).length ? body : undefined) as unknown as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;

    const networkMsg = locale === 'ar' ? 'خطأ شبكة' : 'Network error';
    const err = e instanceof Error ? e : new Error(networkMsg);
    onError?.(err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Multipart upload with optional XHR progress
// ─────────────────────────────────────────────────────────────────────────────
export async function apiMultipart<T = unknown>(
  endpoint: string,
  formData: FormData,
  options: ApiOptions = {},
): Promise<T> {
  if (UI_ONLY) return undefined as unknown as T;

  const {
    onProgress,
    locale = 'ar',
    token: providedToken,
    omitAuth = false,
    ...rest
  } = options;
  const token =
    omitAuth === true
      ? ''
      : providedToken !== undefined
        ? providedToken
        : useAuthStore.getState().token || '';

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  ensureAccessTokenLive(endpoint, locale, token, omitAuth === true);

  if (onProgress) {
    const xhr = new XMLHttpRequest();
    xhr.open(rest.method || 'POST', url);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('x-lang', locale);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    };

    return new Promise<T>((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText) as T);
          } catch {
            resolve(undefined as unknown as T);
          }
        } else {
          if (xhr.status === 401) {
            maybeHandleUnauthorizedSession(endpoint, locale, Boolean(token));
          }
          reject(
            new ApiError(
              xhr.status,
              null,
              {},
              locale === 'ar'
                ? 'تعذّر رفع الملف. تحقق من الاتصال والملف والصلاحيات.'
                : 'Upload failed. Check your connection, file, and permissions.',
            ),
          );
        }
      };
      xhr.onerror = () =>
        reject(new Error(locale === 'ar' ? 'خطأ رفع' : 'Upload error'));
      xhr.send(formData);
    });
  }

  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: formData,
    ...rest,
    omitAuth,
    locale,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience wrappers
// ─────────────────────────────────────────────────────────────────────────────
export const get = <T = unknown>(endpoint: string, options?: ApiOptions) =>
  apiRequest<T>(endpoint, { ...options, method: 'GET' });

function jsonBody(body: unknown): BodyInit | undefined {
  if (body instanceof FormData) return body;
  // JSON.stringify(undefined) يعيد undefined فيلغي الجسم بينما Content-Type يبقى json → 400 من الخادم
  if (body === undefined) return JSON.stringify({});
  return JSON.stringify(body);
}

export const post = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: ApiOptions,
) =>
  apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: jsonBody(body),
  });

export const put = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: ApiOptions,
) =>
  apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: jsonBody(body),
  });

export const patch = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: ApiOptions,
) =>
  apiRequest<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: jsonBody(body),
  });

export const del = <T = unknown>(endpoint: string, options?: ApiOptions) =>
  apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
