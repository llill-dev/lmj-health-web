"use client";

import type {
  AdminContentBlock,
  AdminContentDetailsItem,
  AdminContentDetailsResponse,
  AdminContentStatus,
  AdminContentType,
} from "@/lib/admin/types";

type JsonRecord = Record<string, unknown>;

function tryParseJsonString(value: string): unknown | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "string") {
      const nested = parsed.trim();
      if ((nested.startsWith("{") && nested.endsWith("}")) || (nested.startsWith("[") && nested.endsWith("]"))) {
        try {
          return JSON.parse(nested);
        } catch {
          return parsed;
        }
      }
    }
    return parsed;
  } catch {
    return undefined;
  }
}

function normalizeJsonLikeValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "[object Object]" || trimmed === "undefined") {
    return undefined;
  }
  const parsed = tryParseJsonString(trimmed);
  return parsed !== undefined ? parsed : value;
}

function toBooleanLike(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
  }
  return undefined;
}

export type NormalizedMedicalContentDetails = AdminContentDetailsItem & {
  rawItem: JsonRecord;
  dataValue?: unknown;
  template?: JsonRecord | null;
  news?: JsonRecord | null;
  tags: string[];
  categories: string[];
  riskFlags: string[];
  relatedContentIds: string[];
  sources: Array<{ title?: string; url?: string }>;
  contentBlocks: AdminContentBlock[];
  coverImage?: string;
  requiresSeekHelpBlock?: boolean;
  isFeatured?: boolean;
};

export type ReviewReadinessIssueCode =
  | "sources_required"
  | "disclaimer_required"
  | "seek_help_required"
  | "blocks_required"
  | "news_source_url_required"
  | "news_published_at_required";

export function getReviewReadinessIssueMessage(
  code: ReviewReadinessIssueCode,
  language: "ar" | "en" = "ar",
): string {
  if (language === "en") {
    if (code === "sources_required") {
      return "No source references are currently attached.";
    }
    if (code === "disclaimer_required") {
      return "Disclaimer version is missing.";
    }
    if (code === "seek_help_required") {
      return "Add a callout block with a warn/danger variant and a title that says to seek help — a toggle alone does not satisfy this.";
    }
    if (code === "blocks_required") {
      return "At least one meaningful content block is required.";
    }
    if (code === "news_source_url_required") {
      return "NEWS sourceUrl is missing.";
    }
    return "NEWS publishedAt is missing.";
  }

  if (code === "sources_required") {
    return "لا توجد مراجع مصادر مرفقة حاليًا.";
  }
  if (code === "disclaimer_required") {
    return "إصدار التنبيه الطبي غير مضاف.";
  }
  if (code === "seek_help_required") {
    return "أضف بلوك تنبيه (callout) بنوع warn أو danger وعنوان يوضّح ضرورة مراجعة الطبيب — تفعيل الخيار وحده لا يكفي.";
  }
  if (code === "blocks_required") {
    return "يلزم وجود بلوك محتوى فعلي واحد على الأقل.";
  }
  if (code === "news_source_url_required") {
    return "رابط مصدر الخبر (news.sourceUrl) غير مضاف.";
  }
  return "تاريخ نشر الخبر (news.publishedAt) غير مضاف.";
}

export function toDisplayText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value && typeof value === "object") {
    const obj = value as JsonRecord;
    const localized = obj.ar ?? obj.en ?? obj.title ?? obj.name ?? obj.value;
    if (typeof localized === "string") return localized;
  }
  return "";
}

export function toOptionalText(value: unknown): string | undefined {
  const text = toDisplayText(value).trim();
  return text || undefined;
}

export function normalizeStatus(value: unknown): AdminContentStatus {
  if (value === "PUBLISHED") return "PUBLISHED";
  if (value === "IN_REVIEW") return "IN_REVIEW";
  if (value === "ARCHIVED") return "ARCHIVED";
  return "DRAFT";
}

