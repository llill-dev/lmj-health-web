"use client";

import { Loader2, Search, ChevronRight } from "lucide-react";
import { memo, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import {
  DASHBOARD_PATIENT_FILTER_LABELS,
  type DashboardPatientFilter,
} from "@/lib/doctor/dashboard/dashboardPatientFilters";
import type { DoctorPatientListItem } from "@/lib/doctor/types";
import { ApiError, getUserFacingRequestErrorMessage } from "@/lib/api";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";
import { useRetryAction } from "@/lib/query/useRetryAction";
import type { useDashboardPatientsSearch } from "@/hooks/doctor/dashboard/useDashboardPatientsSearch";
import { useDashboardPatientsWeeklyActivity } from "@/hooks/doctor/dashboard/useDashboardPatientsWeeklyActivity";
import {
  scaleWeeklyBarHeight,
  type PatientWeeklyActivityBar,
} from "@/lib/doctor/dashboard/buildPatientWeeklyActivityChart";

export type DashboardPatientsSearchState = ReturnType<
  typeof useDashboardPatientsSearch
>;

function formatIsoDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ar-SA");
}

function patientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "م";
}

function accountStatusPresentation(patient: DoctorPatientListItem): {
  label: string;
  className: string;
} {
  const status =
    patient.user.accountStatus ??
    (patient.isTemporary ? "temporary" : "active");

  if (status === "temporary" || patient.isTemporary) {
    return {
      label: "مؤقت",
      className: "bg-[#FFF7ED] text-[#C2410C]",
    };
  }

  if (status === "suspended") {
    return {
      label: "معلّق",
      className: "bg-[#FEE2E2] text-[#B42318]",
    };
  }

  return {
    label: "نشط",
    className: "bg-[#ECFDF3] text-[#16A34A]",
  };
}

function getPatientsSearchErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return getUserFacingRequestErrorMessage(error);
  }

  if (error.messageKey === "errors.doctor.notApproved") {
    return "حساب الطبيب غير مُعتمد بعد، لذلك لا يمكن البحث عن المرضى.";
  }

  if (error.status === 401) {
    return "انتهت صلاحية الجلسة. سجّل الدخول من جديد.";
  }

  if (error.status === 403) {
    return error.message || "لا تملك صلاحية عرض مرضى الطبيب.";
  }

  return error.message || getUserFacingRequestErrorMessage(error);
}

function SurfaceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <header className="border-b border-[#EDF2F7] px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <h2 className="text-right font-cairo text-[23px] font-black leading-none text-[#243044]">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function PatientsSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative min-w-0">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="ابحث بالاسم، الهاتف، البريد، أو رقم الملف…"
        aria-label="بحث عن مريض"
        className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white pr-10 pl-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary"
      />
      <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[#98A2B3]">
        <Search className="h-5 w-5" />
      </div>
    </div>
  );
}

