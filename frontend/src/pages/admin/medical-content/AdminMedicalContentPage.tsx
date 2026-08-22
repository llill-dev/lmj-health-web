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
  tr: (ar: string, en: string) => string,
  issueCodes: ReviewReadinessIssueCode[],
): string[] {
  return issueCodes.map((code) => {
    if (code === "sources_required") {
      return tr(
        "أضف مصدرًا واحدًا موثوقًا على الأقل.",
        "Add at least one trusted source.",
      );
    }
    if (code === "disclaimer_required") {
      return tr(
        "حدّد إصدار التنبيه الطبي (Disclaimer Version).",
        "Set the disclaimer version.",
      );
    }
    if (code === "seek_help_required") {
      return tr(
        "فعّل Seek Help Block لأن النوع حالة أو عرض.",
        "Enable Seek Help Block for condition/symptom content.",
      );
    }
    if (code === "blocks_required") {
      return tr(
        "أضف بلوك محتوى فعلي واحدًا على الأقل.",
        "Add at least one meaningful content block.",
      );
    }
    if (code === "news_source_url_required") {
      return tr(
        "أضف رابط مصدر الخبر (news.sourceUrl).",
        "Add the NEWS source URL (news.sourceUrl).",
      );
    }
    return tr(
      "حدّد تاريخ نشر الخبر (news.publishedAt).",
      "Set the NEWS published date (news.publishedAt).",
    );
  });
}

