import { RotateCcw, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getRoleRoot } from "@/routes/ProtectedRoute";
import {
  DeleteAccountConfirmDialog,
  DeleteAccountOtpStep,
  DeleteAccountShell,
} from "@/components/account-deletion";
import { useToast } from "@/components/ui/ToastProvider";
import { getAccountDeletionCapabilities } from "@/lib/auth/accountDeletionCapabilities";
import {
  clearAccountDeletionSessionMeta,
  clearPendingDoctorRecoveryLogin,
  isAccountDeletionPending,
  isDoctorRestoreEligible,
  normalizeAccountDeletionStatus,
  peekPendingDoctorRecoveryLogin,
  readAccountDeletionSessionMeta,
  resolveDoctorRestoreMode,
  resolveRestorePath,
} from "@/lib/auth/accountDeletionSession";
import {
  accountDeletionApi,
  resolveAccountDeletionScope,
  resolveDoctorRecoveryIdentity,
  startDoctorAccountRecoveryOtp,
  startDoctorAccountRestoreRequestOtp,
  verifyDoctorAccountRecoveryOtp,
  verifyDoctorAccountRestoreRequestOtp,
} from "@/lib/auth/accountDeletionClient";
import {
  isAccountDeletionOtpError,
  mapAccountDeletionGenericError,
  mapAccountDeletionOtpError,
} from "@/lib/auth/accountDeletionErrors";
import type {
  DoctorRecoveryChannel,
  DoctorRecoveryIdentity,
} from "@/lib/auth/accountDeletionTypes";
import { readAuthUser } from "@/lib/cookies";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from "@/i18n/provider";

