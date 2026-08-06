"use client";

import { AlertTriangle, ExternalLink, ShieldAlert } from "lucide-react";
import type { AdminContentBlock } from "@/lib/admin/types";
import { formatDate, toDisplayText } from "./dialogs/medicalContentDialogHelpers";

type SourceItem = {
  title?: string;
  url?: string;
};

type Props = {
  title?: string;
  summary?: string;
  coverImage?: string;
  contentBlocks?: AdminContentBlock[];
  disclaimerVersion?: string;
  requiresSeekHelpBlock?: boolean;
  riskFlags?: string[];
  sources?: SourceItem[];
  newsSourceName?: string;
  newsPublishedAt?: string;
};

function renderContentBlock(block: AdminContentBlock, index: number) {
  if (!block || typeof block !== "object") return null;
  const type = toDisplayText((block as Record<string, unknown>).type);

  if (type === "heading") {
    const levelRaw = Number((block as { level?: number }).level ?? 3);
    const level = Math.max(1, Math.min(6, Number.isNaN(levelRaw) ? 3 : levelRaw));
    const text = toDisplayText((block as { text?: unknown }).text);
    const cls =
      level <= 2
        ? "text-[22px] font-black"
        : level === 3
          ? "text-[18px] font-extrabold"
          : "text-[16px] font-bold";
    return (
      <h3 key={`preview-block-${index}`} className={`font-cairo text-[#0F172A] ${cls}`}>
        {text || "—"}
      </h3>
    );
  }

  if (type === "paragraph") {
    return (
      <p
        key={`preview-block-${index}`}
        className="font-cairo text-[15px] leading-8 text-[#334155]"
      >
        {toDisplayText((block as { text?: unknown }).text) || "—"}
      </p>
    );
  }

  if (type === "list") {
    const ordered = Boolean((block as { ordered?: boolean }).ordered);
    const items = Array.isArray((block as { items?: unknown[] }).items)
      ? ((block as { items?: unknown[] }).items ?? [])
          .map((item) => toDisplayText(item))
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
        {(items.length ? items : ["—"]).map((item, itemIndex) => (
          <li key={`preview-list-${index}-${itemIndex}`}>{item}</li>
        ))}
      </Tag>
    );
  }

  if (type === "callout") {
    const variant = toDisplayText((block as { variant?: unknown }).variant) || "info";
    const title = toDisplayText((block as { title?: unknown }).title);
    const text = toDisplayText((block as { text?: unknown }).text);
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
        <div className="mt-1 font-cairo text-[14px] leading-7">{text || "—"}</div>
      </div>
    );
  }

  if (type === "divider") {
    return <hr key={`preview-block-${index}`} className="border-[#E2E8F0]" />;
  }

  if (type === "linkCard") {
    const title = toDisplayText((block as { title?: unknown }).title);
    const description = toDisplayText((block as { description?: unknown }).description);
    const url = toDisplayText((block as { url?: unknown }).url);
    return (
      <div
        key={`preview-block-${index}`}
        className="rounded-[16px] border border-[#D0D5DD] bg-white px-4 py-4 shadow-sm"
      >
        <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
          {title || "—"}
        </div>
        {description ? (
          <div className="mt-1 font-cairo text-[13px] leading-6 text-[#475467]">
            {description}
          </div>
        ) : null}
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-cairo text-[12px] font-bold text-primary hover:underline"
          >
            {url}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    );
  }

  return null;
}

export default function MedicalContentPatientPreview({
  title,
  summary,
  coverImage,
  contentBlocks,
  disclaimerVersion,
  requiresSeekHelpBlock,
  riskFlags = [],
  sources = [],
  newsSourceName,
  newsPublishedAt,
}: Props) {
  const blocks =
    contentBlocks && contentBlocks.length
      ? contentBlocks
      : ([{ type: "paragraph", text: summary || "لا يوجد محتوى تفصيلي بعد." }] as AdminContentBlock[]);

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#DCE7F3] bg-[linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_30%)] shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      {coverImage ? (
        <div className="h-[180px] w-full overflow-hidden bg-[#E5EEF8]">
          <img src={coverImage} alt={title || "cover"} className="h-full w-full object-cover" />
        </div>
      ) : null}

      <div className="space-y-5 p-5">
        <div className="space-y-3">
          <div className="inline-flex items-center rounded-[999px] bg-[#E0F2FE] px-3 py-1 font-cairo text-[11px] font-extrabold text-[#0369A1]">
            معاينة موجهة للمريض
          </div>
          <div className="font-cairo text-[24px] font-black leading-10 text-[#0F172A]">
            {title || "عنوان المحتوى"}
          </div>
          {summary ? (
            <div className="font-cairo text-[15px] leading-8 text-[#475467]">{summary}</div>
          ) : null}
          {newsSourceName || newsPublishedAt ? (
            <div className="flex flex-wrap gap-3 font-cairo text-[12px] font-semibold text-[#64748B]">
              {newsSourceName ? <span>المصدر: {newsSourceName}</span> : null}
              {newsPublishedAt ? <span>تاريخ النشر: {formatDate(newsPublishedAt)}</span> : null}
            </div>
          ) : null}
        </div>

        {(disclaimerVersion || requiresSeekHelpBlock || riskFlags.length) ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {disclaimerVersion ? (
              <div className="rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
                <div className="inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#92400E]">
                  <ShieldAlert className="h-4 w-4" />
                  تنبيه طبي
                </div>
                <div className="mt-1 font-cairo text-[13px] leading-6 text-[#78350F]">
                  هذا المحتوى يعرض نسخة التنبيه: {disclaimerVersion}.
                </div>
              </div>
            ) : null}

            {requiresSeekHelpBlock || riskFlags.length ? (
              <div className="rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
                <div className="inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#B42318]">
                  <AlertTriangle className="h-4 w-4" />
                  توجيه السلامة
                </div>
                <div className="mt-1 font-cairo text-[13px] leading-6 text-[#912018]">
                  {requiresSeekHelpBlock
                    ? "يجب إبراز كتلة اطلب المساعدة الطبية داخل التجربة النهائية."
                    : "لا توجد كتلة seek help مطلوبة حاليًا."}
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
          {blocks.map((block, index) => renderContentBlock(block, index))}
        </div>

        {sources.length ? (
          <div className="border-t border-[#E2E8F0] pt-4">
            <div className="font-cairo text-[13px] font-extrabold text-[#0F172A]">المصادر</div>
            <div className="mt-3 space-y-2">
              {sources.map((source, index) => (
                <div
                  key={`${source.title || source.url || "preview-source"}-${index}`}
                  className="rounded-[12px] bg-[#F8FAFC] px-3 py-2"
                >
                  <div className="font-cairo text-[12px] font-bold text-[#0F172A]">
                    {source.title || "مصدر"}
                  </div>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 font-cairo text-[12px] font-bold text-primary hover:underline"
                    >
                      {source.url}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
