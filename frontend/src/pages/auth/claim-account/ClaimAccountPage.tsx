import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import AuthBackground from '@/components/auth/AuthBackground';
import ForgotPasswordRequest from '@/components/auth/password/forgot-password-request';
import ClaimAccountVerifyForm from '@/components/auth/claim/claim-account-verify-form';
import { authApi } from '@/lib/auth/client';
import {
  clearClaimAccountPending,
  peekClaimAccountPending,
  persistClaimAccountPending,
  type ClaimAccountPending,
} from '@/lib/auth/claimAccountNavState';
import { normalizeTokenPair } from '@/lib/auth/session';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import { ApiError } from '@/lib/api';
import { getRoleRoot, type AppRole } from '@/routes/ProtectedRoute';
import { normalizeAuthPhoneIdentifier } from '@/lib/phone/normalizeAuthPhone';

type ClaimStep = 'request' | 'verify';

export default function ClaimAccountPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const initialPending = peekClaimAccountPending();
  const [step, setStep] = useState<ClaimStep>('request');
  const [pending, setPending] = useState<ClaimAccountPending | null>(null);

  const handleRequest = async (values: {
    method: 'phone' | 'email';
    identifier: string;
  }) => {
    const identifier =
      values.method === 'phone'
        ? normalizeAuthPhoneIdentifier(values.identifier)
        : values.identifier.trim();

    const body =
      values.method === 'email'
        ? ({ channel: 'email' as const, email: identifier })
        : ({ channel: 'whatsapp' as const, phone: identifier });

    try {
      const response = await authApi.requestClaimAccount(body);
      const nextPending: ClaimAccountPending = {
        channel: body.channel,
        email: body.channel === 'email' ? body.email : undefined,
        phone: body.channel === 'whatsapp' ? body.phone : undefined,
        destination: identifier,
        fullName: response.fullName,
      };

      persistClaimAccountPending(nextPending);
      setPending(nextPending);
      setStep('verify');

      toast('تم إرسال رمز تفعيل الحساب.', {
        title: 'تحقّق من بريدك/هاتفك',
        variant: 'success',
        durationMs: 3800,
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'تعذّر إرسال رمز التفعيل. حاول مجدداً.';
      throw new Error(message);
    }
  };

  return (
    <>
      <Helmet>
        <title>Claim Account • LMJ Health</title>
      </Helmet>

      <AuthBackground>
        {step === 'request' || !pending ? (
          <ForgotPasswordRequest
            variant='plain'
            title="تفعيل حسابك"
            subtitle="حسابك موجود لكنه غير مفعّل بعد. أدخل بياناتك لاستلام رمز التفعيل وتعيين كلمة مرور."
            submitLabel="إرسال رمز التفعيل"
            defaultMethod={
              initialPending?.channel === 'whatsapp' ? 'phone' : 'email'
            }
            defaultIdentifier={initialPending?.destination ?? ''}
            onBack={() => navigate('/login')}
            onSubmit={handleRequest}
          />
        ) : (
          <ClaimAccountVerifyForm
            destination={pending.destination}
            onBack={() => {
              setStep('request');
            }}
            onResend={async () => {
              const body =
                pending.channel === 'email'
                  ? ({ channel: 'email' as const, email: pending.email! })
                  : ({
                      channel: 'whatsapp' as const,
                      phone: pending.phone!,
                    });

              await authApi.requestClaimAccount(body);
            }}
            onSubmit={async (values) => {
              const body =
                pending.channel === 'email'
                  ? {
                      channel: 'email' as const,
                      email: pending.email!,
                      otp: values.code,
                      password: values.password,
                      clientType: 'web' as const,
                    }
                  : {
                      channel: 'whatsapp' as const,
                      phone: pending.phone!,
                      otp: values.code,
                      password: values.password,
                      clientType: 'web' as const,
                    };

              const raw = (await authApi.verifyClaimAccount(body)) as Record<
                string,
                unknown
              >;

              const pair = normalizeTokenPair(raw);
              if (!pair || raw.userId == null) {
                throw new Error('استجابة غير متوقعة من الخادم.');
              }

              useAuthStore.getState().applySession(pair, {
                userId:
                  typeof raw.userId === 'string'
                    ? raw.userId
                    : String(raw.userId),
                role: 'patient',
                fullName:
                  typeof raw.fullName === 'string'
                    ? raw.fullName
                    : pending.fullName ?? '',
                email:
                  typeof raw.email === 'string'
                    ? raw.email
                    : pending.email ?? '',
                phone:
                  typeof raw.phone === 'string'
                    ? raw.phone
                    : pending.phone ?? '',
                actorIds:
                  typeof raw.actorIds === 'object' && raw.actorIds !== null
                    ? (raw.actorIds as Record<string, string | null>)
                    : {},
                patientPublicId:
                  typeof raw.patientPublicId === 'string'
                    ? raw.patientPublicId
                    : null,
                accountStatus: 'active',
              });

              clearClaimAccountPending();

              toast('تم تفعيل حسابك بنجاح. مرحباً بك.', {
                title: 'تم التفعيل',
                variant: 'success',
                durationMs: 4200,
              });

              navigate(getRoleRoot('patient' as AppRole), { replace: true });
            }}
          />
        )}
      </AuthBackground>
    </>
  );
}
