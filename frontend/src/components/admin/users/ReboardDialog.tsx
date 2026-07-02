"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X, UserPlus, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { adminApi } from "@/lib/admin/client";

interface ReboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onSuccess?: () => void;
}

export default function ReboardDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: ReboardDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReboard = async () => {
    setIsSubmitting(true);
    try {
      await adminApi.users.reboard(userId);

      toast("تم تفعيل حساب المستخدم بنجاح", {
        title: "تم التفعيل",
        variant: "success",
        durationMs: 4200,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error reboarding user:", error);
      const message =
        error?.message || "حدث خطأ أثناء تفعيل الحساب. يرجى المحاولة مرة أخرى.";
      toast(message, {
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
            style={{ margin: "auto" }}
          >
            <div className="bg-white rounded-[16px] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <Dialog.Title className="font-cairo text-[16px] font-extrabold text-[#111827]">
                      تفعيل حساب المستخدم
                    </Dialog.Title>
                    <Dialog.Description className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                      {userName}
                    </Dialog.Description>
                  </div>
                </div>
                <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#667085] transition hover:bg-[#F9FAFB]">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <div className="px-6 py-5">
                <div className="flex items-start gap-3 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] p-4">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-[#D97706] mt-0.5" />
                  <div className="font-cairo text-[12px] font-bold text-[#92400E]">
                    سيتم تفعيل حساب هذا المستخدم وستتم استعادة جميع صلاحياته.
                  </div>
                </div>
              </div>

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
                  onClick={handleReboard}
                  disabled={isSubmitting}
                  className="inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#16A34A] bg-[#16A34A] px-4 font-cairo text-[12px] font-extrabold text-white transition hover:bg-[#15803D] disabled:opacity-50"
                >
                  {isSubmitting ? "جاري التفعيل..." : "تفعيل الحساب"}
                </button>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
