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

interface ProfileChangeRequest {
  _id: string;
  status?: string;
  items?: Array<{
    field: string;
    oldValue?: any;
    newValue?: any;
  }>;
  doctor?: {
    _id: string;
    specialization?: string;
    medicalLicenseNumber?: string;
    education?: string;
    clinicAddress?: string;
    bio?: string;
    consultationFee?: number;
    userId?: {
      fullName?: string;
    };
  };
  requestedBy?: {
    _id: string;
    fullName?: string;
    email?: string;
  };
  createdAt?: string;
}

interface ReviewProfileChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: ProfileChangeRequest | null;
  onSuccess?: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  specialization: 'التخصص',
  medicalLicenseNumber: 'رقم الترخيص الطبي',
  education: 'التعليم',
  clinicAddress: 'عنوان العيادة',
  bio: 'السيرة الذاتية',
  consultationFee: 'رسوم الاستشارة',
  clinicLat: 'خط عرض العيادة',
  clinicLng: 'خط طول العيادة',
};

export default function ReviewProfileChangeDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}: ReviewProfileChangeDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decision, setDecision] = useState('');
  const [adminNote, setAdminNote] = useState('');

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!decision) {
      toast('يجب اختيار القرار (موافقة أو رفض)', {
        title: 'خطأ في التحقق',
        variant: 'error',
        durationMs: 4200,
      });
      return;
    }

    if (decision === 'denied' && !adminNote.trim()) {
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
      // await adminApi.doctors.reviewProfileChangeRequest(request._id, {
      //   decision,
      //   adminNote: adminNote || undefined,
      // });

      const message = decision === 'approved' ? 'تمت الموافقة على طلب تغيير البيانات' : 'تم رفض طلب تغيير البيانات';
      toast(message, {
        title: decision === 'approved' ? 'تمت الموافقة' : 'تم الرفض',
        variant: 'success',
        durationMs: 4200,
      });

      setDecision('');
      setAdminNote('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast('حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.', {
        title: 'فشلت العملية',
        variant: 'error',
        durationMs: 4200,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderValue = (value: any) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl"
          >
            <div className="bg-white rounded-[16px] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <Dialog.Title className="font-cairo text-[16px] font-extrabold text-[#111827]">
                      مراجعة طلب تغيير البيانات
                    </Dialog.Title>
                    <Dialog.Description className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                      راجع التغييرات المطلوبة وقرر الموافقة أو الرفض
                    </Dialog.Description>
                  </div>
                </div>
                <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#667085] transition hover:bg-[#F9FAFB]">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Doctor Info */}
                <div className="rounded-[10px] bg-[#F9FAFB] border border-[#E5E7EB] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                        {request.doctor?.userId?.fullName || request.doctor?._id}
                      </div>
                      <div className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                        {request.doctor?.specialization || '—'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="font-cairo font-semibold text-[#667085]">
                      رقم الترخيص: {request.doctor?.medicalLicenseNumber || '—'}
                    </div>
                    <div className="font-cairo font-semibold text-[#667085]">
                      طلب بواسطة: {request.requestedBy?.fullName || '—'}
                    </div>
                  </div>
                </div>

                {/* Changes List */}
                {request.items && request.items.length > 0 ? (
                  <div>
                    <label className="block mb-3 font-cairo text-[12px] font-extrabold text-[#111827]">
                      التغييرات المطلوبة
                    </label>
                    <div className="space-y-3">
                      {request.items.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-[10px] border border-[#E5E7EB] bg-white p-4"
                        >
                          <div className="font-cairo text-[12px] font-extrabold text-[#111827] mb-2">
                            {FIELD_LABELS[item.field] || item.field}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="font-cairo text-[10px] font-semibold text-[#98A2B3] mb-1">
                                القيمة الحالية
                              </div>
                              <div className="font-cairo text-[11px] font-bold text-[#667085] bg-[#F9FAFB] p-2 rounded-[6px]">
                                {renderValue(item.oldValue)}
                              </div>
                            </div>
                            <div>
                              <div className="font-cairo text-[10px] font-semibold text-[#16A34A] mb-1">
                                القيمة الجديدة
                              </div>
                              <div className="font-cairo text-[11px] font-bold text-[#16A34A] bg-[#F0FDF4] p-2 rounded-[6px]">
                                {renderValue(item.newValue)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-[#D97706] shrink-0 mt-0.5" />
                    <div className="font-cairo text-[12px] font-semibold text-[#92400E]">
                      لا توجد تفاصيل التغييرات متاحة
                    </div>
                  </div>
                )}

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

                {/* Admin Note */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    ملاحظة الإدارة {decision === 'denied' && '*'}
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder={
                      decision === 'denied'
                        ? 'أدخل سبب الرفض...'
                        : 'أضف ملاحظة اختيارية...'
                    }
                    rows={3}
                    className="w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none"
                  />
                </div>

                {/* Warning for approval */}
                {decision === 'approved' && (
                  <div className="rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] p-3 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-[#D97706] shrink-0 mt-0.5" />
                    <div className="font-cairo text-[11px] font-semibold text-[#92400E]">
                      سيتم تحديث بيانات الطبيب فوراً بعد الموافقة. تأكد من صحة جميع التغييرات.
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 h-[44px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white font-cairo text-[12px] font-extrabold text-[#111827] transition hover:bg-[#F9FAFB]"
                    >
                      إلغاء
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={isSubmitting || !decision}
                    className="flex-1 h-[44px] items-center justify-center rounded-[10px] border border-primary bg-primary font-cairo text-[12px] font-extrabold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting
                      ? 'جارٍ المعالجة...'
                      : decision === 'approved'
                      ? 'موافقة وتحديث'
                      : 'رفض الطلب'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