export default function AdminMedicalContentPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";

  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [activeStatus, setActiveStatus] = useState<UiContentStatus>("الكل");
  const [langFilter, setLangFilter] = useState<LangFilter>("الكل");

  const activeType = useMemo(
    () => parseTypeQueryParam(searchParams.get("type")),
    [searchParams],
  );

  const setTypeFilter = useCallback(
    (next: "الكل" | AdminContentType) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          if (next === "الكل") p.delete("type");
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
        title: "تم",
        message: "أُرسل المحتوى للمراجعة.",
        variant: "success",
      };
    }
    if (kind === "approve") {
      return {
        title: "تمت الموافقة",
        message: "يمكنك نشر المحتوى متى نضج.",
        variant: "success",
      };
    }
    if (kind === "publish") {
      return {
        title: "تم النشر",
        message: "صار المحتوى متاحاً للمستفيدين حسب قواعد العرض.",
        variant: "success",
      };
    }
    return {
      title: "تمت الأرشفة",
      message: "أُرشف العنصر ويُنقل لأرشيف المحتوى.",
      variant: "success",
    };
  }, [actionConfirm]);

  useEffect(() => {
    if (searchParams.get("queue") === "review") {
      setActiveStatus("قيد المراجعة");
    }
  }, [searchParams]);

  const statusToApi = useMemo<
    Partial<Record<UiContentStatus, AdminContentStatus>>
  >(
    () => ({
      منشور: "PUBLISHED",
      "قيد المراجعة": "IN_REVIEW",
      مسودة: "DRAFT",
      مؤرشف: "ARCHIVED",
    }),
    [],
  );

  const adminListParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(activeType !== "الكل" ? { type: activeType } : {}),
      ...(activeStatus !== "الكل"
        ? { status: statusToApi[activeStatus] as AdminContentStatus }
        : {}),
      ...(langFilter !== "الكل" ? { language: langFilter as "ar" | "en" } : {}),
    }),
    [page, activeType, activeStatus, langFilter, statusToApi],
  );

  const myListParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(activeStatus !== "الكل" && isMineStatusFilter(activeStatus)
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
    if (activeType === "الكل") return items;
    return items.filter((it) => it.type === activeType);
  }, [items, activeType]);

  const itemsByLang = useMemo(() => {
    if (langFilter === "الكل") return itemsByType;
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
      setActiveStatus("الكل");
    }
  }, [showMineOnly, activeStatus]);

  async function confirmReject(reason: string) {
    if (!rejectTarget) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectTarget._id, reason });
      toast(
        tr(
          "تم رفض المحتوى ويُرسل الملاحظة إلى الفريق عند اكتمال الربط.",
          "Content was rejected and the note will be sent to the team when integration is completed.",
        ),
        {
          title: tr("تم", "Done"),
          variant: "success",
        },
      );
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

  return (
    <>
      <Helmet>
        <title>
          {activeType === "NEWS"
            ? tr(
                "الأخبار الطبية — إدارة المحتوى • LMJ Health",
                "Medical news — content management • LMJ Health",
              )
            : tr(
                "إدارة المحتوى الطبي • LMJ Health",
                "Medical content management • LMJ Health",
              )}
        </title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr("إدارة المحتوى الطبي", "Medical content management")}
          subtitle={
            activeType === "NEWS"
              ? tr(
                  "عرض وإدارة أخبار المنصة (مسودة → مراجعة → نشر)",
                  "View and manage platform news (draft → review → publish)",
                )
              : tr(
                  "قائمة، فلاتر، ومراجعة لدورة حياة المحتوى",
                  "List, filters, and review for content lifecycle",
                )
          }
          headerIcon={<BookOpen className="h-8 w-8 text-white" />}
          actionLabel={tr("إضافة محتوى جديد", "Add new content")}
          onActionClick={() => setCreateOpen(true)}
          kpiColumns={5}
          kpis={[
            {
              key: "views",
              icon: <Eye className="h-5 w-5 shrink-0" />,
              value: pageViews.toLocaleString(numberLocale),
              label: tr("مشاهدات الصفحة", "Page views"),
            },
            {
              key: "draft",
              icon: <FileText className="h-5 w-5 shrink-0" />,
              value: statusCounts.isAwaitingData ? "…" : statusCounts.draft,
              label: tr("مسودات", "Drafts"),
            },
            {
              key: "review",
              icon: <Clock className="h-5 w-5 shrink-0" />,
              value: statusCounts.isAwaitingData ? "…" : statusCounts.inReview,
              label: tr("قيد المراجعة", "In review"),
            },
            {
              key: "published",
              icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
              value: statusCounts.isAwaitingData ? "…" : statusCounts.published,
              label: tr("منشور", "Published"),
            },
            {
              key: "all",
              icon: <BookOpen className="h-5 w-5 shrink-0" />,
              value: statusCounts.isAwaitingData ? "…" : statusCounts.all,
              label: tr("إجمالي النظام", "System total"),
            },
          ]}
        />

        <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] px-4 py-3 text-start">
          <LinkIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#175CD3]" />
          <div className="font-cairo text-[12px] font-bold leading-6 text-[#175CD3]">
            {tr(
              "هذه الصفحة تجمع بين إنشاء المحتوى، مراجعته، ونقله بين مراحل الدورة المعتمدة. استخدم بطاقات القائمة لفرز الحالة بسرعة، لكن نفّذ القبول أو الرفض أو النشر فقط بعد مراجعة المصادر واللغة والمنشئ من تفاصيل العنصر نفسه.",
              "This page combines content creation, review, and movement across the approved lifecycle. Use the list cards to triage status quickly, but only approve, reject, or publish after reviewing sources, language, and creator context from the item’s own details.",
            )}
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
                placeholder={tr(
                  "بحث داخل الصفحة الحالية في العناوين والملخص…",
                  "Search within the current page titles and summaries…",
                )}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-white pe-12 ps-4 text-start font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]"
              />
              <div className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#98A2B3]">
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
                {tr("محتواي فقط", "My content only")}
              </label>
              <LanguageModeToggle value={langFilter} onChange={setLangFilter} />
            </div>
          </div>

          <div className="mt-5 font-cairo text-[11px] font-extrabold text-[#98A2B3]">
            {tr("نوع المحتوى", "Content type")}
          </div>
          <div className="mt-3 rounded-[10px] border border-[#D5E8E6] bg-[#F8FFFE] px-4 py-3">
            <div className="font-cairo text-[12px] font-extrabold text-[#0F766E]">
              {tr(
                showMineOnly
                  ? "وضع محتواي: الفلترة المتاحة (مسودة، قيد المراجعة)."
                  : "دورة العمل المعتمدة: مسودة ← قيد المراجعة ← منشور ← مؤرشف",
                showMineOnly
                  ? "My-content mode: available statuses are Draft and In review."
                  : "Approved workflow: Draft → In review → Published → Archived",
              )}
            </div>
            <div className="mt-1 font-cairo text-[11px] font-semibold text-[#5B7B79]">
              {tr(
                "تحقق من المنشئ، المراجع، وحالة العنصر قبل تنفيذ القبول أو النشر أو الأرشفة.",
                "Check the creator, reviewer, and item state before approving, publishing, or archiving.",
              )}
            </div>
            <div className="mt-2 font-cairo text-[11px] font-bold text-[#0F766E]">
              {tr(
                "جاهزية الإطلاق (إرشادي): DRAFT→submit-review · IN_REVIEW→approve/reject/publish · PUBLISHED→archive — لا يمنع التصفح.",
                "Release acceptance cues: DRAFT→submit-review · IN_REVIEW→approve/reject/publish · PUBLISHED→archive — browsing stays open.",
              )}
            </div>
          </div>
          <AdminContentTypeFilterBar
            activeType={activeType}
            onChange={setTypeFilter}
            tr={tr}
          />

          <div className="mt-4 font-cairo text-[11px] font-extrabold text-[#98A2B3]">
            {tr("حالة النشر", "Publish status")}
          </div>
          <AdminContentStatusFilterBar
            activeStatus={activeStatus}
            onChange={setActiveStatus}
            showMineOnly={showMineOnly}
            tr={tr}
          />
        </section>

        <section className="mt-5 rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
            <div className="flex flex-wrap gap-2 items-center">
              <BookOpen className="w-4 h-4 text-primary" />
              <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
                {tr("المحتوى الطبي", "Medical content")}
              </div>
              <span className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 font-cairo text-[11px] font-extrabold text-[#667085]">
                {query.trim()
                  ? tr(
                      `${filteredItems.length.toLocaleString(numberLocale)} مطابقة محلية`,
                      `${filteredItems.length.toLocaleString(numberLocale)} local matches`,
                    )
                  : tr(
                      `${serverTotal.toLocaleString(numberLocale)} سجل (السيرفر)`,
                      `${serverTotal.toLocaleString(numberLocale)} records (server)`,
                    )}
                {showPaginationBar && totalPages > 0
                  ? tr(
                      ` · صفحة ${currentPage.toLocaleString(numberLocale)} / ${totalPages.toLocaleString(numberLocale)}`,
                      ` · page ${currentPage.toLocaleString(numberLocale)} / ${totalPages.toLocaleString(numberLocale)}`,
                    )
                  : ""}
              </span>
            </div>
          </div>

          <div className={filteredItems.length > 0 && !contentQuery.isAwaitingData && !contentQuery.isError ? "flex flex-col gap-3 bg-[#FAFBFC] p-4 sm:p-5" : ""}>
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
                  {tr(
                    "تعذّر تحميل المحتوى الطبي.",
                    "Failed to load medical content.",
                  )}
                </p>
                <p className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                  {tr(
                    "تحقق من الفلاتر أو الاتصال ثم أعد المحاولة.",
                    "Check filters or connection, then try again.",
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void contentQuery.refetch();
                  }}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#FECACA] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#B42318]"
                >
                  <Clock className="h-4 w-4" />
                  {tr("إعادة المحاولة", "Retry")}
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F4F7] text-[#98A2B3]">
                  <Search className="h-5 w-5" />
                </div>
                <p className="mt-3 font-cairo text-[13px] font-extrabold text-[#344054]">
                  {query.trim()
                    ? tr(
                        "لا توجد مطابقات ضمن الصفحة الحالية.",
                        "No matches on the current page.",
                      )
                    : tr(
                        "لا توجد عناصر مطابقة للفلاتر الحالية.",
                        "No items match current filters.",
                      )}
                </p>
                <p className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                  {query.trim()
                    ? tr(
                        "هذا البحث نصّي محلي داخل الصفحة فقط لأن /api/admin/content و /api/admin/content/mine لا يدعمان search.",
                        "This text search is local to the current page because /api/admin/content and /api/admin/content/mine do not support search.",
                      )
                    : tr(
                        "غيّر معايير البحث أو امسح الفلاتر لعرض نتائج أوسع.",
                        "Adjust search criteria or clear filters to see broader results.",
                      )}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setShowMineOnly(false);
                    setActiveStatus("الكل");
                    setLangFilter("الكل");
                    setTypeFilter("الكل");
                    setPage(1);
                  }}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054]"
                >
                  <X className="h-4 w-4" />
                  {tr("مسح الفلاتر", "Clear filters")}
                </button>
              </div>
            ) : (
              filteredItems.map((it) => (
                <AdminContentListItem
                  key={it._id}
                  item={it}
                  showMineOnly={showMineOnly}
                  actionBusy={actionBusy}
                  locale={locale}
                  tr={tr}
                  numberLocale={numberLocale}
                  onSubmitReview={(item) =>
                    setActionConfirm({
                      kind: "submitReview",
                      id: item._id,
                      title: toDisplayText(item.title) || "—",
                    })
                  }
                  onApprove={(item) =>
                    setActionConfirm({
                      kind: "approve",
                      id: item._id,
                      title: toDisplayText(item.title) || "—",
                    })
                  }
                  onReject={(item) => {
                    setRejectTarget(item);
                    setRejectOpen(true);
                  }}
                  onPublish={(item) =>
                    setActionConfirm({
                      kind: "publish",
                      id: item._id,
                      title: toDisplayText(item.title) || "—",
                    })
                  }
                  onArchive={(item) =>
                    setActionConfirm({
                      kind: "archive",
                      id: item._id,
                      title: toDisplayText(item.title) || "—",
                    })
                  }
                  onEdit={(item) => {
                    setEditingContentId(item._id);
                    setEditOpen(true);
                  }}
                  onView={(item) => {
                    setViewingContentId(item._id);
                    setViewOpen(true);
                  }}
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
              tr={tr}
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
              ? tr(
                  "تأكيد إرسال المحتوى للمراجعة",
                  "Confirm sending content for review",
                )
              : actionConfirm.kind === "approve"
                ? tr("تأكيد موافقة المحتوى", "Confirm approving content")
                : actionConfirm.kind === "publish"
                  ? tr("تأكيد نشر المحتوى", "Confirm publishing content")
                  : tr("تأكيد أرشفة المحتوى", "Confirm archiving content")
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
              {tr("العنوان:", "Title:")} «
              <span className="font-extrabold text-[#344054]">
                {actionConfirm.title}
              </span>
              ».{" "}
              {actionConfirm.kind === "approve" ||
              actionConfirm.kind === "publish"
                ? tr(
                    "سيتم التحقق من مصفوفة قبول الإطلاق قبل التنفيذ. إن وُجدت نواقص ستُعاد إلى التحرير.",
                    "Release acceptance will be verified before running. Missing items open the editor.",
                  )
                : tr(
                    "سيتم تنفيذ الإجراء على الخادم ولا يمكن التراجع محلياً.",
                    "The action runs on the server and cannot be undone locally.",
                  )}
            </>
          ) : (
            "—"
          )
        }
        confirmLabel={
          !actionConfirm
            ? "—"
            : actionConfirm.kind === "submitReview"
              ? tr("إرسال", "Send")
              : actionConfirm.kind === "approve"
                ? tr("موافقة", "Approve")
                : actionConfirm.kind === "publish"
                  ? tr("نشر", "Publish")
                  : tr("أرشفة", "Archive")
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
              const blockingMessages = getSubmitReviewBlockingMessages(tr, issueCodes);
              setActionConfirm(null);
              toast(
                tr(
                  `تعذّر إرسال المحتوى للمراجعة قبل استكمال:\n- ${blockingMessages.join("\n- ")}`,
                  `Cannot send for review before completing:\n- ${blockingMessages.join("\n- ")}`,
                ),
                {
                  title: tr("متطلبات الحوكمة غير مكتملة", "Governance requirements missing"),
                  variant: "error",
                },
              );
              setEditingContentId(id);
              setEditOpen(true);
              throw new Error("review_readiness_required");
            }
            await submitReviewMutation.mutateAsync({
              id,
              reviewNotes: tr(
                "تم إرسال المحتوى للمراجعة من لوحة الإدارة.",
                "Content sent for review from admin panel.",
              ),
            });
            setActiveStatus("الكل");
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
            const snapshot = buildReleaseAcceptanceFromDetails(details, "admin");
            if (!snapshot || !isApprovePublishPathReady(snapshot)) {
              const incomplete = snapshot
                ? getIncompleteAcceptanceChecks(snapshot)
                : [];
              const language = locale === "en" ? "en" : "ar";
              const blockingMessages = incomplete.length
                ? incomplete.map((item) =>
                    localizeAcceptanceCopy(item.label, language),
                  )
                : [
                    tr(
                      "تعذّر التحقق من جاهزية الإطلاق لهذا المحتوى.",
                      "Could not verify release acceptance readiness for this content.",
                    ),
                  ];
              setActionConfirm(null);
              toast(
                tr(
                  `تعذّر ${kind === "approve" ? "الموافقة" : "النشر"} قبل استكمال جاهزية الإطلاق:\n- ${blockingMessages.join("\n- ")}`,
                  `Cannot ${kind === "approve" ? "approve" : "publish"} before release acceptance is ready:\n- ${blockingMessages.join("\n- ")}`,
                ),
                {
                  title: tr(
                    "بوابة الاعتماد غير مكتملة",
                    "Approval gate incomplete",
                  ),
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
