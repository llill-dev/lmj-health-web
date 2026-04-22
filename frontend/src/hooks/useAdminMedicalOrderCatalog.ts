import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import type {
  AdminMedicalOrderCatalogUpsertBody,
  MedicalOrderCatalogKind,
} from '@/lib/admin/types';

export const MEDICAL_ORDER_CATALOG_KEYS = {
  all: ['admin', 'medical-order-catalog'] as const,
  list: (kind: MedicalOrderCatalogKind) =>
    [...MEDICAL_ORDER_CATALOG_KEYS.all, 'list', kind] as const,
};

export function useAdminMedicalOrderCatalog(kind: MedicalOrderCatalogKind) {
  return useQuery({
    queryKey: MEDICAL_ORDER_CATALOG_KEYS.list(kind),
    queryFn: () => adminApi.medicalOrderCatalog.list({ type: kind }),
    staleTime: 30_000,
  });
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
    mutationFn: (vars: { id: string; label: string }) =>
      adminApi.medicalOrderCatalog.update(vars.id, { label: vars.label }),
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
    mutationFn: (id: string) => adminApi.medicalOrderCatalog.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: MEDICAL_ORDER_CATALOG_KEYS.list(kind),
      });
    },
  });
}
