import { Search } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils/utils";
import type { DoctorOrderCategory } from "@/lib/doctor/orders/doctorOrderTypes";

const TAB_IDS: Array<{
  id: Exclude<DoctorOrderCategory, "all">;
}> = [
  { id: "lab" },
  { id: "radiology" },
  { id: "procedure" },
  { id: "referral" },
];

export function MedicalRequestsToolbar({
  search,
  onSearchChange,
  tab,
  onTabChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  tab: Exclude<DoctorOrderCategory, "all">;
  onTabChange: (tab: Exclude<DoctorOrderCategory, "all">) => void;
}) {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const resolveTabLabel = (id: Exclude<DoctorOrderCategory, "all">) => {
    if (id === "lab") return tr("تحاليل", "Lab");
    if (id === "radiology") return tr("أشعة", "Radiology");
    if (id === "procedure") return tr("إجراءات", "Procedures");
    return tr("إحالات", "Referrals");
  };

  return (
    <div className="space-y-4">
      <label className="relative block" dir={dir}>
        <span className="sr-only">{tr("بحث عن مريض", "Search patient")}</span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={tr("ابحث عن مريض...", "Search patient...")}
          className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-white ps-4 pe-11 text-start font-cairo text-[13px] font-semibold text-[#111827] outline-none ring-primary/20 placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary focus:ring-2"
        />
        <Search
          className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
          aria-hidden
        />
      </label>

      <div className="grid grid-cols-2 gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] p-1.5 sm:grid-cols-4">
        {TAB_IDS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={cn(
              "h-[44px] rounded-[10px] font-cairo text-[14px] font-extrabold transition",
              tab === item.id
                ? "bg-primary text-white shadow-[0_8px_18px_rgba(15,143,139,0.24)]"
                : "bg-transparent text-[#475467] hover:bg-white",
            )}
          >
            {resolveTabLabel(item.id)}
          </button>
        ))}
      </div>
    </div>
  );
}
