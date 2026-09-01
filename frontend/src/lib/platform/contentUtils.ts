import type { AdminContentBlock } from '@/lib/admin/types';
import type {
  PlatformContactChannel,
  PlatformContentApiRecord,
  PlatformContentDetails,
  PlatformContentLanguage,
  PlatformContentListItem,
  PlatformFaqItem,
  PlatformLegalDocument,
  PlatformSettingsListItem,
} from '@/lib/platform/types';

type PlatformSourceItem = {
  title?: string;
  url?: string;
};

type PlatformBlockMediaRecord = {
  imageUrl?: unknown;
  image?: unknown;
  coverImage?: unknown;
  media?: unknown;
  thumbnail?: unknown;
  poster?: unknown;
  images?: unknown;
};

type PlatformBlockSourceRecord = {
  sourceName?: unknown;
  source?: unknown;
};

type PlatformBlockSourceLinkRecord = {
  sourceTitle?: unknown;
  sourceUrl?: unknown;
  title?: unknown;
  url?: unknown;
  sourceLink?: unknown;
  href?: unknown;
  label?: unknown;
};

type PlatformBlockWithMedia = AdminContentBlock & PlatformBlockMediaRecord;
type PlatformBlockWithSource = AdminContentBlock & PlatformBlockSourceRecord;
type PlatformBlockWithSourceLink = AdminContentBlock & PlatformBlockSourceLinkRecord;

function asPlatformRecord(value: unknown): PlatformContentApiRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as PlatformContentApiRecord)
    : null;
}

function asAdminContentBlocks(value: unknown): AdminContentBlock[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is AdminContentBlock =>
          !!item && typeof item === 'object' && !Array.isArray(item),
      )
    : [];
}

function asPlatformSourceItem(value: unknown): PlatformContentApiRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as PlatformContentApiRecord)
    : null;
}

function readNullableString(value: unknown): string | null | undefined {
  if (typeof value === 'string') return value;
  return value === null ? null : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readFirstNonEmptyString(values: Array<string | null | undefined>): string | undefined {
  for (const value of values) {
    const normalized = readString(value);
    if (normalized) return normalized;
  }
  return undefined;
}

function readNestedString(
  record: PlatformContentApiRecord,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = readString(record[key]);
    if (value) return value;
  }
  return undefined;
}

function readMediaUrl(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  const record = asPlatformRecord(value);
  if (!record) return undefined;
  return readNestedString(record, [
    'url',
    'src',
    'href',
    'imageUrl',
    'secure_url',
    'downloadUrl',
  ]);
}

function readFirstMediaUrl(record: PlatformContentApiRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const url = readMediaUrl(record[key]);
    if (url) return url;
  }
  return undefined;
}

function readContentRows(value: unknown): PlatformContentApiRecord[] {
  return Array.isArray(value)
    ? value.filter(
        (row): row is PlatformContentApiRecord =>
          !!row && typeof row === 'object' && !Array.isArray(row),
      )
    : [];
}

function readFirstContentRows(
  ...values: unknown[]
): PlatformContentApiRecord[] {
  for (const value of values) {
    const rows = readContentRows(value);
    if (rows.length) return rows;
  }
  return [];
}

function readFirstStringField(
  record: PlatformContentApiRecord,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = readString(record[key]);
    if (value) return value;
  }
  return undefined;
}

function readContentTextMeta(
  record: PlatformContentApiRecord,
): Pick<PlatformContentDetails, 'language' | 'summary' | 'publishedAt'> {
  return {
    language: readFirstStringField(record, ['language']),
    summary: readFirstStringField(record, ['summary']),
    publishedAt: readFirstStringField(record, ['publishedAt']),
  };
}

function readBlockStringField(
  record: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = readString(record[key]);
    if (value) return value;
  }
  return undefined;
}

function readSourceTitle(record: PlatformContentApiRecord): string | undefined {
  return readFirstStringField(record, ['title', 'label', 'name', 'sourceTitle']);
}

function readSourceUrl(record: PlatformContentApiRecord): string | undefined {
  return readFirstStringField(record, ['url', 'href', 'sourceUrl', 'sourceLink']);
}

function readPrimaryContentRecord(
  data: PlatformContentApiRecord,
): PlatformContentApiRecord | null {
  return (
    asPlatformRecord(data.contentItem) ??
    asPlatformRecord(data.item) ??
    asPlatformRecord(data.content)
  );
}

function extractCoverImageFromBlocks(blocks: AdminContentBlock[]): string | undefined {
  for (const block of blocks) {
    const record: PlatformBlockWithMedia = block;
    const image = readFirstMediaUrl(record, [
      'coverImage',
      'imageUrl',
      'image',
      'media',
      'thumbnail',
      'poster',
    ]);
    if (image) return image;
    if (Array.isArray(record.images)) {
      for (const item of record.images) {
        const url = readMediaUrl(item);
        if (url) return url;
      }
    }
  }
  return undefined;
}

