import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Pencil,
  Plus,
  Send,
  SquarePen,
  FileCheck2,
  Clock3,
  FilterX,
  UserRound,
  Workflow,
  AlertTriangle,
} from "lucide-react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import {
  CreateAdminContentDialog,
  EditAdminContentDialog,
} from "@/components/admin/medical-content";
import MedicalContentViewDialog from "@/components/admin/medical-content/dialogs/MedicalContentViewDialog";
import {
  clampPage,
  contentStatusLabel,
  contentTypeLabel,
  formatContentDate,
  getListReadinessSignal,
  isDataEntryWorkflowStatus,
  PAGE_SIZE,
  resolvePagedLimit,
  resolvePagedPage,
  resolvePagedTotal,
} from "@/components/admin/medical-content/contentListUtils";
import {
  getListAcceptanceScenarioChip,
  getNextWorkflowActions,
  localizeAcceptanceCopy,
} from "@/components/admin/medical-content/releaseAcceptanceMatrix";
import {
  useAdminMyContentList,
  useSubmitContentReview,
} from "@/hooks/admin/content/useAdminContent";
import StyledSelect from "@/components/ui/styled-select";
import type {
  AdminContentStatus,
  AdminContentListParams,
} from "@/lib/admin/types";
import { adminApi } from "@/lib/admin/client";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import { useToast } from "@/components/ui/ToastProvider";
import { useI18n } from "@/i18n/provider";
import {
  extractMedicalContentDetails,
  getReviewReadinessIssueCodes,
  type ReviewReadinessIssueCode,
} from "@/components/admin/medical-content/dialogs/medicalContentDialogHelpers";

function toDisplayText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const localized = obj.ar ?? obj.en ?? obj.title ?? obj.name ?? obj.value;
    if (typeof localized === "string") return localized;
  }
  return "";
}

function toActorName(
  value: string | { _id?: string; fullName?: string; email?: string } | undefined,
): string {
  if (typeof value === "string") return value || "—";
  if (!value) return "—";
  return value.fullName?.trim() || value.email?.trim() || value._id?.trim() || "—";
}

function contentWorkflowHint(
  status: AdminContentStatus,
  t: (key: string, fallback?: string) => string,
): string {
  if (status === "DRAFT") {
    return t(
      "dataEntry.medicalContent.workflow.draft",
      "مسودة قابلة للتعديل ولم تُرسل للمراجعة بعد.",
    );
  }
  if (status === "IN_REVIEW") {
    return t(
      "dataEntry.medicalContent.workflow.inReview",
      "أُرسلت للمراجعة وتنتظر قرار الإدارة.",
    );
  }
  return t(
    "dataEntry.medicalContent.workflow.other",
    "هذه الحالة لا تُعرض ضمن مسار (محتواي) الحالي.",
  );
}

function getBlockingMessages(
  t: (key: string, fallback?: string) => string,
  issueCodes: ReviewReadinessIssueCode[],
): string[] {
  return issueCodes.map((code) => {
    if (code === "sources_required") {
      return t(
        "dataEntry.medicalContent.reviewChecklist.sources",
        "Add at least one trusted source.",
      );
    }
    if (code === "disclaimer_required") {
      return t(
        "dataEntry.medicalContent.reviewChecklist.disclaimer",
        "Set the disclaimer version.",
      );
    }
    return t(
      "dataEntry.medicalContent.reviewChecklist.seekHelp",
      "Enable Seek Help Block for condition/symptom content.",
    );
  });
}

