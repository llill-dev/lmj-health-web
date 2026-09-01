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
  startDoctorAccountRestoreRequestOtp,
  verifyDeletionPassword,
  verifyDoctorAccountRecoveryOtp,
  verifyDoctorAccountRestoreRequestOtp,
} from '@/lib/auth/accountDeletionClient';
import {
  clearAccountDeletionSessionMeta,
  persistAccountDeletionSessionMeta,
  resolveDoctorRestoreMode,
  resolveRestorePath,
} from '@/lib/auth/accountDeletionSession';
import { getRoleRoot } from '@/routes/ProtectedRoute';
import { useI18n } from '@/i18n/provider';
import type {
  AccountDeletionReasonCode,
  AccountDeletionScope,
  DoctorRecoveryChannel,
  DoctorRecoveryIdentity,
} from '@/lib/auth/accountDeletionTypes';
import { readAuthUser } from '@/lib/cookies';
import { useAuthStore } from '@/store/authStore';

type DeleteAccountStep = 1 | 2 | 3 | 4 | 5;

type PendingConfirm =
  | { kind: 'delete-final'; otp?: string }
  | { kind: 'restore-otp'; otp: string }
  | null;

type FeedbackDraft = {
  reasonCode?: AccountDeletionReasonCode;
  feedback?: string;
};

