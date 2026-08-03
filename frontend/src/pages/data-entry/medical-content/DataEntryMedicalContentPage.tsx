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
  FilterX,
  UserRound,
  Workflow,
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
import StyledSelect from "@/components/ui/styled-select";
import type {
  AdminContentStatus,
  AdminContentType,
  AdminContentListParams,
} from "@/lib/admin/types";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import { useToast } from "@/components/ui/ToastProvider";
import { useI18n } from "@/i18n/provider";

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
  if (status === "PUBLISHED") {
    return t(
      "dataEntry.medicalContent.workflow.published",
      "محتوى منشور ومرئي للمستخدمين حسب القنوات المعتمدة.",
    );
  }
  return t(
    "dataEntry.medicalContent.workflow.archived",
    "محتوى مؤرشف للاحتفاظ المرجعي وليس للعمل اليومي.",
  );
}

export default function DataEntryMedicalContentPage() {
  const { toast } = useToast();
  const { locale, dir, t } = useI18n();
  const STATUS_FILTERS: Array<{ value: "all" | AdminContentStatus; label: string }> = [
    { value: "all", label: t("common.all") },
    { value: "DRAFT", label: t("content.status.draft") },
    { value: "IN_REVIEW", label: t("content.status.inReview") },
    { value: "PUBLISHED", label: t("content.status.published") },
    { value: "ARCHIVED", label: t("content.status.archived") },
  ];
  const TYPE_FILTERS: Array<{ value: "all" | AdminContentType; label: string }> = [
    { value: "all", label: t("content.type.all") },
    { value: "CONDITION", label: t("content.type.condition") },
    { value: "SYMPTOM", label: t("content.type.symptom") },
    { value: "GENERAL_ADVICE", label: t("content.type.generalAdvice") },
    { value: "MEDICATION", label: t("content.type.medication") },
    { value: "NEWS", label: t("content.type.news") },
    { value: "SETTINGS_PAGE", label: t("content.type.settingsPage") },
  ];

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
              value: query.isAwaitingData ? "…" : filteredItems.length,
              label: t("dataEntry.medicalContent.kpi.myItems"),
            },
            {
              key: "draft",
              icon: <FileCheck2 className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : draftCount,
              label: t("dataEntry.medicalContent.kpi.drafts"),
            },
            {
              key: "review",
              icon: <Clock3 className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : reviewCount,
              label: t("dataEntry.medicalContent.kpi.inReview"),
            },
          ]}
        />

        <section className="rounded-[12px] border border-[#E6EEF5] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("dataEntry.medicalContent.filters.searchPlaceholder")}
              className="h-10 rounded-[10px] border border-[#E5E7EB] px-3 text-right font-cairo text-[13px] font-semibold text-[#111827] outline-none focus:border-primary"
            />
            <StyledSelect
              value={status}
              onChange={(value) => setStatus(value as "all" | AdminContentStatus)}
              options={STATUS_FILTERS}
              listboxAriaLabel={t("dataEntry.medicalContent.filters.status")}
              triggerClassName="h-10 rounded-[10px]"
            />
            <StyledSelect
              value={type}
              onChange={(value) => setType(value as "all" | AdminContentType)}
              options={TYPE_FILTERS}
              listboxAriaLabel={t("dataEntry.medicalContent.filters.type")}
              triggerClassName="h-10 rounded-[10px]"
            />
            <StyledSelect
              value={language}
              onChange={(value) => setLanguage(value as "all" | "ar" | "en")}
              options={[
                { value: "all", label: t("content.language.all") },
                { value: "ar", label: t("language.ar") },
                { value: "en", label: t("language.en") },
              ]}
              listboxAriaLabel={t("dataEntry.medicalContent.filters.language")}
              triggerClassName="h-10 rounded-[10px]"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#EEF2F6] bg-[#FAFBFC] px-4 py-3">
            <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#475467]">
              <Workflow className="h-4 w-4 text-primary" />
              {t(
                "dataEntry.medicalContent.workflow.caption",
                "دورة العمل: مسودة ← قيد المراجعة ← منشور / مؤرشف",
              )}
            </div>
            {(status !== "all" || type !== "all" || language !== "all" || search.trim()) ? (
              <button
                type="button"
                onClick={() => {
                  setStatus("all");
                  setType("all");
                  setLanguage("all");
                  setSearch("");
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
            {t("dataEntry.medicalContent.list.title")}
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
                {t("dataEntry.medicalContent.list.empty")}
              </p>
              <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                {t(
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
                    {item.status !== "IN_REVIEW" ? (
                      <button
                        type="button"
                        onClick={() => void handleSubmitReview(item._id)}
                        disabled={submitReview.isPending || item.status !== "DRAFT"}
                        className="inline-flex h-9 items-center gap-1 rounded-[10px] border border-[#BFE3E1] bg-[#F7FFFE] px-3 font-cairo text-[12px] font-extrabold text-primary disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        {t("dataEntry.medicalContent.actions.submitReview")}
                      </button>
                    ) : (
                      <span className="inline-flex h-9 items-center rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 font-cairo text-[12px] font-extrabold text-[#667085]">
                        {t(
                          "dataEntry.medicalContent.actions.alreadyInReview",
                          "قيد المراجعة حاليًا",
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
