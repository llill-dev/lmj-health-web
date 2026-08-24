'use client';

import { useRef, useState } from 'react';
import {
  CheckCircle2,
  FlaskConical,
  Link2,
  Loader2,
  Paperclip,
  Pill,
  ScanLine,
  Send,
  ShieldClose,
  X,
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import type { ConsultationClinicalAction } from '@/lib/consultations/consultationEncounter';
import type { PendingConsultationAttachment } from '@/lib/consultations/types';
import { doctorApi } from '@/lib/doctor/client';
import { getPatientFileMutationErrorMessage } from '@/lib/doctor/writeFlowErrors';
import { useDoctorPatientFiles } from '@/hooks/doctor/patients/useDoctorPatients';
import { useI18n } from '@/i18n/provider';

const CLINICAL_ACTIONS: Array<{
  key: ConsultationClinicalAction;
  label: string;
  icon: typeof FlaskConical;
}> = [
  {
    key: 'lab',
    label: 'طلب تحاليل',
    icon: FlaskConical,
  },
  {
    key: 'imaging',
    label: 'طلب أشعة',
    icon: ScanLine,
  },
  {
    key: 'prescription',
    label: 'الوصفة الطبية',
    icon: Pill,
  },
];

export default function ConsultationReplyPanel({
  patientId,
  clinicalActionsEnabled = true,
  busyClinicalAction = null,
  onClinicalAction,
  disabled,
  draft,
  onDraftChange,
  pendingAttachments,
  onPendingChange,
  sending,
  onSend,
  onClose,
  onDismiss,
  closing,
}: {
  patientId: string;
  clinicalActionsEnabled?: boolean;
  busyClinicalAction?: ConsultationClinicalAction | null;
  onClinicalAction?: (action: ConsultationClinicalAction) => void | Promise<void>;
  disabled?: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  pendingAttachments: PendingConsultationAttachment[];
  onPendingChange: (next: PendingConsultationAttachment[]) => void;
  sending?: boolean;
  onSend: () => void;
  onClose: () => void;
  onDismiss: () => void;
  closing?: boolean;
}) {
  const { dir } = useI18n();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const patientFilesQuery = useDoctorPatientFiles(patientId, Boolean(patientId));
  const patientFilesAwaitingData = patientFilesQuery.isAwaitingData;

  const canSend =
    !disabled &&
    !sending &&
    (draft.trim().length > 0 || pendingAttachments.length > 0);

  const clinicalDisabled =
    disabled ||
    !clinicalActionsEnabled ||
    !patientId ||
    !onClinicalAction ||
    busyClinicalAction !== null;

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
        'مرفق استشارة أونلاين',
      );
      const uploaded = response.file;
      const ref = uploaded?._id ?? uploaded?.id;
      if (!ref) throw new Error('missing uploaded file id');
      addAttachment({
        ref,
        fileName: uploaded.originalName?.trim() || file.name,
      });
      toast('تم إرفاق الملف.', { title: 'رفع الملف', variant: 'success' });
    } catch (error) {
      toast(getPatientFileMutationErrorMessage(error, 'upload'), {
        title: 'تعذّر رفع الملف',
        variant: 'error',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mt-4 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-4">
      <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
        إرسال رد
      </div>

      <div dir="ltr" className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={!canSend}
          onClick={onSend}
          aria-label="إرسال الرد"
          className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[8px] bg-primary text-white shadow-[0_10px_20px_rgba(15,143,139,0.28)] disabled:opacity-50"
        >
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>

        <input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          disabled={disabled}
          dir={dir}
          placeholder={disabled ? 'لا يمكن الرد على هذه الاستشارة' : 'اكتب ردك...'}
          className="h-[44px] min-w-0 flex-1 rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#98A2B3] disabled:bg-[#F9FAFB] disabled:text-[#98A2B3]"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              if (canSend) onSend();
            }
          }}
        />

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
          aria-label="رفع ملف"
          title="رفع ملف"
          className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#667085] hover:bg-[#F9FAFB] disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </button>
      </div>

      {pendingAttachments.length ? (
        <div dir={dir} className="mt-2 flex flex-wrap gap-2">
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
                aria-label="إزالة المرفق"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div dir={dir} className="mt-2">
        <button
          type="button"
          disabled={disabled || !patientId || patientFilesAwaitingData}
          onClick={() => setPickerOpen((open) => !open)}
          className="font-cairo text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
        >
          {pickerOpen ? 'إخفاء ملفات المريض' : 'اختيار من ملفات المريض'}
        </button>
      </div>

      {pickerOpen ? (
        <div dir={dir} className="mt-2 max-h-[140px] overflow-y-auto rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] p-2">
          {patientFilesAwaitingData ? (
            <div className="flex items-center justify-center gap-2 py-4 font-cairo text-[12px] font-semibold text-[#667085]">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              جاري تحميل الملفات…
            </div>
          ) : patientFilesQuery.files.length === 0 ? (
            <div className="py-3 text-center font-cairo text-[12px] font-semibold text-[#98A2B3]">
              لا توجد ملفات مرتبطة بهذا المريض.
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
                      fileName: file.originalName?.trim() || 'ملف مريض',
                    });
                    setPickerOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-start font-cairo text-[12px] font-semibold text-[#111827] hover:bg-white disabled:opacity-50"
                >
                  <span className="truncate">{file.originalName || 'ملف بدون اسم'}</span>
                  {selected ? (
                    <span className="text-[11px] font-extrabold text-primary">مضاف</span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}

      <div dir={dir} className="mt-4 grid grid-cols-3 gap-2">
        {CLINICAL_ACTIONS.map((action) => {
          const Icon = action.icon;
          const isBusy = busyClinicalAction === action.key;
          return (
            <button
              key={action.key}
              type="button"
              disabled={clinicalDisabled}
              onClick={() => void onClinicalAction?.(action.key)}
              className="flex h-[42px] items-center justify-center gap-2 rounded-[8px] border border-[#D0D5DD] bg-white px-2 font-cairo text-[11px] font-extrabold text-[#344054] transition hover:border-primary/30 hover:bg-[#F0FAFA] hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
              ) : (
                <Icon className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">{action.label}</span>
            </button>
          );
        })}
      </div>

      {!disabled ? (
        <p dir={dir} className="mt-2 font-cairo text-[10px] font-semibold text-[#98A2B3]">
          عند فتح طلب تحاليل أو أشعة أو وصفة، يُربَط المريض تلقائياً بقائمتك ثم تُفتح
          زيارة سريرية مرتبطة بهذه الاستشارة. لن يُبلَغ المريض حتى تُنهي الطلب أو
          الوصفة.
        </p>
      ) : null}

      {!disabled ? (
        <div dir={dir} className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled
            title="حفظ المسودة غير مدعوم حالياً في API الاستشارات"
            className="flex h-[44px] items-center justify-center gap-2 rounded-[8px] bg-[#475467] font-cairo text-[12px] font-extrabold text-white opacity-50"
          >
            <Link2 className="h-4 w-4" />
            حفظ كمسودة
          </button>
          <button
            type="button"
            disabled={closing}
            onClick={onClose}
            className="flex h-[44px] items-center justify-center gap-2 rounded-[8px] bg-[#475467] font-cairo text-[12px] font-extrabold text-white disabled:opacity-60"
          >
            {closing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            إغلاق الاستشارة
          </button>
        </div>
      ) : null}

      {!disabled ? (
        <button
          type="button"
          disabled={closing}
          onClick={onDismiss}
          className="mt-3 flex h-[40px] w-full items-center justify-center gap-2 rounded-[8px] border border-[#FECACA] bg-[#FFF1F2] font-cairo text-[12px] font-extrabold text-[#B42318] disabled:opacity-60"
        >
          <ShieldClose className="h-4 w-4" />
          رفض الاستشارة
        </button>
      ) : null}
    </div>
  );
}
