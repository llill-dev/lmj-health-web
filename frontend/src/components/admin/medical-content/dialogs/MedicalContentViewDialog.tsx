import * as Dialog from '@radix-ui/react-dialog';
import { ExternalLink, Loader2, Tag, X } from 'lucide-react';
import { useAdminContentById } from '@/hooks/useAdminContent';
import type {
  AdminContentBlock,
  AdminContentDetailsItem,
  AdminContentDetailsResponse,
  AdminContentStatus,
  AdminContentType,
} from '@/lib/admin/types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string | null;
};

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

function normalizeStatus(value: unknown): AdminContentStatus {
  if (value === 'PUBLISHED') return 'PUBLISHED';
  if (value === 'IN_REVIEW') return 'IN_REVIEW';
  if (value === 'ARCHIVED') return 'ARCHIVED';
  return 'DRAFT';
}

function normalizeType(value: unknown): AdminContentType {
  if (value === 'CONDITION') return 'CONDITION';
  if (value === 'SYMPTOM') return 'SYMPTOM';
  if (value === 'GENERAL_ADVICE') return 'GENERAL_ADVICE';
  if (value === 'NEWS') return 'NEWS';
  return 'GENERAL_ADVICE';
}

function normalizeDetails(
  payload?: AdminContentDetailsResponse,
): AdminContentDetailsItem | null {
  if (!payload || typeof payload !== 'object') return null;
  const raw =
    payload.item ?? payload.content ?? payload.contentItem ?? payload.data ?? null;
  if (!raw || typeof raw !== 'object') return null;

  const item = raw as Record<string, unknown>;
  const contentBlocks = Array.isArray(item.contentBlocks)
    ? (item.contentBlocks as AdminContentBlock[])
    : [];
  const tags = Array.isArray(item.tags)
    ? item.tags.map((t) => toDisplayText(t)).filter(Boolean)
    : [];
  const sources = Array.isArray(item.sources)
    ? item.sources
        .filter((s) => s && typeof s === 'object')
        .map((s) => {
          const src = s as Record<string, unknown>;
          return {
            title: toDisplayText(src.title),
            url: toDisplayText(src.url),
          };
        })
    : [];

  return {
    _id: toDisplayText(item._id || item.id || item.slug),
    type: normalizeType(item.type),
    status: normalizeStatus(item.status),
    title: toDisplayText(item.title),
    summary: toDisplayText(item.summary),
    language: toDisplayText(item.language),
    slug: toDisplayText(item.slug),
    createdAt: toDisplayText(item.createdAt),
    updatedAt: toDisplayText(item.updatedAt),
    viewCount: Number(item.viewCount ?? item.views ?? 0),
    views: Number(item.views ?? item.viewCount ?? 0),
    createdBy: toDisplayText(item.createdBy),
    reviewedBy: toDisplayText(item.reviewedBy),
    publishedAt: toDisplayText(item.publishedAt),
    contentBlocks,
    tags,
    sources,
    disclaimerVersion: toDisplayText(item.disclaimerVersion),
    rejectionReason: toDisplayText(item.rejectionReason) || null,
    templateId: toDisplayText(item.templateId) || null,
  };
}

function typeLabel(t: AdminContentType) {
  if (t === 'CONDITION') return 'الحالات الطبية';
  if (t === 'SYMPTOM') return 'الأعراض';
  if (t === 'GENERAL_ADVICE') return 'نصائح عامة';
  return 'الأخبار';
}

function statusLabel(s: AdminContentStatus) {
  if (s === 'PUBLISHED') return 'منشور';
  if (s === 'IN_REVIEW') return 'قيد المراجعة';
  if (s === 'ARCHIVED') return 'مؤرشف';
  return 'مسودة';
}

function statusTone(s: AdminContentStatus) {
  if (s === 'PUBLISHED') return 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]';
  if (s === 'IN_REVIEW') return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
  if (s === 'ARCHIVED') return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
  return 'bg-[#F3F4F6] text-[#344054] border-[#E5E7EB]';
}

function formatDate(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ar-SY');
}

