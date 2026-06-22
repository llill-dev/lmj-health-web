'use client';

import { FileText, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useEncounterDocumentMutations,
  useEncounterDocuments,
} from '@/hooks/doctor/useEncounterDocuments';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import type { EncounterDocumentLinkBody } from '@/lib/doctor/encounterDocumentsTypes';

export function EncounterDocumentsPanel({
  doctorId,
  patientId,
  encounterId,
  linkCandidates = [],
}: {
  doctorId: string;
  patientId: string;
  encounterId: string;
  linkCandidates?: Array<{
    label: string;
    body: EncounterDocumentLinkBody;
  }>;
}) {
  const { toast } = useToast();
  const documentsQuery = useEncounterDocuments(
    doctorId,
    patientId,
    encounterId,
  );
  const mutations = useEncounterDocumentMutations(
    doctorId,
    patientId,
    encounterId,
  );

  const handleLink = async (body: EncounterDocumentLinkBody, label: string) => {
    try {
      await mutations.linkDocument(body);
      toast(`تم ربط "${label}" بمستندات الزيارة.`, { variant: 'success' });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });
    }
  };

  const handleShare = async (documentId: string, title: string) => {
    const shareNote = window.prompt('ملاحظة للمريض (اختياري):') ?? undefined;
    try {
      await mutations.shareDocument({
        documentId,
        shareNote: shareNote?.trim() || undefined,
      });
      toast(`تمت مشاركة "${title}" مع المريض.`, { variant: 'success' });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });
    }
  };

  return (
    <section
      dir="rtl"
      lang="ar"
      className="rounded-[12px] border border-[#EEF2F6] bg-white p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="font-cairo text-[16px] font-black text-[#111827]">
          مستندات الزيارة
        </h2>
      </div>

      {linkCandidates.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {linkCandidates.map((candidate) => (
            <button
              key={`${candidate.body.sourceType}-${candidate.body.sourceId}`}
              type="button"
              disabled={mutations.isBusy}
              onClick={() => void handleLink(candidate.body, candidate.label)}
              className="rounded-[8px] border border-primary px-3 py-2 font-cairo text-[12px] font-extrabold text-primary disabled:opacity-60"
            >
              ربط {candidate.label}
            </button>
          ))}
        </div>
      ) : null}

      {documentsQuery.isAwaitingData ? (
        <p className="font-cairo text-[13px] font-semibold text-[#667085]">
          جارٍ تحميل المستندات...
        </p>
      ) : documentsQuery.documents.length === 0 ? (
        <p className="font-cairo text-[13px] font-semibold text-[#98A2B3]">
          لا توجد مستندات مرتبطة بهذه الزيارة بعد.
        </p>
      ) : (
        <ul className="space-y-3">
          {documentsQuery.documents.map((document) => {
            const documentId = document._id ?? document.id ?? '';
            const title = document.title?.trim() || 'مستند';
            return (
              <li
                key={documentId}
                className="flex flex-col gap-3 rounded-[8px] border border-[#EEF2F6] bg-[#F8FAFC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 text-right">
                  <p className="truncate font-cairo text-[14px] font-extrabold text-[#111827]">
                    {title}
                  </p>
                  <p className="mt-1 font-cairo text-[11px] font-semibold text-[#667085]">
                    {document.sharedWithPatient
                      ? `مشارَك ${document.sharedAt ? new Date(document.sharedAt).toLocaleDateString('ar') : ''}`
                      : 'غير مشارَك مع المريض'}
                  </p>
                </div>
                {!document.sharedWithPatient && documentId ? (
                  <button
                    type="button"
                    disabled={mutations.isBusy}
                    onClick={() => void handleShare(documentId, title)}
                    className="inline-flex shrink-0 items-center justify-center gap-1 rounded-[6px] bg-primary px-3 py-2 font-cairo text-[11px] font-extrabold text-white disabled:opacity-60"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    مشاركة
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
