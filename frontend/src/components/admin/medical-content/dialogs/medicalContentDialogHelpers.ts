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
  | "seek_help_required";

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
    return "Seek Help block requirement is not enabled.";
  }

  if (code === "sources_required") {
    return "لا توجد مراجع مصادر مرفقة حاليًا.";
  }
  if (code === "disclaimer_required") {
    return "إصدار التنبيه الطبي غير مضاف.";
  }
  return "متطلب Seek Help Block غير مفعّل.";
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
    template,
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
    return { value: fallback, error: "صيغة JSON غير صالحة." };
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

export function getReviewReadinessIssueCodes(
  item: AdminContentDetailsItem | null,
): ReviewReadinessIssueCode[] {
  if (!item) return ["sources_required", "disclaimer_required"];

  const normalizedType = normalizeType(item.type);
  const issues: ReviewReadinessIssueCode[] = [];
  const sourceCount = countValidContentSources(item);
  const disclaimerVersion = toDisplayText(item.disclaimerVersion).trim();
  const requiresSeekHelpBlock = item.requiresSeekHelpBlock === true;

  if (normalizedType !== "SETTINGS_PAGE" && sourceCount === 0) {
    issues.push("sources_required");
  }

  if (normalizedType !== "SETTINGS_PAGE" && !disclaimerVersion) {
    issues.push("disclaimer_required");
  }

  if (
    (normalizedType === "CONDITION" || normalizedType === "SYMPTOM") &&
    !requiresSeekHelpBlock
  ) {
    issues.push("seek_help_required");
  }

  return issues;
}

export function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ar-SY");
}

export function formatBoolean(value?: boolean) {
  if (value == null) return "—";
  return value ? "نعم" : "لا";
}
