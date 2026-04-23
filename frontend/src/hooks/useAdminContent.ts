import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import type {
  AdminContentListParams,
  CreateAdminContentBody,
  UpdateAdminContentBody,
} from '@/lib/admin/types';

const CONTENT_LIST_KEY = ['admin', 'content'];
const STALE = 30 * 1000;

export function useAdminContentList(params: AdminContentListParams = {}) {
  return useQuery({
    queryKey: [...CONTENT_LIST_KEY, params],
    queryFn: () => adminApi.content.list(params),
    staleTime: STALE,
  });
}

export function useAdminContentById(id?: string | null) {
  return useQuery({
    queryKey: [...CONTENT_LIST_KEY, 'details', id],
    queryFn: () => adminApi.content.getById(id as string),
    enabled: Boolean(id),
    staleTime: STALE,
  });
}

function invalidateContentQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: CONTENT_LIST_KEY });
}

export function useSubmitContentReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.content.submitReview(id),
    onSuccess: () => invalidateContentQueries(qc),
  });
}

export function useApproveContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.content.approve(id),
    onSuccess: () => invalidateContentQueries(qc),
  });
}

export function useRejectContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.content.reject(id, reason),
    onSuccess: () => invalidateContentQueries(qc),
  });
}

export function usePublishContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.content.publish(id),
    onSuccess: () => invalidateContentQueries(qc),
  });
}

export function useArchiveContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.content.archive(id),
    onSuccess: () => invalidateContentQueries(qc),
  });
}

export function useCreateAdminContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAdminContentBody) => adminApi.content.create(body),
    onSuccess: () => {
      invalidateContentQueries(qc);
      void qc.invalidateQueries({ queryKey: ['admin', 'content', 'count'] });
    },
  });
}

export function useUpdateAdminContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateAdminContentBody;
    }) => adminApi.content.update(id, body),
    onSuccess: () => {
      invalidateContentQueries(qc);
      void qc.invalidateQueries({ queryKey: ['admin', 'content', 'count'] });
    },
  });
}
