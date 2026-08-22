import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import type { AdminSecretariesListParams } from '@/lib/admin/types';

export { useAdminOffboardUser } from '@/hooks/admin/doctors/useAdminOffboardUser';

export const ADMIN_SECRETARY_WRITE_SUPPORTED = false;

export const ADMIN_SECRETARY_BLOCKER_TITLE = {
  ar: 'عقد الإدارة غير متوفر',
  en: 'Admin contract unavailable',
} as const;

export const ADMIN_SECRETARY_BLOCKER_MESSAGE = {
  ar: 'لوحة الإدارة تدعم حالياً استعراض قائمة السكرتارية فقط. إنشاء أو تعديل السكرتير ما زال محجوباً لأن المشروع لا يحتوي على Admin endpoints معتمدة لهذه العمليات، ولا يجب استخدام مسارات الطبيب بديلاً عنها.',
  en: 'The Admin area currently supports listing secretaries only. Create and edit remain blocked because the project does not include approved Admin endpoints for these actions, and doctor-owned routes must not be used as a substitute.',
} as const;

const STALE = 5 * 60 * 1000;
const LIST_KEY = ['admin', 'secretaries'];

export function useAdminSecretariesList(params: AdminSecretariesListParams = {}) {
  const query = useQuery({
    queryKey: [...LIST_KEY, params],
    queryFn: () => adminApi.secretaries.list(params),
    staleTime: STALE,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}
