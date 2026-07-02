import { Helmet } from "react-helmet-async";
import {
  Ban,
  CheckCircle2,
  Clock,
  Stethoscope,
  UserX,
  UserPlus,
} from "lucide-react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import AdminSearchFiltersBar from "@/components/admin/AdminSearchFiltersBar";
import DoctorListCard from "@/components/admin/doctors/DoctorListCard";
import StyledSelect from "@/components/ui/styled-select";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAdminDoctors } from "@/hooks/admin/doctors/useAdminDoctors";
import type { AdminDoctorApprovalStatus } from "@/lib/admin/types";
import OffboardDialog from "@/components/admin/secretaries/dialogs/OffboardDialog";
import ReboardDialog from "@/components/admin/users/ReboardDialog";
import { phoneComparisonKey } from "@/lib/phone/formatPhoneForDisplay";
import { adminApi } from "@/lib/admin/client";
import { normalizeAdminDoctorDetailsResponse } from "@/lib/admin/doctors/normalizeAdminDoctorDetailsResponse";
import { resolveAdminDoctorUserId } from "@/lib/admin/doctors/resolveAdminDoctorUserId";
import { isAdminDoctorOffboarded } from "@/lib/admin/doctors/isAdminDoctorOffboarded";
import { useToast } from "@/components/ui/ToastProvider";
import { DoctorCardSkeleton } from "@/components/admin/skeletons/DoctorCardSkeleton";

const TEAL = "#108B8B";

