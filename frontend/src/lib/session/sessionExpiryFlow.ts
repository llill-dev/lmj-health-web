import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/store/authStore';

const DEDUP_MS = 3500;
let lastExpiryHandledAt = 0;

type ToastSink = (
  message: string,
  opts: {
    title?: string;
    variant?: 'warning' | 'info' | 'error' | 'success';
    durationMs?: number;
  },
) => void;

let toastSink: ToastSink | null = null;

export function registerSessionExpiryToastSink(sink: ToastSink | null): void {
  toastSink = sink;
}

function sessionExpiryCopy(locale: 'ar' | 'en'): { title: string; message: string } {
  if (locale === 'en') {
    return {
      title: 'Session expired',
      message:
        'Your login session has expired for security reasons. Please sign in again to continue.',
    };
  }
  return {
    title: 'انتهت جلسة الدخول',
    message:
      'انتهت صلاحية جلسة الدخول لأسباب أمنية. الرجاء تسجيل الدخول مجدداً للمتابعة.',
  };
}

/**
 * تسجيل خروج محلي فوري مع توست واحد (منع التكرار أثناء طلبات متزامنة).
 * يُستدعى عند 401 مع Bearer أو عند انتهاء claim.exp قبل الطلب.
 */
export function runSessionExpiredFlow(locale: 'ar' | 'en' = 'ar'): void {
  const now = Date.now();
  if (now - lastExpiryHandledAt < DEDUP_MS) return;
  lastExpiryHandledAt = now;

  const { title, message } = sessionExpiryCopy(locale);

  toastSink?.(message, {
    title,
    variant: 'warning',
    durationMs: 6800,
  });

  queryClient.clear();

  void useAuthStore.getState().logout({ skipRemoteRevoke: true });
}
