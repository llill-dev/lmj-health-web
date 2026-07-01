import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import type {
  AdminContentListParams,
  AdminNewsIngestBody,
  AdminNewsPendingListParams,
  AdminNewsPendingListResponse,
  AdminContentDetailsItem,
  CreateAdminContentBody,
  UpdateAdminContentBody,
} from '@/lib/admin/types';

const CONTENT_LIST_KEY = ['admin', 'content'];
const STALE = 30 * 1000;

export function useAdminContentList(params: AdminContentListParams = {}) {
  const query = useQuery({
    queryKey: [...CONTENT_LIST_KEY, params],
    queryFn: () => adminApi.content.list(params),
    staleTime: STALE,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useAdminMyContentList(params: AdminContentListParams = {}) {
  const query = useQuery({
    queryKey: [...CONTENT_LIST_KEY, 'mine', params],
    queryFn: () => adminApi.content.listMine(params),
    staleTime: STALE,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useAdminContentById(id?: string | null) {
  const query = useQuery({
    queryKey: [...CONTENT_LIST_KEY, 'details', id],
    queryFn: () => adminApi.content.getById(id as string),
    enabled: Boolean(id),
    staleTime: STALE,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
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

export function useAdminPendingNews(params: AdminNewsPendingListParams = {}) {
  const query = useQuery({
    queryKey: ['admin', 'news', 'pending', params],
    queryFn: () => adminApi.news.pending(params),
    staleTime: STALE,
  });

  const items = (
    (query.data as AdminNewsPendingListResponse | undefined)?.items ??
    (query.data as AdminNewsPendingListResponse | undefined)?.content ??
    []
  ) as AdminContentDetailsItem[];

  return {
    ...query,
    items,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useIngestNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminNewsIngestBody) => adminApi.news.ingest(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'news', 'pending'] });
      invalidateContentQueries(qc);
      void qc.invalidateQueries({ queryKey: ['admin', 'content', 'count'] });
    },
  });
}
