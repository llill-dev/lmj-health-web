'use client';

import { Download, Eye, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { openConsultationAttachmentDownload } from '@/lib/consultations/downloadAttachment';
import { getPatientFileAccessErrorMessage } from '@/lib/doctor/writeFlowErrors';
import type { ConsultationAttachmentFile } from '@/lib/consultations/types';
import { cn } from '@/lib/utils/utils';

export type ConsultationAttachmentItem = ConsultationAttachmentFile & {
  senderLabel?: string;
};

export default function ConsultationAttachmentList({
  attachments,
  doctorId,
  patientId,
  title = 'المرفقات',
  variant = 'chips',
}: {
  attachments: ConsultationAttachmentItem[];
  doctorId: string;
  patientId: string;
  title?: string;
  variant?: 'chips' | 'cards';
}) {
  const { toast } = useToast();
  const [loadingRef, setLoadingRef] = useState<string | null>(null);

  if (!attachments.length) return null;

  const handleAttachmentAction = async (
    attachment: ConsultationAttachmentItem,
    mode: 'open' | 'download',
  ) => {
    const key =
      attachment.fileId ?? attachment.ref ?? attachment.fileName ?? 'attachment';
    if (!doctorId || !patientId) return;
    setLoadingRef(key);
    try {
      await openConsultationAttachmentDownload(
        doctorId,
        patientId,
        attachment,
        mode,
      );
    } catch (error) {
      toast(getPatientFileAccessErrorMessage(error, mode), {
        title: mode === 'download' ? 'تعذّر تنزيل المرفق' : 'تعذّر فتح المرفق',
        variant: 'error',
      });
    } finally {
      setLoadingRef(null);
    }
  };

  if (variant === 'cards') {
    return (
      <div className="mt-3">
        <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
          {title}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {attachments.map((attachment) => {
            const key =
              attachment.fileId ??
              attachment.ref ??
              attachment.fileName ??
              'attachment';
            const label =
              attachment.fileName?.trim() ||
              attachment.ref?.split('/').pop() ||
              'ملف مرفق';
            const isLoading = loadingRef === key;

            return (
              <div
                key={key}
                className="rounded-[10px] border border-[#E2E8F0] bg-[#F9FAFB] px-3 py-3"
              >
                <div className="font-cairo text-[11px] font-semibold text-[#667085]">
                  الجهة المرسلة:{' '}
                  <span className="font-extrabold text-[#111827]">
                    {attachment.senderLabel ?? '—'}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate font-cairo text-[12px] font-extrabold text-[#111827]">
                    {label}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!doctorId || !patientId || isLoading}
                    onClick={() =>
                      void handleAttachmentAction(attachment, 'open')
                    }
                    className={cn(
                      'inline-flex h-[30px] items-center gap-1.5 rounded-[6px] border border-[#D1E9FF] bg-white px-3 font-cairo text-[11px] font-extrabold text-primary disabled:opacity-60',
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    عرض
                  </button>
                  <button
                    type="button"
                    disabled={!doctorId || !patientId || isLoading}
                    onClick={() =>
                      void handleAttachmentAction(attachment, 'download')
                    }
                    className={cn(
                      'inline-flex h-[30px] items-center gap-1.5 rounded-[6px] border border-[#E2E8F0] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#475467] disabled:opacity-60',
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    تحميل
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="font-cairo text-[11px] font-bold text-[#98A2B3]">{title}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {attachments.map((attachment) => {
          const key =
            attachment.fileId ?? attachment.ref ?? attachment.fileName ?? 'attachment';
          const label =
            attachment.fileName?.trim() ||
            attachment.ref?.split('/').pop() ||
            'ملف مرفق';

          return (
            <button
              key={key}
              type="button"
              disabled={!doctorId || !patientId || loadingRef === key}
              onClick={() => void handleAttachmentAction(attachment, 'open')}
              className="inline-flex h-[28px] max-w-full items-center gap-2 rounded-[6px] border border-[#D1E9FF] bg-[#EFF8FF] px-3 font-cairo text-[11px] font-extrabold text-primary disabled:opacity-60"
            >
              {loadingRef === key ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileText className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
