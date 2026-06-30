import { Helmet } from "react-helmet-async";
import {
  AlertCircle,
  ChevronLeft,
  Mail,
  Phone,
  Search,
  Stethoscope,
  UserMinus,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { useAdminSecretariesList } from "@/hooks/admin/secretaries/useAdminSecretaries";
import { useAdminDoctors } from "@/hooks/admin/doctors/useAdminDoctors";
import OffboardDialog from "@/components/admin/secretaries/dialogs/OffboardDialog";
import { SecretaryCardSkeleton } from "@/components/admin/secretaries/SecretaryCardSkeleton";
import { PERM_LABEL } from "@/components/admin/secretaries/secretaryPermissions";
import { resolveUserId } from "@/components/admin/secretaries/secretaryListUtils";
import DoctorTablePagination from "@/components/doctor/shared/doctor-table-pagination";
import StyledSelect from "@/components/ui/styled-select";
import type { AdminSecretarySummary } from "@/lib/admin/types";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";

/* ─── permission label map ──────────────────────────────────── */
/* ─── helpers ──────────────────────────────────────────────── */
/* ─── page ──────────────────────────────────────────────────── */
export default function AdminSecretariesPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 380);
  const [doctorIdFilter, setDoctorIdFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  /* offboard dialog state */
  const [offboardOpen, setOffboardOpen] = useState(false);
  const [offboardTarget, setOffboardTarget] = useState<{
    userId: string;
    label: string;
  } | null>(null);

  const { doctors: doctorOptions, isAwaitingData: doctorsListAwaiting } =
    useAdminDoctors({
      page: 1,
      limit: 200,
      status: "approved",
    });

  const { data, isAwaitingData, isError, refetch } = useAdminSecretariesList({
    search: debouncedSearch || undefined,
    doctorId: doctorIdFilter || undefined,
    page,
    limit: LIMIT,
  });

  const totalPages =
    data && data.total > 0 ? Math.max(1, Math.ceil(data.total / LIMIT)) : 0;

  const paginationRange = useMemo(() => {
    if (!data || data.total <= 0) return { start: 0, end: 0 };
    const start = (page - 1) * LIMIT + 1;
    const end = Math.min(page * LIMIT, data.total);
    return { start, end };
  }, [data, page]);

  const showPaginationBar =
    !isAwaitingData && !isError && data && data.total > 0;

  const openOffboard = useCallback((s: AdminSecretarySummary) => {
    const userId = resolveUserId(s);
    if (!userId) return;
    setOffboardTarget({ userId, label: s.user?.fullName ?? "هذا الحساب" });
    setOffboardOpen(true);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>إدارة السكرتارية • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title="إدارة السكرتارية"
          subtitle="مراقبة وإدارة حسابات السكرتيرين المرتبطين بالأطباء"
          headerIcon={<Users className="h-8 w-8 text-white" />}
          kpis={[
            {
              key: "total",
              icon: <Users className="h-5 w-5 shrink-0" />,
              value: isAwaitingData
                ? "—"
                : (data?.total ?? 0).toLocaleString("ar-EG"),
              label: "إجمالي السكرتارية",
            },
            {
              key: "doctors",
              icon: <Stethoscope className="h-5 w-5 shrink-0" />,
              value: doctorsListAwaiting ? "—" : doctorOptions.length,
              label: "أطباء مرتبطون",
            },
            {
              key: "page",
              icon: <Mail className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : (data?.results ?? 0),
              label: "في هذه الصفحة",
            },
          ]}
        />

        {/* ── فلاتر: بحث + طبيب (مطابقة GET /api/admin/secretaries) ── */}
        <div className="flex justify-between gap-16  items-center mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="relative flex-1">
            <input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="البحث بالاسم أو البريد أو الهاتف..."
              className="h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 pe-10 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition focus:border-primary placeholder:text-[#98A2B3]"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
          </div>

          <StyledSelect
            id="admin-secretary-doctor-filter"
            className="w-36 shrink-0"
            size="sm"
            tone="muted"
            value={doctorIdFilter}
            disabled={doctorsListAwaiting}
            onChange={(v) => {
              setDoctorIdFilter(v);
              setPage(1);
            }}
            placeholder="كل الأطباء"
            options={[
              { value: "", label: "كل الأطباء" },
              ...doctorOptions.map((d) => ({
                value: d._id,
                label: `${d.user?.fullName ?? d._id}${d.specialization ? ` — ${d.specialization}` : ""}`,
              })),
            ]}
            listboxAriaLabel="تصفية حسب الطبيب"
          />
          {doctorOptions.length >= 200 ? (
            <p className="mt-1.5 text-right font-cairo text-[10px] font-semibold text-[#98A2B3]">
              عُرضت أول 200 طبيب معتمد. استخدم البحث أعلاه لتضييق السكرتيرين.
            </p>
          ) : null}
        </div>

        {/* ── list ── */}
        <section className="mt-5 space-y-4">
          {isAwaitingData ? (
            <>
              <SecretaryCardSkeleton />
              <SecretaryCardSkeleton />
              <SecretaryCardSkeleton />
            </>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[#FEE2E2] bg-[#FEF2F2] px-6 py-10 text-center">
              <AlertCircle className="h-7 w-7 text-[#DC2626]" />
              <div className="font-cairo text-[14px] font-extrabold text-[#991B1B]">
                تعذّر تحميل البيانات
              </div>
              <button
                onClick={() => refetch()}
                className="mt-1 rounded-[8px] border border-[#FECACA] bg-white px-5 py-2 font-cairo text-[12px] font-extrabold text-[#DC2626]"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : data?.secretaries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-16 text-center">
              <Users className="h-10 w-10 text-[#D0D5DD]" />
              <div className="font-cairo text-[14px] font-extrabold text-[#667085]">
                {debouncedSearch
                  ? "لا توجد نتائج مطابقة للبحث"
                  : "لا يوجد سكرتيرون مسجلون"}
              </div>
            </div>
          ) : (
            data?.secretaries.map((s) => {
              const userId = resolveUserId(s);
              const perms = s.permissions ?? [];

              return (
                <div
                  key={s._id}
                  className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_14px_32px_rgba(0,0,0,0.09)]"
                >
                  <div className="px-6 py-5">
                    {/* top row */}
                    <div className="flex gap-3 justify-between items-start">
                      <div className="flex gap-3 items-center">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <div className="font-cairo text-[16px] font-black leading-[22px] text-[#111827]">
                            {s.user?.fullName ?? "—"}
                          </div>
                          <div className="mt-0.5 font-cairo text-[11px] font-bold text-[#98A2B3]">
                            سكرتير
                            {s.doctor?.user?.fullName
                              ? ` • ${s.doctor.user.fullName}`
                              : ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        {userId && (
                          <button
                            type="button"
                            onClick={() => openOffboard(s)}
                            title="إيقاف الحساب"
                            className="flex h-8 items-center gap-1.5 rounded-[8px] border border-[#FECACA] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#DC2626] transition hover:bg-[#FEF2F2]"
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                            إيقاف
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/secretaries/${s._id}`, {
                              state: { secretary: s },
                            })
                          }
                          title="ملف السكرتير"
                          className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary text-white shadow-sm transition hover:bg-primary/90"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* contact */}
                    <div className="flex flex-wrap gap-5 items-center mt-4">
                      {s.user?.phone && (
                        <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                          <Phone className="w-4 h-4 text-primary" />
                          {s.user.phone}
                        </div>
                      )}
                      {s.user?.email && (
                        <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                          <Mail className="w-4 h-4 text-primary" />
                          {s.user.email}
                        </div>
                      )}
                    </div>

                    {/* assigned doctor */}
                    {s.doctor && (
                      <div className="mt-4 flex items-center justify-between rounded-[10px] border border-[#BFEDEC] bg-[#E7FBFA] px-5 py-3">
                        <div className="flex gap-2 items-center text-primary">
                          <Stethoscope className="w-4 h-4" />
                          <span className="font-cairo text-[12px] font-extrabold">
                            الطبيب المسؤول
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                            {s.doctor.user?.fullName ?? "—"}
                          </div>
                          {s.doctor.specialization && (
                            <div className="mt-0.5 font-cairo text-[11px] font-semibold text-[#667085]">
                              {s.doctor.specialization}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* permissions */}
                    {perms.length > 0 && (
                      <div className="mt-4">
                        <div className="mb-2 font-cairo text-[11px] font-extrabold text-[#98A2B3]">
                          الصلاحيات ({perms.length})
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {perms.map((p) => (
                            <span
                              key={p}
                              className="rounded-full border border-[#E0F2FE] bg-[#F0F9FF] px-2.5 py-1 font-cairo text-[10px] font-extrabold text-[#0369A1]"
                            >
                              {PERM_LABEL[p] ?? p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* action buttons */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/secretaries/${s._id}/appointments`,
                              { state: { secretary: s } },
                            )
                          }
                          className="h-[30px] rounded-[8px] border border-primary bg-white px-4 font-cairo text-[11px] font-extrabold text-primary transition hover:bg-[#E7FBFA]"
                        >
                          عرض المواعيد
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/secretaries/${s._id}/appointments/manage`,
                              { state: { secretary: s } },
                            )
                          }
                          className="h-[30px] rounded-[8px] border border-primary bg-white px-4 font-cairo text-[11px] font-extrabold text-primary transition hover:bg-[#E7FBFA]"
                        >
                          إدارة المواعيد
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {showPaginationBar ? (
          <DoctorTablePagination
            page={page}
            totalPages={totalPages}
            pageSize={LIMIT}
            pageSizeOptions={[10, 20, 50]}
            summaryLabel={`عرض ${paginationRange.start.toLocaleString("ar-SA")}–${paginationRange.end.toLocaleString("ar-SA")} من ${data!.total.toLocaleString("ar-SA")} سكرتيراً`}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              // Note: LIMIT is fixed at 20 in this page, so pageSize change not supported
              setPage(1);
            }}
          />
        ) : null}

        <div className="h-8" />
      </div>

      {/* offboard dialog */}
      <OffboardDialog
        open={offboardOpen}
        onOpenChange={setOffboardOpen}
        targetUserId={offboardTarget?.userId ?? null}
        targetLabel={offboardTarget?.label ?? ""}
        onSuccess={() => refetch()}
      />
    </>
  );
}
