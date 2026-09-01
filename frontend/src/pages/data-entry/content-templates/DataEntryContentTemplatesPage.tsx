import { Helmet } from "react-helmet-async";
import { Layers, CheckCircle2, XCircle, FileText, Info, FilterX } from "lucide-react";
import { useMemo, useState } from "react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import { useAdminContentTemplates } from "@/hooks/admin/content-templates/useAdminContentTemplates";
import type {
  AdminContentTemplate,
  AdminContentTemplateParentType,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils/utils";
import { useI18n } from "@/i18n/provider";

type ParentFilter = "all" | AdminContentTemplateParentType;
type ActiveFilter = "all" | "active" | "disabled";

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

function parentTypeLabel(
  t?: string | Record<string, unknown>,
  translate?: (key: string, fallback?: string) => string,
): string {
  if (!t) return "—";
  if (typeof t === "string") {
    if (t === "CONDITION") return translate?.("content.type.condition", t) ?? t;
    if (t === "SYMPTOM") return translate?.("content.type.symptom", t) ?? t;
    if (t === "GENERAL_ADVICE")
      return translate?.("content.type.generalAdvice", t) ?? t;
    if (t === "MEDICATION") return translate?.("content.type.medication", t) ?? t;
    return t;
  }
  const value =
    (t as Record<string, unknown>).en ??
    (t as Record<string, unknown>).ar ??
    JSON.stringify(t);
  return String(value);
}

function isTemplateActive(t: AdminContentTemplate): boolean {
  return t.active ?? t.isActive ?? true;
}

export default function DataEntryContentTemplatesPage() {
  const { locale, dir, t } = useI18n();
  const PARENT_FILTERS: { value: ParentFilter; label: string }[] = [
    { value: "all", label: t("common.all") },
    { value: "CONDITION", label: t("content.type.condition") },
    { value: "SYMPTOM", label: t("content.type.symptom") },
    { value: "GENERAL_ADVICE", label: t("content.type.generalAdvice") },
    { value: "MEDICATION", label: t("content.type.medication") },
  ];
  const ACTIVE_FILTERS: { value: ActiveFilter; label: string }[] = [
    { value: "all", label: t("common.all") },
    { value: "active", label: t("common.active") },
    { value: "disabled", label: t("common.disabled") },
  ];
  const [parentFilter, setParentFilter] = useState<ParentFilter>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

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
  const templates = query.templates;

  const activeCount = useMemo(
    () => templates.filter((t) => isTemplateActive(t)).length,
    [templates],
  );
  const disabledCount = templates.length - activeCount;

  return (
    <>
      <Helmet>
        <title>{t("dataEntry.page.contentTemplates.title")}</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={t("dataEntry.contentTemplates.hero.title")}
          subtitle={t("dataEntry.contentTemplates.hero.subtitle")}
          headerIcon={<Layers className="h-8 w-8 text-white" />}
          kpiColumns={3}
          kpis={[
            {
              key: "total",
              icon: <Layers className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : templates.length,
              label: t("dataEntry.contentTemplates.kpi.total"),
            },
            {
              key: "active",
              icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : activeCount,
              label: t("dataEntry.contentTemplates.kpi.active"),
            },
            {
              key: "disabled",
              icon: <XCircle className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : disabledCount,
              label: t("dataEntry.contentTemplates.kpi.disabled"),
            },
          ]}
        />

        <section className="mt-5 rounded-[12px] border border-[#D5E8E6] bg-[#F8FFFE] px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)] sm:px-6">
          <div className="flex items-start gap-3 text-start">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
                {t("dataEntry.contentTemplates.reference.title")}
              </p>
              <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                {t("dataEntry.contentTemplates.reference.body")}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] sm:px-6 sm:py-6">
          <div className="font-cairo text-[11px] font-extrabold text-[#98A2B3]">
            {t("dataEntry.contentTemplates.filters.parentType")}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-2 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFB] p-2">
            {PARENT_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setParentFilter(f.value)}
                className={cn(
                  "inline-flex h-[34px] items-center rounded-[10px] border px-4 font-cairo text-[12px] font-extrabold",
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
            {t("dataEntry.contentTemplates.filters.status")}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-2 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFB] p-2">
            {ACTIVE_FILTERS.map((f) => (
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
          {parentFilter !== "all" || activeFilter !== "all" ? (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setParentFilter("all");
                  setActiveFilter("all");
                }}
                className="inline-flex h-9 items-center gap-1 rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#344054]"
              >
                <FilterX className="h-4 w-4" />
                {t("common.clearFilters")}
              </button>
            </div>
          ) : null}
        </section>

        <section className="mt-5 overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2 border-b border-[#EEF2F6] px-6 py-4">
            <Layers className="h-4 w-4 text-primary" />
            <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
                {t("dataEntry.contentTemplates.list.title")}
            </div>
          </div>

          <div className="divide-y divide-[#EEF2F6]">
            {query.isAwaitingData ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-16 animate-pulse rounded-[10px] bg-[#F3F4F6]"
                  />
                ))}
              </div>
            ) : query.isError ? (
              <div className="px-6 py-6 font-cairo text-[12px] font-semibold text-[#B42318]">
                {t("dataEntry.contentTemplates.list.error")}
              </div>
            ) : templates.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F4F7] text-[#98A2B3]">
                  <Layers className="h-5 w-5" />
                </div>
                <p className="mt-3 font-cairo text-[13px] font-extrabold text-[#344054]">
                  {t("dataEntry.contentTemplates.list.empty")}
                </p>
                <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                  {t("dataEntry.contentTemplates.list.emptyHint")}
                </p>
              </div>
            ) : (
              templates.map((template) => {
                const active = isTemplateActive(template);
                const templateName = toDisplayText(template.name);
                const templateSlug = toDisplayText(template.slug);
                return (
                  <article
                    key={template._id}
                    className="flex flex-col gap-2 px-6 py-5 text-start"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-cairo text-[14px] font-black text-[#111827]">
                        {templateName || t("dataEntry.contentTemplates.unnamed")}
                      </h3>
                      <span className="inline-flex h-[22px] items-center rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 font-cairo text-[11px] font-extrabold text-[#475467]">
                        {parentTypeLabel(template.parentType, t)}
                      </span>
                      <span
                        className={cn(
                          "inline-flex h-[22px] items-center rounded-[8px] border px-3 font-cairo text-[11px] font-extrabold",
                          active
                            ? "border-[#BBF7D0] bg-[#DCFCE7] text-[#16A34A]"
                            : "border-[#E5E7EB] bg-[#F3F4F6] text-[#667085]",
                        )}
                      >
                        {active ? t("common.active") : t("common.disabled")}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-5 font-cairo text-[11px] font-bold text-[#98A2B3]">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {(template.fields?.length ?? 0).toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}{" "}
                        {t("dataEntry.contentTemplates.fieldsCount")}
                      </span>
                      {templateSlug ? (
                        <span dir="ltr">{templateSlug}</span>
                      ) : null}
                      <span className="rounded-[8px] bg-[#F8FAFC] px-2 py-1 text-[#667085]">
                        {t("dataEntry.contentTemplates.reference.badge")}
                      </span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </>
  );
}
