import * as Dialog from '@radix-ui/react-dialog';
import { Info, X } from 'lucide-react';
import {
  CATEGORY_LABELS,
  OUTCOME_LABELS,
  ROLE_LABELS,
} from '@/components/admin/system-logs/auditLogConstants';
import { formatAuditLogDateTime } from '@/components/admin/system-logs/auditLogUtils';
import type { AuditLogItem } from '@/lib/admin/types';

function DetailLine({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const display = value?.trim() ? value : '—';
  const muted = display === '—';
  return (
    <div className='border-b border-[#F2F4F7] py-3 last:border-0'>
      <div className='font-cairo text-[11px] font-bold text-[#98A2B3]'>{label}</div>
      <div
        className={`mt-1 break-all text-right font-cairo text-[13px] font-semibold ${muted ? 'text-[#98A2B3]' : 'text-[#111827]'} ${mono ? 'font-mono text-[12px]' : ''}`}
        dir={mono ? 'ltr' : 'rtl'}
      >
        {display}
      </div>
    </div>
  );
}

export function AuditLogDetailsDialog({
  log,
  open,
  onOpenChange,
}: {
  log: AuditLogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!log) return null;

  const { date, time } = formatAuditLogDateTime(log.createdAt);
  const actorRoleLabel = log.actorRole ? ROLE_LABELS[log.actorRole] ?? log.actorRole : '—';

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[2px]' />
        <Dialog.Content
          className='fixed left-1/2 top-1/2 z-[9999] w-[min(100vw-24px,520px)] max-h-[min(90vh,640px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[16px] border border-[#EAECF0] bg-white shadow-[0_30px_80px_rgba(16,24,40,0.35)] outline-none'
          dir='rtl'
          lang='ar'
        >
          <div className='flex items-start justify-between gap-3 border-b border-[#EEF2F6] px-5 py-4'>
            <div className='flex min-w-0 items-start gap-2'>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#E7FBFA] text-primary'>
                <Info className='h-4 w-4' />
              </div>
              <div className='min-w-0 text-right'>
                <Dialog.Title className='font-cairo text-[16px] font-black text-[#111827]'>
                  تفاصيل تقنية للسجل
                </Dialog.Title>
                <Dialog.Description className='mt-0.5 font-cairo text-[11px] font-semibold leading-snug text-[#98A2B3]'>
                  معلومات الطلب والمسار للمراجعة والامتثال — لا تُعرض في الجدول الرئيسي لتقليل الازدحام وتقليل كشف هيكل الـ API.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type='button'
                className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[#667085] hover:bg-[#F2F4F7]'
                aria-label='إغلاق'
              >
                <X className='h-4 w-4' />
              </button>
            </Dialog.Close>
          </div>

          <div className='max-h-[calc(min(90vh,640px)-88px)] overflow-y-auto px-5 py-2'>
            <DetailLine label='معرّف السجل' value={log._id} mono />
            <DetailLine label='الإجراء (action)' value={log.action} mono />
            <DetailLine label='الفئة' value={CATEGORY_LABELS[log.category] ?? log.category} />
            <DetailLine label='النتيجة' value={OUTCOME_LABELS[log.outcome] ?? log.outcome} />
            <DetailLine label='التاريخ' value={`${date} · ${time}`} />
            <DetailLine label='المستخدم' value={log.actorUserName || '—'} />
            <DetailLine label='الدور' value={actorRoleLabel} />
            <DetailLine label='معرّف المستخدم (actorUserId)' value={log.actorUserId ?? ''} mono />
            <DetailLine label='عنوان IP' value={log.ip ?? ''} mono />
            <DetailLine label='طريقة HTTP' value={log.method ?? ''} mono />
            <DetailLine label='المسار (route)' value={log.route ?? ''} mono />
            <DetailLine label='معرّف الطلب (requestId)' value={log.requestId ?? ''} mono />
            <DetailLine label='User-Agent' value={log.userAgent ?? ''} mono />
            <DetailLine label='نوع الكيان' value={log.entityType ?? ''} mono />
            <DetailLine label='معرّف الكيان' value={log.entityId ?? ''} mono />
            <DetailLine
              label='المريض'
              value={
                [log.patientName, log.patientPublicId, log.patientId].filter(Boolean).join(' · ') || ''
              }
            />
            <DetailLine
              label='المستخدم المستهدف'
              value={[log.targetUserName, log.targetUserId].filter(Boolean).join(' · ') || ''}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
