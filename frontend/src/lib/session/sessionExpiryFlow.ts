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

export type SessionEndReason = 'expired' | 'invalidated';

export function registerSessionExpiryToastSink(sink: ToastSink | null): void {
  toastSink = sink;
}

function sessionEndCopy(
  locale: 'ar' | 'en',
  reason: SessionEndReason,
): { title: string; message: string } {
  if (reason === 'invalidated') {
    if (locale === 'en') {
      return {
        title: 'Session ended',
        message:
          'Your session was ended for security reasons (expired token or sign-in elsewhere). Please sign in again.',
      };
    }
    return {
      title: 'انتهت الجلسة',
      message:
        'تم إنهاء جلسة الدخول لأسباب أمنية (انتهاء صلاحية الرمز أو تسجيل دخول من جهاز آخر). يرجى تسجيل الدخول مجدداً.',
    };
  }

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
 * Local logout with a single toast (deduped during parallel requests).
 */
export function runSessionExpiredFlow(
  locale: 'ar' | 'en' = 'ar',
  reason: SessionEndReason = 'expired',
): void {
  const now = Date.now();
  if (now - lastExpiryHandledAt < DEDUP_MS) return;
  lastExpiryHandledAt = now;

  const { title, message } = sessionEndCopy(locale, reason);

  toastSink?.(message, {
    title,
    variant: 'warning',
    durationMs: 6800,
  });

  queryClient.clear();

  void useAuthStore.getState().logout({ skipRemoteRevoke: true });
}
