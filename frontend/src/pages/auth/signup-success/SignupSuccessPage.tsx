import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import SignupSuccess from '@/components/auth/signUp/signup-success';
import AuthBackground from '@/components/auth/AuthBackground';
import { useAuthStore } from '@/store/authStore';

/** Route state after OTP verification (`VerifyOtpPage`). */
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

const REDIRECT_SECONDS = 5;

export default function SignupSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SignupSuccessLocationState | null;
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  /** يمنع الإبقاء على pendingOTP في الجلسة بعد نجاح التحقق من شاشة الـ OTP. */
  const clearedPendingRef = useRef(false);

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
