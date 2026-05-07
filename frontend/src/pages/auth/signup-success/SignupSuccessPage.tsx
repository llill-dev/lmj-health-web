import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import SignupSuccess from '@/components/auth/signUp/signup-success';
import AuthBackground from '@/components/auth/AuthBackground';
import { useAuthStore } from '@/store/authStore';
import {
  clearSignupSuccessNavState,
  peekSignupSuccessNavState,
  type SignupSuccessLocationState,
} from '@/lib/auth/signupSuccessNavState';

/** إعادة تصدير النوع للشفرات التي تستورد من هذا الملف تقليدياً. */
export type { SignupSuccessLocationState };

const REDIRECT_SECONDS = 5;

function resolveSignupSuccessState(
  raw: unknown,
): SignupSuccessLocationState | null {
  if (!raw || typeof raw !== 'object' || !('flow' in raw)) return null;
  const s = raw as SignupSuccessLocationState;
  if (s.flow === 'pending_doctor') return s;
  if (
    s.flow === 'session_ready' &&
    typeof s.redirectTo === 'string' &&
    s.redirectTo.trim()
  ) {
    return s;
  }
  return null;
}

export default function SignupSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<SignupSuccessLocationState | null>(null);
  const [resolved, setResolved] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  /** يمنع الإبقاء على pendingOTP في الجلسة بعد نجاح التحقق من شاشة الـ OTP. */
  const clearedPendingRef = useRef(false);

  useLayoutEffect(() => {
    const fromHistory = resolveSignupSuccessState(location.state);
    if (fromHistory) {
      setState(fromHistory);
      clearSignupSuccessNavState();
    } else {
      setState(peekSignupSuccessNavState());
    }
    setResolved(true);
  }, [location.state, location.key]);

  useEffect(() => {
    if (!state) return undefined;
    if (clearedPendingRef.current) return undefined;
    clearedPendingRef.current = true;
    useAuthStore.getState().setPendingVerification(null);
    return undefined;
  }, [state]);

  useEffect(() => {
    if (!state || state.flow !== 'session_ready') return undefined;
    const tick = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    const go = setTimeout(() => {
      navigate(state.redirectTo, { replace: true });
    }, REDIRECT_SECONDS * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(go);
    };
  }, [state, navigate]);

  useEffect(() => {
    if (!state || state.flow !== 'pending_doctor') return undefined;
    const go = setTimeout(() => {
      navigate('/login', { replace: true });
    }, REDIRECT_SECONDS * 1000);
    return () => clearTimeout(go);
  }, [state, navigate]);

  if (!resolved) {
    return null;
  }

  if (!state) {
    return <Navigate to='/welcome' replace />;
  }

  if (state.flow === 'pending_doctor') {
    return (
      <>
        <Helmet>
          <title>Signup Success • LMJ Health</title>
        </Helmet>
        <AuthBackground>
          <SignupSuccess
            title={state.title ?? 'تم تأكيد رمز التسجيل'}
            message={
              state.message ??
              'تم التحقق من الرمز وفق الخادم. حساب الطبيب قيد موافقة الإدارة قبل تفعيله بالكامل في المنصة؛ يمكنك لاحقاً تسجيل الدخول عند التفعيل.'
            }
            continueLabel='تسجيل الدخول'
            onContinue={() => navigate('/login', { replace: true })}
          />
          <p className='mx-auto mt-4 max-w-[520px] text-center font-cairo text-[12px] font-semibold text-[#667085]'>
            سيتم تحويلك تلقائياً إلى تسجيل الدخول خلال {REDIRECT_SECONDS} ثوانٍ…
          </p>
        </AuthBackground>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Signup Success • LMJ Health</title>
      </Helmet>
      <AuthBackground>
        <SignupSuccess
          title={state.title ?? "اكتمل التحقق"}
          message={
            state.message ??
            "تم إنشاء الحساب بنجاح؛ يُرجى الأنتظار حتى يتم التحقق من حسابك من قبل الأدمن   ."
          }
          continueLabel="الذهاب للصفحة الرئيسية"
          onContinue={() => navigate(state.redirectTo, { replace: true })}
        />
        <p className="mx-auto mt-4 max-w-[520px] text-center font-cairo text-[12px] font-semibold text-[#667085]">
          سيتم تحويلك تلقائياً خلال {secondsLeft} ثانية…
        </p>
      </AuthBackground>
    </>
  );
}
