"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import StyledSelect from "@/components/ui/styled-select";
import { adminApi } from "@/lib/admin/client";

const STATUS_OPTIONS = [
  { value: "draft", label: "مسودة" },
  { value: "active", label: "نشط" },
  { value: "inactive", label: "معطّل" },
];

interface UpdateProviderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  providerName: string;
  currentStatus: string;
  onSuccess?: () => void;
}

export default function UpdateProviderStatusDialog({
  open,
  onOpenChange,
  providerId,
  providerName,
  currentStatus,
  onSuccess,
}: UpdateProviderStatusDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === currentStatus) {
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await adminApi.serviceProviders.updateStatus(providerId, { status });

      toast("تم تحديث حالة مزود الخدمة بنجاح", {
        title: "تم التحديث",
        variant: "success",
        durationMs: 4200,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast("حدث خطأ أثناء تحديث الحالة. يرجى المحاولة مرة أخرى.", {
        title: "فشلت العملية",
        variant: "error",
        durationMs: 4200,
      });
    } finally {
      setIsSubmitting(false);
    }
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-white rounded-[16px] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEF3C7] text-[#D97706]">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <Dialog.Title className="font-cairo text-[16px] font-extrabold text-[#111827]">
                      تغيير حالة مزود الخدمة
                    </Dialog.Title>
                    <Dialog.Description className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                      {providerName}
                    </Dialog.Description>
                  </div>
                </div>
                <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#667085] transition hover:bg-[#F9FAFB]">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {/* Status */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    الحالة الجديدة *
                  </label>
                  <StyledSelect
                    value={status}
                    onChange={setStatus}
                    options={STATUS_OPTIONS}
                    placeholder="اختر الحالة"
                    size="sm"
                    tone="muted"
                  />
                </div>

                {/* Warning */}
                <div className="rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-[#D97706] mt-0.5" />
                    <div className="font-cairo text-[11px] font-semibold text-[#92400E] leading-relaxed">
                      سيؤثر تغيير الحالة على إمكانية عرض مزود الخدمة للمستخدمين.
                      تأكد من صحة القرار قبل المتابعة.
                    </div>
                  </div>
                </div>

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
                    disabled={isSubmitting || status === currentStatus}
                    className="flex-1 h-[44px] items-center justify-center rounded-[10px] border border-primary bg-primary font-cairo text-[12px] font-extrabold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? "جارٍ التحديث..." : "تأكيد التغيير"}
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
