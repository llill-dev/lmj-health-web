"use client";

import { Helmet } from "react-helmet-async";
import {
  AlertCircle,
  ChevronLeft,
  Mail,
  Phone,
  Search,
  Stethoscope,
  Eye,
  Lock,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  ADMIN_SECRETARY_BLOCKER_MESSAGE,
  useAdminSecretariesList,
} from "@/hooks/admin/secretaries/useAdminSecretaries";
import { useAdminDoctors } from "@/hooks/admin/doctors/useAdminDoctors";
import { SecretaryCardSkeleton } from "@/components/admin/secretaries/SecretaryCardSkeleton";
import { permLabel } from "@/components/admin/secretaries/secretaryPermissions";
import { resolveUserId } from "@/components/admin/secretaries/secretaryListUtils";
import DoctorTablePagination from "@/components/doctor/shared/doctor-table-pagination";
import StyledSelect from "@/components/ui/styled-select";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import { useI18n } from "@/i18n/provider";

export default function AdminSecretariesPage() {
  const navigate = useNavigate();
  const { t, locale, dir } = useI18n();
  const numberLocale = locale === "ar" ? "ar-EG" : "en-US";
  const numberLocaleSa = locale === "ar" ? "ar-SA" : "en-US";

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 380);
  const [doctorIdFilter, setDoctorIdFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const { doctors: doctorOptions, isAwaitingData: doctorsListAwaiting } =
    useAdminDoctors({
      page: 1,
      limit: 100,
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

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>{t("admin.secretaries.page.title")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={t("admin.secretaries.overview.title")}
          subtitle={t("admin.secretaries.overview.subtitle")}
          headerIcon={<Users className="h-8 w-8 text-white" />}
          actionLabel={t("admin.secretaries.overview.actionLabel")}
          actionDisabled
          kpis={[
            {
              key: "total",
              icon: <Users className="h-5 w-5 shrink-0" />,
              value: isAwaitingData
                ? "—"
                : (data?.total ?? 0).toLocaleString(numberLocale),
              label: t("admin.secretaries.kpi.total"),
            },
            {
              key: "doctors",
              icon: <Stethoscope className="h-5 w-5 shrink-0" />,
              value: doctorsListAwaiting ? "—" : doctorOptions.length,
              label: t("admin.secretaries.kpi.doctors"),
            },
            {
              key: "page",
              icon: <Mail className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : (data?.results ?? 0),
              label: t("admin.secretaries.kpi.page"),
            },
          ]}
        />

        <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] px-4 py-3 text-start">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#175CD3]" />
          <div className="font-cairo text-[12px] font-bold leading-6 text-[#175CD3]">
            {t("admin.secretaries.disclaimer")}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-16 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="relative flex-1">
            <input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("admin.secretaries.search.placeholder")}
              className="h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 pe-10 text-start font-cairo text-[12px] font-bold text-[#111827] outline-none transition focus:border-primary placeholder:text-[#98A2B3]"
            />
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
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
            placeholder={t("admin.secretaries.filter.allDoctors")}
            options={[
              { value: "", label: t("admin.secretaries.filter.allDoctors") },
              ...doctorOptions.map((d) => ({
                value: d._id,
                label: `${d.user?.fullName ?? d._id}${d.specialization ? ` — ${d.specialization}` : ""}`,
              })),
            ]}
            listboxAriaLabel={t("admin.secretaries.filter.doctor")}
          />
          {doctorOptions.length >= 200 ? (
            <p className="mt-1.5 text-start font-cairo text-[10px] font-semibold text-[#98A2B3]">
              {t("admin.secretaries.filter.doctorLimit")}
            </p>
          ) : null}
        </div>

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
                {t("admin.secretaries.error.load")}
              </div>
              <button
                onClick={() => refetch()}
                className="mt-1 rounded-[8px] border border-[#FECACA] bg-white px-5 py-2 font-cairo text-[12px] font-extrabold text-[#DC2626]"
              >
                {t("admin.secretaries.error.retry")}
              </button>
            </div>
          ) : data?.secretaries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-16 text-center">
              <Users className="h-10 w-10 text-[#D0D5DD]" />
              <div className="font-cairo text-[14px] font-extrabold text-[#667085]">
                {debouncedSearch
                  ? t("admin.secretaries.empty.noResults")
                  : t("admin.secretaries.empty.noData")}
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
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm">
                          <Users className="h-5 w-5" />
                        </div>
                        <div className="text-start">
                          <div className="font-cairo text-[16px] font-black leading-[22px] text-[#111827]">
                            {s.user?.fullName ?? "—"}
                          </div>
                          <div className="mt-0.5 font-cairo text-[11px] font-bold text-[#98A2B3]">
                            {t("admin.secretaries.role")}
                            {s.doctor?.user?.fullName
                              ? ` • ${s.doctor.user.fullName}`
                              : ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-8 items-center gap-1.5 rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 font-cairo text-[11px] font-extrabold text-[#667085]"
                          title={t("admin.secretaries.badge.editUnavailable")}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {t("admin.secretaries.badge.readOnly")}
                        </span>
                        {userId && (
                          <span className="flex h-8 items-center rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 font-cairo text-[11px] font-extrabold text-[#667085]">
                            {t("admin.secretaries.badge.offboardUnavailable")}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/secretaries/${s._id}`, {
                              state: { secretary: s },
                            })
                          }
                          title={t("admin.secretaries.actions.profile")}
                          className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary text-white shadow-sm transition hover:bg-primary/90"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-5">
                      {s.user?.phone && (
                        <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                          <Phone className="h-4 w-4 text-primary" />
                          {s.user.phone}
                        </div>
                      )}
                      {s.user?.email && (
                        <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                          <Mail className="h-4 w-4 text-primary" />
                          {s.user.email}
                        </div>
                      )}
                    </div>

                    {s.doctor && (
                      <div className="mt-4 flex items-center justify-between rounded-[10px] border border-[#BFEDEC] bg-[#E7FBFA] px-5 py-3">
                        <div className="flex items-center gap-2 text-primary">
                          <Stethoscope className="h-4 w-4" />
                          <span className="font-cairo text-[12px] font-extrabold">
                            {t("admin.secretaries.assignedDoctor")}
                          </span>
                        </div>
                        <div className="text-start">
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

                    {perms.length > 0 && (
                      <div className="mt-4">
                        <div className="mb-2 font-cairo text-[11px] font-extrabold text-[#98A2B3]">
                          {t("admin.secretaries.permissions")} ({perms.length})
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {perms.map((p) => (
                            <span
                              key={p}
                              className="rounded-full border border-[#E0F2FE] bg-[#F0F9FF] px-2.5 py-1 font-cairo text-[10px] font-extrabold text-[#0369A1]"
                            >
                              {permLabel(p, locale)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/secretaries/${s._id}/appointments`,
                              {
                                state: { secretary: s },
                              },
                            )
                          }
                          className="h-[30px] rounded-[8px] border border-primary bg-white px-4 font-cairo text-[11px] font-extrabold text-primary transition hover:bg-[#E7FBFA]"
                        >
                          {t("admin.secretaries.actions.viewAppointments")}
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
                          {t("admin.secretaries.actions.manageAppointments")}
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
            summaryLabel={t("admin.secretaries.pagination.summary").replace("{start}", String(paginationRange.start)).replace("{end}", String(paginationRange.end)).replace("{total}", String(data!.total))}
            onPageChange={setPage}
            onPageSizeChange={() => {
              setPage(1);
            }}
          />
        ) : null}

        <div className="h-8" />
      </div>
    </>
  );
}
