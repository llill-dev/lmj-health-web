import { useAuthStore } from '@/store/authStore'; // من useAuth اللي عملنا

export const API_BASE_URL =
  typeof window !== 'undefined' && import.meta.env.DEV
    ? ''
    : import.meta.env.VITE_API_URL || '';

const UI_ONLY = import.meta.env.VITE_UI_ONLY === 'true';

export type ApiOptions = RequestInit & {
  token?: string; // optional، رح يجيب من authStore تلقائي
  signal?: AbortSignal;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void; // للـ upload progress (ميزة 7: رفع CV)
  locale?: 'ar' | 'en'; // للـ bilingual errors (ميزة 1)
};

export async function apiRequest<T = any>(
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

  // جديد: token auto من useAuthStore
  const token = providedToken || useAuthStore.getState().token || '';

  const isFormData = rest.body instanceof FormData;

  const finalHeaders: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers || {}),
  };

  if (!isFormData && !(finalHeaders as any)['Content-Type']) {
    (finalHeaders as any)['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    headers: finalHeaders,
    cache: 'no-store',
    signal,
    ...rest,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let message = await res.text().catch(() => res.statusText);
      // جديد: bilingual error (ميزة 1)
      const errMsg =
        locale === 'ar'
          ? `خطأ ${res.status}: ${message || 'طلب فاشل'}`
          : `Error ${res.status}: ${message || 'Request failed'}`;
      const err = new Error(errMsg);
      onError?.(err);
      throw err;
    }
    try {
      return (await res.json()) as T;
    } catch {
      return undefined as unknown as T;
    }
  } catch (e: any) {
    const errMsg = locale === 'ar' ? 'خطأ شبكة' : 'Network error';
    const err = e instanceof Error ? e : new Error(errMsg);
    onError?.(err);
    throw err;
  }
}

export async function apiMultipart<T = any>(
  endpoint: string,
  formData: FormData,
  options: ApiOptions = {},
) {
  if (UI_ONLY) return undefined as unknown as T;

  const { onProgress, locale = 'ar', ...rest } = options;

  // جديد: progress مع XMLHttpRequest (لرفع CV أو فيديو في  ميزة 7)
  if (onProgress) {
    const xhr = new XMLHttpRequest();
    xhr.open(rest.method || 'POST', `${API_BASE_URL}${endpoint}`);
    if (rest.token)
      xhr.setRequestHeader('Authorization', `Bearer ${rest.token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    };
    return new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText) as T);
          } catch {
            resolve(undefined as T);
          }
        } else {
          reject(
            new Error(
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

  // fallback
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: formData,
    ...rest,
  });
}

export const get = <T = any>(endpoint: string, options?: ApiOptions) =>
  apiRequest<T>(endpoint, { ...options, method: 'GET' });

export const post = <T = any>(
  endpoint: string,
  body?: any,
  options?: ApiOptions,
) =>
  apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const put = <T = any>(
  endpoint: string,
  body?: any,
  options?: ApiOptions,
) =>
  apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const patch = <T = any>(
  endpoint: string,
  body?: any,
  options?: ApiOptions,
) =>
  apiRequest<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const del = <T = any>(endpoint: string, options?: ApiOptions) =>
  apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
