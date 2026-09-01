'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isAwaitingInitialQueryDataWithPlaceholder } from '@/lib/query/queryUi';
import { doctorActivityLogApi } from '@/lib/doctor/activityLog/client';
import {
  DOCTOR_ACTIVITY_LOG_PAGE_SIZE,
  DOCTOR_ACTIVITY_LOG_SEARCH_FETCH_LIMIT,
} from '@/lib/doctor/activityLog/constants';
import { mapDoctorActivityLogItems } from '@/lib/doctor/activityLog/mappers';
import { activityLogPeriodRange } from '@/lib/doctor/activityLog/period';
import type { ActivityLogPeriod } from '@/lib/doctor/activityLog/types';

export const DOCTOR_ACTIVITY_LOG_KEYS = {
  all: ['doctor', 'activity-log'] as const,
  list: (params: {
    page: number;
    period: ActivityLogPeriod;
    search: string;
  }) => [...DOCTOR_ACTIVITY_LOG_KEYS.all, 'list', params] as const,
};

function filterActivityLogItems(
  items: ReturnType<typeof mapDoctorActivityLogItems>,
  search: string,
) {
  const q = search.trim().toLowerCase();
  if (!q) return items;

  return items.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.operationTypeLabel.toLowerCase().includes(q) ||
      item.patientName?.toLowerCase().includes(q) ||
      item.actorDisplayName?.toLowerCase().includes(q) ||
      item.device?.toLowerCase().includes(q) ||
      item.ip?.includes(search.trim())
    );
  });
}

export function useDoctorActivityLog(params: {
  page: number;
  period: ActivityLogPeriod;
  search: string;
  locale?: 'ar' | 'en';
}) {
  const range = useMemo(
    () => activityLogPeriodRange(params.period),
    [params.period],
  );
  const searching = params.search.trim().length >= 2;

  const query = useQuery({
    queryKey: DOCTOR_ACTIVITY_LOG_KEYS.list(params),
    queryFn: () =>
      doctorActivityLogApi.list({
        page: searching ? 1 : params.page,
        limit: searching
          ? DOCTOR_ACTIVITY_LOG_SEARCH_FETCH_LIMIT
          : DOCTOR_ACTIVITY_LOG_PAGE_SIZE,
        ...range,
      }),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });

  const mappedItems = useMemo(
    () => mapDoctorActivityLogItems(query.data?.activityLogs, params.locale),
    [query.data?.activityLogs, params.locale],
  );

  const items = useMemo(
    () =>
      searching
        ? filterActivityLogItems(mappedItems, params.search)
        : mappedItems,
    [mappedItems, params.search, searching],
  );

  const total = searching ? items.length : (query.data?.total ?? items.length);
  const totalPages = searching
    ? 1
    : Math.max(
        1,
        Math.ceil(total / DOCTOR_ACTIVITY_LOG_PAGE_SIZE),
      );

  const isAwaitingData = isAwaitingInitialQueryDataWithPlaceholder(
    query.data,
    query.isError,
    undefined,
  );

  return {
    ...query,
    items,
    total,
    totalPages,
    pageSize: DOCTOR_ACTIVITY_LOG_PAGE_SIZE,
    searching,
    isAwaitingData,
  };
}
