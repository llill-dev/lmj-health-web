"use client";

import { AlertTriangle, ExternalLink, ShieldAlert } from "lucide-react";
import type { AdminContentBlock } from "@/lib/admin/types";
import { formatDate } from "./dialogs/medicalContentDialogHelpers";

type SourceItem = {
  title?: unknown;
  url?: unknown;
};

type Props = {
  title?: unknown;
  summary?: unknown;
  coverImage?: unknown;
  language?: "ar" | "en";
  contentBlocks?: AdminContentBlock[];
  disclaimerVersion?: unknown;
  requiresSeekHelpBlock?: boolean;
  riskFlags?: string[];
  sources?: SourceItem[];
  newsSourceName?: unknown;
  newsSourceUrl?: unknown;
  newsPublishedAt?: string;
  previewWarnings?: string[];
};

function toLocalizedText(value: unknown, language: "ar" | "en"): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    const preferred = language === "en" ? item.en : item.ar;
    const fallback = language === "en" ? item.ar : item.en;
    const common = item.title ?? item.name ?? item.value;
    if (typeof preferred === "string" && preferred.trim()) return preferred;
    if (typeof fallback === "string" && fallback.trim()) return fallback;
    if (typeof common === "string") return common;
  }
  return "";
}

function getSafeExternalUrl(value: unknown): string | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

function getPreviewCopy(language: "ar" | "en") {
  if (language === "en") {
    return {
      previewBadge: "Patient-facing Preview",
      titleFallback: "Content title",
      sourceLabel: "Source:",
      publishedAtLabel: "Published:",
      warningsTitle: "Preview validation warnings",
      warningsBody:
        "This draft may differ from final published output until these gaps are resolved.",
      medicalNoticeTitle: "Medical notice",
      medicalNoticePrefix: "This content uses disclaimer version:",
      safetyTitle: "Safety guidance",
      seekHelpRequired:
        "A Seek Help block should be emphasized in the final patient experience.",
      seekHelpNotRequired: "No Seek Help block is currently required.",
      sourcesTitle: "Sources",
      sourceFallback: "Source",
      blockFallback: "—",
      noDetailsFallback: "No detailed content has been authored yet.",
    };
  }

  return {
    previewBadge: "معاينة موجهة للمريض",
    titleFallback: "عنوان المحتوى",
    sourceLabel: "المصدر:",
    publishedAtLabel: "تاريخ النشر:",
    warningsTitle: "تنبيهات جودة المعاينة",
    warningsBody:
      "قد لا تعكس هذه المسودة الشكل النهائي بعد النشر قبل استكمال البنود التالية.",
    medicalNoticeTitle: "تنبيه طبي",
    medicalNoticePrefix: "هذا المحتوى يعرض نسخة التنبيه:",
    safetyTitle: "توجيه السلامة",
    seekHelpRequired: "يجب إبراز كتلة اطلب المساعدة الطبية داخل التجربة النهائية.",
    seekHelpNotRequired: "لا توجد كتلة seek help مطلوبة حاليًا.",
    sourcesTitle: "المصادر",
    sourceFallback: "مصدر",
    blockFallback: "—",
    noDetailsFallback: "لا يوجد محتوى تفصيلي بعد.",
  };
}

