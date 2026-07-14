import type { AdminContentBlock } from '@/lib/admin/types';
import type {
  PlatformContactChannel,
  PlatformContentDetails,
  PlatformContentListItem,
  PlatformFaqItem,
  PlatformLegalDocument,
  PlatformSettingsListItem,
} from '@/lib/platform/types';

function normalizeContentItem(
  raw: Record<string, unknown> | null | undefined,
): PlatformContentDetails | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id ?? raw._id ?? '');
  if (!id) return null;

  return {
    id,
    type: String(raw.type ?? ''),
    title: String(raw.title ?? ''),
    slug: String(raw.slug ?? ''),
    language: typeof raw.language === 'string' ? raw.language : undefined,
    summary: typeof raw.summary === 'string' ? raw.summary : undefined,
    pageVersion:
      typeof raw.pageVersion === 'string' || raw.pageVersion === null
        ? (raw.pageVersion as string | null)
        : undefined,
    publishedAt:
      typeof raw.publishedAt === 'string' ? raw.publishedAt : undefined,
    lastReviewedAt:
      typeof raw.lastReviewedAt === 'string' ? raw.lastReviewedAt : null,
    coverImage:
      typeof raw.coverImage === 'string' ? raw.coverImage : undefined,
    sourceName:
      typeof raw.sourceName === 'string' ? raw.sourceName : undefined,
    sources: Array.isArray(raw.sources)
      ? raw.sources
          .filter((entry) => entry && typeof entry === 'object')
          .map((entry) => {
            const record = entry as Record<string, unknown>;
            return {
              title:
                typeof record.title === 'string' ? record.title : undefined,
              url: typeof record.url === 'string' ? record.url : undefined,
            };
          })
      : undefined,
    contentBlocks: Array.isArray(raw.contentBlocks)
      ? (raw.contentBlocks as AdminContentBlock[])
      : [],
  };
}

export function normalizePlatformContentListResponse(
  data: Record<string, unknown>,
): PlatformSettingsListItem[] {
  return normalizePlatformContentItems(data);
}

export function normalizePlatformContentItems(
  data: Record<string, unknown>,
): PlatformContentListItem[] {
  const rows = (data.items ?? data.contentItems ?? data.content ?? []) as
    | Record<string, unknown>[]
    | undefined;

  return (rows ?? [])
    .map((row) => ({
      id: String(row.id ?? row._id ?? ''),
      type: String(row.type ?? ''),
      title: String(row.title ?? ''),
      slug: String(row.slug ?? ''),
      language: typeof row.language === 'string' ? row.language : undefined,
      summary: typeof row.summary === 'string' ? row.summary : undefined,
      pageVersion:
        typeof row.pageVersion === 'string' || row.pageVersion === null
          ? (row.pageVersion as string | null)
          : undefined,
      publishedAt:
        typeof row.publishedAt === 'string' ? row.publishedAt : undefined,
      coverImage:
        typeof row.coverImage === 'string' ? row.coverImage : undefined,
      sourceName:
        typeof row.sourceName === 'string' ? row.sourceName : undefined,
      viewCount:
        typeof row.viewCount === 'number'
          ? row.viewCount
          : typeof row.views === 'number'
            ? row.views
            : undefined,
    }))
    .filter((row) => row.id && row.slug);
}

export function normalizePlatformContentDetailsResponse(
  data: Record<string, unknown>,
): PlatformContentDetails | null {
  const raw =
    (data.contentItem as Record<string, unknown> | undefined) ??
    (data.item as Record<string, unknown> | undefined) ??
    (data.content as Record<string, unknown> | undefined);
  return normalizeContentItem(raw);
}

export function contentBlocksToPlainText(blocks: AdminContentBlock[]): string {
  const parts: string[] = [];

  for (const block of blocks) {
    if (block.type === 'heading' && 'text' in block && block.text) {
      parts.push(String(block.text));
      continue;
    }
    if (block.type === 'paragraph' && 'text' in block && block.text) {
      parts.push(String(block.text));
      continue;
    }
    if (block.type === 'list' && 'items' in block && Array.isArray(block.items)) {
      parts.push(block.items.map((item) => `• ${item}`).join('\n'));
      continue;
    }
    if (block.type === 'callout' && 'text' in block && block.text) {
      parts.push(String(block.text));
    }
  }

  return parts.join('\n\n').trim();
}

export function extractFaqItemsFromBlocks(
  blocks: AdminContentBlock[],
): PlatformFaqItem[] {
  const items: PlatformFaqItem[] = [];
  let counter = 0;

  for (const block of blocks) {
    if (block.type !== 'faq' || !('items' in block) || !Array.isArray(block.items)) {
      continue;
    }

    for (const entry of block.items) {
      const question = String(entry?.question ?? '').trim();
      const answer = String(entry?.answer ?? '').trim();
      if (!question) continue;
      counter += 1;
      items.push({
        id: `faq-${counter}`,
        number: String(counter).padStart(2, '0'),
        question,
        answer: answer || '—',
      });
    }
  }

  return items;
}

export function extractContactChannelsFromBlocks(
  blocks: AdminContentBlock[],
): PlatformContactChannel[] {
  const channels: PlatformContactChannel[] = [];

  for (const block of blocks) {
    if (block.type === 'linkCard') {
      const url = String(block.url ?? '').trim();
      const title = String(block.title ?? block.description ?? 'تواصل').trim();
      if (!url) continue;

      channels.push({
        id: `link-${channels.length + 1}`,
        label: title,
        url,
        kind: classifyContactUrl(url),
      });
      continue;
    }

    if (block.type === 'paragraph' && 'text' in block && block.text) {
      const text = String(block.text);
      const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        channels.push({
          id: `email-${channels.length + 1}`,
          label: 'البريد الإلكتروني',
          url: `mailto:${emailMatch[0]}`,
          kind: 'email',
        });
      }
    }
  }

  return channels;
}

function classifyContactUrl(url: string): PlatformContactChannel['kind'] {
  const lower = url.toLowerCase();
  if (lower.startsWith('mailto:')) return 'email';
  if (lower.startsWith('tel:')) return 'phone';
  if (lower.includes('wa.me') || lower.includes('whatsapp')) return 'whatsapp';
  if (
    lower.includes('facebook') ||
    lower.includes('instagram') ||
    lower.includes('twitter') ||
    lower.includes('linkedin') ||
    lower.includes('x.com')
  ) {
    return 'social';
  }
  return 'link';
}

export function mapContentToLegalDocument(
  content: PlatformContentDetails,
  fallbackSectionTitle?: string,
): PlatformLegalDocument {
  const body =
    contentBlocksToPlainText(content.contentBlocks) ||
    content.summary ||
    'المحتوى غير متوفر حالياً.';

  const lastUpdated = formatContentDate(
    content.lastReviewedAt ?? content.publishedAt,
  );

  return {
    id: content.slug || content.id,
    title: content.title,
    sectionTitle: fallbackSectionTitle ?? content.title,
    body,
    lastUpdated,
    pageVersion: content.pageVersion ?? null,
  };
}

function formatContentDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'long',
  });
}

export function extractAboutSummary(content: PlatformContentDetails): string {
  if (content.summary?.trim()) return content.summary.trim();
  const text = contentBlocksToPlainText(content.contentBlocks);
  if (!text) {
    return 'منصتنا تهدف إلى تقديم أفضل الخدمات الصحية الرقمية بأعلى معايير الجودة والخصوصية.';
  }
  return text.length > 220 ? `${text.slice(0, 217)}…` : text;
}
