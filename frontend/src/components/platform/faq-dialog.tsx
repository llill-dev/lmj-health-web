'use client';

import { Loader2 } from 'lucide-react';
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
  const { items, isLoading } = usePlatformFaqContent('ar');

  return (
    <PlatformModalShell open={open} onClose={onClose} title="الأسئلة الشائعة">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <FaqAccordionList items={items} />
      )}
    </PlatformModalShell>
  );
}
