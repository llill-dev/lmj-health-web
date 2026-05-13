import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Search,
  Settings,
  UserX,
  XCircle,
  Filter,
  ChevronLeft,
  CalendarDays,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/components/ui/ToastProvider";
import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";
import BookAppointmentDialog from "@/components/doctor/appointments/book-appointment-dialog";
import DoctorAppointmentExpandableCard from "@/components/doctor/appointments/doctor-appointment-expandable-card";
import AppointmentsEmptyState from "@/components/doctor/appointments/appointments-empty-state";
import CancelAppointmentDialog from "@/components/admin/appointments/dialogs/CancelAppointmentDialog";
import CompleteOrReasonDialog from "@/components/doctor/appointments/cancel-appointment-dialog";
import RescheduleAppointmentDialog from "@/components/doctor/appointments/reschedule-appointment-dialog";
import {
  useBookDoctorAppointmentApi,
  useCancelDoctorAppointmentApi,
  useCompleteDoctorAppointmentApi,
  useDoctorAppointmentDetailsApi,
  useDoctorAppointmentsApi,
  useNoShowDoctorAppointmentApi,
  useRescheduleDoctorAppointmentApi,
  usePatients,
  useDoctorPatients,
} from "@/hooks";
import { readAuthUser } from "@/lib/cookies";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useNavigate } from "react-router-dom";

type MainView = "schedule" | "waiting";
type StatusTab = "scheduled" | "completed" | "cancelled" | "no-show";

type DoctorAppointmentsFiltersState = {
  view: MainView;
  status: StatusTab;
  search: string;
  date: string;
  page: number;
  limit: number;
};

const UI_ONLY = import.meta.env.VITE_UI_ONLY === "true";

function filterLocalSearch<
  T extends {
    patientName?: string;
    notes?: string;
    patientId?: string;
  },
>(items: T[], searchTerm: string): T[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return items;

  return items.filter((item) => {
    const haystacks = [item.patientName, item.patientId, item.notes]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());
    return haystacks.some((value) => value.includes(query));
  });
}

