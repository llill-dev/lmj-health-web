import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n/provider";

interface PermissionsCardProps {
  permissions: string[];
}

export default function PermissionsCard({ permissions }: PermissionsCardProps) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
      <h3 className="font-cairo text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        {t("secretary.profile.permissions.title")}
      </h3>
      <div className="space-y-2">
        {permissions.map((permission, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2"
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-cairo text-sm font-medium text-[#0f172a]">
              {permission}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
