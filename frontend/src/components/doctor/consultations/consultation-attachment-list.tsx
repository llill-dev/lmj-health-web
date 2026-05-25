'use client';

import { FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { openConsultationAttachmentDownload } from '@/lib/consultations/downloadAttachment';
import type { ConsultationAttachmentFile } from '@/lib/consultations/types';

export default function ConsultationAttachmentList({
  attachments,
  doctorId,
  patientId,
  title = 'المرفقات',
}: {
  attachments: ConsultationAttachmentFile[];
  doctorId: string;
  patientId: string;
  title?: string;
}) {
  const { toast } = useToast();
  const [loadingRef, setLoadingRef] = useState<string | null>(null);

  if (!attachments.length) return null;

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
              onClick={async () => {
                if (!doctorId || !patientId) return;
                setLoadingRef(key);
                try {
                  await openConsultationAttachmentDownload(
                    doctorId,
                    patientId,
                    attachment,
                  );
                } catch (error) {
                  toast(getUserFacingRequestErrorMessage(error), {
                    title: 'تعذّر فتح المرفق',
                    variant: 'error',
                  });
                } finally {
                  setLoadingRef(null);
                }
              }}
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
