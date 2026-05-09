import { useAuthStore } from '@/store/authStore';
import { runSessionExpiredFlow } from '@/lib/session/sessionExpiryFlow';
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

/** نصوص HTTP تلقائية من المتصفح/الوسيط (إنجليزي) لا نعرضها للمستخدم العربي؛ نستبدلها برسالة عربية واضحة. */
function shouldReplaceArabicBackendMessage(status: number, msg: string): boolean {
  const m = msg.trim().toLowerCase();
  if (!m.length) return true;
  if (/^<!doctype|^<html\b/i.test(msg.trim())) return true;
  const genericByStatus: Record<number, readonly string[]> = {
    400: ['bad request'],
    401: ['unauthorized'],
    403: ['forbidden'],
    404: ['not found'],
    408: ['request timeout'],
    409: ['conflict'],
    413: ['payload too large', 'request entity too large', 'content too large'],
    415: ['unsupported media type'],
    422: ['unprocessable entity', 'unprocessable'],
    429: ['too many requests'],
    500: ['internal server error', 'server error'],
    502: ['bad gateway'],
    503: ['service unavailable', 'service temporarily unavailable'],
    504: ['gateway timeout', 'request timeout'],
  };
  const list = genericByStatus[status];
  if (!list) return status >= 500 && m.length < 120 && /^[a-z\s.-]+$/i.test(m.trim());
  return list.some((g) => m === g || m.startsWith(`${g}.`) || m.startsWith(`${g} `));
}

/**
 * رسائل واجهة المستخدم المركّزة على العربية: نفضّل نصاً مفيداً من الخادم؛
 * وإذا كان عاماً أو HTML أو إنجليزياً خاماً نستخدم شرحاً عربياً بحسب الرمز HTTP.
 */
function userFacingHttpErrorMessage(
  status: number,
  backendMsg: string,
  statusText: string,
  locale: 'ar' | 'en',
): string {
  const trimmed = backendMsg.trim();
  if (locale === 'ar') {
    if (trimmed && !shouldReplaceArabicBackendMessage(status, trimmed)) {
      return trimmed;
    }

    switch (status) {
      case 400:
        return 'البيانات المرسلة غير مقبولة. راجع الحقول المطلوبة والصيغة ثم أعد المحاولة.';
      case 401:
        return 'لم يتم التحقّق من هويتك أو انتهت صلاحية الجلسة. سجّل الدخول من جديد إن لزم.';
      case 403:
        return 'لا تملك صلاحية تنفيذ هذه العملية. إذا ظننت أن ذلك خطأ فتواصل مع الدعم.';
      case 404:
        return 'لم يُعثَر على المطلوب؛ ربما أُزيل أو العنوان غير صحيح.';
      case 408:
        return 'انتهى وقت انتظار الخادم لهذا الطلب. أعد المحاولة.';
      case 409:
        return 'تعارض مع بيانات موجودة لدينا (مثلاً حساب أو سجل مسجَّل بالفعل). راجع مدخلاتك.';
      case 413:
        return 'حجم البيانات أو الملف كبير أكثر من المسموح. قلّل الحجم ثم أعد المحاولة.';
      case 415:
        return 'نوع المحتوى غير مدعوم. حاول بصيغة أخرى أو من متصفّح مختلف.';
      case 422:
        return 'البيانات غير متوافقة مع قواعد التحقّق على الخادم؛ صحّح الحقول الظاهرة في الرسالة ثم أعد الإرسال.';
      case 429:
        return 'تم إرسال طلبات كثيرة في وقت قصير. انتظر قليلاً ثم حاول مرّة أخرى.';
      case 502:
        return 'الخادم تلقّى استجابة غير صالحة من خدمة أخرى؛ حاول لاحقاً.';
      case 503:
        return 'الخدمة غير متاحة مؤقتاً بسبب صيانة أو ضغط. حاول بعد دقائق.';
      case 504:
        return 'انتهى وقت الاتصال بين الخوادم. تحقّق من الشبكة ثم أعد المحاولة.';
      default:
        if (status >= 500)
          return 'حدث عطل داخلي على خادم الخدمة ولم يُكمل طلبك. أعد المحاولة لاحقاً؛ إذا استمرّ الخطأ فأبلغ الدعم.';
        if (status >= 400)
          return 'تعذّر تنفيذ الطلب. راجع البيانات أو حاول لاحقاً.';
        return 'تعذّر إكمال الطلب.';
    }
  }

  if (trimmed) return trimmed;
  if (status === 401) return 'Session expired or unauthorized.';
  if (status === 403) return 'You are not allowed to perform this action.';
  if (status === 404) return 'Resource not found.';
  if (status === 422)
    return 'The data does not match server validation rules. Review the fields and try again.';
  if (status === 429) return 'Too many requests. Please wait and try again.';
  if (status >= 500)
    return 'The server could not complete the request. Please try again later.';
  return statusText || 'Request failed';
}

