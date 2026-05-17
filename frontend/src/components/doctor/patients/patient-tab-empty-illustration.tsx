import type { ReactNode } from "react";
import { cn } from "@/lib/utils/utils";

export type PatientTabEmptyIllustrationVariant = "teal" | "violet";

const variantPanel: Record<
  PatientTabEmptyIllustrationVariant,
  string
> = {
  teal: "bg-gradient-to-b from-[#f8fdfc] via-white to-[#eefcf9] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_48px_rgba(15,143,139,0.09)]",
  violet:
    "bg-gradient-to-b from-[#f8f7ff] via-white to-[#f0fdf9] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_48px_rgba(15,143,139,0.08)]",
};

export function PatientTabEmptyIllustration({
  imageSrc,
  imageClassName,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
  variant = "teal",
}: {
  imageSrc: string;
  /** إضافات Tailwind على عنصر الصورة (مثل ظل ملوّن) */
  imageClassName?: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
  actionIcon: ReactNode;
  variant?: PatientTabEmptyIllustrationVariant;
}) {
  return (
    <div
      className={cn(
        "flex w-full min-h-[300px] flex-col items-center justify-center gap-3 rounded-[22px] border border-[#E2E8F0]/90 px-6 py-10 text-center",
        variantPanel[variant],
      )}
      role="status"
      aria-live="polite"
    >
      <img
        src={imageSrc}
        alt=""
        width={320}
        height={260}
        className={cn(
          "mx-auto h-auto w-full max-w-[min(280px,88vw)] select-none object-contain",
          imageClassName,
        )}
        loading="lazy"
        decoding="async"
      />
      <p className="font-cairo text-[17px] font-black leading-snug text-[#101828]">
        {title}
      </p>
      <p className="max-w-[320px] font-cairo text-[14px] font-semibold leading-relaxed text-[#64748b]">
        {subtitle}
      </p>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex h-11 min-w-[160px] items-center justify-center gap-2 rounded-xl bg-primary px-8 font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_28px_rgba(15,143,139,0.28)] transition-[transform,background-color,box-shadow] duration-200 hover:bg-[#0d7a77] hover:shadow-[0_18px_34px_rgba(15,143,139,0.32)] active:translate-y-px"
      >
        <span className="shrink-0" aria-hidden>
          {actionIcon}
        </span>
        {actionLabel}
      </button>
    </div>
  );
}
