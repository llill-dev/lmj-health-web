"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import DoctorProfileConfirmDialog from "@/components/doctor/profile-settings/doctor-profile-confirm-dialog";
import DoctorProfileHeroCard from "@/components/doctor/profile-settings/doctor-profile-hero-card";
import DoctorProfileInfoBanner from "@/components/doctor/profile-settings/doctor-profile-info-banner";
import {
  DoctorProfileFormField,
  profileFieldClass,
  profileFieldSurfaceClass,
  profileInputClass,
  profileTextareaClass,
} from "@/components/doctor/profile-settings/doctor-profile-form-field";
import {
  doctorPersonalEditSchema,
  type DoctorPersonalEditForm,
} from "@/components/doctor/profile-settings/doctor-profile-schemas";
import { useDoctorProfileConfirm } from "@/components/doctor/profile-settings/use-doctor-profile-confirm";
import {
  consultationTypesToMode,
  doctorInitial,
  modeToConsultationTypes,
  normalizeConsultationTypes,
  toDateInputValue,
  type ConsultationModeSelection,
} from "@/components/doctor/profile-settings/doctor-profile-utils";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils/utils";
import type { DoctorProfileRecord } from "@/lib/doctor/profile/profileClient";
import { resolveDoctorProfilePatchFeedback } from "@/lib/doctor/profile/doctorProfilePatchErrors";

type TFn = (key: string, fallback?: string) => string;

function buildConsultationModeOptions(
  t: TFn,
): { value: ConsultationModeSelection; label: string }[] {
  return [
    { value: "offline", label: t("doctor.personalProfileForm.consultationMode.offline") },
    { value: "online", label: t("doctor.personalProfileForm.consultationMode.online") },
    { value: "both", label: t("doctor.personalProfileForm.consultationMode.both") },
  ];
}

