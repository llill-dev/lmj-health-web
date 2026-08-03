import { Helmet } from "react-helmet-async";
import {
  AlertCircle,
  LayoutGrid,
  Pencil,
  Plus,
  Ban,
  Layers,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { useMemo, useState } from "react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import { ContentTemplateFormDialog } from "@/components/admin/content-templates";
import { ContentTemplateRowSkeleton } from "@/components/admin/skeletons/ContentTemplateRowSkeleton";
import { SkeletonList } from "@/components/admin/skeletons/SkeletonList";
import {
  ConfirmActionDialog,
  type ConfirmSuccessToast,
} from "@/components/admin/dialogs";
import {
  useAdminContentTemplates,
  useDisableAdminContentTemplate,
} from "@/hooks/admin/content-templates/useAdminContentTemplates";
import { ApiError } from "@/lib/api";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import type {
  AdminContentTemplate,
  AdminContentTemplateParentType,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils/utils";
import { useI18n } from "@/i18n/provider";

type ParentFilter = "all" | AdminContentTemplateParentType;
type ActiveFilter = "all" | "active" | "disabled";

function resolveLocalizedText(
  value: string | Record<string, unknown> | undefined,
  locale: "ar" | "en",
): string {
  if (!value) return "";
  if (typeof value === "string") return value;

  const localized =
    (locale === "ar" ? value.ar : value.en) ?? value.en ?? value.ar;

  return typeof localized === "string" ? localized : "";
}

function parentTypeLabel(
  t: string | Record<string, unknown> | undefined,
  tr: (ar: string, en: string) => string,
  locale: "ar" | "en",
): string {
  if (!t) return "—";
  if (typeof t === "string") {
    if (t === "CONDITION") return tr("الحالات الطبية", "Conditions");
    if (t === "SYMPTOM") return tr("الأعراض", "Symptoms");
    if (t === "GENERAL_ADVICE") return tr("نصائح عامة", "General advice");
    if (t === "MEDICATION") return tr("الأدوية", "Medications");
    return t;
  }

  return resolveLocalizedText(t, locale) || "—";
}

function isTemplateActive(t: AdminContentTemplate): boolean {
  return t.active ?? t.isActive ?? true;
}

export default function AdminContentTemplatesPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";

  const parentFilters: { value: ParentFilter; label: string }[] = [
    { value: "all", label: tr("الكل", "All") },
    { value: "CONDITION", label: tr("الحالات الطبية", "Conditions") },
    { value: "SYMPTOM", label: tr("الأعراض", "Symptoms") },
    { value: "GENERAL_ADVICE", label: tr("نصائح عامة", "General advice") },
    { value: "MEDICATION", label: tr("الأدوية", "Medications") },
  ];

  const activeFilters: { value: ActiveFilter; label: string }[] = [
    { value: "all", label: tr("الكل", "All") },
    { value: "active", label: tr("مفعّل", "Active") },
    { value: "disabled", label: tr("معطّل", "Disabled") },
  ];

  const [parentFilter, setParentFilter] = useState<ParentFilter>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminContentTemplate | null>(null);
  const [disableTarget, setDisableTarget] =
    useState<AdminContentTemplate | null>(null);
  const [forceDisable, setForceDisable] = useState(false);
  const [referencedCount, setReferencedCount] = useState<number | null>(null);

  const listParams = useMemo(
    () => ({
      ...(parentFilter !== "all" ? { parentType: parentFilter } : {}),
      ...(activeFilter === "active"
        ? { active: true }
        : activeFilter === "disabled"
          ? { active: false }
          : {}),
    }),
    [parentFilter, activeFilter],
  );

  const query = useAdminContentTemplates(listParams);
  const disableMut = useDisableAdminContentTemplate();
  const templates = query.templates;

  const activeCount = useMemo(
    () => templates.filter((t) => isTemplateActive(t)).length,
    [templates],
  );
  const disabledCount = templates.length - activeCount;
  const hasActiveFilters = parentFilter !== "all" || activeFilter !== "all";

  const disableSuccessToast: ConfirmSuccessToast | undefined = disableTarget
    ? {
        title: tr("تم التعطيل", "Disabled"),
        message: tr(
          `عُطّل القالب «${parentTypeLabel(disableTarget.name, tr, locale) ?? "—"}».`,
          `Template "${parentTypeLabel(disableTarget.name, tr, locale) ?? "—"}" has been disabled.`,
        ),
        variant: "success",
      }
    : undefined;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(t: AdminContentTemplate) {
    setEditing(t);
    setFormOpen(true);
  }

  function openDisable(t: AdminContentTemplate) {
    setDisableTarget(t);
    setForceDisable(false);
    setReferencedCount(null);
  }

  return (
    <>
      <Helmet>
        <title>
          {tr("قوالب البيانات — المحتوى الطبي", "Data templates — medical content")} •
          LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr("قوالب بيانات المحتوى", "Content data templates")}
          subtitle={tr(
            "عرّف الحقول الوصفية لكل نوع محتوى (حالة، عرَض، نصيحة، دواء)",
            "Define metadata fields for each content type (condition, symptom, advice, medication)",
          )}
          headerIcon={<Layers className="h-8 w-8 text-white" />}
          actionLabel={tr("إضافة قالب جديد", "Add new template")}
          onActionClick={openCreate}
          kpiColumns={3}
          kpis={[
            {
              key: "total",
              icon: <Layers className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : templates.length,
              label: tr("إجمالي القوالب", "Total templates"),
            },
            {
              key: "active",
              icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : activeCount,
              label: tr("مفعّلة", "Active"),
            },
            {
              key: "disabled",
              icon: <XCircle className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : disabledCount,
              label: tr("معطّلة", "Disabled"),
            },
          ]}
        />

        <section className="mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] sm:px-6 sm:py-6">
          <div className="font-cairo text-[11px] font-extrabold text-[#98A2B3]">
            {tr("النوع الأب", "Parent type")}
          </div>
          <div className="mt-1.5 flex flex-wrap content-start justify-start gap-2 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFB] p-2">
            {parentFilters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setParentFilter(f.value)}
                className={cn(
                  "inline-flex h-[34px] items-center gap-2 rounded-[10px] border px-4 font-cairo text-[12px] font-extrabold",
                  parentFilter === f.value
                    ? "border-primary bg-primary text-white"
                    : "border-[#E5E7EB] bg-white text-[#111827]",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-4 font-cairo text-[11px] font-extrabold text-[#98A2B3]">
            {tr("الحالة", "Status")}
          </div>
          <div className="mt-1.5 flex flex-wrap content-start justify-start gap-2 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFB] p-2">
            {activeFilters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  "inline-flex h-[30px] items-center justify-center rounded-[10px] border px-4 font-cairo text-[12px] font-extrabold",
                  activeFilter === f.value
                    ? "border-primary bg-primary text-white"
                    : "border-[#E5E7EB] bg-white text-[#111827]",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
                {tr("قوالب البيانات", "Data templates")}
              </div>
              <span className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 font-cairo text-[11px] font-extrabold text-[#667085]">
                {query.isAwaitingData
                  ? tr("جارٍ التحميل...", "Loading...")
                  : tr(
                      `${templates.length.toLocaleString(numberLocale)} قالب`,
                      `${templates.length.toLocaleString(numberLocale)} templates`,
                    )}
              </span>
              {query.isRefetching ? (
                <span className="rounded-full border border-[#D0D5DD] bg-white px-2.5 py-0.5 font-cairo text-[11px] font-extrabold text-[#667085]">
                  {tr("يتم التحديث...", "Refreshing...")}
                </span>
              ) : null}
            </div>
          </div>

          <div className="divide-y divide-[#EEF2F6]">
            {query.isAwaitingData ? (
              <SkeletonList
                count={6}
                SkeletonComponent={ContentTemplateRowSkeleton}
              />
            ) : query.isError ? (
              <div className="px-6 py-6">
                <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 text-start">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#B42318]" />
                      <div className="font-cairo text-[12px] font-semibold text-[#B42318]">
                        {userFacingErrorMessage(
                          query.error,
                          tr(
                            "تعذّر تحميل قوالب البيانات.",
                            "Failed to load data templates.",
                          ),
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void query.refetch()}
                      disabled={query.isRefetching}
                      className="inline-flex h-[32px] shrink-0 items-center justify-center rounded-[10px] border border-[#FECACA] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#B42318] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {tr("إعادة المحاولة", "Retry")}
                    </button>
                  </div>
                </div>
              </div>
            ) : templates.length === 0 ? (
              <div className="px-6 py-6 font-cairo text-[12px] font-semibold text-[#667085]">
                {hasActiveFilters
                  ? tr(
                      "لا توجد قوالب مطابقة للفلاتر الحالية.",
                      "No templates match the current filters.",
                    )
                  : tr(
                      "لا توجد قوالب بيانات حتى الآن.",
                      "No data templates have been created yet.",
                    )}
              </div>
            ) : (
              templates.map((t) => {
                const active = isTemplateActive(t);
                return (
                  <div
                    key={t._id}
                    className="flex flex-col justify-between gap-3 px-6 py-5 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1 text-start">
                      <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3">
                        <div className="min-w-0 font-cairo text-[14px] font-black text-[#111827]">
                          {parentTypeLabel(t.name, tr, locale) ?? "—"}
                        </div>
                        <span className="inline-flex h-[22px] items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 font-cairo text-[11px] font-extrabold text-[#475467]">
                          {parentTypeLabel(t.parentType, tr, locale)}
                        </span>
                        <span
                          className={cn(
                            "inline-flex h-[22px] items-center justify-center rounded-[8px] border px-3 font-cairo text-[11px] font-extrabold",
                            active
                              ? "border-[#BBF7D0] bg-[#DCFCE7] text-[#16A34A]"
                              : "border-[#E5E7EB] bg-[#F3F4F6] text-[#667085]",
                          )}
                        >
                          {active
                            ? tr("مفعّل", "Active")
                            : tr("معطّل", "Disabled")}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-start gap-6 font-cairo text-[11px] font-bold text-[#98A2B3]">
                        <div className="inline-flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {tr(
                            `${(t.fields?.length ?? 0).toLocaleString(numberLocale)} حقل`,
                            `${(t.fields?.length ?? 0).toLocaleString(numberLocale)} fields`,
                          )}
                        </div>
                        {typeof t.schemaVersion === "number" ? (
                          <div className="inline-flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            {tr(
                              `إصدار المخطط: ${t.schemaVersion}`,
                              `Schema version: ${t.schemaVersion}`,
                            )}
                          </div>
                        ) : null}
                        {t.slug ? (
                          <div
                            className="inline-flex items-center gap-2"
                            dir="ltr"
                          >
                            <LayoutGrid className="h-4 w-4" />
                            {t.slug}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-start">
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#E5E7EB] px-3 text-[#0F8F8B]"
                        aria-label={tr("تعديل", "Edit")}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="font-cairo text-[11px] font-extrabold">
                          {tr("تعديل", "Edit")}
                        </span>
                      </button>
                      {active ? (
                        <button
                          type="button"
                          onClick={() => openDisable(t)}
                          className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#FECACA] px-3 text-[#EF4444]"
                          aria-label={tr("تعطيل", "Disable")}
                        >
                          <Ban className="h-4 w-4" />
                          <span className="font-cairo text-[11px] font-extrabold">
                            {tr("تعطيل", "Disable")}
                          </span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <div className="h-8" />
      </div>

      <ContentTemplateFormDialog
        open={formOpen}
        onOpenChange={(next) => {
          setFormOpen(next);
          if (!next) setEditing(null);
        }}
        template={editing}
      />

      <ConfirmActionDialog
        open={disableTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDisableTarget(null);
            setForceDisable(false);
            setReferencedCount(null);
          }
        }}
        variant="destructive"
        title={tr("تأكيد تعطيل القالب", "Confirm template disable")}
        icon={<Ban className="h-6 w-6" strokeWidth={2} aria-hidden />}
        description={
          referencedCount !== null ? (
            <>
              {tr("هذا القالب مرتبط بـ", "This template is linked to")}{" "}
              <span className="font-extrabold text-[#344054]">
                {referencedCount.toLocaleString(numberLocale)}
              </span>{" "}
              {tr(
                "عنصر محتوى في حالة مسودة أو مراجعة. التعطيل الإجباري سيتجاوز هذا الارتباط.",
                "content items in draft or review state. Force disable will override this dependency.",
              )}
            </>
          ) : (
            <>
              {tr("القالب:", "Template:")} «
              <span className="font-extrabold text-[#344054]">
                {parentTypeLabel(disableTarget?.name, tr, locale) ?? "—"}
              </span>
              ».{" "}
              {tr(
                "لن يكون متاحاً لإنشاء محتوى جديد بعد التعطيل.",
                "It will not be available for creating new content after disabling.",
              )}
            </>
          )
        }
        confirmLabel={
          referencedCount !== null
            ? tr("تعطيل إجباري", "Force disable")
            : tr("تعطيل", "Disable")
        }
        confirmDisabled={disableMut.isPending}
        onConfirm={async () => {
          if (!disableTarget) return;
          try {
            await disableMut.mutateAsync({
              id: disableTarget._id,
              force: forceDisable,
            });
          } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
              const count = Number(
                (err.body as { referencedCount?: unknown })?.referencedCount ??
                  0,
              );
              setReferencedCount(Number.isFinite(count) ? count : 0);
              setForceDisable(true);
            }
            throw err;
          }
        }}
        successToast={disableSuccessToast}
      />
    </>
  );
}
