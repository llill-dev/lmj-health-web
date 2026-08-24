'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { useI18n } from '@/i18n/provider';
import { ENCOUNTERS_EXPAND_TRANSITION } from '@/components/doctor/encounters/encounters-motion';
import {
  ENCOUNTER_WORKSPACE_ADD_ICON,
  ENCOUNTER_WORKSPACE_SECTION_THEMES,
} from './encounter-workspace-themes';
import type { EncounterWorkspaceSectionViewModel } from './encounter-workspace-types';

function statusClass(
  status: EncounterWorkspaceSectionViewModel['status'],
  theme: (typeof ENCOUNTER_WORKSPACE_SECTION_THEMES)['prescription'],
) {
  if (status === 'approved') return theme.statusApprovedClass;
  if (status === 'empty') return theme.statusEmptyClass;
  return theme.statusDraftClass;
}

export function EncounterWorkspaceSectionCard({
  section,
  expanded,
  onToggle,
  onOpenSection,
  onAddReferral,
}: {
  section: EncounterWorkspaceSectionViewModel;
  expanded: boolean;
  onToggle: () => void;
  onOpenSection?: () => void;
  onAddReferral?: () => void;
}) {
  const { dir } = useI18n();
  const theme = ENCOUNTER_WORKSPACE_SECTION_THEMES[section.key];
  const Icon = theme.icon;
  const AddIcon = ENCOUNTER_WORKSPACE_ADD_ICON;
  const showReferrals =
    section.key === 'referral' && (section.referrals?.length ?? 0) > 0;
  const hasItems = (section.items?.length ?? 0) > 0;

  return (
    <article
      className={cn(
        'overflow-hidden rounded-[14px] border bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]',
        theme.borderClass,
      )}
    >
      <div
        className={cn(
          'border-b px-4 py-3 sm:px-5',
          theme.headerClass,
          theme.borderClass,
        )}
      >
        <div className="flex gap-3 justify-between items-center">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={onToggle}
            className="flex flex-1 gap-3 justify-between items-center min-w-0 text-start"
          >
            <div
              dir={dir}
              className="flex items-center justify-start gap-3 text-start"
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]',
                  theme.iconWrapClass,
                )}
              >
                <Icon className={cn('h-5 w-5', theme.iconClass)} aria-hidden />
              </div>
              <span className="font-cairo text-[14px] font-extrabold text-[#101828]">
                {theme.title}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 justify-end items-center">
              <span
                className={cn(
                  'inline-flex h-7 min-w-[28px] items-center justify-center rounded-full border bg-white px-2 font-cairo text-[12px] font-extrabold',
                  theme.countClass,
                )}
              >
                {section.count}
              </span>
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-1 font-cairo text-[11px] font-extrabold',
                  statusClass(section.status, theme),
                )}
              >
                {section.statusLabel}
              </span>
            </div>

            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={ENCOUNTERS_EXPAND_TRANSITION}
              className="shrink-0 text-[#667085]"
              aria-hidden
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </button>

          {section.key === 'referral' ? (
            <button
              type="button"
              onClick={onAddReferral ?? onOpenSection}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-primary text-white shadow-[0_6px_16px_rgba(15,143,139,0.25)] transition hover:opacity-95"
              aria-label="إضافة تحويل"
            >
              <AddIcon className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={ENCOUNTERS_EXPAND_TRANSITION}
            className="overflow-hidden"
          >
            <div className={cn('space-y-3 px-4 py-4 sm:px-5', theme.panelClass)}>
              {showReferrals ? (
                section.referrals?.map((referral) => (
                  <div
                    key={referral.id}
                    className="rounded-[12px] border border-[#E2E8F0] bg-white px-4 py-3 text-start shadow-sm"
                  >
                    <div className="flex flex-wrap gap-2 justify-between items-center">
                      <div className="flex flex-wrap gap-2 items-center">
                        {referral.urgency === 'urgent' ? (
                          <span className="inline-flex rounded-full bg-[#FEF3C7] px-2.5 py-1 font-cairo text-[10px] font-extrabold text-[#B45309]">
                            عاجل
                          </span>
                        ) : null}
                        <span className="font-cairo text-[12px] font-extrabold text-[#101828]">
                          {referral.code}
                        </span>
                      </div>
                      <span className="font-cairo text-[11px] font-semibold text-[#667085]">
                        {referral.statusLabel}
                      </span>
                    </div>
                    <div className="mt-2 font-cairo text-[13px] font-bold text-primary">
                      إلى: {referral.doctorName}
                    </div>
                    <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                      {referral.specialty}
                    </div>
                  </div>
                ))
              ) : section.count === 0 ? (
                <div className="rounded-[10px] border border-dashed border-[#D0D5DD] bg-white/80 px-4 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                  لا توجد عناصر في هذا القسم بعد
                </div>
              ) : hasItems ? (
                section.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[12px] border border-[#E2E8F0] bg-white px-4 py-3 text-start shadow-sm"
                  >
                    <div className="flex flex-wrap gap-2 justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <div className="font-cairo text-[13px] font-extrabold text-[#101828]">
                          {item.title}
                        </div>
                        {item.subtitle ? (
                          <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                            {item.subtitle}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center shrink-0">
                        {item.urgency === 'urgent' ? (
                          <span className="inline-flex rounded-full bg-[#FEF3C7] px-2.5 py-1 font-cairo text-[10px] font-extrabold text-[#B45309]">
                            عاجل
                          </span>
                        ) : null}
                        <span className="font-cairo text-[11px] font-semibold text-[#667085]">
                          {item.statusLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-4 text-start">
                  <div className="font-cairo text-[13px] font-extrabold text-[#101828]">
                    {section.count} طلب/طلبات مسجّلة
                  </div>
                </div>
              )}

              {onOpenSection ? (
                <button
                  type="button"
                  onClick={onOpenSection}
                  className="flex h-10 w-full items-center justify-center rounded-[10px] border-2 border-primary bg-white font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#F0FAF9]"
                >
                  فتح {theme.title}
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        className={cn(
          'border-t px-4 py-3 sm:px-5',
          theme.borderClass,
          theme.headerClass,
        )}
      >
        <div
          dir={dir}
          className="flex w-full items-center justify-start gap-2 text-start"
        >
          <span
            className={cn(
              'h-2 w-2 shrink-0 rounded-full',
              theme.footerDotClass,
            )}
            aria-hidden
          />
          <span className="font-cairo text-[12px] font-semibold text-[#667085]">
            {section.footerHint}
          </span>
        </div>
      </div>
    </article>
  );
}
