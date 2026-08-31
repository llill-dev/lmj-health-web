import { Helmet } from "react-helmet-async";
import {
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Eye,
  Link as LinkIcon,
  Newspaper,
  Plus,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import {
  ConfirmActionDialog,
  type ConfirmSuccessToast,
} from "@/components/admin/dialogs";
import MedicalContentViewDialog from "@/components/admin/medical-content/dialogs/MedicalContentViewDialog";
import { ContentRejectDialog } from "@/components/admin/medical-content";
import { useToast } from "@/components/ui/ToastProvider";
import LanguageModeToggle from "@/components/admin/medical-content/LanguageModeToggle";
import {
  useAdminPendingNews,
  useApproveContent,
  useArchiveContent,
  useIngestNews,
  usePublishContent,
  useRejectContent,
  useSubmitContentReview,
} from "@/hooks/admin/content/useAdminContent";
import {
  buildReleaseAcceptanceFromDetails,
  getIncompleteAcceptanceChecks,
  isApprovePublishPathReady,
  localizeAcceptanceCopy,
} from "@/components/admin/medical-content/releaseAcceptanceMatrix";
import {
  getReviewReadinessIssueCodes,
  getReviewReadinessIssueMessage,
} from "@/components/admin/medical-content/dialogs/medicalContentDialogHelpers";
import type {
  AdminContentDetailsItem,
  AdminContentDetailsResponse,
} from "@/lib/admin/types";
import { adminApi } from "@/lib/admin/client";
import {
  formatContentDate,
  toDisplayText,
  type LangFilter,
} from "@/components/admin/medical-content/contentListUtils";
import { useI18n } from "@/i18n/provider";

function extractContentDetails(
  payload?: AdminContentDetailsResponse | null,
): AdminContentDetailsItem | null {
  if (!payload || typeof payload !== "object") return null;
  return (
    payload.item ??
    payload.content ??
    payload.contentItem ??
    payload.data ??
    null
  );
}

/** Same lifecycle palette as AdminContentListItem's statusBadgeClass, localized bilingually here. */
function newsStatusBadge(
  status: AdminContentDetailsItem["status"] | undefined,
  t: (key: string) => string,
): { label: string; className: string } {
  if (status === "PUBLISHED") {
    return {
      label: t("admin.medicalNewsQueue.status.published"),
      className: "border-[#BBF7D0] bg-[#DCFCE7] text-[#16A34A]",
    };
  }
  if (status === "IN_REVIEW") {
    return {
      label: t("admin.medicalNewsQueue.status.inReview"),
      className: "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]",
    };
  }
  if (status === "ARCHIVED") {
    return {
      label: t("admin.medicalNewsQueue.status.archived"),
      className: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
    };
  }
  return {
    label: t("admin.medicalNewsQueue.status.draft"),
    className: "border-[#E5E7EB] bg-[#F3F4F6] text-[#344054]",
  };
}

export default function AdminMedicalNewsQueuePage() {
  const { toast } = useToast();
  const { t, locale, dir } = useI18n();
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";
  const [langFilter, setLangFilter] = useState<LangFilter>("all");
  const [sourceUrl, setSourceUrl] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [ingestOpen, setIngestOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingContentId, setViewingContentId] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] =
    useState<AdminContentDetailsItem | null>(null);
  const [actionConfirm, setActionConfirm] = useState<{
    kind: "submitReview" | "approve" | "publish" | "archive";
    id: string;
    title: string;
  } | null>(null);

  const [ingestSourceUrl, setIngestSourceUrl] = useState("");
  const [ingestTitle, setIngestTitle] = useState("");
  const [ingestSummary, setIngestSummary] = useState("");
  const [ingestPublishedAt, setIngestPublishedAt] = useState("");
  const [ingestLanguage, setIngestLanguage] = useState<"ar" | "en">("ar");

  const pendingNewsQuery = useAdminPendingNews({
    page,
    limit: 12,
    ...(langFilter !== "all" ? { language: langFilter as "ar" | "en" } : {}),
    ...(sourceUrl.trim() ? { sourceUrl: sourceUrl.trim() } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  });
  const ingestNewsMutation = useIngestNews();

  // Same lifecycle mutations AdminMedicalContentPage uses — a pending news
  // item is a NEWS-type `content` document, not a separate module, so it
  // moves through DRAFT → IN_REVIEW → PUBLISHED → ARCHIVED via the same
  // POST /admin/content/:id/... endpoints.
  const submitReviewMutation = useSubmitContentReview();
  const approveMutation = useApproveContent();
  const rejectMutation = useRejectContent();
  const publishMutation = usePublishContent();
  const archiveMutation = useArchiveContent();
  const actionBusy =
    submitReviewMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    publishMutation.isPending ||
    archiveMutation.isPending;

  const actionSuccessToast = useMemo((): ConfirmSuccessToast | undefined => {
    if (!actionConfirm) return undefined;
    const { kind } = actionConfirm;
    if (kind === "submitReview") {
      return {
        title: t("admin.medicalNewsQueue.toast.done"),
        message: t("admin.medicalNewsQueue.toast.submitReview"),
        variant: "success",
      };
    }
    if (kind === "approve") {
      return {
        title: t("admin.medicalNewsQueue.toast.approved"),
        message: t("admin.medicalNewsQueue.toast.approveMessage"),
        variant: "success",
      };
    }
    if (kind === "publish") {
      return {
        title: t("admin.medicalNewsQueue.toast.published"),
        message: t("admin.medicalNewsQueue.toast.publishMessage"),
        variant: "success",
      };
    }
    return {
      title: t("admin.medicalNewsQueue.toast.archived"),
      message: t("admin.medicalNewsQueue.toast.archiveMessage"),
      variant: "success",
    };
  }, [actionConfirm, t]);

  async function confirmReject(reason: string) {
    if (!rejectTarget?._id) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectTarget._id, reason });
      toast(t("admin.medicalNewsQueue.toast.rejected"), {
        title: t("admin.medicalNewsQueue.toast.done"),
        variant: "success",
      });
      setRejectOpen(false);
      setRejectTarget(null);
    } catch {
      /* dialog stays open */
    }
  }

  const pendingItems = pendingNewsQuery.items;
  const pendingTotal = pendingNewsQuery.data?.total ?? pendingItems.length;
  const currentPage = Math.max(1, pendingNewsQuery.data?.page ?? page);
  const pageSize = Math.max(1, pendingNewsQuery.data?.limit ?? 12);
  const totalPages = Math.max(1, Math.ceil(pendingTotal / pageSize));
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  const rangeStart = pendingTotal === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd =
    pendingTotal === 0 ? 0 : Math.min(currentPage * pageSize, pendingTotal);
  const visibleItems = useMemo(() => pendingItems, [pendingItems]);
  const hasActiveFilters =
    langFilter !== "all" ||
    sourceUrl.trim() !== "" ||
    dateFrom !== "" ||
    dateTo !== "";

  async function submitNewsIngest() {
    const normalizedSourceUrl = ingestSourceUrl.trim();
    const normalizedTitle = ingestTitle.trim();
    if (!normalizedSourceUrl || !normalizedTitle) {
      toast(t("admin.medicalNewsQueue.ingest.enterSourceUrlTitle"), {
        title: t("admin.medicalNewsQueue.ingest.missingData"),
        variant: "error",
      });
      return;
    }

    await ingestNewsMutation.mutateAsync({
      items: [
        {
          sourceUrl: normalizedSourceUrl,
          title: normalizedTitle,
          summary: ingestSummary.trim() || undefined,
          language: ingestLanguage,
          publishedAt: ingestPublishedAt || undefined,
        },
      ],
    });

    toast(t("admin.medicalNewsQueue.ingest.success"), {
      title: t("admin.medicalNewsQueue.ingest.added"),
      variant: "success",
    });
    setIngestOpen(false);
    setIngestSourceUrl("");
    setIngestTitle("");
    setIngestSummary("");
    setIngestPublishedAt("");
    setIngestLanguage("ar");
  }

  function openPreview(item: AdminContentDetailsItem) {
    if (!item._id) return;
    setViewingContentId(item._id);
    setViewOpen(true);
  }

  return (
    <>
      <Helmet>
        <title>{t("admin.medicalNewsQueue.page.title")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={t("admin.medicalNewsQueue.page.title")}
          subtitle={t("admin.medicalNewsQueue.disclaimer")}
          headerIcon={<Newspaper className="h-8 w-8 text-white" />}
          actionLabel={t("admin.medicalNewsQueue.ingestDialog.sendToQueue")}
          onActionClick={() => setIngestOpen(true)}
          kpiColumns={3}
          kpis={[
            {
              key: "pending",
              icon: <Newspaper className="h-5 w-5 shrink-0" />,
              value: pendingNewsQuery.isAwaitingData
                ? "…"
                : pendingTotal.toLocaleString(numberLocale),
              label: t("admin.medicalNewsQueue.kpi.pending"),
            },
            {
              key: "visible",
              icon: <Eye className="h-5 w-5 shrink-0" />,
              value: pendingNewsQuery.isAwaitingData
                ? "…"
                : visibleItems.length,
              label: t("admin.medicalNewsQueue.kpi.visible"),
            },
            {
              key: "language",
              icon: <LinkIcon className="h-5 w-5 shrink-0" />,
              value: langFilter === "all" ? "AR/EN" : langFilter.toUpperCase(),
              label: t("admin.medicalNewsQueue.kpi.languageScope"),
            },
          ]}
        />

        <section className="mt-4 rounded-[12px] border border-[#D6EEEC] bg-[#F3FBFA] px-6 py-4 shadow-[0_10px_24px_rgba(20,130,131,0.08)]">
          <div className="font-cairo text-[13px] font-extrabold text-[#0F766E]">
            {t("admin.medicalNewsQueue.disclaimer")}
          </div>
        </section>

        <section className="mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
                {t("admin.medicalNewsQueue.filters.title")}
              </div>
              <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                {t("admin.medicalNewsQueue.filters.description")}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void pendingNewsQuery.refetch()}
              disabled={pendingNewsQuery.isFetching}
              className="inline-flex h-[38px] shrink-0 items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#344054] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${pendingNewsQuery.isFetching ? "animate-spin" : ""}`}
              />
              {t("admin.medicalNewsQueue.refresh")}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-start">
              <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                Source URL
              </span>
              <input
                value={sourceUrl}
                onChange={(e) => {
                  setSourceUrl(e.target.value);
                  setPage(1);
                }}
                placeholder="https://example.com/news/..."
                dir="ltr"
                className="h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827] placeholder:text-[#98A2B3]"
              />
            </label>
            <label className="flex min-w-[160px] flex-1 flex-col gap-1 text-start">
              <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                {t("admin.medicalNewsQueue.fromDate")}
              </span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827]"
              />
            </label>
            <label className="flex min-w-[160px] flex-1 flex-col gap-1 text-start">
              <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                {t("admin.medicalNewsQueue.toDate")}
              </span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827]"
              />
            </label>
            <div className="shrink-0">
              <LanguageModeToggle
                value={langFilter}
                onChange={(next) => {
                  setLangFilter(next);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </section>

        {pendingNewsQuery.isRefetching && !pendingNewsQuery.isAwaitingData ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-[10px] border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2 font-cairo text-[12px] font-bold text-[#047857]">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {t("admin.medicalNewsQueue.refreshingQueue")}
          </div>
        ) : null}

        <section className="mt-5 space-y-3">
          {pendingNewsQuery.isAwaitingData ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {t("admin.medicalNewsQueue.loading")}
            </div>
          ) : pendingNewsQuery.isError ? (
            <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-8 text-center">
              <div className="font-cairo text-[13px] font-semibold text-[#B42318]">
                {t("admin.medicalNewsQueue.loadError")}
              </div>
              <button
                type="button"
                onClick={() => void pendingNewsQuery.refetch()}
                disabled={pendingNewsQuery.isRefetching}
                className="mt-4 inline-flex h-[36px] items-center gap-2 rounded-[10px] border border-[#FCA5A5] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#B42318] transition hover:bg-[#FFF5F5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${pendingNewsQuery.isRefetching ? "animate-spin" : ""}`}
                />
                {pendingNewsQuery.isRefetching
                  ? t("admin.medicalNewsQueue.retrying")
                  : t("admin.medicalNewsQueue.retry")}
              </button>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[#D0D5DD] bg-white px-6 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {hasActiveFilters
                ? t("admin.medicalNewsQueue.noMatches")
                : t("admin.medicalNewsQueue.noPending")}
            </div>
          ) : (
            visibleItems.map((item) => {
              const statusBadge = newsStatusBadge(item.status, t);
              return (
                <article
                  key={
                    item._id ??
                    `${item.slug ?? toDisplayText(item.title) ?? "pending"}-${item.updatedAt ?? ""}`
                  }
                  className="rounded-[14px] border border-[#EAECF0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-[#D0D5DD] hover:shadow-[0_6px_16px_rgba(16,24,40,0.08)] sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 flex-1 gap-4">
                      {item.coverImage ? (
                        <div className="hidden shrink-0 overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] sm:block sm:w-[140px] lg:w-[160px]">
                          <img
                            src={item.coverImage}
                            alt={
                              toDisplayText(item.title) ||
                              item.originalTitle ||
                              "news cover"
                            }
                            className="h-[100px] w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : null}

                      <div className="min-w-0 flex-1 text-start">
                        <div className="flex flex-wrap items-center justify-start gap-2">
                          <span
                            className={`inline-flex h-[22px] shrink-0 items-center justify-center rounded-[8px] border px-3 font-cairo text-[11px] font-extrabold ${statusBadge.className}`}
                          >
                            {statusBadge.label}
                          </span>
                          <span className="inline-flex h-[22px] shrink-0 items-center justify-center rounded-[8px] border border-[#D1FAE5] bg-[#ECFDF3] px-2.5 font-cairo text-[10px] font-extrabold text-[#027A48]">
                            {(item.language ?? "—").toUpperCase()}
                          </span>
                        </div>

                        <div className="mt-2.5 truncate font-cairo text-[15px] font-black text-[#101828]">
                          {toDisplayText(item.title) || "—"}
                        </div>
                        {item.originalTitle &&
                        item.originalTitle !== toDisplayText(item.title) ? (
                          <div className="mt-1 truncate font-cairo text-[12px] font-semibold text-[#98A2B3]">
                            {t("admin.medicalNewsQueue.originalTitle")}{" "}
                            {item.originalTitle}
                          </div>
                        ) : null}
                        <div className="mt-1.5 line-clamp-2 font-cairo text-[12px] font-semibold leading-6 text-[#667085]">
                          {item.summary ??
                            item.aiSummary ??
                            t("admin.medicalNewsQueue.noSummary")}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-dashed border-[#EEF2F6] pt-3 font-cairo text-[11.5px] font-bold text-[#667085]">
                          {item.sourceName ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Newspaper className="h-3.5 w-3.5 shrink-0 text-[#98A2B3]" />
                              {item.sourceName}
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-1.5">
                            <RefreshCw className="h-3.5 w-3.5 shrink-0 text-[#98A2B3]" />
                            {t("admin.medicalNewsQueue.lastUpdated")}{" "}
                            {formatContentDate(
                              item.updatedAt ?? item.createdAt,
                              locale,
                            )}
                          </span>
                          {item.publishedAt ? (
                            <span className="inline-flex items-center gap-1.5">
                              <ClipboardCheck className="h-3.5 w-3.5 shrink-0 text-[#98A2B3]" />
                              {t("admin.medicalNewsQueue.originallyPublished")}{" "}
                              {formatContentDate(item.publishedAt, locale)}
                            </span>
                          ) : null}
                          {item.pageVersion ? (
                            <span className="text-[#98A2B3]">
                              v{item.pageVersion}
                            </span>
                          ) : null}
                        </div>

                        {item.sources?.[0]?.url ? (
                          <a
                            href={item.sources[0].url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2.5 inline-flex max-w-full items-center gap-1.5 truncate font-cairo text-[11px] font-bold text-primary hover:underline"
                          >
                            <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate" dir="ltr">
                              {item.sources[0].url}
                            </span>
                          </a>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[#EEF2F6] pt-3 lg:border-t-0 lg:border-s lg:ps-4 lg:pt-0">
                      {item.status === "DRAFT" && item._id ? (
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() =>
                            setActionConfirm({
                              kind: "submitReview",
                              id: item._id as string,
                              title: toDisplayText(item.title) || "—",
                            })
                          }
                          className="inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] px-3 font-cairo text-[12px] font-extrabold text-[#475467] transition hover:bg-[#F9FAFB] disabled:opacity-50"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                          {t("admin.medicalNewsQueue.sendForReview")}
                        </button>
                      ) : null}
                      {item.status === "IN_REVIEW" && item._id ? (
                        <>
                          <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() =>
                              setActionConfirm({
                                kind: "approve",
                                id: item._id as string,
                                title: toDisplayText(item.title) || "—",
                              })
                            }
                            className="inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#BBF7D0] bg-[#F6FEF9] px-3 font-cairo text-[12px] font-extrabold text-[#16A34A] transition hover:bg-[#ECFDF3] disabled:opacity-50"
                          >
                            <Check className="h-4 w-4" />
                            {t("admin.medicalNewsQueue.approve")}
                          </button>
                          <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => {
                              setRejectTarget(item);
                              setRejectOpen(true);
                            }}
                            className="inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#FECACA] bg-[#FFFBFA] px-3 font-cairo text-[12px] font-extrabold text-[#EF4444] transition hover:bg-[#FEF2F2] disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                            {t("admin.medicalNewsQueue.reject")}
                          </button>
                          <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() =>
                              setActionConfirm({
                                kind: "publish",
                                id: item._id as string,
                                title: toDisplayText(item.title) || "—",
                              })
                            }
                            className="inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#67E8F9] bg-[#F0FDFF] px-3 font-cairo text-[12px] font-extrabold text-[#0891B2] transition hover:bg-[#ECFEFF] disabled:opacity-50"
                          >
                            <ShieldCheck className="h-4 w-4" />
                            {t("admin.medicalNewsQueue.publish")}
                          </button>
                        </>
                      ) : null}
                      {item.status === "PUBLISHED" && item._id ? (
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() =>
                            setActionConfirm({
                              kind: "archive",
                              id: item._id as string,
                              title: toDisplayText(item.title) || "—",
                            })
                          }
                          className="inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#BFDBFE] bg-[#F5FAFF] px-3 font-cairo text-[12px] font-extrabold text-[#1D4ED8] transition hover:bg-[#EFF6FF] disabled:opacity-50"
                        >
                          <Archive className="h-4 w-4" />
                          {t("admin.medicalNewsQueue.archive")}
                        </button>
                      ) : null}

                      <div className="mx-1 hidden h-[24px] w-px shrink-0 bg-[#EAECF0] sm:block" />

                      {item._id ? (
                        <button
                          type="button"
                          onClick={() => openPreview(item)}
                          className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-[#1D4ED8] transition hover:bg-[#EFF6FF]"
                          aria-label={t("admin.medicalNewsQueue.preview")}
                          title={t("admin.medicalNewsQueue.preview")}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setIngestOpen(true)}
                        className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-[#15803D] transition hover:bg-[#ECFDF3]"
                        aria-label={t("admin.medicalNewsQueue.newIngest")}
                        title={t("admin.medicalNewsQueue.newIngest")}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {!pendingNewsQuery.isAwaitingData &&
        !pendingNewsQuery.isError &&
        pendingTotal > 0 ? (
          <section className="mt-4">
            <div className="flex flex-col gap-3 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div className="text-start font-cairo text-[12px] font-semibold text-[#667085]">
                {t("admin.medicalNewsQueue.pagination.showing")}{" "}
                {rangeStart.toLocaleString(numberLocale)}–
                {rangeEnd.toLocaleString(numberLocale)}{" "}
                {t("admin.medicalNewsQueue.pagination.of")}{" "}
                {pendingTotal.toLocaleString(numberLocale)}{" "}
                {t("admin.medicalNewsQueue.pagination.news")} ·{" "}
                {t("admin.medicalNewsQueue.pagination.page")}{" "}
                {currentPage.toLocaleString(numberLocale)} /{" "}
                {totalPages.toLocaleString(numberLocale)}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (canPrev) setPage((prev) => Math.max(1, prev - 1));
                  }}
                  disabled={!canPrev || pendingNewsQuery.isFetching}
                  className="inline-flex h-[34px] items-center gap-1 rounded-[8px] border border-[#EAECF0] bg-white px-3 font-cairo text-[12px] font-bold text-[#344054] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                  {t("admin.medicalNewsQueue.pagination.previous")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (canNext)
                      setPage((prev) => Math.min(totalPages, prev + 1));
                  }}
                  disabled={!canNext || pendingNewsQuery.isFetching}
                  className="inline-flex h-[34px] items-center gap-1 rounded-[8px] border border-[#EAECF0] bg-white px-3 font-cairo text-[12px] font-bold text-[#344054] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("admin.medicalNewsQueue.pagination.next")}
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <MedicalContentViewDialog
          open={viewOpen}
          onOpenChange={(next) => {
            setViewOpen(next);
            if (!next) setViewingContentId(null);
          }}
          contentId={viewingContentId}
          workflowRole="admin"
        />

        <ConfirmActionDialog
          open={ingestOpen}
          onOpenChange={(open) => {
            if (!ingestNewsMutation.isPending) setIngestOpen(open);
          }}
          variant="primary"
          title={t("admin.medicalNewsQueue.ingestDialog.title")}
          description={
            <div className="grid grid-cols-1 gap-3 text-start">
              <label className="flex flex-col gap-1">
                <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                  Source URL
                </span>
                <input
                  value={ingestSourceUrl}
                  onChange={(e) => setIngestSourceUrl(e.target.value)}
                  placeholder="https://example.com/news/..."
                  dir="ltr"
                  className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827] placeholder:text-[#98A2B3]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                  {t("admin.medicalNewsQueue.ingestDialog.titleLabel")}
                </span>
                <input
                  value={ingestTitle}
                  onChange={(e) => setIngestTitle(e.target.value)}
                  placeholder={t(
                    "admin.medicalNewsQueue.ingestDialog.newsTitle",
                  )}
                  className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827] placeholder:text-[#98A2B3]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                  {t("admin.medicalNewsQueue.ingestDialog.summary")}
                </span>
                <textarea
                  value={ingestSummary}
                  onChange={(e) => setIngestSummary(e.target.value)}
                  rows={3}
                  placeholder={t(
                    "admin.medicalNewsQueue.ingestDialog.optionalSummary",
                  )}
                  className="rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 font-cairo text-[12px] font-semibold text-[#111827] placeholder:text-[#98A2B3]"
                />
              </label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                    {t("admin.medicalNewsQueue.ingestDialog.language")}
                  </span>
                  <select
                    value={ingestLanguage}
                    onChange={(e) =>
                      setIngestLanguage(e.target.value as "ar" | "en")
                    }
                    className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827]"
                  >
                    <option value="ar">ar</option>
                    <option value="en">en</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                    {t("admin.medicalNewsQueue.ingestDialog.publishDate")}
                  </span>
                  <input
                    type="datetime-local"
                    value={ingestPublishedAt}
                    onChange={(e) => setIngestPublishedAt(e.target.value)}
                    className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827]"
                  />
                </label>
              </div>
            </div>
          }
          confirmLabel={
            ingestNewsMutation.isPending
              ? t("admin.medicalNewsQueue.ingestDialog.submitting")
              : t("admin.medicalNewsQueue.ingestDialog.sendToQueue")
          }
          confirmDisabled={ingestNewsMutation.isPending}
          onConfirm={submitNewsIngest}
        />

        <ConfirmActionDialog
          open={actionConfirm !== null}
          onOpenChange={(open) => {
            if (!open) setActionConfirm(null);
          }}
          variant={
            actionConfirm?.kind === "archive" ? "destructive" : "primary"
          }
          title={
            !actionConfirm
              ? "—"
              : actionConfirm.kind === "submitReview"
                ? t("admin.medicalNewsQueue.confirmDialog.submitReview")
                : actionConfirm.kind === "approve"
                  ? t("admin.medicalNewsQueue.confirmDialog.approve")
                  : actionConfirm.kind === "publish"
                    ? t("admin.medicalNewsQueue.confirmDialog.publish")
                    : t("admin.medicalNewsQueue.confirmDialog.archive")
          }
          icon={
            actionConfirm ? (
              actionConfirm.kind === "archive" ? (
                <Archive className="h-6 w-6" strokeWidth={2} aria-hidden />
              ) : actionConfirm.kind === "publish" ? (
                <ShieldCheck className="h-6 w-6" strokeWidth={2} aria-hidden />
              ) : actionConfirm.kind === "approve" ? (
                <Check className="h-6 w-6" strokeWidth={2} aria-hidden />
              ) : (
                <ClipboardCheck
                  className="h-6 w-6"
                  strokeWidth={2}
                  aria-hidden
                />
              )
            ) : undefined
          }
          description={
            actionConfirm ? (
              <>
                {t("admin.medicalNewsQueue.confirmDialog.title")} «
                <span className="font-extrabold text-[#344054]">
                  {actionConfirm.title}
                </span>
                ».
              </>
            ) : (
              "—"
            )
          }
          confirmLabel={
            !actionConfirm
              ? "—"
              : actionConfirm.kind === "submitReview"
                ? t("admin.medicalNewsQueue.confirmDialog.send")
                : actionConfirm.kind === "approve"
                  ? t("admin.medicalNewsQueue.confirmDialog.approveButton")
                  : actionConfirm.kind === "publish"
                    ? t("admin.medicalNewsQueue.confirmDialog.publishButton")
                    : t("admin.medicalNewsQueue.confirmDialog.archiveButton")
          }
          confirmDisabled={actionBusy}
          onConfirm={async () => {
            if (!actionConfirm) return;
            const { kind, id } = actionConfirm;
            if (kind === "submitReview") {
              const details = extractContentDetails(
                await adminApi.content.getById(id),
              );
              const issueCodes = getReviewReadinessIssueCodes(details);
              if (issueCodes.length > 0) {
                const language = locale === "en" ? "en" : "ar";
                const blockingMessages = issueCodes.map((code) =>
                  getReviewReadinessIssueMessage(code, language),
                );
                setActionConfirm(null);
                toast(
                  t("admin.medicalNewsQueue.reviewReadinessError").replace(
                    "{messages}",
                    blockingMessages.join("\n- "),
                  ),
                  {
                    title: t("admin.medicalNewsQueue.governanceMissing"),
                    variant: "error",
                  },
                );
                openPreview({ _id: id } as AdminContentDetailsItem);
                throw new Error("review_readiness_required");
              }
              await submitReviewMutation.mutateAsync({
                id,
                reviewNotes: t("admin.medicalNewsQueue.sentFromQueue"),
              });
            } else if (kind === "approve" || kind === "publish") {
              const details = extractContentDetails(
                await adminApi.content.getById(id),
              );
              const snapshot = buildReleaseAcceptanceFromDetails(
                details,
                "admin",
              );
              if (!snapshot || !isApprovePublishPathReady(snapshot)) {
                const incomplete = snapshot
                  ? getIncompleteAcceptanceChecks(snapshot)
                  : [];
                const language = locale === "en" ? "en" : "ar";
                const blockingMessages = incomplete.length
                  ? incomplete.map((item) =>
                      localizeAcceptanceCopy(item.label, language),
                    )
                  : [t("admin.medicalNewsQueue.releaseAcceptanceError")];
                setActionConfirm(null);
                toast(
                  t("admin.medicalNewsQueue.approvePublishError")
                    .replace(
                      "{action}",
                      kind === "approve"
                        ? t("admin.medicalNewsQueue.approve")
                        : t("admin.medicalNewsQueue.publish"),
                    )
                    .replace("{messages}", blockingMessages.join("\n- ")),
                  {
                    title: t("admin.medicalNewsQueue.approvalGateIncomplete"),
                    variant: "error",
                  },
                );
                openPreview({ _id: id } as AdminContentDetailsItem);
                throw new Error("approve_publish_readiness_required");
              }
              if (kind === "approve") {
                await approveMutation.mutateAsync(id);
              } else {
                await publishMutation.mutateAsync(id);
              }
            } else {
              await archiveMutation.mutateAsync(id);
            }
            void pendingNewsQuery.refetch();
          }}
          successToast={actionSuccessToast}
        />

        <ContentRejectDialog
          open={rejectOpen}
          onOpenChange={(o) => {
            setRejectOpen(o);
            if (!o) setRejectTarget(null);
          }}
          contentTitle={toDisplayText(rejectTarget?.title) || "—"}
          onConfirm={async (reason) => {
            await confirmReject(reason);
            void pendingNewsQuery.refetch();
          }}
          isPending={rejectMutation.isPending}
        />
      </div>
    </>
  );
}