function renderContentBlock(block: AdminContentBlock, index: number) {
  if (!block || typeof block !== 'object') return null;
  const type = toDisplayText((block as Record<string, unknown>).type);

  if (type === 'heading') {
    const levelRaw = Number((block as { level?: number }).level ?? 3);
    const level = Math.max(1, Math.min(6, Number.isNaN(levelRaw) ? 3 : levelRaw));
    const text = toDisplayText((block as { text?: unknown }).text);
    const cls =
      level <= 2
        ? 'text-[20px] font-black'
        : level === 3
          ? 'text-[18px] font-extrabold'
          : 'text-[16px] font-bold';
    return (
      <h3
        key={`block-${index}`}
        className={`font-cairo text-[#111827] ${cls}`}
      >
        {text || '—'}
      </h3>
    );
  }

  if (type === 'paragraph') {
    const text = toDisplayText((block as { text?: unknown }).text);
    return (
      <p
        key={`block-${index}`}
        className='font-cairo text-[14px] leading-7 text-[#344054]'
      >
        {text || '—'}
      </p>
    );
  }

  if (type === 'list') {
    const ordered = Boolean((block as { ordered?: boolean }).ordered);
    const items = Array.isArray((block as { items?: unknown[] }).items)
      ? ((block as { items?: unknown[] }).items ?? [])
          .map((i) => toDisplayText(i))
          .filter(Boolean)
      : [];
    const ListTag = ordered ? 'ol' : 'ul';
    return (
      <ListTag
        key={`block-${index}`}
        className='list-inside list-disc space-y-2 font-cairo text-[14px] text-[#344054]'
      >
        {(items.length ? items : ['—']).map((itemText, idx) => (
          <li key={`li-${index}-${idx}`}>{itemText}</li>
        ))}
      </ListTag>
    );
  }

  if (type === 'callout') {
    const variant = toDisplayText((block as { variant?: unknown }).variant) || 'info';
    const title = toDisplayText((block as { title?: unknown }).title);
    const text = toDisplayText((block as { text?: unknown }).text);
    const tone =
      variant === 'danger'
        ? 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]'
        : variant === 'warn'
          ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]'
          : 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]';
    return (
      <div
        key={`block-${index}`}
        className={`rounded-[12px] border px-4 py-3 ${tone}`}
      >
        <div className='font-cairo text-[13px] font-extrabold'>{title || 'ملاحظة'}</div>
        <div className='mt-1 font-cairo text-[13px] leading-6'>{text || '—'}</div>
      </div>
    );
  }

  if (type === 'linkCard') {
    const title = toDisplayText((block as { title?: unknown }).title);
    const url = toDisplayText((block as { url?: unknown }).url);
    const description = toDisplayText((block as { description?: unknown }).description);
    return (
      <div
        key={`block-${index}`}
        className='rounded-[12px] border border-[#E4E7EC] bg-white p-4'
      >
        <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>{title || 'مرجع'}</div>
        {description ? (
          <div className='mt-1 font-cairo text-[13px] text-[#667085]'>{description}</div>
        ) : null}
        {url ? (
          <a
            href={url}
            target='_blank'
            rel='noreferrer'
            className='mt-2 inline-flex items-center gap-1 font-cairo text-[12px] font-extrabold text-primary hover:underline'
          >
            فتح الرابط
            <ExternalLink className='h-3.5 w-3.5' />
          </a>
        ) : null}
      </div>
    );
  }

  if (type === 'faq') {
    const faqItems = Array.isArray((block as { items?: unknown[] }).items)
      ? ((block as { items?: unknown[] }).items ?? []).filter(
          (i) => i && typeof i === 'object',
        )
      : [];
    return (
      <div
        key={`block-${index}`}
        className='space-y-2 rounded-[12px] border border-[#E4E7EC] bg-[#F9FAFB] p-4'
      >
        <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>الأسئلة الشائعة</div>
        {faqItems.length ? (
          faqItems.map((faq, faqIdx) => {
            const q = toDisplayText((faq as Record<string, unknown>).question);
            const a = toDisplayText((faq as Record<string, unknown>).answer);
            return (
              <div
                key={`faq-${index}-${faqIdx}`}
                className='rounded-[10px] bg-white p-3'
              >
                <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>{q || '—'}</div>
                <div className='mt-1 font-cairo text-[13px] text-[#475467]'>{a || '—'}</div>
              </div>
            );
          })
        ) : (
          <div className='font-cairo text-[13px] text-[#667085]'>—</div>
        )}
      </div>
    );
  }

  if (type === 'divider') {
    return (
      <hr
        key={`block-${index}`}
        className='border-[#EAECF0]'
      />
    );
  }

  return (
    <div
      key={`block-${index}`}
      className='rounded-[10px] border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-3 py-2 font-cairo text-[12px] text-[#667085]'
    >
      كتلة غير مدعومة: {type || 'unknown'}
    </div>
  );
}