export function normalizeType(value: unknown): AdminContentType {
  if (value === "CONDITION") return "CONDITION";
  if (value === "SYMPTOM") return "SYMPTOM";
  if (value === "GENERAL_ADVICE") return "GENERAL_ADVICE";
  if (value === "NEWS") return "NEWS";
  if (value === "MEDICATION") return "MEDICATION";
  if (value === "SETTINGS_PAGE") return "SETTINGS_PAGE";
  return "GENERAL_ADVICE";
}

function toStringArray(value: unknown): string[] {
  const normalized = normalizeJsonLikeValue(value);

  if (Array.isArray(normalized)) {
    return normalized
      .map((item) => toDisplayText(item).trim())
      .filter(Boolean);
  }

  if (typeof normalized === "string") {
    return normalized
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (normalized && typeof normalized === "object") {
    const single = toDisplayText(normalized).trim();
    return single ? [single] : [];
  }

  return [];
}

function toSources(value: unknown): Array<{ title?: string; url?: string }> {
  const normalized = normalizeJsonLikeValue(value);
  const list = Array.isArray(normalized)
    ? normalized
    : normalized && typeof normalized === "object"
      ? [normalized]
      : [];

  return list
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const source = item as JsonRecord;
      return {
        title: toOptionalText(source.title ?? source.name ?? source.label),
        url: toOptionalText(
          source.url ?? source.href ?? source.sourceUrl ?? source.link,
        ),
      };
    })
    .filter((source) => Boolean(source.title || source.url));
}

function toContentBlocks(value: unknown): AdminContentBlock[] {
  const normalized = normalizeJsonLikeValue(value);
  return Array.isArray(normalized) ? (normalized as AdminContentBlock[]) : [];
}

function toRecord(value: unknown): JsonRecord | null {
  const normalized = normalizeJsonLikeValue(value);
  return normalized && typeof normalized === "object" && !Array.isArray(normalized)
    ? (normalized as JsonRecord)
    : null;
}

function getRawDetailsItem(
  payload?: AdminContentDetailsResponse,
): JsonRecord | null {
  const raw =
    payload?.item ?? payload?.content ?? payload?.contentItem ?? payload?.data;
  return toRecord(raw);
}

export function extractMedicalContentDetails(
  payload?: AdminContentDetailsResponse,
): NormalizedMedicalContentDetails | null {
  const item = getRawDetailsItem(payload);
  if (!item) return null;
  const template =
    toRecord(item.template) ??
    toRecord(item.templateDefinition) ??
    toRecord(item.templateMeta);
  const dataValue =
    normalizeJsonLikeValue(item.data) ??
    normalizeJsonLikeValue(item.dataJson) ??
    normalizeJsonLikeValue(item.templateData) ??
    normalizeJsonLikeValue(item.structuredData);
  const newsRecord = toRecord(item.news);
  const fallbackNews: JsonRecord = {
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
    originalTitle: item.originalTitle,
    publishedAt: item.newsPublishedAt,
    aiSummary: item.aiSummary,
    dedupeHash: item.newsDedupeHash,
    importedAt: item.newsImportedAt,
  };
  const hasFallbackNews = Object.values(fallbackNews).some(
    (value) => value != null && toDisplayText(value).trim(),
  );
  const news = newsRecord ?? (hasFallbackNews ? fallbackNews : null);
  const requiresSeekHelpBlock = toBooleanLike(item.requiresSeekHelpBlock);
  const isFeatured = toBooleanLike(item.isFeatured);
  const primaryBlocks = toContentBlocks(item.contentBlocks);
  const contentBlocks =
    primaryBlocks.length > 0 ? primaryBlocks : toContentBlocks(item.blocks);
  const templateId =
    toOptionalText(item.templateId) ??
    toOptionalText(item.template_id) ??
    toOptionalText(template?._id) ??
    null;

  return {
    ...(item as AdminContentDetailsItem),
    rawItem: item,
    _id: toDisplayText(item._id ?? item.id ?? item.slug),
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
    createdBy: item.createdBy as AdminContentDetailsItem["createdBy"],
    reviewedBy: item.reviewedBy as AdminContentDetailsItem["reviewedBy"],
    publishedAt: toOptionalText(item.publishedAt),
    contentBlocks,
    tags: toStringArray(item.tags),
    categories: toStringArray(item.categories),
    riskFlags: toStringArray(item.riskFlags),
    relatedContentIds: toStringArray(item.relatedContentIds),
    sources: toSources(item.sources ?? item.references),
    pageVersion: toOptionalText(item.pageVersion) ?? null,
    disclaimerVersion: toOptionalText(item.disclaimerVersion),
    rejectionReason: toOptionalText(item.rejectionReason) ?? null,
    templateId,
    sourceName: toOptionalText(item.sourceName),
    originalTitle: toOptionalText(item.originalTitle),
    aiSummary: toOptionalText(item.aiSummary),
    coverImage: toOptionalText(item.coverImage),
    requiresSeekHelpBlock,
    isFeatured,
    dataValue,
    template: template as AdminContentDetailsItem["template"],
    news,
  };
}

