"use client";

import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { ApiError } from "@/lib/base";
import { authApi } from "@/lib/auth/client";
import type { DoctorSignupBody } from "@/lib/auth/types";
import { useAuthStore } from "@/store/authStore";

import SignUpStep1Account from "./signup-step1-account";
import SignUpStep2Personal from "./signup-step2-personal";
import SignUpStep3Professional from "./signup-step3-professional";
import SignUpStep4Additional from "./signup-step4-additional";
import SignUpStepper from "./signup-stepper";

import {
  extractSignupConflictFields,
  formatSignupGeneralBannerError,
  formatSignupApiError,
  signupErrorHasOnlyContactFieldIssues,
  type SignupFieldConflictMessages,
} from "@/lib/auth/signupMessaging";

import {
  signUpSchema,
  type SignUpValues,
  type Step1AccountValues,
  type Step2PersonalValues,
  type Step3ProfessionalValues,
  type Step4AdditionalValues,
} from "./signup-schemas";

export default function SignUpForm({
  onBack,
  onLogin,
  onVerify,
  onSuccess,
}: {
  onBack: () => void;
  onLogin: () => void;
  onVerify: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<SignUpValues>>({
    channel: "whatsapp",
  });

  const stepVariants = {
    enter: (dir: 1 | -1) => ({
      opacity: 0,
      x: dir === 1 ? -24 : 24,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (dir: 1 | -1) => ({
      opacity: 0,
      x: dir === 1 ? 24 : -24,
    }),
  };

  const [step1ContactErrors, setStep1ContactErrors] =
    useState<SignupFieldConflictMessages>({});
  const [step1PrecheckBusy, setStep1PrecheckBusy] = useState(false);

  const dismissStep1Conflict = (field: "email" | "phone") => {
    setStep1ContactErrors((prev) => {
      if (field === "email" && prev.email == null) return prev;
      if (field === "phone" && prev.phone == null) return prev;
      return { ...prev, [field]: undefined };
    });
  };

  const handleStep1Next = async (values: Step1AccountValues) => {
    setSubmitError(null);
    setStep1ContactErrors({});
    setStep1PrecheckBusy(true);
    try {
      const pre = await authApi.signupDoctorContactPrecheck({
        email: values.email,
        phone: values.phone,
      });
      if ("conflict" in pre) {
        setStep1ContactErrors(pre.conflict);
        return;
      }
      setDirection(1);
      setDraft((prev) => ({ ...prev, ...values }));
      setStep(2);
    } catch (e: unknown) {
      setSubmitError(formatSignupApiError(e));
    } finally {
      setStep1PrecheckBusy(false);
    }
  };

  const handleStep2Next = (values: Step2PersonalValues) => {
    setDirection(1);
    setDraft((prev) => ({ ...prev, ...values }));
    setStep(3);
  };

  const handleStep3Next = (values: Step3ProfessionalValues) => {
    setDirection(1);
    setDraft((prev) => ({ ...prev, ...values }));
    setStep(4);
  };

  const handleStep4Complete = (values: Step4AdditionalValues) => {
    const merged = { ...draft, ...values };
    const parsed = signUpSchema.safeParse(merged);
    if (!parsed.success) {
      setStep(1);
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);

    /** POST /auth/signup — يطابق أمثلة الـ PDF (curl) */
    const toSignupApiGender = (g: "male" | "female"): "Male" | "Female" =>
      g === "male" ? "Male" : "Female";

    const consultationTypes: Array<"online" | "offline"> = [];
    if (parsed.data.consultationOnline) consultationTypes.push("online");
    if (parsed.data.consultationOffline) consultationTypes.push("offline");

    const signupPayload: DoctorSignupBody = {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      password: parsed.data.password,
      phone: parsed.data.phone,
      gender: toSignupApiGender(parsed.data.gender),
      dateOfBirth: parsed.data.birthDate,
      address: parsed.data.address,
      role: "doctor",
      channel: parsed.data.channel,
      clientType: "web",
      ...(parsed.data.specialtySource === "catalog"
        ? { specializationKey: parsed.data.specialty }
        : { customSpecializationText: parsed.data.specialty }),
      medicalLicenseNumber: parsed.data.licenseNumber,
      bio: parsed.data.bio,
      education: parsed.data.qualification,
      clinicAddress: parsed.data.clinicAddress,
      locationCity: parsed.data.city?.trim() || undefined,
      locationCountry: parsed.data.country?.trim() || undefined,
      ...(consultationTypes.length > 0 ? { consultationTypes } : {}),
    };

    if (import.meta.env.DEV) {
      console.info("[signup] POST /api/auth/signup payload", {
        ...signupPayload,
        password: "<redacted>",
      });
    }

    authApi
      .signupDoctor(signupPayload)
      .then((res) => {
        useAuthStore.getState().setPendingVerification({
          userId: res.userId,
          role: "doctor",
          email: res.email,
          phone: res.phone,
          channel: parsed.data.channel,
        });

        if (res.status === "verification_pending") {
          onVerify();
          return;
        }

        onVerify();
      })
      .catch((e: unknown) => {
        if (import.meta.env.DEV) {
          if (e instanceof ApiError) {
            console.warn("[signup] POST /api/auth/signup failed", {
              status: e.status,
              messageKey: e.messageKey,
              message: e.message,
              body: e.body,
            });
          } else {
            console.warn("[signup] POST /api/auth/signup failed", e);
          }
        }
        const conflicts = extractSignupConflictFields(e);
        const hasContactConflict = Boolean(conflicts.email || conflicts.phone);
        const contactOnly =
          hasContactConflict && signupErrorHasOnlyContactFieldIssues(e);
        setStep1ContactErrors(contactOnly ? conflicts : {});
        const general = contactOnly
          ? formatSignupGeneralBannerError(e, conflicts)
          : formatSignupApiError(e);
        setSubmitError(
          general ?? (contactOnly ? null : formatSignupApiError(e)),
        );
        setStep(contactOnly ? 1 : 4);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <section className="mx-auto flex flex-col items-center">
      <div className="my-[10px]">
        <img
          src="/images/syr-health-logo.png"
          alt="LMJ Health"
          width={226}
          height={120}
          className="max-h-[120px] mt-[50px] mb-[20px]"
          loading="eager"
        />
      </div>
      <h1 className="mb-[20px] text-[#4A5565] text-[16px] font-bold">
        تسجيل حساب طبيب جديد
      </h1>
      <div dir="rtl" lang="ar" className="relative">
        <div className="relative w-fit">
          <div
            className={`w-[672px] ${step === 1 ? "min-h-[947.175px] pb-12 mb-8" : step === 2 ? "min-h-[727.17px] pb-12 mb-8" : step === 3 ? "min-h-[999.16px] pb-12 mb-8" : "min-h-[727.1749877929688px] pb-12 mb-8"} top-[212px] rounded-[6px] pt-8 px-8 gap-8 bg-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]`}
          >
            <SignUpStepper step={step} />

            {submitError ? (
              <div className="mt-4 whitespace-pre-line rounded-[6px] border border-[#FEE4E2] bg-[#FEF3F2] px-4 py-3 text-right font-cairo text-[13px] font-bold leading-6 text-[#B42318]">
                {submitError}
              </div>
            ) : null}

            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.26, ease: "easeOut" }}
              >
                {step === 1 ? (
                  <SignUpStep1Account
                    onBack={onBack}
                    defaultValues={draft}
                    onNext={handleStep1Next}
                    contactFieldErrors={step1ContactErrors}
                    contactPrecheckBusy={step1PrecheckBusy}
                    onDismissContactConflict={dismissStep1Conflict}
                  />
                ) : step === 2 ? (
                  <SignUpStep2Personal
                    onPrev={() => {
                      setDirection(-1);
                      setStep1ContactErrors({});
                      setStep(1);
                    }}
                    defaultValues={draft}
                    onNext={handleStep2Next}
                  />
                ) : step === 3 ? (
                  <SignUpStep3Professional
                    onPrev={() => {
                      setDirection(-1);
                      setStep(2);
                    }}
                    defaultValues={draft}
                    onNext={handleStep3Next}
                  />
                ) : step === 4 ? (
                  <SignUpStep4Additional
                    onPrev={() => {
                      setDirection(-1);
                      setStep(3);
                    }}
                    defaultValues={draft}
                    isSubmitting={isSubmitting}
                    onComplete={(values) => {
                      if (isSubmitting) return;
                      handleStep4Complete(values);
                    }}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {step === 1 && (
            <div className="pt-2 text-center font-cairo text-[14px] font-semibold text-[#6A7282]">
              لديك حساب بالفعل؟
              <button
                type="button"
                onClick={onLogin}
                className="ps-2 font-bold text-[#FFFFFF] py-4 transition-colors hover:text-[#14B3AE]"
              >
                تسجيل الدخول
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

