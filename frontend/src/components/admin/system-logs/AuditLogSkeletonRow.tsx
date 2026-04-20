export function AuditLogSkeletonRow() {
  return (
    <div className='grid grid-cols-12 gap-2 px-6 py-4 animate-pulse'>
      <div className='col-span-3 flex flex-col gap-1.5'>
        <div className='h-3 w-3/4 rounded-full bg-[#EEF2F6]' />
        <div className='h-5 w-1/2 rounded-full bg-[#EEF2F6]' />
      </div>
      <div className='col-span-2'>
        <div className='h-3 w-2/3 rounded-full bg-[#EEF2F6]' />
      </div>
      <div className='col-span-2'>
        <div className='h-5 w-16 rounded-full bg-[#EEF2F6]' />
      </div>
      <div className='col-span-2'>
        <div className='h-3 w-full rounded-full bg-[#EEF2F6]' />
      </div>
      <div className='col-span-3 flex flex-col gap-1'>
        <div className='h-3 w-5/6 rounded-full bg-[#EEF2F6]' />
        <div className='h-3 w-1/2 rounded-full bg-[#EEF2F6]' />
      </div>
    </div>
  );
}
