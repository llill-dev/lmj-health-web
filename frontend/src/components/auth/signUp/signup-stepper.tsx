'use client';

import { Check } from 'lucide-react';

export default function SignUpStepper({ step }: { step: 1 | 2 | 3 | 4 | 5 }) {
  const progressWidth =
    step === 1
      ? 'w-[20%]'
      : step === 2
        ? 'w-[40%]'
        : step === 3
          ? 'w-[60%]'
          : step === 4
            ? 'w-[80%]'
            : 'w-full';

  const bar = (fromStep: number) =>
    step >= fromStep + 1 ? 'h-[2px] w-[42px] shrink-0 bg-primary' : 'h-[2px] w-[42px] shrink-0 bg-[#E5E7EB]';

  const circleBase =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-cairo text-[13px] font-bold';

  const circleDone = `${circleBase} bg-primary text-white shadow-[0_10px_22px_rgba(15,143,139,0.3)]`;
  const circleActive = `${circleBase} bg-primary text-white shadow-[0_10px_22px_rgba(15,143,139,0.3)]`;
  const circleTodo = `${circleBase} bg-[#E5E7EB] text-[#98A2B3]`;

  const labelActive = 'font-cairo text-[11px] font-bold text-primary';
  const labelTodo = 'font-cairo text-[11px] font-bold text-[#98A2B3]';

  return (
    <>
      <div className="h-[6px] w-full rounded-full bg-[#E5E7EB]">
        <div className={`h-full rounded-full bg-primary ${progressWidth}`} />
      </div>

      <div className="mt-4 flex flex-row flex-wrap items-start justify-between gap-y-3">
        {/* 1 */}
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex flex-col items-center gap-1.5">
            <span className={step > 1 ? circleDone : step === 1 ? circleActive : circleTodo}>
              {step > 1 ? <Check className="h-4 w-4" /> : 1}
            </span>
            <span className={step >= 1 ? labelActive : labelTodo}>الحساب</span>
          </div>
          <div className={bar(1)} />
        </div>

        {/* 2 */}
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex flex-col items-center gap-1.5">
            <span className={step > 2 ? circleDone : step === 2 ? circleActive : circleTodo}>
              {step > 2 ? <Check className="h-4 w-4" /> : 2}
            </span>
            <span className={step >= 2 ? labelActive : labelTodo}>الشخصية</span>
          </div>
          <div className={bar(2)} />
        </div>

        {/* 3 */}
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex flex-col items-center gap-1.5">
            <span className={step > 3 ? circleDone : step === 3 ? circleActive : circleTodo}>
              {step > 3 ? <Check className="h-4 w-4" /> : 3}
            </span>
            <span className={step >= 3 ? labelActive : labelTodo}>المهنية</span>
          </div>
          <div className={bar(3)} />
        </div>

        {/* 4 */}
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex flex-col items-center gap-1.5">
            <span className={step > 4 ? circleDone : step === 4 ? circleActive : circleTodo}>
              {step > 4 ? <Check className="h-4 w-4" /> : 4}
            </span>
            <span className={step >= 4 ? labelActive : labelTodo}>الإضافية</span>
          </div>
          <div className={bar(4)} />
        </div>

        {/* 5 */}
        <div className="flex min-w-0 flex-col items-center gap-1.5">
          <span className={step === 5 ? circleActive : circleTodo}>{5}</span>
          <span className={step === 5 ? labelActive : labelTodo}>القانونية</span>
        </div>
      </div>
    </>
  );
}
