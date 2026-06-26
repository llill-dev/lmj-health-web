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
import { cn } from "@/lib/utils/utils";
import type { DoctorProfileRecord } from "@/lib/doctor/profile/profileClient";
import { resolveDoctorProfilePatchFeedback } from "@/lib/doctor/profile/doctorProfilePatchErrors";

const consultationModeOptions: {
  value: ConsultationModeSelection;
  label: string;
}[] = [
  { value: "offline", label: "حضورية فقط" },
  { value: "online", label: "عن بعد فقط" },
  { value: "both", label: "حضورية + عن بعد" },
];

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
  const initial = doctorInitial(user?.fullName);
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
    <div dir="rtl" lang="ar" className="space-y-5">
      <DoctorProfileHeroCard
        fullName={user?.fullName}
        specialization={doctor.specialization}
        photoUrl={photoPreview}
        isApproved={doctor.isApproved}
      />

      <div className="rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.08)]">
        <h2 className="text-center font-cairo text-[15px] font-extrabold text-primary">
          تعديل المعلومات الشخصية
        </h2>

        <div className="mt-4">
          <DoctorProfileInfoBanner>
            التعديلات على المعلومات الشخصية تطبق فوراً بدون الحاجة لموافقة
          </DoctorProfileInfoBanner>
        </div>

        <form
          className="mt-6 space-y-5"
          noValidate
          onSubmit={form.handleSubmit(handleValidatedSave)}
        >
          <DoctorProfileFormField
            label="الصورة الشخصية"
            hint="اختياري — يفضل استخدام صورة واضحة بحجم 400×400 بكسل"
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
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-[0_2px_8px_rgba(15,143,139,0.35)]"
                  aria-label="رفع صورة"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-cairo text-[12px] font-bold text-primary underline-offset-2 hover:underline"
              >
                تغيير الصورة
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
            label="الاسم الكامل"
            required
            error={errors.fullName?.message}
          >
            <input
              {...form.register("fullName")}
              className={profileFieldClass(
                profileInputClass,
                Boolean(errors.fullName),
              )}
              placeholder="د. خالد عبدالله"
              aria-invalid={Boolean(errors.fullName)}
            />
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label="تاريخ الميلاد"
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
            label="العنوان"
            required
            error={errors.address?.message}
          >
            <textarea
              {...form.register("address")}
              className={profileFieldClass(
                profileTextareaClass,
                Boolean(errors.address),
              )}
              placeholder="أدخل العنوان الكامل"
              rows={3}
              aria-invalid={Boolean(errors.address)}
            />
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label="نبذة تعريفية"
            hint="اختياري — حتى 200 حرف"
            error={errors.bio?.message}
          >
            <textarea
              {...form.register("bio")}
              className={profileFieldClass(
                profileTextareaClass,
                Boolean(errors.bio),
              )}
              placeholder="اكتب نبذة تعريفية عنك..."
              rows={4}
              maxLength={200}
              aria-invalid={Boolean(errors.bio)}
            />
            <div className="text-left font-cairo text-[11px] font-semibold text-[#667085]">
              {bioValue.length}/200
            </div>
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label="تكلفة الاستشارة"
            hint="اختياري — بالليرة السورية"
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
            label="نوع الاستشارات"
            required
            error={errors.consultationMode?.message}
          >
            <div className="space-y-2">
              {consultationModeOptions.map((option) => {
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
            حفظ التغييرات
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="flex h-[44px] w-full items-center justify-center rounded-[8px] border border-[#E4E7EC] bg-white font-cairo text-[13px] font-bold text-[#667085] transition hover:bg-[#F9FAFB]"
          >
            إلغاء
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
