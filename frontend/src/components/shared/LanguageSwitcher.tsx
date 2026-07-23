import { Languages } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export default function LanguageSwitcher({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-[10px] border border-[#E5E7EB] bg-white/90 p-1 ${className}`}
      aria-label={t("language.switch.aria", "Switch language")}
    >
      {!compact ? <Languages className="mx-1 h-4 w-4 text-[#667085]" /> : null}
      <button
        type="button"
        onClick={() => setLocale("ar")}
        className={`rounded-[8px] px-2.5 py-1 font-cairo text-[12px] font-bold transition ${
          locale === "ar"
            ? "bg-primary text-white"
            : "text-[#344054] hover:bg-[#F2F4F7]"
        }`}
      >
        {t("language.ar", "Arabic")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-[8px] px-2.5 py-1 font-cairo text-[12px] font-bold transition ${
          locale === "en"
            ? "bg-primary text-white"
            : "text-[#344054] hover:bg-[#F2F4F7]"
        }`}
      >
        {t("language.en", "English")}
      </button>
    </div>
  );
}
