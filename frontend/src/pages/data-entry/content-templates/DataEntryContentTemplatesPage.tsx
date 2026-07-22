import { Helmet } from "react-helmet-async";
import { Layers, CheckCircle2, XCircle, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import { useAdminContentTemplates } from "@/hooks/admin/content-templates/useAdminContentTemplates";
import type {
  AdminContentTemplate,
  AdminContentTemplateParentType,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils/utils";

type ParentFilter = "الكل" | AdminContentTemplateParentType;
type ActiveFilter = "all" | "active" | "disabled";

const PARENT_FILTERS: { value: ParentFilter; label: string }[] = [
  { value: "الكل", label: "الكل" },
  { value: "CONDITION", label: "الحالات الطبية" },
  { value: "SYMPTOM", label: "الأعراض" },
  { value: "GENERAL_ADVICE", label: "نصائح عامة" },
  { value: "MEDICATION", label: "الأدوية" },
];

const ACTIVE_FILTERS: { value: ActiveFilter; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "active", label: "مفعّل" },
  { value: "disabled", label: "معطّل" },
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

function parentTypeLabel(t?: string | Record<string, unknown>): string {
  if (!t) return "—";
  if (typeof t === "string") {
    if (t === "CONDITION") return "الحالات الطبية";
    if (t === "SYMPTOM") return "الأعراض";
    if (t === "GENERAL_ADVICE") return "نصائح عامة";
    if (t === "MEDICATION") return "الأدوية";
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
  const [parentFilter, setParentFilter] = useState<ParentFilter>("الكل");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const listParams = useMemo(
    () => ({
      ...(parentFilter !== "الكل" ? { parentType: parentFilter } : {}),
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
        <title>قوالب المحتوى • Data Entry • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title="قوالب المحتوى المتاحة"
          subtitle="مرجع سريع لحقول القوالب التي يستخدمها فريق إدخال البيانات"
          headerIcon={<Layers className="h-8 w-8 text-white" />}
          kpiColumns={3}
          kpis={[
            {
              key: "total",
              icon: <Layers className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : templates.length,
              label: "إجمالي القوالب",
            },
            {
              key: "active",
              icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : activeCount,
              label: "مفعّلة",
            },
            {
              key: "disabled",
              icon: <XCircle className="h-5 w-5 shrink-0" />,
              value: query.isAwaitingData ? "…" : disabledCount,
              label: "معطّلة",
            },
          ]}
        />

        <section className="mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] sm:px-6 sm:py-6">
          <div className="font-cairo text-[11px] font-extrabold text-[#98A2B3]">
            النوع الأب
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
            الحالة
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
        </section>

        <section className="mt-5 overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2 border-b border-[#EEF2F6] px-6 py-4">
            <Layers className="h-4 w-4 text-primary" />
            <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
              قائمة القوالب
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
                تعذر تحميل قوالب المحتوى حالياً.
              </div>
            ) : templates.length === 0 ? (
              <div className="px-6 py-6 font-cairo text-[12px] font-semibold text-[#667085]">
                لا توجد قوالب مطابقة للفلاتر الحالية.
              </div>
            ) : (
              templates.map((template) => {
                const active = isTemplateActive(template);
                const templateName = toDisplayText(template.name);
                const templateSlug = toDisplayText(template.slug);
                return (
                  <article
                    key={template._id}
                    className="flex flex-col gap-2 px-6 py-5 text-right"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-cairo text-[14px] font-black text-[#111827]">
                        {templateName || "بدون اسم"}
                      </h3>
                      <span className="inline-flex h-[22px] items-center rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 font-cairo text-[11px] font-extrabold text-[#475467]">
                        {parentTypeLabel(template.parentType)}
                      </span>
                      <span
                        className={cn(
                          "inline-flex h-[22px] items-center rounded-[8px] border px-3 font-cairo text-[11px] font-extrabold",
                          active
                            ? "border-[#BBF7D0] bg-[#DCFCE7] text-[#16A34A]"
                            : "border-[#E5E7EB] bg-[#F3F4F6] text-[#667085]",
                        )}
                      >
                        {active ? "مفعّل" : "معطّل"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-5 font-cairo text-[11px] font-bold text-[#98A2B3]">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {(template.fields?.length ?? 0).toLocaleString("ar-SA")}{" "}
                        حقل
                      </span>
                      {templateSlug ? (
                        <span dir="ltr">{templateSlug}</span>
                      ) : null}
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
