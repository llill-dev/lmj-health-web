'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

export type LogoutScope = 'current' | 'all';

export default function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  confirmDisabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (scope: LogoutScope) => void | Promise<void>;
  confirmDisabled?: boolean;
}) {
  const { locale, dir, t } = useI18n();
  const [scope, setScope] = useState<LogoutScope>('current');

  useEffect(() => {
    if (open) setScope('current');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? "open" : "closed"}
            variants={{
              open: {
                opacity: 1,
                visibility: "visible",
                pointerEvents: "auto",
              },
              closed: {
                opacity: 0,
                pointerEvents: "none",
                transitionEnd: { visibility: "hidden" },
              },
            }}
            className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]"
          />
        </Dialog.Overlay>

        <Dialog.Content forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? "open" : "closed"}
            variants={{
              open: {
                opacity: 1,
                visibility: "visible",
                pointerEvents: "auto",
              },
              closed: {
                opacity: 0,
                pointerEvents: "none",
                transitionEnd: { visibility: "hidden" },
              },
            }}
            className="fixed left-1/2 top-1/2 z-[10000] w-[480px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none"
            dir={dir}
            lang={locale}
          >
            <div className="relative px-7 pt-5 pb-6">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="absolute left-5 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]"
                  aria-label={t('common.close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>

              <Dialog.Title className="text-start font-cairo text-[20px] font-extrabold text-[#101828]">
                {t('logout.title')}
              </Dialog.Title>

              <Dialog.Description className="mt-2 text-right font-cairo text-[13px] font-semibold leading-[22px] text-[#667085]">
                {t('logout.description')}
              </Dialog.Description>

              <div className="mt-5 space-y-3">
                <label className="flex cursor-pointer items-center justify-between rounded-[12px] border border-[#E4E7EC] px-4 py-3">
                  <span className="text-right font-cairo text-[13px] font-bold text-[#101828]">
                    {t('logout.scope.current')}
                  </span>
                  <input
                    type="radio"
                    name="logout-scope"
                    checked={scope === "current"}
                    onChange={() => setScope("current")}
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-[12px] border border-[#E4E7EC] px-4 py-3">
                  <span className="text-right font-cairo text-[13px] font-bold text-[#101828]">
                    {t('logout.scope.all')}
                  </span>
                  <input
                    type="radio"
                    name="logout-scope"
                    checked={scope === "all"}
                    onChange={() => setScope("all")}
                  />
                </label>
              </div>

              <div className="flex gap-3 justify-end items-center mt-6">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="h-[40px] rounded-[10px] border border-[#F04438] bg-white px-8 font-cairo text-[14px] font-extrabold text-[#F04438]"
                  >
                    {t('common.cancel')}
                  </button>
                </Dialog.Close>

                <button
                  type="button"
                  disabled={confirmDisabled}
                  onClick={async () => {
                    try {
                      await onConfirm(scope);
                      onOpenChange(false);
                    } catch {
                      /* keep open */
                    }
                  }}
                  className="h-[40px] rounded-[10px] bg-gradient-to-b from-[#0F8F8B] to-[#14B3AE] px-8 font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                >
                  {confirmDisabled ? t('logout.pending') : t('common.logout')}
                </button>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