export function toPrettyJson(value: unknown, fallback = ""): string {
  const normalized = normalizeJsonLikeValue(value);
  if (normalized == null) return fallback;
  if (typeof normalized === "string") {
    const trimmed = normalized.trim();
    if (!trimmed) return fallback;
    return normalized;
  }
  try {
    return JSON.stringify(normalized, null, 2);
  } catch {
    return fallback;
  }
}

export function parseJsonInput(
  value: string,
  fallback: unknown,
  language: "ar" | "en" = "ar",
): { value: unknown; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { value: fallback };

  if (trimmed === "[object Object]" || trimmed === "undefined") {
    return { value: fallback };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "string") {
      const nested = tryParseJsonString(parsed);
      return { value: nested !== undefined ? nested : parsed };
    }
    return { value: parsed };
  } catch {
    return {
      value: fallback,
      error: language === "en" ? "Invalid JSON format." : "صيغة JSON غير صالحة.",
    };
  }
}

export function parseCommaSeparatedList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function hasNewsFields(news?: JsonRecord | null): boolean {
  if (!news) return false;
  return [
    news.sourceName,
    news.sourceUrl,
    news.originalTitle,
    news.publishedAt,
    news.aiSummary,
    news.dedupeHash,
    news.importedAt,
  ].some((value) => Boolean(toDisplayText(value).trim()));
}

export function getNewsTypeSwitchSafetyMessage(
  previousType: AdminContentType | undefined,
  nextType: AdminContentType,
  language: "ar" | "en",
): string | null {
  if (!previousType || previousType === nextType) return null;

  const switchedToNews = previousType !== "NEWS" && nextType === "NEWS";
  if (switchedToNews) {
    return language === "en"
      ? "Switched to NEWS: drafts remain permissive, but source URL and publish date should be completed before review."
      : "تم التحويل إلى NEWS: يبقى حفظ المسودة مرنًا، لكن يُفضّل استكمال رابط المصدر وتاريخ النشر قبل المراجعة.";
  }

  const switchedFromNews = previousType === "NEWS" && nextType !== "NEWS";
  if (switchedFromNews) {
    return language === "en"
      ? "Switched from NEWS: news-only metadata will be ignored on save unless you switch back to NEWS."
      : "تم التحويل من NEWS: بيانات الخبر المخصصة لن تُرسل عند الحفظ إلا إذا أعدت النوع إلى NEWS.";
  }

  return null;
}

export function getNewsDraftGuidanceMessages(args: {
  isNewsType: boolean;
  language: "ar" | "en";
  sourceUrl?: string;
  publishedAt?: string;
  title?: string;
  summary?: string;
}): string[] {
  const { isNewsType, language, sourceUrl, publishedAt, title, summary } = args;
  if (!isNewsType) return [];

  const warnings: string[] = [];
  const hasSourceUrl = Boolean(sourceUrl?.trim());
  const hasPublishedAt = Boolean(publishedAt?.trim());
  const hasTitle = Boolean(title?.trim());
  const hasSummary = Boolean(summary?.trim());

  if (!hasSourceUrl || !hasPublishedAt) {
    warnings.push(
      language === "en"
        ? "Draft can still be saved, but source URL and publish date are required for stable NEWS governance."
        : "يمكن حفظ المسودة بدون منع، لكن يُعدّ رابط المصدر وتاريخ النشر ضروريين لثبات حوكمة الأخبار.",
    );
  }

  if (!hasTitle || !hasSummary) {
    warnings.push(
      language === "en"
        ? "Keep title and summary clear (or localized) so NEWS cards and downstream ingestion remain consistent."
        : "احرص على وضوح العنوان والملخص (أو صياغتهما محليًا) لضمان اتساق بطاقات الأخبار والتغذية اللاحقة.",
    );
  }

  return warnings;
}