function formatRecoverUntil(
  value: string | null | undefined,
  locale: 'ar' | 'en',
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale === 'ar' ? 'ar-SY' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function resolveReasonText(
  input: FeedbackDraft | undefined,
  t: (key: string) => string,
): string | undefined {
  const labels: Record<AccountDeletionReasonCode, string> = {
    privacy: t('accountDeletion.reasons.privacy'),
    not_useful: t('accountDeletion.reasons.notUseful'),
    better_alternative: t('accountDeletion.reasons.betterAlternative'),
    technical: t('accountDeletion.reasons.technical'),
    other: t('accountDeletion.reasons.other'),
  };

  const parts = [
    input?.reasonCode ? labels[input.reasonCode] : '',
    input?.feedback?.trim() ?? '',
  ].filter(Boolean);

  return parts.length ? parts.join(' - ') : undefined;
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
  const { t, locale } = useI18n();
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
  const [recoverUntilRaw, setRecoverUntilRaw] = useState(
    authUser?.deletionRecoverUntil ?? null,
  );
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
  const doctorRestoreMode =
    scope === 'doctor'
      ? resolveDoctorRestoreMode({ recoverUntil: recoverUntilRaw })
      : null;
  const isDoctorRestoreRequestMode = doctorRestoreMode === 'restore_request';

  const subtitle = useMemo(() => {
    if (restoreOtpMode) {
      return isDoctorRestoreRequestMode
        ? t('accountDeletion.subtitle.restoreRequest')
        : t('accountDeletion.subtitle.restore');
    }
    if (step === 4) return t('accountDeletion.subtitle.irreversible');
    return undefined;
  }, [isDoctorRestoreRequestMode, restoreOtpMode, step, t]);

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
    const result = isDoctorRestoreRequestMode
      ? await startDoctorAccountRestoreRequestOtp(channel)
      : await startDoctorAccountRecoveryOtp(channel);
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
      reason: resolveReasonText(feedbackDraft, t),
    });
    persistDeletionResult(response);
    setRecoverUntilRaw(response.recoverUntil ?? null);
    setRecoverUntilLabel(formatRecoverUntil(response.recoverUntil, locale));
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
      handleError(cause, t('accountDeletion.error.passwordVerifyFailed'), 'password');
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
      handleError(cause, t('accountDeletion.error.otpSendFailed'));
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

        if (isDoctorRestoreRequestMode) {
          await verifyDoctorAccountRestoreRequestOtp({
            identity: recoveryIdentity,
            otp: pendingConfirm.otp,
          });
          clearAccountDeletionSessionMeta();
          await useAuthStore.getState().logout({ skipRemoteRevoke: true });
          toast(t('accountDeletion.toast.restoreRequestSentBody'), {
            title: t('accountDeletion.toast.restoreRequestSentTitle'),
            variant: 'success',
          });
          setRestoreOtpMode(false);
          setPendingConfirm(null);
          navigate('/login', { replace: true });
          return;
        }

        await verifyDoctorAccountRecoveryOtp({
          identity: recoveryIdentity,
          otp: pendingConfirm.otp,
        });
        clearAccountDeletionSessionMeta();
        toast(t('accountDeletion.toast.accountRestoredBody'), {
          title: t('accountDeletion.toast.accountRestoredTitle'),
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
          ? isDoctorRestoreRequestMode
            ? t('accountDeletion.error.restoreRequestFailed')
            : t('accountDeletion.error.restoreOtpVerifyFailed')
          : t('accountDeletion.error.deletionRequestFailed'),
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
      if (isDoctorRestoreRequestMode) {
        return {
          title: t('accountDeletion.confirm.restoreRequestTitle'),
          description: t('accountDeletion.confirm.restoreRequestDescription'),
          confirmLabel: t('accountDeletion.confirm.restoreRequestConfirm'),
        };
      }

      return {
        title: t('accountDeletion.confirm.restoreAccountTitle'),
        description: t('accountDeletion.confirm.restoreAccountDescription'),
        confirmLabel: t('accountDeletion.confirm.restoreAccountConfirm'),
      };
    }

    return {
      title: t('accountDeletion.confirm.deleteTitle'),
      description: t('accountDeletion.confirm.deleteDescription'),
      confirmLabel: t('accountDeletion.confirm.deleteConfirm'),
    };
  })();

  const handleOtpResend = async () => {
    if (!password) return;
    setResendBusy(true);
    setError(null);
    try {
      await dispatchOtp(otpChannel);
      toast(t('accountDeletion.toast.otpResentBody'), {
        title: t('accountDeletion.toast.otpResentTitle'),
        variant: 'success',
      });
    } catch (cause) {
      handleError(cause, t('accountDeletion.error.resendFailed'), 'resend');
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
      toast(t('accountDeletion.toast.channelChangedBody'), {
        title: t('accountDeletion.toast.channelChangedTitle'),
        variant: 'success',
      });
    } catch (cause) {
      handleError(cause, t('accountDeletion.error.channelChangeFailed'), 'resend');
    } finally {
      setResendBusy(false);
    }
  };

  const handleRestoreOtpResend = async () => {
    setResendBusy(true);
    setError(null);
    try {
      await dispatchRestoreOtp(restoreOtpChannel);
      toast(t('accountDeletion.toast.otpResentBody'), {
        title: t('accountDeletion.toast.otpResentTitle'),
        variant: 'success',
      });
    } catch (cause) {
      handleError(cause, t('accountDeletion.error.resendFailed'), 'resend');
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
      toast(t('accountDeletion.toast.channelChangedBody'), {
        title: t('accountDeletion.toast.channelChangedTitle'),
        variant: 'success',
      });
    } catch (cause) {
      handleError(cause, t('accountDeletion.error.channelChangeFailed'), 'resend');
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
        toast(t('accountDeletion.toast.accountRestoredBody'), {
          title: t('accountDeletion.toast.accountRestoredTitle'),
          variant: 'success',
        });
        navigate(dashboardHref, { replace: true });
      } catch (cause) {
        handleError(cause, t('accountDeletion.error.restoreFailed'));
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      await dispatchRestoreOtp();
      setRestoreOtpMode(true);
      toast(
        isDoctorRestoreRequestMode
          ? t('accountDeletion.toast.otpSentForRestoreRequest')
          : t('accountDeletion.toast.otpSentForRestore'),
        {
          title: t('accountDeletion.toast.verifyCodeTitle'),
          variant: 'info',
        },
      );
    } catch (cause) {
      handleError(
        cause,
        isDoctorRestoreRequestMode
          ? t('accountDeletion.error.restoreRequestOtpFailed')
          : t('accountDeletion.error.restoreOtpFailed'),
      );
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
            title={
              isDoctorRestoreRequestMode
                ? t('accountDeletion.subtitle.restoreRequest')
                : t('accountDeletion.subtitle.restore')
            }
            subtitle={
              isDoctorRestoreRequestMode
                ? t('accountDeletion.restoreOtp.requestSubtitle')
                : t('accountDeletion.restoreOtp.restoreSubtitle')
            }
            verifyLabel={
              isDoctorRestoreRequestMode
                ? t('accountDeletion.restoreOtp.requestVerifyLabel')
                : t('accountDeletion.restoreOtp.restoreVerifyLabel')
            }
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
