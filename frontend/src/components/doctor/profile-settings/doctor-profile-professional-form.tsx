'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import DoctorProfileConfirmDialog from '@/components/doctor/profile-settings/doctor-profile-confirm-dialog';
import DoctorProfileHeroCard from '@/components/doctor/profile-settings/doctor-profile-hero-card';
import DoctorProfileInfoBanner from '@/components/doctor/profile-settings/doctor-profile-info-banner';
import {
  DoctorProfileFormField,
  profileFieldClass,
  profileInputClass,
  profileTextareaClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import {
  doctorProfessionalEditSchema,
  PROFILE_FIELD_MESSAGES,
  type DoctorProfessionalEditForm,
} from '@/components/doctor/profile-settings/doctor-profile-schemas';
import { useDoctorProfileConfirm } from '@/components/doctor/profile-settings/use-doctor-profile-confirm';
import type { DoctorProfileRecord } from '@/lib/doctor/profileClient';

export default function DoctorProfileProfessionalForm({
  doctor,
  busy,
  onSubmit,
  onNoChanges,
}: {
  doctor: DoctorProfileRecord;
  busy?: boolean;
  onSubmit: (values: DoctorProfessionalEditForm) => Promise<void>;
  onNoChanges?: () => void;
}) {
  const navigate = useNavigate();
  const user = doctor.user;
  const {
    confirmKind,
    confirmOpen,
    requestConfirm,
    closeConfirm,
    handleConfirm,
  } = useDoctorProfileConfirm();

  const form = useForm<DoctorProfessionalEditForm>({
    resolver: zodResolver(doctorProfessionalEditSchema),
    mode: 'onTouched',
    defaultValues: {
      medicalLicenseNumber: doctor.medicalLicenseNumber?.trim() ?? '',
      specialization: doctor.specialization?.trim() ?? '',
      education: doctor.education?.trim() ?? '',
      clinicAddress: doctor.clinicAddress?.trim() ?? '',
      locationCountry: doctor.locationCountry?.trim() ?? '',
      locationCity: doctor.locationCity?.trim() ?? '',
      clinicLat:
        doctor.clinicLat != null && !Number.isNaN(doctor.clinicLat)
          ? String(doctor.clinicLat)
          : '',
      clinicLng:
        doctor.clinicLng != null && !Number.isNaN(doctor.clinicLng)
          ? String(doctor.clinicLng)
          : '',
    },
  });

  const errors = form.formState.errors;
  const isDirty = form.formState.isDirty;

  const handleCancel = () => {
    if (!isDirty) {
      navigate('/doctor/profile-settings');
      return;
    }
    requestConfirm('cancel-professional', () => {
      navigate('/doctor/profile-settings');
    });
  };

  const handleValidatedSubmit = (values: DoctorProfessionalEditForm) => {
    if (!isDirty) {
      form.setError('root', {
        message: PROFILE_FIELD_MESSAGES.noProfessionalChanges,
      });
      onNoChanges?.();
      return;
    }

    requestConfirm('save-professional', async () => {
      await onSubmit(values);
    });
  };

  return (
    <div dir="rtl" lang="ar" className="space-y-5">
      <DoctorProfileHeroCard
        fullName={user?.fullName}
        specialization={doctor.specialization}
        photoUrl={user?.photoUrl}
        isApproved={doctor.isApproved}
      />

      <div className="rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.08)]">
        <h2 className="text-center font-cairo text-[15px] font-extrabold text-primary">
          تعديل المعلومات المهنية
        </h2>

        <div className="mt-4 space-y-3">
          <DoctorProfileInfoBanner tone="warning">
            التعديلات على المعلومات المهنية تتطلب موافقة الإدارة قبل تطبيقها
          </DoctorProfileInfoBanner>
          <DoctorProfileInfoBanner>
            ملاحظة مهمة: سيتم مراجعة التغييرات من قبل فريق الإدارة خلال 24–48
            ساعة. سيتم إشعارك بنتيجة المراجعة.
          </DoctorProfileInfoBanner>
        </div>

        {errors.root?.message ? (
          <p
            role="alert"
            className="mt-4 rounded-[10px] border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-right font-cairo text-[12px] font-bold text-[#B42318]"
          >
            {errors.root.message}
          </p>
        ) : null}

        <form
          className="mt-6 space-y-5"
          noValidate
          onSubmit={form.handleSubmit(handleValidatedSubmit)}
        >
          <DoctorProfileFormField
            label="رقم الشهادة الطبية"
            required
            error={errors.medicalLicenseNumber?.message}
          >
            <input
              {...form.register('medicalLicenseNumber')}
              className={profileFieldClass(
                profileInputClass,
                Boolean(errors.medicalLicenseNumber),
              )}
              placeholder="MED-12345"
              aria-invalid={Boolean(errors.medicalLicenseNumber)}
            />
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label="التخصص"
            required
            error={errors.specialization?.message}
          >
            <input
              {...form.register('specialization')}
              className={profileFieldClass(
                profileInputClass,
                Boolean(errors.specialization),
              )}
              placeholder="طب القلب"
              aria-invalid={Boolean(errors.specialization)}
            />
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label="التعليم"
            required
            error={errors.education?.message}
          >
            <textarea
              {...form.register('education')}
              className={profileFieldClass(
                profileTextareaClass,
                Boolean(errors.education),
              )}
              placeholder="مثال: بكالوريوس طب وجراحة — جامعة الملك سعود"
              rows={3}
              aria-invalid={Boolean(errors.education)}
            />
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label="عنوان العيادة"
            required
            error={errors.clinicAddress?.message}
          >
            <textarea
              {...form.register('clinicAddress')}
              className={profileFieldClass(
                profileTextareaClass,
                Boolean(errors.clinicAddress),
              )}
              placeholder="أدخل عنوان العيادة بالكامل"
              rows={3}
              aria-invalid={Boolean(errors.clinicAddress)}
            />
          </DoctorProfileFormField>

          <div>
            <h3 className="mb-3 font-cairo text-[14px] font-extrabold text-primary">
              موقع العيادة
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <DoctorProfileFormField
                label="البلد"
                hint="اختياري"
                error={errors.locationCountry?.message}
              >
                <input
                  {...form.register('locationCountry')}
                  className={profileFieldClass(
                    profileInputClass,
                    Boolean(errors.locationCountry),
                  )}
                  placeholder="سوريا"
                />
              </DoctorProfileFormField>
              <DoctorProfileFormField
                label="المدينة"
                hint="اختياري"
                error={errors.locationCity?.message}
              >
                <input
                  {...form.register('locationCity')}
                  className={profileFieldClass(
                    profileInputClass,
                    Boolean(errors.locationCity),
                  )}
                  placeholder="الرياض"
                />
              </DoctorProfileFormField>
            </div>
          </div>

          <div>
            <h3 className="font-cairo text-[14px] font-extrabold text-primary">
              إحداثيات العيادة
            </h3>
            <p className="mt-1 font-cairo text-[11px] font-semibold text-[#667085]">
              اختياري — يمكن الحصول على الإحداثيات من خرائط جوجل
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <DoctorProfileFormField
                label="خط العرض"
                error={errors.clinicLat?.message}
              >
                <input
                  {...form.register('clinicLat')}
                  className={profileFieldClass(
                    profileInputClass,
                    Boolean(errors.clinicLat),
                  )}
                  placeholder="24.7136"
                  inputMode="decimal"
                  aria-invalid={Boolean(errors.clinicLat)}
                />
              </DoctorProfileFormField>
              <DoctorProfileFormField
                label="خط الطول"
                error={errors.clinicLng?.message}
              >
                <input
                  {...form.register('clinicLng')}
                  className={profileFieldClass(
                    profileInputClass,
                    Boolean(errors.clinicLng),
                  )}
                  placeholder="46.6753"
                  inputMode="decimal"
                  aria-invalid={Boolean(errors.clinicLng)}
                />
              </DoctorProfileFormField>
            </div>

            <div className="mt-4 rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
              <p className="font-cairo text-[12px] font-extrabold text-[#92400E]">
                كيفية الحصول على الإحداثيات:
              </p>
              <ol className="mt-2 list-decimal space-y-1 ps-5 text-right font-cairo text-[11px] font-semibold leading-[18px] text-[#92400E]">
                <li>افتح خرائط Google على جهازك</li>
                <li>ابحث عن موقع العيادة أو انقر عليه</li>
                <li>اضغط مطولاً على الموقع لإظهار الإحداثيات</li>
                <li>انسخ خط العرض (Latitude) وخط الطول (Longitude)</li>
                <li>الصق القيم في الحقول أعلاه</li>
              </ol>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[8px] bg-primary font-cairo text-[14px] font-extrabold text-white transition hover:bg-[#0A7A77] disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            إرسال للمراجعة
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="flex h-[44px] w-full items-center justify-center font-cairo text-[13px] font-bold text-[#667085] transition hover:text-primary"
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

export type { DoctorProfessionalEditForm };
