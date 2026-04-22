export default function AdminNotificationsHeading({
  newCount,
}: {
  newCount: number;
}) {
  return (
    <header className='text-right'>
      <h1 className='font-cairo text-[22px] font-black leading-[28px] text-[#111827] md:text-[24px] md:leading-[30px]'>
        الإشعارات
      </h1>
      <p className='mt-1 font-cairo text-[13px] font-semibold leading-[20px] text-[#98A2B3]'>
        لديك {newCount} إشعارات جديدة
      </p>
    </header>
  );
}
