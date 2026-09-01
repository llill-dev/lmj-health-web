import {
  DoctorProfileFormField,
  profileFieldClass,
  profileInputClass,
  profileTextareaClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import type { OrderManualFieldMessages } from '@/lib/doctor/orders/orderManualFormSchema';
import type { RadiologyManualForm } from './radiology-types';
import { useI18n } from '@/i18n/provider';

export function RadiologyManualForm({
  value,
  onChange,
  onSave,
  onCancel,
  saving,
  title,
  nameLabel,
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
  const { locale, dir, t } = useI18n();
  const resolvedTitle = title ?? t('doctor.radiologyManualForm.title');
  const resolvedNameLabel = nameLabel ?? t('doctor.radiologyManualForm.nameLabel');
  const set = (patch: Partial<RadiologyManualForm>) =>
    onChange({ ...value, ...patch });

  return (
    <section className="mb-6 space-y-4 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-5 sm:px-5">
      <h2 className="text-start font-cairo text-[16px] font-extrabold text-[#101828]">
        {resolvedTitle}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DoctorProfileFormField
          label={resolvedNameLabel}
          required
          error={fieldErrors.name}
        >
          <input
            dir={dir}
            lang={locale}
            value={value.name}
            onChange={(e) => set({ name: e.target.value })}
            className={profileFieldClass(
              profileInputClass,
              Boolean(fieldErrors.name),
            )}
          />
        </DoctorProfileFormField>
        <DoctorProfileFormField label={t('doctor.radiologyManualForm.typeLabel')} error={fieldErrors.type}>
          <input
            dir={dir}
            lang={locale}
            value={value.type}
            onChange={(e) => set({ type: e.target.value })}
            placeholder={t('doctor.radiologyManualForm.typePlaceholder')}
            className={profileFieldClass(
              profileInputClass,
              Boolean(fieldErrors.type),
            )}
          />
        </DoctorProfileFormField>
        <DoctorProfileFormField label={t('doctor.radiologyManualForm.bodyAreaLabel')} error={fieldErrors.bodyArea}>
          <input
            dir={dir}
            lang={locale}
            value={value.bodyArea}
            onChange={(e) => set({ bodyArea: e.target.value })}
            placeholder={t('doctor.radiologyManualForm.optional')}
            className={profileFieldClass(
              profileInputClass,
              Boolean(fieldErrors.bodyArea),
            )}
          />
        </DoctorProfileFormField>
        <DoctorProfileFormField label={t('doctor.radiologyManualForm.sideLabel')} error={fieldErrors.side}>
          <input
            dir={dir}
            lang={locale}
            value={value.side}
            onChange={(e) => set({ side: e.target.value })}
            className={profileFieldClass(
              profileInputClass,
              Boolean(fieldErrors.side),
            )}
          />
        </DoctorProfileFormField>
        <DoctorProfileFormField label={t('doctor.radiologyManualForm.positionLabel')} error={fieldErrors.position}>
          <input
            dir={dir}
            lang={locale}
            value={value.position}
            onChange={(e) => set({ position: e.target.value })}
            className={profileFieldClass(
              profileInputClass,
              Boolean(fieldErrors.position),
            )}
          />
        </DoctorProfileFormField>
      </div>

      <DoctorProfileFormField label={t('doctor.radiologyManualForm.notesLabel')} error={fieldErrors.notes}>
        <textarea
          dir={dir}
          lang={locale}
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
          {t('doctor.radiologyManualForm.save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex h-12 items-center justify-center rounded-[12px] border-2 border-primary bg-[#E6F4F3] font-cairo text-[14px] font-extrabold text-primary"
        >
          {t('doctor.radiologyManualForm.cancel')}
        </button>
      </div>
    </section>
  );
}
