import { Helmet } from 'react-helmet-async';
import {
  Plus,
  Eye,
  Archive,
  Check,
  X,
  Search,
  BookOpen,
  FileText,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  LayoutGrid,
  HeartPulse,
  Stethoscope,
  Newspaper,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import MedicalContentViewDialog from '@/components/admin/dialogs/MedicalContentViewDialog';
import {
  CreateAdminContentDialog,
  ContentRejectDialog,
} from '@/components/admin/medical-content';
import {
  ConfirmActionDialog,
  type ConfirmSuccessToast,
} from '@/components/admin/dialogs';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useAdminContentList,
  useApproveContent,
  useArchiveContent,
  usePublishContent,
  useRejectContent,
  useSubmitContentReview,
} from '@/hooks/useAdminContent';
import { useAdminContentStatusCounts } from '@/hooks/useAdminContentStatusCounts';
import type {
  AdminContentItem,
  AdminContentStatus,
  AdminContentType,
} from '@/lib/admin/types';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

type UiContentStatus = 'الكل' | 'منشور' | 'قيد المراجعة' | 'مسودة' | 'مؤرشف';
type LangFilter = 'الكل' | 'ar' | 'en';

const ADMIN_CONTENT_TYPE_VALUES: AdminContentType[] = [
  'CONDITION',
  'SYMPTOM',
  'GENERAL_ADVICE',
  'NEWS',
];

function parseTypeQueryParam(
  value: string | null,
): 'الكل' | AdminContentType {
  if (!value) return 'الكل';
  return ADMIN_CONTENT_TYPE_VALUES.includes(value as AdminContentType)
    ? (value as AdminContentType)
    : 'الكل';
}

