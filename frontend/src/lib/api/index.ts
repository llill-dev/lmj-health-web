import { localizeOrderStatusesInMessage } from "@/lib/doctor/orders/orderStatusLabels";
import { useAuthStore } from "@/store/authStore";
import { runSessionExpiredFlow } from "@/lib/session/sessionExpiryFlow";
import {
  isAccessTokenExpired,
  isSessionExpiry401Exempt,
} from "@/lib/session/sessionExpiryGuards";
import {
  ensureFreshAccessToken,
  refreshAccessToken,
} from "@/lib/auth/sessionRefresh";
import { localizeApiMessageKey } from "@/i18n/apiMessageKeys";
import { getCurrentLocale } from "@/i18n/runtime";

function normalizeApiOrigin(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

import { isUiOnlyMode } from "@/lib/env/uiOnlyMode";

export const API_BASE_URL = normalizeApiOrigin(import.meta.env.VITE_API_ORIGIN);

const UI_ONLY = isUiOnlyMode();

export type ApiBodyRecord = {
  [key: string]: unknown;
};

type ValidationIssueRecord = {
  type?: unknown;
  path?: unknown;
  location?: unknown;
  msg?: unknown;
};

function asApiBodyRecord(value: unknown): ApiBodyRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiBodyRecord)
    : {};
}

function asStringHeaderRecord(
  value: unknown,
): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function readBodyString(
  body: ApiBodyRecord,
  key: string,
): string | undefined {
  const value = body[key];
  return typeof value === "string" ? value : undefined;
}

function noApiContent<T>(): T {
  return undefined!;
}

function valueOrNoContent<T>(value: T, hasContent: boolean): T {
  return hasContent ? value : noApiContent<T>();
}

function parseApiJsonText(raw: string): ApiBodyRecord {
  return asApiBodyRecord(JSON.parse(raw));
}

function asValidationIssueRecordArray(value: unknown): ValidationIssueRecord[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter(
    (item): item is ValidationIssueRecord =>
      !!item && typeof item === "object" && !Array.isArray(item),
  );
}

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
  readonly body: ApiBodyRecord;

  constructor(
    status: number,
    messageKey: string | null,
    body: ApiBodyRecord,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.messageKey = messageKey;
    this.body = body;
  }
}

/** نصوص HTTP تلقائية من المتصفح/الوسيط (إنجليزي) لا نعرضها للمستخدم العربي؛ نستبدلها برسالة عربية واضحة. */
function shouldReplaceArabicBackendMessage(
  status: number,
  msg: string,
): boolean {
  const m = msg.trim().toLowerCase();
  if (!m.length) return true;
  if (/^<!doctype|^<html\b/i.test(msg.trim())) return true;
  const genericByStatus: Record<number, readonly string[]> = {
    400: ["bad request"],
    401: ["unauthorized"],
    403: ["forbidden"],
    404: ["not found"],
    408: ["request timeout"],
    409: ["conflict"],
    413: ["payload too large", "request entity too large", "content too large"],
    415: ["unsupported media type"],
    422: ["unprocessable entity", "unprocessable"],
    429: ["too many requests"],
    500: ["internal server error", "server error"],
    502: ["bad gateway"],
    503: ["service unavailable", "service temporarily unavailable"],
    504: ["gateway timeout", "request timeout"],
  };
  const list = genericByStatus[status];
  if (!list)
    return status >= 500 && m.length < 120 && /^[a-z\s.-]+$/i.test(m.trim());
  return list.some(
    (g) => m === g || m.startsWith(`${g}.`) || m.startsWith(`${g} `),
  );
}

function pickPreferredBackendErrorMessage(
  status: number,
  candidates: Array<string | undefined>,
): string {
  let fallback = "";

  for (const candidate of candidates) {
    const trimmed = candidate?.trim() ?? "";
    if (!trimmed) continue;
    if (!fallback) fallback = trimmed;
    if (!shouldReplaceArabicBackendMessage(status, trimmed)) {
      return trimmed;
    }
  }

  return fallback;
}

/**
 * رسائل واجهة المستخدم المركّزة على العربية: نفضّل نصاً مفيداً من الخادم؛
 * وإذا كان عاماً أو HTML أو إنجليزياً خاماً نستخدم شرحاً عربياً بحسب الرمز HTTP.
 */