function formatRecoverUntil(
  value?: string | null,
  locale: "ar" | "en" = "ar",
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale === "en" ? "en-US" : "ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type RestoreView = "info" | "otp";

export default function RestoreAccountPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const authUser = readAuthUser();
  const accessToken = useAuthStore((state) => state.accessToken);
  const pendingRecovery = peekPendingDoctorRecoveryLogin();

  const role = authUser?.role ?? pendingRecovery?.role ?? "doctor";
  const restorePath = resolveRestorePath(role);
  const profileSettingsPath =
    role === "patient"
      ? "/patient/profile-settings"
      : "/doctor/profile-settings";

  const scope = useMemo(
    () =>
      resolveAccountDeletionScope(authUser?.role) ??
      (pendingRecovery?.role === "doctor" || pendingRecovery?.role === "patient"
        ? pendingRecovery.role
        : null),
    [authUser?.role, pendingRecovery],
  );

  const caps = scope ? getAccountDeletionCapabilities(scope) : null;

  const [view, setView] = useState<RestoreView>("info");
  const [recoverUntil, setRecoverUntil] = useState<string | null>(null);
  const [recoverUntilRaw, setRecoverUntilRaw] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpConfirmOpen, setOtpConfirmOpen] = useState(false);
  const [pendingOtp, setPendingOtp] = useState<string | null>(null);
  const [recoveryIdentity, setRecoveryIdentity] =
    useState<DoctorRecoveryIdentity | null>(null);
  const [otpDestination, setOtpDestination] = useState("");
  const [otpChannel, setOtpChannel] = useState<DoctorRecoveryChannel>("email");

  const guestRecoveryMode = !authUser && Boolean(pendingRecovery);

  const restoreMode = useMemo(() => {
    if (scope !== "doctor") return null;
    return resolveDoctorRestoreMode({
      lifecycleAction: pendingRecovery?.lifecycleAction,
      recoverUntil:
        recoverUntilRaw ??
        authUser?.deletionRecoverUntil ??
        pendingRecovery?.recoverUntil ??
        null,
    });
  }, [
    scope,
    pendingRecovery?.lifecycleAction,
    pendingRecovery?.recoverUntil,
    recoverUntilRaw,
    authUser?.deletionRecoverUntil,
  ]);

  const isRestoreRequestMode = restoreMode === "restore_request";

  useEffect(() => {
    if (!scope && !pendingRecovery) {
      setLoading(false);
      return;
    }

    if (guestRecoveryMode && pendingRecovery) {
      setStatus("requested");
      setRecoverUntilRaw(pendingRecovery.recoverUntil ?? null);
      setRecoverUntil(formatRecoverUntil(pendingRecovery.recoverUntil, locale));
      setLoading(false);
      return;
    }

    if (!scope) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await accountDeletionApi.getStatus(scope);
        if (cancelled) return;
        setStatus(normalizeAccountDeletionStatus(response.status));
        setRecoverUntilRaw(response.recoverUntil ?? null);
        setRecoverUntil(formatRecoverUntil(response.recoverUntil, locale));
      } catch {
        if (cancelled) return;
        const sessionMeta = readAccountDeletionSessionMeta();
        if (sessionMeta) {
          setStatus(sessionMeta.status);
          setRecoverUntilRaw(sessionMeta.recoverUntil ?? null);
          setRecoverUntil(formatRecoverUntil(sessionMeta.recoverUntil, locale));
        } else if (authUser?.accountDeletionStatus) {
          setStatus(
            normalizeAccountDeletionStatus(authUser.accountDeletionStatus),
          );
          setRecoverUntilRaw(authUser.deletionRecoverUntil ?? null);
          setRecoverUntil(
            formatRecoverUntil(authUser.deletionRecoverUntil ?? null, locale),
          );
        } else if (pendingRecovery) {
          setStatus("requested");
          setRecoverUntilRaw(pendingRecovery.recoverUntil ?? null);
          setRecoverUntil(formatRecoverUntil(pendingRecovery.recoverUntil, locale));
        } else {
          setStatus("none");
          setRecoverUntilRaw(null);
          setRecoverUntil(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    scope,
    guestRecoveryMode,
    pendingRecovery,
    authUser?.accountDeletionStatus,
    authUser?.deletionRecoverUntil,
  ]);

  if (!authUser && !pendingRecovery) {
    return (
      <Navigate to={`/login?next=${encodeURIComponent(restorePath)}`} replace />
    );
  }

  if (!scope) {
    return <Navigate to="/login" replace />;
  }

  const resolvedDeletionStatus = normalizeAccountDeletionStatus(
    status ?? authUser?.accountDeletionStatus,
  );

  if (
    !loading &&
    !guestRecoveryMode &&
    accessToken &&
    resolvedDeletionStatus === "none" &&
    !isRestoreRequestMode
  ) {
    const home =
      authUser?.role === "patient"
        ? getRoleRoot("patient")
        : getRoleRoot("doctor");
    return <Navigate to={home} replace />;
  }

  const finishSelfRecoverySuccess = () => {
    clearAccountDeletionSessionMeta();
    clearPendingDoctorRecoveryLogin();
    toast(t("accountDeletion.toast.restored.body"), {
      title: t("accountDeletion.toast.restored.title"),
      variant: "success",
    });
    if (accessToken) {
      navigate(getRoleRoot(role === "patient" ? "patient" : "doctor"), {
        replace: true,
      });
    } else {
      navigate("/login", { replace: true });
    }
  };

  const finishRestoreRequestSuccess = () => {
    clearAccountDeletionSessionMeta();
    clearPendingDoctorRecoveryLogin();
    toast(t("accountDeletion.toast.restoreRequested.body"), {
      title: t("accountDeletion.toast.restoreRequested.title"),
      variant: "success",
    });
    navigate("/login", { replace: true });
  };

  const executePatientRestore = async () => {
    setBusy(true);
    setError(null);
    try {
      await accountDeletionApi.cancel(scope);
      finishSelfRecoverySuccess();
    } catch (cause) {
      setError(
        mapAccountDeletionGenericError(
          cause,
          t("accountDeletion.restorePage.cancelDeletionFallback"),
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const dispatchDoctorOtp = async (
    channel: DoctorRecoveryChannel = otpChannel,
  ) => {
    const result = isRestoreRequestMode
      ? await startDoctorAccountRestoreRequestOtp(channel)
      : await startDoctorAccountRecoveryOtp(channel);
    setRecoveryIdentity(result.identity);
    setOtpDestination(result.destination);
    setOtpChannel(result.identity.channel);
    return result;
  };

  const executeDoctorRestoreStart = async () => {
    setBusy(true);
    setError(null);
    try {
      await dispatchDoctorOtp();
      setView("otp");
      toast(
        isRestoreRequestMode
          ? t("accountDeletion.toast.checkCode.restoreRequest")
          : t("accountDeletion.toast.checkCode.restore"),
        {
          title: t("accountDeletion.toast.checkCode.title"),
          variant: "info",
        },
      );
    } catch (cause) {
      setError(
        mapAccountDeletionGenericError(
          cause,
          isRestoreRequestMode
            ? t("accountDeletion.error.sendRestoreRequestOtp")
            : t("accountDeletion.error.sendRecoveryOtp"),
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleStartRestore = () => {
    setError(null);
    if (caps?.recoveryOtp || caps?.restoreRequestOtp) {
      void executeDoctorRestoreStart();
      return;
    }
    setOtpConfirmOpen(true);
  };

  const executeOtpVerify = async () => {
    if (!pendingOtp || !recoveryIdentity) return;

    setBusy(true);
    setError(null);
    try {
      if (isRestoreRequestMode) {
        const response = await verifyDoctorAccountRestoreRequestOtp({
          identity: recoveryIdentity,
          otp: pendingOtp,
        });
        if (response.restoreRequestedAt) {
          setStatus(response.status ?? "requested");
          setRecoverUntilRaw(null);
          setRecoverUntil(formatRecoverUntil(response.restoreRequestedAt, locale));
        }
        setOtpConfirmOpen(false);
        setPendingOtp(null);
        finishRestoreRequestSuccess();
        return;
      }

      await verifyDoctorAccountRecoveryOtp({
        identity: recoveryIdentity,
        otp: pendingOtp,
      });
      setOtpConfirmOpen(false);
      setPendingOtp(null);
      finishSelfRecoverySuccess();
    } catch (cause) {
      setOtpConfirmOpen(false);
      setPendingOtp(null);
      if (isAccountDeletionOtpError(cause)) {
        setError(mapAccountDeletionOtpError(cause));
      } else {
        setError(
          mapAccountDeletionGenericError(
            cause,
            isRestoreRequestMode
              ? t("accountDeletion.error.restoreRequest")
              : t("accountDeletion.error.verifyRecoveryOtp"),
          ),
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const executePatientRestoreConfirm = async () => {
    setOtpConfirmOpen(false);
    await executePatientRestore();
  };

  const handleOtpResend = async () => {
    setResendBusy(true);
    setError(null);
    try {
      await dispatchDoctorOtp(otpChannel);
      toast(t("accountDeletion.toast.otpResent.body"), {
        title: t("accountDeletion.toast.otpResent.title"),
        variant: "success",
      });
    } catch (cause) {
      setError(
        mapAccountDeletionGenericError(cause, t("accountDeletion.error.resendOtp")),
      );
    } finally {
      setResendBusy(false);
    }
  };

  const handleChangeChannel = async () => {
    const next: DoctorRecoveryChannel =
      otpChannel === "email" ? "whatsapp" : "email";
    setOtpChannel(next);
    setResendBusy(true);
    setError(null);
    try {
      await dispatchDoctorOtp(next);
      toast(t("accountDeletion.toast.channelChanged.body"), {
        title: t("accountDeletion.toast.channelChanged.title"),
        variant: "success",
      });
    } catch (cause) {
      setError(
        mapAccountDeletionGenericError(cause, t("accountDeletion.error.changeChannel")),
      );
    } finally {
      setResendBusy(false);
    }
  };

  const canRestore =
    scope === "patient"
      ? isAccountDeletionPending({
          accountDeletionStatus: resolvedDeletionStatus,
          recoverUntil: recoverUntilRaw,
        })
      : isDoctorRestoreEligible({
          accountDeletionStatus: resolvedDeletionStatus,
          recoverUntil: recoverUntilRaw,
          restoreMode: restoreMode ?? "self_recovery",
        }) || guestRecoveryMode;

  const isDoctorOtpFlow = Boolean(caps?.recoveryOtp || caps?.restoreRequestOtp);
  const confirmOpen = isDoctorOtpFlow
    ? otpConfirmOpen && Boolean(pendingOtp)
    : otpConfirmOpen;
  const confirmDescription = isDoctorOtpFlow
    ? isRestoreRequestMode
      ? t("accountDeletion.confirm.restoreRequest.description")
      : t("accountDeletion.confirm.restore.description")
    : t("accountDeletion.restorePage.confirmDialog.patientDescription");
  const confirmHandler = isDoctorOtpFlow
    ? executeOtpVerify
    : executePatientRestoreConfirm;

  const infoSubtitle = isRestoreRequestMode
    ? t("accountDeletion.restorePage.infoSubtitle.restoreRequest")
    : t("accountDeletion.restorePage.infoSubtitle.restore");

  const restoreButtonLabel = isRestoreRequestMode
    ? t("accountDeletion.restorePage.restoreButton.restoreRequest")
    : t("accountDeletion.restorePage.restoreButton.restore");

  return (
    <>
      <Helmet>
        <title>{t("accountDeletion.restorePage.title")} • LMJ Health</title>
      </Helmet>

      <DeleteAccountShell step={1}>
        {view === "otp" ? (
          <DeleteAccountOtpStep
            destination={otpDestination}
            busy={busy}
            resendBusy={resendBusy}
            error={error}
            title={
              isRestoreRequestMode
                ? t("accountDeletion.subtitle.restoreRequest")
                : t("accountDeletion.subtitle.restore")
            }
            subtitle={
              isRestoreRequestMode
                ? t("accountDeletion.otp.restoreRequest.subtitle")
                : t("accountDeletion.otp.restore.subtitle")
            }
            verifyLabel={
              isRestoreRequestMode
                ? t("accountDeletion.otp.restoreRequest.verifyLabel")
                : t("accountDeletion.otp.restore.verifyLabel")
            }
            onVerify={(value) => {
              setError(null);
              setPendingOtp(value);
              setOtpConfirmOpen(true);
            }}
            onResend={handleOtpResend}
            onChangeChannel={handleChangeChannel}
            onBack={() => {
              setError(null);
              setView("info");
            }}
          />
        ) : (
          <div className="text-center">
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#DCFCE7]">
                <UserCheck className="h-6 w-6 text-[#16A34A]" aria-hidden />
              </div>

              <h2 className="font-cairo text-[18px] font-extrabold text-[#111827]">
                {isRestoreRequestMode
                  ? t("accountDeletion.subtitle.restoreRequest")
                  : t("accountDeletion.subtitle.restore")}
              </h2>
              <p className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
                {infoSubtitle}
              </p>

              {guestRecoveryMode ? (
                <p className="mt-3 rounded-[10px] bg-[#EFF6FF] px-4 py-3 font-cairo text-[12px] font-semibold text-[#1D4ED8]">
                  {isRestoreRequestMode
                    ? t("accountDeletion.restorePage.guestBanner.restoreRequest")
                    : t("accountDeletion.restorePage.guestBanner.restore")}
                </p>
              ) : null}

              {loading ? (
                <p className="mt-6 font-cairo text-[13px] font-semibold text-[#667085]">
                  {t("accountDeletion.restorePage.checkingStatus")}
                </p>
              ) : null}

              {!loading && canRestore ? (
                <>
                  {!isRestoreRequestMode && recoverUntil ? (
                    <p className="mt-4 rounded-[10px] bg-[#FFFBEB] px-4 py-3 font-cairo text-[12px] font-semibold text-[#92400E]">
                      {t("accountDeletion.restorePage.recoverUntil").replace(
                        "{date}",
                        recoverUntil ?? "",
                      )}
                    </p>
                  ) : null}

                  {isRestoreRequestMode ? (
                    <p className="mt-4 rounded-[10px] bg-[#EFF6FF] px-4 py-3 font-cairo text-[12px] font-semibold text-[#1D4ED8]">
                      {t("accountDeletion.restorePage.restoreRequestNotice")}
                    </p>
                  ) : null}

                  {error ? (
                    <p
                      role="alert"
                      className="mt-3 text-start font-cairo text-[12px] font-bold leading-[20px] text-[#DC2626]"
                    >
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleStartRestore}
                    className="mt-6 flex h-[48px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#22C55E] font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(34,197,94,0.22)] transition hover:bg-[#16A34A] disabled:opacity-60"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    <span>{restoreButtonLabel}</span>
                  </button>
                </>
              ) : null}

              {!loading && status === "none" && !guestRecoveryMode ? (
                <div className="mt-6 space-y-4">
                  <p className="font-cairo text-[13px] font-semibold text-[#667085]">
                    {t("accountDeletion.restorePage.noActiveRequest")}
                  </p>
                  <Link
                    to={getRoleRoot(role === "patient" ? "patient" : "doctor")}
                    className="inline-flex h-[44px] items-center justify-center rounded-[10px] bg-primary px-6 font-cairo text-[13px] font-extrabold text-white"
                  >
                    {t("accountDeletion.restorePage.goToDashboard")}
                  </Link>
                </div>
              ) : null}

              {!loading && !canRestore && resolvedDeletionStatus !== "none" ? (
                <p className="mt-6 font-cairo text-[13px] font-semibold text-[#DC2626]">
                  {t("accountDeletion.restorePage.cannotRestore")}
                </p>
              ) : null}

              <Link
                to={authUser ? profileSettingsPath : "/login"}
                className="mt-5 inline-block font-cairo text-[13px] font-extrabold text-[#667085] transition hover:text-[#111827]"
              >
                {authUser
                  ? t("accountDeletion.restorePage.backToProfile")
                  : t("accountDeletion.restorePage.backToLogin")}
              </Link>
            </>
          </div>
        )}
      </DeleteAccountShell>

      <DeleteAccountConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!busy) {
            setOtpConfirmOpen(open);
            if (!open) setPendingOtp(null);
          }
        }}
        title={
          isRestoreRequestMode
            ? t("accountDeletion.confirm.restoreRequest.title")
            : t("accountDeletion.confirm.restore.title")
        }
        description={confirmDescription}
        confirmLabel={
          isRestoreRequestMode
            ? t("accountDeletion.confirm.restoreRequest.confirmLabel")
            : t("accountDeletion.confirm.restore.confirmLabel")
        }
        busy={busy}
        onConfirm={confirmHandler}
      />
    </>
  );
}
