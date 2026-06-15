"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ActivityLogBanner,
  ActivityLogFilters,
  ActivityLogInfoAlert,
  ActivityLogList,
} from "@/components/doctor/activity-log";
import { MedicalServicesDirectoryPagination } from "@/components/doctor/medical-services-directory/medical-services-directory-pagination";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { useDoctorActivityLog } from "@/hooks";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";
import type { ActivityLogPeriod } from "@/lib/doctor/activityLog/types";

export default function DoctorActivityLogPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [period, setPeriod] = useState<ActivityLogPeriod>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const activityQuery = useDoctorActivityLog({
    page,
    period,
    search: debouncedSearch,
  });
  const { retry: retryActivity, retrying: retryingActivity } = useRetryAction(
    () => activityQuery.refetch(),
  );

  const errorMessage = useMemo(() => {
    if (!activityQuery.error) return null;
    return getUserFacingRequestErrorMessage(activityQuery.error);
  }, [activityQuery.error]);

  const handlePeriodChange = (value: ActivityLogPeriod) => {
    setPeriod(value);
    setPage(1);
  };

  if (activityQuery.isAwaitingData) {
    return (
      <>
        <Helmet>
          <title>سجل النشاطات • LMJ Health</title>
        </Helmet>
        <div
          dir="rtl"
          lang="ar"
          className="flex min-h-[360px] items-center justify-center"
        >
          <div className="flex items-center gap-3 font-cairo text-[14px] font-semibold text-[#667085]">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            جارٍ تحميل سجل النشاطات…
          </div>
        </div>
      </>
    );
  }

  if (activityQuery.isError && !activityQuery.data) {
    return (
      <>
        <Helmet>
          <title>سجل النشاطات • LMJ Health</title>
        </Helmet>
        <DoctorListErrorState
          title="تعذّر تحميل سجل النشاطات"
          brief={
            errorMessage ?? "حدث خطأ أثناء جلب السجل من الخادم. حاول مرة أخرى."
          }
          onRetry={() => void retryActivity()}
          retrying={retryingActivity}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>سجل النشاطات • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <ActivityLogBanner />
        <ActivityLogInfoAlert />
        <ActivityLogFilters
          search={search}
          onSearchChange={setSearch}
          period={period}
          onPeriodChange={handlePeriodChange}
        />

        <ActivityLogList items={activityQuery.items} />

        {activityQuery.total > activityQuery.pageSize ? (
          <MedicalServicesDirectoryPagination
            page={page}
            totalPages={activityQuery.totalPages}
            total={activityQuery.total}
            pageSize={activityQuery.pageSize}
            disabled={activityQuery.searching}
            onPageChange={setPage}
            itemLabel="نشاط"
          />
        ) : null}

        <div className="h-8" />
      </div>
    </>
  );
}
