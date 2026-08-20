import { Helmet } from "react-helmet-async";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Link as LinkIcon,
  Newspaper,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import { ConfirmActionDialog } from "@/components/admin/dialogs";
import MedicalContentViewDialog from "@/components/admin/medical-content/dialogs/MedicalContentViewDialog";
import { useToast } from "@/components/ui/ToastProvider";
import LanguageModeToggle from "@/components/admin/medical-content/LanguageModeToggle";
import {
  useAdminPendingNews,
  useIngestNews,
} from "@/hooks/admin/content/useAdminContent";
import type { AdminContentDetailsItem } from "@/lib/admin/types";
import { formatContentDate, toDisplayText, type LangFilter } from "@/components/admin/medical-content/contentListUtils";
import { useI18n } from "@/i18n/provider";

export default function AdminMedicalNewsQueuePage() {
  const { toast } = useToast();
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";
  const [langFilter, setLangFilter] = useState<LangFilter>("الكل");
  const [sourceUrl, setSourceUrl] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [ingestOpen, setIngestOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingContentId, setViewingContentId] = useState<string | null>(null);

  const [ingestSourceUrl, setIngestSourceUrl] = useState("");
  const [ingestTitle, setIngestTitle] = useState("");
  const [ingestSummary, setIngestSummary] = useState("");
  const [ingestPublishedAt, setIngestPublishedAt] = useState("");
  const [ingestLanguage, setIngestLanguage] = useState<"ar" | "en">("ar");

  const pendingNewsQuery = useAdminPendingNews({
    page,
    limit: 12,
    ...(langFilter !== "الكل" ? { language: langFilter as "ar" | "en" } : {}),
    ...(sourceUrl.trim() ? { sourceUrl: sourceUrl.trim() } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  });
  const ingestNewsMutation = useIngestNews();

  const pendingItems = pendingNewsQuery.items;
  const pendingTotal = pendingNewsQuery.data?.total ?? pendingItems.length;
  const currentPage = Math.max(1, pendingNewsQuery.data?.page ?? page);
  const pageSize = Math.max(1, pendingNewsQuery.data?.limit ?? 12);
  const totalPages = Math.max(1, Math.ceil(pendingTotal / pageSize));
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  const rangeStart = pendingTotal === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = pendingTotal === 0 ? 0 : Math.min(currentPage * pageSize, pendingTotal);
  const visibleItems = useMemo(() => pendingItems, [pendingItems]);
  const hasActiveFilters =
    langFilter !== "الكل" ||
    sourceUrl.trim() !== "" ||
    dateFrom !== "" ||
    dateTo !== "";

  async function submitNewsIngest() {
    const normalizedSourceUrl = ingestSourceUrl.trim();
    const normalizedTitle = ingestTitle.trim();
    if (!normalizedSourceUrl || !normalizedTitle) {
      toast(
        tr(
          "أدخل رابط المصدر والعنوان على الأقل.",
          "Enter at least the source URL and title.",
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
          sourceUrl: normalizedSourceUrl,
          title: normalizedTitle,
          summary: ingestSummary.trim() || undefined,
          language: ingestLanguage,
          publishedAt: ingestPublishedAt || undefined,
        },
      ],
    });

    toast(
      tr(
        "تمت إضافة الخبر إلى طابور الأخبار المعلّقة.",
        "News item was added to the pending queue.",
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

  function openPreview(item: AdminContentDetailsItem) {
    if (!item._id) return;
    setViewingContentId(item._id);
    setViewOpen(true);
  }

  return (
    <>
      <Helmet>
        <title>
          {tr("طابور الأخبار الطبية", "Medical news queue")} • LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr("طابور الأخبار الطبية", "Medical news queue")}
          subtitle={tr(
            "إدارة الأخبار المعلّقة القادمة من ingest قبل إدخالها في دورة التحرير والمراجعة",
            "Manage pending ingest news before editorial review",
          )}
          headerIcon={<Newspaper className="h-8 w-8 text-white" />}
          actionLabel={tr("إضافة خبر إلى الطابور", "Add news to queue")}
          onActionClick={() => setIngestOpen(true)}
          kpiColumns={3}
          kpis={[
            {
              key: "pending",
              icon: <Newspaper className="h-5 w-5 shrink-0" />,
              value: pendingNewsQuery.isAwaitingData
                ? "…"
                : pendingTotal.toLocaleString(numberLocale),
              label: tr("إجمالي المعلّق", "Total pending"),
            },
            {
              key: "visible",
              icon: <Eye className="h-5 w-5 shrink-0" />,
              value: pendingNewsQuery.isAwaitingData ? "…" : visibleItems.length,
              label: tr("المعروض الآن", "Currently shown"),
            },
            {
              key: "language",
              icon: <LinkIcon className="h-5 w-5 shrink-0" />,
              value: langFilter === "الكل" ? "AR/EN" : langFilter.toUpperCase(),
              label: tr("نطاق اللغة", "Language scope"),
            },
          ]}
        />

        <section className="mt-4 rounded-[12px] border border-[#D6EEEC] bg-[#F3FBFA] px-6 py-4 shadow-[0_10px_24px_rgba(20,130,131,0.08)]">
          <div className="font-cairo text-[13px] font-extrabold text-[#0F766E]">
            {tr(
              "هذه الشاشة تمثّل مرحلة ما قبل التحرير. العناصر هنا ما تزال في طابور الانتظار قبل دخولها دورة المراجعة التحريرية والنشر، كما أن زر الإضافة يرسل الخبر إلى الطابور فقط ولا ينشره مباشرة.",
              "This screen represents the pre-editorial stage. Items here are still waiting in the queue before entering editorial review and publishing, and the add action sends news to the queue only rather than publishing it directly.",
            )}
          </div>
        </section>

        <section className="mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
                {tr("فلاتر الطابور", "Queue filters")}
              </div>
              <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                {tr(
                  "ابحث حسب رابط المصدر أو الفترة الزمنية أو اللغة.",
                  "Filter by source URL, date range, or language.",
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4 lg:min-w-[920px]">
              <label className="flex flex-col gap-1 text-start">
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
                  className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827] placeholder:text-[#98A2B3]"
                />
              </label>
              <label className="flex flex-col gap-1 text-start">
                <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                  {tr("من تاريخ", "From date")}
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                    }}
                  className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827]"
                />
              </label>
              <label className="flex flex-col gap-1 text-start">
                <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                  {tr("إلى تاريخ", "To date")}
                </span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                    }}
                  className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827]"
                />
              </label>
              <div className="flex flex-col gap-1 text-start">
                <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                  {tr("اللغة", "Language")}
                </span>
                <LanguageModeToggle
                  value={langFilter}
                  onChange={(next) => {
                    setLangFilter(next);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <button
              type="button"
              onClick={() => void pendingNewsQuery.refetch()}
              disabled={pendingNewsQuery.isFetching}
              className="inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#344054] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${pendingNewsQuery.isFetching ? "animate-spin" : ""}`}
              />
              {tr("تحديث", "Refresh")}
            </button>
          </div>
        </section>

        {pendingNewsQuery.isRefetching && !pendingNewsQuery.isAwaitingData ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-[10px] border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2 font-cairo text-[12px] font-bold text-[#047857]">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {tr("جارٍ تحديث طابور الأخبار...", "Refreshing news queue...")}
          </div>
        ) : null}

        <section className="mt-5 space-y-3">
          {pendingNewsQuery.isAwaitingData ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {tr(
                "جاري تحميل الأخبار المعلّقة...",
                "Loading pending news...",
              )}
            </div>
          ) : pendingNewsQuery.isError ? (
            <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-8 text-center">
              <div className="font-cairo text-[13px] font-semibold text-[#B42318]">
                {tr(
                  "تعذر تحميل طابور الأخبار.",
                  "Failed to load news queue.",
                )}
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
                  ? tr("جارٍ إعادة المحاولة...", "Retrying...")
                  : tr("إعادة المحاولة", "Retry")}
              </button>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[#D0D5DD] bg-white px-6 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {hasActiveFilters
                ? tr(
                    "لا توجد عناصر مطابقة للفلاتر الحالية في طابور الأخبار.",
                    "No news items match the current filters.",
                  )
                : tr(
                    "لا توجد عناصر معلّقة حالياً في طابور الأخبار.",
                    "There are no pending news items right now.",
                  )}
            </div>
          ) : (
            visibleItems.map((item) => (
              <article
                key={item._id ?? `${item.slug ?? toDisplayText(item.title) ?? "pending"}-${item.updatedAt ?? ""}`}
                className="rounded-[12px] border border-[#E5E7EB] bg-white px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.05)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {item.coverImage ? (
                    <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] lg:w-[180px] lg:shrink-0">
                      <img
                        src={item.coverImage}
                        alt={toDisplayText(item.title) || item.originalTitle || "news cover"}
                        className="h-[120px] w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : null}

                    <div className="min-w-0 flex-1 text-start">
                    <div className="flex flex-wrap items-center justify-start gap-2">
                      <span className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 font-cairo text-[10px] font-extrabold text-[#B54708]">
                        pending
                      </span>
                      <span className="rounded-full border border-[#D1FAE5] bg-[#ECFDF3] px-2.5 py-1 font-cairo text-[10px] font-extrabold text-[#027A48]">
                        {item.language ?? "—"}
                      </span>
                    </div>

                    <div className="mt-3 font-cairo text-[15px] font-extrabold text-[#111827]">
                      {toDisplayText(item.title) || "—"}
                    </div>
                    {item.originalTitle && item.originalTitle !== toDisplayText(item.title) ? (
                      <div className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                        {tr("العنوان الأصلي:", "Original title:")}{" "}
                        {item.originalTitle}
                      </div>
                    ) : null}
                    <div className="mt-1 font-cairo text-[12px] font-semibold leading-6 text-[#667085]">
                      {item.summary ??
                        item.aiSummary ??
                        tr("لا يوجد ملخص.", "No summary.")}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-start gap-4 font-cairo text-[11px] font-bold text-[#667085]">
                      {item.sourceName ? (
                        <span>
                          {tr("المصدر:", "Source:")} {item.sourceName}
                        </span>
                      ) : null}
                      <span>
                        {tr("آخر تحديث:", "Last updated:")}{" "}
                        {formatContentDate(item.updatedAt ?? item.createdAt)}
                      </span>
                      {item.publishedAt ? (
                        <span>
                          {tr("نُشر أصلًا:", "Originally published:")}{" "}
                          {formatContentDate(item.publishedAt)}
                        </span>
                      ) : null}
                      {item.pageVersion ? (
                        <span>pageVersion: {item.pageVersion}</span>
                      ) : null}
                    </div>

                    {item.sources?.[0]?.url ? (
                      <a
                        href={item.sources[0].url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex max-w-full items-center gap-2 truncate font-cairo text-[11px] font-bold text-primary"
                      >
                        <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate" dir="ltr">
                          {item.sources[0].url}
                        </span>
                      </a>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center justify-start gap-2">
                    {item._id ? (
                      <button
                        type="button"
                        onClick={() => openPreview(item)}
                        className="inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#BFDBFE] px-3 font-cairo text-[12px] font-extrabold text-[#1D4ED8]"
                      >
                        <Eye className="h-4 w-4" />
                        {tr("معاينة", "Preview")}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setIngestOpen(true)}
                      className="inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#BBF7D0] px-3 font-cairo text-[12px] font-extrabold text-[#15803D]"
                    >
                      <Plus className="h-4 w-4" />
                      {tr("ingest جديد", "New ingest")}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        {!pendingNewsQuery.isAwaitingData && !pendingNewsQuery.isError && pendingTotal > 0 ? (
          <section className="mt-4">
            <div className="flex flex-col gap-3 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div className="text-start font-cairo text-[12px] font-semibold text-[#667085]">
                {tr("عرض", "Showing")}{" "}
                {rangeStart.toLocaleString(numberLocale)}–
                {rangeEnd.toLocaleString(numberLocale)} {tr("من", "of")}{" "}
                {pendingTotal.toLocaleString(numberLocale)} {tr("خبر", "news")}{" "}
                · {tr("صفحة", "Page")} {currentPage.toLocaleString(numberLocale)}{" "}
                / {totalPages.toLocaleString(numberLocale)}
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
                  {tr("السابق", "Previous")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (canNext) setPage((prev) => Math.min(totalPages, prev + 1));
                  }}
                  disabled={!canNext || pendingNewsQuery.isFetching}
                  className="inline-flex h-[34px] items-center gap-1 rounded-[8px] border border-[#EAECF0] bg-white px-3 font-cairo text-[12px] font-bold text-[#344054] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {tr("التالي", "Next")}
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
          title={tr("إضافة خبر إلى طابور ingest", "Add news to ingest queue")}
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
                  {tr("العنوان", "Title")}
                </span>
                <input
                  value={ingestTitle}
                  onChange={(e) => setIngestTitle(e.target.value)}
                  placeholder={tr("عنوان الخبر", "News title")}
                  className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827] placeholder:text-[#98A2B3]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                  {tr("الملخص", "Summary")}
                </span>
                <textarea
                  value={ingestSummary}
                  onChange={(e) => setIngestSummary(e.target.value)}
                  rows={3}
                  placeholder={tr("ملخص مختصر اختياري", "Optional short summary")}
                  className="rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 font-cairo text-[12px] font-semibold text-[#111827] placeholder:text-[#98A2B3]"
                />
              </label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                    {tr("اللغة", "Language")}
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
                    {tr("تاريخ النشر", "Publish date")}
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
              ? tr("جارٍ الإدخال...", "Submitting...")
              : tr("إرسال إلى الطابور", "Send to queue")
          }
          confirmDisabled={ingestNewsMutation.isPending}
          onConfirm={submitNewsIngest}
        />
      </div>
    </>
  );
}
