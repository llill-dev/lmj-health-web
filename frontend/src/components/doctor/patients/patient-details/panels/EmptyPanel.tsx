import { Loader2 } from "lucide-react";

export interface EmptyPanelProps {
  /** عنوان اختياري، مثل اسم التبويب عند خطأ أو قسم فارغ غير متاح */
  title?: string;
  message: string;
  /** رسالة تقنية أو تفصيل الخادم (عرض بحجم أصغر) */
  detail?: string;
  /** زر إجراء واحد أدناه، غالبًا لإعادة المحاولة */
  actionLabel?: string;
  actionPending?: boolean;
  onAction?: () => void;
}

export function EmptyPanel({
  title,
  message,
  detail,
  actionLabel,
  actionPending,
  onAction,
}: EmptyPanelProps) {
  const showAction = Boolean(onAction && actionLabel?.trim());

  return (
    <div
      role="status"
      className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFBFC] px-5 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
    >
      <div className="mx-auto max-w-xl space-y-2">
        {title ? (
          <h3 className="font-cairo text-[15px] font-extrabold text-[#101828]">
            {title}
          </h3>
        ) : null}
        <p className="font-cairo text-[13px] font-semibold leading-relaxed text-[#667085]">
          {message}
        </p>
        {detail ? (
          <p className="font-cairo text-[12px] font-medium leading-relaxed text-[#98A2B3]">
            {detail}
          </p>
        ) : null}
      </div>
      {showAction ? (
        <div className="mt-7 flex justify-center">
          <button
            type="button"
            onClick={onAction}
            disabled={actionPending}
            className="inline-flex h-10 min-w-[168px] items-center justify-center gap-2 rounded-xl bg-primary px-5 font-cairo text-[13px] font-extrabold text-white shadow-sm transition-[opacity,transform] hover:opacity-95 active:translate-y-[0.5px] disabled:pointer-events-none disabled:opacity-60"
          >
            {actionPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            {actionLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
