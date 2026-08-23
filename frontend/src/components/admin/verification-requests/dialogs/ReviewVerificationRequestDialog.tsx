"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { CheckCheck, X, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DoctorSpecializationReviewBanner } from "@/components/admin/verification-requests/DoctorSpecializationReviewBanner";
import { useAdminLookups } from "@/hooks/admin/lookups/useAdminLookups";
import { adminApi } from "@/lib/admin/client";
import { resolveDoctorSpecialtyLookupCategory } from "@/lib/admin/doctors/doctorSpecialtyLookupCategory";
import { getVerificationReviewErrorMessage } from "@/lib/admin/verification-requests/verificationReviewErrors";
import {
  buildDoctorSpecializationLookupOptions,
  findDoctorSpecializationLookupId,
  resolveDoctorSpecializationReviewState,
} from "@/lib/admin/doctors/doctorSpecializationReview";
import { AppCheckbox } from "@/components/ui";
import StyledSelect from "@/components/ui/styled-select";
import { useToast } from "@/components/ui/ToastProvider";
import { useI18n } from "@/i18n/provider";

type Mode = "approve" | "reject" | "map";

export default function ReviewVerificationRequestDialog({
  open,
  onOpenChange,
  onReviewed,
  requestId,
  doctorName,
  doctorProfile,
  lat,
  lng,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewed?: () => void | Promise<void>;
  requestId: string | null;
  doctorName: string;
  doctorProfile?: Record<string, unknown> | null;
  lat?: string;
  lng?: string;
  mode: Mode;
}) {
  const { locale, dir, t } = useI18n();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [specializationLookupId, setSpecializationLookupId] = useState("");
  const [createNewSpecialization, setCreateNewSpecialization] = useState(false);
  const [newSpecializationKey, setNewSpecializationKey] = useState("");
  const [newSpecializationTextAr, setNewSpecializationTextAr] = useState("");
  const [newSpecializationTextEn, setNewSpecializationTextEn] = useState("");

  const approveSchema = useMemo(
    () =>
      z.object({
        adminNote: z.string().trim().min(1, t("adminVerificationRequests.validation.fieldRequired")),
        clinicLat: z
          .string()
          .trim()
          .optional()
          .transform((v) => (v ? Number(v) : undefined)),
        clinicLng: z
          .string()
          .trim()
          .optional()
          .transform((v) => (v ? Number(v) : undefined)),
        verifyLocation: z.boolean().optional(),
      }),
    [t],
  );

  const rejectSchema = useMemo(
    () =>
      z.object({
        adminNote: z.string().trim().min(1, t("adminVerificationRequests.validation.rejectReasonRequired")),
      }),
    [t],
  );

  const lookupCategory = resolveDoctorSpecialtyLookupCategory();
  const lookupsQuery = useAdminLookups({
    category: lookupCategory,
    includeInactive: false,
  });

  const specializationState = useMemo(
    () =>
      resolveDoctorSpecializationReviewState(
        doctorProfile,
        lookupsQuery.data?.lookups,
      ),
    [doctorProfile, lookupsQuery.data?.lookups],
  );

  const lookupOptions = useMemo(
    () =>
      buildDoctorSpecializationLookupOptions(lookupsQuery.data?.lookups ?? []),
    [lookupsQuery.data?.lookups],
  );

  const schema = useMemo(() => {
    if (mode === "reject") return rejectSchema;
    if (mode === "approve") return approveSchema;
    return z.object({});
  }, [mode, rejectSchema, approveSchema]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "approve"
        ? {
            adminNote: "",
            clinicLat: lat ?? "",
            clinicLng: lng ?? "",
            verifyLocation: true,
          }
        : mode === "reject"
          ? { adminNote: "" }
          : {},
  });

  useEffect(() => {
    if (!open || mode !== "approve") return;
    const autoId = findDoctorSpecializationLookupId(
      lookupsQuery.data?.lookups ?? [],
      specializationState.specializationKey,
    );
    if (autoId) {
      setSpecializationLookupId(autoId);
    } else if (specializationState.customSpecializationText) {
      setNewSpecializationTextAr(specializationState.customSpecializationText);
    }
  }, [
    open,
    mode,
    lookupsQuery.data?.lookups,
    specializationState.specializationKey,
    specializationState.customSpecializationText,
  ]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setDone(null);
    setCreateNewSpecialization(false);
    setNewSpecializationKey("");
    setNewSpecializationTextEn("");

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  useEffect(() => {
    if (open) return;
    reset();
    setSpecializationLookupId("");
    setCreateNewSpecialization(false);
    setNewSpecializationKey("");
    setNewSpecializationTextAr("");
    setNewSpecializationTextEn("");
  }, [open, reset]);

  const title =
    mode === "approve"
      ? t("adminVerificationRequests.title.approve")
      : mode === "reject"
        ? t("adminVerificationRequests.title.reject")
        : t("adminVerificationRequests.title.mapView");

  const Icon = mode === "approve" ? CheckCheck : mode === "reject" ? X : MapPin;

  const approveBlocked =
    mode === "approve" &&
    specializationState.needsAdminResolve &&
    !createNewSpecialization &&
    !specializationLookupId;

  const submitApprove = async (values: {
    adminNote: string;
    clinicLat?: number;
    clinicLng?: number;
    verifyLocation?: boolean;
  }) => {
    if (!requestId) return;

    let specializationPayload:
      | { specializationLookupId: string }
      | {
          newSpecialization: {
            key: string;
            text: { ar: string; en?: string };
          };
        }
      | null = null;

    if (createNewSpecialization) {
      const key = newSpecializationKey.trim();
      const textAr = newSpecializationTextAr.trim();
      if (!key || !textAr) {
        setError(t("adminVerificationRequests.specialization.newKeyRequired"));
        return;
      }
      specializationPayload = {
        newSpecialization: {
          key,
          text: {
            ar: textAr,
            en: newSpecializationTextEn.trim() || undefined,
          },
        },
      };
    } else if (specializationLookupId) {
      specializationPayload = { specializationLookupId };
    } else if (specializationState.needsAdminResolve) {
      setError(t("adminVerificationRequests.specialization.mustResolve"));
      return;
    }

    await adminApi.verificationRequests.review(requestId, {
      decision: "approved",
      adminNote: values.adminNote,
      clinicLat: values.clinicLat,
      clinicLng: values.clinicLng,
      verifyLocation:
        typeof values.verifyLocation === "boolean"
          ? values.verifyLocation
          : true,
      ...(specializationPayload ?? {}),
    });

    setDone(t("adminVerificationRequests.toast.approvedDone"));
    toast(
      t("adminVerificationRequests.toast.approvedBody").replace("{name}", doctorName),
      {
        title: t("adminVerificationRequests.toast.approvedTitle"),
        variant: "success",
        durationMs: 4200,
      },
    );
    await onReviewed?.();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? "open" : "closed"}
            variants={{
              open: {
                opacity: 1,
                visibility: "visible",
                pointerEvents: "auto",
                transition: { duration: 0.22, ease: "easeOut" },
              },
              closed: {
                opacity: 0,
                transition: { duration: 0.22, ease: "easeOut" },
                pointerEvents: "none",
                transitionEnd: { visibility: "hidden" },
              },
            }}
            className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]"
            style={{ touchAction: "none" }}
          />
        </Dialog.Overlay>

        <Dialog.Content forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? "open" : "closed"}
            variants={{
              open: {
                opacity: 1,
                visibility: "visible",
                pointerEvents: "auto",
                transition: { duration: 0.18, ease: "easeOut" },
              },
              closed: {
                opacity: 0,
                transition: { duration: 0.18, ease: "easeOut" },
                pointerEvents: "none",
                transitionEnd: { visibility: "hidden" },
              },
            }}
            className="fixed left-1/2 top-1/2 z-[10000] max-h-[90vh] w-[680px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none"
            dir={dir}
            lang={locale}
          >
            <div className="relative px-8 pb-7 pt-7">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]"
                  aria-label={t("common.close")}
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>

              <Dialog.Title className="text-right font-cairo text-[22px] font-extrabold leading-[28px] text-[#101828]">
                {title}
              </Dialog.Title>

              <div className="mt-6 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4">
                <div className="flex items-center gap-2 text-primary">
                  <Icon className="h-4 w-4" />
                  <div className="font-cairo text-[12px] font-extrabold">
                    {t("adminVerificationRequests.doctorLabel")}
                  </div>
                </div>
                <div className="mt-2 font-cairo text-[14px] font-black text-[#111827]">
                  {doctorName}
                </div>
              </div>

              {mode === "approve" ? (
                <div className="mt-4">
                  <DoctorSpecializationReviewBanner
                    state={specializationState}
                  />
                </div>
              ) : null}

              {mode === "map" ? (
                <div className="mt-5 rounded-[12px] border border-[#D1E9FF] bg-[#EFF6FF] px-5 py-5">
                  <div className="flex items-center gap-2 text-[#1D4ED8]">
                    <MapPin className="h-4 w-4" />
                    <div className="font-cairo text-[12px] font-extrabold">
                      {t("adminVerificationRequests.map.clinicLocation")}
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[10px] bg-white px-4 py-3">
                      <div className="font-cairo text-[11px] font-bold text-[#667085]">
                        {t("adminVerificationRequests.map.coordinates")}
                      </div>
                      <div className="mt-1 font-cairo text-[13px] font-semibold text-[#101828]">
                        Lat: {lat ?? "—"} • Lng: {lng ?? "—"}
                      </div>
                    </div>
                    {doctorProfile?.clinicAddress ||
                    doctorProfile?.locationCity ||
                    doctorProfile?.locationCountry ? (
                      <div className="rounded-[10px] bg-white px-4 py-3">
                        <div className="font-cairo text-[11px] font-bold text-[#667085]">
                          {t("adminVerificationRequests.map.address")}
                        </div>
                        <div className="mt-1 font-cairo text-[13px] font-semibold text-[#101828]">
                          {[
                            doctorProfile?.clinicAddress,
                            doctorProfile?.locationCity,
                            doctorProfile?.locationCountry,
                          ]
                            .filter(Boolean)
                            .join("، ") || "—"}
                        </div>
                      </div>
                    ) : null}
                    {lat && lng ? (
                      <a
                        href={`https://www.google.com/maps?q=${lat},${lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-[8px] bg-[#1D4ED8] px-4 py-2 font-cairo text-[12px] font-extrabold text-white transition-colors hover:bg-[#1E40AF]"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        {t("adminVerificationRequests.map.viewInGoogleMaps")}
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : (
                <form
                  className="mt-5 space-y-4"
                  onSubmit={handleSubmit(async (values) => {
                    setError(null);
                    setDone(null);
                    if (!requestId) return;
                    try {
                      if (mode === "approve") {
                        await submitApprove(values);
                        return;
                      }

                      await adminApi.verificationRequests.review(requestId, {
                        decision: "rejected",
                        adminNote: values.adminNote,
                      });
                      setDone(t("adminVerificationRequests.toast.rejectedDone"));
                      toast(
                        t("adminVerificationRequests.toast.rejectedBody").replace("{name}", doctorName),
                        {
                          title: t("adminUsersDialog.restore.toast.rejectedTitle"),
                          variant: "info",
                          durationMs: 4200,
                        },
                      );
                      await onReviewed?.();
                    } catch (e: unknown) {
                      setError(
                        getVerificationReviewErrorMessage(
                          e,
                          mode === "approve" ? "approve" : "reject",
                          locale,
                        ),
                      );
                    }
                  })}
                >
                  {mode === "approve" &&
                  specializationState.needsAdminResolve ? (
                    <div className="space-y-4 rounded-[12px] border border-[#EEF2F6] bg-[#F8FAFC] px-4 py-4">
                      <div className="text-right font-cairo text-[13px] font-extrabold text-[#101828]">
                        {t("adminVerificationRequests.specialization.linkBeforeApprove")}
                      </div>

                      <label className="flex items-center justify-start gap-2">
                        <AppCheckbox
                          size="sm"
                          checked={createNewSpecialization}
                          onChange={(event) => {
                            setCreateNewSpecialization(event.target.checked);
                            setError(null);
                          }}
                        />
                        <span className="font-cairo text-[12px] font-bold text-[#344054]">
                          {t("adminVerificationRequests.specialization.createNewInsteadOfExisting")}
                        </span>
                      </label>

                      {createNewSpecialization ? (
                        <div className="space-y-3">
                          <div>
                            <div className="mb-2 text-right font-cairo text-[12px] font-extrabold text-[#101828]">
                              {t("adminVerificationRequests.specialization.keyEnLabel")}
                              <span className="ms-1 text-[#F04438]">*</span>
                            </div>
                            <input
                              value={newSpecializationKey}
                              onChange={(event) =>
                                setNewSpecializationKey(event.target.value)
                              }
                              placeholder="dentistry"
                              className="h-[42px] w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3]"
                            />
                          </div>
                          <div>
                            <div className="mb-2 text-right font-cairo text-[12px] font-extrabold text-[#101828]">
                              {t("adminVerificationRequests.specialization.nameArLabel")}
                              <span className="ms-1 text-[#F04438]">*</span>
                            </div>
                            <input
                              value={newSpecializationTextAr}
                              onChange={(event) =>
                                setNewSpecializationTextAr(event.target.value)
                              }
                              placeholder={t("adminVerificationRequests.field.specializationExample.placeholder")}
                              className="h-[42px] w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3]"
                            />
                          </div>
                          <div>
                            <div className="mb-2 text-right font-cairo text-[12px] font-extrabold text-[#101828]">
                              {t("adminVerificationRequests.specialization.nameEnLabel")}
                            </div>
                            <input
                              value={newSpecializationTextEn}
                              onChange={(event) =>
                                setNewSpecializationTextEn(event.target.value)
                              }
                              placeholder="Dentistry"
                              className="h-[42px] w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3]"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-2 text-right font-cairo text-[12px] font-extrabold text-[#101828]">
                            {t("adminVerificationRequests.specialization.chooseFromList")}
                            <span className="ms-1 text-[#F04438]">*</span>
                          </div>
                          <StyledSelect
                            value={specializationLookupId}
                            onChange={(value) => {
                              setSpecializationLookupId(value);
                              setError(null);
                            }}
                            disabled={lookupsQuery.isAwaitingData}
                            options={[
                              {
                                value: "",
                                label: lookupsQuery.isAwaitingData
                                  ? t("adminVerificationRequests.specialization.loading")
                                  : t("adminVerificationRequests.specialization.choosePlaceholder"),
                              },
                              ...lookupOptions,
                            ]}
                            listboxAriaLabel={t("adminVerificationRequests.specialization.chooseFromList")}
                            listboxZIndex={10001}
                          />
                          {lookupsQuery.isError ? (
                            <p className="mt-2 font-cairo text-[11px] font-semibold text-[#B45309]">
                          {t("adminVerificationRequests.specialization.loadError")}
                          </p>
                        ) : null}
                      </div>
                      )}
                    </div>
                  ) : null}

                  <div>
                    <div className="mb-2 text-right font-cairo text-[13px] font-extrabold text-[#101828]">
                      {t("adminVerificationRequests.adminNoteLabel")}
                      <span className="ms-1 text-[#F04438]">*</span>
                    </div>
                    <textarea
                      {...register("adminNote")}
                      placeholder={
                        mode === "approve"
                          ? t("adminVerificationRequests.field.adminNote.approvePlaceholder")
                          : t("adminVerificationRequests.field.adminNote.rejectPlaceholder")
                      }
                      className="min-h-[110px] w-full resize-none rounded-[12px] border border-[#D0D5DD] bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]"
                      required
                    />
                  </div>

                  {mode === "approve" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="mb-2 text-right font-cairo text-[13px] font-extrabold text-[#101828]">
                          {t("adminVerificationRequests.field.clinicLat.label")}
                        </div>
                        <input
                          {...register("clinicLat")}
                          inputMode="decimal"
                          placeholder={lat ?? "30.0444"}
                          className="h-[42px] w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3]"
                        />
                      </div>
                      <div>
                        <div className="mb-2 text-right font-cairo text-[13px] font-extrabold text-[#101828]">
                          {t("adminVerificationRequests.field.clinicLng.label")}
                        </div>
                        <input
                          {...register("clinicLng")}
                          inputMode="decimal"
                          placeholder={lng ?? "31.2357"}
                          className="h-[42px] w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3]"
                        />
                      </div>
                      <label className="col-span-2 flex items-center justify-end gap-2 rounded-[12px] border border-[#EEF2F6] bg-[#F8FAFC] px-4 py-3">
                        <AppCheckbox
                          size="sm"
                          defaultChecked
                          {...register("verifyLocation")}
                        />
                        <span className="font-cairo text-[12px] font-bold text-[#111827]">
                          {t("adminVerificationRequests.field.confirmClinicLocation")}
                        </span>
                      </label>
                    </div>
                  ) : null}

                  {error ? (
                    <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[13px] font-bold text-[#991B1B]">
                      {error}
                    </div>
                  ) : null}

                  {done ? (
                    <div className="rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 font-cairo text-[13px] font-bold text-[#166534]">
                      {done}
                    </div>
                  ) : null}

                  <div className="mt-2 flex items-center justify-end gap-3">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="h-[40px] rounded-[10px] border border-[#E5E7EB] bg-white px-7 font-cairo text-[12px] font-extrabold text-[#111827]"
                      >
                        {t("common.close")}
                      </button>
                    </Dialog.Close>
                    <button
                      type="submit"
                      disabled={isSubmitting || !requestId || approveBlocked}
                      className={
                        mode === "approve"
                          ? "inline-flex h-[40px] items-center gap-2 rounded-[10px] bg-[#00C950] px-7 font-cairo text-[12px] font-extrabold text-white disabled:opacity-60"
                          : "inline-flex h-[40px] items-center gap-2 rounded-[10px] bg-[#EF4444] px-7 font-cairo text-[12px] font-extrabold text-white disabled:opacity-60"
                      }
                    >
                      {mode === "approve" ? (
                        <CheckCheck className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      {mode === "approve" ? t("adminVerificationRequests.action.approve") : t("adminVerificationRequests.action.reject")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
