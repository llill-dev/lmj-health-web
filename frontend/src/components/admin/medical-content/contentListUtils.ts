import type {
  AdminContentItem,
  AdminContentStatus,
  AdminContentType,
} from '@/lib/admin/types';
import {
  getAcceptanceScenarioKey,
  getListAcceptanceScenarioChip,
  getNextWorkflowActions,
  localizeAcceptanceCopy,
  type WorkflowActorRole,
} from './releaseAcceptanceMatrix';
import type { AppLocale } from '@/i18n/runtime';
import { getTranslationValue } from '@/i18n/translations';

function tt(locale: AppLocale, key: string): string {
  return getTranslationValue(locale, key) ?? key;
}

export const PAGE_SIZE = 20;

export type UiContentStatus =
  | 'الكل'
  | 'منشور'
  | 'قيد المراجعة'
  | 'مسودة'
  | 'مؤرشف';

export type LangFilter = 'الكل' | 'ar' | 'en';

export const MINE_STATUS_FILTERS: readonly UiContentStatus[] = [
  'الكل',
  'مسودة',
  'قيد المراجعة',
];

export function isMineStatusFilter(status: UiContentStatus): boolean {
  return MINE_STATUS_FILTERS.includes(status);
}

export function resolvePagedTotal(
  payload: { total?: unknown; results?: unknown } | null | undefined,
  fallbackCount = 0,
): number {
  const total =
    typeof payload?.total === 'number'
      ? payload.total
      : Number(payload?.total ?? NaN);
  if (Number.isFinite(total) && total >= 0) {
    return total;
  }
  const results =
    typeof payload?.results === 'number'
      ? payload.results
      : Number(payload?.results ?? NaN);
  if (Number.isFinite(results) && results >= 0) {
    return Math.max(results, fallbackCount);
  }
  return fallbackCount;
}

function toPositiveInt(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value ?? NaN);
  if (!Number.isFinite(parsed)) return null;
  const rounded = Math.floor(parsed);
  return rounded > 0 ? rounded : null;
}

export function resolvePagedPage(
  payload: { page?: unknown } | null | undefined,
  fallbackPage = 1,
): number {
  return toPositiveInt(payload?.page) ?? Math.max(1, Math.floor(fallbackPage));
}

export function resolvePagedLimit(
  payload: { limit?: unknown } | null | undefined,
  fallbackLimit = PAGE_SIZE,
): number {
  return toPositiveInt(payload?.limit) ?? Math.max(1, Math.floor(fallbackLimit));
}

export function clampPage(page: number, totalPages: number): number {
  if (totalPages <= 0) return 1;
  return Math.min(Math.max(1, Math.floor(page)), Math.floor(totalPages));
}

