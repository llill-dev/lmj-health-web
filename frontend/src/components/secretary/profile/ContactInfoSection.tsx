import { LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/provider";

interface ContactInfoItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

interface ContactInfoSectionProps {
  items: ContactInfoItem[];
}

export default function ContactInfoSection({ items }: ContactInfoSectionProps) {
  const { locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
      <h3 className="font-cairo text-lg font-bold text-[#0f172a] mb-4">
        {tr("معلومات الاتصال", "Contact information")}
      </h3>
      <div className="space-y-3">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-cairo text-xs font-medium text-[#64748b]">
                  {item.label}
                </p>
                <p className="font-cairo text-sm font-bold text-[#0f172a]">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
