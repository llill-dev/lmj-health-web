/**
 * حالة التوجيه إلى `/signup-success` — تأتى غالباً من `Navigate`/OTP مع `state`;
 * يمكن أيضاً قراءة نسخة احتياطية من `sessionStorage` إذا ضاع كائن `location.state`.
 */
export type SignupSuccessLocationState =
  | {
      flow: 'pending_doctor';
      message?: string;
      title?: string;
    }
  | {
      flow: 'session_ready';
      redirectTo: string;
      message?: string;
      title?: string;
    };

const STORAGE_KEY = 'lmj:signup-success-location-state';

/** يُستدعى قبل `navigate('/signup-success')`. */
export function persistSignupSuccessNavState(state: SignupSuccessLocationState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* نطاق التخزين أو إعدادات المتصفح */
  }
}

/** قراءة دون مسح — آمن مع React Strict Mode (سيناريوهات الإزالة المزدوجة للمكوّن). */
export function peekSignupSuccessNavState(): SignupSuccessLocationState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SignupSuccessLocationState;
    if (!parsed || typeof parsed !== 'object' || !('flow' in parsed)) return null;
    if (parsed.flow === 'session_ready') {
      if (typeof parsed.redirectTo !== 'string' || !parsed.redirectTo.trim())
        return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** يُستخدم عند تأكّد الوصول بالـhistory حتى لا تبقى نسخة قديمة في التخزين. */
export function clearSignupSuccessNavState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
