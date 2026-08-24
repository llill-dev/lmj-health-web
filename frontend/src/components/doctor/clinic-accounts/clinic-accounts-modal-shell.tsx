'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { useI18n } from '@/i18n/provider';

export function ClinicAccountsModalShell({
  open,
  onClose,
  title,
  children,
  maxWidthClass = 'max-w-[720px]',
  headerPattern = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidthClass?: string;
  headerPattern?: boolean;
}) {
  const { locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/45 px-3 py-4 sm:px-4 sm:py-8"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className={`relative w-full ${maxWidthClass} max-h-[min(94dvh,820px)] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]`}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div
              className={
                headerPattern
                  ? 'relative overflow-hidden border-b border-[#EEF2F6] px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6 lg:px-8 lg:pb-5 lg:pt-8'
                  : 'border-b border-[#EEF2F6] px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6 lg:px-8 lg:pb-5 lg:pt-8'
              }
            >
              {headerPattern ? (
                <>
                  <div
                    className="pointer-events-none absolute inset-0 bg-[#E6F4F3]"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center opacity-80"
                    aria-hidden
                  />
                </>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="absolute start-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827] sm:start-5 sm:top-5 lg:start-6 lg:top-6"
                aria-label={tr('إغلاق', 'Close')}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <h2 className="relative text-center font-cairo text-[22px] font-extrabold text-primary">
                {title}
              </h2>
            </div>

            <div className="max-h-[calc(94dvh-108px)] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
