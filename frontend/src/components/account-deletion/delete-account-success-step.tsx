import { Check, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const PENDING_ITEMS = [
  'حسابك في حالة «بانتظار الحذف»',
  'يمكنك استعادته خلال 7 أيام',
  'بعدها يُحذف نهائياً ولا يمكن التراجع',
] as const;

export function DeleteAccountSuccessStep({
  recoverUntilLabel,
  busy,
  onRestore,
  onGoHome,
  restoreHref = '/doctor/restore-account',
}: {
  recoverUntilLabel?: string | null;
  busy?: boolean;
  onRestore: () => void | Promise<void>;
  onGoHome: () => void;
  restoreHref?: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF3C7]">
        <Check className="h-7 w-7 text-[#D97706]" aria-hidden />
      </div>

      <h2 className="font-cairo text-[20px] font-extrabold text-[#111827]">
        تم تقديم طلب حذف الحساب
      </h2>
      <p className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
        لم يُحذف حسابك نهائياً بعد — لا يزال بإمكانك التراجع
      </p>
      {recoverUntilLabel ? (
        <p className="mt-2 font-cairo text-[12px] font-semibold text-[#B45309]">
          آخر موعد للاسترجاع: {recoverUntilLabel}
        </p>
      ) : null}

      <ul className="mt-6 space-y-3 text-start">
        {PENDING_ITEMS.map((item) => (
          <li
            key={item}
            className="flex items-center justify-start gap-2 font-cairo text-[13px] font-bold text-[#344054]"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F59E0B] text-white">
              <Check className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onRestore()}
          className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#22C55E] font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(34,197,94,0.22)] transition hover:bg-[#16A34A] disabled:opacity-60"
        >
          <RotateCcw className="w-4 h-4" aria-hidden />
          <span>{busy ? 'جارٍ الاسترجاع…' : 'استعادة الحساب الآن'}</span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onGoHome}
          className="flex h-[48px] w-full items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#F3F4F6] font-cairo text-[14px] font-extrabold text-[#667085] transition hover:bg-[#E5E7EB] disabled:opacity-60"
        >
          الخروج والمتابعة لاحقاً
        </button>
        <Link
          to={restoreHref}
          className="block font-cairo text-[12px] font-bold text-primary transition hover:text-[#0A7A77]"
        >
          سجّلت خروجك؟ استعد حسابك من هنا
        </Link>
      </div>
    </div>
  );
}
