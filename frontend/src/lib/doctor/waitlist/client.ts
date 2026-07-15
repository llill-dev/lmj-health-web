import { get, patch, post } from '@/lib/api';
import { waitlistEndpoints } from '@/lib/doctor/waitlist/endpoints';
import type {
  WaitlistBookBody,
  WaitlistBookResponse,
  WaitlistDetailResponse,
  WaitlistListParams,
  WaitlistListResponse,
  WaitlistSuggestionsParams,
  WaitlistSuggestionsResponse,
} from '@/lib/doctor/waitlist/types';

function buildWaitlistQuery(params: WaitlistListParams = {}): string {
  const qs = new URLSearchParams();
  if (params.status?.trim()) qs.set('status', params.status.trim());
  if (params.urgencyLevel?.trim()) {
    qs.set('urgencyLevel', params.urgencyLevel.trim());
  }
  if (params.date?.trim()) qs.set('date', params.date.trim());
  if (params.dateFrom?.trim()) qs.set('dateFrom', params.dateFrom.trim());
  if (params.dateTo?.trim()) qs.set('dateTo', params.dateTo.trim());
  if (params.q?.trim()) qs.set('q', params.q.trim());
  if (params.page != null) qs.set('page', String(params.page));
  if (params.limit != null) qs.set('limit', String(params.limit));
  return qs.toString();
}

export const waitlistQueryKeys = {
  all: ['doctor', 'waitlist'] as const,
  list: (params: WaitlistListParams) =>
    [...waitlistQueryKeys.all, 'list', params] as const,
  mine: (params: WaitlistListParams) =>
    [...waitlistQueryKeys.all, 'mine', params] as const,
  detail: (id: string) => [...waitlistQueryKeys.all, 'detail', id] as const,
  suggestions: (params: WaitlistSuggestionsParams) =>
    [...waitlistQueryKeys.all, 'suggestions', params] as const,
};

export const waitlistApi = {
  list: (params: WaitlistListParams = {}) => {
    const query = buildWaitlistQuery(params);
    const path = query
      ? `${waitlistEndpoints.list}?${query}`
      : waitlistEndpoints.list;
    return get<WaitlistListResponse>(path, { locale: 'ar' });
  },

  listMine: (params: WaitlistListParams = {}) => {
    const query = buildWaitlistQuery(params);
    const path = query
      ? `${waitlistEndpoints.mine}?${query}`
      : waitlistEndpoints.mine;
    return get<WaitlistListResponse>(path, { locale: 'ar' });
  },

  getById: (id: string) =>
    get<WaitlistDetailResponse>(waitlistEndpoints.byId(id), { locale: 'ar' }),

  cancel: (id: string, body?: { cancelReason?: string }) =>
    patch<{ messageKey?: string; message?: string; waitlistRequest?: unknown }>(
      waitlistEndpoints.cancel(id),
      body ?? {},
      { locale: 'ar' },
    ),

  markContacted: (id: string, body?: { note?: string }) =>
    patch<{ messageKey?: string; message?: string; waitlistRequest?: unknown }>(
      waitlistEndpoints.contacted(id),
      body ?? {},
      { locale: 'ar' },
    ),

  close: (id: string, body?: { closedReason?: string }) =>
    patch<{ messageKey?: string; message?: string; waitlistRequest?: unknown }>(
      waitlistEndpoints.close(id),
      body ?? {},
      { locale: 'ar' },
    ),

  book: (id: string, body: WaitlistBookBody) =>
    post<WaitlistBookResponse>(waitlistEndpoints.book(id), body, {
      locale: 'ar',
    }),

  suggestions: (params: WaitlistSuggestionsParams) => {
    const qs = new URLSearchParams();
    qs.set('date', params.date);
    if (params.startTime?.trim()) qs.set('startTime', params.startTime.trim());
    if (params.type) qs.set('type', params.type);
    return get<WaitlistSuggestionsResponse>(
      `${waitlistEndpoints.suggestions}?${qs.toString()}`,
      { locale: 'ar' },
    );
  },
};
