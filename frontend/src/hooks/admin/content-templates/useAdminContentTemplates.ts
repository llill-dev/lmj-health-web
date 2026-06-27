import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import type {
  AdminContentTemplate,
  AdminContentTemplatesListParams,
  CreateAdminContentTemplateBody,
  UpdateAdminContentTemplateBody,
} from '@/lib/admin/types';

const ADMIN_CONTENT_TEMPLATES_KEY = ['admin', 'content-templates'] as const;
const STALE = 60 * 1000;

/** يوحّد مفاتيح الاستجابة المختلفة (contentTemplates/items/templates) لقائمة واحدة. */
function normalizeTemplates(
  data:
    | {
        contentTemplates?: AdminContentTemplate[];
        items?: AdminContentTemplate[];
        templates?: AdminContentTemplate[];
      }
    | undefined,
): AdminContentTemplate[] {
  if (!data) return [];
  return data.contentTemplates ?? data.items ?? data.templates ?? [];
}

export function useAdminContentTemplates(
  params: AdminContentTemplatesListParams = {},
) {
  const query = useQuery({
    queryKey: [...ADMIN_CONTENT_TEMPLATES_KEY, params],
    queryFn: () => adminApi.contentTemplates.list(params),
    staleTime: STALE,
  });

  const templates = useMemo(
    () => normalizeTemplates(query.data),
    [query.data],
  );

  return {
    ...query,
    templates,
    total: query.data?.total ?? templates.length,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useCreateAdminContentTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAdminContentTemplateBody) =>
      adminApi.contentTemplates.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ADMIN_CONTENT_TEMPLATES_KEY });
    },
  });
}

export function useUpdateAdminContentTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateAdminContentTemplateBody;
    }) => adminApi.contentTemplates.update(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ADMIN_CONTENT_TEMPLATES_KEY });
    },
  });
}

export function useDisableAdminContentTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
      adminApi.contentTemplates.disable(id, force ?? false),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ADMIN_CONTENT_TEMPLATES_KEY });
    },
  });
}