function readSourceText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function countValidContentSources(item: AdminContentDetailsItem | null): number {
  if (!item) return 0;

  const directSources = Array.isArray(item.sources)
    ? item.sources.filter((source) => {
        const record = source as Record<string, unknown>;
        return Boolean(
          readSourceText(record.url) ||
            readSourceText(record.href) ||
            readSourceText(record.sourceUrl) ||
            readSourceText(record.link),
        );
      }).length
    : 0;

  if (directSources > 0) return directSources;

  const blockSources = Array.isArray(item.contentBlocks)
    ? item.contentBlocks.filter((block) => {
        const record = block as Record<string, unknown>;
        return Boolean(
          readSourceText(record.url) ||
            readSourceText(record.href) ||
            readSourceText(record.sourceUrl) ||
            readSourceText(record.sourceLink) ||
            readSourceText(record.link),
        );
      }).length
    : 0;

  return blockSources;
}

export function hasMeaningfulContentBlocks(
  blocks: AdminContentBlock[] | null | undefined,
): boolean {
  if (!Array.isArray(blocks) || blocks.length === 0) return false;
  return blocks.some((block) => {
    if (!block || typeof block !== "object") return false;
    const type = toDisplayText((block as { type?: unknown }).type).trim();
    if (type === "divider") return true;
    if (type === "heading" || type === "paragraph") {
      return Boolean(toDisplayText((block as { text?: unknown }).text).trim());
    }
    if (type === "list") {
      const items = (block as { items?: unknown }).items;
      return (
        Array.isArray(items) &&
        items.some((entry) => toDisplayText(entry).trim())
      );
    }
    if (type === "callout") {
      return Boolean(
        toDisplayText((block as { text?: unknown }).text).trim() ||
          toDisplayText((block as { title?: unknown }).title).trim(),
      );
    }
    if (type === "linkCard") {
      return Boolean(
        toDisplayText((block as { url?: unknown }).url).trim() ||
          toDisplayText((block as { title?: unknown }).title).trim(),
      );
    }
    if (type === "faq") {
      const items = (block as { items?: unknown }).items;
      return (
        Array.isArray(items) &&
        items.some((entry) => {
          if (!entry || typeof entry !== "object") return false;
          const row = entry as { question?: unknown; answer?: unknown };
          return (
            Boolean(toDisplayText(row.question).trim()) ||
            Boolean(toDisplayText(row.answer).trim())
          );
        })
      );
    }
    return Object.keys(block).length > 1;
  });
}

// docs/API.md:9800 — the backend's actual seek-help gate for CONDITION/
// SYMPTOM inspects contentBlocks for a real callout with variant "warn" or
// "danger" and a title containing "seek help" (or "متى تراجع الطبيب"). It
// does not check the `requiresSeekHelpBlock` toggle — that field is stored
// editorial metadata, not the enforcement itself. Checking only the toggle
// let the frontend show "ready" for content the backend would still reject.
const SEEK_HELP_TITLE_PATTERN = /seek help|متى تراجع الطبيب/i;

export function hasSeekHelpCallout(
  blocks: AdminContentBlock[] | null | undefined,
): boolean {
  if (!Array.isArray(blocks)) return false;
  return blocks.some((block) => {
    if (!block || typeof block !== "object") return false;
    const record = block as Record<string, unknown>;
    if (toDisplayText(record.type).trim() !== "callout") return false;
    const variant = toDisplayText(record.variant).trim();
    if (variant !== "danger" && variant !== "warn") return false;
    return SEEK_HELP_TITLE_PATTERN.test(toDisplayText(record.title));
  });
}

