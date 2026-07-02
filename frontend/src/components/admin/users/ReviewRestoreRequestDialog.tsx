'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X, Check, XCircle, FileText, User, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import StyledSelect from '@/components/ui/styled-select';

const DECISION_OPTIONS = [
  { value: 'approved', label: 'موافقة' },
  { value: 'denied', label: 'رفض' },
];

interface RestoreRequest {
  _id: string;
  status?: string;
  userId?: string;
  user?: {
    _id: string;
    fullName?: string;
    email?: string;
  };
  requestedAt?: string;
  reason?: string;
}

interface ReviewRestoreRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RestoreRequest | null;
  onSuccess?: () => void;
}

export default function ReviewRestoreRequestDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}: ReviewRestoreRequestDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decision, setDecision] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!decision) {
      toast('يجب اختيار القرار', {
        title: 'خطأ في التحقق',
        variant: 'error',
        durationMs: 4200,
      });
      return;
    }

    if (decision === 'denied' && !reviewNote.trim()) {
      toast('يجب إضافة ملاحظة عند رفض الطلب', {
        title: 'خطأ في التحقق',
        variant: 'error',
        durationMs: 4200,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // await adminApi.users.reviewRestoreRequest(request?.userId || '', {
      //   decision: decision as 'approved' | 'denied',
      //   reviewNote: reviewNote || undefined,
      // });

      const message =
        decision === 'approved'
          ? 'تمت الموافقة على طلب استعادة الحساب'
          : 'تم رفض طلب استعادة الحساب';
      toast(message, {
        title: decision === 'approved' ? 'تمت الموافقة' : 'تم الرفض',
        variant: 'success',
        durationMs: 4200,
      });

      setDecision('');
      setReviewNote('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error reviewing restore request:', error);
      toast('حدث خطأ أثناء مراجعة الطلب. يرجى المحاولة مرة أخرى.', {
        title: 'فشلت العملية',
        variant: 'error',
        durationMs: 4200,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
          >
            <div className="bg-white rounded-[16px] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <Dialog.Title className="font-cairo text-[16px] font-extrabold text-[#111827]">
                      مراجعة طلب استعادة الحساب
                    </Dialog.Title>
                    <Dialog.Description className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                      {request.user?.fullName || request.user?.email}
                    </Dialog.Description>
                  </div>
                </div>
                <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#667085] transition hover:bg-[#F9FAFB]">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {/* User Info */}
                <div className="rounded-[8px] border border-[#EEF2F6] bg-[#F9FAFB] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-cairo text-[13px] font-black text-[#111827]">
                        {request.user?.fullName || '—'}
                      </div>
                      <div className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                        {request.user?.email || '—'}
                      </div>
                    </div>
                  </div>
                  {request.reason && (
                    <div className="mt-3 pt-3 border-t border-[#EEF2F6]">
                      <div className="font-cairo text-[11px] font-extrabold text-[#667085] mb-1">
                        سبب الطلب:
                      </div>
                      <div className="font-cairo text-[12px] font-semibold text-[#111827]">
                        {request.reason}
                      </div>
                    </div>
                  )}
                </div>

                {/* Decision */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    القرار *
                  </label>
                  <StyledSelect
                    value={decision}
                    onChange={setDecision}
                    options={DECISION_OPTIONS}
                    placeholder="اختر القرار"
                    size="sm"
                    tone="muted"
                  />
                </div>

                {/* Review Note */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    ملاحظة المراجعة {decision === 'denied' && '*'}
                  </label>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="أضف ملاحظة حول القرار..."
                    rows={3}
                    className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2.5 font-cairo text-[12px] font-semibold text-[#111827] placeholder:text-[#98A2B3] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Warning */}
                {decision === 'approved' && (
                  <div className="flex items-start gap-3 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] p-3">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-[#D97706] mt-0.5" />
                    <div className="font-cairo text-[11px] font-bold text-[#92400E]">
                      سيتم تفعيل حساب المستخدم واستعادة جميع صلاحياته.
                    </div>
                  </div>
                )}
              </form>

              <div className="flex items-center justify-end gap-3 border-t border-[#EEF2F6] px-6 py-4">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] transition hover:bg-[#F9FAFB] disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                </Dialog.Close>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !decision}
                  className="inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'إرسال القرار'}
                </button>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