export default function AdminDoctorsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const specializationParam = searchParams.get("specialization") ?? "";

  const [filters, setFilters] = useState<{
    search: string;
    specialization: string;
    status: AdminDoctorApprovalStatus | "";
    city: string;
    country: string;
    from: string;
    to: string;
    page: number;
    limit: number;
  }>({
    search: "",
    specialization: "",
    status: "",
    city: "",
    country: "",
    from: "",
    to: "",
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    setFilters((prev) =>
      prev.specialization === specializationParam
        ? prev
        : { ...prev, specialization: specializationParam, page: 1 },
    );
  }, [specializationParam]);

  const { doctors, total, results, isAwaitingData, error, refetch } =
    useAdminDoctors({
      search: filters.search || undefined,
      specialization: filters.specialization || undefined,
      status: filters.status || undefined,
      city: filters.city || undefined,
      country: filters.country || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      page: filters.page,
      limit: filters.limit,
    });

  const [offboardOpen, setOffboardOpen] = useState(false);
  const [offboardTarget, setOffboardTarget] = useState<{
    userId: string;
    doctorId: string;
    label: string;
  } | null>(null);
  const [reboardOpen, setReboardOpen] = useState(false);
  const [reboardTarget, setReboardTarget] = useState<{
    userId: string;
    doctorId: string;
    label: string;
  } | null>(null);

  const duplicatePhoneKeys = useMemo(() => {
    const counts = new Map<string, number>();
    for (const doctor of doctors) {
      const key = phoneComparisonKey(doctor.user?.phone);
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return new Set(
      [...counts.entries()]
        .filter(([, count]) => count > 1)
        .map(([key]) => key),
    );
  }, [doctors]);

  const totalPages = useMemo(() => {
    const safeLimit = Math.max(1, filters.limit);
    const pages = Math.ceil((total || 0) / safeLimit);
    return pages || 1;
  }, [filters.limit, total]);

  const stats = useMemo(() => {
    const approvedCount = doctors.filter(
      (d) => d.approvalStatus === "approved" && !isAdminDoctorOffboarded(d),
    ).length;
    const pendingCount = doctors.filter(
      (d) => d.approvalStatus === "pending" && !isAdminDoctorOffboarded(d),
    ).length;
    const rejectedCount = doctors.filter(
      (d) => d.approvalStatus === "rejected" && !isAdminDoctorOffboarded(d),
    ).length;
    const offboardedCount = doctors.filter(isAdminDoctorOffboarded).length;

    return [
      ...(offboardedCount > 0
        ? [
            {
              title: "موقوف" as const,
              value: offboardedCount,
              icon: UserX,
              tone: {
                border: "border-[#FCA5A5]",
                bg: "bg-[#FEF2F2]",
                iconBg: "bg-[#FEE2E2]",
                iconColor: "text-[#991B1B]",
                valueColor: "text-[#991B1B]",
              },
            },
          ]
        : []),
      {
        title: "مرفوض" as const,
        value: rejectedCount,
        icon: Ban,
        tone: {
          border: "border-[#FECACA]",
          bg: "bg-[#FFF5F5]",
          iconBg: "bg-[#FEE2E2]",
          iconColor: "text-[#EF4444]",
          valueColor: "text-[#EF4444]",
        },
      },
      {
        title: "معلّق" as const,
        value: pendingCount,
        icon: Clock,
        tone: {
          border: "border-[#E5E7EB]",
          bg: "bg-white",
          iconBg: "bg-[#F3F4F6]",
          iconColor: "text-[#475467]",
          valueColor: "text-[#111827]",
        },
      },
      {
        title: "مقبول" as const,
        value: approvedCount,
        icon: CheckCircle2,
        tone: {
          border: "border-[#BBF7D0]",
          bg: "bg-[#F0FDF4]",
          iconBg: "bg-[#DCFCE7]",
          iconColor: "text-[#16A34A]",
          valueColor: "text-[#16A34A]",
        },
      },
      {
        title: "إجمالي الأطباء" as const,
        value: total,
        icon: Stethoscope,
        tone: {
          border: "border-[#CFFAFE]",
          bg: "bg-[#ECFEFF]",
          iconBg: "bg-primary/15",
          iconColor: "text-primary",
          valueColor: "text-primary",
        },
      },
    ];
  }, [doctors, total]);

  return (
    <>
      <Helmet>
        <title>إدارة الأطباء • LMJ Health</title>
      </Helmet>

      <div
        dir="rtl"
        lang="ar"
        className="mx-auto w-full max-w-[1600px] px-3 pb-6 sm:px-4 md:px-6"
      >
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title="إدارة الأطباء"
          subtitle="إدارة ومتابعة بيانات الأطباء"
          headerIcon={<Stethoscope className="h-8 w-8 text-white" />}
          kpiColumns={4}
          kpis={stats.map((c) => {
            const Icon = c.icon;
            return {
              key: c.title,
              icon: <Icon className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : c.value,
              label: c.title,
            };
          })}
        />

        <AdminSearchFiltersBar
          queryPlaceholder="ابحث عن طبيب..."
          specialtyPlaceholder="الاختصاص"
          specialtyOptions={[
            { label: "طب الأطفال", value: "pediatrics" },
            { label: "طب الأسرة", value: "family" },
          ]}
          statusPlaceholder="الحالة"
          statusOptions={[
            { label: "مقبول", value: "approved" },
            { label: "معلّق", value: "pending" },
            { label: "مرفوض", value: "rejected" },
          ]}
          filtersLeading={
            <div className="flex w-full min-w-0 flex-wrap content-stretch items-center gap-2 sm:gap-3">
              <input
                value={filters.city}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    city: e.target.value,
                    page: 1,
                  }))
                }
                placeholder="المدينة"
                className="h-[42px] min-w-0 flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3] sm:min-w-[120px] sm:flex-none sm:w-[140px] sm:px-4"
              />
              <input
                value={filters.country}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    country: e.target.value,
                    page: 1,
                  }))
                }
                placeholder="الدولة"
                className="h-[42px] min-w-0 flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3] sm:min-w-[120px] sm:flex-none sm:w-[140px] sm:px-4"
              />
              <input
                type="date"
                value={filters.from}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    from: e.target.value,
                    page: 1,
                  }))
                }
                className="h-[42px] min-w-0 flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-right font-cairo text-[12px] font-bold text-[#111827] sm:w-[150px] sm:flex-none sm:px-4"
              />
              <input
                type="date"
                value={filters.to}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    to: e.target.value,
                    page: 1,
                  }))
                }
                className="h-[42px] min-w-0 flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-right font-cairo text-[12px] font-bold text-[#111827] sm:w-[150px] sm:flex-none sm:px-4"
              />
            </div>
          }
          onChange={(values) => {
            setFilters((prev) => ({
              ...prev,
              search: values.query ?? "",
              specialization: values.specialty ?? "",
              status: (values.status as AdminDoctorApprovalStatus) ?? "",
              page: 1,
            }));
          }}
        />

        <section className="mt-4 overflow-hidden rounded-[12px] border border-[#E8ECEF] bg-[#F8F9FA] shadow-[0_4px_24px_rgba(0,0,0,0.05)] sm:mt-5">
          <div className="flex items-center justify-between border-b border-[#E8ECEF] bg-white px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-2">
              <Stethoscope
                className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
                style={{ color: TEAL }}
                aria-hidden
              />
              <div className="truncate font-cairo text-sm font-black text-[#1F2937] sm:text-[16px]">
                قائمة الأطباء ({results})
              </div>
            </div>
          </div>

          <div className="space-y-3 p-3 sm:space-y-4 sm:p-5">
            {isAwaitingData ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <DoctorCardSkeleton key={i} index={i} />
                ))}
              </>
            ) : error ? (
              <div className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#B42318]">
                فشل تحميل قائمة الأطباء
              </div>
            ) : doctors.length === 0 ? (
              <div className="rounded-[10px] border border-[#E8ECEF] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                لا يوجد أطباء مطابقون لخيارات البحث.
              </div>
            ) : (
              doctors.map((d) => {
                const phoneKey = phoneComparisonKey(d.user?.phone);
                return (
                  <DoctorListCard
                    key={d._id}
                    doctor={d}
                    isDuplicatePhone={
                      phoneKey != null && duplicatePhoneKeys.has(phoneKey)
                    }
                    onDetails={() =>
                      navigate(`/admin/doctors/${encodeURIComponent(d._id)}`)
                    }
                    onOffboard={async (target) => {
                      let userId = target.userId ?? null;
                      if (!userId) {
                        try {
                          const details = normalizeAdminDoctorDetailsResponse(
                            await adminApi.doctors.getById(target.doctorId),
                          );
                          userId = resolveAdminDoctorUserId(details.doctor);
                        } catch {
                          toast(
                            "تعذّر تحميل معرف المستخدم لإيقاف الحساب. افتح التفاصيل وحاول مجدداً.",
                            {
                              title: "تعذّر الإيقاف",
                              variant: "error",
                            },
                          );
                          return;
                        }
                      }
                      if (!userId) {
                        toast(
                          "لم يُعثَر على معرف المستخدم المرتبط بهذا الطبيب.",
                          {
                            title: "تعذّر الإيقاف",
                            variant: "error",
                          },
                        );
                        return;
                      }
                      setOffboardTarget({
                        userId,
                        doctorId: target.doctorId,
                        label: target.label,
                      });
                      setOffboardOpen(true);
                    }}
                    onReboard={async (target) => {
                      let userId = target.userId ?? null;
                      if (!userId) {
                        try {
                          const details = normalizeAdminDoctorDetailsResponse(
                            await adminApi.doctors.getById(target.doctorId),
                          );
                          userId = resolveAdminDoctorUserId(details.doctor);
                        } catch {
                          toast(
                            "تعذّر تحميل معرف المستخدم لتفعيل الحساب. افتح التفاصيل وحاول مجدداً.",
                            {
                              title: "تعذّر التفعيل",
                              variant: "error",
                            },
                          );
                          return;
                        }
                      }
                      if (!userId) {
                        toast(
                          "لم يُعثَر على معرف المستخدم المرتبط بهذا الطبيب.",
                          {
                            title: "تعذّر التفعيل",
                            variant: "error",
                          },
                        );
                        return;
                      }
                      setReboardTarget({
                        userId,
                        doctorId: target.doctorId,
                        label: target.label,
                      });
                      setReboardOpen(true);
                    }}
                  />
                );
              })
            )}
          </div>
        </section>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="text-center font-cairo text-[11px] font-semibold text-[#667085] sm:text-right sm:text-[12px]">
            الصفحة {filters.page} من {totalPages}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-3">
            <StyledSelect
              className="w-full min-w-[110px] sm:w-[120px]"
              size="sm"
              tone="muted"
              value={String(filters.limit)}
              onChange={(v) => {
                const nextLimit = Number(v) || 20;
                setFilters((prev) => ({
                  ...prev,
                  limit: nextLimit,
                  page: 1,
                }));
              }}
              options={[
                { value: "20", label: "20 / صفحة" },
                { value: "50", label: "50 / صفحة" },
                { value: "100", label: "100 / صفحة" },
              ]}
              listboxAriaLabel="عدد النتائج في الصفحة"
            />

            <button
              type="button"
              disabled={isAwaitingData || filters.page <= 1}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              className={
                isAwaitingData || filters.page <= 1
                  ? "h-[38px] flex-1 rounded-[10px] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-bold text-[#98A2B3] sm:flex-none"
                  : "h-[38px] flex-1 rounded-[10px] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827] shadow-[0_10px_20px_rgba(0,0,0,0.06)] sm:flex-none"
              }
            >
              السابق
            </button>
            <button
              type="button"
              disabled={isAwaitingData || filters.page >= totalPages}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(totalPages, prev.page + 1),
                }))
              }
              className={
                isAwaitingData || filters.page >= totalPages
                  ? "h-[38px] flex-1 rounded-[10px] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-bold text-[#98A2B3] sm:flex-none"
                  : "h-[38px] flex-1 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(15, 143, 139,0.25)] sm:flex-none"
              }
            >
              التالي
            </button>
          </div>
        </div>

        <div className="h-4 sm:h-8" />
      </div>

      <OffboardDialog
        open={offboardOpen}
        onOpenChange={setOffboardOpen}
        targetUserId={offboardTarget?.userId ?? null}
        targetDoctorId={offboardTarget?.doctorId ?? null}
        targetLabel={offboardTarget?.label ?? ""}
        accountRole="doctor"
        onSuccess={() => {
          void refetch();
        }}
      />
      <ReboardDialog
        open={reboardOpen}
        onOpenChange={setReboardOpen}
        userId={reboardTarget?.userId || ""}
        userName={reboardTarget?.label || ""}
        onSuccess={() => {
          void refetch();
        }}
      />
    </>
  );
}
