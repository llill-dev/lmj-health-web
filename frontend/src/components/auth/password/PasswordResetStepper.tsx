import { Check, Lock, Mail, Shield } from 'lucide-react';

export type PasswordResetStep = 1 | 2 | 3 | 4;

const STEPS = [
  { id: 1 as const, label: 'البريد', Icon: Mail },
  { id: 2 as const, label: 'التحقق', Icon: Shield },
  { id: 3 as const, label: 'كلمة المرور', Icon: Lock },
  { id: 4 as const, label: 'تم', Icon: Check },
];

export default function PasswordResetStepper({
  step,
}: {
  step: PasswordResetStep;
}) {
  return (
    <div
      className='mt-6'
      dir='rtl'
      aria-label='مراحل إعادة تعيين كلمة المرور'
    >
      <div className='flex items-start justify-between gap-1'>
        {STEPS.map(({ id, label, Icon }, index) => {
          const isDone = step > id;
          const isActive = step === id;
          const isUpcoming = step < id;

          const circleClass = isDone || isActive
            ? 'bg-primary text-white shadow-[0_8px_20px_rgba(15,143,139,0.28)]'
            : 'border-2 border-[#D0D5DD] bg-white text-[#98A2B3]';

          const labelClass =
            isDone || isActive
              ? 'font-cairo text-[11px] font-bold text-primary'
              : 'font-cairo text-[11px] font-semibold text-[#98A2B3]';

          const lineClass =
            index < STEPS.length - 1
              ? step > id
                ? 'bg-primary'
                : 'bg-[#E5E7EB]'
              : '';

          return (
            <div
              key={id}
              className='flex min-w-0 flex-1 items-center'
            >
              <div className='flex min-w-0 flex-1 flex-col items-center gap-2'>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${circleClass}`}
                >
                  {isDone ? (
                    <Check
                      className='h-5 w-5'
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  ) : (
                    <Icon
                      className='h-[18px] w-[18px]'
                      strokeWidth={isUpcoming ? 2 : 2.25}
                      aria-hidden
                    />
                  )}
                </span>
                <span className={labelClass}>{label}</span>
              </div>
              {index < STEPS.length - 1 ? (
                <div
                  className={`mx-1 mb-6 h-[2px] min-w-[18px] flex-1 rounded-full ${lineClass}`}
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
