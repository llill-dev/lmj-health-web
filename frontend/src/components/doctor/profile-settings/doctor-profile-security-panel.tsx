"use client";

import { useState } from "react";
import { KeyRound, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import VerifyAccount from "@/components/auth/verify/verify-account";
import ConfirmActionDialog from "@/components/doctor/confirm-action-dialog";
import DoctorSecurityFormDialog from "@/components/doctor/profile-settings/doctor-security-form-dialog";
import {
  buildDoctorEmailChangeRequestSchema,
  buildDoctorPasswordChangeSchema,
  buildDoctorPhoneChangeRequestSchema,
  type DoctorEmailChangeRequestForm,
  type DoctorPasswordChangeForm,
  type DoctorPhoneChangeRequestForm,
} from "@/components/doctor/profile-settings/doctor-profile-security-schemas";
import { useToast } from "@/components/ui/ToastProvider";
import { resolveDeleteAccountPath } from "@/lib/auth/accountDeletionSession";
import { doctorSettingsApi } from "@/lib/doctor/settingsClient";
import { readAuthUser } from "@/lib/cookies";
import { useAuthStore } from "@/store/authStore";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/i18n/provider";

type PendingSecurityAction =
  | { kind: "password"; values: DoctorPasswordChangeForm }
  | { kind: "email"; values: DoctorEmailChangeRequestForm }
  | { kind: "phone"; values: DoctorPhoneChangeRequestForm };

async function forceReLogin(navigate: ReturnType<typeof useNavigate>) {
  await useAuthStore.getState().logout({ skipRemoteRevoke: true });
  navigate("/login", { replace: true });
}

export default function DoctorProfileSecurityPanel() {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<"closed" | "request" | "verify">(
    "closed",
  );
  const [phoneStep, setPhoneStep] = useState<"closed" | "request" | "verify">(
    "closed",
  );
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [pendingAction, setPendingAction] =
    useState<PendingSecurityAction | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const passwordForm = useForm<DoctorPasswordChangeForm>({
    resolver: zodResolver(buildDoctorPasswordChangeSchema(t)),
    mode: "onTouched",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const emailForm = useForm<DoctorEmailChangeRequestForm>({
    resolver: zodResolver(buildDoctorEmailChangeRequestSchema(t)),
    mode: "onTouched",
    defaultValues: { currentPassword: "", newEmail: "" },
  });

  const phoneForm = useForm<DoctorPhoneChangeRequestForm>({
    resolver: zodResolver(buildDoctorPhoneChangeRequestSchema(t)),
    mode: "onTouched",
    defaultValues: { currentPassword: "", newPhone: "" },
  });

  const handleApiError = (error: unknown, title: string) => {
    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : t("doctor.security.operationFailed");
    toast(message, { title, variant: "error", durationMs: 5200 });
  };

  const openConfirm = (action: PendingSecurityAction) => {
    setPendingAction(action);
    if (action.kind === "password") setPasswordOpen(false);
    if (action.kind === "email") setEmailStep("closed");
    if (action.kind === "phone") setPhoneStep("closed");
    setConfirmOpen(true);
  };

  const confirmCopy = (() => {
    if (!pendingAction) return null;
    if (pendingAction.kind === "password") {
      return {
        title: t("doctor.security.confirmPasswordChange"),
        description: <>{t("doctor.security.passwordChangeDesc")}</>,
        confirmLabel: t("doctor.security.confirmChange"),
      };
    }
    if (pendingAction.kind === "email") {
      return {
        title: t("doctor.security.confirmEmailChange"),
        description: (
          <>
            {t("doctor.security.sendVerificationTo")}{" "}
            <span className="font-extrabold text-[#101828]">
              {pendingAction.values.newEmail.trim()}
            </span>
            . {t("doctor.security.verifyEmailBefore")}
          </>
        ),
        confirmLabel: t("doctor.security.sendVerificationCode"),
      };
    }
    return {
      title: t("doctor.security.confirmPhoneChange"),
      description: (
        <>
          {t("doctor.security.sendVerificationTo")}{" "}
          <span className="font-extrabold text-[#101828]">
            {pendingAction.values.newPhone.replace(/[\s-]/g, "")}
          </span>
          . {t("doctor.security.verifyPhoneBefore")}
        </>
      ),
      confirmLabel: t("doctor.security.sendVerificationCode"),
    };
  })();

  const executePendingAction = async () => {
    if (!pendingAction) return;
    setConfirmBusy(true);
    try {
      if (pendingAction.kind === "password") {
        await doctorSettingsApi.changePassword({
          currentPassword: pendingAction.values.currentPassword,
          newPassword: pendingAction.values.newPassword,
        });
        toast(t("doctor.security.passwordUpdated"), {
          title: t("doctor.security.updated"),
          variant: "success",
        });
        setConfirmOpen(false);
        setPendingAction(null);
        passwordForm.reset();
        await forceReLogin(navigate);
        return;
      }

      if (pendingAction.kind === "email") {
        await doctorSettingsApi.requestEmailChange(pendingAction.values);
        setPendingEmail(pendingAction.values.newEmail.trim());
        setEmailStep("verify");
        toast(t("doctor.security.verificationCodeSent"), {
          title: t("doctor.security.checkEmail"),
          variant: "success",
        });
        setConfirmOpen(false);
        setPendingAction(null);
        return;
      }

      const phone = pendingAction.values.newPhone.replace(/[\s-]/g, "");
      await doctorSettingsApi.requestPhoneChange({
        currentPassword: pendingAction.values.currentPassword,
        newPhone: phone,
      });
      setPendingPhone(phone);
      setPhoneStep("verify");
      toast(t("doctor.security.verificationCodeSentPhone"), {
        title: t("doctor.security.checkWhatsApp"),
        variant: "success",
      });
      setConfirmOpen(false);
      setPendingAction(null);
    } catch (error) {
      if (pendingAction.kind === "password") {
        handleApiError(error, t("doctor.security.couldNotChangePassword"));
      } else if (pendingAction.kind === "email") {
        handleApiError(error, t("doctor.security.couldNotRequestEmailChange"));
      } else {
        handleApiError(error, t("doctor.security.couldNotRequestPhoneChange"));
      }
      throw error;
    } finally {
      setConfirmBusy(false);
    }
  };

  if (emailStep === "verify") {
    return (
      <VerifyAccount
        destination={pendingEmail}
        onBack={() => setEmailStep("request")}
        onResend={async () => {
          const values = emailForm.getValues();
          await doctorSettingsApi.requestEmailChange(values);
          toast(t("doctor.security.verificationCodeResent"), {
            title: t("doctor.security.sent"),
            variant: "success",
          });
        }}
        onVerify={async (otp) => {
          await doctorSettingsApi.confirmEmailChange({ otp });
          toast(t("doctor.security.emailUpdated"), {
            title: t("doctor.security.updated"),
            variant: "success",
          });
          setEmailStep("closed");
          await forceReLogin(navigate);
        }}
      />
    );
  }

  if (phoneStep === "verify") {
    return (
      <VerifyAccount
        destination={pendingPhone}
        onBack={() => setPhoneStep("request")}
        onResend={async () => {
          const values = phoneForm.getValues();
          const phone = values.newPhone.replace(/[\s-]/g, "");
          await doctorSettingsApi.requestPhoneChange({
            currentPassword: values.currentPassword,
            newPhone: phone,
          });
          toast(t("doctor.security.verificationCodeResent"), {
            title: t("doctor.security.sent"),
            variant: "success",
          });
        }}
        onVerify={async (otp) => {
          await doctorSettingsApi.confirmPhoneChange({ otp });
          toast(t("doctor.security.phoneUpdated"), {
            title: t("doctor.security.updated"),
            variant: "success",
          });
          setPhoneStep("closed");
          await forceReLogin(navigate);
        }}
      />
    );
  }

  return (
    <>
      <section
        dir={dir}
        lang={locale}
        className="mt-5 overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]"
      >
        <div className="border-b border-[#EEF2F6] px-6 py-4">
          <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
            {t("doctor.security.accountSecurity")}
          </div>
          <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
            {t("doctor.security.securityDesc")}
          </p>
        </div>
        <div className="divide-y divide-[#EEF2F6]">
          {[
            {
              key: "password",
              label: t("doctor.security.changePassword"),
              icon: KeyRound,
              onClick: () => setPasswordOpen(true),
            },
            {
              key: "email",
              label: t("doctor.security.changeEmail"),
              icon: Mail,
              onClick: () => setEmailStep("request"),
            },
            {
              key: "phone",
              label: t("doctor.security.changePhone"),
              icon: Phone,
              onClick: () => setPhoneStep("request"),
            },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className="flex w-full items-center justify-between px-6 py-4 text-start transition hover:bg-[#F9FAFB]"
            >
              <span className="flex items-center gap-3 font-cairo text-[13px] font-bold text-[#111827]">
                <item.icon className="h-4 w-4 text-primary" />
                {item.label}
              </span>
              <span className="font-cairo text-[13px] font-extrabold text-primary">
                {t("doctor.security.edit")}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section
        dir={dir}
        lang={locale}
        className="mt-5 overflow-hidden rounded-[6px] border border-[#FECACA] bg-[#FFFBFB] shadow-[0_18px_30px_rgba(0,0,0,0.06)]"
      >
        <div className="border-b border-[#FECACA] px-6 py-4">
          <div className="font-cairo text-[14px] font-extrabold text-[#B91C1C]">
            {t("doctor.security.dangerZone")}
          </div>
          <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
            {t("doctor.security.dangerZoneDesc")}
          </p>
        </div>
        <div className="px-6 py-4">
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            className="flex h-[44px] w-full items-center justify-center rounded-[8px] border border-[#FCA5A5] bg-white font-cairo text-[13px] font-extrabold text-[#DC2626] transition hover:bg-[#FEF2F2]"
          >
            {t("doctor.security.deleteAccount")}
          </button>
        </div>
      </section>

      <ConfirmActionDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t("doctor.security.confirmDeleteAccount")}
        description={
          <>
            {t("doctor.security.confirmDeleteDesc")}{" "}
            <span className="font-extrabold text-[#101828]">
              {t("doctor.security.days7")}
            </span>{" "}
            {t("doctor.security.beforePermanentDeletion")}
          </>
        }
        confirmLabel={t("doctor.security.continueToDelete")}
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          navigate(resolveDeleteAccountPath(readAuthUser()?.role));
        }}
      />

      <DoctorSecurityFormDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        title={t("doctor.security.changePassword")}
        description={t("doctor.security.enterCurrentPasswordNewEmail")}
        icon={KeyRound}
        form={passwordForm}
        fields={[
          {
            name: "currentPassword",
            label: t("doctor.security.enterCurrentPassword"),
            placeholder: t("doctor.security.enterCurrentPassword"),
            type: "password",
            autoComplete: "current-password",
          },
          {
            name: "newPassword",
            label: t("doctor.security.newPassword"),
            placeholder: t("doctor.security.atLeast6Chars"),
            type: "password",
            autoComplete: "new-password",
            hint: t("doctor.security.preferMixLettersNumbers"),
          },
          {
            name: "confirmPassword",
            label: t("doctor.security.confirmPassword"),
            placeholder: t("doctor.security.reEnterPassword"),
            type: "password",
            autoComplete: "new-password",
          },
        ]}
        submitLabel={t("doctor.security.continueToConfirm")}
        onValidatedSubmit={(values) =>
          openConfirm({ kind: "password", values })
        }
      />

      <DoctorSecurityFormDialog
        open={emailStep === "request"}
        onOpenChange={(next) => setEmailStep(next ? "request" : "closed")}
        title={t("doctor.security.changeEmail")}
        description={t("doctor.security.enterCurrentPasswordNewEmail")}
        icon={Mail}
        form={emailForm}
        fields={[
          {
            name: "currentPassword",
            label: t("doctor.security.enterCurrentPassword"),
            placeholder: t("doctor.security.enterCurrentPassword"),
            type: "password",
            autoComplete: "current-password",
          },
          {
            name: "newEmail",
            label: t("doctor.security.newEmail"),
            placeholder: "example@mail.com",
            type: "email",
            autoComplete: "email",
          },
        ]}
        submitLabel={t("doctor.security.continueToConfirm")}
        onValidatedSubmit={(values) => openConfirm({ kind: "email", values })}
      />

      <DoctorSecurityFormDialog
        open={phoneStep === "request"}
        onOpenChange={(next) => setPhoneStep(next ? "request" : "closed")}
        title={t("doctor.security.changePhone")}
        description={t("doctor.security.enterCurrentPasswordNewPhone")}
        icon={Phone}
        form={phoneForm}
        fields={[
          {
            name: "currentPassword",
            label: t("doctor.security.enterCurrentPassword"),
            placeholder: t("doctor.security.enterCurrentPassword"),
            type: "password",
            autoComplete: "current-password",
          },
          {
            name: "newPhone",
            label: t("doctor.security.newPhone"),
            placeholder: "+9639XXXXXXXX",
            type: "tel",
            autoComplete: "tel",
            hint: t("doctor.security.enterInternationalFormat"),
          },
        ]}
        submitLabel={t("doctor.security.continueToConfirm")}
        onValidatedSubmit={(values) => openConfirm({ kind: "phone", values })}
      />

      {confirmCopy ? (
        <ConfirmActionDialog
          open={confirmOpen}
          onOpenChange={(next) => {
            setConfirmOpen(next);
            if (!next) setPendingAction(null);
          }}
          title={confirmCopy.title}
          description={confirmCopy.description}
          confirmLabel={
            confirmBusy
              ? t("doctor.security.working")
              : confirmCopy.confirmLabel
          }
          confirmDisabled={confirmBusy}
          onConfirm={executePendingAction}
        />
      ) : null}
    </>
  );
}
