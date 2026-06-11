import { UserX } from 'lucide-react';
import type { ReactNode } from 'react';
import { DeleteAccountStepper } from './delete-account-stepper';

export function DeleteAccountShell({
  step,
  subtitle,
  children,
}: {
  step: 1 | 2 | 3 | 4 | 5;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div
      dir="rtl"
      lang="ar"
      className="flex min-h-screen items-center justify-center bg-[#F3F4F6] px-4 py-10"
    >
      <div className="w-full max-w-[520px]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FEE2E2] shadow-[0_0_0_10px_rgba(254,226,226,0.45)]">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#EF4444]">
              <UserX className="h-6 w-6 text-white" aria-hidden />
            </div>
          </div>
          <h1 className="font-cairo text-[24px] font-black text-[#111827]">
            حذف الحساب
          </h1>
          {subtitle ? (
            <p className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
              {subtitle}
            </p>
          ) : null}
        </div>

        {step <= 4 ? (
          <DeleteAccountStepper currentStep={step as 1 | 2 | 3 | 4} />
        ) : null}

        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}
