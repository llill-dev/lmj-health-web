import { useI18n } from '@/i18n/provider';

export function AdminSystemLogsHeader() {
  const { t } = useI18n();
  return (
    <div className='text-start'>
      <div className='font-cairo text-[26px] font-black leading-[34px] text-[#111827]'>{t('adminSystemLogs.page.title')}</div>
      <div className='mt-1 font-cairo text-[12px] font-semibold leading-[16px] text-[#98A2B3]'>
        {t('adminSystemLogs.page.subtitle')}
      </div>
    </div>
  );
}
