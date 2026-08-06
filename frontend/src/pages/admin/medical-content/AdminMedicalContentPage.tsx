import { Helmet } from "react-helmet-async";
import {
  Plus,
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
  LayoutGrid,
  HeartPulse,
  Stethoscope,
  Newspaper,
  Pencil,
  Pill,
  Settings,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Link as LinkIcon,
} from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import MedicalContentViewDialog from "@/components/admin/medical-content/dialogs/MedicalContentViewDialog";
import {
  CreateAdminContentDialog,
  EditAdminContentDialog,
  ContentRejectDialog,
} from "@/components/admin/medical-content";
import {
  ConfirmActionDialog,
  type ConfirmSuccessToast,
} from "@/components/admin/dialogs";
import { useToast } from "@/components/ui/ToastProvider";
import {
  useAdminContentList,
  useAdminMyContentList,
  useAdminPendingNews,
  useApproveContent,
  useArchiveContent,
  useIngestNews,
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
import { cn } from "@/lib/utils/utils";
import LanguageModeToggle from "@/components/admin/medical-content/LanguageModeToggle";
import { MedicalContentRowSkeleton } from "@/components/admin/skeletons/MedicalContentRowSkeleton";
import { SkeletonList } from "@/components/admin/skeletons/SkeletonList";
import { useI18n } from "@/i18n/provider";
import {
  buildVisiblePageNumbers,
  contentStatusLabel,
  contentTypeLabel,
  formatContentDate,
  isMineStatusFilter,
  languageKindLabel,
  normalizeContentItems,
  normalizeItemLanguage,
  PAGE_SIZE,
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

function readSourceText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function actorLabel(
  value: AdminContentItem["createdBy"] | AdminContentItem["reviewedBy"],
): string {
  if (typeof value === "string") return value.trim() || "—";
  if (!value) return "—";
  return value.fullName?.trim() || value.email?.trim() || value._id?.trim() || "—";
}

function quickSourceCount(item: AdminContentItem): number | null {
  const record = item as AdminContentItem & {
    sources?: unknown[];
    contentBlocks?: unknown[];
  };

  if (Array.isArray(record.sources)) {
    return record.sources.filter((source) => {
      const sourceRecord = source as Record<string, unknown>;
      return Boolean(
        readSourceText(sourceRecord.url) ||
          readSourceText(sourceRecord.href) ||
          readSourceText(sourceRecord.sourceUrl) ||
          readSourceText(sourceRecord.link),
      );
    }).length;
  }

  if (Array.isArray(record.contentBlocks)) {
    return record.contentBlocks.filter((block) => {
      const blockRecord = block as Record<string, unknown>;
      return Boolean(
        readSourceText(blockRecord.url) ||
          readSourceText(blockRecord.href) ||
          readSourceText(blockRecord.sourceUrl) ||
          readSourceText(blockRecord.sourceLink) ||
          readSourceText(blockRecord.link),
      );
    }).length;
  }

  return null;
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
    return tr(
      "فعّل Seek Help Block لأن النوع حالة أو عرض.",
      "Enable Seek Help Block for condition/symptom content.",
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
  const [ingestOpen, setIngestOpen] = useState(false);
  const [pendingSourceUrl, setPendingSourceUrl] = useState("");
  const [pendingDateFrom, setPendingDateFrom] = useState("");
  const [pendingDateTo, setPendingDateTo] = useState("");
  const [ingestSourceUrl, setIngestSourceUrl] = useState("");
  const [ingestTitle, setIngestTitle] = useState("");
  const [ingestSummary, setIngestSummary] = useState("");
  const [ingestPublishedAt, setIngestPublishedAt] = useState("");
  const [ingestLanguage, setIngestLanguage] = useState<"ar" | "en">("ar");
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
  const pendingNewsQuery = useAdminPendingNews({
    page: 1,
    limit: 6,
    ...(langFilter === "ar" || langFilter === "en"
      ? { language: langFilter }
      : {}),
    ...(pendingSourceUrl.trim() ? { sourceUrl: pendingSourceUrl.trim() } : {}),
    ...(pendingDateFrom ? { dateFrom: pendingDateFrom } : {}),
    ...(pendingDateTo ? { dateTo: pendingDateTo } : {}),
  });

  const submitReviewMutation = useSubmitContentReview();
  const approveMutation = useApproveContent();
  const rejectMutation = useRejectContent();
  const publishMutation = usePublishContent();
  const archiveMutation = useArchiveContent();
  const ingestNewsMutation = useIngestNews();

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
  const totalPages =
    serverTotal > 0 ? Math.max(1, Math.ceil(serverTotal / PAGE_SIZE)) : 0;

  const filteredItems = useMemo(() => {
    const text = query.trim();
    if (!text) return itemsByLang;
    return itemsByLang.filter((it) => {
      const title = String(it.title ?? "");
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
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, serverTotal);
    return { start, end };
  }, [serverTotal, page]);

  const visiblePageNumbers = useMemo(
    () => buildVisiblePageNumbers(page, totalPages, 7),
    [page, totalPages],
  );

  const showPaginationBar =
    !contentQuery.isAwaitingData && !contentQuery.isError && serverTotal > 0;
  const isNewsView = activeType === "NEWS";
  const pendingNewsItems = pendingNewsQuery.items;
  const pendingNewsTotal =
    pendingNewsQuery.data?.total ?? pendingNewsItems.length;

  useEffect(() => {
    setPage(1);
  }, [activeType, activeStatus, langFilter]);

  useEffect(() => {
    if (showMineOnly && !isMineStatusFilter(activeStatus)) {
      setActiveStatus("الكل");
    }
  }, [showMineOnly, activeStatus]);

  const statusBadge = (s: AdminContentStatus) => {
    if (s === "PUBLISHED") {
      return "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]";
    }
    if (s === "IN_REVIEW") {
      return "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]";
    }
    if (s === "ARCHIVED") {
      return "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]";
    }
    return "bg-[#F3F4F6] text-[#344054] border-[#E5E7EB]";
  };

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

  async function submitNewsIngest() {
    const sourceUrl = ingestSourceUrl.trim();
    const title = ingestTitle.trim();
    if (!sourceUrl || !title) {
      toast(
        tr(
          "أدخل رابط المصدر والعنوان على الأقل.",
          "Provide source URL and title at minimum.",
        ),
        {
          title: tr("بيانات ناقصة", "Missing data"),
          variant: "error",
        },
      );
      return;
    }

    await ingestNewsMutation.mutateAsync({
      items: [
        {
          sourceUrl,
          title,
          summary: ingestSummary.trim() || undefined,
          language: ingestLanguage,
          publishedAt: ingestPublishedAt || undefined,
        },
      ],
    });

    toast(
      tr(
        "تمت إضافة الخبر إلى طابور الأخبار المعلّقة.",
        "News item added to pending news queue.",
      ),
      {
        title: tr("تمت الإضافة", "Added"),
        variant: "success",
      },
    );
    setIngestOpen(false);
    setIngestSourceUrl("");
    setIngestTitle("");
    setIngestSummary("");
    setIngestPublishedAt("");
    setIngestLanguage("ar");
  }

  function openPendingPreview(item: AdminContentDetailsItem) {
    if (!item._id) return;
    setViewingContentId(item._id);
    setViewOpen(true);
  }

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
          </div>
          <div className="mt-1.5 flex flex-wrap content-start justify-start gap-2 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFB] p-2">
            <button
              type="button"
              onClick={() => setTypeFilter("الكل")}
              className={
                activeType === "الكل"
                  ? "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white"
                  : "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]"
              }
            >
              <BookOpen className="w-4 h-4" />
              {tr("الكل", "All")}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("CONDITION")}
              className={
                activeType === "CONDITION"
                  ? "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white"
                  : "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]"
              }
            >
              <HeartPulse className="h-4 w-4 text-[#667085]" />
              {tr("الحالات الطبية", "Conditions")}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("SYMPTOM")}
              className={
                activeType === "SYMPTOM"
                  ? "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white"
                  : "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]"
              }
            >
              <FileText className="h-4 w-4 text-[#667085]" />
              {tr("الأعراض", "Symptoms")}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("GENERAL_ADVICE")}
              className={
                activeType === "GENERAL_ADVICE"
                  ? "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white"
                  : "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]"
              }
            >
              <Stethoscope className="h-4 w-4 text-[#667085]" />
              {tr("نصائح عامة", "General advice")}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("NEWS")}
              className={
                activeType === "NEWS"
                  ? "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white"
                  : "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]"
              }
            >
              <Newspaper className="h-4 w-4 text-[#667085]" />
              {tr("الأخبار", "News")}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("MEDICATION")}
              className={
                activeType === "MEDICATION"
                  ? "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white"
                  : "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]"
              }
            >
              <Pill className="h-4 w-4 text-[#667085]" />
              {tr("الأدوية", "Medications")}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("SETTINGS_PAGE")}
              className={
                activeType === "SETTINGS_PAGE"
                  ? "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white"
                  : "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]"
              }
            >
              <Settings className="h-4 w-4 text-[#667085]" />
              {tr("صفحات الإعدادات", "Settings pages")}
            </button>
          </div>

          <div className="mt-4 font-cairo text-[11px] font-extrabold text-[#98A2B3]">
            {tr("حالة النشر", "Publish status")}
          </div>
          <div className="mt-1.5 flex flex-wrap content-start justify-start gap-2 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFB] p-2">
            <button
              type="button"
              onClick={() => setActiveStatus("الكل")}
              className={
                activeStatus === "الكل"
                  ? "inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white"
                  : "inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]"
              }
            >
              {tr("الكل", "All")}
            </button>
            <button
              type="button"
              onClick={() => setActiveStatus("منشور")}
              disabled={showMineOnly}
              className={
                activeStatus === "منشور"
                  ? "inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white"
                  : "inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
              }
            >
              {tr("منشور", "Published")}
            </button>
            <button
              type="button"
              onClick={() => setActiveStatus("قيد المراجعة")}
              className={
                activeStatus === "قيد المراجعة"
                  ? "inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white"
                  : "inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]"
              }
            >
              {tr("قيد المراجعة", "In review")}
            </button>
            <button
              type="button"
              onClick={() => setActiveStatus("مسودة")}
              className={
                activeStatus === "مسودة"
                  ? "inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white"
                  : "inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]"
              }
            >
              {tr("مسودة", "Draft")}
            </button>
            <button
              type="button"
              onClick={() => setActiveStatus("مؤرشف")}
              disabled={showMineOnly}
              className={
                activeStatus === "مؤرشف"
                  ? "inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white"
                  : "inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
              }
            >
              {tr("مؤرشف", "Archived")}
            </button>
          </div>
          {showMineOnly ? (
            <div className="mt-2 font-cairo text-[11px] font-bold text-[#98A2B3]">
              {tr(
                "واجهة (محتواي فقط) مرتبطة بمسار /api/admin/content/mine وتدعم فقط: الكل، مسودة، قيد المراجعة.",
                "My-content mode is backed by /api/admin/content/mine and supports only: All, Draft, In review.",
              )}
            </div>
          ) : null}
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
                      ` · صفحة ${page.toLocaleString(numberLocale)} / ${totalPages.toLocaleString(numberLocale)}`,
                      ` · page ${page.toLocaleString(numberLocale)} / ${totalPages.toLocaleString(numberLocale)}`,
                    )
                  : ""}
              </span>
            </div>
          </div>

          <div className="divide-y divide-[#EEF2F6]">
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
                  {tr(
                    "لا توجد عناصر مطابقة للفلاتر الحالية.",
                    "No items match current filters.",
                  )}
                </p>
                <p className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                  {tr(
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
                <div
                  key={it._id}
                  className="flex flex-col gap-3 justify-between px-6 py-5 sm:flex-row sm:items-center"
                >
                  <div className="flex-1 min-w-0 text-start">
                    <div className="flex flex-wrap gap-2 justify-start items-center sm:gap-3">
                      <div className="min-w-0 font-cairo text-[14px] font-black text-[#111827]">
                        {it.title ?? "—"}
                      </div>
                      {(() => {
                        const lk = languageKindLabel(it.language);
                        return (
                          <span
                            className={cn(
                              "inline-flex h-[22px] min-w-[1.6rem] shrink-0 items-center justify-center rounded-[8px] border px-2 font-cairo text-[10px] font-extrabold",
                              lk.code === "ar" &&
                                "border-primary/30 bg-[#E7FBFA] text-primary",
                              lk.code === "en" &&
                                "border-blue-200 bg-[#EFF6FF] text-[#1D4ED8]",
                              lk.code === "other" &&
                                "border-[#E5E7EB] bg-[#F3F4F6] text-[#667085]",
                            )}
                            title={lk.label}
                          >
                            {lk.code === "ar"
                              ? tr("ع", "AR")
                              : lk.code === "en"
                                ? "EN"
                                : tr("؟", "?")}
                          </span>
                        );
                      })()}
                      <div
                        className={`inline-flex h-[22px] items-center justify-center rounded-[8px] border px-3 font-cairo text-[11px] font-extrabold ${statusBadge(it.status)}`}
                      >
                        {contentStatusLabel(it.status)}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-start gap-6 font-cairo text-[11px] font-bold text-[#98A2B3]">
                      <div className="inline-flex gap-2 items-center">
                        <LayoutGrid className="w-4 h-4" />
                        {contentTypeLabel(it.type)}
                      </div>
                      <div className="inline-flex gap-2 items-center">
                        <ClipboardCheck className="w-4 h-4" />
                        {tr("المنشئ:", "Created by:")} {actorLabel(it.createdBy)}
                      </div>
                      <div className="inline-flex gap-2 items-center">
                        <ShieldCheck className="w-4 h-4" />
                        {tr("المراجع:", "Reviewed by:")} {actorLabel(it.reviewedBy)}
                      </div>
                      <div className="inline-flex gap-2 items-center">
                        <Eye className="w-4 h-4" />
                        {Number(it.viewCount ?? it.views ?? 0).toLocaleString(
                          numberLocale,
                        )}{" "}
                        {tr("مشاهدة", "views")}
                      </div>
                      <div className="inline-flex gap-2 items-center">
                        <Clock className="w-4 h-4" />
                        {tr("آخر تحديث:", "Last update:")}{" "}
                        {formatContentDate(it.updatedAt)}
                      </div>
                      <div className="inline-flex gap-2 items-center rounded-[8px] bg-[#F8FAFC] px-2 py-1 text-[#667085]">
                        {it.status === "DRAFT"
                          ? tr("التالي: إرسال للمراجعة", "Next: send for review")
                          : it.status === "IN_REVIEW"
                            ? tr("التالي: موافقة أو رفض", "Next: approve or reject")
                            : it.status === "PUBLISHED"
                              ? tr("التالي: أرشفة عند الحاجة", "Next: archive if needed")
                              : tr("العنصر مؤرشف للمرجع", "Item archived for reference")}
                      </div>
                      <div
                        className={cn(
                          "inline-flex gap-2 items-center rounded-[8px] px-2 py-1",
                          quickSourceCount(it) === 0
                            ? "bg-[#FFF7ED] text-[#C2410C]"
                            : "bg-[#F8FAFC] text-[#667085]",
                        )}
                      >
                        <LinkIcon className="w-4 h-4" />
                        {quickSourceCount(it) === null
                          ? tr(
                              "تحقق من المصادر داخل التفاصيل",
                              "Check sources in details",
                            )
                          : quickSourceCount(it) === 0
                            ? tr(
                                "لا توجد مصادر مرفقة بعد",
                                "No sources attached yet",
                              )
                            : tr(
                                `${quickSourceCount(it)} مصدر/مصادر`,
                                `${quickSourceCount(it)} source(s)`,
                              )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center sm:justify-start">
                    {it.status === "DRAFT" ? (
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() =>
                          setActionConfirm({
                            kind: "submitReview",
                            id: it._id,
                            title: it.title ?? "—",
                          })
                        }
                        className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#E5E7EB] px-3 text-[#475467] disabled:opacity-50"
                        aria-label={tr("إرسال للمراجعة", "Send for review")}
                      >
                        <ClipboardCheck className="w-4 h-4" />
                        <span className="font-cairo text-[11px] font-extrabold">
                          {tr("إرسال للمراجعة", "Send for review")}
                        </span>
                      </button>
                    ) : null}

                    {it.status === "IN_REVIEW" ? (
                      <>
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() =>
                            setActionConfirm({
                              kind: "approve",
                              id: it._id,
                              title: it.title ?? "—",
                            })
                          }
                          className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#BBF7D0] px-3 text-[#16A34A] disabled:opacity-50"
                          aria-label={tr("موافقة", "Approve")}
                        >
                          <Check className="w-4 h-4" />
                          <span className="font-cairo text-[11px] font-extrabold">
                            {tr("موافقة", "Approve")}
                          </span>
                        </button>
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() => {
                            setRejectTarget(it);
                            setRejectOpen(true);
                          }}
                          className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#FECACA] px-3 text-[#EF4444] disabled:opacity-50"
                          aria-label={tr("رفض", "Reject")}
                        >
                          <X className="w-4 h-4" />
                          <span className="font-cairo text-[11px] font-extrabold">
                            {tr("رفض", "Reject")}
                          </span>
                        </button>
                      </>
                    ) : null}

                    {it.status === "PUBLISHED" ? (
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() =>
                          setActionConfirm({
                            kind: "archive",
                            id: it._id,
                            title: it.title ?? "—",
                          })
                        }
                        className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#BFDBFE] px-3 text-[#1D4ED8] disabled:opacity-50"
                        aria-label={tr("أرشفة", "Archive")}
                      >
                        <Archive className="w-4 h-4" />
                        <span className="font-cairo text-[11px] font-extrabold">
                          {tr("أرشفة", "Archive")}
                        </span>
                      </button>
                    ) : null}

                    {it.status === "IN_REVIEW" ? (
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() =>
                          setActionConfirm({
                            kind: "publish",
                            id: it._id,
                            title: it.title ?? "—",
                          })
                        }
                        className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#67E8F9] px-3 text-[#0891B2] disabled:opacity-50"
                        aria-label={tr("نشر", "Publish")}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-cairo text-[11px] font-extrabold">
                          {tr("نشر", "Publish")}
                        </span>
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => {
                        setEditingContentId(it._id);
                        setEditOpen(true);
                      }}
                      className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-[#0F8F8B]"
                      aria-label={tr("تعديل", "Edit")}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setViewingContentId(it._id);
                        setViewOpen(true);
                      }}
                      className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-[#2563EB]"
                      aria-label={tr("عرض", "View")}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {showPaginationBar ? (
            <div className="border-t border-[#EEF2F6] bg-gradient-to-b from-[#FAFBFC] to-white px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-cairo text-[12px] font-semibold leading-relaxed text-[#667085]">
                  <span className="text-[#101828]">
                    {tr("عرض", "Showing")}{" "}
                    <span className="font-extrabold tabular-nums">
                      {paginationRange.start.toLocaleString(numberLocale)}–
                      {paginationRange.end.toLocaleString(numberLocale)}
                    </span>
                  </span>
                  <span> {tr("من", "of")} </span>
                  <span className="font-extrabold text-[#101828] tabular-nums">
                    {serverTotal.toLocaleString(numberLocale)}
                  </span>
                  <span>{tr(" سجلاً", " records")}</span>
                  {query.trim() ? (
                    <span className="mt-1 block text-[11px] font-bold text-primary/80">
                      {tr(
                        "التصفية النصية تطبّق على الصفحة الحالية فقط",
                        "Text filter applies to current page only",
                      )}
                    </span>
                  ) : null}
                </div>

                {totalPages > 1 ? (
                  <div
                    className="flex flex-wrap gap-1 justify-center items-center min-w-0 sm:justify-end"
                    role="navigation"
                      aria-label={tr("تصفح الصفحات", "Browse pages")}
                  >
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage(1)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] shadow-sm transition hover:border-primary/30 hover:bg-[#F0FDFA] disabled:pointer-events-none disabled:opacity-35"
                      aria-label={tr("الصفحة الأولى", "First page")}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] shadow-sm transition hover:border-primary/30 hover:bg-[#F0FDFA] disabled:pointer-events-none disabled:opacity-35"
                      aria-label={tr("الصفحة السابقة", "Previous page")}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="mx-0.5 flex min-w-0 max-w-full flex-wrap items-center justify-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {visiblePageNumbers[0] > 1 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setPage(1)}
                            className="min-w-[2.25rem] rounded-[10px] border border-[#E5E7EB] bg-white px-2 py-1.5 font-cairo text-[12px] font-extrabold text-[#344054] transition hover:border-primary/30 hover:bg-[#F0FDFA]"
                          >
                            1
                          </button>
                          {visiblePageNumbers[0] > 2 ? (
                            <span
                              className="px-0.5 font-cairo text-[12px] font-bold text-[#98A2B3]"
                              aria-hidden
                            >
                              …
                            </span>
                          ) : null}
                        </>
                      ) : null}

                      {visiblePageNumbers.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPage(n)}
                          className={cn(
                            "min-w-[2.25rem] rounded-[10px] border px-2.5 py-1.5 font-cairo text-[12px] font-extrabold transition",
                            n === page
                              ? "border-primary bg-primary text-white shadow-[0_6px_16px_rgba(15,143,139,0.25)]"
                              : "border-[#E5E7EB] bg-white text-[#344054] hover:border-primary/30 hover:bg-[#F0FDFA]",
                          )}
                          aria-label={tr(`الصفحة ${n}`, `Page ${n}`)}
                          aria-current={n === page ? "page" : undefined}
                        >
                          {n.toLocaleString(numberLocale)}
                        </button>
                      ))}

                      {visiblePageNumbers[visiblePageNumbers.length - 1] <
                      totalPages ? (
                        <>
                          {visiblePageNumbers[visiblePageNumbers.length - 1] <
                          totalPages - 1 ? (
                            <span
                              className="px-0.5 font-cairo text-[12px] font-bold text-[#98A2B3]"
                              aria-hidden
                            >
                              …
                            </span>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setPage(totalPages)}
                            className="min-w-[2.25rem] rounded-[10px] border border-[#E5E7EB] bg-white px-2 py-1.5 font-cairo text-[12px] font-extrabold text-[#344054] transition hover:border-primary/30 hover:bg-[#F0FDFA]"
                            aria-label={tr("الصفحة الأخيرة", "Last page")}
                          >
                            {totalPages.toLocaleString(numberLocale)}
                          </button>
                        </>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] shadow-sm transition hover:border-primary/30 hover:bg-[#F0FDFA] disabled:pointer-events-none disabled:opacity-35"
                      aria-label={tr("الصفحة التالية", "Next page")}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage(totalPages)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] shadow-sm transition hover:border-primary/30 hover:bg-[#F0FDFA] disabled:pointer-events-none disabled:opacity-35"
                      aria-label={tr("الصفحة الأخيرة", "Last page")}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                    {tr(
                      "كامل النتائج في صفحة واحدة",
                      "All results fit on one page",
                    )}
                  </div>
                )}
              </div>
            </div>
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
      />

      <EditAdminContentDialog
        open={editOpen}
        onOpenChange={(next) => {
          setEditOpen(next);
          if (!next) setEditingContentId(null);
        }}
        contentId={editingContentId}
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
              {tr(
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
          } else if (kind === "approve") {
            await approveMutation.mutateAsync(id);
          } else if (kind === "publish") {
            await publishMutation.mutateAsync(id);
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
        contentTitle={rejectTarget?.title ?? "—"}
        onConfirm={confirmReject}
        isPending={rejectMutation.isPending}
      />

      <CreateAdminContentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  );
}
