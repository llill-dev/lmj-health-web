import { useAuthStore } from '@/store/authStore';

export const API_BASE_URL = import.meta.env.PROD
  ? ''
  : import.meta.env.VITE_API_URL || '';

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

// ─────────────────────────────────────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────────────────────────────────────
export type ApiOptions = RequestInit & {
  token?: string;
  signal?: AbortSignal;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  locale?: 'ar' | 'en';
};

// ─────────────────────────────────────────────────────────────────────────────
// Core request function
// ─────────────────────────────────────────────────────────────────────────────
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  if (UI_ONLY) return undefined as unknown as T;

  const {
    token: providedToken,
    headers,
    signal,
    onError,
    locale = 'ar',
    ...rest
  } = options;

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = providedToken || useAuthStore.getState().token || '';
  const isFormData = rest.body instanceof FormData;

  const finalHeaders: Record<string, string> = {
    ...(!headers || !('x-lang' in (headers as object))
      ? { 'x-lang': locale }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string> | undefined),
  };

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
      // Prefer messageKey-keyed message, then body.message/error, then statusText
      const backendMsg =
        (body.message as string | undefined) ||
        (body.error as string | undefined) ||
        rawText ||
        res.statusText;

      const messageKey = (body.messageKey as string | undefined) ?? null;

      const displayMsg =
        locale === 'ar'
          ? `خطأ ${res.status}: ${backendMsg || 'طلب فاشل'}`
          : `Error ${res.status}: ${backendMsg || 'Request failed'}`;

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

  const { onProgress, locale = 'ar', token: providedToken, ...rest } = options;
  const token = providedToken || useAuthStore.getState().token || '';

  if (onProgress) {
    const xhr = new XMLHttpRequest();
    xhr.open(rest.method || 'POST', `${API_BASE_URL}${endpoint}`);
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
          reject(
            new ApiError(
              xhr.status,
              null,
              {},
              locale === 'ar'
                ? `خطأ رفع: ${xhr.status}`
                : `Upload error: ${xhr.status}`,
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
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience wrappers
// ─────────────────────────────────────────────────────────────────────────────
export const get = <T = unknown>(endpoint: string, options?: ApiOptions) =>
  apiRequest<T>(endpoint, { ...options, method: 'GET' });

export const post = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: ApiOptions,
) =>
  apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const put = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: ApiOptions,
) =>
  apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const patch = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: ApiOptions,
) =>
  apiRequest<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const del = <T = unknown>(endpoint: string, options?: ApiOptions) =>
  apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