function userFacingHttpErrorMessage(
  status: number,
  backendMsg: string,
  statusText: string,
  locale: "ar" | "en",
): string {
  const trimmed = backendMsg.trim();
  if (locale === "ar") {
    if (trimmed && !shouldReplaceArabicBackendMessage(status, trimmed)) {
      return trimmed;
    }

    switch (status) {
      case 400:
        return "البيانات المرسلة غير مقبولة. راجع الحقول المطلوبة والصيغة ثم أعد المحاولة.";
      case 401:
        return "لم يتم التحقّق من هويتك أو انتهت صلاحية الجلسة. سجّل الدخول من جديد إن لزم.";
      case 403:
        return "لا تملك صلاحية تنفيذ هذه العملية. إذا ظننت أن ذلك خطأ فتواصل مع الدعم.";
      case 404:
        return "لم يُعثَر على المطلوب؛ ربما أُزيل أو العنوان غير صحيح.";
      case 408:
        return "انتهى وقت انتظار الخادم لهذا الطلب. أعد المحاولة.";
      case 409:
        return "تعارض مع بيانات موجودة لدينا (مثلاً حساب أو سجل مسجَّل بالفعل). راجع مدخلاتك.";
      case 413:
        return "حجم البيانات أو الملف كبير أكثر من المسموح. قلّل الحجم ثم أعد المحاولة.";
      case 415:
        return "نوع المحتوى غير مدعوم. حاول بصيغة أخرى أو من متصفّح مختلف.";
      case 422:
        return "البيانات غير متوافقة مع قواعد التحقّق على الخادم؛ صحّح الحقول الظاهرة في الرسالة ثم أعد الإرسال.";
      case 429:
        return "تم إرسال طلبات كثيرة في وقت قصير. انتظر قليلاً ثم حاول مرّة أخرى.";
      case 502:
        return "تعذّر إتمام الطلب عبر شبكة الوصول (غالبًا وسيطًا أو VPN). تحقَّق من الاتصال أو جرّب لاحقًا أو بدون VPN.";
      case 503:
        return "الخدمة غير متاحة مؤقتاً (صيانة، ضغط، أو قطع شبكة نحو الخادم). أعد المحاولة بعد قليل.";
      case 504:
        return "انتهى وقت الاتصال نحو الخادم؛ غالبًا بسبب الشبكة أو VPN أو بطء الوصول. أعد المحاولة لاحقاً.";
      default:
        if (status >= 500)
          return "لم نتمكن من إتمام الطلب مع الخادم. غالبًا يكون ذلك بسبب انقطاع مؤقت في الشبكة، أو تأثّر المسار بـ VPN أو جدار الحماية، أو توقيت خاطئ على الجهاز. تحقَّق من الإنترنت ثم أعد المحاولة لاحقًا. إذا كان الاتصال سليمًا واستمر ذلك، يمكن أن يكون هناك عطلًا بالخدمة — أبلغ الدعم عند الحاجة.";
        if (status >= 400)
          return "تعذّر تنفيذ الطلب. راجع البيانات أو حاول لاحقاً.";
        return "تعذّر إكمال الطلب.";
    }
  }

  if (trimmed) return trimmed;
  if (status === 401) return "Session expired or unauthorized.";
  if (status === 403) return "You are not allowed to perform this action.";
  if (status === 404) return "Resource not found.";
  if (status === 422)
    return "The data does not match server validation rules. Review the fields and try again.";
  if (status === 429) return "Too many requests. Please wait and try again.";
  if (status >= 500)
    return "We could not complete the request. Check your internet, VPN/firewall settings, try again shortly, or report if it persists.";
  return statusText || "Request failed";
}

