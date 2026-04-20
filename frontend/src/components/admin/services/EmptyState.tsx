import { ClipboardList } from 'lucide-react';

export function EmptyState({ message }: { message: string }) {
  return (
    <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-12 text-center shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
      <div className='mx-auto mb-3 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#F2F4F7]'>
        <ClipboardList className='h-6 w-6 text-[#98A2B3]' />
      </div>
      <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>لا توجد عناصر</div>
      <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>{message}</div>
    </div>
  );
}
