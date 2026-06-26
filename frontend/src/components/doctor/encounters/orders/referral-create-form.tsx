'use client';

import { AlertTriangle } from 'lucide-react';
import {
  DoctorProfileFormField,
  profileFieldClass,
  profileInputClass,
  profileTextareaClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import type { ReferralFormState } from '@/lib/doctor/referrals/referralFormSchema';
import type { ReferralFormFieldMessages } from '@/lib/doctor/referrals/referralFormSchema';

const PRIORITY_OPTIONS: Array<{
  value: ReferralFormState['priority'];
  label: string;
}> = [
  { value: 'normal', label: 'عادي (منخفض)' },
  { value: 'urgent', label: 'عاجل (متوسط)' },
  { value: 'emergency', label: 'طارئ (عالي)' },
];

export function ReferralCreateForm({
  value,
  onChange,
  disabled,
  fieldErrors = {},
}: {
  value: ReferralFormState;
  onChange: (value: ReferralFormState) => void;
  disabled?: boolean;
  fieldErrors?: ReferralFormFieldMessages;
}) {
  const set = (patch: Partial<ReferralFormState>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <section className="space-y-4 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-5 sm:px-5">
        <DoctorProfileFormField
          label="نوع التحويل"
          error={fieldErrors.referralType}
        >
          <input
            className={profileFieldClass(
              profileInputClass,
              Boolean(fieldErrors.referralType),
            )}
            value={value.referralType}
            disabled={disabled}
            onChange={(e) => set({ referralType: e.target.value })}
            placeholder="مثال: استشارة / إحالة داخلية"
            maxLength={80}
          />
        </DoctorProfileFormField>

        <DoctorProfileFormField
          label="التخصص"
          required
          error={fieldErrors.specialty}
        >
          <input
            className={profileFieldClass(
              profileInputClass,
              Boolean(fieldErrors.specialty),
            )}
            value={value.specialty}
            disabled={disabled}
            onChange={(e) => set({ specialty: e.target.value })}
            placeholder="مثال: قلب — جراحة"
            maxLength={120}
          />
        </DoctorProfileFormField>

        <DoctorProfileFormField
          label="سبب التحويل"
          required
          error={fieldErrors.reason}
        >
          <input
            className={profileFieldClass(
              profileInputClass,
              Boolean(fieldErrors.reason),
            )}
            value={value.reason}
            disabled={disabled}
            onChange={(e) => set({ reason: e.target.value })}
            placeholder="سبب التحويل السريري"
            maxLength={2000}
          />
        </DoctorProfileFormField>

        <DoctorProfileFormField
          label="تفاصيل الحالة"
          error={fieldErrors.clinicalSummary}
        >
          <textarea
            className={profileFieldClass(
              profileTextareaClass,
              Boolean(fieldErrors.clinicalSummary),
            )}
            rows={4}
            value={value.clinicalSummary}
            disabled={disabled}
            onChange={(e) => set({ clinicalSummary: e.target.value })}
            placeholder="ملخص الحالة والتاريخ المرضي ذي الصلة"
            maxLength={5000}
          />
        </DoctorProfileFormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DoctorProfileFormField
            label="الطبيب المحوّل إليه"
            error={fieldErrors.referredDoctorName}
          >
            <input
              className={profileFieldClass(
                profileInputClass,
                Boolean(fieldErrors.referredDoctorName),
              )}
              value={value.referredDoctorName}
              disabled={disabled}
              onChange={(e) => set({ referredDoctorName: e.target.value })}
              maxLength={120}
            />
          </DoctorProfileFormField>
          <DoctorProfileFormField
            label="المؤسسة / المستشفى"
            error={fieldErrors.institution}
          >
            <input
              className={profileFieldClass(
                profileInputClass,
                Boolean(fieldErrors.institution),
              )}
              value={value.institution}
              disabled={disabled}
              onChange={(e) => set({ institution: e.target.value })}
              maxLength={200}
            />
          </DoctorProfileFormField>
        </div>

        <div dir="rtl" className="text-start">
          <p className="mb-2 font-cairo text-[12px] font-extrabold text-[#344054]">
            درجة الأهمية
          </p>
          <div className="flex flex-wrap gap-4 justify-start">
            {PRIORITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="inline-flex cursor-pointer items-center gap-2 font-cairo text-[13px] font-semibold text-[#344054]"
              >
                <input
                  type="radio"
                  name="referral-priority"
                  checked={value.priority === option.value}
                  disabled={disabled}
                  onChange={() => set({ priority: option.value })}
                  className="h-4 w-4 accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>
          {fieldErrors.priority ? (
            <p
              role="alert"
              className="mt-2 text-start font-cairo text-[11px] font-bold text-[#D92D20]"
            >
              {fieldErrors.priority}
            </p>
          ) : null}
        </div>

        <DoctorProfileFormField
          label="أسئلة للطبيب المستقبل"
          error={fieldErrors.questionsToColleague}
        >
          <textarea
            className={profileFieldClass(
              profileTextareaClass,
              Boolean(fieldErrors.questionsToColleague),
            )}
            rows={3}
            value={value.questionsToColleague}
            disabled={disabled}
            onChange={(e) => set({ questionsToColleague: e.target.value })}
            maxLength={2000}
          />
        </DoctorProfileFormField>

        <DoctorProfileFormField
          label="ملاحظات للطبيب المستقبل"
          error={fieldErrors.notes}
        >
          <textarea
            className={profileFieldClass(
              profileTextareaClass,
              Boolean(fieldErrors.notes),
            )}
            rows={3}
            value={value.notes}
            disabled={disabled}
            onChange={(e) => set({ notes: e.target.value })}
            maxLength={2000}
          />
        </DoctorProfileFormField>
      </section>

      <div
        dir="rtl"
        className="rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3"
      >
        <div className="flex w-full items-start justify-start gap-2 text-start">
          <AlertTriangle
            className="h-5 w-5 shrink-0 text-[#B45309]"
            aria-hidden
          />
          <p className="font-cairo text-[12px] font-semibold leading-6 text-[#B45309]">
            تأكد من صحة جميع المعلومات قبل الإرسال أو الاعتماد النهائي.
          </p>
        </div>
      </div>
    </div>
  );
}