const PatientTableRow = memo<{
  patient: DoctorPatientListItem;
  onOpen: (patientId: string) => void;
}>(function PatientTableRow({ patient, onOpen }) {
  const status = accountStatusPresentation(patient);

  return (
    <div className="grid grid-cols-1 gap-4 border-b border-[#EEF2F6] px-4 py-4 last:border-b-0 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-5">
      <div className="flex items-center gap-4 lg:col-span-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary text-white shadow-[0_14px_28px_rgba(15,143,139,0.22)]">
          <span className="font-cairo text-[20px] font-black">
            {patientInitials(patient.user.fullName)}
          </span>
        </div>
        <div className="min-w-0 text-right">
          <div className="truncate font-cairo text-[18px] font-black text-[#243044]">
            {patient.user.fullName}
          </div>
          <div className="truncate font-cairo text-[14px] font-semibold text-[#98A2B3]">
            {patient.user.email ?? patient.publicId}
          </div>
        </div>
      </div>

      <div className="truncate font-cairo text-[16px] font-bold text-[#243044] lg:col-span-3">
        {patient.user.phone ?? "—"}
      </div>
      <div className="font-cairo text-[16px] font-extrabold text-[#243044] lg:col-span-2">
        {formatIsoDate(patient.lastVisitAt)}
      </div>
      <div className="lg:col-span-1">
        <span
          className={`inline-flex rounded-[8px] px-3 py-1.5 font-cairo text-[13px] font-black ${status.className}`}
        >
          {status.label}
        </span>
      </div>
      <div className="text-right lg:col-span-2 lg:text-left">
        <button
          type="button"
          onClick={() => onOpen(patient._id)}
          className="inline-flex items-center gap-2 font-cairo text-[15px] font-black text-primary transition-colors hover:text-[#0A7A77]"
        >
          عرض التفاصيل
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

const PatientsWeeklyActivityChart = memo<{
  bars: PatientWeeklyActivityBar[];
  averagePatientsPerDay: number;
  totalUniquePatients: number;
  isLoading?: boolean;
}>(function PatientsWeeklyActivityChart({
  bars,
  averagePatientsPerDay,
  totalUniquePatients,
  isLoading,
}) {
  const maxCount = Math.max(...bars.map((bar) => bar.value), 0);

  return (
    <div className="mt-5 flex min-h-[270px] flex-col justify-between rounded-[18px] bg-[#E3F6F8] px-6 py-6">
      <div className="flex items-start justify-between gap-3 text-right">
        <div className="font-cairo text-[16px] font-bold text-[#A3B2BF]">
          نشاط المرضى - آخر 7 أيام
        </div>
        {!isLoading ? (
          <div className="font-cairo text-[12px] font-bold text-[#64748B]">
            {totalUniquePatients} مريض •{" "}
            {bars.reduce((sum, bar) => sum + bar.value, 0)} موعد
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-8 flex h-[148px] items-end justify-between gap-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="flex h-full flex-1 flex-col items-center justify-end gap-3"
            >
              <div
                className="w-full max-w-[52px] animate-pulse rounded-t-[16px] bg-[#CFECEF]"
                style={{ height: `${40 + index * 8}px` }}
              />
              <div className="h-3 w-10 animate-pulse rounded bg-[#CFECEF]" />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="mt-8 flex h-[148px] items-end justify-between gap-3">
            {bars.map((item) => {
              const barHeight = scaleWeeklyBarHeight(item.value, maxCount);

              return (
                <div
                  key={item.isoDate}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  title={`${item.patientCount} مريض • ${item.appointmentCount} موعد`}
                >
                  {item.value > 0 ? (
                    <span className="font-cairo text-[11px] font-black text-primary">
                      {item.value}
                    </span>
                  ) : (
                    <span className="font-cairo text-[11px] font-bold text-[#CBD5E1]">
                      0
                    </span>
                  )}
                  <div
                    className="w-full max-w-[52px] rounded-t-[16px] bg-primary transition-[height] duration-500 ease-out"
                    style={{ height: `${barHeight}px` }}
                  />
                  <div className="font-cairo text-[13px] font-bold text-[#9AA9B5]">
                    {item.dayLabel}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-center font-cairo text-[13px] font-semibold text-[#9AA9B5]">
            متوسط: {averagePatientsPerDay} مريض/يوم
            {maxCount > 0 ? ` • أعلى يوم: ${maxCount} موعد` : ""}
          </div>
        </div>
      )}
    </div>
  );
});

export function DashboardPatientsSearchCard({
  searchInput,
  setSearchInput,
  patientsQuery,
}: DashboardPatientsSearchState) {
  const { chart, appointmentsQuery } = useDashboardPatientsWeeklyActivity();
  const chartAwaitingData =
    isAwaitingInitialQueryData(
      appointmentsQuery.data,
      appointmentsQuery.isError,
    ) && !appointmentsQuery.isError;

  return (
    <SurfaceSection title="المرضى">
      <div className="px-4 py-5 sm:px-5 sm:py-6">
        <PatientsSearchInput value={searchInput} onChange={setSearchInput} />

        <PatientsWeeklyActivityChart
          bars={chart.bars}
          averagePatientsPerDay={chart.averagePatientsPerDay}
          totalUniquePatients={chart.totalUniquePatients}
          isLoading={chartAwaitingData}
        />

        <div className="mt-4 text-center">
          <Link
            to="/doctor/patients"
            className="inline-flex font-cairo text-[13px] font-black text-primary hover:underline"
          >
            صفحة المرضى الكاملة
          </Link>
        </div>
      </div>
    </SurfaceSection>
  );
}

export function DashboardPatientsTable({
  debouncedSearch,
  filter,
  setFilter,
  patientsQuery,
}: DashboardPatientsSearchState) {
  const navigate = useNavigate();

  const filterTabs = useMemo(
    () =>
      (
        Object.keys(DASHBOARD_PATIENT_FILTER_LABELS) as DashboardPatientFilter[]
      ).map((key) => ({
        key,
        label: DASHBOARD_PATIENT_FILTER_LABELS[key],
      })),
    [],
  );

  const isInitialLoad = patientsQuery.isAwaitingData && !patientsQuery.isError;
  const { retry: retryPatients, retrying: retryingPatients } = useRetryAction(
    () => patientsQuery.refetch(),
  );
  const patients = patientsQuery.patients;
  const hasSearch = Boolean(debouncedSearch.trim());

  const emptyMessage = hasSearch
    ? "لا توجد نتائج مطابقة لبحثك ضمن مرضى الطبيب."
    : filter === "today"
      ? "لا يوجد مرضى لديهم مواعيد اليوم."
      : filter === "upcoming"
        ? "لا يوجد مرضى بمواعيد قادمة ضمن الفترة الحالية."
        : "لا يوجد مرضى مرتبطون بحسابك بعد.";

  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 border-b border-[#EEF2F6] px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
        <div className="text-right">
          <h2 className="font-cairo text-[23px] font-black text-[#243044]">
            المرضى
          </h2>
          {!patientsQuery.isError ? (
            <p className="mt-1 font-cairo text-[13px] font-semibold text-[#98A2B3]">
              {patientsQuery.total} مريض
              {hasSearch ? " مطابق للبحث" : ""}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filterTabs
            .slice()
            .reverse()
            .map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`h-[42px] rounded-[10px] border px-5 font-cairo text-[15px] font-black transition-colors ${
                  filter === key
                    ? "border-primary bg-primary text-white"
                    : "border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-[#F8FAFC]"
                }`}
              >
                {label}
              </button>
            ))}
        </div>
      </div>

      <div className="hidden border-b border-[#EEF2F6] px-8 py-4 lg:block">
        <div className="grid grid-cols-12 gap-4 text-right font-cairo text-[14px] font-bold text-[#A1AAB9]">
          <div className="col-span-4">اسم المريض</div>
          <div className="col-span-3">رقم الهاتف</div>
          <div className="col-span-2">آخر زيارة</div>
          <div className="col-span-1">الحالة</div>
          <div className="col-span-2">الإجراءات</div>
        </div>
      </div>

      {patientsQuery.isError ? (
        <div className="px-6 py-8">
          <DoctorListErrorState
            title="تعذّر تحميل المرضى"
            brief="حدث خطأ أثناء جلب قائمة المرضى من الخادم."
            detail={getPatientsSearchErrorMessage(patientsQuery.error)}
            retrying={retryingPatients}
            onRetry={() => {
              void retryPatients();
            }}
          />
        </div>
      ) : isInitialLoad ? (
        <div className="space-y-0">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-4 border-b border-[#EEF2F6] px-4 py-4 last:border-b-0 sm:px-6 lg:px-8 lg:py-5"
            >
              <div className="col-span-4 flex items-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded-[12px] bg-[#E2E8F0]" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-40 animate-pulse rounded bg-[#E2E8F0]" />
                  <div className="h-4 w-28 animate-pulse rounded bg-[#F1F5F9]" />
                </div>
              </div>
              <div className="col-span-3 h-5 animate-pulse rounded bg-[#E2E8F0]" />
              <div className="col-span-2 h-5 animate-pulse rounded bg-[#E2E8F0]" />
              <div className="col-span-1 h-7 w-16 animate-pulse rounded bg-[#E2E8F0]" />
              <div className="col-span-2 h-5 animate-pulse rounded bg-[#E2E8F0]" />
            </div>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
          <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
            {emptyMessage}
          </p>
          <Link
            to="/doctor/patients"
            className="font-cairo text-[14px] font-black text-primary hover:underline"
          >
            الانتقال إلى صفحة المرضى
          </Link>
        </div>
      ) : (
        <>
          {patients.map((patient) => (
            <PatientTableRow
              key={patient._id}
              patient={patient}
              onOpen={(patientId) => navigate(`/doctor/patients/${patientId}`)}
            />
          ))}

          {patientsQuery.total > patients.length ? (
            <div className="border-t border-[#EEF2F6] px-4 py-4 text-center sm:px-8">
              <Link
                to="/doctor/patients"
                className="inline-flex items-center gap-2 font-cairo text-[14px] font-black text-primary hover:underline"
              >
                عرض جميع المرضى ({patientsQuery.total})
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
