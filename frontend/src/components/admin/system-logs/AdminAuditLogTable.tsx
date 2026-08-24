import { useState } from 'react';
import { Activity, RotateCcw, SearchX, ShieldAlert } from 'lucide-react';
import { AuditLogDetailsDialog } from '@/components/admin/system-logs/AuditLogDetailsDialog';
import { AuditLogRow } from '@/components/admin/system-logs/AuditLogRow';
import { AuditLogSkeletonRow } from '@/components/admin/system-logs/AuditLogSkeletonRow';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';
import type { AuditLogItem } from '@/lib/admin/types';
import { useI18n } from '@/i18n/provider';

export function AdminAuditLogTable({
  isAwaitingData,
  isError,
  error,
  logs,
  hasActiveFilters,
  onResetFilters,
  onRetry,
}: {
  isAwaitingData: boolean;
  isError: boolean;
  error: unknown;
  logs: AuditLogItem[];
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onRetry: () => void;
}) {
  const { t } = useI18n();
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
        <div className='col-span-3 text-start font-cairo text-[12px] font-extrabold text-[#667085]'>
          {t('adminAuditLog.table.actionCategory')}
        </div>
        <div className='col-span-2 text-start font-cairo text-[12px] font-extrabold text-[#667085]'>{t('adminAuditLog.table.user')}</div>
        <div className='col-span-2 text-start font-cairo text-[12px] font-extrabold text-[#667085]'>{t('adminAuditLog.table.outcome')}</div>
        <div className='col-span-2 text-start font-cairo text-[12px] font-extrabold text-[#667085]'>IP</div>
        <div className='col-span-3 text-start font-cairo text-[12px] font-extrabold text-[#667085]'>
          {t('adminAuditLog.table.dateTime')}
        </div>
      </div>

      {isAwaitingData && (
        <div className='divide-y divide-[#EEF2F6]'>
          {Array.from({ length: 6 }).map((_, i) => (
            <AuditLogSkeletonRow key={i} />
          ))}
        </div>
      )}

      {isError && !isAwaitingData && (
        <div className='px-6 py-16 text-center'>
          <ShieldAlert className='mx-auto mb-3 h-10 w-10 text-[#FCA5A5]' />
          <div className='font-cairo text-[14px] font-black text-[#991B1B]'>{t('adminAuditLog.table.loadError')}</div>
          <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
            {userFacingErrorMessage(error, t('adminAuditLog.table.connectionErrorFallback'))}
          </div>
          <button
            type='button'
            onClick={onRetry}
            className='mt-4 inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#FECACA] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#B42318]'
          >
            <RotateCcw className='h-4 w-4' />
            {t('adminMedicalOrders.details.retry')}
          </button>
        </div>
      )}

      {!isAwaitingData && !isError && logs.length === 0 && (
        <div className='px-6 py-16 text-center'>
          <SearchX className='mx-auto mb-3 h-10 w-10 text-[#D0D5DD]' />
          <div className='font-cairo text-[14px] font-black text-[#667085]'>{t('adminAuditLog.table.noMatches')}</div>
          <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
            {hasActiveFilters
              ? t('adminAuditLog.table.tryChangingFilters')
              : t('adminAuditLog.table.noRecordsInScope')}
          </div>
          {hasActiveFilters ? (
            <button
              type='button'
              onClick={onResetFilters}
              className='mt-4 inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054]'
            >
              <RotateCcw className='h-4 w-4' />
              {t('adminAuditLog.table.clearFilters')}
            </button>
          ) : null}
        </div>
      )}

      {!isAwaitingData && !isError && logs.length > 0 && (
        <div className='divide-y divide-[#EEF2F6]'>
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
