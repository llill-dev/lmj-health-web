import {
  DoctorProfileFormField,
  profileFieldClass,
  profileInputClass,
  profileTextareaClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import StyledSelect from '@/components/ui/styled-select';
import type { RadiologyClinicalForm } from '@/components/doctor/radiology/radiology-types';
import type { OrderClinicalFieldMessages } from '@/lib/doctor/orderClinicalFormSchema';
import { CLINICAL_URGENCY_SELECT_OPTIONS } from '@/lib/doctor/referralPriority';
import type { EncounterOrderClinicalVariant } from './encounter-order-config';

export function OrderClinicalFields({
  value,
  onChange,
  disabled,
  variant = 'full',
  centerInstructionsLabel = 'تعليمات للمختبر / مركز الأشعة',
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
      placeholder="— بدون —"
      options={CLINICAL_URGENCY_SELECT_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      }))}
      listboxAriaLabel="درجة الاستعجال"
      triggerClassName={profileFieldClass(
        'w-full',
        Boolean(fieldErrors.urgency),
      )}
    />
  ) : (
    <input
      dir="rtl"
      lang="ar"
      value={value.urgency}
      onChange={(e) => set({ urgency: e.target.value })}
      disabled={disabled}
      placeholder="مثال: عادي / عاجل / طارئ"
      className={profileFieldClass(
        profileInputClass,
        Boolean(fieldErrors.urgency),
      )}
    />
  );

  return (
    <section className="mb-6 space-y-4 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-5 sm:px-5">
      <DoctorProfileFormField label="درجة الاستعجال" error={fieldErrors.urgency}>
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
          <span>يتطلب صيام</span>
        </label>
      ) : null}

      {variant === 'full' ? (
        <>
          <DoctorProfileFormField
            label="السبب الطبي"
            required
            error={fieldErrors.clinicalReason}
          >
            <textarea
              dir="rtl"
              lang="ar"
              value={value.clinicalReason}
              onChange={(e) => set({ clinicalReason: e.target.value })}
              disabled={disabled}
              placeholder="مثال: متابعة حالة مرضية، اشتباه في عدوى..."
              className={profileFieldClass(
                profileTextareaClass,
                Boolean(fieldErrors.clinicalReason),
              )}
            />
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label="ملاحظات وتعليمات للمريض"
            error={fieldErrors.instructionsToPatient}
          >
            <textarea
              dir="rtl"
              lang="ar"
              value={value.instructionsToPatient}
              onChange={(e) => set({ instructionsToPatient: e.target.value })}
              disabled={disabled}
              placeholder="أضف تعليمات للمريض..."
              className={profileFieldClass(
                profileTextareaClass,
                Boolean(fieldErrors.instructionsToPatient),
              )}
            />
          </DoctorProfileFormField>

          <DoctorProfileFormField
            label={centerInstructionsLabel}
            error={fieldErrors.imagingCenterInstructions}
          >
            <textarea
              dir="rtl"
              lang="ar"
              value={value.imagingCenterInstructions}
              onChange={(e) =>
                set({ imagingCenterInstructions: e.target.value })
              }
              disabled={disabled}
              placeholder="تعليمات فنية للمختبر..."
              className={profileFieldClass(
                profileTextareaClass,
                Boolean(fieldErrors.imagingCenterInstructions),
              )}
            />
          </DoctorProfileFormField>
        </>
      ) : (
        <DoctorProfileFormField
          label="ملاحظات وتعليمات"
          required
          error={fieldErrors.instructionsToPatient}
        >
          <textarea
            dir="rtl"
            lang="ar"
            value={value.instructionsToPatient}
            onChange={(e) => set({ instructionsToPatient: e.target.value })}
            disabled={disabled}
            placeholder="أضف ملاحظات للمريض..."
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
