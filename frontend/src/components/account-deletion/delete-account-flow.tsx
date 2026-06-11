import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DeleteAccountConfirmDialog,
  DeleteAccountFeedbackStep,
  DeleteAccountMechanismStep,
  DeleteAccountOtpStep,
  DeleteAccountPasswordStep,
  DeleteAccountShell,
  DeleteAccountSuccessStep,
} from '@/components/account-deletion';
import { useToast } from '@/components/ui/ToastProvider';
import { getAccountDeletionCapabilities } from '@/lib/auth/accountDeletionCapabilities';
import {
  isAccountDeletionOtpError,
  isAccountDeletionPasswordError,
  mapAccountDeletionGenericError,
  mapAccountDeletionOtpError,
  mapAccountDeletionPasswordError,
} from '@/lib/auth/accountDeletionErrors';
import {
  accountDeletionApi,
  confirmDeletionAndRequest,
  sendDeletionOtp,
  startDoctorAccountRecoveryOtp,
  verifyDeletionPassword,
  verifyDoctorAccountRecoveryOtp,
} from '@/lib/auth/accountDeletionClient';
import {
  clearAccountDeletionSessionMeta,
  persistAccountDeletionSessionMeta,
  resolveRestorePath,
} from '@/lib/auth/accountDeletionSession';
import { getRoleRoot } from '@/routes/ProtectedRoute';
import type {
  AccountDeletionReasonCode,
  AccountDeletionScope,
  DoctorRecoveryChannel,
  DoctorRecoveryIdentity,
} from '@/lib/auth/accountDeletionTypes';
import { readAuthUser } from '@/lib/cookies';
import { useAuthStore } from '@/store/authStore';

type DeleteAccountStep = 1 | 2 | 3 | 4 | 5;

/** تأكيد نهائي فقط: حذف الحساب أو استعادته برمز OTP. */
type PendingConfirm =
  | { kind: 'delete-final'; otp?: string }
  | { kind: 'restore-otp'; otp: string }
  | null;

type FeedbackDraft = {
  reasonCode?: AccountDeletionReasonCode;
  feedback?: string;
};

