'use client';

import { FileText, Loader2 } from 'lucide-react';
import { PlatformModalShell } from '@/components/platform/platform-modal-shell';
import type { PlatformLegalDocument } from '@/lib/platform/types';

export function LegalDocumentDialog({
  open,
  onClose,
  document,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  document: PlatformLegalDocument;
  loading?: boolean;
}) {
  return (
    <PlatformModalShell open={open} onClose={onClose} title={document.title}>
      <div className="rounded-[14px] border border-[#99F6E4] bg-white p-5 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-end gap-3">
              <h3 className="font-cairo text-[16px] font-extrabold text-[#111827]">
                {document.sectionTitle}
              </h3>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_14px_rgba(15,143,139,0.35)]">
                <FileText className="h-5 w-5" aria-hidden />
              </div>
            </div>

            <p className="whitespace-pre-line text-start font-cairo text-[13px] font-semibold leading-[26px] text-[#667085]">
              {document.body}
            </p>

            <div className="mt-6 rounded-[10px] bg-[#F0FDFA] px-4 py-3 text-center font-cairo text-[12px] font-extrabold text-primary">
              {document.pageVersion
                ? `الإصدار ${document.pageVersion}`
                : null}
              {document.pageVersion ? ' • ' : null}
              آخر تحديث: {document.lastUpdated}
            </div>
          </>
        )}
      </div>
    </PlatformModalShell>
  );
}
