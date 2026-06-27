import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import type {
  AdminMedicalOrderCatalogUpsertBody,
  MedicalOrderCatalogKind,
} from '@/lib/admin/types';

export const MEDICAL_ORDER_CATALOG_KEYS = {
  all: ['admin', 'medical-order-catalog'] as const,
  list: (kind: MedicalOrderCatalogKind) =>
    [...MEDICAL_ORDER_CATALOG_KEYS.all, 'list', kind] as const,
};

export function useAdminMedicalOrderCatalog(
  kind: MedicalOrderCatalogKind,
  search?: string,
) {
  const trimmedSearch = search?.trim() ?? '';
  const query = useQuery({
    queryKey: [...MEDICAL_ORDER_CATALOG_KEYS.list(kind), trimmedSearch],
    queryFn: () =>
      adminApi.medicalOrderCatalog.list({
        type: kind,
        ...(trimmedSearch ? { search: trimmedSearch } : {}),
      }),
    staleTime: 30_000,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useCreateMedicalOrderCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminMedicalOrderCatalogUpsertBody) =>
      adminApi.medicalOrderCatalog.create(body),
    onSuccess: (_, v) => {
      void qc.invalidateQueries({
        queryKey: MEDICAL_ORDER_CATALOG_KEYS.list(v.kind),
      });
    },
  });
}

export function useUpdateMedicalOrderCatalogItem(
  kind: MedicalOrderCatalogKind,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      id: string;
      label: string;
      isActive?: boolean;
      isVisible?: boolean;
    }) =>
      adminApi.medicalOrderCatalog.update(kind, vars.id, {
        label: vars.label,
        isActive: vars.isActive,
        isVisible: vars.isVisible,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: MEDICAL_ORDER_CATALOG_KEYS.list(kind),
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
        queryKey: MEDICAL_ORDER_CATALOG_KEYS.list(kind),
      });
    },
  });
}
