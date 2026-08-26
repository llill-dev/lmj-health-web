import { motion } from "framer-motion";
import {
  Activity,
  ArrowRightLeft,
  FlaskConical,
  ScanLine,
  Syringe,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils/utils";
import { useI18n } from "@/i18n/provider";

import { TAB_STAGGER_ITEM } from "../constants";
import type { FullProfileData } from "../types";

type TFn = (key: string, fallback?: string) => string;

interface MedicalOrderCardProps {
  order: FullProfileData["orders"][number];
  index: number;
}

type OrderKind = "lab" | "radiology" | "procedure" | "referral" | "general";

type OrderKindMeta = {
  kind: OrderKind;
  label: string;
  icon: LucideIcon;
  accent: string;
  accentGlow: string;
  iconBg: string;
  iconText: string;
  badgeBg: string;
  badgeText: string;
  badgeRing: string;
};

function buildStatusStyles(
  t: TFn,
): Record<string, { bg: string; text: string; ring: string; label: string }> {
  return {
    pending: {
      bg: "bg-[#FEF3C7]/90",
      text: "text-[#92400E]",
      ring: "ring-[#FDE68A]/70",
      label: t("doctor.orderCard.status.pending"),
    },
    completed: {
      bg: "bg-[#D1FAE5]/90",
      text: "text-[#065F46]",
      ring: "ring-[#86EFAC]/70",
      label: t("doctor.orderCard.status.completed"),
    },
    cancelled: {
      bg: "bg-[#FEE2E2]/90",
      text: "text-[#991B1B]",
      ring: "ring-[#FCA5A5]/70",
      label: t("doctor.orderCard.status.cancelled"),
    },
    in_progress: {
      bg: "bg-[#DBEAFE]/90",
      text: "text-[#1E40AF]",
      ring: "ring-[#93C5FD]/70",
      label: t("doctor.orderCard.status.inProgress"),
    },
    draft: {
      bg: "bg-[#F3F4F6]/90",
      text: "text-[#374151]",
      ring: "ring-[#D1D5DB]/70",
      label: t("doctor.orderCard.status.draft"),
    },
    finalized: {
      bg: "bg-[#D1FAE5]/90",
      text: "text-[#065F46]",
      ring: "ring-[#86EFAC]/70",
      label: t("doctor.orderCard.status.finalized"),
    },
  };
}

function detectOrderKind(title: string, t: TFn): OrderKindMeta {
  const normalized = title.toLowerCase();

  if (
    normalized.includes("lab") ||
    normalized.includes("تحليل") ||
    normalized.includes("فحص") ||
    normalized.includes("مختبر")
  ) {
    return {
      kind: "lab",
      label: t("doctor.orderCard.kind.lab"),
      icon: FlaskConical,
      accent: "from-[#CA8A04] via-[#EAB308] to-[#F59E0B]",
      accentGlow: "rgba(234,179,8,0.35)",
      iconBg: "from-[#fef3c7] via-white to-[#ecfdf9]",
      iconText: "text-[#CA8A04]",
      badgeBg: "bg-[#fef9c3]",
      badgeText: "text-[#854D0E]",
      badgeRing: "ring-[#FDE047]/45",
    };
  }

  if (
    normalized.includes("radiology") ||
    normalized.includes("أشعة") ||
    normalized.includes("تصوير") ||
    normalized.includes("scan")
  ) {
    return {
      kind: "radiology",
      label: t("doctor.orderCard.kind.radiology"),
      icon: ScanLine,
      accent: "from-[#2563EB] via-[#3B82F6] to-[#60A5FA]",
      accentGlow: "rgba(59,130,246,0.35)",
      iconBg: "from-[#DBEAFE] via-white to-[#EFF6FF]",
      iconText: "text-[#2563EB]",
      badgeBg: "bg-[#EFF6FF]",
      badgeText: "text-[#1D4ED8]",
      badgeRing: "ring-[#BFDBFE]/70",
    };
  }

  if (
    normalized.includes("procedure") ||
    normalized.includes("إجراء") ||
    normalized.includes("عملية")
  ) {
    return {
      kind: "procedure",
      label: t("doctor.orderCard.kind.procedure"),
      icon: Syringe,
      accent: "from-[#E11D48] via-[#F43F5E] to-[#FB7185]",
      accentGlow: "rgba(244,63,94,0.32)",
      iconBg: "from-[#FFE4E6] via-white to-[#FFF1F2]",
      iconText: "text-[#E11D48]",
      badgeBg: "bg-[#FFF1F2]",
      badgeText: "text-[#BE123C]",
      badgeRing: "ring-[#FECDD3]/70",
    };
  }

  if (
    normalized.includes("referral") ||
    normalized.includes("تحويل") ||
    normalized.includes("إحالة")
  ) {
    return {
      kind: "referral",
      label: t("doctor.orderCard.kind.referral"),
      icon: ArrowRightLeft,
      accent: "from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]",
      accentGlow: "rgba(139,92,246,0.32)",
      iconBg: "from-[#F3E8FF] via-white to-[#FAF5FF]",
      iconText: "text-[#7C3AED]",
      badgeBg: "bg-[#F5F3FF]",
      badgeText: "text-[#6D28D9]",
      badgeRing: "ring-[#DDD6FE]/70",
    };
  }

  return {
    kind: "general",
    label: t("doctor.orderCard.kind.general"),
    icon: Activity,
    accent: "from-primary via-[#14b8a6] to-[#0f766e]",
    accentGlow: "rgba(15,143,139,0.35)",
    iconBg: "from-[#ecfdf9] via-white to-[#f0fdfa]",
    iconText: "text-primary",
    badgeBg: "bg-[#ecfdf9]",
    badgeText: "text-primary",
    badgeRing: "ring-primary/18",
  };
}

export function MedicalOrderCard({ order, index }: MedicalOrderCardProps) {
  const { t } = useI18n();
  const kindMeta =
    order.category !== "other"
      ? detectOrderKind(
          order.category === "lab"
            ? "lab_order"
            : order.category === "radiology"
              ? "imaging_order"
              : order.category === "procedure"
                ? "procedure_order"
                : "referral_order",
          t,
        )
      : detectOrderKind(order.title, t);
  const Icon = kindMeta.icon;
  const normalizedStatus = order.status?.toLowerCase().replace(/[\s-]+/g, "_");
  const statusStyles = buildStatusStyles(t);
  const currentStatus =
    statusStyles[normalizedStatus] ??
    ({
      bg: "bg-[#F3F4F6]/90",
      text: "text-[#374151]",
      ring: "ring-[#D1D5DB]/70",
      label: order.status || t("doctor.orderCard.status.unspecified"),
    } as const);

  return (
    <motion.article
      variants={TAB_STAGGER_ITEM}
      className="group relative overflow-hidden rounded-[22px] border border-[#E2E8F0]/95 bg-white shadow-[0_16px_42px_-14px_rgba(15,143,139,0.1),0_6px_18px_rgba(15,23,42,0.05)] ring-1 ring-black/[0.017] transition-shadow duration-300 hover:shadow-[0_20px_48px_-12px_rgba(15,143,139,0.14),0_8px_22px_rgba(15,23,42,0.06)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 120% 80% at 100% 0%, rgba(15,143,139,0.05), transparent 50%), radial-gradient(circle at 0% 100%, rgba(20,184,166,0.04), transparent 42%)",
        }}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-5 end-0 w-[3px] rounded-full bg-gradient-to-b opacity-95 shadow-[0_0_12px_var(--order-accent-glow)]",
          kindMeta.accent,
        )}
        style={{ ["--order-accent-glow" as string]: kindMeta.accentGlow }}
        aria-hidden
      />

      <div className="relative px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div className="flex shrink-0 gap-3 sm:flex-col sm:items-center">
            <div
              className={cn(
                "flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_26px_rgba(15,143,139,0.1)] ring-1 ring-black/[0.04]",
                kindMeta.iconBg,
                kindMeta.iconText,
              )}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={2.25} aria-hidden />
            </div>
            <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 font-cairo text-[11px] font-black tabular-nums text-[#64748b] ring-1 ring-[#E2E8F0] sm:hidden">
              #{index}
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-3 text-start">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-start gap-2">
                  <span className="hidden font-cairo text-[11px] font-black tabular-nums text-[#94a3b8] sm:inline">
                    #{index}
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-extrabold uppercase tracking-wider ring-1",
                      kindMeta.badgeBg,
                      kindMeta.badgeText,
                      kindMeta.badgeRing,
                    )}
                  >
                    {kindMeta.label}
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-bold ring-1 ring-inset",
                      currentStatus.bg,
                      currentStatus.text,
                      currentStatus.ring,
                    )}
                  >
                    {currentStatus.label}
                  </span>
                </div>
                <h3 className="font-cairo text-[16px] font-black leading-snug text-[#0f172a] sm:text-[17px]">
                  {order.title}
                </h3>
              </div>

              <div className="shrink-0 rounded-xl border border-[#E2E8F0] bg-white/85 px-3 py-2 text-start shadow-sm backdrop-blur-sm">
                <div className="font-cairo text-[10px] font-bold text-[#667085]">
                  {t("doctor.orderCard.orderNumber")}
                </div>
                <div className="mt-1 font-cairo text-[12px] font-extrabold tabular-nums text-[#101828]">
                  #{index}
                </div>
              </div>
            </div>

            <div className="rounded-[14px] border border-[#E8EDF3]/95 bg-[linear-gradient(145deg,#fafefd_0%,#ffffff_55%,#f8fafc_100%)] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <div className="mb-1.5 font-cairo text-[11px] font-extrabold uppercase tracking-wide text-[#64748b]">
                {t("doctor.orderCard.orderDetails")}
              </div>
              <p className="font-cairo text-[13px] font-semibold leading-[1.65] text-[#334155]">
                {kindMeta.kind === "general"
                  ? t("doctor.orderCard.generalDescription")
                  : t("doctor.orderCard.typedDescription")
                      .replace("{kind}", kindMeta.label)
                      .replace("{status}", currentStatus.label)}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-2 pt-0.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0]/90 bg-[#F8FAFC]/95 px-3.5 py-2 font-cairo text-[12px] font-bold text-[#475569] shadow-[0_4px_12px_rgba(15,23,42,0.04)] backdrop-blur-[2px]">
                <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{kindMeta.label}</span>
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-2 font-cairo text-[12px] font-bold ring-1 ring-inset",
                  currentStatus.bg,
                  currentStatus.text,
                  currentStatus.ring,
                )}
              >
                {currentStatus.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
