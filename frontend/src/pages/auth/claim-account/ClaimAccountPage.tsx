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
import { getRoleRoot, type AppRole } from '@/routes/ProtectedRoute';
import { normalizeAuthPhoneIdentifier } from '@/lib/phone/normalizeAuthPhone';
import { useI18n } from '@/i18n/provider';
import {
  getClaimAccountRequestErrorMessage,
  getClaimAccountVerifyErrorMessage,
} from '@/lib/auth/authFlowErrors';

type ClaimStep = 'request' | 'verify';

export default function ClaimAccountPage() {
  const { locale } = useI18n();
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

      toast(
        locale === 'ar'
          ? 'تم إرسال رمز تفعيل الحساب.'
          : 'The account activation code was sent.',
        {
          title:
            locale === 'ar'
              ? 'تحقق من بريدك أو هاتفك'
              : 'Check your email or phone',
          variant: 'success',
          durationMs: 3800,
        },
      );
    } catch (error) {
      throw new Error(getClaimAccountRequestErrorMessage(error, locale));
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
            title={locale === 'ar' ? 'تفعيل حسابك' : 'Activate your account'}
            subtitle={
              locale === 'ar'
                ? 'حسابك موجود لكنه غير مفعّل بعد. أدخل بياناتك لاستلام رمز التفعيل وتعيين كلمة مرور.'
                : 'Your account exists but is not activated yet. Enter your details to receive the activation code and set your password.'
            }
            submitLabel={
              locale === 'ar' ? 'إرسال رمز التفعيل' : 'Send activation code'
            }
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

              try {
                await authApi.requestClaimAccount(body);
              } catch (error) {
                throw new Error(getClaimAccountRequestErrorMessage(error, locale));
              }
            }}
            onSubmit={async (values) => {
              try {
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
                  throw new Error(
                    locale === 'ar'
                      ? 'استجابة غير متوقعة من الخادم. حاول مرة أخرى.'
                      : 'Unexpected server response. Please try again.',
                  );
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

                toast(
                  locale === 'ar'
                    ? 'تم تفعيل حسابك بنجاح.'
                    : 'Your account has been activated successfully.',
                  {
                    title: locale === 'ar' ? 'تم التفعيل' : 'Activated',
                    variant: 'success',
                    durationMs: 4200,
                  },
                );

                navigate(getRoleRoot('patient' as AppRole), { replace: true });
              } catch (error) {
                throw new Error(getClaimAccountVerifyErrorMessage(error, locale));
              }
            }}
          />
        )}
      </AuthBackground>
    </>
  );
}
