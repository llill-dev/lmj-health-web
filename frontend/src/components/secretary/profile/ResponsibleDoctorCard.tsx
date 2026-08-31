import { Stethoscope, Star } from "lucide-react";
import { useI18n } from "@/i18n/provider";

interface ResponsibleDoctorCardProps {
  doctorName: string;
  specialty: string;
  rating: number;
  ratingCount: number;
}

export default function ResponsibleDoctorCard({
  doctorName,
  specialty,
  rating,
  ratingCount,
}: ResponsibleDoctorCardProps) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
      <h3 className="font-cairo text-lg font-bold text-[#0f172a] mb-4">
        {t("secretary.profile.responsibleDoctor.title")}
      </h3>
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Stethoscope className="h-7 w-7 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-cairo text-base font-bold text-[#0f172a]">
            {doctorName}
          </h4>
          <p className="font-cairo text-sm font-medium text-[#64748b]">
            {specialty}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-cairo text-sm font-bold text-[#0f172a]">
              {rating}
            </span>
            <span className="font-cairo text-xs font-medium text-[#64748b]">
              {t("secretary.dashboard.accountStatus.reviews", {
                count: ratingCount,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
