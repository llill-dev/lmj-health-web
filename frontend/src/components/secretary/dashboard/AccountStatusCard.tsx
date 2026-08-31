import { Users, CheckCircle } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { formatBillingAmount } from "@/lib/doctor/billing/format";

interface AccountStatusCardProps {
  doctorName: string;
  specialty: string;
  rating: number;
  ratingCount: number;
  price: number;
  currency?: string;
}

export default function AccountStatusCard({
  doctorName,
  specialty,
  rating,
  ratingCount,
  price,
  currency,
}: AccountStatusCardProps) {
  const { t } = useI18n();
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e8faf8] via-white to-[#f0fdf9] p-6 shadow-[0_14px_36px_-14px_rgba(15,143,139,0.2)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 14% 40%, rgba(15,143,139,0.12), transparent 38%), radial-gradient(circle at 88% 30%, rgba(20,184,166,0.1), transparent 36%)",
        }}
      />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-cairo text-sm font-bold text-primary">
                {t("secretary.dashboard.accountStatus.active")}
              </span>
            </div>
            <h2 className="font-cairo text-lg font-bold text-[#0f172a] mb-1">
              {t("secretary.dashboard.accountStatus.responsibleDoctor", {
                name: doctorName,
              })}
            </h2>
            <p className="font-cairo text-sm font-medium text-[#64748b] mb-3">
              {specialty}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="font-cairo text-sm font-bold text-[#0f172a]">
                  {rating}
                </span>
                <span className="font-cairo text-xs font-medium text-[#64748b]">
                  {t("secretary.dashboard.accountStatus.reviews", {
                    count: ratingCount,
                  })}
                </span>
              </div>
              <div className="font-cairo text-sm font-bold text-primary">
                {formatBillingAmount(price, currency)}
              </div>
            </div>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
