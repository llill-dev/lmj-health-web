import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Users,
  Stethoscope,
  UserCheck,
  Bell,
  FileText,
  ClipboardList,
  ChevronLeft,
  Tag,
  User,
  Eye,
  CalendarClock,
  Pencil,
  Trash2,
  Archive,
} from "lucide-react";
import { get } from "@/lib/api";
import { adminApi } from "@/lib/admin/client";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";
import {
  useAdminContentList,
  useArchiveContent,
} from "@/hooks/admin/content/useAdminContent";
import { useAdminContentStatusCounts } from "@/hooks/admin/content/useAdminContentStatusCounts";
import { useAdminPlatformStats } from "@/hooks/admin/analytics/useAdminAnalytics";
import { useAdminUnreadNotificationCount } from "@/hooks/admin/notifications/useAdminNotifications";
import { ConfirmActionDialog } from "@/components/admin/dialogs";
import type {
  AdminComplaintListItem,
  AdminContentItem,
} from "@/lib/admin/types";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import {
  activityDescription,
  activityHeadline,
  activityRowVisual,
  asPlainText,
  authorName,
  complaintStatusLabel,
  complaintTypeLabel,
  contentItemsFromList,
  contentStatusLabel,
  contentTypeCategoryLabel,
  formatRelativeTimeAr,
  formatShortDate,
  formatTimeTodayOrDate,
} from "@/components/admin/dashboard/dashboardUtils";
import {
  DashboardActivitySkeletonRow,
  DashboardComplaintCardSkeleton,
  DashboardContentCardSkeleton,
} from "@/components/admin/skeletons/DashboardSkeletons";

