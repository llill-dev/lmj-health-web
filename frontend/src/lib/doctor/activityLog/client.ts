import { get } from '@/lib/api';
import { doctorEndpoints } from '@/lib/doctor/endpoints';
import type {
  DoctorActivityLogListParams,
  DoctorActivityLogListResponse,
} from '@/lib/doctor/activityLog/api-types';

function buildActivityLogQuery(params: DoctorActivityLogListParams = {}): string {
  const qs = new URLSearchParams();
  if (params.page != null) qs.set('page', String(params.page));
  if (params.limit != null) qs.set('limit', String(params.limit));
  if (params.actorRole?.trim()) qs.set('actorRole', params.actorRole.trim());
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);

  if (params.type) {
    const types = Array.isArray(params.type) ? params.type : [params.type];
    const normalized = types.map((value) => value.trim()).filter(Boolean);
    if (normalized.length) qs.set('type', normalized.join(','));
  }

  return qs.toString();
}

export const doctorActivityLogApi = {
  list: (params: DoctorActivityLogListParams = {}) => {
    const query = buildActivityLogQuery(params);
    return get<DoctorActivityLogListResponse>(
      query
        ? `${doctorEndpoints.me.activityLog}?${query}`
        : doctorEndpoints.me.activityLog,
      { locale: 'ar' },
    );
  },
};