/** تطبيع قيمة اللغة من الـ API (لأحرف متعددة/صيغ مختلقة) */
function normalizeItemLanguage(raw: unknown): 'ar' | 'en' | 'unknown' {
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

function textSearchMatch(hay: string, needle: string) {
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

function normalizeContentItems(payload: unknown): AdminContentItem[] {
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

/** نافذة أرقام صفحات للعرض (مثلاً 1 … 5 … 12) */
function buildVisiblePageNumbers(
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

function languageKindLabel(
  languageField: string | undefined,
): { code: 'ar' | 'en' | 'other'; label: string } {
  const n = normalizeItemLanguage(languageField);
  if (n === 'ar') return { code: 'ar', label: 'العربية' };
  if (n === 'en') return { code: 'en', label: 'English' };
  return { code: 'other', label: languageField && languageField !== '—' ? languageField : '—' };
}

/**
 * مفتاح فلتر اللغة: شريط primary، نص أبيض، مزلق يبرز الخيار النشط.
 * «الكل» منفصلة لتصفية دون اختلاط مع ar/en.
 */
function LanguageModeToggle({
  value,
  onChange,
}: {
  value: LangFilter;
  onChange: (v: LangFilter) => void;
}) {
  const inBinary = value === 'ar' || value === 'en';
  return (
    <div className='flex flex-wrap gap-2 justify-end items-center w-full min-w-0 sm:ms-auto sm:w-auto'>
      <span className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
        لغة المحتوى
      </span>
      <div className='flex min-w-0 items-center justify-end gap-1.5'>
        <button
          type='button'
          onClick={() => onChange('الكل')}
          className={cn(
            'h-9 shrink-0 rounded-full px-3 font-cairo text-[12px] font-extrabold transition',
            value === 'الكل'
              ? 'bg-primary text-white shadow-[0_6px_16px_rgba(15,143,139,0.3)]'
              : 'border border-[#E5E7EB] bg-white text-[#344054] shadow-sm hover:bg-[#F9FAFB]',
          )}
        >
          الكل
        </button>
        <div
          className='relative h-9 w-[11.25rem] max-w-full shrink-0 overflow-hidden rounded-full bg-primary p-0.5 shadow-[0_8px_22px_rgba(15,143,139,0.3)]'
          dir='rtl'
          role='group'
          aria-label='تبديل لغة العرض: العربية أو English'
        >
          <div
            className='pointer-events-none absolute top-0.5 bottom-0.5 w-[calc(50%-0.2rem)] rounded-full bg-white/30 shadow-inner transition-all duration-200 ease-out'
            style={{
              opacity: inBinary ? 1 : 0,
              insetInlineStart:
                value === 'en' ? 'calc(50% + 0.1rem)' : '0.2rem',
            }}
          />
          <div className='flex relative z-10 items-stretch w-full min-w-0 h-8'>
            <button
              type='button'
              onClick={() => onChange('ar')}
              className={cn(
                'flex-1 min-w-0 rounded-full font-cairo text-[12px] font-extrabold transition',
                value === 'ar'
                  ? 'text-white'
                  : 'text-white/75 hover:text-white',
              )}
            >
              العربية
            </button>
            <button
              type='button'
              onClick={() => onChange('en')}
              className={cn(
                'flex-1 min-w-0 rounded-full font-cairo text-[12px] font-extrabold transition',
                value === 'en'
                  ? 'text-white'
                  : 'text-white/75 hover:text-white',
              )}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminMedicalContentPage() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<UiContentStatus>('الكل');
  const [langFilter, setLangFilter] = useState<LangFilter>('الكل');

  const activeType = useMemo(
    () => parseTypeQueryParam(searchParams.get('type')),
    [searchParams],
  );

  const setTypeFilter = useCallback(
    (next: 'الكل' | AdminContentType) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          if (next === 'الكل') p.delete('type');
          else p.set('type', next);
          return p;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );
  const [page, setPage] = useState(1);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<AdminContentItem | null>(
    null,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingContentId, setViewingContentId] = useState<string | null>(null);
  const [actionConfirm, setActionConfirm] = useState<{
    kind: 'submitReview' | 'approve' | 'publish' | 'archive';
    id: string;
    title: string;
  } | null>(null);

  const contentActionSuccessToast = useMemo(():
    | ConfirmSuccessToast
    | undefined => {
    if (!actionConfirm) return undefined;
    const { kind } = actionConfirm;
    if (kind === 'submitReview') {
      return {
        title: 'تم',
        message: 'أُرسل المحتوى للمراجعة.',
        variant: 'success',
      };
    }
    if (kind === 'approve') {
      return {
        title: 'تمت الموافقة',
        message: 'يمكنك نشر المحتوى متى نضج.',
        variant: 'success',
      };
    }
    if (kind === 'publish') {
      return {
        title: 'تم النشر',
        message: 'صار المحتوى متاحاً للمستفيدين حسب قواعد العرض.',
        variant: 'success',
      };
    }
    return {
      title: 'تمت الأرشفة',
      message: 'أُرشف العنصر ويُنقل لأرشيف المحتوى.',
      variant: 'success',
    };
  }, [actionConfirm]);

  useEffect(() => {
    if (searchParams.get('queue') === 'review') {
      setActiveStatus('قيد المراجعة');
    }
  }, [searchParams]);

  const statusToApi = useMemo<
    Partial<Record<UiContentStatus, AdminContentStatus>>
  >(
    () => ({
      منشور: 'PUBLISHED',
      'قيد المراجعة': 'IN_REVIEW',
      مسودة: 'DRAFT',
      مؤرشف: 'ARCHIVED',
    }),
    [],
  );

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(activeType !== 'الكل' ? { type: activeType } : {}),
      ...(activeStatus !== 'الكل'
        ? { status: statusToApi[activeStatus] as AdminContentStatus }
        : {}),
      ...(langFilter !== 'الكل' ? { language: langFilter as 'ar' | 'en' } : {}),
    }),
    [page, activeType, activeStatus, langFilter, statusToApi],
  );

  const contentQuery = useAdminContentList(listParams);
  const statusCounts = useAdminContentStatusCounts();

  const submitReviewMutation = useSubmitContentReview();
  const approveMutation = useApproveContent();
  const rejectMutation = useRejectContent();
  const publishMutation = usePublishContent();
  const archiveMutation = useArchiveContent();

  const items = useMemo<AdminContentItem[]>(
    () => normalizeContentItems(contentQuery.data),
    [contentQuery.data],
  );

  /** تصفية لغة داخل الصفحة إذا أعاد السيرفر قيماً غير متوافقة مع ar/en */
  const itemsByLang = useMemo(() => {
    if (langFilter === 'الكل') return items;
    return items.filter(
      (it) => normalizeItemLanguage(it.language) === langFilter,
    );
  }, [items, langFilter]);

  const serverTotal = contentQuery.data?.total ?? 0;
  const totalPages =
    serverTotal > 0 ? Math.max(1, Math.ceil(serverTotal / PAGE_SIZE)) : 0;

  const filteredItems = useMemo(() => {
    const text = query.trim();
    if (!text) return itemsByLang;
    return itemsByLang.filter((it) => {
      const title = String(it.title ?? '');
      const summary = String(it.summary ?? '');
      const slug = String(it.slug ?? '');
      return (
        textSearchMatch(title, text) ||
        textSearchMatch(summary, text) ||
        textSearchMatch(slug, text)
      );
    });
  }, [itemsByLang, query]);

  const pageViews = useMemo(
    () =>
      filteredItems.reduce(
        (acc, it) => acc + Number(it.viewCount ?? it.views ?? 0),
        0,
      ),
    [filteredItems],
  );

  const paginationRange = useMemo(() => {
    if (serverTotal <= 0) return { start: 0, end: 0 };
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, serverTotal);
    return { start, end };
  }, [serverTotal, page]);

  const visiblePageNumbers = useMemo(
    () => buildVisiblePageNumbers(page, totalPages, 7),
    [page, totalPages],
  );

  const showPaginationBar =
    !contentQuery.isLoading && !contentQuery.isError && serverTotal > 0;

  useEffect(() => {
    setPage(1);
  }, [activeType, activeStatus, langFilter]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const statusBadge = (s: AdminContentStatus) => {
    if (s === 'PUBLISHED') {
      return 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]';
    }
    if (s === 'IN_REVIEW') {
      return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
    }
    if (s === 'ARCHIVED') {
      return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
    }
    return 'bg-[#F3F4F6] text-[#344054] border-[#E5E7EB]';
  };

  const statusLabel = (s: AdminContentStatus) => {
    if (s === 'PUBLISHED') return 'منشور';
    if (s === 'IN_REVIEW') return 'قيد المراجعة';
    if (s === 'ARCHIVED') return 'مؤرشف';
    return 'مسودة';
  };

  const typeLabel = (t?: AdminContentType) => {
    if (t === 'CONDITION') return 'الحالات الطبية';
    if (t === 'SYMPTOM') return 'الأعراض';
    if (t === 'GENERAL_ADVICE') return 'نصائح عامة';
    if (t === 'NEWS') return 'الأخبار';
    return 'عام';
  };

  function formatDate(value?: string) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('ar-SY');
  }

  async function confirmReject(reason: string) {
    if (!rejectTarget) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectTarget._id, reason });
      toast('تم رفض المحتوى ويُرسل الملاحظة إلى الفريق عند اكتمال الربط.', {
        title: 'تم',
        variant: 'success',
      });
      setRejectOpen(false);
      setRejectTarget(null);
    } catch {
      /* يبقى الحوار */
    }
  }

  const actionBusy =
    submitReviewMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    publishMutation.isPending ||
    archiveMutation.isPending;

  return (
    <>
      <Helmet>
        <title>
          {activeType === 'NEWS'
            ? 'الأخبار الطبية — إدارة المحتوى • LMJ Health'
            : 'إدارة المحتوى الطبي • LMJ Health'}
        </title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='flex flex-col gap-3 justify-between sm:flex-row sm:items-start'>
          <div>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              إدارة المحتوى الطبي
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              {activeType === 'NEWS'
                ? 'عرض وإدارة أخبار المنصة (نفس باقي الأنواع: مسودة → مراجعة → نشر)'
                : 'قائمة، فلاتر، ومراجعة لدورة حياة المحتوى (مسودة → مراجعة → نشر)'}
            </div>
          </div>

          <button
            type='button'
            onClick={() => setCreateOpen(true)}
            className='inline-flex h-[40px] items-center gap-2 self-start rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.2)] transition hover:brightness-105'
          >
            <Plus className='w-4 h-4' />
            إضافة محتوى جديد
          </button>
        </div>

        <section className='grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 xl:grid-cols-5'>
          {[
            {
              title: 'مشاهدات (هذه الصفحة)',
              value: pageViews.toLocaleString('ar-SA'),
      icon: Eye,
      valueColor: 'text-[#0F8F8B]',
      tone: {
        border: 'border-[#0F8F8B]',
        bg: 'bg-[#16C5C00D]',
        iconBg: 'bg-[#0F8F8B]',
      },
              sub: 'مجموع المشاهدات للعناصر المعروضة في الصفحة الحالية',
            },
            {
              title: 'مسودات (النظام)',
              value: statusCounts.isLoading
                ? '…'
                : String(statusCounts.draft),
      icon: FileText,
      valueColor: 'text-[#00C950]',
      tone: {
        border: 'border-[#B9F8CF]',
        bg: 'bg-gradient-to-br from-[#F0FDF4] to-white',
        iconBg: 'bg-[#00C950]',
      },
    },
    {
      title: 'قيد المراجعة',
              value: statusCounts.isLoading
                ? '…'
                : String(statusCounts.inReview),
      icon: Clock,
      valueColor: 'text-[#F0B100]',
      tone: {
        border: 'border-[#FFF085]',
        bg: 'bg-gradient-to-br from-[#FEFCE8] to-white',
        iconBg: 'bg-[#F0B100]',
      },
    },
    {
      title: 'منشور',
              value: statusCounts.isLoading
                ? '…'
                : String(statusCounts.published),
      icon: CheckCircle2,
      valueColor: 'text-[#4A5565]',
      tone: {
        border: 'border-[#E5E7EB]',
        bg: 'bg-gradient-to-br from-[#F9FAFB] to-white',
        iconBg: 'bg-[#4A5565]',
      },
    },
    {
              title: 'إجمالي في النظام',
              value: statusCounts.isLoading
                ? '…'
                : String(statusCounts.all),
      icon: BookOpen,
      valueColor: 'text-[#8200DB]',
      tone: {
        border: 'border-[#E9D4FF]',
        bg: 'bg-gradient-to-br from-[#FAF5FF] to-white',
        iconBg: 'bg-[#8200DB]',
      },
    },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                title={'sub' in c ? c.sub : undefined}
                className={`h-[92px] rounded-[10px] border-[1.82px] px-[16px] py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${c.tone.border} ${c.tone.bg}`}
              >
                <div className='flex justify-between items-start'>
                  <div>
                    <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                      {c.title}
                    </div>
                    <div
                      className={`mt-2 font-cairo text-[20px] font-black leading-[20px] ${c.valueColor}`}
                    >
                      {c.value}
                    </div>
                  </div>

                  <div
                    className={`flex h-[40px] w-[40px] items-center justify-center rounded-[6px] ${c.tone.iconBg}`}
                  >
                    <Icon className='w-5 h-5 text-white' />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] sm:px-6 sm:py-6'>
          <div className='flex flex-col gap-3 w-full min-w-0 lg:flex-row lg:items-center lg:justify-between'>
            <div className='relative flex-1 min-w-0'>
            <input
                placeholder='بحث في العناوين والملخص (العربية/الإنجليزية)…'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              className='h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-white pe-12 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
            />
            <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                <Search className='w-5 h-5' />
              </div>
            </div>
            <LanguageModeToggle
              value={langFilter}
              onChange={setLangFilter}
            />
          </div>

          <div className='mt-5 font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
            نوع المحتوى
          </div>
          <div className='mt-1.5 flex flex-wrap content-start justify-start gap-2 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFB] p-2'>
            <button
              type='button'
              onClick={() => setTypeFilter('الكل')}
              className={
                activeType === 'الكل'
                  ? 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              <BookOpen className='w-4 h-4' />
              الكل
            </button>
            <button
              type='button'
              onClick={() => setTypeFilter('CONDITION')}
              className={
                activeType === 'CONDITION'
                  ? 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              <HeartPulse className='h-4 w-4 text-[#667085]' />
              الحالات الطبية
            </button>
            <button
              type='button'
              onClick={() => setTypeFilter('SYMPTOM')}
              className={
                activeType === 'SYMPTOM'
                  ? 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              <FileText className='h-4 w-4 text-[#667085]' />
              الأعراض
            </button>
            <button
              type='button'
              onClick={() => setTypeFilter('GENERAL_ADVICE')}
              className={
                activeType === 'GENERAL_ADVICE'
                  ? 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              <Stethoscope className='h-4 w-4 text-[#667085]' />
              نصائح عامة
            </button>
            <button
              type='button'
              onClick={() => setTypeFilter('NEWS')}
              className={
                activeType === 'NEWS'
                  ? 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              <Newspaper className='h-4 w-4 text-[#667085]' />
              الأخبار
            </button>
          </div>

          <div className='mt-4 font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
            حالة النشر
          </div>
          <div className='mt-1.5 flex flex-wrap content-start justify-start gap-2 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFB] p-2'>
            <button
              type='button'
              onClick={() => setActiveStatus('الكل')}
              className={
                activeStatus === 'الكل'
                  ? 'inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              الكل
            </button>
            <button
              type='button'
              onClick={() => setActiveStatus('منشور')}
              className={
                activeStatus === 'منشور'
                  ? 'inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              منشور
            </button>
            <button
              type='button'
              onClick={() => setActiveStatus('قيد المراجعة')}
              className={
                activeStatus === 'قيد المراجعة'
                  ? 'inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              قيد المراجعة
            </button>
            <button
              type='button'
              onClick={() => setActiveStatus('مسودة')}
              className={
                activeStatus === 'مسودة'
                  ? 'inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              مسودة
            </button>
            <button
              type='button'
              onClick={() => setActiveStatus('مؤرشف')}
              className={
                activeStatus === 'مؤرشف'
                  ? 'inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              مؤرشف
            </button>
          </div>
        </section>

        <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.08)] overflow-hidden'>
          <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
            <div className='flex flex-wrap gap-2 items-center'>
              <BookOpen className='w-4 h-4 text-primary' />
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                المحتوى الطبي
              </div>
              <span className='rounded-full bg-[#F3F4F6] px-2.5 py-0.5 font-cairo text-[11px] font-extrabold text-[#667085]'>
                {query.trim()
                  ? `${filteredItems.length} مطابقة محلية`
                  : `${serverTotal.toLocaleString('ar-SA')} سجل (السيرفر)`}
                {showPaginationBar && totalPages > 0
                  ? ` · صفحة ${page} / ${totalPages}`
                  : ''}
              </span>
            </div>
          </div>

          <div className='divide-y divide-[#EEF2F6]'>
            {contentQuery.isLoading ? (
              <div className='px-6 py-6 font-cairo text-[12px] font-semibold text-[#667085]'>
                جارِ تحميل المحتوى...
              </div>
            ) : contentQuery.isError ? (
              <div className='px-6 py-6 font-cairo text-[12px] font-semibold text-[#B42318]'>
                تعذّر تحميل المحتوى الطبي.
              </div>
            ) : filteredItems.length === 0 ? (
              <div className='px-6 py-6 font-cairo text-[12px] font-semibold text-[#667085]'>
                لا توجد عناصر مطابقة للفلاتر الحالية.
              </div>
            ) : (
              filteredItems.map((it) => (
                <div
                  key={it._id}
                  className='flex flex-col gap-3 justify-between px-6 py-5 sm:flex-row sm:items-center'
                >
                  <div className='flex-1 min-w-0 text-right'>
                    <div className='flex flex-wrap gap-2 justify-start items-center sm:gap-3'>
                      <div className='min-w-0 font-cairo text-[14px] font-black text-[#111827]'>
                        {it.title ?? '—'}
                    </div>
                      {(() => {
                        const lk = languageKindLabel(it.language);
                        return (
                          <span
                            className={cn(
                              'inline-flex h-[22px] min-w-[1.6rem] shrink-0 items-center justify-center rounded-[8px] border px-2 font-cairo text-[10px] font-extrabold',
                              lk.code === 'ar' &&
                                'border-primary/30 bg-[#E7FBFA] text-primary',
                              lk.code === 'en' &&
                                'border-blue-200 bg-[#EFF6FF] text-[#1D4ED8]',
                              lk.code === 'other' &&
                                'border-[#E5E7EB] bg-[#F3F4F6] text-[#667085]',
                            )}
                            title={lk.label}
                          >
                            {lk.code === 'ar'
                              ? 'ع'
                              : lk.code === 'en'
                                ? 'EN'
                                : '؟'}
                          </span>
                        );
                      })()}
                    <div
                      className={`inline-flex h-[22px] items-center justify-center rounded-[8px] border px-3 font-cairo text-[11px] font-extrabold ${statusBadge(it.status)}`}
                    >
                        {statusLabel(it.status)}
                    </div>
                  </div>

                  <div className='mt-2 flex flex-wrap items-center justify-start gap-6 font-cairo text-[11px] font-bold text-[#98A2B3]'>
                      <div className='inline-flex gap-2 items-center'>
                        <LayoutGrid className='w-4 h-4' />
                        {typeLabel(it.type)}
                      </div>
                      <div className='inline-flex gap-2 items-center'>
                        <ClipboardCheck className='w-4 h-4' />
                        الكاتب:{' '}
                        {typeof it.createdBy === 'object'
                          ? (it.createdBy?.fullName ?? '—')
                          : (it.createdBy ?? '—')}
                    </div>
                      <div className='inline-flex gap-2 items-center'>
                        <Eye className='w-4 h-4' />
                        {Number(it.viewCount ?? it.views ?? 0).toLocaleString(
                          'ar-SA',
                        )}{' '}
                        مشاهدة
                    </div>
                      <div className='inline-flex gap-2 items-center'>
                        <Clock className='w-4 h-4' />
                        آخر تحديث: {formatDate(it.updatedAt)}
                    </div>
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-2 items-center sm:justify-start'>
                    {it.status === 'DRAFT' ? (
                      <button
                        type='button'
                        disabled={actionBusy}
                        onClick={() =>
                          setActionConfirm({
                            kind: 'submitReview',
                            id: it._id,
                            title: it.title ?? '—',
                          })
                        }
                        className='flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#E5E7EB] px-3 text-[#475467] disabled:opacity-50'
                        aria-label='إرسال للمراجعة'
                      >
                        <ClipboardCheck className='w-4 h-4' />
                        <span className='font-cairo text-[11px] font-extrabold'>
                          إرسال للمراجعة
                        </span>
                      </button>
                    ) : null}

                    {it.status === 'IN_REVIEW' ? (
                      <>
                  <button
                    type='button'
                          disabled={actionBusy}
                          onClick={() =>
                            setActionConfirm({
                              kind: 'approve',
                              id: it._id,
                              title: it.title ?? '—',
                            })
                          }
                          className='flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#BBF7D0] px-3 text-[#16A34A] disabled:opacity-50'
                          aria-label='موافقة'
                        >
                          <Check className='w-4 h-4' />
                          <span className='font-cairo text-[11px] font-extrabold'>
                            موافقة
                          </span>
                  </button>
                  <button
                    type='button'
                          disabled={actionBusy}
                          onClick={() => {
                            setRejectTarget(it);
                            setRejectOpen(true);
                          }}
                          className='flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#FECACA] px-3 text-[#EF4444] disabled:opacity-50'
                          aria-label='رفض'
                        >
                          <X className='w-4 h-4' />
                          <span className='font-cairo text-[11px] font-extrabold'>
                            رفض
                          </span>
                        </button>
                      </>
                    ) : null}

                    {it.status === 'PUBLISHED' ? (
                      <button
                        type='button'
                        disabled={actionBusy}
                        onClick={() =>
                          setActionConfirm({
                            kind: 'archive',
                            id: it._id,
                            title: it.title ?? '—',
                          })
                        }
                        className='flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#BFDBFE] px-3 text-[#1D4ED8] disabled:opacity-50'
                        aria-label='أرشفة'
                      >
                        <Archive className='w-4 h-4' />
                        <span className='font-cairo text-[11px] font-extrabold'>
                          أرشفة
                        </span>
                      </button>
                    ) : null}

                    {it.status === 'IN_REVIEW' ? (
                      <button
                        type='button'
                        disabled={actionBusy}
                        onClick={() =>
                          setActionConfirm({
                            kind: 'publish',
                            id: it._id,
                            title: it.title ?? '—',
                          })
                        }
                        className='flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#67E8F9] px-3 text-[#0891B2] disabled:opacity-50'
                        aria-label='نشر'
                      >
                        <ShieldCheck className='w-4 h-4' />
                        <span className='font-cairo text-[11px] font-extrabold'>
                          نشر
                        </span>
                  </button>
                    ) : null}

                  <button
                    type='button'
                      onClick={() => {
                        setViewingContentId(it._id);
                        setViewOpen(true);
                      }}
                    className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-[#2563EB]'
                    aria-label='عرض'
                  >
                      <Eye className='w-4 h-4' />
                  </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {showPaginationBar ? (
            <div className='border-t border-[#EEF2F6] bg-gradient-to-b from-[#FAFBFC] to-white px-4 py-4 sm:px-6'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='font-cairo text-[12px] font-semibold leading-relaxed text-[#667085]'>
                  <span className='text-[#101828]'>
                    عرض{' '}
                    <span className='font-extrabold tabular-nums'>
                      {paginationRange.start.toLocaleString('ar-SA')}–
                      {paginationRange.end.toLocaleString('ar-SA')}
                    </span>
                  </span>
                  <span> من </span>
                  <span className='font-extrabold text-[#101828] tabular-nums'>
                    {serverTotal.toLocaleString('ar-SA')}
                  </span>
                  <span> سجلاً</span>
                  {query.trim() ? (
                    <span className='mt-1 block text-[11px] font-bold text-primary/80'>
                      التصفية النصية تطبّق على الصفحة الحالية فقط
                    </span>
                  ) : null}
                </div>

                {totalPages > 1 ? (
                  <div
                    className='flex flex-wrap gap-1 justify-center items-center min-w-0 sm:justify-end'
                    role='navigation'
                    aria-label='تصفح الصفحات'
                  >
                    <button
                      type='button'
                      disabled={page <= 1}
                      onClick={() => setPage(1)}
                      className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] shadow-sm transition hover:border-primary/30 hover:bg-[#F0FDFA] disabled:pointer-events-none disabled:opacity-35'
                      aria-label='الصفحة الأولى'
                    >
                      <ChevronsRight className='w-4 h-4' />
                    </button>
                    <button
                      type='button'
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] shadow-sm transition hover:border-primary/30 hover:bg-[#F0FDFA] disabled:pointer-events-none disabled:opacity-35'
                      aria-label='الصفحة السابقة'
                    >
                      <ChevronRight className='w-4 h-4' />
                    </button>

                    <div className='mx-0.5 flex min-w-0 max-w-full flex-wrap items-center justify-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                      {visiblePageNumbers[0] > 1 ? (
                        <>
                          <button
                            type='button'
                            onClick={() => setPage(1)}
                            className='min-w-[2.25rem] rounded-[10px] border border-[#E5E7EB] bg-white px-2 py-1.5 font-cairo text-[12px] font-extrabold text-[#344054] transition hover:border-primary/30 hover:bg-[#F0FDFA]'
                          >
                            1
                          </button>
                          {visiblePageNumbers[0] > 2 ? (
                            <span
                              className='px-0.5 font-cairo text-[12px] font-bold text-[#98A2B3]'
                              aria-hidden
                            >
                              …
                            </span>
                          ) : null}
                        </>
                      ) : null}

                      {visiblePageNumbers.map((n) => (
                        <button
                          key={n}
                          type='button'
                          onClick={() => setPage(n)}
                          className={cn(
                            'min-w-[2.25rem] rounded-[10px] border px-2.5 py-1.5 font-cairo text-[12px] font-extrabold transition',
                            n === page
                              ? 'border-primary bg-primary text-white shadow-[0_6px_16px_rgba(15,143,139,0.25)]'
                              : 'border-[#E5E7EB] bg-white text-[#344054] hover:border-primary/30 hover:bg-[#F0FDFA]',
                          )}
                          aria-label={`الصفحة ${n}`}
                          aria-current={n === page ? 'page' : undefined}
                        >
                          {n.toLocaleString('ar-SA')}
                        </button>
                      ))}

                      {visiblePageNumbers[visiblePageNumbers.length - 1] <
                      totalPages ? (
                        <>
                          {visiblePageNumbers[visiblePageNumbers.length - 1] <
                          totalPages - 1 ? (
                            <span
                              className='px-0.5 font-cairo text-[12px] font-bold text-[#98A2B3]'
                              aria-hidden
                            >
                              …
                            </span>
                          ) : null}
                          <button
                            type='button'
                            onClick={() => setPage(totalPages)}
                            className='min-w-[2.25rem] rounded-[10px] border border-[#E5E7EB] bg-white px-2 py-1.5 font-cairo text-[12px] font-extrabold text-[#344054] transition hover:border-primary/30 hover:bg-[#F0FDFA]'
                            aria-label='الصفحة الأخيرة'
                          >
                            {totalPages.toLocaleString('ar-SA')}
                          </button>
                        </>
                      ) : null}
                    </div>

                    <button
                      type='button'
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] shadow-sm transition hover:border-primary/30 hover:bg-[#F0FDFA] disabled:pointer-events-none disabled:opacity-35'
                      aria-label='الصفحة التالية'
                    >
                      <ChevronLeft className='w-4 h-4' />
                    </button>
                    <button
                      type='button'
                      disabled={page >= totalPages}
                      onClick={() => setPage(totalPages)}
                      className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] shadow-sm transition hover:border-primary/30 hover:bg-[#F0FDFA] disabled:pointer-events-none disabled:opacity-35'
                      aria-label='الصفحة الأخيرة'
                    >
                      <ChevronsLeft className='w-4 h-4' />
                    </button>
                  </div>
                ) : (
                  <div className='font-cairo text-[11px] font-bold text-[#98A2B3]'>
                    كامل النتائج في صفحة واحدة
                  </div>
                )}
              </div>
          </div>
          ) : null}
        </section>

        <div className='h-8' />
      </div>
      <MedicalContentViewDialog
        open={viewOpen}
        onOpenChange={(next) => {
          setViewOpen(next);
          if (!next) setViewingContentId(null);
        }}
        contentId={viewingContentId}
      />

      <ConfirmActionDialog
        open={actionConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setActionConfirm(null);
        }}
        variant={actionConfirm?.kind === 'archive' ? 'destructive' : 'primary'}
        title={
          !actionConfirm
            ? '—'
            : actionConfirm.kind === 'submitReview'
              ? 'تأكيد إرسال المحتوى للمراجعة'
              : actionConfirm.kind === 'approve'
                ? 'تأكيد موافقة المحتوى'
                : actionConfirm.kind === 'publish'
                  ? 'تأكيد نشر المحتوى'
                  : 'تأكيد أرشفة المحتوى'
        }
        icon={
          actionConfirm
            ? actionConfirm.kind === 'archive' ? (
                <Archive className='h-6 w-6' strokeWidth={2} aria-hidden />
              ) : actionConfirm.kind === 'publish' ? (
                <ShieldCheck className='h-6 w-6' strokeWidth={2} aria-hidden />
              ) : actionConfirm.kind === 'approve' ? (
                <Check className='h-6 w-6' strokeWidth={2} aria-hidden />
              ) : (
                <ClipboardCheck className='h-6 w-6' strokeWidth={2} aria-hidden />
              )
            : undefined
        }
        description={
          actionConfirm ? (
            <>
              العنوان: «
              <span className='font-extrabold text-[#344054]'>
                {actionConfirm.title}
              </span>
              ». سيتم تنفيذ الإجراء على الخادم ولا يمكن التراجع محلياً.
            </>
          ) : (
            '—'
          )
        }
        confirmLabel={
          !actionConfirm
            ? '—'
            : actionConfirm.kind === 'submitReview'
              ? 'إرسال'
              : actionConfirm.kind === 'approve'
                ? 'موافقة'
                : actionConfirm.kind === 'publish'
                  ? 'نشر'
                  : 'أرشفة'
        }
        confirmDisabled={actionBusy}
        onConfirm={async () => {
          if (!actionConfirm) return;
          const { kind, id } = actionConfirm;
          if (kind === 'submitReview') {
            await submitReviewMutation.mutateAsync(id);
          } else if (kind === 'approve') {
            await approveMutation.mutateAsync(id);
          } else if (kind === 'publish') {
            await publishMutation.mutateAsync(id);
          } else {
            await archiveMutation.mutateAsync(id);
          }
        }}
        successToast={contentActionSuccessToast}
      />

      <ContentRejectDialog
        open={rejectOpen}
        onOpenChange={(o) => {
          setRejectOpen(o);
          if (!o) setRejectTarget(null);
        }}
        contentTitle={rejectTarget?.title ?? '—'}
        onConfirm={confirmReject}
        isPending={rejectMutation.isPending}
      />

      <CreateAdminContentDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
