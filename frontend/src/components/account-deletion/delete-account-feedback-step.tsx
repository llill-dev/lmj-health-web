import {
  AlertCircle,
  CircleCheck,
  CircleX,
  FileText,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/utils';
import type { AccountDeletionReasonCode } from '@/lib/auth/accountDeletionTypes';

const REASONS: Array<{
  id: AccountDeletionReasonCode;
  label: string;
  icon: typeof Shield;
}> = [
  { id: 'privacy', label: 'مخاوف تتعلق بالخصوصية', icon: Shield },
  { id: 'not_useful', label: 'التطبيق غير مفيد لي', icon: CircleX },
  { id: 'better_alternative', label: 'وجدت بديل أفضل', icon: CircleCheck },
  { id: 'technical', label: 'مشاكل تقنية', icon: AlertCircle },
  { id: 'other', label: 'أسباب أخرى', icon: FileText },
];

export function DeleteAccountFeedbackStep({
  busy,
  error,
  onSubmit,
  onSkip,
}: {
  busy?: boolean;
  error?: string | null;
  onSubmit: (input: {
    reasonCode?: AccountDeletionReasonCode;
    feedback?: string;
  }) => void | Promise<void>;
  onSkip: () => void | Promise<void>;
}) {
  const [selectedReason, setSelectedReason] =
    useState<AccountDeletionReasonCode | null>(null);
  const [feedback, setFeedback] = useState('');

  return (
    <div className="text-center">
      <h2 className="font-cairo text-[18px] font-extrabold text-[#111827]">
        ساعدنا في التحسين
      </h2>
      <p className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
        لماذا تريد حذف حسابك؟ (اختياري)
      </p>

      <div className="mt-5 space-y-2">
        {REASONS.map((reason) => {
          const Icon = reason.icon;
          const active = selectedReason === reason.id;
          return (
            <button
              key={reason.id}
              type="button"
              onClick={() =>
                setSelectedReason((current) =>
                  current === reason.id ? null : reason.id,
                )
              }
              className={cn(
                'flex w-full items-center justify-between rounded-[10px] border px-4 py-3 text-start transition',
                active
                  ? 'border-[#FCA5A5] bg-[#FFF5F5]'
                  : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]',
              )}
            >
              <span className="font-cairo text-[13px] font-bold text-[#344054]">
                {reason.label}
              </span>
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  active ? 'text-[#EF4444]' : 'text-[#98A2B3]',
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      <div className="mt-5 text-start">
        <label
          htmlFor="delete-account-feedback"
          className="mb-2 block font-cairo text-[12px] font-extrabold text-[#344054]"
        >
          ملاحظات إضافية (اختياري)
        </label>
        <textarea
          id="delete-account-feedback"
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          rows={4}
          placeholder="شاركنا تجربتك أو اقتراحاتك للتحسين..."
          className="w-full resize-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3 text-start font-cairo text-[13px] font-semibold text-[#111827] outline-none ring-[#EF4444]/20 placeholder:text-[#98A2B3] focus:border-[#EF4444] focus:ring-2"
        />
      </div>

      {error ? (
        <p className="mt-3 text-start font-cairo text-[12px] font-bold text-[#DC2626]">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onSkip()}
          className="flex h-[48px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#F3F4F6] font-cairo text-[14px] font-extrabold text-[#667085] transition hover:bg-[#E5E7EB] disabled:opacity-60"
        >
          تخطي
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void onSubmit({
              reasonCode: selectedReason ?? undefined,
              feedback: feedback.trim() || undefined,
            })
          }
          className="flex h-[48px] items-center justify-center rounded-[10px] bg-[#EF4444] font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(239,68,68,0.28)] transition hover:bg-[#DC2626] disabled:opacity-60"
        >
          {busy ? 'جارٍ الحذف…' : 'حذف الحساب'}
        </button>
      </div>
    </div>
  );
}
