"use client";

import { Loader2, RefreshCw } from "lucide-react";
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
import { useI18n } from "@/i18n/provider";

export default function DoctorActivityLogPage() {
  const { t, locale, dir } = useI18n();
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
          <title>{t("doctor.activityLog.page.title")}</title>
        </Helmet>
        <div
          dir={dir}
          lang={locale}
          className="flex min-h-[360px] items-center justify-center"
        >
          <div className="flex items-center gap-3 font-cairo text-[14px] font-semibold text-[#667085]">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            {t("doctor.activityLog.loading")}
          </div>
        </div>
      </>
    );
  }

  if (activityQuery.isError && !activityQuery.data) {
    return (
      <>
        <Helmet>
          <title>{t("doctor.activityLog.page.title")}</title>
        </Helmet>
        <DoctorListErrorState
          title={t("doctor.activityLog.error.load")}
          brief={errorMessage ?? t("doctor.activityLog.error.message")}
          onRetry={() => void retryActivity()}
          retrying={retryingActivity}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          <title>{t("doctor.activityLog.page.title")}</title>
        </title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <ActivityLogBanner />
        <ActivityLogInfoAlert />
        <ActivityLogFilters
          search={search}
          onSearchChange={setSearch}
          period={period}
          onPeriodChange={handlePeriodChange}
        />

        {activityQuery.isRefetching ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-[10px] border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2 font-cairo text-[12px] font-bold text-[#047857]">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {t("doctor.activityLog.refreshing")}
          </div>
        ) : null}

        {activityQuery.isError && activityQuery.data ? (
          <div
            role="alert"
            className="mt-4 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-start"
          >
            <div className="font-cairo text-[12px] font-semibold text-[#B42318]">
              {errorMessage ?? t("doctor.activityLog.error.refresh")}
            </div>
            <button
              type="button"
              onClick={() => void retryActivity()}
              disabled={retryingActivity}
              className="mt-3 inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#FCA5A5] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#B42318] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${retryingActivity ? "animate-spin" : ""}`}
              />
              {retryingActivity
                ? t("doctor.activityLog.retrying")
                : t("doctor.activityLog.retry")}
            </button>
          </div>
        ) : null}

        <ActivityLogList items={activityQuery.items} />

        {activityQuery.total > activityQuery.pageSize ? (
          <MedicalServicesDirectoryPagination
            page={page}
            totalPages={activityQuery.totalPages}
            total={activityQuery.total}
            pageSize={activityQuery.pageSize}
            disabled={activityQuery.searching}
            onPageChange={setPage}
            itemLabel={t("doctor.activityLog.itemLabel")}
          />
        ) : null}

        <div className="h-8" />
      </div>
    </>
  );
}
