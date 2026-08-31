"use client";

import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldPlus,
  UserCog,
  Users,
} from "lucide-react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import CreateAdminUserDialog from "@/components/admin/users/CreateAdminUserDialog";
import { DoctorCardSkeleton } from "@/components/admin/skeletons/DoctorCardSkeleton";
import { SkeletonList } from "@/components/admin/skeletons/SkeletonList";
import DoctorTablePagination from "@/components/doctor/shared/doctor-table-pagination";
import StyledSelect from "@/components/ui/styled-select";
import { useAdminUsers } from "@/hooks/admin/users/useAdminUsers";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import type { AdminUserSummary } from "@/lib/admin/types";
import { useI18n } from "@/i18n/provider";

type UserStatusFilter = "all" | "active" | "inactive";

function formatUserCreatedAt(value: string | undefined, locale: string) {
  if (!value) return "?";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "?";
  return parsed.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function userStatusLabel(user: AdminUserSummary, t: (key: string) => string) {
  return user.isActive === false
    ? t("admin.users.status.inactive")
    : t("admin.users.status.active");
}

function userStatusTone(user: AdminUserSummary) {
  return user.isActive === false
    ? "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]"
    : "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]";
}

export default function AdminUsersPage() {
  const { t, locale, dir } = useI18n();
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);

  const { users, isAwaitingData, isRefetching, isError, error, refetch } =
    useAdminUsers();

  const filteredUsers = useMemo(() => {
    const text = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? user.isActive !== false
            : user.isActive === false;
      if (!matchesStatus) return false;
      if (!text) return true;
      return [
        user.fullName,
        user.email,
        user.phone,
        user.phoneNumber,
        user.role,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(text));
    });
  }, [query, statusFilter, users]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / Math.max(pageSize, 1)),
  );
  const currentPage = Math.min(page, totalPages);
  const visibleUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [currentPage, filteredUsers, pageSize]);
  const rangeStart =
    filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd =
    filteredUsers.length === 0
      ? 0
      : Math.min(currentPage * pageSize, filteredUsers.length);
  const hasActiveFilters = query.trim() !== "" || statusFilter !== "all";

  return (
    <>
      <Helmet>
        <title>{t("admin.users.page.title")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale} className="space-y-5">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={t("admin.users.page.title")}
          subtitle={t("admin.users.overview.subtitle")}
          headerIcon={<UserCog className="h-8 w-8 text-white" />}
          actionLabel={t("admin.users.actionLabel")}
          onActionClick={() => setCreateOpen(true)}
          kpis={[
            {
              key: "total",
              icon: <Users className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : users.length,
              label: t("admin.users.kpi.total"),
            },
            {
              key: "active",
              icon: <ShieldPlus className="h-5 w-5 shrink-0" />,
              value: isAwaitingData
                ? "—"
                : users.filter((user) => user.isActive !== false).length,
              label: t("admin.users.kpi.active"),
            },
          ]}
        />

        <div className="flex items-start gap-3 rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] px-4 py-3 text-start">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#175CD3]" />
          <div className="font-cairo text-sm font-semibold leading-6 text-[#175CD3]">
            {t("admin.users.disclaimer")}
          </div>
        </div>

        <section className="rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
            <div className="relative">
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder={t("admin.users.search.placeholder")}
                className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white ps-11 pe-4 text-start font-cairo text-[13px] font-semibold text-[#111827] outline-none transition focus:border-primary placeholder:text-[#98A2B3]"
              />
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
            </div>

            <StyledSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as UserStatusFilter);
                setPage(1);
              }}
              options={[
                { value: "all", label: t("admin.users.filter.all") },
                {
                  value: "active",
                  label: t("admin.users.filter.active"),
                },
                {
                  value: "inactive",
                  label: t("admin.users.filter.inactive"),
                },
              ]}
              placeholder={t("admin.users.filter.all")}
              size="sm"
              tone="muted"
            />

            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isRefetching}
              className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-sm font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
              />
              {isRefetching
                ? t("admin.users.refresh.refreshing")
                : t("admin.users.refresh.normal")}
            </button>
          </div>
        </section>

        {isRefetching && !isAwaitingData ? (
          <div className="inline-flex items-center gap-2 rounded-[10px] border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2 font-cairo text-[12px] font-bold text-[#047857]">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {t("admin.users.refresh.users")}
          </div>
        ) : null}

        {isAwaitingData ? (
          <SkeletonList
            count={5}
            SkeletonComponent={DoctorCardSkeleton}
            className="space-y-4"
          />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
            <AlertCircle className="h-7 w-7 text-[#DC2626]" />
            <div className="font-cairo text-[14px] font-extrabold text-[#991B1B]">
              {t("admin.users.error.load")}
            </div>
            <div className="font-cairo text-[13px] font-semibold text-[#B42318]">
              {userFacingErrorMessage(error)}
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-[8px] border border-[#FECACA] bg-white px-5 py-2 font-cairo text-[12px] font-extrabold text-[#DC2626]"
            >
              {t("admin.users.error.retry")}
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085] shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
            {hasActiveFilters
              ? t("admin.users.empty.filtered")
              : t("admin.users.empty.noData")}
          </div>
        ) : (
          <section className="space-y-4">
            {visibleUsers.map((user) => (
              <article
                key={user.id}
                className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 text-start">
                    <div className="flex flex-wrap items-center justify-start gap-3">
                      <div
                        className={`inline-flex h-[24px] items-center rounded-[999px] border px-3 font-cairo text-[11px] font-extrabold ${userStatusTone(user)}`}
                      >
                        {userStatusLabel(user, t)}
                      </div>
                      <h2 className="font-cairo text-[16px] font-black text-[#111827]">
                        {user.fullName}
                      </h2>
                    </div>
                    <div className="mt-1 font-cairo text-[11px] font-bold text-[#98A2B3]">
                      {user.role || "data_entry"}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <span className="inline-flex h-9 items-center rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 font-cairo text-[11px] font-extrabold text-[#667085]">
                      {t("admin.users.deactivateNotAvailable")}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-start gap-x-5 gap-y-2">
                  <div className="inline-flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                    <Users className="h-4 w-4 text-primary" />
                    <span>
                      {t("admin.users.createdOn")}{" "}
                      {formatUserCreatedAt(user.createdAt, locale)}
                    </span>
                  </div>
                  {user.email ? (
                    <div className="inline-flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>{user.email}</span>
                    </div>
                  ) : null}
                  {user.phone || user.phoneNumber ? (
                    <div className="inline-flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{user.phone ?? user.phoneNumber}</span>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        )}

        {!isAwaitingData && !isError && filteredUsers.length > 0 ? (
          <DoctorTablePagination
            page={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            summaryLabel={t("admin.users.pagination.summary", {
              start: rangeStart.toLocaleString(numberLocale),
              end: rangeEnd.toLocaleString(numberLocale),
              total: filteredUsers.length.toLocaleString(numberLocale),
            })}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        ) : null}

        <CreateAdminUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      </div>
    </>
  );
}
