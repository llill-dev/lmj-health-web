export function SecretaryCardSkeleton() {
  return (
    <div className='animate-pulse rounded-[12px] border border-[#EEF2F6] bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
      <div className='flex justify-between items-start'>
        <div className='flex gap-3 items-center'>
          <div className='h-11 w-11 rounded-[8px] bg-[#EEF2F6]' />
          <div>
            <div className='h-4 w-36 rounded bg-[#EEF2F6]' />
            <div className='mt-2 h-3 w-52 rounded bg-[#EEF2F6]' />
          </div>
        </div>
        <div className='h-8 w-24 rounded-[8px] bg-[#EEF2F6]' />
      </div>
      <div className='flex gap-4 mt-4'>
        <div className='h-3 w-32 rounded bg-[#EEF2F6]' />
        <div className='h-3 w-40 rounded bg-[#EEF2F6]' />
      </div>
      <div className='mt-4 h-16 rounded-[10px] bg-[#EEF2F6]' />
    </div>
  );
}