export default function MedicalContentViewDialog({
  open,
  onOpenChange,
  contentId,
}: Props) {
  const detailsQuery = useAdminContentById(contentId);
  const details = normalizeDetails(detailsQuery.data);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[2px]' />
        <Dialog.Content
          className='fixed left-1/2 top-1/2 z-[9999] w-[980px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] border border-[#EAECF0] bg-white shadow-[0_30px_80px_rgba(16,24,40,0.35)] outline-none'
          dir='rtl'
          lang='ar'
        >
          <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
            <div>
              <Dialog.Title className='font-cairo text-[18px] font-black text-[#111827]'>
                معاينة المحتوى الطبي
              </Dialog.Title>
              <Dialog.Description className='font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                عرض تفاصيل المحتوى قبل التعديل أو الاعتماد
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type='button'
                className='inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-[#667085] hover:bg-[#F2F4F7]'
                aria-label='إغلاق'
              >
                <X className='h-4.5 w-4.5' />
              </button>
            </Dialog.Close>
          </div>

          <div className='max-h-[75vh] overflow-y-auto px-6 py-5'>
            {detailsQuery.isLoading ? (
              <div className='flex items-center justify-center gap-2 py-16 font-cairo text-[13px] font-bold text-[#667085]'>
                <Loader2 className='h-4 w-4 animate-spin' />
                جارِ تحميل تفاصيل المحتوى...
              </div>
            ) : detailsQuery.isError ? (
              <div className='rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[13px] font-bold text-[#B42318]'>
                تعذّر تحميل تفاصيل المحتوى.
              </div>
            ) : !details ? (
              <div className='rounded-[12px] border border-[#F2F4F7] bg-[#FCFCFD] px-4 py-3 font-cairo text-[13px] font-bold text-[#667085]'>
                لا تتوفر تفاصيل لهذا المحتوى.
              </div>
            ) : (
              <div className='space-y-5'>
                <div className='rounded-[14px] border border-[#E4E7EC] bg-[#F9FAFB] p-4'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='font-cairo text-[20px] font-black text-[#111827]'>
                      {details.title || '—'}
                    </span>
                    <span
                      className={`inline-flex h-[24px] items-center rounded-[8px] border px-3 font-cairo text-[11px] font-extrabold ${statusTone(details.status)}`}
                    >
                      {statusLabel(details.status)}
                    </span>
                    <span className='inline-flex h-[24px] items-center rounded-[8px] border border-[#E4E7EC] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#475467]'>
                      {typeLabel(details.type)}
                    </span>
                  </div>

                  {details.summary ? (
                    <div className='mt-3 font-cairo text-[14px] leading-7 text-[#344054]'>
                      {details.summary}
                    </div>
                  ) : null}

                  <div className='mt-3 grid grid-cols-1 gap-2 text-[12px] sm:grid-cols-2'>
                    <div className='font-cairo font-bold text-[#667085]'>
                      اللغة: <span className='text-[#111827]'>{details.language || '—'}</span>
                    </div>
                    <div className='font-cairo font-bold text-[#667085]'>
                      المشاهدات:{' '}
                      <span className='text-[#111827]'>
                        {Number(details.viewCount ?? details.views ?? 0).toLocaleString('ar-SA')}
                      </span>
                    </div>
                    <div className='font-cairo font-bold text-[#667085]'>
                      آخر تحديث:{' '}
                      <span className='text-[#111827]'>{formatDate(details.updatedAt)}</span>
                    </div>
                    <div className='font-cairo font-bold text-[#667085]'>
                      تاريخ النشر:{' '}
                      <span className='text-[#111827]'>{formatDate(details.publishedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className='space-y-4 rounded-[14px] border border-[#E4E7EC] bg-white p-4'>
                  <div className='font-cairo text-[15px] font-extrabold text-[#111827]'>
                    محتوى المقال
                  </div>
                  <div className='space-y-4'>
                    {(details.contentBlocks?.length
                      ? details.contentBlocks
                      : [{ type: 'paragraph', text: details.summary || 'لا يوجد محتوى مفصل' }]
                    ).map((block, idx) => renderContentBlock(block, idx))}
                  </div>
                </div>

                {(details.tags?.length || details.sources?.length) && (
                  <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                    <div className='rounded-[14px] border border-[#E4E7EC] bg-white p-4'>
                      <div className='mb-3 inline-flex items-center gap-2 font-cairo text-[14px] font-extrabold text-[#111827]'>
                        <Tag className='h-4 w-4 text-primary' />
                        الوسوم
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {(details.tags?.length ? details.tags : ['—']).map((tag, idx) => (
                          <span
                            key={`tag-${idx}`}
                            className='inline-flex items-center rounded-[999px] border border-[#D0D5DD] bg-[#F9FAFB] px-3 py-1 font-cairo text-[12px] font-bold text-[#475467]'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className='rounded-[14px] border border-[#E4E7EC] bg-white p-4'>
                      <div className='mb-3 font-cairo text-[14px] font-extrabold text-[#111827]'>
                        المصادر
                      </div>
                      <div className='space-y-2'>
                        {(details.sources?.length ? details.sources : [{ title: '—', url: '' }]).map(
                          (src, idx) => (
                            <div
                              key={`src-${idx}`}
                              className='rounded-[10px] bg-[#F9FAFB] px-3 py-2'
                            >
                              <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                                {src.title || '—'}
                              </div>
                              {src.url ? (
                                <a
                                  href={src.url}
                                  target='_blank'
                                  rel='noreferrer'
                                  className='mt-1 inline-flex items-center gap-1 font-cairo text-[12px] font-bold text-primary hover:underline'
                                >
                                  {src.url}
                                  <ExternalLink className='h-3.5 w-3.5' />
                                </a>
                              ) : null}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

