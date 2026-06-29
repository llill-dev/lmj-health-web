import { Helmet } from "react-helmet-async";
import { Eye, Link as LinkIcon, Newspaper, Plus, RefreshCw } from "lucide-react";
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
import { formatContentDate, type LangFilter } from "@/components/admin/medical-content/contentListUtils";

export default function AdminMedicalNewsQueuePage() {
  const { toast } = useToast();
  const [langFilter, setLangFilter] = useState<LangFilter>("الكل");
  const [sourceUrl, setSourceUrl] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [ingestOpen, setIngestOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingContentId, setViewingContentId] = useState<string | null>(null);

  const [ingestSourceUrl, setIngestSourceUrl] = useState("");
  const [ingestTitle, setIngestTitle] = useState("");
  const [ingestSummary, setIngestSummary] = useState("");
  const [ingestPublishedAt, setIngestPublishedAt] = useState("");
  const [ingestLanguage, setIngestLanguage] = useState<"ar" | "en">("ar");

  const pendingNewsQuery = useAdminPendingNews({
    page: 1,
    limit: 12,
    ...(langFilter !== "الكل" ? { language: langFilter as "ar" | "en" } : {}),
    ...(sourceUrl.trim() ? { sourceUrl: sourceUrl.trim() } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  });
  const ingestNewsMutation = useIngestNews();

  const pendingItems = pendingNewsQuery.items;
  const pendingTotal = pendingNewsQuery.data?.total ?? pendingItems.length;
  const visibleItems = useMemo(() => pendingItems, [pendingItems]);

  async function submitNewsIngest() {
    const normalizedSourceUrl = ingestSourceUrl.trim();
    const normalizedTitle = ingestTitle.trim();
    if (!normalizedSourceUrl || !normalizedTitle) {
      toast("أدخل رابط المصدر والعنوان على الأقل.", {
        title: "بيانات ناقصة",
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

    toast("تمت إضافة الخبر إلى طابور الأخبار المعلّقة.", {
      title: "تمت الإضافة",
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
        <title>طابور الأخبار الطبية • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title="طابور الأخبار الطبية"
          subtitle="إدارة الأخبار المعلّقة القادمة من ingest قبل إدخالها في دورة التحرير والمراجعة"
          headerIcon={<Newspaper className="h-8 w-8 text-white" />}
          actionLabel="إضافة خبر إلى الطابور"
          onActionClick={() => setIngestOpen(true)}
          kpiColumns={3}
          kpis={[
            {
              key: "pending",
              icon: <Newspaper className="h-5 w-5 shrink-0" />,
              value: pendingNewsQuery.isAwaitingData ? "…" : pendingTotal.toLocaleString("ar-SA"),
              label: "إجمالي المعلّق",
            },
            {
              key: "visible",
              icon: <Eye className="h-5 w-5 shrink-0" />,
              value: pendingNewsQuery.isAwaitingData ? "…" : visibleItems.length,
              label: "المعروض الآن",
            },
            {
              key: "language",
              icon: <LinkIcon className="h-5 w-5 shrink-0" />,
              value: langFilter === "الكل" ? "AR/EN" : langFilter.toUpperCase(),
              label: "نطاق اللغة",
            },
          ]}
        />

        <section className="mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
                فلاتر الطابور
              </div>
              <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                ابحث حسب رابط المصدر أو الفترة الزمنية أو اللغة.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4 lg:min-w-[920px]">
              <label className="flex flex-col gap-1 text-right">
                <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                  Source URL
                </span>
                <input
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://example.com/news/..."
                  dir="ltr"
                  className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827] placeholder:text-[#98A2B3]"
                />
              </label>
              <label className="flex flex-col gap-1 text-right">
                <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                  من تاريخ
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827]"
                />
              </label>
              <label className="flex flex-col gap-1 text-right">
                <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                  إلى تاريخ
                </span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827]"
                />
              </label>
              <div className="flex flex-col gap-1 text-right">
                <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                  اللغة
                </span>
                <LanguageModeToggle value={langFilter} onChange={setLangFilter} />
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
              تحديث
            </button>
          </div>
        </section>

        <section className="mt-5 space-y-3">
          {pendingNewsQuery.isAwaitingData ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              جاري تحميل الأخبار المعلّقة...
            </div>
          ) : pendingNewsQuery.isError ? (
            <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-8 text-center font-cairo text-[13px] font-semibold text-[#B42318]">
              تعذر تحميل طابور الأخبار.
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[#D0D5DD] bg-white px-6 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              لا توجد عناصر مطابقة في الطابور الحالي.
            </div>
          ) : (
            visibleItems.map((item) => (
              <article
                key={item._id ?? `${item.slug ?? item.title ?? "pending"}-${item.updatedAt ?? ""}`}
                className="rounded-[12px] border border-[#E5E7EB] bg-white px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.05)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 text-right">
                    <div className="flex flex-wrap items-center justify-start gap-2">
                      <span className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 font-cairo text-[10px] font-extrabold text-[#B54708]">
                        pending
                      </span>
                      <span className="rounded-full border border-[#D1FAE5] bg-[#ECFDF3] px-2.5 py-1 font-cairo text-[10px] font-extrabold text-[#027A48]">
                        {item.language ?? "—"}
                      </span>
                    </div>

                    <div className="mt-3 font-cairo text-[15px] font-extrabold text-[#111827]">
                      {item.title ?? "—"}
                    </div>
                    <div className="mt-1 font-cairo text-[12px] font-semibold leading-6 text-[#667085]">
                      {item.summary ?? "لا يوجد ملخص."}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-start gap-4 font-cairo text-[11px] font-bold text-[#667085]">
                      <span>آخر تحديث: {formatContentDate(item.updatedAt ?? item.createdAt)}</span>
                      {item.publishedAt ? (
                        <span>نُشر أصلًا: {formatContentDate(item.publishedAt)}</span>
                      ) : null}
                      {item.pageVersion ? <span>pageVersion: {item.pageVersion}</span> : null}
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
                        معاينة
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setIngestOpen(true)}
                      className="inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#BBF7D0] px-3 font-cairo text-[12px] font-extrabold text-[#15803D]"
                    >
                      <Plus className="h-4 w-4" />
                      ingest جديد
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        <MedicalContentViewDialog
          open={viewOpen}
          onOpenChange={(next) => {
            setViewOpen(next);
            if (!next) setViewingContentId(null);
          }}
          contentId={viewingContentId}
        />

        <ConfirmActionDialog
          open={ingestOpen}
          onOpenChange={(open) => {
            if (!ingestNewsMutation.isPending) setIngestOpen(open);
          }}
          variant="primary"
          title="إضافة خبر إلى طابور ingest"
          description={
            <div className="grid grid-cols-1 gap-3 text-right">
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
                  العنوان
                </span>
                <input
                  value={ingestTitle}
                  onChange={(e) => setIngestTitle(e.target.value)}
                  placeholder="عنوان الخبر"
                  className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827] placeholder:text-[#98A2B3]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                  الملخص
                </span>
                <textarea
                  value={ingestSummary}
                  onChange={(e) => setIngestSummary(e.target.value)}
                  rows={3}
                  placeholder="ملخص مختصر اختياري"
                  className="rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 font-cairo text-[12px] font-semibold text-[#111827] placeholder:text-[#98A2B3]"
                />
              </label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="font-cairo text-[11px] font-extrabold text-[#667085]">
                    اللغة
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
                    تاريخ النشر
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
          confirmLabel={ingestNewsMutation.isPending ? "جارٍ الإدخال..." : "إرسال إلى الطابور"}
          confirmDisabled={ingestNewsMutation.isPending}
          onConfirm={submitNewsIngest}
        />
      </div>
    </>
  );
}
