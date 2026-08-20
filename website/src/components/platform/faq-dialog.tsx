'use client';

import { BookOpen, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PlatformModalShell } from '@/components/platform/platform-modal-shell';
import { FaqAccordionList } from '@/components/platform/faq-accordion';
import { usePlatformFaqContent } from '@/hooks/platform/usePlatformContent';

export function FaqDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, isAwaitingData } = usePlatformFaqContent('ar');

  return (
    <PlatformModalShell open={open} onClose={onClose} title="الأسئلة الشائعة">
      {isAwaitingData ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-5">
          <FaqAccordionList items={items} />
          <div className="rounded-[14px] border border-[#D9F2EF] bg-[#F8FFFE] px-4 py-4 text-right">
            <div className="flex items-center gap-2 font-cairo text-[14px] font-extrabold text-[#111827]">
              <BookOpen className="h-4 w-4 text-primary" />
              ابحث في المكتبة الطبية
            </div>
            <p className="mt-2 font-cairo text-[13px] font-semibold leading-7 text-[#667085]">
              إذا لم تجد إجابتك هنا، قد تجد شرحاً أوسع ضمن المقالات والنصائح الطبية المنشورة.
            </p>
            <Link
              to="/medical-library"
              onClick={onClose}
              className="mt-3 inline-flex items-center justify-center rounded-[10px] border border-[#B8E6E0] bg-white px-4 py-2 font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#F0FDFA]"
            >
              فتح المكتبة الطبية
            </Link>
          </div>
        </div>
      )}
    </PlatformModalShell>
  );
}