function renderContentBlock(
  block: AdminContentBlock,
  index: number,
  language: "ar" | "en",
  copy: ReturnType<typeof getPreviewCopy>,
) {
  if (!block || typeof block !== "object") return null;
  const type = toLocalizedText((block as Record<string, unknown>).type, language);

  if (type === "heading") {
    const levelRaw = Number((block as { level?: number }).level ?? 3);
    const level = Math.max(1, Math.min(6, Number.isNaN(levelRaw) ? 3 : levelRaw));
    const text = toLocalizedText((block as { text?: unknown }).text, language);
    const cls =
      level <= 2
        ? "text-[22px] font-black"
        : level === 3
          ? "text-[18px] font-extrabold"
          : "text-[16px] font-bold";
    return (
      <h3 key={`preview-block-${index}`} className={`font-cairo text-[#0F172A] ${cls}`}>
        {text || copy.blockFallback}
      </h3>
    );
  }

  if (type === "paragraph") {
    return (
      <p
        key={`preview-block-${index}`}
        className="font-cairo text-[15px] leading-8 text-[#334155]"
      >
        {toLocalizedText((block as { text?: unknown }).text, language) || copy.blockFallback}
      </p>
    );
  }

  if (type === "list") {
    const ordered = Boolean((block as { ordered?: boolean }).ordered);
    const items = Array.isArray((block as { items?: unknown[] }).items)
      ? ((block as { items?: unknown[] }).items ?? [])
          .map((item) => toLocalizedText(item, language))
          .filter(Boolean)
      : [];
    const Tag = ordered ? "ol" : "ul";
    return (
      <Tag
        key={`preview-block-${index}`}
        className={`space-y-2 ps-5 font-cairo text-[15px] text-[#334155] ${
          ordered ? "list-decimal" : "list-disc"
        }`}
      >
        {(items.length ? items : [copy.blockFallback]).map((item, itemIndex) => (
          <li key={`preview-list-${index}-${itemIndex}`}>{item}</li>
        ))}
      </Tag>
    );
  }

  if (type === "callout") {
    const variant = toLocalizedText((block as { variant?: unknown }).variant, language) || "info";
    const title = toLocalizedText((block as { title?: unknown }).title, language);
    const text = toLocalizedText((block as { text?: unknown }).text, language);
    const tone =
      variant === "danger"
        ? "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]"
        : variant === "warn"
          ? "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]"
          : "border-[#B2DDFF] bg-[#EFF8FF] text-[#175CD3]";
    return (
      <div
        key={`preview-block-${index}`}
        className={`rounded-[16px] border px-4 py-4 ${tone}`}
      >
        {title ? <div className="font-cairo text-[14px] font-extrabold">{title}</div> : null}
        <div className="mt-1 font-cairo text-[14px] leading-7">
          {text || copy.blockFallback}
        </div>
      </div>
    );
  }

  if (type === "linkCard") {
    const title = toLocalizedText((block as { title?: unknown }).title, language);
    const description = toLocalizedText((block as { description?: unknown }).description, language);
    const url = toLocalizedText((block as { url?: unknown }).url, language);
    const safeUrl = getSafeExternalUrl(url);
    return (
      <div
        key={`preview-block-${index}`}
        className="rounded-[16px] border border-[#D0D5DD] bg-white px-4 py-4 shadow-sm"
      >
        <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
          {title || copy.blockFallback}
        </div>
        {description ? (
          <div className="mt-1 font-cairo text-[13px] leading-6 text-[#475467]">
            {description}
          </div>
        ) : null}
        {safeUrl ? (
          <a
            href={safeUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-cairo text-[12px] font-bold text-primary hover:underline"
          >
            {url}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : url ? (
          <div className="mt-2 font-cairo text-[12px] font-bold text-[#667085]">{url}</div>
        ) : null}
      </div>
    );
  }

  if (type === "faq") {
    const rawItems = Array.isArray((block as { items?: unknown[] }).items)
      ? ((block as { items?: unknown[] }).items ?? [])
      : [];
    const faqItems = rawItems
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const faq = item as Record<string, unknown>;
        return {
          question: toLocalizedText(faq.question, language),
          answer: toLocalizedText(faq.answer, language),
        };
      })
      .filter((item) => item.question || item.answer);

    return (
      <div key={`preview-block-${index}`} className="space-y-3">
        {faqItems.length ? (
          faqItems.map((item, itemIndex) => (
            <div
              key={`preview-faq-${index}-${itemIndex}`}
              className="rounded-[14px] border border-[#E4E7EC] bg-[#F8FAFC] px-4 py-3"
            >
              <div className="font-cairo text-[14px] font-extrabold text-[#0F172A]">
                {item.question || copy.blockFallback}
              </div>
              <div className="mt-1 font-cairo text-[13px] leading-7 text-[#334155]">
                {item.answer || copy.blockFallback}
              </div>
            </div>
          ))
        ) : (
          <div className="font-cairo text-[14px] text-[#667085]">{copy.blockFallback}</div>
        )}
      </div>
    );
  }

  if (type === "divider") {
    return <hr key={`preview-block-${index}`} className="border-[#E2E8F0]" />;
  }

  return (
    <div
      key={`preview-block-${index}`}
      className="rounded-[12px] border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-3 py-2 font-cairo text-[12px] text-[#667085]"
    >
      {type || "unknown"}
    </div>
  );
}

