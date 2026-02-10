'use client';

export default function SignupSuccess({
  onContinue,
}: {
  onContinue?: () => void;
}) {
  return (
    <section
      dir='rtl'
      lang='ar'
      className='relative mx-auto flex min-h-[520px] w-full items-center justify-center'
    >
      <div className='relative w-full'>
        <div className='pointer-events-none absolute right-[500px] -top-[20px] -z-10'>
          <div className='relative h-44 w-44'>
            <div className='absolute left-1/2 top-1/2 h-14 w-44 -z-10 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl bg-teal-600/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
            <div className='absolute left-1/2 top-1/2 h-14 w-44 z-10 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-3xl bg-teal-600/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
          </div>
        </div>

        <button
          type='button'
          onClick={onContinue}
          className='group relative mx-auto mt-24 block w-full max-w-[520px] select-none text-center'
        >
          <div className='mx-auto flex h-[150px] w-[150px] items-center justify-center rounded-full bg-white shadow-[0_25px_70px_rgba(0,0,0,0.14)]'>
            <div className='flex h-[120px] w-[120px] items-center justify-center rounded-full border-[10px] border-[#16C5C0]'>
              <svg
                width='60'
                height='44'
                viewBox='0 0 60 44'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M5 24L22 39L55 5'
                  stroke='#16C5C0'
                  strokeWidth='8'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
          </div>

          <div className='mt-16 font-cairo text-[16px] font-bold leading-[24px] text-[#1F2937]'>
            أهلا وسهلا بك في LMJ HEALTH
          </div>
          <div className='mt-1 font-cairo text-[13px] font-semibold leading-[20px] text-[#667085]'>
            تم إنشاء حسابك بنجاح
          </div>
        </button>
      </div>
    </section>
  );
}
