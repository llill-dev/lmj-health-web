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
  locale: "ar" | "en",
): string {
  if (!t) return "—";
  if (typeof t === "string") {
    if (t === "CONDITION")
      return locale === "ar" ? "الحالات الطبية" : "Conditions";
    if (t === "SYMPTOM") return locale === "ar" ? "الأعراض" : "Symptoms";
    if (t === "GENERAL_ADVICE")
      return locale === "ar" ? "نصائح عامة" : "General advice";
    if (t === "MEDICATION") return locale === "ar" ? "الأدوية" : "Medications";
    return t;
  }

  return resolveLocalizedText(t, locale) || "—";
}

function isTemplateActive(t: AdminContentTemplate): boolean {
  return t.active ?? t.isActive ?? true;
}

export default function AdminContentTemplatesPage() {
  const { t, locale, dir } = useI18n();
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";

  const parentFilters: { value: ParentFilter; label: string }[] = [
    { value: "all", label: t("admin.contentTemplates.all") },
    {
      value: "CONDITION",
      label: t("admin.contentTemplates.parentTypeCondition"),
    },
    { value: "SYMPTOM", label: t("admin.contentTemplates.parentTypeSymptom") },
    {
      value: "GENERAL_ADVICE",
      label: t("admin.contentTemplates.parentTypeGeneralAdvice"),
    },
    {
      value: "MEDICATION",
      label: t("admin.contentTemplates.parentTypeMedication"),
    },
  ];

  const activeFilters: { value: ActiveFilter; label: string }[] = [
    { value: "all", label: t("admin.contentTemplates.all") },
    { value: "active", label: t("admin.contentTemplates.active") },
    { value: "disabled", label: t("admin.contentTemplates.disabled") },
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
        title: t("admin.contentTemplates.disabledTitle"),
        message: t("admin.contentTemplates.disabledMessage").replace(
          "{name}",
          parentTypeLabel(disableTarget.name, locale) ?? "—",
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
        <title>{t("admin.contentTemplates.page.title")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={t("admin.contentTemplates.subtitle")}
          subtitle={t("admin.contentTemplates.description")}
          headerIcon={<Layers className="h-8 w-8 text-white" />}
          actionLabel={t("admin.contentTemplates.addNewTemplate")}
          onActionClick={openCreate}
          kpiColumns={3}
          kpis={[
            {
              key: "total",
              icon: <Layers className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : templates.length,
              label: t("admin.contentTemplates.totalTemplates"),
            },
            {
              key: "active",
              icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : activeCount,
              label: t("admin.contentTemplates.active"),
            },
            {
              key: "disabled",
              icon: <XCircle className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : disabledCount,
              label: t("admin.contentTemplates.disabled"),
            },
          ]}
        />

        <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] px-4 py-3 text-start">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#175CD3]" />
          <div className="font-cairo text-[12px] font-bold leading-6 text-[#175CD3]">
            {t("admin.contentTemplates.disclaimer")}
          </div>
        </div>

        <section className="mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] sm:px-6 sm:py-6">
          <div className="font-cairo text-[11px] font-extrabold text-[#98A2B3]">
            {t("admin.contentTemplates.parentType")}
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
            {t("admin.contentTemplates.status")}
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
                {t("admin.contentTemplates.dataTemplates")}
              </div>
              <span className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 font-cairo text-[11px] font-extrabold text-[#667085]">
                {query.isAwaitingData
                  ? t("admin.contentTemplates.loading")
                  : t("admin.contentTemplates.templatesCount").replace(
                      "{count}",
                      templates.length.toLocaleString(numberLocale),
                    )}
              </span>
              {query.isRefetching ? (
                <span className="rounded-full border border-[#D0D5DD] bg-white px-2.5 py-0.5 font-cairo text-[11px] font-extrabold text-[#667085]">
                  {t("admin.contentTemplates.refreshing")}
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
                          t("admin.contentTemplates.loadError"),
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void query.refetch()}
                      disabled={query.isRefetching}
                      className="inline-flex h-[32px] shrink-0 items-center justify-center rounded-[10px] border border-[#FECACA] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#B42318] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {t("admin.contentTemplates.retry")}
                    </button>
                  </div>
                </div>
              </div>
            ) : templates.length === 0 ? (
              <div className="px-6 py-6 font-cairo text-[12px] font-semibold text-[#667085]">
                {hasActiveFilters
                  ? t("admin.contentTemplates.noMatchFilters")
                  : t("admin.contentTemplates.noTemplates")}
              </div>
            ) : (
              templates.map((template) => {
                const active = isTemplateActive(template);
                return (
                  <div
                    key={template._id}
                    className="flex flex-col justify-between gap-3 px-6 py-5 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1 text-start">
                      <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3">
                        <div className="min-w-0 font-cairo text-[14px] font-black text-[#111827]">
                          {parentTypeLabel(template.name, locale) ?? "—"}
                        </div>
                        <span className="inline-flex h-[22px] items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 font-cairo text-[11px] font-extrabold text-[#475467]">
                          {parentTypeLabel(template.parentType, locale)}
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
                            ? t("admin.contentTemplates.active")
                            : t("admin.contentTemplates.disabled")}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-start gap-6 font-cairo text-[11px] font-bold text-[#98A2B3]">
                        <div className="inline-flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {t("admin.contentTemplates.fieldsCount").replace(
                            "{count}",
                            (template.fields?.length ?? 0).toLocaleString(
                              numberLocale,
                            ),
                          )}
                        </div>
                        {typeof template.schemaVersion === "number" ? (
                          <div className="inline-flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            {t("admin.contentTemplates.schemaVersion").replace(
                              "{version}",
                              String(template.schemaVersion),
                            )}
                          </div>
                        ) : null}
                        {template.slug ? (
                          <div
                            className="inline-flex items-center gap-2"
                            dir="ltr"
                          >
                            <LayoutGrid className="h-4 w-4" />
                            {template.slug}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-start">
                      <button
                        type="button"
                        onClick={() => openEdit(template)}
                        className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#E5E7EB] px-3 text-[#0F8F8B]"
                        aria-label={t("admin.contentTemplates.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="font-cairo text-[11px] font-extrabold">
                          {t("admin.contentTemplates.edit")}
                        </span>
                      </button>
                      {active ? (
                        <button
                          type="button"
                          onClick={() => openDisable(template)}
                          className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#FECACA] px-3 text-[#EF4444]"
                          aria-label={t("admin.contentTemplates.disable")}
                        >
                          <Ban className="h-4 w-4" />
                          <span className="font-cairo text-[11px] font-extrabold">
                            {t("admin.contentTemplates.disable")}
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
        title={t("admin.contentTemplates.confirmDisable")}
        icon={<Ban className="h-6 w-6" strokeWidth={2} aria-hidden />}
        description={
          referencedCount !== null ? (
            <>
              {t("admin.contentTemplates.linkedTo")}{" "}
              <span className="font-extrabold text-[#344054]">
                {referencedCount.toLocaleString(numberLocale)}
              </span>{" "}
              {t("admin.contentTemplates.contentItems")}
            </>
          ) : (
            <>
              {t("admin.contentTemplates.templateLabel")} «
              <span className="font-extrabold text-[#344054]">
                {parentTypeLabel(disableTarget?.name, locale) ?? "—"}
              </span>
              ». {t("admin.contentTemplates.disableWarning")}
            </>
          )
        }
        confirmLabel={
          referencedCount !== null
            ? t("admin.contentTemplates.forceDisable")
            : t("admin.contentTemplates.disable")
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
