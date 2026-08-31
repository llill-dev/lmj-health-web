import { Helmet } from "react-helmet-async";
import {
  Eye,
  Archive,
  Check,
  X,
  Search,
  BookOpen,
  FileText,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Link as LinkIcon,
} from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import MedicalContentViewDialog from "@/components/admin/medical-content/dialogs/MedicalContentViewDialog";
import { toDisplayText } from "@/components/admin/medical-content/contentListUtils";
import {
  CreateAdminContentDialog,
  EditAdminContentDialog,
  ContentRejectDialog,
  ReleaseAcceptanceCatalogPanel,
} from "@/components/admin/medical-content";
import { AdminContentTypeFilterBar } from "@/components/admin/medical-content/AdminContentTypeFilterBar";
import { AdminContentStatusFilterBar } from "@/components/admin/medical-content/AdminContentStatusFilterBar";
import { AdminContentListItem } from "@/components/admin/medical-content/AdminContentListItem";
import { AdminContentPaginationFooter } from "@/components/admin/medical-content/AdminContentPaginationFooter";
import {
  ConfirmActionDialog,
  type ConfirmSuccessToast,
} from "@/components/admin/dialogs";
import { useToast } from "@/components/ui/ToastProvider";
import {
  useAdminContentList,
  useAdminMyContentList,
  useApproveContent,
  useArchiveContent,
  usePublishContent,
  useRejectContent,
  useSubmitContentReview,
} from "@/hooks/admin/content/useAdminContent";
import { useAdminContentStatusCounts } from "@/hooks/admin/content/useAdminContentStatusCounts";
import type {
  AdminContentDetailsItem,
  AdminContentDetailsResponse,
  AdminContentItem,
  AdminContentStatus,
  AdminContentType,
} from "@/lib/admin/types";
import { adminApi } from "@/lib/admin/client";
import LanguageModeToggle from "@/components/admin/medical-content/LanguageModeToggle";
import { MedicalContentRowSkeleton } from "@/components/admin/skeletons/MedicalContentRowSkeleton";
import { SkeletonList } from "@/components/admin/skeletons/SkeletonList";
import { useI18n } from "@/i18n/provider";
import {
  buildReleaseAcceptanceFromDetails,
  getIncompleteAcceptanceChecks,
  isApprovePublishPathReady,
  localizeAcceptanceCopy,
} from "@/components/admin/medical-content/releaseAcceptanceMatrix";
import {
  buildVisiblePageNumbers,
  clampPage,
  isMineStatusFilter,
  normalizeContentItems,
  normalizeItemLanguage,
  PAGE_SIZE,
  resolvePagedLimit,
  resolvePagedPage,
  parseTypeQueryParam,
  resolvePagedTotal,
  textSearchMatch,
  type LangFilter,
  type UiContentStatus,
} from "@/components/admin/medical-content/contentListUtils";
import {
  countValidContentSources,
  getReviewReadinessIssueCodes,
  type ReviewReadinessIssueCode,
} from "@/components/admin/medical-content/dialogs/medicalContentDialogHelpers";

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

function getSubmitReviewBlockingMessages(
  t: (key: string) => string,
  issueCodes: ReviewReadinessIssueCode[],
): string[] {
  return issueCodes.map((code) => {
    if (code === "sources_required") {
      return t("admin.medicalContent.validation.sourcesRequired");
    }
    if (code === "disclaimer_required") {
      return t("admin.medicalContent.validation.disclaimerRequired");
    }
    if (code === "seek_help_required") {
      return t("admin.medicalContent.validation.seekHelpRequired");
    }
    if (code === "blocks_required") {
      return t("admin.medicalContent.validation.blocksRequired");
    }
    if (code === "news_source_url_required") {
      return t("admin.medicalContent.validation.newsSourceUrlRequired");
    }
    return t("admin.medicalContent.validation.newsPublishedAtRequired");
  });
}

