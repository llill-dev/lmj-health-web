'use client';

import { BookOpen, Pill } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import {
  DoctorProfileFormField,
  profileInputClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import StyledSelect from '@/components/ui/styled-select';
import type { DoctorLibraryItemType } from '@/lib/doctor/library/libraryTypes';
import { useI18n } from '@/i18n/provider';

function getLibraryTypeOptions(t: (key: string) => string) {
  const labels: Record<DoctorLibraryItemType, string> = {
    MEDICATION: t('doctor.libraryItemDialog.type.medication'),
    LAB: t('doctor.libraryItemDialog.type.lab'),
    IMAGING: t('doctor.libraryItemDialog.type.imaging'),
    PROCEDURE: t('doctor.libraryItemDialog.type.procedure'),
  };
  return (
    Object.entries(labels) as Array<[DoctorLibraryItemType, string]>
  ).map(([value, label]) => ({ value, label }));
}

export type ClinicalLibraryItemFormValues = {
  type: DoctorLibraryItemType;
  label: string;
  dosage?: string;
  frequency?: string;
};

export function ClinicalLibraryItemFormDialog({
  open,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (values: ClinicalLibraryItemFormValues) => Promise<void>;
}) {
  const { locale, dir, t } = useI18n();
  const libraryTypeOptions = getLibraryTypeOptions(t);
  const [libraryType, setLibraryType] = useState<DoctorLibraryItemType>('MEDICATION');
  const [label, setLabel] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');

  useEffect(() => {
    if (!open) return;
    setLibraryType('MEDICATION');
    setLabel('');
    setDosage('');
    setFrequency('');
  }, [open]);

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title={t('doctor.libraryItemDialog.title')}
      maxWidthClass="max-w-[520px]"
      headerPattern
    >
      <div dir={dir} lang={locale} className="space-y-5 text-start">
        <p className="rounded-[12px] border border-[#E6F4F3] bg-[#F0FDFA] px-4 py-3 font-cairo text-[13px] font-semibold leading-relaxed text-[#667085]">
          {t('doctor.libraryItemDialog.hint')}
        </p>

        <DoctorProfileFormField label={t('doctor.libraryItemDialog.itemTypeLabel')} required>
          <StyledSelect
            size="sm"
            tone="muted"
            value={libraryType}
            onChange={(value) => setLibraryType(value as DoctorLibraryItemType)}
            options={libraryTypeOptions}
            placeholder={t('doctor.libraryItemDialog.itemTypePlaceholder')}
            listboxAriaLabel={t('doctor.libraryItemDialog.itemTypeAria')}
            listboxZIndex={200}
          />
        </DoctorProfileFormField>

        <DoctorProfileFormField label={t('doctor.libraryItemDialog.titleLabel')} required>
          <div className="relative">
            <BookOpen
              className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
              aria-hidden
            />
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder={
                libraryType === 'MEDICATION'
                  ? t('doctor.libraryItemDialog.titlePlaceholderMedication')
                  : t('doctor.libraryItemDialog.titlePlaceholderOther')
              }
              className={`${profileInputClass} pe-4 ps-11`}
            />
          </div>
        </DoctorProfileFormField>

        {libraryType === 'MEDICATION' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DoctorProfileFormField label={t('doctor.libraryItemDialog.dosageLabel')}>
              <div className="relative">
                <Pill
                  className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
                  aria-hidden
                />
                <input
                  value={dosage}
                  onChange={(event) => setDosage(event.target.value)}
                  placeholder="500mg"
                  className={`${profileInputClass} pe-4 ps-11`}
                />
              </div>
            </DoctorProfileFormField>

            <DoctorProfileFormField label={t('doctor.libraryItemDialog.frequencyLabel')}>
              <input
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
                placeholder={t('doctor.libraryItemDialog.frequencyPlaceholder')}
                className={profileInputClass}
              />
            </DoctorProfileFormField>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex h-[48px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-extrabold text-[#667085] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            {t('doctor.libraryItemDialog.cancel')}
          </button>
          <button
            type="button"
            disabled={busy || !label.trim()}
            onClick={() =>
              void onSubmit({
                type: libraryType,
                label: label.trim(),
                dosage: dosage.trim() || undefined,
                frequency: frequency.trim() || undefined,
              })
            }
            className="inline-flex h-[48px] items-center justify-center rounded-[10px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_24px_-4px_rgba(15,143,139,0.35)] transition hover:bg-[#14B3AE] disabled:opacity-60"
          >
            {busy
              ? t('doctor.libraryItemDialog.saving')
              : t('doctor.libraryItemDialog.addToLibrary')}
          </button>
        </div>
      </div>
    </ClinicAccountsModalShell>
  );
}
