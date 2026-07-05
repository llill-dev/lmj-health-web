import { AlertTriangle, RotateCcw, UserCheck } from "lucide-react";
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
  doctorRestoreRequestApi,
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

function formatRecoverUntil(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type RestoreView = "info" | "otp";

export default function RestoreAccountPage() {
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
  const [offboardedMessage, setOffboardedMessage] = useState("");

  const guestRecoveryMode = !authUser && Boolean(pendingRecovery);
  const isOffboarded = pendingRecovery?.lifecycleAction === "offboarded";

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
      setRecoverUntil(formatRecoverUntil(pendingRecovery.recoverUntil));
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
        setRecoverUntil(formatRecoverUntil(response.recoverUntil));
      } catch {
        if (cancelled) return;
        const sessionMeta = readAccountDeletionSessionMeta();
        if (sessionMeta) {
          setStatus(sessionMeta.status);
          setRecoverUntilRaw(sessionMeta.recoverUntil ?? null);
          setRecoverUntil(formatRecoverUntil(sessionMeta.recoverUntil));
        } else if (authUser?.accountDeletionStatus) {
          setStatus(
            normalizeAccountDeletionStatus(authUser.accountDeletionStatus),
          );
          setRecoverUntilRaw(authUser.deletionRecoverUntil ?? null);
          setRecoverUntil(
            formatRecoverUntil(authUser.deletionRecoverUntil ?? null),
          );
        } else if (pendingRecovery) {
          setStatus("requested");
          setRecoverUntilRaw(pendingRecovery.recoverUntil ?? null);
          setRecoverUntil(formatRecoverUntil(pendingRecovery.recoverUntil));
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
    toast("تم استعادة حسابك بنجاح. يمكنك تسجيل الدخول الآن.", {
      title: "مرحباً بعودتك",
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
    toast(
      "تم إرسال طلب الاستعادة. ستراجع الإدارة طلبك وستتواصل معك عند الموافقة.",
      {
        title: "طلب قيد المراجعة",
        variant: "success",
      },
    );
    navigate("/login", { replace: true });
  };

  const handleOffboardedRestoreStart = async () => {
    if (!offboardedMessage.trim()) {
      toast("يرجى كتابة رسالتك قبل الإرسال", {
        title: "رسالة مطلوبة",
        variant: "error",
      });
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const identity = resolveDoctorRecoveryIdentity({
        email: pendingRecovery?.email,
        phone: pendingRecovery?.phone,
      });

      const response = await doctorRestoreRequestApi.startOtp(identity);
      setRecoveryIdentity(identity);
      setOtpDestination(response.destination);
      setOtpChannel(identity.channel);
      setView("otp");
      toast("تم إرسال رمز التحقق إلى " + response.destination, {
        title: "تم الإرسال",
        variant: "success",
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "حدث خطأ أثناء إرسال الرمز",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleOffboardedRestoreVerify = async () => {
    if (!pendingOtp || !recoveryIdentity) return;

    setBusy(true);
    setError(null);

    try {
      await doctorRestoreRequestApi.verifyOtp({
        ...recoveryIdentity,
        otp: pendingOtp,
        reason: offboardedMessage,
      });

      setOtpConfirmOpen(false);
      setPendingOtp(null);
      clearAccountDeletionSessionMeta();
      clearPendingDoctorRecoveryLogin();
      toast("تم إرسال طلبك بنجاح. سيتم مراجعته من قبل الإدارة.", {
        title: "تم الإرسال",
        variant: "success",
      });
      navigate("/login", { replace: true });
    } catch (cause) {
      setOtpConfirmOpen(false);
      setPendingOtp(null);
      setError(cause instanceof Error ? cause.message : "رمز التحقق غير صحيح");
    } finally {
      setBusy(false);
    }
  };

  const executePatientRestore = async () => {
    setBusy(true);
    setError(null);
    try {
      await accountDeletionApi.cancel(scope);
      finishSelfRecoverySuccess();
    } catch (cause) {
      setError(mapAccountDeletionGenericError(cause, "تعذّر إلغاء طلب الحذف."));
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
          ? "أُرسل رمز التحقق. أدخله لتقديم طلب الاستعادة."
          : "أُرسل رمز التحقق. أدخله لإتمام استعادة حسابك.",
        {
          title: "تحقق من الرمز",
          variant: "info",
        },
      );
    } catch (cause) {
      setError(
        mapAccountDeletionGenericError(
          cause,
          isRestoreRequestMode
            ? "تعذّر إرسال رمز طلب الاستعادة."
            : "تعذّر إرسال رمز الاسترجاع.",
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
          setRecoverUntil(formatRecoverUntil(response.restoreRequestedAt));
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
              ? "تعذّر إرسال طلب الاستعادة."
              : "تعذّر التحقق من رمز الاسترجاع.",
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
      toast("أُعيد إرسال رمز التحقق.", {
        title: "تم الإرسال",
        variant: "success",
      });
    } catch (cause) {
      setError(
        mapAccountDeletionGenericError(cause, "تعذّر إعادة إرسال الرمز."),
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
      toast("تم إرسال الرمز عبر القناة الجديدة.", {
        title: "تم التحديث",
        variant: "success",
      });
    } catch (cause) {
      setError(
        mapAccountDeletionGenericError(cause, "تعذّر تغيير قناة التحقق."),
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
      ? "بعد التحقق من الرمز سيُرسل طلب الاستعادة للمراجعة الإدارية. هل تريد المتابعة؟"
      : "بعد التحقق من الرمز سيتم إلغاء طلب الحذف واستعادة حسابك. هل تريد المتابعة؟"
    : "هل تريد إلغاء طلب حذف الحساب واستعادته؟ سيتم إرسال طلب الإلغاء إلى الخادم فور التأكيد.";
  const confirmHandler = isOffboarded
    ? handleOffboardedRestoreVerify
    : isDoctorOtpFlow
      ? executeOtpVerify
      : executePatientRestoreConfirm;

  const infoSubtitle = isRestoreRequestMode
    ? "انتهت فترة الاسترجاع التلقائي (7 أيام). يمكنك تقديم طلب استعادة للمراجعة من الإدارة."
    : "يمكنك إلغاء طلب الحذف واستعادة حسابك خلال فترة الاسترجاع (7 أيام)";

  const restoreButtonLabel = isRestoreRequestMode
    ? "تقديم طلب الاستعادة"
    : "إلغاء طلب الحذف واستعادة الحساب";

  return (
    <>
      <Helmet>
        <title>استعادة الحساب • LMJ Health</title>
      </Helmet>

      <DeleteAccountShell step={1}>
        {view === "otp" ? (
          <DeleteAccountOtpStep
            destination={otpDestination}
            busy={busy}
            resendBusy={resendBusy}
            error={error}
            title={
              isRestoreRequestMode ? "طلب استعادة الحساب" : "استعادة الحساب"
            }
            subtitle={
              isRestoreRequestMode
                ? "أدخل رمز التحقق لتقديم طلب الاستعادة للمراجعة الإدارية"
                : "أدخل رمز التحقق لإلغاء طلب الحذف واستعادة حسابك"
            }
            verifyLabel={
              isRestoreRequestMode ? "تأكيد طلب الاستعادة" : "تأكيد الاستعادة"
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
            {isOffboarded ? (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FCD34D]">
                  <AlertTriangle
                    className="h-6 w-6 text-[#92400E]"
                    aria-hidden
                  />
                </div>

                <h2 className="font-cairo text-[18px] font-extrabold text-[#92400E]">
                  حسابك موقوف من قبل الإدارة
                </h2>
                <p className="mt-2 font-cairo text-[14px] font-semibold leading-relaxed text-[#78350F]">
                  تم إيقاف حسابك من قبل المشرف. لاستعادة حسابك، يرجى تقديم طلب
                  للإدارة عبر النموذج أدناه.
                </p>

                <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-right">
                  <label className="mb-2 block font-cairo text-[13px] font-extrabold text-[#111827]">
                    رسالتك للإدارة <span className="text-[#F04438]">*</span>
                  </label>
                  <textarea
                    value={offboardedMessage}
                    onChange={(e) => setOffboardedMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا... يرجى توضيح سبب طلب استعادة الحساب وأي معلومات إضافية قد تساعد الإدارة في مراجعة طلبك."
                    rows={4}
                    className="w-full rounded-xl border border-[#D0D5DD] bg-white px-4 py-3 font-cairo text-[14px] font-semibold text-[#111827] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed resize-none"
                    disabled={busy}
                  />
                </div>

                {error ? (
                  <p
                    role="alert"
                    className="mt-3 text-right font-cairo text-[12px] font-bold leading-[20px] text-[#DC2626]"
                  >
                    {error}
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={busy}
                  onClick={handleOffboardedRestoreStart}
                  className="mt-6 flex h-[48px] w-full items-center justify-center gap-2 rounded-[10px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)] transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>جارٍ الإرسال...</span>
                    </>
                  ) : (
                    <span>إرسال طلب الاستعادة</span>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#DCFCE7]">
                  <UserCheck className="h-6 w-6 text-[#16A34A]" aria-hidden />
                </div>

                <h2 className="font-cairo text-[18px] font-extrabold text-[#111827]">
                  {isRestoreRequestMode
                    ? "طلب استعادة الحساب"
                    : "استعادة الحساب"}
                </h2>
                <p className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
                  {infoSubtitle}
                </p>

                {guestRecoveryMode ? (
                  <p className="mt-3 rounded-[10px] bg-[#EFF6FF] px-4 py-3 font-cairo text-[12px] font-semibold text-[#1D4ED8]">
                    {isRestoreRequestMode
                      ? "تم التعرف على حسابك. أكّد هويتك برمز التحقق لتقديم طلب الاستعادة."
                      : "تم التعرف على حسابك في فترة الاسترجاع. أكّد هويتك برمز التحقق لإتمام الاستعادة."}
                  </p>
                ) : null}

                {loading ? (
                  <p className="mt-6 font-cairo text-[13px] font-semibold text-[#667085]">
                    جارٍ التحقق من حالة الحساب…
                  </p>
                ) : null}

                {!loading && canRestore ? (
                  <>
                    {!isRestoreRequestMode && recoverUntil ? (
                      <p className="mt-4 rounded-[10px] bg-[#FFFBEB] px-4 py-3 font-cairo text-[12px] font-semibold text-[#92400E]">
                        آخر موعد للاسترجاع: {recoverUntil}
                      </p>
                    ) : null}

                    {isRestoreRequestMode ? (
                      <p className="mt-4 rounded-[10px] bg-[#EFF6FF] px-4 py-3 font-cairo text-[12px] font-semibold text-[#1D4ED8]">
                        بعد التحقق سيُراجع فريق الإدارة طلبك ويعيد تفعيل حسابك
                        عند الموافقة.
                      </p>
                    ) : null}

                    {error ? (
                      <p
                        role="alert"
                        className="mt-3 text-right font-cairo text-[12px] font-bold leading-[20px] text-[#DC2626]"
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
                      لا يوجد طلب حذف نشط على حسابك.
                    </p>
                    <Link
                      to={getRoleRoot(
                        role === "patient" ? "patient" : "doctor",
                      )}
                      className="inline-flex h-[44px] items-center justify-center rounded-[10px] bg-primary px-6 font-cairo text-[13px] font-extrabold text-white"
                    >
                      الذهاب إلى لوحة التحكم
                    </Link>
                  </div>
                ) : null}

                {!loading &&
                !canRestore &&
                resolvedDeletionStatus !== "none" ? (
                  <p className="mt-6 font-cairo text-[13px] font-semibold text-[#DC2626]">
                    لا يمكن استعادة هذا الحساب حالياً. تواصل مع الدعم إذا كنت
                    تعتقد أن هذا خطأ.
                  </p>
                ) : null}

                <Link
                  to={authUser ? profileSettingsPath : "/login"}
                  className="mt-5 inline-block font-cairo text-[13px] font-extrabold text-[#667085] transition hover:text-[#111827]"
                >
                  {authUser
                    ? "الرجوع إلى الملف الشخصي ←"
                    : "العودة لتسجيل الدخول ←"}
                </Link>
              </>
            )}
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
          isRestoreRequestMode ? "تأكيد طلب الاستعادة" : "تأكيد استعادة الحساب"
        }
        description={confirmDescription}
        confirmLabel={
          isRestoreRequestMode ? "نعم، إرسال الطلب" : "نعم، استعادة الحساب"
        }
        busy={busy}
        onConfirm={confirmHandler}
      />
    </>
  );
}
