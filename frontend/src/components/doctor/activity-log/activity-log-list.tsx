'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  CalendarDays,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  Globe,
  LogIn,
  MessageSquare,
  Monitor,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import type {
  ActivityLogActionType,
  DoctorActivityLogItem,
} from '@/lib/doctor/activityLog/types';
import { cn } from '@/lib/utils/utils';
import { useI18n } from '@/i18n/provider';

const ACTION_ICONS: Record<ActivityLogActionType, typeof Eye> = {
  view_record: Eye,
  upload_file: UploadCloud,
  login: LogIn,
  update_profile: ShieldCheck,
  access_request: ShieldCheck,
  appointment: CalendarDays,
  consultation: MessageSquare,
  order: FileText,
  security: ShieldCheck,
  other: Stethoscope,
};

const expandSpring = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 32,
  mass: 0.85,
};

const detailsContainerVariants = {
  collapsed: {},
  expanded: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.05,
    },
  },
};

const detailRowVariants = {
  collapsed: { opacity: 0, y: -8, scale: 0.98 },
  expanded: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 420, damping: 28 },
  },
};

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      variants={detailRowVariants}
      className="flex items-center gap-3 rounded-[10px] bg-[#FAFAFA] px-4 py-3"
    >
      <Icon className="w-4 h-4 shrink-0 text-primary" aria-hidden />
      <span className="font-cairo text-[12px] font-extrabold text-[#667085]">
        {label}
      </span>
      <span className="ms-auto min-w-0 text-end font-cairo text-[13px] font-bold text-[#111827]">
        {value}
      </span>
    </motion.div>
  );
}

export function ActivityLogCard({
  item,
  index,
  defaultExpanded = false,
}: {
  item: DoctorActivityLogItem;
  index: number;
  defaultExpanded?: boolean;
}) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const Icon = ACTION_ICONS[item.actionType] ?? Eye;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'overflow-hidden rounded-[14px] border bg-white shadow-sm transition-colors duration-300',
        expanded
          ? 'border-primary/35 shadow-[0_10px_28px_rgba(15,143,139,0.12)]'
          : 'border-[#D1FAE5]',
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-4 text-start transition hover:bg-[#F0FDFA]/60 sm:gap-4 sm:px-5"
        aria-expanded={expanded}
      >
        <motion.div
          layout
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#F0FDFA] text-primary"
          animate={expanded ? { scale: 1.04 } : { scale: 1 }}
          transition={expandSpring}
        >
          <Icon className="w-5 h-5" aria-hidden />
        </motion.div>

        <div className="flex-1 min-w-0 text-start">
          <p className="font-cairo text-[14px] font-extrabold leading-[22px] text-[#111827]">
            {item.title}
          </p>
        </div>



        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={expandSpring}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F8FAFC] text-[#98A2B3]"
        >
          <ChevronDown className="w-5 h-5" aria-hidden />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: expandSpring,
              opacity: { duration: 0.18 },
            }}
            className="overflow-hidden border-t border-[#EEF2F6] bg-[#FCFDFD]"
          >
            <motion.div
              variants={detailsContainerVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="px-4 py-4 space-y-2 sm:px-5"
            >
              <DetailRow
                icon={Calendar}
                label={t('doctor.activityLog.detail.date')}
                value={item.dateLabel}
              />
              <DetailRow
                icon={Clock3}
                label={t('doctor.activityLog.detail.time')}
                value={item.timeLabel}
              />
              {item.patientName ? (
                <DetailRow
                  icon={UserRound}
                  label={t('doctor.activityLog.detail.patient')}
                  value={item.patientName}
                />
              ) : null}
              {item.actorDisplayName ? (
                <DetailRow
                  icon={UserRound}
                  label={t('doctor.activityLog.detail.actor')}
                  value={item.actorDisplayName}
                />
              ) : null}
              {item.actorRoleLabel ? (
                <DetailRow
                  icon={ShieldCheck}
                  label={t('doctor.activityLog.detail.role')}
                  value={item.actorRoleLabel}
                />
              ) : null}
              <DetailRow
                icon={ShieldCheck}
                label={t('doctor.activityLog.detail.operationType')}
                value={item.operationTypeLabel}
              />
              {item.ip ? (
                <DetailRow icon={Globe} label="IP" value={item.ip} />
              ) : null}
              {item.device ? (
                <DetailRow
                  icon={Monitor}
                  label={t('doctor.activityLog.detail.device')}
                  value={item.device}
                />
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

export function ActivityLogList({
  items,
}: {
  items: DoctorActivityLogItem[];
}) {
  const { t } = useI18n();
  if (!items.length) {
    return (
      <div className="rounded-[14px] border border-dashed border-[#D1FAE5] bg-white px-6 py-14 text-center font-cairo text-[14px] font-semibold text-[#667085]">
        {t('doctor.activityLog.emptyResults')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <ActivityLogCard
          key={item.id}
          item={item}
          index={index}
          defaultExpanded={index === 0}
        />
      ))}
    </div>
  );
}
