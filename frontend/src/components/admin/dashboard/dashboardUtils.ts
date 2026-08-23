import {
  Bell,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Shield,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { categoryLabel } from "@/components/admin/system-logs/auditLogConstants";
import {
  complaintTypeAr,
  statusLabelAr,
} from "@/components/admin/complaints/complaintDetailsUtils";
import type {
  AdminContentItem,
  AdminContentListResponse,
  AdminContentStatus,
  AdminContentType,
  AuditLogCategory,
  AuditLogItem,
  ComplaintLifecycleStatus,
  ComplaintType,
} from "@/lib/admin/types";
import type { AppLocale } from "@/i18n/runtime";
import { getTranslationValue } from "@/i18n/translations";

function tt(locale: AppLocale, key: string): string {
  return getTranslationValue(locale, key) ?? key;
}

const COMPLAINT_STATUS_CLASSNAME: Record<ComplaintLifecycleStatus, string> = {
  submitted: "bg-[#16A34A] text-white",
  under_review: "bg-[#CA8A04] text-white",
  in_progress: "bg-[#2563EB] text-white",
  resolved: "bg-[#6B7280] text-white",
  closed: "bg-[#9CA3AF] text-white",
};

const CONTENT_STATUS_CLASSNAME: Record<AdminContentStatus, string> = {
  DRAFT: "bg-[#E5E7EB] text-[#374151]",
  IN_REVIEW: "bg-[#FEF3C7] text-[#92400E]",
  PUBLISHED: "bg-[#D1FAE5] text-[#065F46]",
  ARCHIVED: "bg-[#F3F4F6] text-[#4B5563]",
};

export function contentItemsFromList(
  data: AdminContentListResponse | undefined,
): AdminContentItem[] {
  if (!data) return [];
  return data.items ?? data.content ?? data.contentItems ?? [];
}

export function complaintTypeLabel(
  type: ComplaintType | string | undefined,
  locale: AppLocale = "ar",
): string {
  if (!type) return "—";
  return complaintTypeAr(type as ComplaintType, locale);
}

export function complaintStatusLabel(
  status: ComplaintLifecycleStatus | string | undefined,
  locale: AppLocale = "ar",
): {
  label: string;
  className: string;
} {
  if (status && status in COMPLAINT_STATUS_CLASSNAME) {
    return {
      label: statusLabelAr(status as ComplaintLifecycleStatus, locale),
      className: COMPLAINT_STATUS_CLASSNAME[status as ComplaintLifecycleStatus],
    };
  }
  return {
    label: status ? String(status) : tt(locale, "common.undetermined"),
    className: "bg-[#6B7280] text-white",
  };
}

export function contentStatusLabel(
  status: AdminContentStatus | string | undefined,
  locale: AppLocale = "ar",
): {
  label: string;
  className: string;
} {
  if (status && status in CONTENT_STATUS_CLASSNAME) {
    return {
      label: tt(locale, `adminDashboard.contentStatus.${status}`),
      className: CONTENT_STATUS_CLASSNAME[status as AdminContentStatus],
    };
  }
  return {
    label: "—",
    className: "bg-[#E5E7EB] text-[#374151]",
  };
}

export function contentTypeCategoryLabel(
  type: AdminContentType | string | undefined,
  locale: AppLocale = "ar",
): string {
  if (!type) return "—";
  const key = `adminDashboard.contentType.${type}`;
  return getTranslationValue(locale, key) ?? String(type);
}

export function formatRelativeTimeAr(iso: string, locale: AppLocale = "ar"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  if (diff < 0) return tt(locale, "common.justNow");
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return tt(locale, "common.justNow");
  const min = Math.floor(sec / 60);
  if (min < 60)
    return min <= 1
      ? tt(locale, "common.minuteAgo")
      : tt(locale, "common.minutesAgo").replace("{n}", String(min));
  const h = Math.floor(min / 60);
  if (h < 24)
    return h === 1
      ? tt(locale, "common.hourAgo")
      : tt(locale, "common.hoursAgo").replace("{n}", String(h));
  const days = Math.floor(h / 24);
  if (days < 7)
    return days === 1
      ? tt(locale, "common.dayAgo")
      : tt(locale, "common.daysAgo").replace("{n}", String(days));
  return d.toLocaleDateString(locale === "ar" ? "ar-SY" : "en-US", { dateStyle: "medium" });
}

export function activityHeadline(log: AuditLogItem): string {
  return (
    log.actorUserName?.trim() ||
    log.targetUserName?.trim() ||
    log.patientName?.trim() ||
    "—"
  );
}

export function activityDescription(log: AuditLogItem, locale: AppLocale = "ar"): string {
  const cat = log.category
    ? categoryLabel(log.category as AuditLogCategory, locale)
    : tt(locale, "adminDashboard.activity.defaultCategory");
  const action = (log.action || "").trim() || tt(locale, "adminDashboard.activity.defaultAction");
  return `${cat} · ${action}`;
}

export function activityRowVisual(log: AuditLogItem): {
  Icon: LucideIcon;
  box: string;
  iconColor: string;
} {
  if (log.outcome === "FAIL" || log.outcome === "DENY") {
    return {
      Icon: X,
      box: "bg-[#FEF2F2]",
      iconColor: "text-[#EF4444]",
    };
  }
  const c = log.category as AuditLogCategory;
  switch (c) {
    case "DATA":
      return {
        Icon: CalendarDays,
        box: "bg-[#ECFDF3]",
        iconColor: "text-[#16A34A]",
      };
    case "AUTH":
      return {
        Icon: Users,
        box: "bg-[#EFF6FF]",
        iconColor: "text-[#2563EB]",
      };
    case "PHI":
      return {
        Icon: FileText,
        box: "bg-[#FFF7ED]",
        iconColor: "text-[#F97316]",
      };
    case "ADMIN":
      return {
        Icon: LayoutDashboard,
        box: "bg-[#F5F3FF]",
        iconColor: "text-[#7C3AED]",
      };
    case "AUTHZ":
      return {
        Icon: Shield,
        box: "bg-[#FEF3C7]",
        iconColor: "text-[#D97706]",
      };
    default:
      return {
        Icon: Bell,
        box: "bg-[#F0F9FF]",
        iconColor: "text-[#0369A1]",
      };
  }
}

export function asPlainText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    for (const key of ["ar", "en", "title", "name", "text", "label"] as const) {
      const v = o[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    for (const v of Object.values(o)) {
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return "";
}

export function formatShortDate(iso: string | undefined, locale: AppLocale = "ar"): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale === "ar" ? "ar-SY" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTimeTodayOrDate(iso: string | undefined, locale: AppLocale = "ar"): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    const dateLocale = locale === "ar" ? "ar-SY" : "en-US";
    return `${tt(locale, "common.today")} ${d.toLocaleTimeString(dateLocale, { hour: "numeric", minute: "2-digit" })}`;
  }
  return formatShortDate(iso, locale);
}

export function authorName(createdBy: AdminContentItem["createdBy"]): string {
  if (!createdBy) return "—";
  if (typeof createdBy === "string") return asPlainText(createdBy) || "—";
  return asPlainText(createdBy.fullName) || "—";
}
