import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import {
  filterOrdersByCategory,
  mapDoctorOrderToDetail,
  mapDoctorOrderToRow,
  orderTypeQueryForTab,
  resolveOrdersForUi,
  shouldUseDemoMedicalRequests,
  type MedicalRequestDetailVm,
  type MedicalRequestRowVm,
} from '@/components/doctor/medical-requests/map-doctor-medical-requests';
import { doctorApi, doctorOrdersQueryKeys } from '@/lib/doctor/client';
import type { DoctorOrderCategory } from '@/lib/doctor/doctorOrderTypes';

export type MedicalRequestsFilters = {
  tab: Exclude<DoctorOrderCategory, 'all'>;
  search: string;
  page: number;
  limit: number;
};

function buildListParams(filters: MedicalRequestsFilters) {
  const q = filters.search.trim() || undefined;
  return {
    page: filters.page,
    limit: filters.limit,
    sort: '-createdAt',
    orderType: orderTypeQueryForTab(filters.tab),
    q,
    search: q,
  };
}

export function useDoctorMedicalRequestStats(search: string) {
  const q = search.trim() || undefined;
  const shared = { q, search: q, page: 1, limit: 1 };

  const queries = useQueries({
    queries: [
      {
        queryKey: [...doctorOrdersQueryKeys.all, 'stats', 'all', q] as const,
        queryFn: () => doctorApi.orders.list(shared),
        staleTime: 30_000,
      },
      {
        queryKey: [...doctorOrdersQueryKeys.all, 'stats', 'lab', q] as const,
        queryFn: () =>
          doctorApi.orders.list({ ...shared, orderType: 'LAB_ORDER' }),
        staleTime: 30_000,
      },
      {
        queryKey: [...doctorOrdersQueryKeys.all, 'stats', 'radiology', q] as const,
        queryFn: () =>
          doctorApi.orders.list({ ...shared, orderType: 'IMAGING_ORDER' }),
        staleTime: 30_000,
      },
      {
        queryKey: [...doctorOrdersQueryKeys.all, 'stats', 'procedure', q] as const,
        queryFn: () =>
          doctorApi.orders.list({ ...shared, orderType: 'PROCEDURE_ORDER' }),
        staleTime: 30_000,
      },
    ],
  });

  return useMemo(
    () => ({
      all: queries[0]?.data?.total ?? 0,
      lab: queries[1]?.data?.total ?? 0,
      radiology: queries[2]?.data?.total ?? 0,
      procedure: queries[3]?.data?.total ?? 0,
      isLoading: queries.some((query) => query.isLoading),
    }),
    [queries],
  );
}

export function useDoctorMedicalRequests(filters: MedicalRequestsFilters) {
  const listParams = buildListParams(filters);

  const listQuery = useQuery({
    queryKey: doctorOrdersQueryKeys.list(listParams),
    queryFn: () => doctorApi.orders.list(listParams),
    staleTime: 20_000,
    placeholderData: (previous) => previous,
  });

  const isDemo = shouldUseDemoMedicalRequests(listQuery.data?.orders);

  const processed = useMemo(() => {
    let orders = resolveOrdersForUi(listQuery.data?.orders);

    if (isDemo) {
      orders = filterOrdersByCategory(orders, filters.tab);
      const q = filters.search.trim().toLowerCase();
      if (q) {
        orders = orders.filter((order) => {
          const row = mapDoctorOrderToRow(order);
          const hay = [
            row.systemId,
            row.patientName,
            row.patientPhone,
            row.typeLabel,
            order.orderTitle,
            order.orderName,
          ]
            .filter(Boolean)
            .map((value) => String(value).toLowerCase());
          return hay.some((value) => value.includes(q));
        });
      }
    }

    return orders;
  }, [filters.search, filters.tab, isDemo, listQuery.data?.orders]);

  const total = isDemo
    ? processed.length
    : (listQuery.data?.total ?? processed.length);
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));
  const page = Math.min(filters.page, totalPages);

  const rows: MedicalRequestRowVm[] = useMemo(() => {
    if (isDemo) {
      const start = (page - 1) * filters.limit;
      return processed.slice(start, start + filters.limit).map(mapDoctorOrderToRow);
    }
    return processed.map(mapDoctorOrderToRow);
  }, [filters.limit, isDemo, page, processed]);

  const apiPage = listQuery.data?.page ?? page;
  const showingFrom = total === 0 ? 0 : (apiPage - 1) * filters.limit + 1;
  const showingTo =
    rows.length === 0 ? 0 : Math.min(total, showingFrom + rows.length - 1);

  return {
    rows,
    total,
    totalPages,
    page,
    showingFrom,
    showingTo,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
    isFetching: listQuery.isFetching,
    isDemo,
  };
}

export function useDoctorMedicalRequestDetails(
  orderId: string | null,
  enabled: boolean,
  fallback?: MedicalRequestRowVm | null,
) {
  const detailQuery = useQuery({
    queryKey: doctorOrdersQueryKeys.detail(orderId ?? ''),
    queryFn: () => doctorApi.orders.getById(orderId!),
    enabled: Boolean(enabled && orderId && !orderId.startsWith('demo-')),
    staleTime: 20_000,
  });

  const vm: MedicalRequestDetailVm | null = useMemo(() => {
    if (detailQuery.data?.order) {
      return mapDoctorOrderToDetail(detailQuery.data.order);
    }
    if (fallback?.raw) {
      return mapDoctorOrderToDetail(fallback.raw);
    }
    return null;
  }, [detailQuery.data?.order, fallback]);

  return {
    vm,
    isLoading: detailQuery.isLoading && Boolean(orderId),
    isError: detailQuery.isError,
    error: detailQuery.error,
    refetch: detailQuery.refetch,
  };
}
