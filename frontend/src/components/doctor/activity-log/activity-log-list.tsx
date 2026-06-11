'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ChevronDown,
  Clock3,
  Eye,
  Globe,
  LogIn,
  Monitor,
  ShieldCheck,
  UploadCloud,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import type {
  ActivityLogActionType,
  DoctorActivityLogItem,
} from '@/lib/doctor/activityLog/types';
import { cn } from '@/lib/utils/utils';

const ACTION_ICONS: Record<
  ActivityLogActionType,
  typeof Eye
> = {
  view_record: Eye,
  upload_file: UploadCloud,
  login: LogIn,
  update_profile: ShieldCheck,
  access_request: ShieldCheck,
};

function formatDisplayTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('ar-SY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
    <div className="flex items-center justify-between gap-3 rounded-[10px] bg-[#FAFAFA] px-4 py-3">
      <span className="font-cairo text-[13px] font-bold text-[#111827]">{value}</span>
      <span className="inline-flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#667085]">
        {label}
        <Icon className="h-4 w-4 text-primary" aria-hidden />
      </span>
    </div>
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
  const [expanded, setExpanded] = useState(defaultExpanded);
  const Icon = ACTION_ICONS[item.actionType] ?? Eye;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.22 }}
      className="overflow-hidden rounded-[14px] border border-[#D1FAE5] bg-white shadow-sm"
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-start gap-4 px-5 py-4 text-right transition hover:bg-[#F0FDFA]/60"
        aria-expanded={expanded}
      >
        <ChevronDown
          className={cn(
            'mt-1 h-5 w-5 shrink-0 text-[#98A2B3] transition-transform',
            expanded && 'rotate-180',
          )}
          aria-hidden
        />

        <div className="min-w-0 flex-1">
          <p className="font-cairo text-[14px] font-extrabold leading-[22px] text-[#111827]">
            {item.title}
          </p>
          <p className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]" dir="ltr">
            {formatDisplayTimestamp(item.timestamp)}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#F0FDFA] text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[#EEF2F6] bg-[#FCFDFD]"
          >
            <div className="space-y-2 px-5 py-4">
              <DetailRow icon={Calendar} label="التاريخ" value={item.dateLabel} />
              <DetailRow icon={Clock3} label="الوقت" value={item.timeLabel} />
              {item.patientName ? (
                <DetailRow icon={UserRound} label="المريض" value={item.patientName} />
              ) : null}
              <DetailRow
                icon={ShieldCheck}
                label="نوع العملية"
                value={item.operationTypeLabel}
              />
              {item.ip ? (
                <DetailRow icon={Globe} label="IP" value={item.ip} />
              ) : null}
              {item.device ? (
                <DetailRow icon={Monitor} label="الجهاز" value={item.device} />
              ) : null}
            </div>
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
  if (!items.length) {
    return (
      <div className="rounded-[14px] border border-dashed border-[#D1FAE5] bg-white px-6 py-14 text-center font-cairo text-[14px] font-semibold text-[#667085]">
        لا توجد نشاطات تطابق البحث أو الفترة المحددة
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
