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

function userStatusLabel(
  user: AdminUserSummary,
  tr: (ar: string, en: string) => string,
) {
  return user.isActive === false ? tr("موقوف", "Inactive") : tr("نشط", "Active");
}

function userStatusTone(user: AdminUserSummary) {
  return user.isActive === false
    ? "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]"
    : "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]";
}

export default function AdminUsersPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);

  const { users, isAwaitingData, isRefetching, isError, error, refetch } = useAdminUsers();

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
        <title>
          {tr("مستخدمو الإدارة", "Admin users")} • LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="space-y-5">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr("مستخدمو الإدارة", "Admin users")}
          subtitle={tr(
            "إدارة حسابات الفريق الداخلي. إيقاف وتفعيل الحسابات غير متاحين حالياً.",
            "Manage internal team accounts. Deactivate and activate are not available yet.",
          )}
          headerIcon={<UserCog className="h-8 w-8 text-white" />}
          actionLabel={tr("إنشاء مستخدم", "Create user")}
          onActionClick={() => setCreateOpen(true)}
          kpis={[
            {
              key: "total",
              icon: <Users className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : users.length,
              label: tr("إجمالي الحسابات", "Total accounts"),
            },
            {
              key: "active",
              icon: <ShieldPlus className="h-5 w-5 shrink-0" />,
              value: isAwaitingData
                ? "—"
                : users.filter((user) => user.isActive !== false).length,
              label: tr("حسابات نشطة", "Active accounts"),
            },
          ]}
        />

        <section className="rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
            <div className="relative">
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder={tr(
                  "ابحث بالاسم أو البريد أو الهاتف أو الدور...",
                  "Search by name, email, phone, or role…",
                )}
                className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-11 ps-4 text-start font-cairo text-[12px] font-bold text-[#111827] outline-none transition focus:border-primary placeholder:text-[#98A2B3]"
              />
              <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
            </div>

            <StyledSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as UserStatusFilter);
                setPage(1);
              }}
              options={[
                { value: "all", label: tr("كل الحالات", "All statuses") },
                {
                  value: "active",
                  label: tr("الحسابات النشطة", "Active accounts"),
                },
                {
                  value: "inactive",
                  label: tr("الحسابات الموقوفة", "Inactive accounts"),
                },
              ]}
              placeholder={tr("كل الحالات", "All statuses")}
              size="sm"
              tone="muted"
            />

            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isRefetching}
              className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
              {isRefetching
                ? tr("جارٍ التحديث...", "Refreshing...")
                : tr("تحديث", "Refresh")}
            </button>
          </div>
        </section>

        {isRefetching && !isAwaitingData ? (
          <div className="inline-flex items-center gap-2 rounded-[10px] border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2 font-cairo text-[12px] font-bold text-[#047857]">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {tr("جارٍ تحديث حسابات الإدارة...", "Refreshing admin users...")}
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
              {tr("تعذّر تحميل الحسابات", "Failed to load accounts")}
            </div>
            <div className="font-cairo text-[12px] font-semibold text-[#B42318]">
              {userFacingErrorMessage(error)}
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-[8px] border border-[#FECACA] bg-white px-5 py-2 font-cairo text-[12px] font-extrabold text-[#DC2626]"
            >
              {tr("إعادة المحاولة", "Retry")}
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085] shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
            {hasActiveFilters
              ? tr(
                  "لا توجد حسابات مطابقة للبحث أو الفلترة الحالية.",
                  "No accounts match the current search or filters.",
                )
              : tr(
                  "لا توجد حسابات إدارة مسجلة حالياً.",
                  "There are no admin user accounts yet.",
                )}
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
                        {userStatusLabel(user, tr)}
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
                      {tr(
                        "إيقاف/تفعيل الحساب غير متاح حالياً",
                        "Deactivate/activate is not available yet",
                      )}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-start gap-x-5 gap-y-2">
                  <div className="inline-flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                    <Users className="h-4 w-4 text-primary" />
                    <span>
                      {tr("أُنشئ في", "Created on")}{" "}
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
            summaryLabel={tr(
              `عرض ${rangeStart.toLocaleString(numberLocale)}–${rangeEnd.toLocaleString(numberLocale)} من ${filteredUsers.length.toLocaleString(numberLocale)} حساب`,
              `Showing ${rangeStart.toLocaleString(numberLocale)}–${rangeEnd.toLocaleString(numberLocale)} of ${filteredUsers.length.toLocaleString(numberLocale)} accounts`,
            )}
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
