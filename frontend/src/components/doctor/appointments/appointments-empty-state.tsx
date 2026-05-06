'use client';

type Props = {
  onBookClick: () => void;
};

/**
 * حالة فارغة لصفحة المواعيد — ترتيب: صورة ثم عنوان ثم جملة دعوة ثم زر الحجز (وسط، RTL).
 */
export default function AppointmentsEmptyState({ onBookClick }: Props) {
  return (
    <div className='flex flex-col items-center px-6 py-14 text-center'>
      <div className='mb-8 flex w-full max-w-[280px] justify-center sm:max-w-[320px]'>
        <img
          src='/images/image-notFound_appotemint.png'
          alt='لا توجد مواعيد محجوزة'
          className='h-auto w-full select-none object-contain'
          width={320}
          height={280}
          loading='lazy'
          decoding='async'
        />
      </div>

      <h3 className='font-cairo text-[17px] font-bold leading-[28px] text-[#101828] sm:text-[18px]'>
        لا يوجد مواعيد محجوزة بعد .
      </h3>

      <p className='mt-3 font-cairo text-[14px] font-semibold leading-[22px] text-[#667085]'>
        قم بحجز موعد الآن
      </p>

      <button
        type='button'
        onClick={onBookClick}
        className='mt-8 min-h-[48px] min-w-[180px] rounded-[8px] bg-primary px-8 font-cairo text-[15px] font-bold text-white shadow-[0px_12px_24px_-4px_rgba(15,143,139,0.35)] transition-colors hover:bg-[#14B3AE]'
      >
        حجز موعد
      </button>
    </div>
  );
}
