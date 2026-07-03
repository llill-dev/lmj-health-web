"use client";

import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  Mail,
  Phone,
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

type UserStatusFilter = "all" | "active" | "inactive";

function formatUserCreatedAt(value?: string) {
  if (!value) return "?";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "?";
  return parsed.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function userStatusLabel(user: AdminUserSummary) {
  return user.isActive === false ? "موقوف" : "نشط";
}

function userStatusTone(user: AdminUserSummary) {
  return user.isActive === false
    ? "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]"
    : "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]";
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);

  const { users, isAwaitingData, isError, error, refetch } = useAdminUsers();

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

  return (
    <>
      <Helmet>
        <title>مستخدمو الإدارة • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="space-y-5">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title="مستخدمو الإدارة"
          subtitle="إدارة حسابات الفريق الداخلي. إيقاف وتفعيل الحسابات غير متاحين حالياً لأن المسارات غير موثقة في swagger_api.md"
          headerIcon={<UserCog className="h-8 w-8 text-white" />}
          actionLabel="إنشاء مستخدم"
          onActionClick={() => setCreateOpen(true)}
          kpis={[
            {
              key: "total",
              icon: <Users className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : users.length,
              label: "إجمالي الحسابات",
            },
            {
              key: "active",
              icon: <ShieldPlus className="h-5 w-5 shrink-0" />,
              value: isAwaitingData
                ? "—"
                : users.filter((user) => user.isActive !== false).length,
              label: "حسابات نشطة",
            },
          ]}
        />

        <section className="rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
            <div className="relative">
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="ابحث بالاسم أو البريد أو الهاتف أو الدور..."
                className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-11 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition focus:border-primary placeholder:text-[#98A2B3]"
              />
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
            </div>

            <StyledSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as UserStatusFilter);
                setPage(1);
              }}
              options={[
                { value: "all", label: "كل الحالات" },
                { value: "active", label: "الحسابات النشطة" },
                { value: "inactive", label: "الحسابات الموقوفة" },
              ]}
              placeholder="كل الحالات"
              size="sm"
              tone="muted"
            />
          </div>
        </section>

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
              تعذّر تحميل الحسابات
            </div>
            <div className="font-cairo text-[12px] font-semibold text-[#B42318]">
              {userFacingErrorMessage(error)}
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-[8px] border border-[#FECACA] bg-white px-5 py-2 font-cairo text-[12px] font-extrabold text-[#DC2626]"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085] shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
            لا توجد حسابات مطابقة للبحث الحالي.
          </div>
        ) : (
          <section className="space-y-4">
            {visibleUsers.map((user) => (
              <article
                key={user.id}
                className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <div
                        className={`inline-flex h-[24px] items-center rounded-[999px] border px-3 font-cairo text-[11px] font-extrabold ${userStatusTone(user)}`}
                      >
                        {userStatusLabel(user)}
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
                      إيقاف/تفعيل الحساب غير متاح حالياً
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
                  <div className="inline-flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                    <span>أُنشئ في {formatUserCreatedAt(user.createdAt)}</span>
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  {user.email ? (
                    <div className="inline-flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                      <span>{user.email}</span>
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                  ) : null}
                  {user.phone || user.phoneNumber ? (
                    <div className="inline-flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                      <span>{user.phone ?? user.phoneNumber}</span>
                      <Phone className="h-4 w-4 text-primary" />
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
            summaryLabel={`عرض ${rangeStart.toLocaleString("ar-SA")}–${rangeEnd.toLocaleString("ar-SA")} من ${filteredUsers.length.toLocaleString("ar-SA")} حساب`}
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