/** أعطال fetch / TLS / إلغاء الطلب — رسائل جاهزة للعرض على الواجهة. */
export function transportFailureUserMessage(
  error: unknown,
  locale: "ar" | "en" = getCurrentLocale(),
): string {
  if (locale === "en") {
    if (error instanceof DOMException && error.name === "AbortError")
      return "The request was cancelled.";
    if (error instanceof Error && error.name === "AbortError")
      return "The request was cancelled.";
    if (error instanceof TypeError)
      return "Could not reach the server. Check your internet connection.";
    if (error instanceof Error && error.message) return error.message;
    return "Network error";
  }

  if (error instanceof DOMException && error.name === "AbortError")
    return "تم إلغاء الطلب. أعد المحاولة إذا احتجت إكمال العملية.";
  if (error instanceof Error && error.name === "AbortError")
    return "تم إلغاء الطلب. أعد المحاولة إذا احتجت إكمال العملية.";

  const m = error instanceof Error ? error.message : "";
  const lower = m.toLowerCase();

  if (
    error instanceof TypeError ||
    lower.includes("failed to fetch") ||
    lower.includes("networkerror when attempting to fetch") ||
    lower.includes("network request failed") ||
    lower.includes("load failed")
  ) {
    return "تعذّر الوصول إلى الخادم عبر المتصفّح — غالبًا بسبب الشبكة أو VPN أو قطع مسار الوصول لحظياً. تحقَّق من الإنترنت، أو جرّب لاحقاً أو بدون VPN ثم أعد المحاولة.";
  }

  if (
    lower.includes("ssl") ||
    lower.includes("certificate") ||
    lower.includes("revocation") ||
    lower.includes("schannel") ||
    lower.includes("tls") ||
    lower.includes("secure connection")
  ) {
    return "تعذّر إنشاء اتصال آمن مع الخادم. تأكد من ضبط الوقت والتاريخ على جهازك، أو استخدم شبكة أخرى.";
  }

  if (lower.includes("aborted")) {
    return "انقطع الاتصال أثناء الطلب. تحقّق من الشبكة ثم حاول مرّة أخرى.";
  }

  return "تعذّر إتمام الطلب بسبب مشكلة اتصال. تحقّق من الإنترنت ثم أعد المحاولة.";
}

/** رسالة موحّدة لواجهة المستخدم بعد فشل طلب: ApiError أو فشل نقل الشبكة. */
export function getUserFacingRequestErrorMessage(
  error: unknown,
  locale: "ar" | "en" = getCurrentLocale(),
): string {
  if (error instanceof ApiError) {
    // Handle validation errors with field-specific messages
    if (
      error.status === 422 &&
      error.messageKey === "errors.validationFailed"
    ) {
      const errors = asValidationIssueRecordArray(error.body.errors);

      if (errors && errors.length > 0) {
        const phoneError = errors.find((e) => e.path === "phone");
        if (phoneError && locale === "ar") {
          const phoneMessage =
            typeof phoneError.msg === "string" ? phoneError.msg : "";
          // Provide clear Arabic error message for phone validation
          if (
            phoneMessage.includes("too long") ||
            phoneMessage.includes("maximum")
          ) {
            return "رقم الهاتف طويل جداً. الحد الأقصى 20 حرف.";
          }
          if (
            phoneMessage.includes("too short") ||
            phoneMessage.includes("minimum")
          ) {
            return "رقم الهاتف قصير جداً. الحد الأدنى 8 أرقام.";
          }
          if (
            phoneMessage.includes("invalid") ||
            phoneMessage.includes("format")
          ) {
            return "صيغة رقم الهاتف غير صحيحة. استخدم الصيغة الدولية مثل +963912345678.";
          }
          return phoneMessage || "تنسيق رقم الهاتف غير صالح.";
        }
      }
    }

    const msg = error.message;
    return locale === "ar" ? localizeOrderStatusesInMessage(msg) : msg;
  }
  return transportFailureUserMessage(error, locale);
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
  locale?: "ar" | "en";
};

function resolveApiLocale(preferred?: "ar" | "en"): "ar" | "en" {
  const active = getCurrentLocale();
  if (preferred === "en") return "en";
  // Legacy code passes locale: "ar" by default; sync it with active UI language.
  if (preferred === "ar") return active;
  return active;
}

export type ApiResult<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

// ─────────────────────────────────────────────────────────────────────────────
// Core request function
// ─────────────────────────────────────────────────────────────────────────────
function scheduleSessionExpiryHandling(
  locale: "ar" | "en",
  reason: "expired" | "invalidated" = "expired",
): void {
  runSessionExpiredFlow(locale, reason);
}