export default function AdminMedicalContentPage() {
  const { t, locale, dir } = useI18n();
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";

  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [activeStatus, setActiveStatus] = useState<UiContentStatus>("all");
  const [langFilter, setLangFilter] = useState<LangFilter>("all");

  const activeType = useMemo(
    () => parseTypeQueryParam(searchParams.get("type")),
    [searchParams],
  );

  const setTypeFilter = useCallback(
    (next: "all" | AdminContentType) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          if (next === "all") p.delete("type");
          else p.set("type", next);
          return p;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );
  const [page, setPage] = useState(1);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<AdminContentItem | null>(
    null,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingContentId, setViewingContentId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [actionConfirm, setActionConfirm] = useState<{
    kind: "submitReview" | "approve" | "publish" | "archive";
    id: string;
    title: string;
  } | null>(null);

  const contentActionSuccessToast = useMemo(():
    | ConfirmSuccessToast
    | undefined => {
    if (!actionConfirm) return undefined;
    const { kind } = actionConfirm;
    if (kind === "submitReview") {
      return {
        title: t("admin.medicalContent.toast.done"),
        message: t("admin.medicalContent.toast.submitReview"),
        variant: "success",
      };
    }
    if (kind === "approve") {
      return {
        title: t("admin.medicalContent.toast.approved"),
        message: t("admin.medicalContent.toast.approveMessage"),
        variant: "success",
      };
    }
    if (kind === "publish") {
      return {
        title: t("admin.medicalContent.toast.published"),
        message: t("admin.medicalContent.toast.publishMessage"),
        variant: "success",
      };
    }
    return {
      title: t("admin.medicalContent.toast.archived"),
      message: t("admin.medicalContent.toast.archiveMessage"),
      variant: "success",
    };
  }, [actionConfirm, t]);

  useEffect(() => {
    if (searchParams.get("queue") === "review") {
      setActiveStatus("in_review");
    }
  }, [searchParams]);

  const statusToApi = useMemo<
    Partial<Record<UiContentStatus, AdminContentStatus>>
  >(
    () => ({
      published: "PUBLISHED",
      in_review: "IN_REVIEW",
      draft: "DRAFT",
      archived: "ARCHIVED",
    }),
    [],
  );

  const adminListParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(activeType !== "all" ? { type: activeType } : {}),
      ...(activeStatus !== "all"
        ? { status: statusToApi[activeStatus] as AdminContentStatus }
        : {}),
      ...(langFilter !== "all" ? { language: langFilter as "ar" | "en" } : {}),
    }),
    [page, activeType, activeStatus, langFilter, statusToApi],
  );

  const myListParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(activeStatus !== "all" && isMineStatusFilter(activeStatus)
        ? { status: statusToApi[activeStatus] as AdminContentStatus }
        : {}),
    }),
    [page, activeStatus, statusToApi],
  );

  const contentQuery = showMineOnly
    ? useAdminMyContentList(myListParams)
    : useAdminContentList(adminListParams);
  const statusCounts = useAdminContentStatusCounts();

  const submitReviewMutation = useSubmitContentReview();
  const approveMutation = useApproveContent();
  const rejectMutation = useRejectContent();
  const publishMutation = usePublishContent();
  const archiveMutation = useArchiveContent();

  const items = useMemo<AdminContentItem[]>(
    () => normalizeContentItems(contentQuery.data),
    [contentQuery.data],
  );

  /** تصفية لغة داخل الصفحة إذا أعاد السيرفر قيماً غير متوافقة مع ar/en */
  const itemsByType = useMemo(() => {
    if (activeType === "all") return items;
    return items.filter((it) => it.type === activeType);
  }, [items, activeType]);

  const itemsByLang = useMemo(() => {
    if (langFilter === "all") return itemsByType;
    return itemsByType.filter(
      (it) => normalizeItemLanguage(it.language) === langFilter,
    );
  }, [itemsByType, langFilter]);

  const serverTotal = resolvePagedTotal(contentQuery.data, itemsByLang.length);
  const serverLimit = resolvePagedLimit(contentQuery.data, PAGE_SIZE);
  const totalPages =
    serverTotal > 0 ? Math.max(1, Math.ceil(serverTotal / serverLimit)) : 0;
  const currentPage =
    totalPages > 0
      ? clampPage(resolvePagedPage(contentQuery.data, page), totalPages)
      : 1;

  const filteredItems = useMemo(() => {
    const text = query.trim();
    if (!text) return itemsByLang;
    return itemsByLang.filter((it) => {
      const title = toDisplayText(it.title);
      const summary = String(it.summary ?? "");
      const slug = String(it.slug ?? "");
      return (
        textSearchMatch(title, text) ||
        textSearchMatch(summary, text) ||
        textSearchMatch(slug, text)
      );
    });
  }, [itemsByLang, query]);

  const pageViews = useMemo(
    () =>
      filteredItems.reduce(
        (acc, it) => acc + Number(it.viewCount ?? it.views ?? 0),
        0,
      ),
    [filteredItems],
  );

  const paginationRange = useMemo(() => {
    if (serverTotal <= 0) return { start: 0, end: 0 };
    const start = (currentPage - 1) * serverLimit + 1;
    const end = Math.min(currentPage * serverLimit, serverTotal);
    return { start, end };
  }, [serverTotal, currentPage, serverLimit]);

  const visiblePageNumbers = useMemo(
    () => buildVisiblePageNumbers(currentPage, totalPages, 7),
    [currentPage, totalPages],
  );

  const showPaginationBar =
    !contentQuery.isAwaitingData && !contentQuery.isError && serverTotal > 0;

  useEffect(() => {
    setPage(1);
  }, [activeType, activeStatus, langFilter]);

  useEffect(() => {
    if (contentQuery.isAwaitingData) return;
    if (totalPages === 0) {
      if (page !== 1) setPage(1);
      return;
    }
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [contentQuery.isAwaitingData, totalPages, page, currentPage]);

  useEffect(() => {
    if (showMineOnly && !isMineStatusFilter(activeStatus)) {
      setActiveStatus("all");
    }
  }, [showMineOnly, activeStatus]);

  async function confirmReject(reason: string) {
    if (!rejectTarget) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectTarget._id, reason });
      toast(t("admin.medicalContent.toast.rejected"), {
        title: t("admin.medicalContent.toast.done"),
        variant: "success",
      });
      setRejectOpen(false);
      setRejectTarget(null);
    } catch {
      /* يبقى الحوار */
    }
  }

  const actionBusy =
    submitReviewMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    publishMutation.isPending ||
    archiveMutation.isPending;

  function handleSubmitReview(item: AdminContentItem) {
    setActionConfirm({
      kind: "submitReview",
      id: item._id,
      title: toDisplayText(item.title) || "—",
    });
  }

  function handleApprove(item: AdminContentItem) {
    setActionConfirm({
      kind: "approve",
      id: item._id,
      title: toDisplayText(item.title) || "—",
    });
  }

  function handlePublish(item: AdminContentItem) {
    setActionConfirm({
      kind: "publish",
      id: item._id,
      title: toDisplayText(item.title) || "—",
    });
  }

  function handleArchive(item: AdminContentItem) {
    setActionConfirm({
      kind: "archive",
      id: item._id,
      title: toDisplayText(item.title) || "—",
    });
  }

  function handleReject(item: AdminContentItem) {
    setRejectTarget(item);
    setRejectOpen(true);
  }

  function handleEdit(item: AdminContentItem) {
    setEditingContentId(item._id);
    setEditOpen(true);
  }

  function handleView(item: AdminContentItem) {
    setViewingContentId(item._id);
    setViewOpen(true);
  }

  return (
    <>
      <Helmet>
        <title>
          {activeType === "NEWS"
            ? t("admin.medicalContent.page.title.news")
            : t("admin.medicalContent.page.title.content")}
        </title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={t("admin.medicalContent.page.title")}
          subtitle={
            activeType === "NEWS"
              ? t("admin.medicalContent.subtitle.news")
              : t("admin.medicalContent.subtitle.content")
          }
          headerIcon={<BookOpen className="h-8 w-8 text-white" />}
          actionLabel={t("admin.medicalContent.actionLabel")}
          onActionClick={() => setCreateOpen(true)}
          kpiColumns={5}
          kpis={[
            {
              key: "views",
              icon: <Eye className="h-5 w-5 shrink-0" />,
              value: pageViews.toLocaleString(numberLocale),
              label: t("admin.medicalContent.kpi.pageViews"),
            },
            {
              key: "draft",
              icon: <FileText className="h-5 w-5 shrink-0" />,
              value: statusCounts.isAwaitingData ? "…" : statusCounts.draft,
              label: t("admin.medicalContent.kpi.drafts"),
            },
            {
              key: "review",
              icon: <Clock className="h-5 w-5 shrink-0" />,
              value: statusCounts.isAwaitingData ? "…" : statusCounts.inReview,
              label: t("admin.medicalContent.kpi.inReview"),
            },
            {
              key: "published",
              icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
              value: statusCounts.isAwaitingData ? "…" : statusCounts.published,
              label: t("admin.medicalContent.kpi.published"),
            },
            {
              key: "all",
              icon: <BookOpen className="h-5 w-5 shrink-0" />,
              value: statusCounts.isAwaitingData ? "…" : statusCounts.all,
              label: t("admin.medicalContent.kpi.systemTotal"),
            },
          ]}
        />

        <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] px-4 py-3 text-start">
          <LinkIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#175CD3]" />
          <div className="font-cairo text-[12px] font-bold leading-6 text-[#175CD3]">
            {t("admin.medicalContent.disclaimer")}
          </div>
        </div>

        <ReleaseAcceptanceCatalogPanel
          language={locale === "en" ? "en" : "ar"}
          role="admin"
          defaultOpen={false}
        />

        <section className="mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 w-full min-w-0 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 min-w-0">
              <input
                placeholder={t("admin.medicalContent.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-white ps-12 pe-4 text-start font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]"
              />
              <div className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                <Search className="w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <label className="inline-flex h-[44px] cursor-pointer select-none items-center justify-end gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#FAFBFC] px-4 font-cairo text-[12px] font-bold text-[#344054]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#D0D5DD] text-primary focus:ring-primary/40"
                  checked={showMineOnly}
                  onChange={(event) => {
                    setShowMineOnly(event.target.checked);
                    setPage(1);
                  }}
                />
                {t("admin.medicalContent.myContentOnly")}
              </label>
              <LanguageModeToggle value={langFilter} onChange={setLangFilter} />
            </div>
          </div>

          <div className="mt-5 font-cairo text-[11px] font-extrabold text-[#98A2B3]">
            {t("admin.medicalContent.contentType")}
          </div>
          <div className="mt-3 rounded-[10px] border border-[#D5E8E6] bg-[#F8FFFE] px-4 py-3">
            <div className="font-cairo text-[12px] font-extrabold text-[#0F766E]">
              {showMineOnly
                ? t("admin.medicalContent.workflow.myContentMode")
                : t("admin.medicalContent.workflow.approvedWorkflow")}
            </div>
            <div className="mt-1 font-cairo text-[11px] font-semibold text-[#5B7B79]">
              {t("admin.medicalContent.workflow.checkCreator")}
            </div>
            <div className="mt-2 font-cairo text-[11px] font-bold text-[#0F766E]">
              {t("admin.medicalContent.workflow.releaseAcceptance")}
            </div>
          </div>
          <AdminContentTypeFilterBar
            activeType={activeType}
            onChange={setTypeFilter}
          />

          <div className="mt-4 font-cairo text-[11px] font-extrabold text-[#98A2B3]">
            {t("admin.medicalContent.publishStatus")}
          </div>
          <AdminContentStatusFilterBar
            activeStatus={activeStatus}
            onChange={setActiveStatus}
            showMineOnly={showMineOnly}
          />
        </section>

        <section className="mt-5 rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
            <div className="flex flex-wrap gap-2 items-center">
              <BookOpen className="w-4 h-4 text-primary" />
              <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
                {t("admin.medicalContent.medicalContent")}
              </div>
              <span className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 font-cairo text-[11px] font-extrabold text-[#667085]">
                {query.trim()
                  ? `${filteredItems.length.toLocaleString(numberLocale)} ${t("admin.medicalContent.localMatches")}`
                  : `${serverTotal.toLocaleString(numberLocale)} ${t("admin.medicalContent.recordsServer")}`}
                {showPaginationBar && totalPages > 0
                  ? ` · ${t("admin.medicalContent.pageLabel")} ${currentPage.toLocaleString(numberLocale)} / ${totalPages.toLocaleString(numberLocale)}`
                  : ""}
              </span>
            </div>
          </div>

          <div
            className={
              filteredItems.length > 0 &&
              !contentQuery.isAwaitingData &&
              !contentQuery.isError
                ? "flex flex-col gap-3 bg-[#FAFBFC] p-4 sm:p-5"
                : ""
            }
          >
            {contentQuery.isAwaitingData ? (
              <SkeletonList
                count={8}
                SkeletonComponent={MedicalContentRowSkeleton}
              />
            ) : contentQuery.isError ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF2F2] text-[#B42318]">
                  <X className="h-5 w-5" />
                </div>
                <p className="mt-3 font-cairo text-[13px] font-extrabold text-[#B42318]">
                  {t("admin.medicalContent.loadError")}
                </p>
                <p className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                  {t("admin.medicalContent.checkFilters")}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void contentQuery.refetch();
                  }}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#FECACA] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#B42318]"
                >
                  <Clock className="h-4 w-4" />
                  {t("admin.medicalContent.retry")}
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F4F7] text-[#98A2B3]">
                  <Search className="h-5 w-5" />
                </div>
                <p className="mt-3 font-cairo text-[13px] font-extrabold text-[#344054]">
                  {query.trim()
                    ? t("admin.medicalContent.noMatches")
                    : t("admin.medicalContent.noItemsMatch")}
                </p>
                <p className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                  {query.trim()
                    ? t("admin.medicalContent.searchPageOnly")
                    : t("admin.medicalContent.adjustSearch")}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setShowMineOnly(false);
                    setActiveStatus("all");
                    setLangFilter("all");
                    setTypeFilter("all");
                    setPage(1);
                  }}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054]"
                >
                  <X className="h-4 w-4" />
                  {t("admin.medicalContent.clearFilters")}
                </button>
              </div>
            ) : (
              filteredItems.map((it) => (
                <AdminContentListItem
                  key={it._id}
                  item={it}
                  showMineOnly={showMineOnly}
                  actionBusy={actionBusy}
                  numberLocale={numberLocale}
                  onSubmitReview={handleSubmitReview}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onPublish={handlePublish}
                  onArchive={handleArchive}
                  onEdit={handleEdit}
                  onView={handleView}
                />
              ))
            )}
          </div>

          {showPaginationBar ? (
            <AdminContentPaginationFooter
              paginationRange={paginationRange}
              serverTotal={serverTotal}
              hasQueryFilter={Boolean(query.trim())}
              currentPage={currentPage}
              totalPages={totalPages}
              visiblePageNumbers={visiblePageNumbers}
              onPage={setPage}
              numberLocale={numberLocale}
            />
          ) : null}
        </section>

        <div className="h-8" />
      </div>
      <MedicalContentViewDialog
        open={viewOpen}
        onOpenChange={(next) => {
          setViewOpen(next);
          if (!next) setViewingContentId(null);
        }}
        contentId={viewingContentId}
        workflowRole="admin"
      />

      <EditAdminContentDialog
        open={editOpen}
        onOpenChange={(next) => {
          setEditOpen(next);
          if (!next) setEditingContentId(null);
        }}
        contentId={editingContentId}
        workflowRole="admin"
      />

      <ConfirmActionDialog
        open={actionConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setActionConfirm(null);
        }}
        variant={actionConfirm?.kind === "archive" ? "destructive" : "primary"}
        title={
          !actionConfirm
            ? "—"
            : actionConfirm.kind === "submitReview"
              ? t("admin.medicalContent.confirmSubmitReview")
              : actionConfirm.kind === "approve"
                ? t("admin.medicalContent.confirmApprove")
                : actionConfirm.kind === "publish"
                  ? t("admin.medicalContent.confirmPublish")
                  : t("admin.medicalContent.confirmArchive")
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
              <ClipboardCheck className="h-6 w-6" strokeWidth={2} aria-hidden />
            )
          ) : undefined
        }
        description={
          actionConfirm ? (
            <>
              {t("admin.medicalContent.titleLabel")} «
              <span className="font-extrabold text-[#344054]">
                {actionConfirm.title}
              </span>
              ».{" "}
              {actionConfirm.kind === "approve" ||
              actionConfirm.kind === "publish"
                ? t("admin.medicalContent.releaseAcceptanceVerify")
                : t("admin.medicalContent.actionServer")}
            </>
          ) : (
            "—"
          )
        }
        confirmLabel={
          !actionConfirm
            ? "—"
            : actionConfirm.kind === "submitReview"
              ? t("admin.medicalContent.send")
              : actionConfirm.kind === "approve"
                ? t("admin.medicalContent.approve")
                : actionConfirm.kind === "publish"
                  ? t("admin.medicalContent.publish")
                  : t("admin.medicalContent.archive")
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
              const blockingMessages = getSubmitReviewBlockingMessages(
                t,
                issueCodes,
              );
              setActionConfirm(null);
              toast(
                t("admin.medicalContent.reviewReadinessError").replace(
                  "{messages}",
                  blockingMessages.join("\n- "),
                ),
                {
                  title: t("admin.medicalContent.governanceMissing"),
                  variant: "error",
                },
              );
              setEditingContentId(id);
              setEditOpen(true);
              throw new Error("review_readiness_required");
            }
            await submitReviewMutation.mutateAsync({
              id,
              reviewNotes: t("admin.medicalContent.sentFromAdmin"),
            });
            setActiveStatus("all");
            setPage(1);
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                next.delete("queue");
                return next;
              },
              { replace: true },
            );
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
                : [t("admin.medicalContent.releaseAcceptanceError")];
              setActionConfirm(null);
              toast(
                t("admin.medicalContent.approvePublishError")
                  .replace(
                    "{action}",
                    kind === "approve"
                      ? t("admin.medicalContent.approve")
                      : t("admin.medicalContent.publish"),
                  )
                  .replace("{messages}", blockingMessages.join("\n- ")),
                {
                  title: t("admin.medicalContent.approvalGateIncomplete"),
                  variant: "error",
                },
              );
              setEditingContentId(id);
              setEditOpen(true);
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
        }}
        successToast={contentActionSuccessToast}
      />

      <ContentRejectDialog
        open={rejectOpen}
        onOpenChange={(o) => {
          setRejectOpen(o);
          if (!o) setRejectTarget(null);
        }}
        contentTitle={toDisplayText(rejectTarget?.title) || "—"}
        onConfirm={confirmReject}
        isPending={rejectMutation.isPending}
      />

      <CreateAdminContentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        workflowRole="admin"
      />
    </>
  );
}
