'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Loader2, ShieldClose, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ConsultationDismissDialog({
  open,
  onOpenChange,
  busy,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  busy?: boolean;
  onConfirm: (reason: string) => void | Promise<void>;
}) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed start-1/2 top-1/2 z-[10000] w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-[14px] border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_48px_rgba(0,0,0,0.18)] outline-none">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-start">
                <Dialog.Title className="font-cairo text-[16px] font-extrabold text-[#111827]">
                  رفض الاستشارة
                </Dialog.Title>
                <Dialog.Description className="mt-2 font-cairo text-[12px] font-semibold leading-[20px] text-[#667085]">
                  هذا الإجراء للطبيب فقط. يجب ذكر سبب الرفض ولن يتمكن المريض من
                  إرسال رسائل جديدة بعد ذلك.
                </Dialog.Description>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-[6px] p-1 text-[#667085] hover:bg-[#F9FAFB]"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="اكتب سبب الرفض..."
              className="mt-4 h-[110px] w-full resize-none rounded-[10px] border border-[#E5E7EB] bg-white p-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#98A2B3]"
            />

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-[42px] flex-1 rounded-[6px] border border-[#E5E7EB] bg-white font-cairo text-[12px] font-extrabold text-[#667085]"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={!reason.trim() || busy}
                onClick={() => void onConfirm(reason.trim())}
                className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#B42318] font-cairo text-[12px] font-extrabold text-white disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldClose className="h-4 w-4" />
                )}
                تأكيد الرفض
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
