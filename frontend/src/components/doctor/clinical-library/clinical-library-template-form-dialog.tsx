'use client';

import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import {
  DoctorProfileFormField,
  profileInputClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import StyledSelect from '@/components/ui/styled-select';
import type { DoctorTemplateType } from '@/lib/doctor/templateTypes';

const TEMPLATE_TYPE_LABELS: Record<DoctorTemplateType, string> = {
  PRESCRIPTION: 'وصفة',
  LAB_ORDER: 'طلب مخبري',
  IMAGING_ORDER: 'طلب أشعة',
  PROCEDURE_ORDER: 'طلب إجراء',
  REFERRAL_ORDER: 'إحالة',
};

const TEMPLATE_TYPE_OPTIONS = (
  Object.entries(TEMPLATE_TYPE_LABELS) as Array<[DoctorTemplateType, string]>
).map(([value, label]) => ({ value, label }));

export type ClinicalLibraryTemplateFormValues = {
  type: DoctorTemplateType;
  name: string;
  description?: string;
};

export function ClinicalLibraryTemplateFormDialog({
  open,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (values: ClinicalLibraryTemplateFormValues) => Promise<void>;
}) {
  const [templateType, setTemplateType] =
    useState<DoctorTemplateType>('PRESCRIPTION');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) return;
    setTemplateType('PRESCRIPTION');
    setName('');
    setDescription('');
  }, [open]);

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title="قالب جديد"
      maxWidthClass="max-w-[520px]"
      headerPattern
    >
      <div dir="rtl" lang="ar" className="space-y-5 text-right">
        <p className="rounded-[12px] border border-[#E6F4F3] bg-[#F0FDFA] px-4 py-3 font-cairo text-[13px] font-semibold leading-relaxed text-[#667085]">
          أنشئ قالباً جاهزاً للوصفات وطلبات المختبر والأشعة والإحالات.
        </p>

        <DoctorProfileFormField label="نوع القالب" required>
          <StyledSelect
            size="sm"
            tone="muted"
            value={templateType}
            onChange={(value) => setTemplateType(value as DoctorTemplateType)}
            options={TEMPLATE_TYPE_OPTIONS}
            placeholder="اختر نوع القالب"
            listboxAriaLabel="نوع القالب"
            listboxZIndex={200}
          />
        </DoctorProfileFormField>

        <DoctorProfileFormField label="اسم القالب" required>
          <div className="relative">
            <FileText
              className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
              aria-hidden
            />
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="مثال: قالب وصفة عامة"
              className={`${profileInputClass} pe-4 ps-11`}
            />
          </div>
        </DoctorProfileFormField>

        <DoctorProfileFormField label="الوصف">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="وصف اختياري للقالب"
            rows={3}
            className={`${profileInputClass} min-h-[96px] resize-y py-3`}
          />
        </DoctorProfileFormField>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex h-[48px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-extrabold text-[#667085] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={busy || !name.trim()}
            onClick={() =>
              void onSubmit({
                type: templateType,
                name: name.trim(),
                description: description.trim() || undefined,
              })
            }
            className="inline-flex h-[48px] items-center justify-center rounded-[10px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_24px_-4px_rgba(15,143,139,0.35)] transition hover:bg-[#14B3AE] disabled:opacity-60"
          >
            {busy ? 'جارٍ الحفظ...' : 'حفظ القالب'}
          </button>
        </div>
      </div>
    </ClinicAccountsModalShell>
  );
}