/** أعطال fetch / TLS / إلغاء الطلب — رسالة عربية واحدة لكل حالة تقريباً. */
function transportFailureUserMessage(error: unknown, locale: 'ar' | 'en'): string {
  if (locale === 'en') {
    if (error instanceof DOMException && error.name === 'AbortError')
      return 'The request was cancelled.';
    if (error instanceof Error && error.name === 'AbortError')
      return 'The request was cancelled.';
    if (error instanceof TypeError)
      return 'Could not reach the server. Check your internet connection.';
    if (error instanceof Error && error.message)
      return error.message;
    return 'Network error';
  }

  if (error instanceof DOMException && error.name === 'AbortError')
    return 'تم إلغاء الطلب. أعد المحاولة إذا احتجت إكمال العملية.';
  if (error instanceof Error && error.name === 'AbortError')
    return 'تم إلغاء الطلب. أعد المحاولة إذا احتجت إكمال العملية.';

  const m = error instanceof Error ? error.message : '';
  const lower = m.toLowerCase();

  if (
    error instanceof TypeError ||
    lower.includes('failed to fetch') ||
    lower.includes('networkerror when attempting to fetch') ||
    lower.includes('network request failed') ||
    lower.includes('load failed')
  ) {
    return 'تعذّر الوصول إلى الخادم. تحقّق من اتصال الإنترنت؛ إن كان يعمل فربما الخدمة غير متاحة مؤقتاً—أعد المحاولة بعد قليل.';
  }

  if (
    lower.includes('ssl') ||
    lower.includes('certificate') ||
    lower.includes('revocation') ||
    lower.includes('schannel') ||
    lower.includes('tls') ||
    lower.includes('secure connection')
  ) {
    return 'تعذّر إنشاء اتصال آمن مع الخادم. تأكد من ضبط الوقت والتاريخ على جهازك، أو استخدم شبكة أخرى.';
  }

  if (lower.includes('aborted')) {
    return 'انقطع الاتصال أثناء الطلب. تحقّق من الشبكة ثم حاول مرّة أخرى.';
  }

  return 'تعذّر إتمام الطلب بسبب مشكلة اتصال. تحقّق من الإنترنت ثم أعد المحاولة.';
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

export type ApiResult<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

// ─────────────────────────────────────────────────────────────────────────────
// Core request function
// ─────────────────────────────────────────────────────────────────────────────
function scheduleSessionExpiryHandling(locale: 'ar' | 'en'): void {
  runSessionExpiredFlow(locale);
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
        (body.detail as string | undefined) ||
        (body.title as string | undefined) ||
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

    const readable = transportFailureUserMessage(e, locale);
    const err = new Error(readable);
    onError?.(err);
    throw err;
  }
}

export async function apiRequestResult<T = unknown>(
  endpoint: string,
  options: ApiOptions & {
    expectedStatuses?: readonly number[];
  } = {},
): Promise<ApiResult<T, ApiError | Error>> {
  const { expectedStatuses = [], ...requestOptions } = options;

  try {
    const data = await apiRequest<T>(endpoint, requestOptions);
    return { ok: true, data };
  } catch (error) {
    if (
      error instanceof ApiError &&
      expectedStatuses.includes(error.status)
    ) {
      return { ok: false, error };
    }

    throw error;
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
        reject(
          new Error(
            locale === 'ar'
              ? 'تعذّر إرسال الملف بسبب فشل الاتصال. تحقّق من الشبكة وحجم الملف ثم حاول مرّة أخرى.'
              : 'Upload failed due to a network error. Try again.',
          ),
        );
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

export const postResult = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: ApiOptions & {
    expectedStatuses?: readonly number[];
  },
) =>
  apiRequestResult<T>(endpoint, {
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
