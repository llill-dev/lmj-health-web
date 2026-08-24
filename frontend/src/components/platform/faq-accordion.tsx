'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { FaqItem } from '@/lib/platform/faqData';
import { cn } from '@/lib/utils/utils';

export function FaqAccordionItem({
  item,
  defaultOpen = false,
}: {
  item: FaqItem;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className="overflow-hidden rounded-[12px] border border-[#99F6E4] bg-[#F0FDFA]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-5 py-4 text-start transition hover:bg-[#ECFDF5]"
        aria-expanded={open}
      >
        <div className="flex min-w-0 flex-1 items-center justify-start gap-3 text-start">
          <span className="shrink-0 font-cairo text-[14px] font-black text-primary">
            {item.number}
          </span>
          <span className="min-w-0 flex-1 font-cairo text-[14px] font-extrabold leading-[22px] text-primary">
            {item.question}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-primary transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[#CCFBF1]"
          >
            <p className="px-5 py-4 text-justify font-cairo text-[13px] font-semibold leading-[24px] text-[#475467]">
              {item.answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

export function FaqAccordionList({
  items,
  defaultOpenFirst = true,
}: {
  items: FaqItem[];
  defaultOpenFirst?: boolean;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <FaqAccordionItem
          key={item.id}
          item={item}
          defaultOpen={defaultOpenFirst && index === 0}
        />
      ))}
    </div>
  );
}
