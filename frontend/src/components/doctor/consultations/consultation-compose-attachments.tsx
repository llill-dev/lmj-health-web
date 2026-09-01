'use client';

import { useRef, useState } from 'react';
import { Loader2, Paperclip, X } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import type { PendingConsultationAttachment } from '@/lib/consultations/types';
import { doctorApi } from '@/lib/doctor/client';
import { getPatientFileMutationErrorMessage } from '@/lib/doctor/writeFlowErrors';
import { useDoctorPatientFiles } from '@/hooks/doctor/patients/useDoctorPatients';
import { useI18n } from '@/i18n/provider';

export default function ConsultationComposeAttachments({
  patientId,
  disabled,
  pendingAttachments,
  onPendingChange,
}: {
  patientId: string;
  disabled?: boolean;
  pendingAttachments: PendingConsultationAttachment[];
  onPendingChange: (next: PendingConsultationAttachment[]) => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const patientFilesQuery = useDoctorPatientFiles(patientId, Boolean(patientId));
  const patientFilesAwaitingData = patientFilesQuery.isAwaitingData;

  const addAttachment = (attachment: PendingConsultationAttachment) => {
    if (pendingAttachments.some((item) => item.ref === attachment.ref)) return;
    onPendingChange([...pendingAttachments, attachment]);
  };

  const handleUpload = async (file: File) => {
    if (!patientId || disabled) return;
    setUploading(true);
    try {
      const response = await doctorApi.patients.uploadFile(
        patientId,
        file,
        t('doctor.consultations.compose.attachmentDescription'),
      );
      const uploaded = response.file;
      const ref = uploaded?._id ?? uploaded?.id;
      if (!ref) {
        throw new Error('missing uploaded file id');
      }
      addAttachment({
        ref,
        fileName: uploaded.originalName?.trim() || file.name,
      });
      toast(t('doctor.consultations.compose.uploadSuccessBody'), {
        title: t('doctor.consultations.compose.uploadSuccessTitle'),
        variant: 'success',
      });
    } catch (error) {
      toast(getPatientFileMutationErrorMessage(error, 'upload'), {
        title: t('doctor.consultations.compose.uploadFailedTitle'),
        variant: 'error',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />

        <button
          type="button"
          disabled={disabled || uploading || !patientId}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-[40px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#667085] hover:bg-[#F9FAFB] disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
          {t('doctor.consultations.compose.uploadFile')}
        </button>

        <button
          type="button"
          disabled={disabled || !patientId || patientFilesAwaitingData}
          onClick={() => setPickerOpen((open) => !open)}
          className="flex h-[40px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#667085] hover:bg-[#F9FAFB] disabled:opacity-50"
        >
          {t('doctor.consultations.compose.chooseFromPatientFiles')}
        </button>
      </div>

      {pickerOpen ? (
        <div className="mt-2 max-h-[160px] overflow-y-auto rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] p-2">
          {patientFilesAwaitingData ? (
            <div className="flex items-center justify-center gap-2 py-4 font-cairo text-[12px] font-semibold text-[#667085]">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              {t('doctor.consultations.compose.loadingFiles')}
            </div>
          ) : patientFilesQuery.files.length === 0 ? (
            <div className="py-3 text-center font-cairo text-[12px] font-semibold text-[#98A2B3]">
              {t('doctor.consultations.compose.noFiles')}
            </div>
          ) : (
            patientFilesQuery.files.map((file) => {
              const ref = file._id ?? file.id ?? '';
              const selected = pendingAttachments.some((item) => item.ref === ref);
              return (
                <button
                  key={ref}
                  type="button"
                  disabled={!ref || selected || disabled}
                  onClick={() => {
                    addAttachment({
                      ref,
                      fileName:
                        file.originalName?.trim() ||
                        t('doctor.consultations.compose.patientFileFallback'),
                    });
                    setPickerOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-start font-cairo text-[12px] font-semibold text-[#111827] hover:bg-white disabled:opacity-50"
                >
                  <span className="truncate">
                    {file.originalName ||
                      t('doctor.consultations.compose.unnamedFile')}
                  </span>
                  {selected ? (
                    <span className="text-[11px] font-extrabold text-primary">
                      {t('doctor.consultations.compose.added')}
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}

      {pendingAttachments.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {pendingAttachments.map((attachment) => (
            <span
              key={attachment.ref}
              className="inline-flex max-w-full items-center gap-2 rounded-[6px] bg-[#EFFFFE] px-3 py-1 font-cairo text-[11px] font-extrabold text-primary"
            >
              <span className="truncate">{attachment.fileName}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  onPendingChange(
                    pendingAttachments.filter((item) => item.ref !== attachment.ref),
                  )
                }
                className="text-[#667085] hover:text-[#B42318]"
                aria-label={t('doctor.consultations.compose.removeAttachment')}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
