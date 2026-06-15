import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordRequest from '@/components/auth/password/forgot-password-request';
import { authApi } from '@/lib/auth/client';
import { persistPasswordResetPending } from '@/lib/auth/passwordResetNavState';
import { useToast } from '@/components/ui/ToastProvider';
import { ApiError } from '@/lib/api';
import { normalizeAuthPhoneIdentifier } from '@/lib/phone/normalizeAuthPhone';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <>
      <Helmet>
        <title>Forgot Password • LMJ Health</title>
      </Helmet>

      <ForgotPasswordRequest
        onBack={() => navigate('/login')}
        onSubmit={async (values) => {
          const identifier =
            values.method === 'phone'
              ? normalizeAuthPhoneIdentifier(values.identifier)
              : values.identifier.trim();

          const body =
            values.method === 'email'
              ? ({ channel: 'email' as const, email: identifier })
              : ({ channel: 'whatsapp' as const, phone: identifier });

          try {
            const response = await authApi.requestPasswordReset(body);
            persistPasswordResetPending({
              channel: body.channel,
              email: body.channel === 'email' ? body.email : undefined,
              phone: body.channel === 'whatsapp' ? body.phone : undefined,
              destination: identifier,
              fullName: response.fullName,
            });

            toast('تم إرسال رمز إعادة تعيين كلمة المرور.', {
              title: 'تحقّق من بريدك/هاتفك',
              variant: 'success',
              durationMs: 3800,
            });

            navigate('/reset-password/verify', { replace: true });
          } catch (error) {
            const message =
              error instanceof ApiError
                ? error.message
                : 'تعذّر إرسال رمز إعادة التعيين. حاول مجدداً.';
            throw new Error(message);
          }
        }}
      />
    </>
  );
}
