import { useState } from 'react';
import { Activity, ShieldAlert } from 'lucide-react';
import { AuditLogDetailsDialog } from '@/components/admin/system-logs/AuditLogDetailsDialog';
import { AuditLogRow } from '@/components/admin/system-logs/AuditLogRow';
import { AuditLogSkeletonRow } from '@/components/admin/system-logs/AuditLogSkeletonRow';
import type { AuditLogItem } from '@/lib/admin/types';

export function AdminAuditLogTable({
  isLoading,
  isFetching,
  isError,
  error,
  logs,
}: {
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  logs: AuditLogItem[];
}) {
  const [detailLog, setDetailLog] = useState<AuditLogItem | null>(null);

  return (
    <section className='mt-4 overflow-hidden rounded-[14px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.07)]'>
      <AuditLogDetailsDialog
        log={detailLog}
        open={detailLog !== null}
        onOpenChange={(o) => {
          if (!o) setDetailLog(null);
        }}
      />

      <div className='grid grid-cols-12 gap-2 border-b border-[#EEF2F6] px-6 py-3'>
        <div className='col-span-3 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>
          الإجراء / الفئة
        </div>
        <div className='col-span-2 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>المستخدم</div>
        <div className='col-span-2 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>النتيجة</div>
        <div className='col-span-2 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>IP</div>
        <div className='col-span-3 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>
          التاريخ والوقت
        </div>
      </div>

      {(isLoading || (isFetching && logs.length === 0)) && (
        <div className='divide-y divide-[#EEF2F6]'>
          {Array.from({ length: 6 }).map((_, i) => (
            <AuditLogSkeletonRow key={i} />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className='px-6 py-16 text-center'>
          <ShieldAlert className='mx-auto mb-3 h-10 w-10 text-[#FCA5A5]' />
          <div className='font-cairo text-[14px] font-black text-[#991B1B]'>تعذّر تحميل السجلات</div>
          <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
            {error instanceof Error ? error.message : 'خطأ في الاتصال بالخادم'}
          </div>
        </div>
      )}

      {!isLoading && !isError && logs.length === 0 && (
        <div className='px-6 py-16 text-center'>
          <Activity className='mx-auto mb-3 h-10 w-10 text-[#E5E7EB]' />
          <div className='font-cairo text-[14px] font-black text-[#667085]'>لا توجد سجلات مطابقة</div>
          <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
            جرّب تغيير معايير البحث أو التصفية
          </div>
        </div>
      )}

      {!isLoading && !isError && logs.length > 0 && (
        <div className={`divide-y divide-[#EEF2F6] ${isFetching ? 'opacity-60 transition-opacity' : ''}`}>
          {logs.map((log) => (
            <AuditLogRow
              key={log._id}
              log={log}
              onOpenDetails={setDetailLog}
            />
          ))}
        </div>
      )}
    </section>
  );
}