function formatRecoverUntil(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function resolveReasonText(input?: FeedbackDraft): string | undefined {
  const labels: Record<AccountDeletionReasonCode, string> = {
    privacy: 'مخاوف تتعلق بالخصوصية',
    not_useful: 'التطبيق غير مفيد لي',
    better_alternative: 'وجدت بديل أفضل',
    technical: 'مشاكل تقنية',
    other: 'أسباب أخرى',
  };

  const parts = [
    input?.reasonCode ? labels[input.reasonCode] : '',
    input?.feedback?.trim() ?? '',
  ].filter(Boolean);

  return parts.length ? parts.join(' — ') : undefined;
}

export function DeleteAccountFlow({
  scope,
  cancelHref = '/doctor/profile-settings',
  homeHref = '/welcome',
  restoreHref: restoreHrefProp,
}: {
  scope: AccountDeletionScope;
  cancelHref?: string;
  homeHref?: string;
  restoreHref?: string;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const authUser = readAuthUser();

  const [step, setStep] = useState<DeleteAccountStep>(1);
  const [password, setPassword] = useState('');
  const [feedbackDraft, setFeedbackDraft] = useState<FeedbackDraft>({});
  const [otpChannel, setOtpChannel] = useState<'email' | 'whatsapp'>('email');
  const [otpDestination, setOtpDestination] = useState(
    authUser?.email?.trim() || authUser?.phone?.trim() || '',
  );
  const [otpRequired, setOtpRequired] = useState(true);
  const [recoverUntilLabel, setRecoverUntilLabel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);
  const [restoreOtpMode, setRestoreOtpMode] = useState(false);
  const [recoveryIdentity, setRecoveryIdentity] =
    useState<DoctorRecoveryIdentity | null>(null);
  const [restoreOtpDestination, setRestoreOtpDestination] = useState('');
  const [restoreOtpChannel, setRestoreOtpChannel] =
    useState<DoctorRecoveryChannel>('email');

  const caps = getAccountDeletionCapabilities(scope);
  const restoreHref = restoreHrefProp ?? resolveRestorePath(scope);
  const dashboardHref = getRoleRoot(scope === 'patient' ? 'patient' : 'doctor');

  const subtitle = useMemo(() => {
    if (restoreOtpMode) return 'استعادة الحساب';
    if (step === 4) return 'عملية لا يمكن التراجع عنها';
    return undefined;
  }, [step, restoreOtpMode]);

  const handleError = (
    cause: unknown,
    fallback: string,
    stepKind?: 'password' | 'otp' | 'restore-otp' | 'resend',
  ) => {
    if (stepKind === 'password' && isAccountDeletionPasswordError(cause)) {
      setError(mapAccountDeletionPasswordError(cause));
      return;
    }
    if (
      (stepKind === 'otp' || stepKind === 'restore-otp' || stepKind === 'resend') &&
      isAccountDeletionOtpError(cause)
    ) {
      setError(mapAccountDeletionOtpError(cause));
      return;
    }
    setError(mapAccountDeletionGenericError(cause, fallback));
  };

  const persistDeletionResult = (response: {
    status: string;
    recoverUntil?: string | null;
    requestedAt?: string | null;
  }) => {
    persistAccountDeletionSessionMeta({
      status:
        response.status === 'requested' || response.status === 'pending'
          ? response.status
          : 'requested',
      recoverUntil: response.recoverUntil ?? null,
      requestedAt: response.requestedAt ?? null,
    });
  };

  const dispatchOtp = async (channel: 'email' | 'whatsapp' = otpChannel) => {
    const response = await sendDeletionOtp(scope, {
      currentPassword: password,
      channel,
    });

    const destination =
      response.destination?.trim() ||
      (channel === 'whatsapp'
        ? authUser?.phone?.trim()
        : authUser?.email?.trim()) ||
      otpDestination;

    setOtpDestination(destination);
    if (response.channel) setOtpChannel(response.channel);

    const deletionCaps = getAccountDeletionCapabilities(scope);
    const requiresOtp = deletionCaps.sendOtp
      ? response.otpSent !== false &&
        (Boolean(response.destination) ||
          !response.message?.toLowerCase().includes('optional'))
      : false;

    setOtpRequired(requiresOtp);
    return requiresOtp;
  };

  const dispatchRestoreOtp = async (
    channel: DoctorRecoveryChannel = restoreOtpChannel,
  ) => {
    const result = await startDoctorAccountRecoveryOtp(channel);
    setRecoveryIdentity(result.identity);
    setRestoreOtpDestination(result.destination);
    setRestoreOtpChannel(result.identity.channel);
    return result;
  };

  const submitDeletionRequest = async (otp?: string) => {
    const response = await confirmDeletionAndRequest(scope, {
      currentPassword: password,
      otp: otpRequired ? otp : undefined,
      reasonCode: feedbackDraft.reasonCode,
      feedback: feedbackDraft.feedback,
      reason: resolveReasonText(feedbackDraft),
    });
    persistDeletionResult(response);
    setRecoverUntilLabel(formatRecoverUntil(response.recoverUntil));
    setStep(5);
  };

  const handlePasswordContinue = async (value: string) => {
    setBusy(true);
    setError(null);
    try {
      await verifyDeletionPassword(scope, value);
      setPassword(value);
      setStep(3);
    } catch (cause) {
      handleError(cause, 'تعذّر التحقق من كلمة المرور.', 'password');
    } finally {
      setBusy(false);
    }
  };

  const handleFeedbackContinue = async (input?: FeedbackDraft) => {
    setBusy(true);
    setError(null);
    setFeedbackDraft(input ?? {});
    try {
      const requiresOtp = await dispatchOtp();
      if (requiresOtp) {
        setStep(4);
        return;
      }
      setPendingConfirm({ kind: 'delete-final' });
    } catch (cause) {
      handleError(cause, 'تعذّر إرسال رمز التحقق.');
    } finally {
      setBusy(false);
    }
  };

  const executeConfirm = async () => {
    if (!pendingConfirm) return;

    setBusy(true);
    setError(null);

    try {
      if (pendingConfirm.kind === 'delete-final') {
        await submitDeletionRequest(pendingConfirm.otp);
        setPendingConfirm(null);
        return;
      }

      if (pendingConfirm.kind === 'restore-otp') {
        if (!recoveryIdentity) {
          throw new Error('missing recovery identity');
        }
        await verifyDoctorAccountRecoveryOtp({
          identity: recoveryIdentity,
          otp: pendingConfirm.otp,
        });
        clearAccountDeletionSessionMeta();
        toast('تم استعادة حسابك بنجاح.', {
          title: 'مرحباً بعودتك',
          variant: 'success',
        });
        setRestoreOtpMode(false);
        setPendingConfirm(null);
        navigate(dashboardHref, { replace: true });
      }
    } catch (cause) {
      handleError(
        cause,
        pendingConfirm.kind === 'restore-otp'
          ? 'تعذّر التحقق من رمز الاسترجاع.'
          : 'تعذّر إكمال طلب الحذف.',
        pendingConfirm.kind === 'restore-otp' ? 'restore-otp' : 'otp',
      );
      setPendingConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const confirmCopy = (() => {
    if (!pendingConfirm) return null;

    if (pendingConfirm.kind === 'restore-otp') {
      return {
        title: 'تأكيد استعادة الحساب',
        description:
          'بعد التحقق من الرمز سيتم إلغاء طلب الحذف واستعادة حسابك. هل تريد المتابعة؟',
        confirmLabel: 'نعم، استعادة الحساب',
      };
    }

    return {
      title: 'تأكيد حذف الحساب نهائياً',
      description:
        'سيُقدَّم طلب الحذف ويدخل حسابك حالة «بانتظار الحذف» لمدة 7 أيام. هل أنت متأكد؟',
      confirmLabel: 'تأكيد الحذف',
    };
  })();

  const handleOtpResend = async () => {
    if (!password) return;
    setResendBusy(true);
    setError(null);
    try {
      await dispatchOtp(otpChannel);
      toast('أُعيد إرسال رمز التحقق.', {
        title: 'تم الإرسال',
        variant: 'success',
      });
    } catch (cause) {
      handleError(cause, 'تعذّر إعادة إرسال الرمز.', 'resend');
    } finally {
      setResendBusy(false);
    }
  };

  const handleChangeChannel = async () => {
    const next = otpChannel === 'email' ? 'whatsapp' : 'email';
    setOtpChannel(next);
    if (!password) return;
    setResendBusy(true);
    setError(null);
    try {
      await dispatchOtp(next);
      toast('تم إرسال الرمز عبر القناة الجديدة.', {
        title: 'تم التحديث',
        variant: 'success',
      });
    } catch (cause) {
      handleError(cause, 'تعذّر تغيير قناة التحقق.', 'resend');
    } finally {
      setResendBusy(false);
    }
  };

  const handleRestoreOtpResend = async () => {
    setResendBusy(true);
    setError(null);
    try {
      await dispatchRestoreOtp(restoreOtpChannel);
      toast('أُعيد إرسال رمز التحقق.', {
        title: 'تم الإرسال',
        variant: 'success',
      });
    } catch (cause) {
      handleError(cause, 'تعذّر إعادة إرسال الرمز.', 'resend');
    } finally {
      setResendBusy(false);
    }
  };

  const handleRestoreChangeChannel = async () => {
    const next: DoctorRecoveryChannel =
      restoreOtpChannel === 'email' ? 'whatsapp' : 'email';
    setRestoreOtpChannel(next);
    setResendBusy(true);
    setError(null);
    try {
      await dispatchRestoreOtp(next);
      toast('تم إرسال الرمز عبر القناة الجديدة.', {
        title: 'تم التحديث',
        variant: 'success',
      });
    } catch (cause) {
      handleError(cause, 'تعذّر تغيير قناة التحقق.', 'resend');
    } finally {
      setResendBusy(false);
    }
  };

  const handleRestoreAccount = async () => {
    setError(null);

    if (!caps.recoveryOtp) {
      setBusy(true);
      try {
        await accountDeletionApi.cancel(scope);
        clearAccountDeletionSessionMeta();
        toast('تم استعادة حسابك بنجاح.', {
          title: 'مرحباً بعودتك',
          variant: 'success',
        });
        navigate(dashboardHref, { replace: true });
      } catch (cause) {
        handleError(cause, 'تعذّر استعادة الحساب.');
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      await dispatchRestoreOtp();
      setRestoreOtpMode(true);
      toast('أُرسل رمز التحقق. أدخله لاستعادة حسابك.', {
        title: 'تحقق من الرمز',
        variant: 'info',
      });
    } catch (cause) {
      handleError(cause, 'تعذّر إرسال رمز الاسترجاع.');
    } finally {
      setBusy(false);
    }
  };

  const handleExitAfterDeletion = async () => {
    await useAuthStore.getState().logout({ skipRemoteRevoke: true });
    navigate(homeHref, { replace: true });
  };

  return (
    <>
      <DeleteAccountShell step={step} subtitle={subtitle}>
        {restoreOtpMode ? (
          <DeleteAccountOtpStep
            destination={restoreOtpDestination}
            busy={busy}
            resendBusy={resendBusy}
            error={error}
            title="استعادة الحساب"
            subtitle="أدخل رمز التحقق لإلغاء طلب الحذف واستعادة حسابك"
            verifyLabel="تأكيد الاستعادة"
            onVerify={(value) =>
              setPendingConfirm({ kind: 'restore-otp', otp: value })
            }
            onResend={handleRestoreOtpResend}
            onChangeChannel={handleRestoreChangeChannel}
            onBack={() => {
              setError(null);
              setRestoreOtpMode(false);
            }}
          />
        ) : null}

        {!restoreOtpMode && step === 1 ? (
          <DeleteAccountMechanismStep
            busy={busy}
            onContinue={() => setStep(2)}
            onCancel={() => navigate(cancelHref)}
          />
        ) : null}

        {!restoreOtpMode && step === 2 ? (
          <DeleteAccountPasswordStep
            busy={busy}
            error={error}
            onContinue={(value) => void handlePasswordContinue(value)}
            onBack={() => {
              setError(null);
              setStep(1);
            }}
          />
        ) : null}

        {!restoreOtpMode && step === 3 ? (
          <DeleteAccountFeedbackStep
            busy={busy}
            error={error}
            onSubmit={(input) => void handleFeedbackContinue(input)}
            onSkip={() => void handleFeedbackContinue()}
          />
        ) : null}

        {!restoreOtpMode && step === 4 ? (
          <DeleteAccountOtpStep
            destination={otpDestination}
            busy={busy}
            resendBusy={resendBusy}
            error={error}
            onVerify={(value) =>
              setPendingConfirm({ kind: 'delete-final', otp: value })
            }
            onResend={handleOtpResend}
            onChangeChannel={
              getAccountDeletionCapabilities(scope).sendOtp
                ? handleChangeChannel
                : undefined
            }
            onBack={() => {
              setError(null);
              setStep(3);
            }}
          />
        ) : null}

        {!restoreOtpMode && step === 5 ? (
          <DeleteAccountSuccessStep
            recoverUntilLabel={recoverUntilLabel}
            busy={busy}
            restoreHref={restoreHref}
            onRestore={() => void handleRestoreAccount()}
            onGoHome={() => void handleExitAfterDeletion()}
          />
        ) : null}
      </DeleteAccountShell>

      {confirmCopy ? (
        <DeleteAccountConfirmDialog
          open={Boolean(pendingConfirm)}
          onOpenChange={(open) => {
            if (!open && !busy) setPendingConfirm(null);
          }}
          title={confirmCopy.title}
          description={confirmCopy.description}
          confirmLabel={confirmCopy.confirmLabel}
          busy={busy}
          onConfirm={executeConfirm}
        />
      ) : null}
    </>
  );
}