const TEAL = "#0F8F8B";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const archiveContent = useArchiveContent();
  const [archiveTarget, setArchiveTarget] = useState<AdminContentItem | null>(
    null,
  );

  const complaintsQuery = useQuery({
    queryKey: ["admin", "dashboard", "latest-complaints"],
    queryFn: () => adminApi.complaints.list({ page: 1, limit: 5 }),
    staleTime: 30_000,
  });

  /** GET /admin/content — أحدث العناصر (جميع الحالات؛ شارة الحالة في الواجهة). */
  const contentQuery = useAdminContentList({ page: 1, limit: 5 });
  const contentRows = contentItemsFromList(contentQuery.data);

  /** API-3.pdf: GET /admin/audit-logs — سجل النظام للمشرف (أقرب ما يكون لـ«آخر الأنشطة»). */
  const activityQuery = useQuery({
    queryKey: ["admin", "dashboard", "audit-activity"],
    queryFn: () => adminApi.auditLogs.list({ page: 1, limit: 8 }),
    staleTime: 45_000,
    retry: 1,
  });
  const activityLogs = activityQuery.data?.auditLogs ?? [];
  const activityAwaiting = isAwaitingInitialQueryData(
    activityQuery.data,
    activityQuery.isError,
  );

  const complaints = complaintsQuery.data?.complaints ?? [];
  const complaintsAwaiting = isAwaitingInitialQueryData(
    complaintsQuery.data,
    complaintsQuery.isError,
  );

  const { stats, isAwaitingData: statsAwaiting } = useAdminPlatformStats();
  const contentCounts = useAdminContentStatusCounts();
  const unreadNotifications = useAdminUnreadNotificationCount();

  const pendingAccessQuery = useQuery({
    queryKey: ["admin", "dashboard", "access-requests-pending"],
    queryFn: () =>
      get<{ total?: number }>(
        "/api/access-requests?status=pending&page=1&limit=1",
        { locale: "ar" },
      ),
    staleTime: 30_000,
  });

  const formatKpi = useCallback(
    (value: number | undefined, awaiting: boolean) =>
      awaiting ? "—" : String(value ?? 0),
    [],
  );

  const handleArchive = useCallback((item: AdminContentItem) => {
    if (item.status === "PUBLISHED") setArchiveTarget(item);
  }, []);

  const handleEditContent = useCallback(
    (item: AdminContentItem) => {
      navigate("/admin/medical-content", {
        state: { focusContentId: item._id },
      });
    },
    [navigate],
  );

  const handleViewContent = useCallback(
    (item: AdminContentItem) => {
      navigate("/admin/medical-content", {
        state: { focusContentId: item._id },
      });
    },
    [navigate],
  );

  const mainKpisAwaiting = statsAwaiting || pendingAccessQuery.isLoading;

  const secondaryCards = useMemo(
    () => [
      {
        title: "إشعارات غير مقروءة",
        value: formatKpi(
          unreadNotifications.data,
          unreadNotifications.isAwaitingData,
        ),
        icon: Bell,
        tone: "border-[#FECACA] bg-[#FFF7F7] text-[#111827]",
        iconBg: "bg-[#FEE2E2]",
        iconColor: "text-[#EF4444]",
      },
      {
        title: "محتوى منشور",
        value: formatKpi(contentCounts.published, contentCounts.isAwaitingData),
        icon: FileText,
        tone: "border-[#CFFAFE] bg-white text-[#111827]",
        iconBg: "bg-[#ECFEFF]",
        iconColor: "text-primary",
      },
      {
        title: "طلبات تحقق معلّقة",
        value: formatKpi(stats.pendingVerifications, statsAwaiting),
        icon: ClipboardList,
        tone: "border-[#CFFAFE] bg-white text-[#111827]",
        iconBg: "bg-[#ECFEFF]",
        iconColor: "text-primary",
      },
    ],
    [
      formatKpi,
      unreadNotifications.data,
      unreadNotifications.isAwaitingData,
      contentCounts.published,
      contentCounts.isAwaitingData,
      stats.pendingVerifications,
      statsAwaiting,
    ],
  );

  return (
    <>
      <Helmet>
        <title>Admin Dashboard • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="min-h-full text-[#111827]">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title="لوحة التحكم الرئيسية"
          subtitle="نظرة عامة شاملة على النظام وإدارة النشاط"
          headerIcon={<ClipboardList className="h-8 w-8 text-white" />}
          kpiColumns={4}
          kpis={[
            {
              key: "access",
              icon: <UserCheck className="h-5 w-5 shrink-0" />,
              value: formatKpi(
                pendingAccessQuery.data?.total,
                mainKpisAwaiting,
              ),
              label: "طلبات الوصول المعلّقة",
            },
            {
              key: "appointments",
              icon: <CalendarDays className="h-5 w-5 shrink-0" />,
              value: formatKpi(stats.totalAppointments, mainKpisAwaiting),
              label: "إجمالي المواعيد",
            },
            {
              key: "doctors",
              icon: <Stethoscope className="h-5 w-5 shrink-0" />,
              value: formatKpi(stats.totalDoctors, mainKpisAwaiting),
              label: "إجمالي الأطباء",
            },
            {
              key: "patients",
              icon: <Users className="h-5 w-5 shrink-0" />,
              value: formatKpi(stats.totalPatients, mainKpisAwaiting),
              label: "إجمالي المرضى",
            },
          ]}
        />

        <section className="mt-5 flex justify-end">
          <Link
            to="/admin/access-requests"
            className="inline-flex h-[36px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] hover:bg-[#F9FAFB]"
          >
            <UserCheck className="h-4 w-4" />
            إدارة طلبات الوصول
          </Link>
        </section>

        <section className="grid grid-cols-1 gap-5 mt-5 md:grid-cols-3">
          {secondaryCards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className={`rounded-[12px] border px-5 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${c.tone}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-cairo text-[26px] font-extrabold leading-[26px]">
                      {c.value}
                    </div>
                    <div className="mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                      {c.title}
                    </div>
                  </div>
                  <div
                    className={`flex h-[40px] w-[40px] items-center justify-center rounded-[12px] ${c.iconBg}`}
                  >
                    <Icon className={`h-[18px] w-[18px] ${c.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-5 overflow-hidden rounded-[12px] border border-[#E8EDF2] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-3 border-b border-[#EEF2F6] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-right">
              <div className="font-cairo text-[16px] font-extrabold text-[#111827]">
                آخر الأنشطة
              </div>
            </div>
            <Link
              to="/admin/system-logs"
              className="inline-flex h-[34px] shrink-0 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-primary transition hover:bg-[#F0FDFC]"
            >
              عرض سجل النظام
            </Link>
          </div>

          <div className="divide-y divide-[#EEF2F6]">
            {activityAwaiting ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <DashboardActivitySkeletonRow key={i} index={i} />
                ))}
              </>
            ) : activityQuery.isError ? (
              <div className="px-6 py-10 text-center font-cairo text-[13px] font-semibold text-red-600">
                تعذر تحميل سجل الأنشطة. تحقق من الصلاحيات أو الشبكة.
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                لا توجد أحداث مسجّلة في الصفحة الحالية.
              </div>
            ) : (
              activityLogs.map((log) => {
                const { Icon, box, iconColor } = activityRowVisual(log);
                const title = activityHeadline(log);
                const desc = activityDescription(log);
                return (
                  <div
                    key={log._id}
                    className="flex gap-3 justify-between items-center px-6 py-4"
                  >
                    <div className="flex flex-1 gap-3 items-center min-w-0">
                      <div
                        className={`flex justify-center items-center h-[36px] w-[36px] shrink-0 rounded-[10px] ${box}`}
                      >
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <div className="truncate font-cairo text-[13px] font-extrabold text-[#111827]">
                          {title}
                        </div>
                        <div
                          className="mt-1 line-clamp-2 font-cairo text-[12px] font-semibold text-[#98A2B3]"
                          title={desc}
                        >
                          {desc}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                      {formatRelativeTimeAr(log.createdAt)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* آخر الشكاوي — مطابق تخطيط المرجع: شريط فيزيائي، أيقونة، شارة، تفاصيل */}
        <section className="mt-5">
          <h2 className="mb-3 text-right font-cairo text-[16px] font-extrabold text-[#111827]">
            آخر الشكاوي
          </h2>
          <div className="overflow-hidden rounded-[12px] border border-[#E8EDF2] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-5">
            {complaintsAwaiting ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <DashboardComplaintCardSkeleton key={i} index={i} />
                ))}
              </>
            ) : complaintsQuery.isError ? (
              <div className="py-12 text-center font-cairo text-[13px] font-semibold text-red-600">
                تعذر تحميل الشكاوى.
              </div>
            ) : complaints.length === 0 ? (
              <div className="py-12 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                لا توجد شكاوى لعرضها.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {complaints.map((row: AdminComplaintListItem) => {
                  const st = complaintStatusLabel(row.status);
                  const patientName =
                    asPlainText(row.contactSnapshot?.fullName) || "—";
                  const subj = asPlainText(row.subject);
                  const msg = asPlainText(row.message);
                  const locationLine =
                    subj || (msg ? msg.replace(/\s+/g, " ").slice(0, 80) : "—");
                  return (
                    <li key={row._id}>
                      <div className="flex items-stretch overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-[#FAFBFC]">
                        <div className="flex flex-1 gap-3 p-4 min-w-0 sm:gap-4 sm:p-5">
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] sm:h-14 sm:w-14"
                            style={{ backgroundColor: TEAL }}
                          >
                            <Stethoscope className="w-6 h-6 text-white sm:h-7 sm:w-7" />
                          </div>
                          <div className="flex-1 min-w-0 text-right">
                            <div className="flex flex-wrap gap-2 justify-end items-center">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-extrabold ${st.className}`}
                              >
                                {st.label}
                              </span>
                            </div>
                            <div className="mt-2 font-cairo text-[15px] font-extrabold text-[#111827] sm:text-[16px]">
                              {patientName}
                            </div>
                            <div className="mt-1.5 font-cairo text-[13px] font-semibold text-[#374151]">
                              <span className="text-[#98A2B3]">
                                نوع الشكوى :{" "}
                              </span>
                              {complaintTypeLabel(row.type)}
                            </div>
                            <div className="mt-1 font-cairo text-[12px] font-medium leading-relaxed text-[#98A2B3]">
                              {locationLine}
                            </div>
                            <div className="mt-3 font-cairo text-[11px] font-semibold text-[#9CA3AF]">
                              {formatTimeTodayOrDate(row.createdAt)}
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/admin/complaints/${row._id}`}
                          className="flex w-[52px] shrink-0 items-center justify-center text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          style={{ backgroundColor: TEAL }}
                          aria-label="عرض تفاصيل الشكوى"
                        >
                          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* آخر الأخبار / المحتوى — شارة حالة، صف بيانات، أيقونات إجراءات يسار الصف */}
        <section className="mt-5 mb-2">
          <h2 className="mb-3 text-right font-cairo text-[16px] font-extrabold text-[#111827]">
            آخر الأخبار
          </h2>
          <div className="overflow-hidden rounded-[12px] border border-[#E8EDF2] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-5">
            {contentQuery.isAwaitingData ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <DashboardContentCardSkeleton key={i} index={i} />
                ))}
              </>
            ) : contentQuery.isError ? (
              <div className="py-12 text-center font-cairo text-[13px] font-semibold text-red-600">
                تعذر تحميل الأخبار.
              </div>
            ) : contentRows.length === 0 ? (
              <div className="py-12 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                لا توجد عناصر لعرضها.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {contentRows.map((item) => {
                  const st = contentStatusLabel(item.status);
                  const views = item.viewCount ?? item.views ?? 0;
                  const canArchive = item.status === "PUBLISHED";
                  return (
                    <li key={item._id}>
                      <div className="rounded-[12px] border border-[#E5E7EB] bg-[#FAFBFC] px-4 py-4 sm:px-5 sm:py-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1 min-w-0 text-right">
                            <div className="flex flex-wrap gap-2 justify-start items-center">
                              <h3 className="max-w-full font-cairo text-[15px] font-extrabold leading-snug text-[#111827] sm:text-[16px]">
                                {asPlainText(item.title) || "—"}
                              </h3>
                              <span
                                className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-extrabold ${st.className}`}
                              >
                                {st.label}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 justify-end font-cairo text-[11px] font-semibold text-[#98A2B3]">
                              <span className="inline-flex gap-1.5 items-center">
                                <Tag className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
                                {contentTypeCategoryLabel(item.type)}
                              </span>
                              <span className="inline-flex gap-1.5 items-center">
                                <User className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
                                الكاتب: {authorName(item.createdBy)}
                              </span>
                              <span className="inline-flex gap-1.5 items-center">
                                <Eye className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
                                {views} مشاهدة
                              </span>
                              <span className="inline-flex gap-1.5 items-center">
                                <CalendarClock className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
                                آخر تحديث: {formatShortDate(item.updatedAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end shrink-0 lg:pt-1">
                            <button
                              type="button"
                              disabled={!canArchive || archiveContent.isPending}
                              title={
                                canArchive
                                  ? "أرشفة (للمحتوى المنشور فقط)"
                                  : "الأرشفة متاحة للعناصر ذات حالة «منشور» فقط"
                              }
                              onClick={() => handleArchive(item)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FECACA] bg-white text-[#EF4444] transition hover:bg-[#FEF2F2] disabled:opacity-50"
                              aria-label="أرشفة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditContent(item)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#A5E3E1] bg-white text-primary transition hover:bg-[#F0FDFC]"
                              style={{ color: TEAL, borderColor: "#A5E3E1" }}
                              aria-label="تعديل"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleViewContent(item)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#BFDBFE] bg-white text-[#2563EB] transition hover:bg-[#EFF6FF]"
                              aria-label="عرض"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <div className="h-6" />
      </div>

      <ConfirmActionDialog
        open={archiveTarget !== null}
        onOpenChange={(next) => {
          if (!next) setArchiveTarget(null);
        }}
        variant="destructive"
        title="تأكيد الأرشفة"
        icon={<Archive className="w-6 h-6" strokeWidth={2} />}
        description={
          <>
            هل تريد أرشفة العنصر «
            <span className="font-extrabold text-[#344054]">
              {archiveTarget ? asPlainText(archiveTarget.title) || "—" : "—"}
            </span>
            »؟ سيتم إزالته من القوائم النشطة ويمكن متابعته لاحقاً من أرشيف
            المحتوى إن وُجد.
          </>
        }
        confirmLabel="أرشفة"
        confirmDisabled={archiveContent.isPending}
        onConfirm={async () => {
          if (!archiveTarget) return;
          await archiveContent.mutateAsync(archiveTarget._id);
        }}
        successToast={{
          title: "تمت الأرشفة",
          message: "أُرشف المحتوى ويُتاح من أرشيف المحتوى عند التوفّر.",
          variant: "success",
        }}
      />
    </>
  );
}