export default function DoctorProfilePersonalForm({
  doctor,
  busy,
  onSubmit,
}: {
  doctor: DoctorProfileRecord;
  busy?: boolean;
  onSubmit: (
    values: DoctorPersonalEditForm,
    photo: File | null,
  ) => Promise<void>;
}) {
  const { locale, dir, t } = useI18n();
  const navigate = useNavigate();
  const user = doctor.user;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPhotoRef = useRef<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    user?.photoUrl ?? null,
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const {
    confirmKind,
    confirmOpen,
    requestConfirm,
    closeConfirm,
    handleConfirm,
  } = useDoctorProfileConfirm();

  const form = useForm<DoctorPersonalEditForm>({
    resolver: zodResolver(doctorPersonalEditSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: user?.fullName?.trim() ?? "",
      dateOfBirth: toDateInputValue(user?.dateOfBirth),
      address: user?.address?.trim() ?? "",
      bio: doctor.bio?.trim() ?? "",
      consultationFee:
        doctor.consultationFee != null ? String(doctor.consultationFee) : "",
      consultationMode: consultationTypesToMode(
        normalizeConsultationTypes(doctor.consultationTypes),
      ),
    },
  });

  const bioValue = form.watch("bio") ?? "";
  const initial = doctorInitial(user?.fullName, locale);
  const errors = form.formState.errors;
  const isDirty = form.formState.isDirty || photoFile != null;

  const applyPhoto = (file: File) => {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoSelected = (file: File | null) => {
    if (!file) return;
    if (user?.photoUrl || photoPreview) {
      pendingPhotoRef.current = file;
      requestConfirm("change-photo", () => {
        applyPhoto(file);
        pendingPhotoRef.current = null;
      });
      return;
    }
    applyPhoto(file);
  };

  const handleCancel = () => {
    if (!isDirty) {
      navigate("/doctor/profile-settings");
      return;
    }
    requestConfirm("cancel-personal", () => {
      navigate("/doctor/profile-settings");
    });
  };

  const handleValidatedSave = (values: DoctorPersonalEditForm) => {
    requestConfirm('save-personal', async () => {
      try {
        await onSubmit(values, photoFile);
      } catch (error) {
        const { fields } = resolveDoctorProfilePatchFeedback(error);
        for (const [key, message] of Object.entries(fields)) {
          if (!message) continue;
          form.setError(key as keyof DoctorPersonalEditForm, { message });
        }
        throw error;
      }
    });
  };

  return (
    <div dir={dir} lang={locale} className="space-y-5">
      <DoctorProfileHeroCard
        fullName={user?.fullName}
        specialization={doctor.specialization}
        photoUrl={photoPreview}
        isApproved={doctor.isApproved}
      />

      <div className="rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.08)]">
        <h2 className="text-center font-cairo text-[15px] font-extrabold text-primary">
          {t("doctor.personalProfileForm.title")}
        </h2>

        <div className="mt-4">
          <DoctorProfileInfoBanner>
            {t("doctor.personalProfileForm.infoBanner")}
          </DoctorProfileInfoBanner>
        </div>

        <form
          className="mt-6 space-y-5"
          noValidate
          onSubmit={form.handleSubmit(handleValidatedSave)}
        >
          <DoctorProfileFormField
            label={t("doctor.personalProfileForm.photo.label")}
            hint={t("doctor.personalProfileForm.photo.hint")}
          >
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt=""
                    className="h-[72px] w-[72px] rounded-full border-2 border-white object-cover shadow-[0_4px_12px_rgba(15,143,139,0.15)]"
                  />
                ) : (
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-white bg-[#E6F4F3] font-cairo text-[22px] font-extrabold text-primary shadow-[0_4px_12px_rgba(15,143,139,0.15)]">
                    {initial}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 end-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-[0_2px_8px_rgba(15,143,139,0.35)]"
                  aria-label={t("doctor.personalProfileForm.photo.uploadAria")}
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-cairo text-[12px] font-bold text-primary underline-offset-2 hover:underline"
              >
                {t("doctor.personalProfileForm.photo.change")}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  handlePhotoSelected(file);
                  event.target.value = "";
                }}
              />
            </div>
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label={t("doctor.profileEditDialog.fields.fullName.label")}
            required
            error={errors.fullName?.message}
          >
            <input
              {...form.register("fullName")}
              className={profileFieldClass(
                profileInputClass,
                Boolean(errors.fullName),
              )}
              placeholder={t("doctor.personalProfileForm.fields.fullName.placeholder")}
              aria-invalid={Boolean(errors.fullName)}
            />
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label={t("doctor.personalProfileForm.fields.dateOfBirth.label")}
            required
            error={errors.dateOfBirth?.message}
          >
            <input
              {...form.register("dateOfBirth")}
              type="date"
              className={profileFieldClass(
                profileInputClass,
                Boolean(errors.dateOfBirth),
              )}
              aria-invalid={Boolean(errors.dateOfBirth)}
            />
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label={t("doctor.profileEditDialog.fields.address.label")}
            required
            error={errors.address?.message}
          >
            <textarea
              {...form.register("address")}
              className={profileFieldClass(
                profileTextareaClass,
                Boolean(errors.address),
              )}
              placeholder={t("doctor.personalProfileForm.fields.address.placeholder")}
              rows={3}
              aria-invalid={Boolean(errors.address)}
            />
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label={t("doctor.personalProfileForm.fields.bio.label")}
            hint={t("doctor.personalProfileForm.fields.bio.hint")}
            error={errors.bio?.message}
          >
            <textarea
              {...form.register("bio")}
              className={profileFieldClass(
                profileTextareaClass,
                Boolean(errors.bio),
              )}
              placeholder={t("doctor.personalProfileForm.fields.bio.placeholder")}
              rows={4}
              maxLength={200}
              aria-invalid={Boolean(errors.bio)}
            />
            <div className="text-end font-cairo text-[11px] font-semibold text-[#667085]">
              {bioValue.length}/200
            </div>
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label={t("doctor.personalProfileForm.fields.consultationFee.label")}
            hint={t("doctor.personalProfileForm.fields.consultationFee.hint")}
            error={errors.consultationFee?.message}
          >
            <input
              {...form.register("consultationFee")}
              className={profileFieldClass(
                profileInputClass,
                Boolean(errors.consultationFee),
              )}
              placeholder="50000"
              inputMode="numeric"
              aria-invalid={Boolean(errors.consultationFee)}
            />
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label={t("doctor.personalProfileForm.fields.consultationMode.label")}
            required
            error={errors.consultationMode?.message}
          >
            <div className="space-y-2">
              {buildConsultationModeOptions(t).map((option) => {
                const selected =
                  form.watch("consultationMode") === option.value;
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-[10px] border-[0.5px] px-4 py-3 transition",
                      selected
                        ? "border-primary bg-[#E6F4F3]"
                        : `${profileFieldSurfaceClass}`,
                      errors.consultationMode &&
                        !selected &&
                        "border-[#FECDCA]",
                    )}
                  >
                    <span className="font-cairo text-[13px] font-bold text-[#101828]">
                      {option.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        form.setValue("consultationMode", option.value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      className="w-4 h-4 accent-primary"
                    />
                  </label>
                );
              })}
            </div>
          </DoctorProfileFormField>

          <button
            type="submit"
            disabled={busy}
            className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[8px] bg-primary font-cairo text-[14px] font-extrabold text-white transition hover:bg-[#0A7A77] disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t("doctor.personalProfileForm.saveChanges")}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="flex h-[44px] w-full items-center justify-center rounded-[8px] border border-[#E4E7EC] bg-white font-cairo text-[13px] font-bold text-[#667085] transition hover:bg-[#F9FAFB]"
          >
            {t("common.cancel")}
          </button>
        </form>
      </div>

      <DoctorProfileConfirmDialog
        kind={confirmKind}
        open={confirmOpen}
        onOpenChange={closeConfirm}
        confirmDisabled={busy}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export { modeToConsultationTypes };
export type { DoctorPersonalEditForm };
