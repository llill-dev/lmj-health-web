'use client';

import { Copy, FileText } from 'lucide-react';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import type { DoctorTemplateType } from '@/lib/doctor/templates/templateTypes';
import { summarizeTemplateApplication } from '@/lib/doctor/templates/templateDraftStorage';
import { useI18n } from '@/i18n/provider';

const TYPE_LABELS: Record<DoctorTemplateType, string> = {
  PRESCRIPTION: 'وصفة',
  LAB_ORDER: 'طلب مخبري',
  IMAGING_ORDER: 'طلب أشعة',
  PROCEDURE_ORDER: 'طلب إجراء',
  REFERRAL_ORDER: 'إحالة',
};

export function ClinicalLibraryTemplateApplyDialog({
  open,
  templateName,
  templateType,
  application,
  onClose,
}: {
  open: boolean;
  templateName: string;
  templateType?: DoctorTemplateType;
  application?: Record<string, unknown>;
  onClose: () => void;
}) {
  const { locale, dir } = useI18n();
  const summaryLines = summarizeTemplateApplication(application);
  const jsonPreview = application
    ? JSON.stringify(application, null, 2)
    : '{}';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonPreview);
    } catch {
      // ignore
    }
  };

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title="مسودة القالب"
      maxWidthClass="max-w-[560px]"
      headerPattern
    >
      <div dir={dir} lang={locale} className="space-y-5 text-start">
        <p className="rounded-[12px] border border-[#E6F4F3] bg-[#F0FDFA] px-4 py-3 font-cairo text-[13px] font-semibold leading-relaxed text-[#667085]">
          تم تحميل مسودة جاهزة من القالب. يمكنك نسخها أو استخدامها عند إنشاء
          وصفة أو طلب في الزيارة الطبية.
        </p>

        <div className="flex items-start gap-3 rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#E6F4F3]">
            <FileText className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-cairo text-[14px] font-extrabold text-[#111827]">
              {templateName}
            </p>
            {templateType ? (
              <p className="mt-0.5 font-cairo text-[12px] font-semibold text-[#667085]">
                {TYPE_LABELS[templateType] ?? templateType}
              </p>
            ) : null}
          </div>
        </div>

        {summaryLines.length > 0 ? (
          <div>
            <h3 className="mb-2 font-cairo text-[13px] font-extrabold text-[#111827]">
              ملخص المسودة
            </h3>
            <ul className="space-y-1 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-3">
              {summaryLines.map((line) => (
                <li
                  key={line}
                  className="font-cairo text-[12px] font-semibold text-[#475467]"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="font-cairo text-[13px] font-extrabold text-[#111827]">
              بيانات JSON
            </h3>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-1 font-cairo text-[12px] font-extrabold text-primary transition hover:text-[#14B3AE]"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
              نسخ
            </button>
          </div>
          <pre className="max-h-[220px] overflow-auto rounded-[12px] border border-[#EEF2F6] bg-[#F9FAFB] p-4 text-end font-mono text-[11px] leading-relaxed text-[#344054]">
            {jsonPreview}
          </pre>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-[48px] w-full items-center justify-center rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white"
        >
          تم
        </button>
      </div>
    </ClinicAccountsModalShell>
  );
}
