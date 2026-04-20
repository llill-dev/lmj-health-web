import { Activity, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export function AdminAuditLogStatsCards({
  isLoading,
  total,
  failCount,
  denyCount,
  phiCount,
}: {
  isLoading: boolean;
  total: number;
  failCount: number;
  denyCount: number;
  phiCount: number;
}) {
  return (
    <section className='mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4'>
      <div className='flex h-[120px] flex-col justify-between rounded-[14px] border border-[#E0F2FE] bg-gradient-to-br from-[#F0F9FF] to-white px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
        <div className='flex items-center justify-between'>
          <div className='flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white shadow-sm'>
            <Activity className='h-5 w-5 text-primary' />
          </div>
          <div className='font-cairo text-[11px] font-bold text-[#667085]'>
            {isLoading ? '—' : total.toLocaleString('ar-SA')}
          </div>
        </div>
        <div className='font-cairo text-[12px] font-extrabold text-[#344054]'>إجمالي السجلات</div>
      </div>

      <div className='flex h-[120px] flex-col justify-between rounded-[14px] border border-[#FECACA] bg-gradient-to-br from-[#FEF2F2] to-white px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
        <div className='flex items-center justify-between'>
          <div className='flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white shadow-sm'>
            <ShieldAlert className='h-5 w-5 text-[#DC2626]' />
          </div>
          <div className='font-cairo text-[11px] font-bold text-[#667085]'>{isLoading ? '—' : failCount}</div>
        </div>
        <div className='font-cairo text-[12px] font-extrabold text-[#344054]'>إجراءات فاشلة</div>
      </div>

      <div className='flex h-[120px] flex-col justify-between rounded-[14px] border border-[#FED7AA] bg-gradient-to-br from-[#FFF7ED] to-white px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
        <div className='flex items-center justify-between'>
          <div className='flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white shadow-sm'>
            <Shield className='h-5 w-5 text-[#D97706]' />
          </div>
          <div className='font-cairo text-[11px] font-bold text-[#667085]'>{isLoading ? '—' : denyCount}</div>
        </div>
        <div className='font-cairo text-[12px] font-extrabold text-[#344054]'>محاولات مرفوضة</div>
      </div>

      <div className='flex h-[120px] flex-col justify-between rounded-[14px] border border-[#FBCFE8] bg-gradient-to-br from-[#FDF2F8] to-white px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
        <div className='flex items-center justify-between'>
          <div className='flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white shadow-sm'>
            <ShieldCheck className='h-5 w-5 text-[#DB2777]' />
          </div>
          <div className='font-cairo text-[11px] font-bold text-[#667085]'>{isLoading ? '—' : phiCount}</div>
        </div>
        <div className='font-cairo text-[12px] font-extrabold text-[#344054]'>وصول للبيانات الطبية</div>
      </div>
    </section>
  );
}
