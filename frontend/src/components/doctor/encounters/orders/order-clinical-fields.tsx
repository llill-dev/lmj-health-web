import {
  DoctorProfileFormField,
  profileFieldClass,
  profileInputClass,
  profileTextareaClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import StyledSelect from '@/components/ui/styled-select';
import type { RadiologyClinicalForm } from '@/components/doctor/radiology/radiology-types';
import type { OrderClinicalFieldMessages } from '@/lib/doctor/orders/orderClinicalFormSchema';
import { getClinicalUrgencySelectOptions } from '@/lib/doctor/referrals/referralPriority';
import type { EncounterOrderClinicalVariant } from './encounter-order-config';
import { useI18n } from '@/i18n/provider';

export function OrderClinicalFields({
  value,
  onChange,
  disabled,
  variant = 'full',
  centerInstructionsLabel,
  fieldErrors = {},
  showFastingCheckbox = false,
  urgencyAsSelect = false,
}: {
  value: RadiologyClinicalForm;
  onChange: (value: RadiologyClinicalForm) => void;
  disabled?: boolean;
  variant?: EncounterOrderClinicalVariant;
  centerInstructionsLabel?: string;
  fieldErrors?: OrderClinicalFieldMessages;
  showFastingCheckbox?: boolean;
  urgencyAsSelect?: boolean;
}) {
  const { locale, dir, t } = useI18n();
  const resolvedCenterInstructionsLabel =
    centerInstructionsLabel ?? t('doctor.orderClinicalFields.centerInstructionsDefault');
  const set = (patch: Partial<RadiologyClinicalForm>) =>
    onChange({ ...value, ...patch });

  const urgencyField = urgencyAsSelect ? (
    <StyledSelect
      size="md"
      tone="muted"
      disabled={disabled}
      value={value.urgency}
      onChange={(next) => set({ urgency: next })}
      error={Boolean(fieldErrors.urgency)}
      placeholder={t('doctor.clinicalUrgency.none')}
      options={getClinicalUrgencySelectOptions(t)}
      listboxAriaLabel={t('doctor.orderClinicalFields.urgencyLabel')}
      triggerClassName={profileFieldClass(
        'w-full',
        Boolean(fieldErrors.urgency),
      )}
    />
  ) : (
    <input
      dir={dir}
      lang={locale}
      value={value.urgency}
      onChange={(e) => set({ urgency: e.target.value })}
      disabled={disabled}
      placeholder={t('doctor.orderClinicalFields.urgencyPlaceholder')}
      className={profileFieldClass(
        profileInputClass,
        Boolean(fieldErrors.urgency),
      )}
    />
  );

  return (
    <section className="mb-6 space-y-4 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-5 sm:px-5">
      <DoctorProfileFormField label={t('doctor.orderClinicalFields.urgencyLabel')} error={fieldErrors.urgency}>
        {urgencyField}
      </DoctorProfileFormField>

      {showFastingCheckbox ? (
        <label className="flex cursor-pointer items-center justify-start gap-2 font-cairo text-[13px] font-bold text-[#344054]">
          <input
            type="checkbox"
            checked={Boolean(value.requiresFasting)}
            onChange={(e) => set({ requiresFasting: e.target.checked })}
            disabled={disabled}
            className="h-4 w-4 rounded border-[#D0D5DD] text-primary focus:ring-primary/30"
          />
          <span>{t('doctor.orderClinicalFields.requiresFasting')}</span>
        </label>
      ) : null}

      {variant === 'full' ? (
        <>
          <DoctorProfileFormField
            label={t('doctor.orderClinicalFields.clinicalReasonLabel')}
            required
            error={fieldErrors.clinicalReason}
          >
            <textarea
              dir={dir}
              lang={locale}
              value={value.clinicalReason}
              onChange={(e) => set({ clinicalReason: e.target.value })}
              disabled={disabled}
              placeholder={t('doctor.orderClinicalFields.clinicalReasonPlaceholder')}
              className={profileFieldClass(
                profileTextareaClass,
                Boolean(fieldErrors.clinicalReason),
              )}
            />
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label={t('doctor.orderClinicalFields.patientNotesLabel')}
            error={fieldErrors.instructionsToPatient}
          >
            <textarea
              dir={dir}
              lang={locale}
              value={value.instructionsToPatient}
              onChange={(e) => set({ instructionsToPatient: e.target.value })}
              disabled={disabled}
              placeholder={t('doctor.orderClinicalFields.patientNotesPlaceholder')}
              className={profileFieldClass(
                profileTextareaClass,
                Boolean(fieldErrors.instructionsToPatient),
              )}
            />
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label={resolvedCenterInstructionsLabel}
            error={fieldErrors.imagingCenterInstructions}
          >
            <textarea
              dir={dir}
              lang={locale}
              value={value.imagingCenterInstructions}
              onChange={(e) =>
                set({ imagingCenterInstructions: e.target.value })
              }
              disabled={disabled}
              placeholder={t('doctor.orderClinicalFields.centerInstructionsPlaceholder')}
              className={profileFieldClass(
                profileTextareaClass,
                Boolean(fieldErrors.imagingCenterInstructions),
              )}
            />
          </DoctorProfileFormField>
        </>
      ) : (
        <DoctorProfileFormField
          label={t('doctor.orderClinicalFields.compactNotesLabel')}
          required
          error={fieldErrors.instructionsToPatient}
        >
          <textarea
            dir={dir}
            lang={locale}
            value={value.instructionsToPatient}
            onChange={(e) => set({ instructionsToPatient: e.target.value })}
            disabled={disabled}
            placeholder={t('doctor.orderClinicalFields.compactNotesPlaceholder')}
            className={profileFieldClass(
              profileTextareaClass,
              Boolean(fieldErrors.instructionsToPatient),
            )}
          />
        </DoctorProfileFormField>
      )}
    </section>
  );
}