export default function DataEntryMedicalContentPage() {
  const { toast } = useToast();
  const { locale, dir, t } = useI18n();
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";
  const STATUS_FILTERS: Array<{ value: "all" | AdminContentStatus; label: string }> = [
    { value: "all", label: t("common.all") },
    { value: "DRAFT", label: t("content.status.draft") },
    { value: "IN_REVIEW", label: t("content.status.inReview") },
  ];

  const [status, setStatus] = useState<"all" | AdminContentStatus>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const params: AdminContentListParams = useMemo(
    () => ({
      ...(status !== "all" ? { status } : {}),
      page,
      limit: PAGE_SIZE,
    }),
    [page, status],
  );

  const query = useAdminMyContentList(params);
  const draftSummaryQuery = useAdminMyContentList({
    status: "DRAFT",
    page: 1,
    limit: 1,
  });
  const reviewSummaryQuery = useAdminMyContentList({
    status: "IN_REVIEW",
    page: 1,
    limit: 1,
  });
  const submitReview = useSubmitContentReview();

  const items = query.data?.items ?? query.data?.content ?? query.data?.contentItems ?? [];
  const normalizedSearch = search.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!normalizedSearch) return items;
    return items.filter((item) => {
      const title = toDisplayText(item.title).toLowerCase();
      const summary = toDisplayText(item.summary).toLowerCase();
      const slug = toDisplayText(item.slug).toLowerCase();
      return (
        title.includes(normalizedSearch) ||
        summary.includes(normalizedSearch) ||
        slug.includes(normalizedSearch)
      );
    });
  }, [items, normalizedSearch]);

  const serverTotal = resolvePagedTotal(query.data, items.length);
  const serverLimit = resolvePagedLimit(query.data, PAGE_SIZE);
  const draftTotal = resolvePagedTotal(draftSummaryQuery.data, 0);
  const reviewTotal = resolvePagedTotal(reviewSummaryQuery.data, 0);
  const totalPages =
    serverTotal > 0 ? Math.max(1, Math.ceil(serverTotal / serverLimit)) : 0;
  const currentPage =
    totalPages > 0
      ? clampPage(resolvePagedPage(query.data, page), totalPages)
      : 1;
  const paginationRange = useMemo(() => {
    if (serverTotal <= 0) return { start: 0, end: 0 };
    const start = (currentPage - 1) * serverLimit + 1;
    const end = Math.min(currentPage * serverLimit, serverTotal);
    return { start, end };
  }, [currentPage, serverLimit, serverTotal]);

  useEffect(() => {
    setPage(1);
  }, [status]);

  useEffect(() => {
    if (query.isAwaitingData) return;
    if (totalPages === 0) {
      if (page !== 1) setPage(1);
      return;
    }
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [query.isAwaitingData, totalPages, page, currentPage]);

  async function handleSubmitReview(id: string) {
    try {
      const details = extractMedicalContentDetails(await adminApi.content.getById(id));
      const issueCodes = getReviewReadinessIssueCodes(details);
      if (issueCodes.length > 0) {
        const messages = getBlockingMessages(t, issueCodes);
        toast(
          t(
            "dataEntry.medicalContent.toast.reviewChecklist.body",
            `Cannot send for review before completing:\n- ${messages.join("\n- ")}`,
          ),
          {
            title: t(
              "dataEntry.medicalContent.toast.reviewChecklist.title",
              "Governance requirements missing",
            ),
            variant: "error",
          },
        );
        setEditingId(id);
        return;
      }

      await submitReview.mutateAsync({ id });
      toast(t("dataEntry.medicalContent.toast.reviewSuccess.body"), {
        title: t("dataEntry.medicalContent.toast.reviewSuccess.title"),
        variant: "success",
      });
    } catch (error) {
      toast(
        userFacingErrorMessage(
          error,
          t("dataEntry.medicalContent.toast.reviewFailed.body"),
        ),
        { title: t("dataEntry.medicalContent.toast.reviewFailed.title"), variant: "error" },
      );
    }
  }

  return (
    <>
      <Helmet>
        <title>{t("dataEntry.page.medicalContent.title")}</title>
      </Helmet>

      <div dir={dir} lang={locale} className="space-y-5">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={t("dataEntry.medicalContent.hero.title")}
          subtitle={t("dataEntry.medicalContent.hero.subtitle")}
          headerIcon={<BookOpen className="h-8 w-8 text-white" />}
          actionLabel={t("dataEntry.medicalContent.hero.addAction")}
          actionIcon={<Plus className="h-4 w-4" />}
          onActionClick={() => setCreateOpen(true)}
          actionDisabled={query.isAwaitingData}
          kpiColumns={3}
          kpis={[
            {
              key: "total",
              icon: <SquarePen className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : serverTotal.toLocaleString(numberLocale),
              label: t("dataEntry.medicalContent.kpi.myItems"),
            },
            {
              key: "draft",
              icon: <FileCheck2 className="h-5 w-5 shrink-0" />,
              value: draftSummaryQuery.isAwaitingData
                ? "…"
                : draftTotal.toLocaleString(numberLocale),
              label: t("dataEntry.medicalContent.kpi.drafts"),
            },
            {
              key: "review",
              icon: <Clock3 className="h-5 w-5 shrink-0" />,
              value: reviewSummaryQuery.isAwaitingData
                ? "…"
                : reviewTotal.toLocaleString(numberLocale),
              label: t("dataEntry.medicalContent.kpi.inReview"),
            },
          ]}
        />

        <section className="rounded-[12px] border border-[#E6EEF5] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t(
                "dataEntry.medicalContent.filters.searchPlaceholder",
                "Search within the current page",
              )}
              className="h-10 rounded-[10px] border border-[#E5E7EB] px-3 text-right font-cairo text-[13px] font-semibold text-[#111827] outline-none focus:border-primary"
            />
            <StyledSelect
              value={status}
              onChange={(value) => setStatus(value as "all" | AdminContentStatus)}
              options={STATUS_FILTERS}
              listboxAriaLabel={t("dataEntry.medicalContent.filters.status")}
              triggerClassName="h-10 rounded-[10px]"
            />
          </div>
          <div className="mt-2 font-cairo text-[11px] font-bold text-[#667085]">
            {t(
              "dataEntry.medicalContent.filters.pageSearchHint",
              "Text search applies to the current page only because this endpoint supports server pagination and status filtering, but not server-side search.",
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#EEF2F6] bg-[#FAFBFC] px-4 py-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#475467]">
                <Workflow className="h-4 w-4 text-primary" />
                {t(
                  "dataEntry.medicalContent.workflow.caption",
                  "دورة العمل في محتواي: مسودة ← قيد المراجعة",
                )}
              </div>
              <div className="font-cairo text-[11px] font-semibold text-[#667085]">
                {t(
                  "dataEntry.medicalContent.acceptance.caption",
                  locale === "en"
                    ? "Release acceptance: DRAFT → submit-review only. IN_REVIEW waits for admin. Browsing stays open."
                    : "جاهزية الإطلاق: المسودة → إرسال للمراجعة فقط. قيد المراجعة بانتظار الإدارة. التصفح مفتوح.",
                )}
              </div>
            </div>
            {(status !== "all" || search.trim()) ? (
              <button
                type="button"
                onClick={() => {
                  setStatus("all");
                  setSearch("");
                  setPage(1);
                }}
                className="inline-flex h-9 items-center gap-1 rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#344054]"
              >
                <FilterX className="h-4 w-4" />
                {t("common.clearFilters", "مسح الفلاتر")}
              </button>
            ) : null}
          </div>
        </section>

        {query.isError ? (
          <section className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-4 text-right">
            <p className="font-cairo text-[13px] font-extrabold text-[#B42318]">
              {t("dataEntry.medicalContent.error.loadTitle")}
            </p>
            <p className="mt-1 font-cairo text-[12px] font-semibold text-[#B42318]">
              {userFacingErrorMessage(query.error, t("dataEntry.medicalContent.error.loadBody"))}
            </p>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-[12px] border border-[#E6EEF5] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="border-b border-[#EEF2F6] px-5 py-4 font-cairo text-[14px] font-extrabold text-[#111827]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>{t("dataEntry.medicalContent.list.title")}</span>
              <span className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-[11px] text-[#667085]">
                {search.trim()
                  ? t(
                      "dataEntry.medicalContent.list.pageMatches",
                      `${filteredItems.length.toLocaleString(numberLocale)} matches on this page`,
                    )
                  : t(
                      "dataEntry.medicalContent.list.serverTotal",
                      `${serverTotal.toLocaleString(numberLocale)} records`,
                    )}
              </span>
            </div>
          </div>

          {query.isAwaitingData ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-20 animate-pulse rounded-[10px] bg-[#F3F4F6]"
                />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F4F7] text-[#98A2B3]">
                <BookOpen className="h-5 w-5" />
              </div>
              <p className="mt-3 font-cairo text-[13px] font-extrabold text-[#344054]">
                {search.trim()
                  ? t(
                      "dataEntry.medicalContent.list.emptySearchPage",
                      "لا توجد مطابقات ضمن الصفحة الحالية.",
                    )
                  : t("dataEntry.medicalContent.list.empty")}
              </p>
              <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                {search.trim()
                  ? t(
                      "dataEntry.medicalContent.list.emptySearchPageHint",
                      "بحث النص محلي داخل الصفحة فقط لأن /api/admin/content/mine لا يدعم search.",
                    )
                  : t(
                      "dataEntry.medicalContent.list.emptyHint",
                      "جرّب تغيير الفلاتر أو أنشئ محتوى جديدًا للبدء.",
                    )}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EEF2F6]">
              {filteredItems.map((item) => {
                const titleText = toDisplayText(item.title);
                const summaryText = toDisplayText(item.summary);
                const isExpectedStatus = isDataEntryWorkflowStatus(item.status);
                const readinessSignal = getListReadinessSignal(item, null);
                const acceptanceChip = getListAcceptanceScenarioChip(
                  item.status,
                  locale === "en" ? "en" : "ar",
                );
                const nextActionCues = getNextWorkflowActions(
                  item.status,
                  "data_entry",
                );
                return (
                <article
                  key={item._id}
                  className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 flex-1 text-right">
                    <h3 className="truncate font-cairo text-[14px] font-black text-[#111827]">
                      {titleText || "بدون عنوان"}
                    </h3>
                    <p className="mt-1 line-clamp-2 font-cairo text-[12px] font-semibold text-[#667085]">
                      {summaryText || "بدون وصف مختصر"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                      <span className="rounded-[8px] bg-[#F2F4F7] px-2 py-1 text-[#344054]">
                        {contentTypeLabel(item.type)}
                      </span>
                      <span className="rounded-[8px] bg-[#ECFEFF] px-2 py-1 text-primary">
                        {contentStatusLabel(item.status)}
                      </span>
                      <span className="rounded-[8px] bg-[#F9FAFB] px-2 py-1 text-[#667085]">
                        {item.language === "en" ? t("language.en") : t("language.ar")}
                      </span>
                      <span className="rounded-[8px] bg-[#EEF6FF] px-2 py-1 text-[#1D4ED8]">
                        {contentWorkflowHint(item.status, t)}
                      </span>
                      <span
                        className={
                          readinessSignal.tone === "warning"
                            ? "rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-2 py-1 text-[#B42318]"
                            : readinessSignal.tone === "success"
                              ? "rounded-[8px] border border-[#BBF7D0] bg-[#ECFDF3] px-2 py-1 text-[#027A48]"
                              : "rounded-[8px] border border-[#D1E9FF] bg-[#F5FAFF] px-2 py-1 text-[#175CD3]"
                        }
                      >
                        {locale === "ar" ? readinessSignal.ar : readinessSignal.en}
                      </span>
                      <span className="rounded-[8px] border border-[#E4E7EC] bg-white px-2 py-1 text-[#475467]">
                        {acceptanceChip}
                      </span>
                      {nextActionCues.map((cue) => (
                        <span
                          key={`${item._id}-${cue.action}`}
                          className="rounded-[8px] border border-[#D0D5DD] bg-[#F9FAFB] px-2 py-1 text-[#667085]"
                        >
                          {localizeAcceptanceCopy(
                            cue.label,
                            locale === "en" ? "en" : "ar",
                          )}
                        </span>
                      ))}
                      <span className="text-[#98A2B3]">
                        {t("dataEntry.medicalContent.lastUpdated")}: {formatContentDate(item.updatedAt)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#667085]">
                      <span className="inline-flex items-center gap-1 rounded-[8px] bg-[#F8FAFC] px-2 py-1">
                        <UserRound className="h-3.5 w-3.5 text-primary" />
                        {t("dataEntry.medicalContent.createdBy", "المنشئ")}:
                        {" "}
                        {toActorName(item.createdBy)}
                      </span>
                      {item.reviewedBy ? (
                        <span className="inline-flex items-center gap-1 rounded-[8px] bg-[#F8FAFC] px-2 py-1">
                          <UserRound className="h-3.5 w-3.5 text-[#16A34A]" />
                          {t("dataEntry.medicalContent.reviewedBy", "راجع المحتوى")}:
                          {" "}
                          {toActorName(item.reviewedBy)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingId(item._id)}
                      className="inline-flex h-9 items-center gap-1 rounded-[10px] border border-[#E5E7EB] px-3 font-cairo text-[12px] font-extrabold text-[#344054]"
                    >
                      <Eye className="h-4 w-4" />
                      {t("dataEntry.medicalContent.actions.view")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(item._id)}
                      className="inline-flex h-9 items-center gap-1 rounded-[10px] border border-[#E5E7EB] px-3 font-cairo text-[12px] font-extrabold text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                      {t("dataEntry.medicalContent.actions.edit")}
                    </button>
                    {item.status === "DRAFT" ? (
                      <button
                        type="button"
                        onClick={() => void handleSubmitReview(item._id)}
                        disabled={submitReview.isPending}
                        className="inline-flex h-9 items-center gap-1 rounded-[10px] border border-[#BFE3E1] bg-[#F7FFFE] px-3 font-cairo text-[12px] font-extrabold text-primary disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        {t("dataEntry.medicalContent.actions.submitReview")}
                      </button>
                    ) : item.status === "IN_REVIEW" ? (
                      <span className="inline-flex h-9 items-center rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 font-cairo text-[12px] font-extrabold text-[#667085]">
                        {t(
                          "dataEntry.medicalContent.actions.alreadyInReview",
                          "قيد المراجعة حاليًا",
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex h-9 items-center gap-1 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-3 font-cairo text-[12px] font-extrabold text-[#B42318]">
                        <AlertTriangle className="h-4 w-4" />
                        {isExpectedStatus
                          ? t("dataEntry.medicalContent.workflow.other")
                          : t(
                              "dataEntry.medicalContent.workflow.unexpectedStatus",
                              "حالة خارج مسار data-entry: المتابعة متاحة للعرض/التعديل فقط.",
                            )}
                      </span>
                    )}
                  </div>
                </article>
                );
              })}
            </div>
          )}
        </section>
        {serverTotal > 0 ? (
          <section className="rounded-[12px] border border-[#E6EEF5] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-cairo text-[12px] font-semibold text-[#667085]">
                <span className="text-[#111827]">
                  {t("common.showing", "Showing")}{" "}
                  <span className="font-extrabold">
                    {paginationRange.start.toLocaleString(numberLocale)}-
                    {paginationRange.end.toLocaleString(numberLocale)}
                  </span>
                </span>{" "}
                <span>{t("common.of", "of")}</span>{" "}
                <span className="font-extrabold text-[#111827]">
                  {serverTotal.toLocaleString(numberLocale)}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={currentPage <= 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] disabled:opacity-35"
                  aria-label={t("common.firstPage", "First page")}
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage <= 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] disabled:opacity-35"
                  aria-label={t("common.previousPage", "Previous page")}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="min-w-[96px] text-center font-cairo text-[12px] font-extrabold text-[#111827]">
                  {t(
                    "dataEntry.medicalContent.pagination.pageStatus",
                    `Page ${currentPage.toLocaleString(numberLocale)} of ${Math.max(totalPages, 1).toLocaleString(numberLocale)}`,
                  )}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(Math.max(totalPages, 1), current + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] disabled:opacity-35"
                  aria-label={t("common.nextPage", "Next page")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(Math.max(totalPages, 1))}
                  disabled={currentPage >= totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] disabled:opacity-35"
                  aria-label={t("common.lastPage", "Last page")}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <CreateAdminContentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        workflowRole="data_entry"
      />

      <EditAdminContentDialog
        open={editingId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingId(null);
        }}
        contentId={editingId}
        workflowRole="data_entry"
      />

      <MedicalContentViewDialog
        open={viewingId !== null}
        onOpenChange={(open) => {
          if (!open) setViewingId(null);
        }}
        contentId={viewingId}
        workflowRole="data_entry"
      />
    </>
  );
}
