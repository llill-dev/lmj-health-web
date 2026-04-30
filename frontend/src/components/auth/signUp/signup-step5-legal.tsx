'use client';

import { useState } from 'react';
import { ArrowRight, FileText, Loader2 } from 'lucide-react';

const LEGAL_ROWS: { href: string; label: string }[] = [
  { href: '#terms-of-use', label: 'شروط الاستخدام' },
  { href: '#privacy-policy', label: 'سياسة الخصوصية' },
  { href: '#data-processing', label: 'معالجة البيانات' },
];

export default function SignUpStep5Legal({
  onPrev,
  onAgree,
  isSubmitting = false,
}: {
  onPrev: () => void;
  onAgree: () => void;
  isSubmitting?: boolean;
}) {
  const [accepted, setAccepted] = useState(false);

  return (
    <>
      <div className="mt-7 flex flex-col items-center text-center">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary shadow-[0_18px_40px_rgba(15,143,139,0.35)]">
          <FileText className="h-9 w-9 text-white" strokeWidth={1.75} />
        </div>
        <h2 className="mt-5 font-cairo text-[26px] font-extrabold text-primary">
          الرسائل القانونية
        </h2>
        <p className="mt-2 max-w-[560px] font-cairo text-[14px] font-semibold text-[#6B7280]">
          بمتابعة استخدامك للنظام، فإنك توافق على:
        </p>

        <ul className="mt-8 w-full max-w-[520px] space-y-3 text-right">
          {LEGAL_ROWS.map((row) => (
            <li key={row.href}>
              <a
                href={row.href}
                className="flex items-center gap-3 rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 py-3.5 font-cairo text-[14px] font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-colors hover:bg-[#EAECEF]"
              >
                <span className="shrink-0 text-[18px] leading-none text-primary" aria-hidden>
                  •
                </span>
                <span>{row.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <label className="mt-8 flex w-full max-w-[520px] cursor-pointer items-start justify-end gap-3 text-right">
          <span className="font-cairo text-[13px] font-semibold leading-7 text-[#374151]">
            أوافق على جميع الشروط والأحكام المذكورة أعلاه وأقر بأني قرأتها وفهمتها بشكل
            كامل
          </span>
          <input
            type="checkbox"
            className="mt-2 h-[18px] w-[18px] shrink-0 rounded border-[#CBD5E1] text-primary focus:ring-primary"
            checked={accepted}
            disabled={isSubmitting}
            onChange={(e) => setAccepted(e.target.checked)}
          />
        </label>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onPrev}
          className="flex h-[54px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-bold text-[#374151] shadow-[0_12px_24px_rgba(0,0,0,0.06)] disabled:pointer-events-none disabled:opacity-60"
        >
          <ArrowRight className="h-4 w-4" />
          السابق
        </button>
        <button
          type="button"
          disabled={!accepted || isSubmitting}
          onClick={() => {
            if (!accepted || isSubmitting) return;
            onAgree();
          }}
          className={
            accepted && !isSubmitting
              ? 'flex h-[54px] items-center justify-center rounded-[6px] bg-primary font-cairo text-[14px] font-bold text-white shadow-[0_18px_40px_rgba(15,143,139,0.35)] transition-colors hover:bg-[#14B3AE] disabled:pointer-events-none'
              : 'flex h-[54px] items-center justify-center rounded-[6px] bg-[#D1D5DB] font-cairo text-[14px] font-bold text-white shadow-none cursor-not-allowed'
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="ms-2 h-5 w-5 shrink-0 animate-spin" aria-hidden />
              جاري إرسال الطلب…
            </>
          ) : (
            'أوافق'
          )}
        </button>
      </div>

      <p className="mt-6 text-center font-cairo text-[12px] font-semibold leading-5 text-[#98A2B3]">
        يرجى قراءة جميع المستندات بعناية قبل الموافقة
      </p>
    </>
  );
}