export function getReviewReadinessIssueCodes(
  item: AdminContentDetailsItem | null,
): ReviewReadinessIssueCode[] {
  if (!item) {
    return ["sources_required", "disclaimer_required", "blocks_required"];
  }

  const normalizedType = normalizeType(item.type);
  const issues: ReviewReadinessIssueCode[] = [];
  const sourceCount = countValidContentSources(item);
  const disclaimerVersion = toDisplayText(item.disclaimerVersion).trim();
  const news =
    item.news && typeof item.news === "object"
      ? (item.news as Record<string, unknown>)
      : null;
  const newsSourceUrl = toDisplayText(
    news?.sourceUrl ?? item.sourceUrl,
  ).trim();
  const newsPublishedAt = toDisplayText(
    news?.publishedAt ?? (normalizedType === "NEWS" ? item.publishedAt : undefined),
  ).trim();

  // Sources + disclaimer are required only for CONDITION/SYMPTOM/MEDICATION/
  // GENERAL_ADVICE per the medical-content requirements guide — SETTINGS_PAGE
  // is exempt entirely, and NEWS has its own sourceUrl/publishedAt gate below
  // instead of the generic sources/disclaimer one.
  const requiresSourcesAndDisclaimer =
    normalizedType === "CONDITION" ||
    normalizedType === "SYMPTOM" ||
    normalizedType === "MEDICATION" ||
    normalizedType === "GENERAL_ADVICE";

  if (requiresSourcesAndDisclaimer && sourceCount === 0) {
    issues.push("sources_required");
  }

  if (requiresSourcesAndDisclaimer && !disclaimerVersion) {
    issues.push("disclaimer_required");
  }

  if (
    (normalizedType === "CONDITION" || normalizedType === "SYMPTOM") &&
    !hasSeekHelpCallout(item.contentBlocks)
  ) {
    issues.push("seek_help_required");
  }

  if (
    normalizedType !== "SETTINGS_PAGE" &&
    !hasMeaningfulContentBlocks(item.contentBlocks)
  ) {
    issues.push("blocks_required");
  }

  if (normalizedType === "NEWS" && !newsSourceUrl) {
    issues.push("news_source_url_required");
  }

  if (normalizedType === "NEWS" && !newsPublishedAt) {
    issues.push("news_published_at_required");
  }

  return issues;
}

/**
 * Snapshot input fields shared with `releaseAcceptanceMatrix`.
 * Prefer `buildReleaseAcceptanceFromDetails` / `buildReleaseAcceptanceSnapshot`
 * for full type × status acceptance checks (blocks, NEWS sourceUrl/publishedAt).
 */
export function toReleaseAcceptanceFields(item: AdminContentDetailsItem | null): {
  type: AdminContentType;
  status: AdminContentStatus;
  sourceCount: number;
  disclaimerVersion?: string;
  hasSeekHelpCallout: boolean;
  newsSourceUrl?: string;
  newsPublishedAt?: string;
  reviewIssueCodes: ReviewReadinessIssueCode[];
} | null {
  if (!item) return null;
  const type = normalizeType(item.type);
  const status = normalizeStatus(item.status);
  const reviewIssueCodes = getReviewReadinessIssueCodes(item);
  const news =
    item.news && typeof item.news === "object"
      ? (item.news as Record<string, unknown>)
      : null;

  return {
    type,
    status,
    sourceCount:
      type === "SETTINGS_PAGE"
        ? 0
        : reviewIssueCodes.includes("sources_required")
          ? 0
          : countValidContentSources(item),
    disclaimerVersion: toOptionalText(item.disclaimerVersion),
    hasSeekHelpCallout: hasSeekHelpCallout(item.contentBlocks),
    newsSourceUrl: toOptionalText(news?.sourceUrl ?? item.sourceUrl),
    newsPublishedAt: toOptionalText(
      news?.publishedAt ?? (type === "NEWS" ? item.publishedAt : undefined),
    ),
    reviewIssueCodes,
  };
}

export function formatDate(value?: string, language: "ar" | "en" = "ar") {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(language === "en" ? "en-US" : "ar-SY");
}

export function formatBoolean(value?: boolean, language: "ar" | "en" = "ar") {
  if (value == null) return "—";
  if (language === "en") return value ? "Yes" : "No";
  return value ? "نعم" : "لا";
}
