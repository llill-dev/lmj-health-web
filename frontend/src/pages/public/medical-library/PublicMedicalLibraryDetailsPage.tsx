"use client";

import { ArrowLeft, CalendarDays, ExternalLink, FileText, Loader2, Share2 } from "lucide-react";
import { useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useParams } from "react-router-dom";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { usePlatformContentBySlug } from "@/hooks/platform";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import type { AdminContentBlock } from "@/lib/admin/types";

const TYPE_LABELS: Record<string, string> = {
  NEWS: "أخبار طبية",
  GENERAL_ADVICE: "نصائح عامة",
  CONDITION: "حالات مرضية",
  SYMPTOM: "أعراض",
  MEDICATION: "أدوية",
};

function formatPublishedAt(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PublicMedicalLibraryDetailsPage() {
  const params = useParams<{ slug: string }>();
  const location = useLocation();
  const slug = params.slug ? decodeURIComponent(params.slug) : "";
  const contentQuery = usePlatformContentBySlug(slug, "ar");
  const blocks = contentQuery.data?.contentBlocks ?? [];
  const backToList = `/medical-library${location.search || ""}`;
  const handleShare = useCallback(async () => {
    if (!contentQuery.data) return;
    const shareUrl = window.location.href;
    const shareData = {
      title: contentQuery.data.title,
      text: contentQuery.data.summary || contentQuery.data.title,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(shareUrl);
  }, [contentQuery.data]);

  if (contentQuery.isLoading) {
    return (
      <div dir="rtl" lang="ar" className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 font-cairo text-[14px] font-bold text-[#667085]">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          جارٍ تحميل المحتوى...
        </div>
      </div>
    );
  }

  if (contentQuery.isError || !contentQuery.data) {
    return (
      <div dir="rtl" lang="ar" className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <DoctorListErrorState
          title="تعذّر تحميل المحتوى الطبي"
          brief={
            contentQuery.error
              ? getUserFacingRequestErrorMessage(contentQuery.error)
              : "المحتوى المطلوب غير متوفر حالياً."
          }
          onRetry={() => void contentQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{contentQuery.data.title} • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <Link
          to={backToList}
          className="mb-5 inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#667085] transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة إلى المكتبة الطبية
        </Link>

        <article className="overflow-hidden rounded-[28px] border border-[#E4E7EC] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          {contentQuery.data.coverImage ? (
            <div className="border-b border-[#E4E7EC] bg-[#F8FAFC]">
              <img
                src={contentQuery.data.coverImage}
                alt={contentQuery.data.title}
                className="h-[220px] w-full object-cover sm:h-[320px]"
              />
            </div>
          ) : null}
          <div className="bg-[linear-gradient(135deg,#E6F7F5_0%,#FFFFFF_65%,#F8FAFC_100%)] px-6 py-8 sm:px-8">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="font-cairo text-[28px] font-black leading-[1.5] text-[#101828] sm:text-[34px]">
              {contentQuery.data.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 font-cairo text-[12px] font-bold text-[#667085]">
              <span className="rounded-full bg-white px-3 py-1 text-primary shadow-sm">
                {TYPE_LABELS[contentQuery.data.type] ?? contentQuery.data.type}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {formatPublishedAt(contentQuery.data.publishedAt)}
              </span>
              {contentQuery.data.sourceName?.trim() ? (
                <span className="rounded-full bg-white px-3 py-1 text-[#475467] shadow-sm">
                  المصدر: {contentQuery.data.sourceName.trim()}
                </span>
              ) : null}
            </div>
            {contentQuery.data.summary ? (
              <p className="mt-5 font-cairo text-[14px] font-semibold leading-8 text-[#475467]">
                {contentQuery.data.summary}
              </p>
            ) : null}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => void handleShare()}
                className="inline-flex items-center gap-2 rounded-[12px] border border-[#B8E6E0] bg-white px-4 py-2 font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#F0FDFA]"
              >
                <Share2 className="h-4 w-4" />
                مشاركة المقال
              </button>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8">
            {blocks.length > 0 ? (
              <div className="space-y-6">
                {blocks.map((block, index) => (
                  <ContentBlockRenderer key={`${block.type}-${index}`} block={block} />
                ))}
              </div>
            ) : (
              <div className="whitespace-pre-line font-cairo text-[15px] font-semibold leading-9 text-[#344054]">
                {contentQuery.data.summary || "لا يوجد نص تفصيلي متاح لهذا المحتوى حالياً."}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3 border-t border-[#EAECF0] pt-6">
              {contentQuery.data.sources?.filter((source) => source.url?.trim()).length ? (
                <div className="w-full space-y-3 rounded-[18px] border border-[#EAECF0] bg-[#FCFCFD] px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-cairo text-[16px] font-black text-[#101828]">
                      المراجع والمصادر
                    </h3>
                    <span className="rounded-full bg-white px-3 py-1 font-cairo text-[11px] font-extrabold text-primary shadow-sm">
                      {contentQuery.data.sources.filter((source) => source.url?.trim()).length} مرجع
                    </span>
                  </div>
                  <div className="space-y-2">
                    {contentQuery.data.sources
                      ?.filter((source) => source.url?.trim())
                      .map((source, index) => (
                        <a
                          key={`${source.url}-${index}`}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between gap-3 rounded-[12px] border border-[#D9F2EF] bg-white px-4 py-3 transition hover:border-primary"
                        >
                          <span className="font-cairo text-[13px] font-bold text-[#344054]">
                            {source.title?.trim() || source.url}
                          </span>
                          <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
                        </a>
                      ))}
                  </div>
                </div>
              ) : null}
              <Link
                to={backToList}
                className="inline-flex items-center justify-center rounded-[12px] border border-[#B8E6E0] bg-[#F0FDFA] px-4 py-2 font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#E6F7F5]"
              >
                المزيد من المحتوى الطبي
              </Link>
              <Link
                to="/welcome"
                className="inline-flex items-center justify-center rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-2 font-cairo text-[13px] font-extrabold text-[#475467] transition hover:border-[#B8E6E0] hover:text-primary"
              >
                الصفحة الرئيسية
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}

function ContentBlockRenderer({ block }: { block: AdminContentBlock }) {
  const flexibleBlock = block as AdminContentBlock & {
    imageUrl?: string;
    image?: string;
    caption?: string;
    alt?: string;
    embedUrl?: string;
    provider?: string;
    images?: Array<{ url?: string; caption?: string; alt?: string }>;
  };

  if (block.type === "heading") {
    const Tag = block.level && block.level <= 2 ? "h2" : "h3";
    return (
      <Tag className="font-cairo text-[22px] font-black leading-10 text-[#101828]">
        {block.text?.trim() || "عنوان"}
      </Tag>
    );
  }

  if (block.type === "paragraph") {
    return (
      <p className="whitespace-pre-line font-cairo text-[15px] font-semibold leading-9 text-[#344054]">
        {block.text?.trim() || "—"}
      </p>
    );
  }

  if (block.type === "list") {
    const items = block.items ?? [];
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag className="space-y-3 pr-5 font-cairo text-[15px] font-semibold leading-8 text-[#344054] marker:text-primary">
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "callout") {
    const tone =
      block.variant === "danger"
        ? "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]"
        : block.variant === "warn"
          ? "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]"
          : "border-[#B8E6E0] bg-[#F0FDFA] text-[#115E59]";
    return (
      <div className={`rounded-[18px] border px-5 py-4 ${tone}`}>
        {block.title ? (
          <h3 className="font-cairo text-[16px] font-black">{block.title}</h3>
        ) : null}
        <p className="mt-2 whitespace-pre-line font-cairo text-[14px] font-bold leading-8">
          {block.text?.trim() || "—"}
        </p>
      </div>
    );
  }

  if (block.type === "linkCard") {
    return (
      <a
        href={block.url || "#"}
        target="_blank"
        rel="noreferrer"
        className="flex items-start justify-between gap-4 rounded-[18px] border border-[#D9F2EF] bg-[#F8FFFE] px-5 py-4 transition hover:border-primary"
      >
        <div>
          <h3 className="font-cairo text-[16px] font-black text-[#101828]">
            {block.title?.trim() || "رابط خارجي"}
          </h3>
          {block.description ? (
            <p className="mt-2 font-cairo text-[13px] font-semibold leading-7 text-[#667085]">
              {block.description}
            </p>
          ) : null}
        </div>
        <ExternalLink className="mt-1 h-5 w-5 shrink-0 text-primary" />
      </a>
    );
  }

  if (block.type === "faq") {
    return (
      <div className="space-y-3">
        {(block.items ?? []).map((item, index) => (
          <div
            key={`${item.question}-${index}`}
            className="rounded-[18px] border border-[#EAECF0] bg-[#FCFCFD] px-5 py-4"
          >
            <h3 className="font-cairo text-[15px] font-black text-[#101828]">
              {item.question || "سؤال"}
            </h3>
            <p className="mt-2 whitespace-pre-line font-cairo text-[14px] font-semibold leading-8 text-[#475467]">
              {item.answer || "—"}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "divider") {
    return <div className="h-px w-full bg-[#EAECF0]" />;
  }

  if (block.type === "image" || flexibleBlock.imageUrl || flexibleBlock.image) {
    const imageUrl = flexibleBlock.imageUrl || flexibleBlock.image;
    if (!imageUrl) return null;

    return (
      <figure className="overflow-hidden rounded-[22px] border border-[#E4E7EC] bg-[#FCFCFD]">
        <img
          src={imageUrl}
          alt={flexibleBlock.alt || flexibleBlock.caption || "صورة توضيحية"}
          className="max-h-[460px] w-full object-cover"
        />
        {flexibleBlock.caption ? (
          <figcaption className="px-5 py-4 font-cairo text-[13px] font-bold leading-7 text-[#667085]">
            {flexibleBlock.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (block.type === "gallery" && Array.isArray(flexibleBlock.images) && flexibleBlock.images.length > 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {flexibleBlock.images.map((image, index) =>
          image.url ? (
            <figure
              key={`${image.url}-${index}`}
              className="overflow-hidden rounded-[20px] border border-[#E4E7EC] bg-[#FCFCFD]"
            >
              <img
                src={image.url}
                alt={image.alt || image.caption || `صورة ${index + 1}`}
                className="h-[220px] w-full object-cover"
              />
              {image.caption ? (
                <figcaption className="px-4 py-3 font-cairo text-[12px] font-bold text-[#667085]">
                  {image.caption}
                </figcaption>
              ) : null}
            </figure>
          ) : null,
        )}
      </div>
    );
  }

  if (block.type === "embed" && flexibleBlock.embedUrl) {
    return (
      <a
        href={flexibleBlock.embedUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-4 rounded-[18px] border border-[#D9F2EF] bg-[#F8FFFE] px-5 py-4 transition hover:border-primary"
      >
        <div>
          <h3 className="font-cairo text-[16px] font-black text-[#101828]">
            {flexibleBlock.title?.trim() || flexibleBlock.provider?.trim() || "محتوى مضمّن"}
          </h3>
          {flexibleBlock.caption ? (
            <p className="mt-2 font-cairo text-[13px] font-semibold leading-7 text-[#667085]">
              {flexibleBlock.caption}
            </p>
          ) : null}
        </div>
        <ExternalLink className="h-5 w-5 shrink-0 text-primary" />
      </a>
    );
  }

  return null;
}
