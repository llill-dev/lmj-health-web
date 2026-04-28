import type {
  AdminContentItem,
  AdminContentStatus,
  AdminContentType,
} from '@/lib/admin/types';

export const PAGE_SIZE = 20;

export type UiContentStatus =
  | 'الكل'
  | 'منشور'
  | 'قيد المراجعة'
  | 'مسودة'
  | 'مؤرشف';

export type LangFilter = 'الكل' | 'ar' | 'en';

const ADMIN_CONTENT_TYPE_VALUES: AdminContentType[] = [
  'CONDITION',
  'SYMPTOM',
  'GENERAL_ADVICE',
  'NEWS',
];

export function parseTypeQueryParam(
  value: string | null,
): 'الكل' | AdminContentType {
  if (!value) return 'الكل';
  return ADMIN_CONTENT_TYPE_VALUES.includes(value as AdminContentType)
    ? (value as AdminContentType)
    : 'الكل';
}

export function normalizeItemLanguage(raw: unknown): 'ar' | 'en' | 'unknown' {
  if (raw == null) return 'unknown';
  const s = String(raw)
    .trim()
    .toLowerCase()
    .normalize('NFKC');
  if (s.length === 0) return 'unknown';
  if (
    s === 'ar' ||
    s === 'arabic' ||
    s.startsWith('ar-') ||
    s.startsWith('ar_') ||
    s === 'عربي' ||
    s === 'العربية'
  ) {
    return 'ar';
  }
  if (
    s === 'en' ||
    s === 'english' ||
    s.startsWith('en-') ||
    s.startsWith('en_')
  ) {
    return 'en';
  }
  return 'unknown';
}

function resolveItemLanguageString(raw: unknown): string {
  const n = normalizeItemLanguage(raw);
  if (n === 'ar') return 'ar';
  if (n === 'en') return 'en';
  const t = toDisplayText(raw);
  return t || '—';
}

export function textSearchMatch(hay: string, needle: string) {
  const n = needle.trim();
  if (!n) return true;
  const a = hay.normalize('NFC');
  const b = n.normalize('NFC');
  return a.toLowerCase().includes(b.toLowerCase());
}

function toDisplayText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const localized = obj.ar ?? obj.en ?? obj.title ?? obj.name ?? obj.value;
    if (typeof localized === 'string') return localized;
  }
  return '';
}

function toContentStatus(value: unknown): AdminContentStatus {
  if (value === 'PUBLISHED') return 'PUBLISHED';
  if (value === 'IN_REVIEW') return 'IN_REVIEW';
  if (value === 'ARCHIVED') return 'ARCHIVED';
  return 'DRAFT';
}

function toContentType(value: unknown): AdminContentType {
  if (value === 'CONDITION') return 'CONDITION';
  if (value === 'SYMPTOM') return 'SYMPTOM';
  if (value === 'GENERAL_ADVICE') return 'GENERAL_ADVICE';
  if (value === 'NEWS') return 'NEWS';
  return 'GENERAL_ADVICE';
}

export function normalizeContentItems(payload: unknown): AdminContentItem[] {
  if (!payload || typeof payload !== 'object') return [];
  const data = payload as Record<string, unknown>;
  const candidates = [
    data.items,
    data.content,
    data.contentItems,
    data.results,
    data.data,
  ];
  for (const entry of candidates) {
    if (Array.isArray(entry)) {
      return entry
        .filter((raw) => raw && typeof raw === 'object')
        .map((raw) => {
          const item = raw as Record<string, unknown>;
          const createdByRaw = item.createdBy;
          const createdBy =
            createdByRaw && typeof createdByRaw === 'object'
              ? {
                  _id: toDisplayText(
                    (createdByRaw as Record<string, unknown>)._id,
                  ),
                  fullName: toDisplayText(
                    (createdByRaw as Record<string, unknown>).fullName,
                  ),
                  email: toDisplayText(
                    (createdByRaw as Record<string, unknown>).email,
                  ),
                }
              : toDisplayText(createdByRaw);

          return {
            _id: toDisplayText(item._id || item.id || item.slug),
            type: toContentType(item.type),
            status: toContentStatus(item.status),
            title: toDisplayText(item.title),
            summary: toDisplayText(item.summary),
            language: resolveItemLanguageString(item.language),
            slug: toDisplayText(item.slug),
            createdAt: toDisplayText(item.createdAt),
            updatedAt: toDisplayText(item.updatedAt),
            viewCount:
              typeof item.viewCount === 'number'
                ? item.viewCount
                : Number(item.viewCount ?? item.views ?? 0),
            views:
              typeof item.views === 'number'
                ? item.views
                : Number(item.views ?? 0),
            createdBy,
            reviewedBy: toDisplayText(item.reviewedBy),
            publishedAt: toDisplayText(item.publishedAt),
          } satisfies AdminContentItem;
        });
    }
  }
  return [];
}

export function buildVisiblePageNumbers(
  current: number,
  total: number,
  max = 7,
): number[] {
  if (total <= 0) return [];
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + max - 1);
  if (end - start < max - 1) start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function languageKindLabel(
  languageField: string | undefined,
): { code: 'ar' | 'en' | 'other'; label: string } {
  const n = normalizeItemLanguage(languageField);
  if (n === 'ar') return { code: 'ar', label: 'العربية' };
  if (n === 'en') return { code: 'en', label: 'English' };
  return {
    code: 'other',
    label: languageField && languageField !== '—' ? languageField : '—',
  };
}

export function contentStatusLabel(s: AdminContentStatus) {
  if (s === 'PUBLISHED') return 'منشور';
  if (s === 'IN_REVIEW') return 'قيد المراجعة';
  if (s === 'ARCHIVED') return 'مؤرشف';
  return 'مسودة';
}

export function contentTypeLabel(t?: AdminContentType) {
  if (t === 'CONDITION') return 'الحالات الطبية';
  if (t === 'SYMPTOM') return 'الأعراض';
  if (t === 'GENERAL_ADVICE') return 'نصائح عامة';
  if (t === 'NEWS') return 'الأخبار';
  return 'عام';
}

export function formatContentDate(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ar-SY');
}
