import { LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/provider";

interface QuickAction {
  icon: LucideIcon;
  label: string;
  variant?: "default" | "primary";
  onClick?: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  const { t } = useI18n();
  return (
    <div>
      <h3 className="font-cairo text-lg font-bold text-[#0f172a] mb-4">
        {t("secretary.dashboard.quickActions.title")}
      </h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isPrimary = action.variant === "primary";

          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-cairo text-sm font-bold shadow-sm transition hover:bg-gray-50 ${
                isPrimary
                  ? "bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.30)] hover:bg-primary/90"
                  : "border border-[#e2e8f0] bg-white text-[#0f172a]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
