import { AlertTriangle } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

export function AdminAuditLogPrivacyNote() {
  const { t } = useI18n();
  return (
    <section className='mt-6 rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] px-6 py-4'>
      <div className='flex items-start justify-between gap-4'>
        <div className='text-start'>
          <div className='font-cairo text-[14px] font-black text-[#92400E]'>{t('adminAuditLog.privacy.title')}</div>
          <div className='mt-1 font-cairo text-[12px] font-semibold leading-[20px] text-[#B45309]'>
            {t('adminAuditLog.privacy.body')}
            <br />
            {t('adminAuditLog.privacy.retention')}
          </div>
        </div>
        <div className='flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] bg-[#FDE68A]'>
          <AlertTriangle className='h-5 w-5 text-[#B45309]' />
        </div>
      </div>
    </section>
  );
}