/** استجابة 401 مع طلب كان يحمل توكن مصادقة → انتهاء الجلسة (مع استثناء مسارات /api/auth العامة). */
function maybeHandleUnauthorizedSession(
  endpoint: string,
  locale: "ar" | "en",
  hadBearerToken: boolean,
): void {
  if (!hadBearerToken) return;
  if (isSessionExpiry401Exempt(endpoint)) return;
  scheduleSessionExpiryHandling(locale);
}

/** فحص JWT محلياً؛ يحاول refresh قبل إيقاف الطلب */
async function ensureAccessTokenLive(
  endpoint: string,
  locale: "ar" | "en",
  token: string,
  omitAuth: boolean,
): Promise<string> {
  if (omitAuth || !token) return token;
  if (isSessionExpiry401Exempt(endpoint)) return token;
  if (!isAccessTokenExpired(token)) return token;

  const refreshed = await ensureFreshAccessToken();
  if (refreshed) {
    return useAuthStore.getState().accessToken || token;
  }

  scheduleSessionExpiryHandling(locale);
  throw new ApiError(
    401,
    "errors.auth.sessionExpired",
    {},
    locale === "ar" ? "انتهت صلاحية جلسة الدخول." : "Session expired.",
  );
}

async function tryRecoverUnauthorizedSession(
  endpoint: string,
  locale: "ar" | "en",
  hadBearerToken: boolean,
): Promise<boolean> {
  if (!hadBearerToken) return false;
  if (isSessionExpiry401Exempt(endpoint)) return false;
  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    scheduleSessionExpiryHandling(locale, "invalidated");
  }
  return refreshed;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  if (UI_ONLY) return noApiContent<T>();

  const {
    token: providedToken,
    omitAuth = false,
    headers,
    signal,
    onError,
    locale: preferredLocale,
    ...rest
  } = options;
  const locale = resolveApiLocale(preferredLocale);

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  let token =
    omitAuth === true
      ? ""
      : providedToken !== undefined
        ? providedToken
        : useAuthStore.getState().accessToken || "";

  token = await ensureAccessTokenLive(
    endpoint,
    locale,
    token,
    omitAuth === true,
  );

  const isFormData = rest.body instanceof FormData;

  const finalHeaders: Record<string, string> = {
    ...(!headers || !("x-lang" in headers)
      ? { "x-lang": locale }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...asStringHeaderRecord(headers),
  };

  const hadBearerToken = Boolean(token && finalHeaders.Authorization);

  if (!isFormData && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    headers: finalHeaders,
    cache: "no-store",
    signal,
    ...rest,
  };

  const execute = async (retryAfterRefresh: boolean): Promise<T> => {
    const res = await fetch(url, config);

    const contentType = res.headers.get("content-type") ?? "";
    let body: ApiBodyRecord = {};
    let rawText = "";

    if (contentType.includes("application/json")) {
      try {
        body = asApiBodyRecord(await res.json());
      } catch {
        // empty body
      }
    } else {
      rawText = await res.text().catch(() => "");
    }

    if (!res.ok) {
      let unauthorizedRecovered = false;
      let unauthorizedInvalidated = false;

      if (res.status === 401 && !retryAfterRefresh) {
        unauthorizedRecovered = await tryRecoverUnauthorizedSession(
          endpoint,
          locale,
          hadBearerToken,
        );
        unauthorizedInvalidated = hadBearerToken && !unauthorizedRecovered;

        if (unauthorizedRecovered) {
          const nextToken = useAuthStore.getState().accessToken || "";
          if (nextToken) {
            config.headers = {
              ...(asStringHeaderRecord(config.headers) ?? {}),
              Authorization: `Bearer ${nextToken}`,
            };
            return execute(true);
          }
        }
      }

      if (res.status === 401 && !unauthorizedInvalidated) {
        maybeHandleUnauthorizedSession(endpoint, locale, hadBearerToken);
      }

      const backendMsg = pickPreferredBackendErrorMessage(res.status, [
        readBodyString(body, "message"),
        readBodyString(body, "detail"),
        readBodyString(body, "title"),
        readBodyString(body, "error"),
        rawText,
        res.statusText,
      ]);

      const messageKey = readBodyString(body, "messageKey") ?? null;
      const localizedMessageByKey = localizeApiMessageKey(messageKey, locale);

      const displayMsg =
        localizedMessageByKey ??
        userFacingHttpErrorMessage(
          res.status,
          typeof backendMsg === "string" ? backendMsg : String(backendMsg ?? ""),
          res.statusText,
          locale,
        );

      const err = new ApiError(res.status, messageKey, body, displayMsg);
      onError?.(err);
      throw err;
    }

    return valueOrNoContent<T>(body as T, Object.keys(body).length > 0);
  };

  try {
    return await execute(false);
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
    if (error instanceof ApiError && expectedStatuses.includes(error.status)) {
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
  if (UI_ONLY) return noApiContent<T>();

  const {
    onProgress,
    locale: preferredLocale,
    token: providedToken,
    omitAuth = false,
    ...rest
  } = options;
  const locale = resolveApiLocale(preferredLocale);
  let token =
    omitAuth === true
      ? ""
      : providedToken !== undefined
        ? providedToken
        : useAuthStore.getState().accessToken || "";

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  token = await ensureAccessTokenLive(endpoint, locale, token, omitAuth === true);

  const hadBearerToken = Boolean(token);

  const parseXhrResponse = (xhr: XMLHttpRequest): T => {
    try {
      const parsed = parseApiJsonText(xhr.responseText);
      return valueOrNoContent<T>(parsed as T, Object.keys(parsed).length > 0);
    } catch {
      return noApiContent<T>();
    }
  };

  const uploadWithXhr = (bearerToken: string): Promise<T> => {
    const xhr = new XMLHttpRequest();
    xhr.open(rest.method || "POST", url);
    if (bearerToken) {
      xhr.setRequestHeader("Authorization", `Bearer ${bearerToken}`);
    }
    xhr.setRequestHeader("x-lang", locale);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.((e.loaded / e.total) * 100);
    };

    return new Promise<T>((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(parseXhrResponse(xhr));
          return;
        }

        reject(
          new ApiError(
            xhr.status,
            null,
            {},
            locale === "ar"
              ? "تعذّر رفع الملف. تحقق من الاتصال والملف والصلاحيات."
              : "Upload failed. Check your connection, file, and permissions.",
          ),
        );
      };
      xhr.onerror = () =>
        reject(
          new Error(
            locale === "ar"
              ? "تعذّر إرسال الملف بسبب فشل الاتصال. تحقّق من الشبكة وحجم الملف ثم حاول مرّة أخرى."
              : "Upload failed due to a network error. Try again.",
          ),
        );
      xhr.send(formData);
    });
  };

  if (onProgress) {
    try {
      return await uploadWithXhr(token);
    } catch (error) {
      let unauthorizedInvalidated = false;

      if (
        error instanceof ApiError
        && error.status === 401
        && hadBearerToken
        && !isSessionExpiry401Exempt(endpoint)
      ) {
        const recovered = await tryRecoverUnauthorizedSession(
          endpoint,
          locale,
          hadBearerToken,
        );
        unauthorizedInvalidated = !recovered;
        if (recovered) {
          const nextToken = useAuthStore.getState().accessToken || "";
          if (nextToken) {
            return uploadWithXhr(nextToken);
          }
        }
      }

      if (
        error instanceof ApiError
        && error.status === 401
        && !unauthorizedInvalidated
      ) {
        maybeHandleUnauthorizedSession(endpoint, locale, hadBearerToken);
      }

      throw error;
    }
  }

  return apiRequest<T>(endpoint, {
    method: "POST",
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
  apiRequest<T>(endpoint, { ...options, method: "GET" });

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
    method: "POST",
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
    method: "POST",
    body: jsonBody(body),
  });

export const put = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: ApiOptions,
) =>
  apiRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: jsonBody(body),
  });

export const patch = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: ApiOptions,
) =>
  apiRequest<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: jsonBody(body),
  });

export const del = <T = unknown>(endpoint: string, options?: ApiOptions) =>
  apiRequest<T>(endpoint, { ...options, method: "DELETE" });
