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
function readTemplateArray(value: unknown): AdminContentTemplate[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter(
    (item): item is AdminContentTemplate =>
      Boolean(item && typeof item === 'object' && '_id' in item),
  );
}

function normalizeTemplates(
  data:
    | {
        contentTemplates?: AdminContentTemplate[];
        items?: AdminContentTemplate[];
        templates?: AdminContentTemplate[];
        data?: unknown;
        result?: unknown;
      }
    | undefined,
): AdminContentTemplate[] {
  if (!data) return [];
  const direct =
    readTemplateArray(data.contentTemplates) ??
    readTemplateArray(data.items) ??
    readTemplateArray(data.templates);

  const nested =
    (data.data && typeof data.data === 'object'
      ? normalizeTemplates(data.data as Parameters<typeof normalizeTemplates>[0])
      : undefined) ??
    (data.result && typeof data.result === 'object'
      ? normalizeTemplates(data.result as Parameters<typeof normalizeTemplates>[0])
      : undefined);

  const merged = [...(direct ?? []), ...(nested ?? [])];
  if (!merged.length) return [];

  const deduped = new Map<string, AdminContentTemplate>();
  merged.forEach((template) => {
    if (!template?._id) return;
    if (!deduped.has(template._id)) deduped.set(template._id, template);
  });

  return Array.from(deduped.values());
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
