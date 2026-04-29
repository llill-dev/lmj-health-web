'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import type { AdminLookupCreateBody, AdminLookupPatchBody } from '@/lib/admin/types';

export function useCreateLookup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminLookupCreateBody) => adminApi.lookups.create(body),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ['admin-lookups'],
      }),
  });
}

export function usePatchLookup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AdminLookupPatchBody }) =>
      adminApi.lookups.patch(id, body),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ['admin-lookups'],
      }),
  });
}

export function useRemoveLookup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.lookups.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ['admin-lookups'],
      }),
  });
}
