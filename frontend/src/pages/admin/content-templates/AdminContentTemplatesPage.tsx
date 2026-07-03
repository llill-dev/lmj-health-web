import { Helmet } from "react-helmet-async";
import {
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

function parentTypeLabel(t?: string | Record<string, unknown>): string {
  if (!t) return "—";
  if (typeof t === "string") {
    if (t === "CONDITION") return "الحالات الطبية";
    if (t === "SYMPTOM") return "الأعراض";
    if (t === "GENERAL_ADVICE") return "نصائح عامة";
    if (t === "MEDICATION") return "الأدوية";
    return t;
  }
  // If t is an object, try to extract the value
  if (typeof t === "object" && t !== null) {
    const value =
      (t as Record<string, unknown>).en ??
      (t as Record<string, unknown>).ar ??
      JSON.stringify(t);
    return String(value);
  }
  return "—";
}

function isTemplateActive(t: AdminContentTemplate): boolean {
  return t.active ?? t.isActive ?? true;
}

export default function AdminContentTemplatesPage() {
  const [parentFilter, setParentFilter] = useState<ParentFilter>("الكل");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminContentTemplate | null>(null);
  const [disableTarget, setDisableTarget] =
    useState<AdminContentTemplate | null>(null);
  const [forceDisable, setForceDisable] = useState(false);
  const [referencedCount, setReferencedCount] = useState<number | null>(null);

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
  const disableMut = useDisableAdminContentTemplate();
  const templates = query.templates;

  const activeCount = useMemo(
    () => templates.filter((t) => isTemplateActive(t)).length,
    [templates],
  );
  const disabledCount = templates.length - activeCount;

  const disableSuccessToast: ConfirmSuccessToast | undefined = disableTarget
    ? {
        title: "تم التعطيل",
        message: `عُطّل القالب «${parentTypeLabel(disableTarget.name) ?? "—"}».`,
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
        <title>قوالب البيانات — المحتوى الطبي • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title="قوالب بيانات المحتوى"
          subtitle="عرّف الحقول الوصفية لكل نوع محتوى (حالة، عرَض، نصيحة، دواء)"
          headerIcon={<Layers className="h-8 w-8 text-white" />}
          actionLabel="إضافة قالب جديد"
          onActionClick={openCreate}
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
          <div className="mt-1.5 flex flex-wrap content-start justify-start gap-2 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFB] p-2">
            {PARENT_FILTERS.map((f) => (
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
            الحالة
          </div>
          <div className="mt-1.5 flex flex-wrap content-start justify-start gap-2 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFB] p-2">
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
          <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
                قوالب البيانات
              </div>
              <span className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 font-cairo text-[11px] font-extrabold text-[#667085]">
                {templates.length.toLocaleString("ar-SA")} قالب
              </span>
            </div>
          </div>

          <div className="divide-y divide-[#EEF2F6]">
            {query.isAwaitingData ? (
              <SkeletonList
                count={6}
                SkeletonComponent={ContentTemplateRowSkeleton}
              />
            ) : query.isError ? (
              <div className="px-6 py-6 font-cairo text-[12px] font-semibold text-[#B42318]">
                تعذّر تحميل قوالب البيانات.
              </div>
            ) : templates.length === 0 ? (
              <div className="px-6 py-6 font-cairo text-[12px] font-semibold text-[#667085]">
                لا توجد قوالب مطابقة للفلاتر الحالية.
              </div>
            ) : (
              templates.map((t) => {
                const active = isTemplateActive(t);
                return (
                  <div
                    key={t._id}
                    className="flex flex-col justify-between gap-3 px-6 py-5 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1 text-right">
                      <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3">
                        <div className="min-w-0 font-cairo text-[14px] font-black text-[#111827]">
                          {parentTypeLabel(t.name) ?? "—"}
                        </div>
                        <span className="inline-flex h-[22px] items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 font-cairo text-[11px] font-extrabold text-[#475467]">
                          {parentTypeLabel(t.parentType)}
                        </span>
                        <span
                          className={cn(
                            "inline-flex h-[22px] items-center justify-center rounded-[8px] border px-3 font-cairo text-[11px] font-extrabold",
                            active
                              ? "border-[#BBF7D0] bg-[#DCFCE7] text-[#16A34A]"
                              : "border-[#E5E7EB] bg-[#F3F4F6] text-[#667085]",
                          )}
                        >
                          {active ? "مفعّل" : "معطّل"}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-start gap-6 font-cairo text-[11px] font-bold text-[#98A2B3]">
                        <div className="inline-flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {(t.fields?.length ?? 0).toLocaleString("ar-SA")} حقل
                        </div>
                        {typeof t.schemaVersion === "number" ? (
                          <div className="inline-flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            إصدار المخطط: {t.schemaVersion}
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
                        aria-label="تعديل"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="font-cairo text-[11px] font-extrabold">
                          تعديل
                        </span>
                      </button>
                      {active ? (
                        <button
                          type="button"
                          onClick={() => openDisable(t)}
                          className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#FECACA] px-3 text-[#EF4444]"
                          aria-label="تعطيل"
                        >
                          <Ban className="h-4 w-4" />
                          <span className="font-cairo text-[11px] font-extrabold">
                            تعطيل
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
        title="تأكيد تعطيل القالب"
        icon={<Ban className="h-6 w-6" strokeWidth={2} aria-hidden />}
        description={
          referencedCount !== null ? (
            <>
              هذا القالب مرتبط بـ{" "}
              <span className="font-extrabold text-[#344054]">
                {referencedCount.toLocaleString("ar-SA")}
              </span>{" "}
              عنصر محتوى في حالة مسودة أو مراجعة. التعطيل الإجباري سيتجاوز هذا
              الارتباط.
            </>
          ) : (
            <>
              القالب: «
              <span className="font-extrabold text-[#344054]">
                {disableTarget?.name ?? "—"}
              </span>
              ». لن يكون متاحاً لإنشاء محتوى جديد بعد التعطيل.
            </>
          )
        }
        confirmLabel={referencedCount !== null ? "تعطيل إجباري" : "تعطيل"}
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
