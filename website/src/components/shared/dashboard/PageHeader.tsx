import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: {
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    variant?: "default" | "primary";
  };
}

export default function PageHeader({
  title,
  subtitle,
  actionButton,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-cairo text-2xl font-bold text-[#0f172a]">{title}</h1>
        {subtitle && (
          <p className="font-cairo text-sm font-medium text-[#64748b] mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actionButton && (
        <button
          onClick={actionButton.onClick}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-cairo text-sm font-bold shadow-sm transition ${
            actionButton.variant === "primary"
              ? "bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.30)] hover:bg-primary/90"
              : "border border-[#e2e8f0] bg-white text-[#0f172a] hover:bg-gray-50"
          }`}
        >
          {actionButton.icon && <actionButton.icon className="h-4 w-4" />}
          {actionButton.label}
        </button>
      )}
    </div>
  );
}