export default function DoctorAppointmentsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const defaultFilters = useMemo<DoctorAppointmentsFiltersState>(() => {
    return {
      view: "schedule",
      status: "scheduled",
      search: "",
      date: "",
      page: 1,
      limit: 20,
    };
  }, []);

  const [filters, setFilters] = useState<DoctorAppointmentsFiltersState>({
    ...defaultFilters,
  });

  const [bookOpen, setBookOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<{
    id: string;
    patientName: string;
  } | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<{
    id: string;
    patientName: string;
  } | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<{
    id: string;
    patientName: string;
    date: string;
    time: string;
  } | null>(null);
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [noShowTarget, setNoShowTarget] = useState<{
    id: string;
    patientName: string;
  } | null>(null);
  const [expandedAppointmentId, setExpandedAppointmentId] = useState<
    string | null
  >(null);

  const selectedStatus = filters.view === "waiting" ? "scheduled" : filters.status;

  const listQuery = useDoctorAppointmentsApi({
    page: filters.page,
    limit: filters.limit,
    status: selectedStatus,
    date: filters.date || undefined,
  });
  const detailsQuery = useDoctorAppointmentDetailsApi(
    expandedAppointmentId ?? "",
  );

  // KPI counts should come from backend totals per status (not just "today").
  const scheduledTotal = useDoctorAppointmentsApi({
    page: 1,
    limit: 1,
    status: "scheduled",
  });
  const completedTotal = useDoctorAppointmentsApi({
    page: 1,
    limit: 1,
    status: "completed",
  });
  const cancelledTotal = useDoctorAppointmentsApi({
    page: 1,
    limit: 1,
    status: "cancelled",
  });
  const noShowTotal = useDoctorAppointmentsApi({
    page: 1,
    limit: 1,
    status: "no-show",
  });

  const cancelMutation = useCancelDoctorAppointmentApi();
  const completeMutation = useCompleteDoctorAppointmentApi();
  const rescheduleMutation = useRescheduleDoctorAppointmentApi();
  const noShowMutation = useNoShowDoctorAppointmentApi();
  const bookMutation = useBookDoctorAppointmentApi();

  // Use real doctor patients API when connected to backend
  const { patients: uiOnlyPatients } = usePatients(1, 100);
  const doctorPatientsQuery = useDoctorPatients({
    page: 1,
    limit: 100, // Get enough patients for the dropdown
  });

  // Choose correct patient source based on mode
  const availablePatients = UI_ONLY
    ? uiOnlyPatients.map((p) => ({ id: p.id, name: p.name }))
    : doctorPatientsQuery.patients.map((p) => ({
        id: p._id,
        name: p.user.fullName,
      }));

  const mergedAppointments = useMemo(() => {
    return listQuery.appointments.map((appointment) => {
      if (
        expandedAppointmentId &&
        expandedAppointmentId === appointment.id &&
        detailsQuery.appointment
      ) {
        return detailsQuery.appointment;
      }
      return appointment;
    });
  }, [detailsQuery.appointment, expandedAppointmentId, listQuery.appointments]);

  const visibleAppointments = useMemo(
    () => filterLocalSearch(mergedAppointments, filters.search),
    [mergedAppointments, filters.search],
  );

  const totalPages = useMemo(() => {
    const safeLimit = Math.max(1, filters.limit);
    const pages = Math.ceil((listQuery.total || 0) / safeLimit);
    return pages || 1;
  }, [filters.limit, listQuery.total]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.view !== defaultFilters.view ||
      filters.status !== defaultFilters.status ||
      Boolean(filters.search.trim()) ||
      Boolean(filters.date.trim()) ||
      filters.page !== defaultFilters.page ||
      filters.limit !== defaultFilters.limit
    );
  }, [defaultFilters, filters]);

  const appointmentLoadError = listQuery.error;

  const handleBookingAction = () => {
    // Check if we have patients available (only when connected to backend)
    if (!UI_ONLY && doctorPatientsQuery.isLoading) {
      toast("جارٍ تحميل قائمة المرضى...", {
        title: "انتظر قليلاً",
        variant: "info",
        durationMs: 2000,
      });
      return;
    }

    if (!UI_ONLY && doctorPatientsQuery.patients.length === 0) {
      toast("لا توجد مرضى مرتبطين بحسابك حالياً. يرجى إضافة مرضى أولاً من صفحة المرضى.", {
        title: "لا توجد مرضى",
        variant: "warning",
        durationMs: 5000,
      });
      return;
    }

    setBookOpen(true);
  };

  if (appointmentLoadError) {
    const loadDetail = getUserFacingRequestErrorMessage(appointmentLoadError);
    return (
      <div
        dir="rtl"
        lang="ar"
        className="flex min-h-[400px] items-center justify-center px-4 pb-16"
      >
        <div className="mx-auto max-w-md rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-6 py-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-[#B42318]" aria-hidden />
          <p className="mt-3 font-cairo text-[15px] font-extrabold text-[#B42318]">
            تعذّر تحميل المواعيد
          </p>
          <p className="mt-2 font-cairo text-[13px] font-semibold leading-relaxed text-[#7A271A]">
            {loadDetail}
          </p>
          <button
            type="button"
            onClick={() => listQuery.refetch()}
            className="mt-5 inline-flex h-[40px] min-w-[160px] items-center justify-center rounded-xl bg-primary px-5 font-cairo text-[13px] font-extrabold text-white shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Appointments • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <DoctorDashboardOverview
          variant="appointments"
          surface="mint"
          title="إجمالي المواعيد"
          subtitle={
            <span>
              <span className="font-extrabold text-primary">
                {listQuery.total}
              </span>
              <span className="text-primary/90">
                {" "}
                — إجمالي المواعيد حسب الحالة
              </span>
            </span>
          }
          onActionClick={handleBookingAction}
          actionLabel="حجز موعد لمريض"
          kpis={[
            {
              key: "scheduled",
              icon: <Clock className="w-5 h-5 shrink-0" />,
              value: scheduledTotal.isLoading ? "—" : scheduledTotal.total,
              label: "مجدولة",
            },
            {
              key: "completed",
              icon: <CheckCircle className="w-5 h-5 shrink-0" />,
              value: completedTotal.isLoading ? "—" : completedTotal.total,
              label: "مكتملة",
            },
            {
              key: "cancelled",
              icon: <XCircle className="w-5 h-5 shrink-0" />,
              value: cancelledTotal.isLoading ? "—" : cancelledTotal.total,
              label: "ملغية",
            },
            {
              key: "no-show",
              icon: <UserX className="w-5 h-5 shrink-0" />,
              value: noShowTotal.isLoading ? "—" : noShowTotal.total,
              label: "عدم حضور",
            },
          ]}
        />



        <BookAppointmentDialog
          open={bookOpen}
          onOpenChange={setBookOpen}
          patients={availablePatients}
          doctorId={readAuthUser()?.actorIds?.doctorId}
          onSubmit={async (values) => {
            const doctorId = readAuthUser()?.actorIds?.doctorId;
            if (!doctorId) {
              toast("تعذّر تحديد هوية الطبيب الحالية لهذا الحجز.", {
                title: "خطأ",
                variant: "error",
              });
              throw new Error("تعذر تحديد هوية الطبيب الحالي لهذا الحجز.");
            }
            try {
              await bookMutation.mutateAsync({
                doctorId,
                patientId: values.patientId,
                date: values.date,
                startTime: values.time,
                appointmentTypeId: values.appointmentTypeId,
                notes: values.notes,
              });
              toast("تم حجز الموعد بنجاح.", {
                title: "تم الحجز",
                variant: "success",
                durationMs: 4200,
              });
            } catch (error) {
              toast(getUserFacingRequestErrorMessage(error), {
                title: "فشل حجز الموعد",
                variant: "error",
                durationMs: 5200,
              });
              throw error;
            }
          }}
        />

        <CancelAppointmentDialog
          open={cancelOpen}
          onOpenChange={(open) => {
            setCancelOpen(open);
            if (!open) setCancelTarget(null);
          }}
          targetName={cancelTarget?.patientName ?? ""}
          confirmDisabled={cancelMutation.isPending}
          onConfirm={async (reason) => {
            if (!cancelTarget) return;
            try {
              await cancelMutation.mutateAsync({
                id: cancelTarget.id,
                body: { reason },
              });
            } catch (error) {
              toast(
                error instanceof Error ? error.message : "تعذّر إلغاء الموعد.",
                {
                  title: "خطأ",
                  variant: "error",
                  durationMs: 4800,
                },
              );
              throw error;
            }
          }}
        />

        <CompleteOrReasonDialog
          open={completeOpen}
          onOpenChange={(open) => {
            setCompleteOpen(open);
            if (!open) setCompleteTarget(null);
          }}
          patientName={completeTarget?.patientName ?? ""}
          confirmDisabled={completeMutation.isPending}
          title="إنهاء الموعد"
          fieldLabel="ملاحظات الإنهاء"
          placeholder="اكتب ملاحظات الطبيب التي يجب إرسالها مع إنهاء الموعد..."
          confirmLabel="إنهاء الموعد"
          onConfirm={async (medicalNotes) => {
            if (!completeTarget) return;
            try {
              await completeMutation.mutateAsync({
                id: completeTarget.id,
                body: { notes: medicalNotes },
              });
            } catch (error) {
              toast(
                error instanceof Error ? error.message : "تعذّر إنهاء الموعد.",
                {
                  title: "خطأ",
                  variant: "error",
                  durationMs: 4800,
                },
              );
              throw error;
            }
          }}
        />

        <CompleteOrReasonDialog
          open={noShowOpen}
          onOpenChange={(open) => {
            setNoShowOpen(open);
            if (!open) setNoShowTarget(null);
          }}
          patientName={noShowTarget?.patientName ?? ""}
          confirmDisabled={noShowMutation.isPending}
          title="تسجيل عدم حضور"
          fieldLabel="سبب عدم الحضور"
          placeholder="اكتب سبب تسجيل الموعد كعدم حضور..."
          confirmLabel="تسجيل عدم الحضور"
          onConfirm={async (reason) => {
            if (!noShowTarget) return;
            try {
              await noShowMutation.mutateAsync({
                id: noShowTarget.id,
                body: { reason },
              });
            } catch (error) {
              toast(
                error instanceof Error
                  ? error.message
                  : "تعذّر تسجيل عدم الحضور.",
                {
                  title: "خطأ",
                  variant: "error",
                  durationMs: 4800,
                },
              );
              throw error;
            }
          }}
        />

        <RescheduleAppointmentDialog
          open={rescheduleOpen}
          onOpenChange={(open) => {
            setRescheduleOpen(open);
            if (!open) setRescheduleTarget(null);
          }}
          patientName={rescheduleTarget?.patientName ?? ""}
          initialDate={rescheduleTarget?.date}
          initialTime={rescheduleTarget?.time}
          confirmDisabled={rescheduleMutation.isPending}
          onConfirm={async (values) => {
            if (!rescheduleTarget) return;
            try {
              await rescheduleMutation.mutateAsync({
                id: rescheduleTarget.id,
                body: values,
              });
            } catch (error) {
              toast(
                error instanceof Error
                  ? error.message
                  : "تعذّر إعادة جدولة الموعد.",
                {
                  title: "خطأ",
                  variant: "error",
                  durationMs: 4800,
                },
              );
              throw error;
            }
          }}
        />

        {/* شريط تصفية احترافي — مطابق لصفحة المرضى، البحث ~50% على الشاشات الواسعة */}
        <section
          className="my-6 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_20px_50px_rgba(15,143,139,0.08),0_2px_8px_rgba(0,0,0,0.04)]"
          aria-label="تصفية قائمة المواعيد"
        >
          <div className="border-b border-[#EEF2F6] bg-gradient-to-l from-primary/[0.07] via-[#F8FAFC] to-white px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-3 items-start sm:items-center">
                <div
                  className="flex justify-center items-center w-11 h-11 bg-gradient-to-br rounded-xl border shadow-sm shrink-0 border-primary/25 from-primary/15 to-primary/5 text-primary"
                  aria-hidden
                >
                  <Filter className="h-[18px] w-[18px]" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 text-right">
                  <h2 className="font-cairo text-[16px] font-black leading-tight text-[#111827] sm:text-[17px]">
                    تصفية المواعيد
                  </h2>
                  <p className="mt-1 max-w-xl font-cairo text-[12px] font-semibold leading-relaxed text-[#667085]">
                    ضبط العرض والحالة والتاريخ على الخادم، مع بحث سريع داخل نتائج
                    الصفحة الحالية (اسم المريض، المعرّف، الملاحظات).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-end items-center">
                <button
                  type="button"
                  disabled={!hasActiveFilters}
                  onClick={() => setFilters({ ...defaultFilters })}
                  className={
                    !hasActiveFilters
                      ? "inline-flex h-[40px] min-w-[132px] cursor-not-allowed items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-extrabold text-[#98A2B3]"
                      : "inline-flex h-[40px] min-w-[132px] items-center justify-center rounded-xl border border-primary/30 bg-white px-4 font-cairo text-[12px] font-extrabold text-primary shadow-[0_1px_2px_rgba(15,143,139,0.12)] transition-all hover:bg-primary/[0.06] hover:shadow-[0_4px_14px_rgba(15,143,139,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  }
                >
                  مسح الفلاتر
                </button>

                <output
                  className="inline-flex h-[40px] min-w-[100px] items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-black text-[#344054] shadow-sm tabular-nums"
                  aria-live="polite"
                >
                  <span className="text-primary">{listQuery.total || 0}</span>
                  <span className="font-extrabold text-[#667085]">نتيجة</span>
                </output>
              </div>
            </div>
          </div>
{/* filter container */}
          <div className="px-5 py-5 space-y-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:gap-6">
              {/* بحث محلي رئيسي: نصف عرض الحاوية على xl */}
              <div className="w-full flex-[0_0_auto] xl:w-1/2 xl:max-w-[50%]">
                <label
                  htmlFor="doctor-appointments-search"
                  className="flex gap-2 justify-between items-center mb-2"
                >
                  <span className="inline-flex items-center gap-1.5 font-cairo text-[12px] font-extrabold text-[#111827]">
                    <CalendarDays
                      className="h-3.5 w-3.5 text-primary"
                      aria-hidden
                    />
                    بحث في القائمة الحالية
                  </span>
                  <span className="hidden font-cairo text-[10px] font-bold uppercase tracking-wider text-[#98A2B3] sm:inline">
                    المريض · المعرّف · الملاحظات
                  </span>
                </label>
                <div className="relative group">
                  <input
                    id="doctor-appointments-search"
                    type="search"
                    enterKeyHint="search"
                    autoComplete="off"
                    placeholder="ابدأ بالكتابة داخل نتائج هذه الصفحة فقط..."
                    className="h-[48px] w-full rounded-xl border-2 border-[#E8ECF3] bg-gradient-to-b from-[#FBFCFD] to-white pe-12 ps-4 font-cairo text-[13px] font-bold text-[#111827] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-[border-color,box-shadow,background] placeholder:text-[#98A2B3] hover:border-[#D0D8E6] focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,143,139,0.12),inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                  />
                  <div className="pointer-events-none absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-focus-within:bg-primary/[0.14]">
                    <Search className="h-[18px] w-[18px]" strokeWidth={2.25} />
                  </div>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-3 min-w-0 sm:grid-cols-2">
                <div className="relative min-w-0">
                  <label
                    htmlFor="doctor-appointments-view"
                    className="mb-2 block font-cairo text-[11px] font-extrabold text-[#667085]"
                  >
                    نوع العرض
                  </label>
                  <div className="relative">
                    <select
                      id="doctor-appointments-view"
                      value={filters.view}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          view: (e.target.value as MainView) || "schedule",
                          page: 1,
                        }))
                      }
                      className="h-[42px] w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-3.5 pe-10 text-right font-cairo text-[12px] font-bold text-[#111827] shadow-sm outline-none transition-all hover:border-[#D0D5DD] focus:border-primary/45 focus:ring-2 focus:ring-primary/12"
                    >
                      <option value="schedule">جدول المواعيد</option>
                      <option value="waiting">قائمة الانتظار</option>
                    </select>
                    <ChevronLeft
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-[-90deg] text-[#98A2B3]"
                      aria-hidden
                    />
                  </div>
                </div>

                {filters.view === "schedule" ? (
                  <div className="relative min-w-0">
                    <label
                      htmlFor="doctor-appointments-status"
                      className="mb-2 block font-cairo text-[11px] font-extrabold text-[#667085]"
                    >
                      حالة الموعد
                    </label>
                    <div className="relative">
                      <select
                        id="doctor-appointments-status"
                        value={filters.status}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            status: (e.target.value as StatusTab) || "scheduled",
                            page: 1,
                          }))
                        }
                        className="h-[42px] w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-3.5 pe-10 text-right font-cairo text-[12px] font-bold text-[#111827] shadow-sm outline-none transition-all hover:border-[#D0D5DD] focus:border-primary/45 focus:ring-2 focus:ring-primary/12"
                      >
                        <option value="scheduled">المجدولة</option>
                        <option value="completed">المكتملة</option>
                        <option value="cancelled">الملغية</option>
                        <option value="no-show">عدم الحضور</option>
                      </select>
                      <ChevronLeft
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-[-90deg] text-[#98A2B3]"
                        aria-hidden
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[42px] min-w-0 flex-col justify-end rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
                    <p className="font-cairo text-[11px] font-semibold leading-relaxed text-[#667085]">
                      قائمة الانتظار تعرض المواعيد{" "}
                      <span className="font-extrabold text-[#344054]">
                        المجدولة
                      </span>{" "}
                      وفق التاريخ المُرسل للخادم.
                    </p>
                  </div>
                )}

              </div>
            </div>
            {/* date filter */}
            <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFBFC]/90 px-4 py-4 sm:px-5">
              <div className="flex flex-wrap gap-2 items-center mb-3 text-right">
                <Calendar className="w-4 h-4 shrink-0 text-primary" aria-hidden />
                <span className="font-cairo text-[12px] font-extrabold text-[#344054]">
                  تاريخ المواعيد
                </span>
              </div>
              <div className="max-w-xs">
                <span className="mb-1.5 block font-cairo text-[10px] font-extrabold uppercase tracking-wide text-[#667085]">
                  اليوم
                </span>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      date: e.target.value,
                      page: 1,
                    }))
                  }
                  className="h-[40px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827] shadow-sm outline-none transition-all focus:border-primary/45 focus:ring-2 focus:ring-primary/12"
                />
              </div>
            </div>
          </div>
        </section>


        <section className="mb-6">
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_20px_50px_rgba(15,143,139,0.06),0_2px_8px_rgba(0,0,0,0.03)]">
            {filters.view === "waiting" && (
              <div className="border-b border-[#F2F4F7] px-6 py-3">
                <p className="font-cairo text-[13px] font-semibold text-[#667085]">
                  قائمة الانتظار تعرض المواعيد المجدولة ضمن نفس فلاتر الباكند الحالية.
                </p>
              </div>
            )}

            <div className="px-6 py-4">
              {listQuery.isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : listQuery.total === 0 ? (
                <AppointmentsEmptyState onBookClick={handleBookingAction} />
              ) : visibleAppointments.length === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="mx-auto w-12 h-12 text-gray-300" />
                  <p className="mt-3 font-cairo text-[14px] font-semibold text-[#667085]">
                    لا توجد نتائج مطابقة للبحث المحلي ضمن هذه الصفحة.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleAppointments.map((appointment) => (
                    <DoctorAppointmentExpandableCard
                      key={appointment.id}
                      appointment={appointment}
                      expanded={expandedAppointmentId === appointment.id}
                      detailsLoading={
                        expandedAppointmentId === appointment.id &&
                        detailsQuery.isLoading
                      }
                      onToggle={() => {
                        setExpandedAppointmentId((current) =>
                          current === appointment.id ? null : appointment.id,
                        );
                      }}
                      cancelling={cancelMutation.isPending}
                      completing={completeMutation.isPending}
                      rescheduling={rescheduleMutation.isPending}
                      noShowing={noShowMutation.isPending}
                      onCancel={() => {
                        setCancelTarget({
                          id: appointment.id,
                          patientName: appointment.patientName,
                        });
                        setCancelOpen(true);
                      }}
                      onComplete={() => {
                        setCompleteTarget({
                          id: appointment.id,
                          patientName: appointment.patientName,
                        });
                        setCompleteOpen(true);
                      }}
                      onEdit={() => {
                        setRescheduleTarget({
                          id: appointment.id,
                          patientName: appointment.patientName,
                          date: appointment.date,
                          time: appointment.time,
                        });
                        setRescheduleOpen(true);
                      }}
                      onNoShow={() => {
                        setNoShowTarget({
                          id: appointment.id,
                          patientName: appointment.patientName,
                        });
                        setNoShowOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Pagination — متناغم مع بطاقة الفلاتر */}
        <section className="mt-5 flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-6 py-4 shadow-[0_20px_50px_rgba(15,143,139,0.06),0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="font-cairo text-[12px] font-bold text-[#667085]">
            الصفحة {filters.page} من {totalPages}
          </div>

          <div className="flex gap-3 items-center">
            <div className="relative">
              <select
                value={filters.limit}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    limit: Number(e.target.value),
                    page: 1,
                  }))
                }
                className="h-[36px] w-[110px] appearance-none rounded-xl border border-primary/25 bg-primary/10 px-4 text-right font-cairo text-[12px] font-extrabold text-primary outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
              >
                {[20, 50, 100].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <ChevronLeft className="absolute left-3 top-1/2 w-4 h-4 rotate-90 -translate-y-1/2 pointer-events-none text-primary" />
            </div>

            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={filters.page <= 1}
              className="inline-flex h-[36px] items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              السابق
            </button>

            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(totalPages, prev.page + 1),
                }))
              }
              disabled={filters.page >= totalPages}
              className="inline-flex h-[36px] items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              التالي
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

