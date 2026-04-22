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
  Pill,
  ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import MedicalContentViewDialog from '@/components/admin/dialogs/MedicalContentViewDialog';
import {
  useAdminContentList,
  useApproveContent,
  useArchiveContent,
  usePublishContent,
  useRejectContent,
  useSubmitContentReview,
} from '@/hooks/useAdminContent';
import type {
  AdminContentItem,
  AdminContentStatus,
  AdminContentType,
} from '@/lib/admin/types';

type UiContentStatus = 'منشور' | 'قيد المراجعة' | 'مسودة' | 'مؤرشف';

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
            language: toDisplayText(item.language),
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

export default function AdminMedicalContentPage() {
  const [query, setQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<'الكل' | UiContentStatus>(
    'الكل',
  );
  const [activeType, setActiveType] = useState<'الكل' | AdminContentType>(
    'الكل',
  );
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingContentId, setViewingContentId] = useState<string | null>(null);

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

  const contentQuery = useAdminContentList({
    page: 1,
    limit: 100,
    ...(activeType !== 'الكل' ? { type: activeType } : {}),
    ...(activeStatus !== 'الكل'
      ? { status: statusToApi[activeStatus] as AdminContentStatus }
      : {}),
  });

  const submitReviewMutation = useSubmitContentReview();
  const approveMutation = useApproveContent();
  const rejectMutation = useRejectContent();
  const publishMutation = usePublishContent();
  const archiveMutation = useArchiveContent();

  const items = useMemo<AdminContentItem[]>(
    () => normalizeContentItems(contentQuery.data),
    [contentQuery.data],
  );

  const filteredItems = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return items;
    return items.filter((it) => {
      const title = String(it.title ?? '').toLowerCase();
      const summary = String(it.summary ?? '').toLowerCase();
      const slug = String(it.slug ?? '').toLowerCase();
      return (
        title.includes(text) || summary.includes(text) || slug.includes(text)
      );
    });
  }, [items, query]);

  const stats = useMemo(() => {
    const published = items.filter((i) => i.status === 'PUBLISHED').length;
    const draft = items.filter((i) => i.status === 'DRAFT').length;
    const inReview = items.filter((i) => i.status === 'IN_REVIEW').length;
    const archived = items.filter((i) => i.status === 'ARCHIVED').length;
    const totalViews = items.reduce(
      (acc, it) => acc + Number(it.viewCount ?? it.views ?? 0),
      0,
    );
    return {
      published,
      draft,
      inReview,
      archived,
      totalViews,
      total: items.length,
    };
  }, [items]);

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

  async function handleReject(id: string) {
    const reason = window.prompt(
      'سبب الرفض (إجباري):',
      'المحتوى يحتاج تعديلات قبل الموافقة',
    );
    if (!reason || !reason.trim()) return;
    setRejectingId(id);
    try {
      await rejectMutation.mutateAsync({ id, reason: reason.trim() });
    } finally {
      setRejectingId(null);
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
        <title>إدارة المحتوى الطبي • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='flex justify-between items-start'>
          <div>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              إدارة المحتوى الطبي
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              إدارة المقالات والمحتوى التعليمي الطبي
            </div>
          </div>

          <button
            type='button'
            className='inline-flex h-[36px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.20)]'
            disabled
          >
            <Plus className='w-4 h-4' />
            إضافة محتوى جديد
          </button>
        </div>

        <section className='grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 xl:grid-cols-5'>
          {[
            {
              title: 'المشاهدات',
              value: stats.totalViews.toLocaleString('ar-SA'),
              icon: Eye,
              valueColor: 'text-[#0F8F8B]',
              tone: {
                border: 'border-[#0F8F8B]',
                bg: 'bg-[#16C5C00D]',
                iconBg: 'bg-[#0F8F8B]',
              },
            },
            {
              title: 'مسودات',
              value: String(stats.draft),
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
              value: String(stats.inReview),
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
              value: String(stats.published),
              icon: CheckCircle2,
              valueColor: 'text-[#4A5565]',
              tone: {
                border: 'border-[#E5E7EB]',
                bg: 'bg-gradient-to-br from-[#F9FAFB] to-white',
                iconBg: 'bg-[#4A5565]',
              },
            },
            {
              title: 'إجمالي المحتوى',
              value: String(stats.total),
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

        <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='relative'>
            <input
              placeholder='بحث في المحتوى...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-white pe-12 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
            />
            <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
              <Search className='w-5 h-5' />
            </div>
          </div>

          <div className='flex gap-2 justify-start items-center mt-5'>
            <button
              type='button'
              onClick={() => setActiveType('الكل')}
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
              onClick={() => setActiveType('CONDITION')}
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
              onClick={() => setActiveType('SYMPTOM')}
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
              onClick={() => setActiveType('GENERAL_ADVICE')}
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
              onClick={() => setActiveType('NEWS')}
              className={
                activeType === 'NEWS'
                  ? 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              <Pill className='h-4 w-4 text-[#667085]' />
              الأخبار
            </button>
          </div>

          <div className='flex gap-2 justify-start items-center mt-4'>
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
            <div className='flex gap-2 items-center'>
              <BookOpen className='w-4 h-4 text-primary' />
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                المحتوى الطبي ({filteredItems.length})
              </div>
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
                  className='flex justify-between items-center px-6 py-5'
                >
                  <div className='flex-1 text-right'>
                    <div className='flex gap-3 justify-start items-center'>
                      <div className='font-cairo text-[14px] font-black text-[#111827]'>
                        {it.title ?? '—'}
                      </div>
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
                  <div className='flex gap-3 items-center'>
                    {it.status === 'DRAFT' ? (
                      <button
                        type='button'
                        disabled={actionBusy}
                        onClick={() => submitReviewMutation.mutate(it._id)}
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
                          onClick={() => approveMutation.mutate(it._id)}
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
                          onClick={() => handleReject(it._id)}
                          className='flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#FECACA] px-3 text-[#EF4444] disabled:opacity-50'
                          aria-label='رفض'
                        >
                          <X className='w-4 h-4' />
                          <span className='font-cairo text-[11px] font-extrabold'>
                            {rejectingId === it._id ? '...' : 'رفض'}
                          </span>
                        </button>
                      </>
                    ) : null}

                    {it.status === 'PUBLISHED' ? (
                      <button
                        type='button'
                        disabled={actionBusy}
                        onClick={() => archiveMutation.mutate(it._id)}
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
                        onClick={() => publishMutation.mutate(it._id)}
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
    </>
  );
}