export default function MedicalContentPatientPreview({
  title,
  summary,
  coverImage,
  language = "ar",
  contentBlocks,
  disclaimerVersion,
  requiresSeekHelpBlock,
  riskFlags = [],
  sources = [],
  newsSourceName,
  newsSourceUrl,
  newsPublishedAt,
  previewWarnings = [],
}: Props) {
  const copy = getPreviewCopy(language);
  const normalizedTitle = toLocalizedText(title, language);
  const normalizedSummary = toLocalizedText(summary, language);
  const normalizedCoverImage = toLocalizedText(coverImage, language);
  const normalizedDisclaimerVersion = toLocalizedText(disclaimerVersion, language);
  const normalizedNewsSourceName = toLocalizedText(newsSourceName, language);
  const normalizedNewsSourceUrl = toLocalizedText(newsSourceUrl, language);
  const safeNewsSourceUrl = getSafeExternalUrl(normalizedNewsSourceUrl);

  const blocks =
    contentBlocks && contentBlocks.length
      ? contentBlocks
      : ([{ type: "paragraph", text: normalizedSummary || copy.noDetailsFallback }] as AdminContentBlock[]);

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#DCE7F3] bg-[linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_30%)] shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      {normalizedCoverImage ? (
        <div className="h-[180px] w-full overflow-hidden bg-[#E5EEF8]">
          <img
            src={normalizedCoverImage}
            alt={normalizedTitle || "cover"}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="space-y-5 p-5">
        <div className="space-y-3">
          <div className="inline-flex items-center rounded-[999px] bg-[#E0F2FE] px-3 py-1 font-cairo text-[11px] font-extrabold text-[#0369A1]">
            {copy.previewBadge}
          </div>
          <div className="font-cairo text-[24px] font-black leading-10 text-[#0F172A]">
            {normalizedTitle || copy.titleFallback}
          </div>
          {normalizedSummary ? (
            <div className="font-cairo text-[15px] leading-8 text-[#475467]">
              {normalizedSummary}
            </div>
          ) : null}
          {normalizedNewsSourceName || normalizedNewsSourceUrl || newsPublishedAt ? (
            <div className="flex flex-wrap gap-3 font-cairo text-[12px] font-semibold text-[#64748B]">
              {normalizedNewsSourceName ? (
                <span>
                  {copy.sourceLabel} {normalizedNewsSourceName}
                </span>
              ) : null}
              {normalizedNewsSourceUrl ? (
                safeNewsSourceUrl ? (
                  <a
                    href={safeNewsSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {normalizedNewsSourceUrl}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span>{normalizedNewsSourceUrl}</span>
                )
              ) : null}
              {newsPublishedAt ? (
                <span>
                  {copy.publishedAtLabel} {formatDate(newsPublishedAt)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {previewWarnings.length ? (
          <div className="rounded-[14px] border border-[#FEDF89] bg-[#FFFAEB] px-4 py-3">
            <div className="inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#B54708]">
              <AlertTriangle className="h-4 w-4" />
              {copy.warningsTitle}
            </div>
            <div className="mt-1 font-cairo text-[12px] leading-6 text-[#7A2E0E]">
              {copy.warningsBody}
            </div>
            <ul className="mt-2 list-disc space-y-1 ps-5 font-cairo text-[12px] font-bold text-[#7A2E0E]">
              {previewWarnings.map((warning, index) => (
                <li key={`preview-warning-${index}`}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {(normalizedDisclaimerVersion || requiresSeekHelpBlock || riskFlags.length) ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {normalizedDisclaimerVersion ? (
              <div className="rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
                <div className="inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#92400E]">
                  <ShieldAlert className="h-4 w-4" />
                  {copy.medicalNoticeTitle}
                </div>
                <div className="mt-1 font-cairo text-[13px] leading-6 text-[#78350F]">
                  {copy.medicalNoticePrefix} {normalizedDisclaimerVersion}.
                </div>
              </div>
            ) : null}

            {requiresSeekHelpBlock || riskFlags.length ? (
              <div className="rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
                <div className="inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#B42318]">
                  <AlertTriangle className="h-4 w-4" />
                  {copy.safetyTitle}
                </div>
                <div className="mt-1 font-cairo text-[13px] leading-6 text-[#912018]">
                  {requiresSeekHelpBlock ? copy.seekHelpRequired : copy.seekHelpNotRequired}
                </div>
                {riskFlags.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {riskFlags.map((flag, index) => (
                      <span
                        key={`${flag}-${index}`}
                        className="rounded-[999px] border border-[#FCA5A5] bg-white px-2.5 py-1 font-cairo text-[11px] font-bold text-[#B42318]"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-4">
          {blocks.map((block, index) => renderContentBlock(block, index, language, copy))}
        </div>

        {sources.length ? (
          <div className="border-t border-[#E2E8F0] pt-4">
            <div className="font-cairo text-[13px] font-extrabold text-[#0F172A]">
              {copy.sourcesTitle}
            </div>
            <div className="mt-3 space-y-2">
              {sources.map((source, index) => {
                const sourceTitle = toLocalizedText(source.title, language);
                const sourceUrl = toLocalizedText(source.url, language);
                const safeSourceUrl = getSafeExternalUrl(sourceUrl);
                return (
                  <div
                    key={`${sourceTitle || sourceUrl || "preview-source"}-${index}`}
                    className="rounded-[12px] bg-[#F8FAFC] px-3 py-2"
                  >
                    <div className="font-cairo text-[12px] font-bold text-[#0F172A]">
                      {sourceTitle || copy.sourceFallback}
                    </div>
                    {sourceUrl ? (
                      safeSourceUrl ? (
                        <a
                          href={safeSourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 font-cairo text-[12px] font-bold text-primary hover:underline"
                        >
                          {sourceUrl}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <div className="mt-1 font-cairo text-[12px] font-bold text-[#667085]">
                          {sourceUrl}
                        </div>
                      )
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