function extractSourceNameFromBlocks(blocks: AdminContentBlock[]): string | undefined {
  for (const block of blocks) {
    if (block.type === 'linkCard') {
      const title = readString(block.title);
      if (title) return title;
    }
    const record: PlatformBlockWithSource = block;
    const sourceName = readBlockStringField(record, ['sourceName', 'source']);
    if (sourceName) return sourceName;
  }
  return undefined;
}

function extractSourcesFromBlocks(
  blocks: AdminContentBlock[],
): PlatformSourceItem[] | undefined {
  const sources = blocks
    .flatMap((block) => {
      if (block.type === 'linkCard') {
        const source = toSourceItem(readString(block.title), readString(block.url));
        return source ? [source] : [];
      }

      const record: PlatformBlockWithSourceLink = block;
      const source = toSourceItem(
        readBlockStringField(record, ['sourceTitle', 'title', 'label']),
        readBlockStringField(record, ['sourceUrl', 'url', 'sourceLink', 'href']),
      );
      return source ? [source] : [];
    })
    .filter((entry) => entry.url);

  return sources.length ? sources : undefined;
}

function toSourceItem(
  title: string | undefined,
  url: string | undefined,
): PlatformSourceItem | null {
  return url ? { title, url } : null;
}

function readSourceItems(value: unknown): PlatformSourceItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map((entry) => {
      const record = asPlatformSourceItem(entry);
      if (!record) return null;
      return toSourceItem(readSourceTitle(record), readSourceUrl(record));
    })
    .filter((entry): entry is PlatformSourceItem => entry != null);
  return items.length ? items : undefined;
}

function normalizeContentItem(
  raw: PlatformContentApiRecord | null | undefined,
): PlatformContentDetails | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id ?? raw._id ?? '');
  if (!id) return null;
  const contentBlocks = asAdminContentBlocks(raw.contentBlocks);

  return {
    id,
    type: String(raw.type ?? ''),
    title: String(raw.title ?? ''),
    slug: String(raw.slug ?? ''),
    ...readContentTextMeta(raw),
    pageVersion: readNullableString(raw.pageVersion),
    lastReviewedAt:
      typeof raw.lastReviewedAt === 'string' ? raw.lastReviewedAt : null,
    coverImage:
      readFirstMediaUrl(raw, [
        'coverImage',
        'image',
        'imageUrl',
        'thumbnail',
        'media',
      ]) ??
      extractCoverImageFromBlocks(contentBlocks),
    sourceName:
      readFirstStringField(raw, ['sourceName', 'source', 'publisher']) ??
      extractSourceNameFromBlocks(contentBlocks),
    sources:
      readSourceItems(raw.sources) ?? extractSourcesFromBlocks(contentBlocks),
    contentBlocks,
  };
}

export function normalizePlatformContentListResponse(
  data: PlatformContentApiRecord,
): PlatformSettingsListItem[] {
  return normalizePlatformContentItems(data);
}

export function normalizePlatformContentItems(
  data: PlatformContentApiRecord,
): PlatformContentListItem[] {
  const rows = readFirstContentRows(data.items, data.contentItems, data.content);

  return rows
    .map((row) => {
      const contentBlocks = asAdminContentBlocks(row.contentBlocks);

      return {
        id: String(row.id ?? row._id ?? ''),
        type: String(row.type ?? ''),
        title: String(row.title ?? ''),
        slug: String(row.slug ?? ''),
        ...readContentTextMeta(row),
        pageVersion: readNullableString(row.pageVersion),
        coverImage:
          readFirstMediaUrl(row, [
            'coverImage',
            'image',
            'imageUrl',
            'thumbnail',
          ]) ??
          extractCoverImageFromBlocks(contentBlocks),
        sourceName:
          readFirstStringField(row, ['sourceName', 'source', 'publisher']) ??
          extractSourceNameFromBlocks(contentBlocks),
        viewCount:
          typeof row.viewCount === 'number'
            ? row.viewCount
            : typeof row.views === 'number'
              ? row.views
              : undefined,
      };
    })
    .filter((row) => row.id && row.slug);
}

export function normalizePlatformContentDetailsResponse(
  data: PlatformContentApiRecord,
): PlatformContentDetails | null {
  const raw = readPrimaryContentRecord(data);
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
  const bodyText = contentBlocksToPlainText(content.contentBlocks);
  const body =
    readFirstNonEmptyString([
      bodyText,
      content.summary,
    ]) ?? 'المحتوى غير متوفر حالياً.';

  const lastUpdated = formatContentDate(
    content.lastReviewedAt ?? content.publishedAt,
  );

  return {
    id: readFirstNonEmptyString([content.slug, content.id]) ?? content.id,
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

export function extractAboutSummary(
  content: PlatformContentDetails,
  language: PlatformContentLanguage = 'ar',
): string {
  if (content.summary?.trim()) return content.summary.trim();
  const text = contentBlocksToPlainText(content.contentBlocks);
  if (!text) {
    return language === 'en'
      ? 'Our platform aims to provide the best digital healthcare services with the highest standards of quality and privacy.'
      : 'منصتنا تهدف إلى تقديم أفضل الخدمات الصحية الرقمية بأعلى معايير الجودة والخصوصية.';
  }
  return text.length > 220 ? `${text.slice(0, 217)}…` : text;
}
