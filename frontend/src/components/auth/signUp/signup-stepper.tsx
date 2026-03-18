'use client';

import { Check } from 'lucide-react';

export default function SignUpStepper({
  step,
}: {
  step: 1 | 2 | 3 | 4;
}) {
  const progressWidth =
    step === 1 ? 'w-[28%]' : step === 2 ? 'w-[55%]' : step === 3 ? 'w-[78%]' : 'w-full';

  return (
    <>
      <div className='h-[6px] w-full rounded-full bg-[#E5E7EB]'>
        <div className={`h-full rounded-full bg-primary ${progressWidth}`} />
      </div>

      <div className='mt-5 flex flex-row items-start justify-between'>
        <div className='flex items-center gap-2'>
          <div className='flex flex-col items-center justify-start gap-2 pl-[8px]'>
            <span
              className={
                step > 1
                  ? 'flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-[0_14px_30px_rgba(15, 143, 139,0.35)]'
                  : 'flex h-10 w-10 items-center justify-center rounded-full bg-primary font-cairo text-[14px] font-bold text-white shadow-[0_14px_30px_rgba(15, 143, 139,0.35)]'
              }
            >
              {step > 1 ? <Check className='h-5 w-5' /> : 1}
            </span>
            <span
              className={
                step >= 1
                  ? 'font-cairo text-[12px] font-bold text-primary'
                  : 'font-cairo text-[12px] font-bold text-[#98A2B3]'
              }
            >
              الحساب
            </span>
          </div>
          <div className={step >= 2 ? 'h-[2px] w-[68px] bg-primary' : 'h-[2px] w-[68px] bg-[#E5E7EB]'} />
        </div>

        <div className='flex items-center gap-2'>
          <div className='flex flex-col items-center justify-center gap-2 pl-[8px]'>
            <span
              className={
                step === 2
                  ? 'flex h-10 w-10 items-center justify-center rounded-full bg-primary font-cairo text-[14px] font-bold text-white shadow-[0_14px_30px_rgba(15, 143, 139,0.35)]'
                  : step > 2
                    ? 'flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-[0_14px_30px_rgba(15, 143, 139,0.35)]'
                    : 'flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E7EB] font-cairo text-[14px] font-bold text-[#98A2B3]'
              }
            >
              {step > 2 ? <Check className='h-5 w-5' /> : 2}
            </span>
            <span
              className={
                step === 2
                  ? 'font-cairo text-[12px] font-bold text-primary'
                  : 'font-cairo text-[12px] font-bold text-[#98A2B3]'
              }
            >
              الشخصية
            </span>
          </div>
          <div className={step >= 3 ? 'h-[2px] w-[68px] bg-primary' : 'h-[2px] w-[68px] bg-[#E5E7EB]'} />
        </div>

        <div className='flex items-center gap-2'>
          <div className='flex flex-col items-center justify-center gap-2 pl-[8px]'>
            <span
              className={
                step === 3
                  ? 'flex h-10 w-10 items-center justify-center rounded-full bg-primary font-cairo text-[14px] font-bold text-white shadow-[0_14px_30px_rgba(15, 143, 139,0.35)]'
                  : step > 3
                    ? 'flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-[0_14px_30px_rgba(15, 143, 139,0.35)]'
                    : 'flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E7EB] font-cairo text-[14px] font-bold text-[#98A2B3]'
              }
            >
              {step > 3 ? <Check className='h-5 w-5' /> : 3}
            </span>
            <span
              className={
                step === 3
                  ? 'font-cairo text-[12px] font-bold text-primary'
                  : 'font-cairo text-[12px] font-bold text-[#98A2B3]'
              }
            >
              المهنية
            </span>
          </div>
          <div className={step >= 4 ? 'h-[2px] w-[68px] bg-primary' : 'h-[2px] w-[68px] bg-[#E5E7EB]'} />
        </div>

        <div className='flex flex-col items-center justify-start gap-2 pl-[8px]'>
          <span
            className={
              step === 4
                ? 'flex h-10 w-10 items-center justify-center rounded-full bg-primary font-cairo text-[14px] font-bold text-white shadow-[0_14px_30px_rgba(15, 143, 139,0.35)]'
                : 'flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E7EB] font-cairo text-[14px] font-bold text-[#98A2B3]'
            }
          >
            4
          </span>
          <span
            className={
              step === 4
                ? 'font-cairo text-[12px] font-bold text-primary'
                : 'font-cairo text-[12px] font-bold text-[#98A2B3]'
            }
          >
            الإضافية
          </span>
        </div>
      </div>
    </>
  );
}
