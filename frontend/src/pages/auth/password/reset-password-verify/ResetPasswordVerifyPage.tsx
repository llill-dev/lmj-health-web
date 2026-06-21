import { Helmet } from 'react-helmet-async';
import { Navigate, useNavigate } from 'react-router-dom';
import ResetPasswordVerifyForm from '@/components/auth/password/ResetPasswordVerifyForm';
import { authApi } from '@/lib/auth/client';
import {
  peekPasswordResetPending,
  persistPasswordResetToken,
} from '@/lib/auth/passwordResetNavState';
import { useToast } from '@/components/ui/ToastProvider';

export default function ResetPasswordVerifyPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const pending = peekPasswordResetPending();

  if (!pending) {
    return <Navigate to='/forgot-password' replace />;
  }

  return (
    <>
      <Helmet>
        <title>Verify Reset OTP • LMJ Health</title>
      </Helmet>

      <ResetPasswordVerifyForm
        destination={pending.destination}
        onBack={() => navigate('/forgot-password')}
        onResend={async () => {
          const body =
            pending.channel === 'email'
              ? ({ channel: 'email' as const, email: pending.email! })
              : ({
                  channel: 'whatsapp' as const,
                  phone: pending.phone!,
                });

          await authApi.resendResetOtp(body);
        }}
        onVerify={async (otp) => {
          const body: { email: string; otp: string; phone?: never } | { phone: string; otp: string; email?: never } =
            pending.channel === 'email'
              ? { email: pending.email!, otp, phone: undefined as never }
              : { phone: pending.phone!, otp, email: undefined as never };

          const response = await authApi.verifyResetOtp(body);

          persistPasswordResetToken({
            resetToken: response.resetToken,
            expiresInMinutes: response.expiresInMinutes,
            fullName: response.fullName ?? pending.fullName,
            email: response.email ?? pending.email,
            phone: response.phone ?? pending.phone,
          });

          toast('تم التحقق من الرمز. يمكنك الآن تعيين كلمة مرور جديدة.', {
            title: 'تم التحقق',
            variant: 'success',
            durationMs: 3600,
          });

          navigate('/reset-password', { replace: true });
        }}
      />
    </>
  );
}