const ADMIN_CONTENT_TYPE_VALUES: AdminContentType[] = [
  'CONDITION',
  'SYMPTOM',
  'GENERAL_ADVICE',
  'NEWS',
  'MEDICATION',
  'SETTINGS_PAGE',
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

export function toDisplayText(value: unknown): string {
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
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (
    normalized === 'PUBLISHED' ||
    normalized === 'PUBLISH' ||
    normalized === 'LIVE'
  ) {
    return 'PUBLISHED';
  }
  if (
    normalized === 'IN_REVIEW' ||
    normalized === 'UNDER_REVIEW' ||
    normalized === 'PENDING_REVIEW' ||
    normalized === 'SUBMITTED_FOR_REVIEW' ||
    normalized === 'REVIEW'
  ) {
    return 'IN_REVIEW';
  }
  if (
    normalized === 'ARCHIVED' ||
    normalized === 'ARCHIVE'
  ) {
    return 'ARCHIVED';
  }
  return 'DRAFT';
}

function toContentType(value: unknown): AdminContentType {
  if (value === 'CONDITION') return 'CONDITION';
  if (value === 'SYMPTOM') return 'SYMPTOM';
  if (value === 'GENERAL_ADVICE') return 'GENERAL_ADVICE';
  if (value === 'NEWS') return 'NEWS';
  if (value === 'MEDICATION') return 'MEDICATION';
  if (value === 'SETTINGS_PAGE') return 'SETTINGS_PAGE';
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
          const normalizeActor = (
            raw: unknown,
          ): AdminContentItem['createdBy'] =>
            raw && typeof raw === 'object'
              ? {
                  _id: toDisplayText((raw as Record<string, unknown>)._id),
                  fullName: toDisplayText(
                    (raw as Record<string, unknown>).fullName,
                  ),
                  email: toDisplayText(
                    (raw as Record<string, unknown>).email,
                  ),
                }
              : toDisplayText(raw);
          const createdBy = normalizeActor(item.createdBy);
          const reviewedBy = normalizeActor(item.reviewedBy);

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
            reviewedBy,
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
  locale: AppLocale = 'ar',
): { code: 'ar' | 'en' | 'other'; label: string } {
  const n = normalizeItemLanguage(languageField);
  if (n === 'ar') return { code: 'ar', label: tt(locale, 'adminContent.language.arabic') };
  if (n === 'en') return { code: 'en', label: 'English' };
  return {
    code: 'other',
    label: languageField && languageField !== '—' ? languageField : '—',
  };
}

export function contentStatusLabel(s: AdminContentStatus, locale: AppLocale = 'ar') {
  return tt(locale, `adminContent.status.${s}`);
}

export type ReadinessSignalTone = 'info' | 'success' | 'warning';

export function getListReadinessSignal(
  item: AdminContentItem,
  sourceCount: number | null,
): {
  tone: ReadinessSignalTone;
  ar: string;
  en: string;
  scenarioKey: ReturnType<typeof getAcceptanceScenarioKey>;
} {
  const scenarioKey = getAcceptanceScenarioKey(item.status);

  if (item.status === 'DRAFT') {
    if (sourceCount === 0) {
      return {
        tone: 'warning',
        scenarioKey,
        ar: 'مسودة (draft_prep): جاهزية المراجعة منخفضة — لا توجد مصادر مرتبطة بعد.',
        en: 'Draft (draft_prep): low review readiness — no sources attached yet.',
      };
    }
    if (sourceCount && sourceCount > 0) {
      return {
        tone: 'info',
        scenarioKey,
        ar: 'مسودة (draft_prep): المصادر موجودة. راجع مصفوفة الإطلاق قبل إرسال المراجعة.',
        en: 'Draft (draft_prep): sources present. Check the release matrix before submit-review.',
      };
    }
    return {
      tone: 'info',
      scenarioKey,
      ar: 'مسودة (draft_prep): جاهزية المراجعة تحتاج تحققًا من التفاصيل.',
      en: 'Draft (draft_prep): review readiness needs verification from details.',
    };
  }

  if (item.status === 'IN_REVIEW') {
    return {
      tone: 'info',
      scenarioKey,
      ar: 'قيد المراجعة (in_review_gate): الموافقة/الرفض/النشر للإدارة فقط.',
      en: 'In review (in_review_gate): approve/reject/publish are admin-only.',
    };
  }

  if (item.status === 'PUBLISHED') {
    return {
      tone: 'success',
      scenarioKey,
      ar: 'منشور (published_info): معلومات فقط — الأرشفة اختيارية دون تعطيل الاستعراض.',
      en: 'Published (published_info): informational — archive is optional without blocking browse.',
    };
  }

  return {
    tone: 'info',
    scenarioKey,
    ar: 'مؤرشف (archived_info): للرجوع فقط دون إجراءات workflow نشطة.',
    en: 'Archived (archived_info): reference only with no active workflow actions.',
  };
}

/** Next workflow action labels for a list row (role × status from OpenAPI). */
export function getListWorkflowActionLabels(
  status: AdminContentStatus,
  role: WorkflowActorRole = 'admin',
  language: 'ar' | 'en' = 'ar',
): string[] {
  return getNextWorkflowActions(status, role).map((cue) =>
    localizeAcceptanceCopy(cue.label, language),
  );
}

export function getListScenarioChip(
  status: AdminContentStatus,
  language: 'ar' | 'en' = 'ar',
): string {
  return getListAcceptanceScenarioChip(status, language);
}

export function isDataEntryWorkflowStatus(status: AdminContentStatus): boolean {
  return status === 'DRAFT' || status === 'IN_REVIEW';
}

export function contentTypeLabel(t?: AdminContentType, locale: AppLocale = 'ar') {
  if (!t) return tt(locale, 'adminContent.type.general');
  return getTranslationValue(locale, `adminContent.type.${t}`) ?? tt(locale, 'adminContent.type.general');
}

export function formatContentDate(value?: string, locale: AppLocale = 'ar') {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SY' : 'en-US');
}

/**
 * Safe display name for `createdBy`/`reviewedBy`. Returns `null` (render
 * nothing) unless the backend populated the actor with a real `fullName` —
 * never surfaces a bare ObjectId to the admin UI.
 */
export function resolveContentActorName(
  actor: AdminContentItem['createdBy'],
): string | null {
  if (!actor || typeof actor === 'string') return null;
  const name = actor.fullName?.trim();
  return name ? name : null;
}
