import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

const STEPS = [1, 2, 3, 4] as const;

export function DeleteAccountStepper({
  currentStep,
}: {
  currentStep: 1 | 2 | 3 | 4;
}) {
  return (
    <div className="mb-6 flex items-center justify-center gap-0 px-2">
      {STEPS.map((step, index) => {
        const completed = step < currentStep;
        const active = step === currentStep;
        const pending = step > currentStep;

        return (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full font-cairo text-[13px] font-extrabold transition',
                completed && 'bg-[#22C55E] text-white',
                active && 'bg-[#EF4444] text-white shadow-[0_8px_18px_rgba(239,68,68,0.35)]',
                pending && 'bg-[#E5E7EB] text-[#667085]',
              )}
            >
              {completed ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : (
                step
              )}
            </div>
            {index < STEPS.length - 1 ? (
              <div
                className={cn(
                  'h-[2px] w-10 sm:w-14',
                  step < currentStep ? 'bg-[#22C55E]' : 'bg-[#E5E7EB]',
                )}
                aria-hidden
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
