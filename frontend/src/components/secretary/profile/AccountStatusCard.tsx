import { CheckCircle } from "lucide-react";
import { useI18n } from "@/i18n/provider";

interface AccountStatusCardProps {
  status: string;
  statusColor: string;
  lastLogin: string;
}

export default function AccountStatusCard({
  status,
  statusColor,
  lastLogin,
}: AccountStatusCardProps) {
  const { locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
      <h3 className="font-cairo text-lg font-bold text-[#0f172a] mb-4">
        {tr("حالة الحساب", "Account status")}
      </h3>
      <div className="flex items-center gap-3">
        <CheckCircle className={`h-5 w-5 ${statusColor}`} />
        <span className={`font-cairo text-sm font-bold ${statusColor}`}>
          {status}
        </span>
      </div>
      <div className="mt-4">
        <p className="font-cairo text-xs font-medium text-[#64748b]">
          {tr("آخر تسجيل دخول", "Last login")}
        </p>
        <p className="font-cairo text-sm font-bold text-[#0f172a]">{lastLogin}</p>
      </div>
    </div>
  );
}
