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

function asSignupSuccessLocationRecord(
  value: unknown,
): { flow?: unknown; redirectTo?: unknown } | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

function readSignupSuccessRedirectTo(
  record: { flow?: unknown; redirectTo?: unknown },
): string | undefined {
  const value = record.redirectTo;
  return typeof value === 'string' ? value.trim() || undefined : undefined;
}

function parseSignupSuccessLocationState(
  raw: string,
): SignupSuccessLocationState | null {
  const parsed = JSON.parse(raw);
  return isSignupSuccessLocationState(parsed) ? parsed : null;
}

function isSignupSuccessLocationState(
  value: unknown,
): value is SignupSuccessLocationState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = asSignupSuccessLocationRecord(value);
  if (!record) return false;
  if (record.flow === 'pending_doctor') return true;
  return (
    record.flow === 'session_ready' &&
    Boolean(readSignupSuccessRedirectTo(record))
  );
}

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
    return parseSignupSuccessLocationState(raw);
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
