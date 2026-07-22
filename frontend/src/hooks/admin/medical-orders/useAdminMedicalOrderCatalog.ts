import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import type {
  AdminMedicalOrderCatalogDetailsResponse,
  AdminMedicalOrderCatalogListParams,
  AdminMedicalOrderCatalogUpsertBody,
  MedicalOrderCatalogKind,
} from '@/lib/admin/types';

export const MEDICAL_ORDER_CATALOG_KEYS = {
  all: ['admin', 'medical-order-catalog'] as const,
  list: (params: AdminMedicalOrderCatalogListParams) =>
    [...MEDICAL_ORDER_CATALOG_KEYS.all, 'list', params] as const,
};

export function useAdminMedicalOrderCatalog(
  kind: MedicalOrderCatalogKind,
  params: Omit<AdminMedicalOrderCatalogListParams, "type"> = {},
) {
  const queryParams: AdminMedicalOrderCatalogListParams = {
    type: kind,
    ...params,
    search: params.search?.trim() || undefined,
    q: params.q?.trim() || undefined,
    category: params.category?.trim() || undefined,
    sort: params.sort?.trim() || undefined,
  };
  const query = useQuery({
    queryKey: MEDICAL_ORDER_CATALOG_KEYS.list(queryParams),
    queryFn: () => adminApi.medicalOrderCatalog.list(queryParams),
    staleTime: 30_000,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useAdminMedicalOrderCatalogItem(
  kind: MedicalOrderCatalogKind,
  id?: string | null,
) {
  const query = useQuery({
    queryKey: [...MEDICAL_ORDER_CATALOG_KEYS.all, 'details', kind, id],
    queryFn: () => adminApi.medicalOrderCatalog.getById(kind, id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

  const item =
    (query.data as AdminMedicalOrderCatalogDetailsResponse | undefined)?.item ??
    null;

  return {
    ...query,
    item,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useCreateMedicalOrderCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminMedicalOrderCatalogUpsertBody) =>
      adminApi.medicalOrderCatalog.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: [...MEDICAL_ORDER_CATALOG_KEYS.all, "list"],
      });
    },
  });
}

export function useUpdateMedicalOrderCatalogItem(
  kind: MedicalOrderCatalogKind,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; body: Partial<AdminMedicalOrderCatalogUpsertBody> }) =>
      adminApi.medicalOrderCatalog.update(kind, vars.id, {
        ...vars.body,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: [...MEDICAL_ORDER_CATALOG_KEYS.all, "list"],
      });
    },
  });
}

export function useDeleteMedicalOrderCatalogItem(
  kind: MedicalOrderCatalogKind,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.medicalOrderCatalog.remove(kind, id),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: [...MEDICAL_ORDER_CATALOG_KEYS.all, "list"],
      });
    },
  });
}
