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
import { useI18n } from '@/i18n/provider';

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
  const { t } = useI18n();
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
          <title>{t('auth.page.signupSuccess.title')}</title>
        </Helmet>
        <AuthBackground>
          <SignupSuccess
            title={state.title ?? t('auth.signupSuccess.pending.title')}
            message={
              state.message ??
              t('auth.signupSuccess.pending.message')
            }
            continueLabel={t('auth.signupSuccess.pending.continue')}
            onContinue={() => navigate('/login', { replace: true })}
          />
          <p className='mx-auto mt-4 max-w-[520px] text-center font-cairo text-[12px] font-semibold text-[#667085]'>
            {t('auth.signupSuccess.pending.autoRedirect', `You will be redirected in ${REDIRECT_SECONDS} seconds…`).replace(
              '{seconds}',
              String(REDIRECT_SECONDS),
            )}
          </p>
        </AuthBackground>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('auth.page.signupSuccess.title')}</title>
      </Helmet>
      <AuthBackground>
        <SignupSuccess
          title={state.title ?? t("auth.signupSuccess.ready.title")}
          message={
            state.message ??
            t("auth.signupSuccess.ready.message")
          }
          continueLabel={t("auth.signupSuccess.ready.continue")}
          onContinue={() => navigate(state.redirectTo, { replace: true })}
        />
        <p className="mx-auto mt-4 max-w-[520px] text-center font-cairo text-[12px] font-semibold text-[#667085]">
          {t('auth.signupSuccess.ready.autoRedirect', 'Redirecting in {seconds} seconds…').replace(
            '{seconds}',
            String(secondsLeft),
          )}
        </p>
      </AuthBackground>
    </>
  );
}
