import {
  Bell,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Shield,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CATEGORY_LABELS } from '@/components/admin/system-logs/auditLogConstants';
import type {
  AdminContentItem,
  AdminContentListResponse,
  AdminContentStatus,
  AdminContentType,
  AuditLogCategory,
  AuditLogItem,
  ComplaintLifecycleStatus,
  ComplaintType,
} from '@/lib/admin/types';

export function contentItemsFromList(
  data: AdminContentListResponse | undefined,
): AdminContentItem[] {
  if (!data) return [];
  return data.items ?? data.content ?? data.contentItems ?? [];
}

export function complaintTypeLabel(
  type: ComplaintType | string | undefined,
): string {
  const map: Record<ComplaintType, string> = {
    appointment: 'موعد',
    consultation: 'استشارة',
    access_request: 'طلب وصول',
    technical: 'تقني',
    other: 'أخرى',
  };
  if (type && type in map) return map[type as ComplaintType];
  return type ? String(type) : '—';
}

export function complaintStatusLabel(
  status: ComplaintLifecycleStatus | string | undefined,
): {
  label: string;
  className: string;
} {
  const map: Record<
    ComplaintLifecycleStatus,
    { label: string; className: string }
  > = {
    submitted: {
      label: 'معلقة',
      className: 'bg-[#16A34A] text-white',
    },
    under_review: {
      label: 'قيد المراجعة',
      className: 'bg-[#CA8A04] text-white',
    },
    in_progress: {
      label: 'قيد المعالجة',
      className: 'bg-[#2563EB] text-white',
    },
    resolved: {
      label: 'تم الحل',
      className: 'bg-[#6B7280] text-white',
    },
    closed: {
      label: 'مغلقة',
      className: 'bg-[#9CA3AF] text-white',
    },
  };
  if (status && status in map) {
    return map[status as ComplaintLifecycleStatus];
  }
  return {
    label: status ? String(status) : 'غير محدد',
    className: 'bg-[#6B7280] text-white',
  };
}

export function contentStatusLabel(
  status: AdminContentStatus | string | undefined,
): {
  label: string;
  className: string;
} {
  const map: Record<AdminContentStatus, { label: string; className: string }> =
    {
      DRAFT: {
        label: 'مسودة',
        className: 'bg-[#E5E7EB] text-[#374151]',
      },
      IN_REVIEW: {
        label: 'قيد المراجعة',
        className: 'bg-[#FEF3C7] text-[#92400E]',
      },
      PUBLISHED: {
        label: 'منشور',
        className: 'bg-[#D1FAE5] text-[#065F46]',
      },
      ARCHIVED: {
        label: 'مؤرشف',
        className: 'bg-[#F3F4F6] text-[#4B5563]',
      },
    };
  if (status && status in map) {
    return map[status as AdminContentStatus];
  }
  return {
    label: status ? String(status) : '—',
    className: 'bg-[#E5E7EB] text-[#374151]',
  };
}

export function contentTypeCategoryLabel(
  type: AdminContentType | string | undefined,
): string {
  const map: Record<AdminContentType, string> = {
    CONDITION: 'الحالات',
    SYMPTOM: 'الأعراض',
    GENERAL_ADVICE: 'نصائح عامة',
    NEWS: 'الأخبار',
  };
  if (type && type in map) return map[type as AdminContentType];
  return type ? String(type) : '—';
}

export function formatRelativeTimeAr(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  if (diff < 0) return 'الآن';
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return 'الآن';
  const min = Math.floor(sec / 60);
  if (min < 60) return min <= 1 ? 'منذ دقيقة' : `منذ ${min} دقائق`;
  const h = Math.floor(min / 60);
  if (h < 24) return h === 1 ? 'منذ ساعة' : `منذ ${h} ساعات`;
  const days = Math.floor(h / 24);
  if (days < 7) return days === 1 ? 'منذ يوم' : `منذ ${days} أيام`;
  return d.toLocaleDateString('ar-SY', { dateStyle: 'medium' });
}

export function activityHeadline(log: AuditLogItem): string {
  return (
    log.actorUserName?.trim() ||
    log.targetUserName?.trim() ||
    log.patientName?.trim() ||
    '—'
  );
}

export function activityDescription(log: AuditLogItem): string {
  const cat =
    CATEGORY_LABELS[log.category] ??
    (log.category ? String(log.category) : 'نشاط');
  const action = (log.action || '').trim() || 'حدث';
  return `${cat} · ${action}`;
}

export function activityRowVisual(log: AuditLogItem): {
  Icon: LucideIcon;
  box: string;
  iconColor: string;
} {
  if (log.outcome === 'FAIL' || log.outcome === 'DENY') {
    return {
      Icon: X,
      box: 'bg-[#FEF2F2]',
      iconColor: 'text-[#EF4444]',
    };
  }
  const c = log.category as AuditLogCategory;
  switch (c) {
    case 'DATA':
      return {
        Icon: CalendarDays,
        box: 'bg-[#ECFDF3]',
        iconColor: 'text-[#16A34A]',
      };
    case 'AUTH':
      return {
        Icon: Users,
        box: 'bg-[#EFF6FF]',
        iconColor: 'text-[#2563EB]',
      };
    case 'PHI':
      return {
        Icon: FileText,
        box: 'bg-[#FFF7ED]',
        iconColor: 'text-[#F97316]',
      };
    case 'ADMIN':
      return {
        Icon: LayoutDashboard,
        box: 'bg-[#F5F3FF]',
        iconColor: 'text-[#7C3AED]',
      };
    case 'AUTHZ':
      return {
        Icon: Shield,
        box: 'bg-[#FEF3C7]',
        iconColor: 'text-[#D97706]',
      };
    default:
      return {
        Icon: Bell,
        box: 'bg-[#F0F9FF]',
        iconColor: 'text-[#0369A1]',
      };
  }
}

export function asPlainText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    for (const key of ['ar', 'en', 'title', 'name', 'text', 'label'] as const) {
      const v = o[key];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    for (const v of Object.values(o)) {
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
  }
  return '';
}

export function formatShortDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatTimeTodayOrDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return `اليوم ${d.toLocaleTimeString('ar-SY', { hour: 'numeric', minute: '2-digit' })}`;
  }
  return formatShortDate(iso);
}

export function authorName(createdBy: AdminContentItem['createdBy']): string {
  if (!createdBy) return '—';
  if (typeof createdBy === 'string') return asPlainText(createdBy) || '—';
  return asPlainText(createdBy.fullName) || '—';
}
