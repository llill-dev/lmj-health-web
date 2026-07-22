import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Eye,
  Pencil,
  Plus,
  Send,
  SquarePen,
  FileCheck2,
  Clock3,
} from "lucide-react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import {
  CreateAdminContentDialog,
  EditAdminContentDialog,
} from "@/components/admin/medical-content";
import MedicalContentViewDialog from "@/components/admin/medical-content/dialogs/MedicalContentViewDialog";
import {
  contentStatusLabel,
  contentTypeLabel,
  formatContentDate,
} from "@/components/admin/medical-content/contentListUtils";
import {
  useAdminMyContentList,
  useSubmitContentReview,
} from "@/hooks/admin/content/useAdminContent";
import type {
  AdminContentStatus,
  AdminContentType,
  AdminContentListParams,
} from "@/lib/admin/types";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import { useToast } from "@/components/ui/ToastProvider";

const STATUS_FILTERS: Array<{ value: "all" | AdminContentStatus; label: string }> =
  [
    { value: "all", label: "الكل" },
    { value: "DRAFT", label: "مسودة" },
    { value: "IN_REVIEW", label: "قيد المراجعة" },
    { value: "PUBLISHED", label: "منشور" },
    { value: "ARCHIVED", label: "مؤرشف" },
  ];

const TYPE_FILTERS: Array<{ value: "all" | AdminContentType; label: string }> = [
  { value: "all", label: "كل الأنواع" },
  { value: "CONDITION", label: "الحالات الطبية" },
  { value: "SYMPTOM", label: "الأعراض" },
  { value: "GENERAL_ADVICE", label: "نصائح عامة" },
  { value: "MEDICATION", label: "الأدوية" },
  { value: "NEWS", label: "الأخبار" },
  { value: "SETTINGS_PAGE", label: "صفحات الإعدادات" },
];

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

export default function DataEntryMedicalContentPage() {
  const { toast } = useToast();

  const [status, setStatus] = useState<"all" | AdminContentStatus>("all");
  const [type, setType] = useState<"all" | AdminContentType>("all");
  const [language, setLanguage] = useState<"all" | "ar" | "en">("all");
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const params: AdminContentListParams = useMemo(
    () => ({
      ...(status !== "all" ? { status } : {}),
      ...(type !== "all" ? { type } : {}),
      ...(language !== "all" ? { language } : {}),
      page: 1,
      limit: 100,
    }),
    [language, status, type],
  );

  const query = useAdminMyContentList(params);
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

  const draftCount = useMemo(
    () => items.filter((item) => item.status === "DRAFT").length,
    [items],
  );
  const reviewCount = useMemo(
    () => items.filter((item) => item.status === "IN_REVIEW").length,
    [items],
  );

  async function handleSubmitReview(id: string) {
    try {
      await submitReview.mutateAsync({ id });
      toast("تم إرسال العنصر إلى المراجعة بنجاح.", {
        title: "تم الإرسال",
        variant: "success",
      });
    } catch (error) {
      toast(
        userFacingErrorMessage(
          error,
          "تعذر إرسال العنصر للمراجعة. تحقق من البيانات ثم حاول مرة أخرى.",
        ),
        { title: "تعذر الإرسال", variant: "error" },
      );
    }
  }

  return (
    <>
      <Helmet>
        <title>المحتوى الطبي • Data Entry • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="space-y-5">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title="محتواي الطبي"
          subtitle="إدارة عناصر المحتوى التي ينشئها فريق إدخال البيانات"
          headerIcon={<BookOpen className="h-8 w-8 text-white" />}
          actionLabel="إضافة عنصر جديد"
          actionIcon={<Plus className="h-4 w-4" />}
          onActionClick={() => setCreateOpen(true)}
          actionDisabled={query.isAwaitingData}
          kpiColumns={3}
          kpis={[
            {
              key: "total",
              icon: <SquarePen className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : filteredItems.length,
              label: "عناصري",
            },
            {
              key: "draft",
              icon: <FileCheck2 className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : draftCount,
              label: "مسودات",
            },
            {
              key: "review",
              icon: <Clock3 className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : reviewCount,
              label: "قيد المراجعة",
            },
          ]}
        />

        <section className="rounded-[12px] border border-[#E6EEF5] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث بالعنوان أو الوصف أو slug"
              className="h-10 rounded-[10px] border border-[#E5E7EB] px-3 text-right font-cairo text-[13px] font-semibold text-[#111827] outline-none focus:border-primary"
            />
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "all" | AdminContentStatus)
              }
              className="h-10 rounded-[10px] border border-[#E5E7EB] px-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none focus:border-primary"
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as "all" | AdminContentType)
              }
              className="h-10 rounded-[10px] border border-[#E5E7EB] px-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none focus:border-primary"
            >
              {TYPE_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as "all" | "ar" | "en")
              }
              className="h-10 rounded-[10px] border border-[#E5E7EB] px-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none focus:border-primary"
            >
              <option value="all">كل اللغات</option>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </section>

        {query.isError ? (
          <section className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-4 text-right">
            <p className="font-cairo text-[13px] font-extrabold text-[#B42318]">
              تعذر تحميل المحتوى.
            </p>
            <p className="mt-1 font-cairo text-[12px] font-semibold text-[#B42318]">
              {userFacingErrorMessage(query.error, "أعد المحاولة بعد قليل.")}
            </p>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-[12px] border border-[#E6EEF5] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="border-b border-[#EEF2F6] px-5 py-4 font-cairo text-[14px] font-extrabold text-[#111827]">
            قائمة المحتوى
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
            <div className="px-5 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              لا توجد عناصر مطابقة للفلاتر الحالية.
            </div>
          ) : (
            <div className="divide-y divide-[#EEF2F6]">
              {filteredItems.map((item) => {
                const titleText = toDisplayText(item.title);
                const summaryText = toDisplayText(item.summary);
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
                        {item.language === "en" ? "English" : "العربية"}
                      </span>
                      <span className="text-[#98A2B3]">
                        آخر تحديث: {formatContentDate(item.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingId(item._id)}
                      className="inline-flex h-9 items-center gap-1 rounded-[10px] border border-[#E5E7EB] px-3 font-cairo text-[12px] font-extrabold text-[#344054]"
                    >
                      <Eye className="h-4 w-4" />
                      عرض
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(item._id)}
                      className="inline-flex h-9 items-center gap-1 rounded-[10px] border border-[#E5E7EB] px-3 font-cairo text-[12px] font-extrabold text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                      تعديل
                    </button>
                    {item.status !== "IN_REVIEW" ? (
                      <button
                        type="button"
                        onClick={() => void handleSubmitReview(item._id)}
                        disabled={submitReview.isPending}
                        className="inline-flex h-9 items-center gap-1 rounded-[10px] border border-[#BFE3E1] bg-[#F7FFFE] px-3 font-cairo text-[12px] font-extrabold text-primary disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        إرسال للمراجعة
                      </button>
                    ) : null}
                  </div>
                </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <CreateAdminContentDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditAdminContentDialog
        open={editingId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingId(null);
        }}
        contentId={editingId}
      />

      <MedicalContentViewDialog
        open={viewingId !== null}
        onOpenChange={(open) => {
          if (!open) setViewingId(null);
        }}
        contentId={viewingId}
      />
    </>
  );
}
