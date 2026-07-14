"use client";

import { ArrowLeft, CalendarDays, FileText, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { usePlatformContentBySlug } from "@/hooks/platform";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { contentBlocksToPlainText } from "@/lib/platform/contentUtils";

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
  const slug = params.slug ? decodeURIComponent(params.slug) : "";
  const contentQuery = usePlatformContentBySlug(slug, "ar");

  const body = useMemo(() => {
    if (!contentQuery.data) return "";
    return (
      contentBlocksToPlainText(contentQuery.data.contentBlocks) ||
      contentQuery.data.summary ||
      ""
    );
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
          to="/medical-library"
          className="mb-5 inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#667085] transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة إلى المكتبة الطبية
        </Link>

        <article className="overflow-hidden rounded-[28px] border border-[#E4E7EC] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
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
            </div>
            {contentQuery.data.summary ? (
              <p className="mt-5 font-cairo text-[14px] font-semibold leading-8 text-[#475467]">
                {contentQuery.data.summary}
              </p>
            ) : null}
          </div>

          <div className="px-6 py-8 sm:px-8">
            <div className="whitespace-pre-line font-cairo text-[15px] font-semibold leading-9 text-[#344054]">
              {body || "لا يوجد نص تفصيلي متاح لهذا المحتوى حالياً."}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 border-t border-[#EAECF0] pt-6">
              <Link
                to="/medical-library"
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
