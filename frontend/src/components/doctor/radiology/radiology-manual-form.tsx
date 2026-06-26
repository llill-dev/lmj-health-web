import {
  DoctorProfileFormField,
  profileFieldClass,
  profileInputClass,
  profileTextareaClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import type { OrderManualFieldMessages } from '@/lib/doctor/orders/orderManualFormSchema';
import type { RadiologyManualForm } from './radiology-types';

export function RadiologyManualForm({
  value,
  onChange,
  onSave,
  onCancel,
  saving,
  title = 'إدخال يدوياً',
  nameLabel = 'الاسم',
  fieldErrors = {},
}: {
  value: RadiologyManualForm;
  onChange: (value: RadiologyManualForm) => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  title?: string;
  nameLabel?: string;
  fieldErrors?: OrderManualFieldMessages;
}) {
  const set = (patch: Partial<RadiologyManualForm>) =>
    onChange({ ...value, ...patch });

  return (
    <section className="mb-6 space-y-4 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-5 sm:px-5">
      <h2 className="text-right font-cairo text-[16px] font-extrabold text-[#101828]">
        {title}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DoctorProfileFormField
          label={nameLabel}
          required
          error={fieldErrors.name}
        >
          <input
            dir="rtl"
            lang="ar"
            value={value.name}
            onChange={(e) => set({ name: e.target.value })}
            className={profileFieldClass(
              profileInputClass,
              Boolean(fieldErrors.name),
            )}
          />
        </DoctorProfileFormField>
        <DoctorProfileFormField label="النوع" error={fieldErrors.type}>
          <input
            dir="rtl"
            lang="ar"
            value={value.type}
            onChange={(e) => set({ type: e.target.value })}
            placeholder="مثال: عينة دم، بول"
            className={profileFieldClass(
              profileInputClass,
              Boolean(fieldErrors.type),
            )}
          />
        </DoctorProfileFormField>
        <DoctorProfileFormField label="منطقة الجسم" error={fieldErrors.bodyArea}>
          <input
            dir="rtl"
            lang="ar"
            value={value.bodyArea}
            onChange={(e) => set({ bodyArea: e.target.value })}
            placeholder="اختياري"
            className={profileFieldClass(
              profileInputClass,
              Boolean(fieldErrors.bodyArea),
            )}
          />
        </DoctorProfileFormField>
        <DoctorProfileFormField label="الجهة" error={fieldErrors.side}>
          <input
            dir="rtl"
            lang="ar"
            value={value.side}
            onChange={(e) => set({ side: e.target.value })}
            className={profileFieldClass(
              profileInputClass,
              Boolean(fieldErrors.side),
            )}
          />
        </DoctorProfileFormField>
        <DoctorProfileFormField label="الوضعية" error={fieldErrors.position}>
          <input
            dir="rtl"
            lang="ar"
            value={value.position}
            onChange={(e) => set({ position: e.target.value })}
            className={profileFieldClass(
              profileInputClass,
              Boolean(fieldErrors.position),
            )}
          />
        </DoctorProfileFormField>
      </div>

      <DoctorProfileFormField label="ملاحظات" error={fieldErrors.notes}>
        <textarea
          dir="rtl"
          lang="ar"
          value={value.notes}
          onChange={(e) => set({ notes: e.target.value })}
          className={`${profileTextareaClass} min-h-[88px] ${
            fieldErrors.notes ? 'border-[#FDA29B] focus:border-[#F04438]' : ''
          }`}
        />
      </DoctorProfileFormField>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex h-12 items-center justify-center rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
        >
          حفظ
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex h-12 items-center justify-center rounded-[12px] border-2 border-primary bg-[#E6F4F3] font-cairo text-[14px] font-extrabold text-primary"
        >
          إلغاء
        </button>
      </div>
    </section>
  );
}
