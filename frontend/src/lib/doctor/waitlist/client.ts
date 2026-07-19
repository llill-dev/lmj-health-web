import { get, patch, post } from '@/lib/api';
import { waitlistEndpoints } from '@/lib/doctor/waitlist/endpoints';
import type {
  CreateWaitlistRequestBody,
  CreateWaitlistRequestResponse,
  WaitlistBookBody,
  WaitlistBookResponse,
  WaitlistDetailResponse,
  WaitlistListParams,
  WaitlistListResponse,
  WaitlistRequest,
  WaitlistSuggestionsParams,
  WaitlistSuggestionsResponse,
} from '@/lib/doctor/waitlist/types';

type WaitlistEnvelope = {
  waitlistRequests?: unknown;
  waitlistRequest?: unknown;
  data?: unknown;
  item?: unknown;
  result?: unknown;
  page?: unknown;
  limit?: unknown;
  total?: unknown;
  results?: unknown;
};

function asWaitlistEnvelope(value: unknown): WaitlistEnvelope | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as WaitlistEnvelope)
    : null;
}

function readWaitlistNestedEnvelope(value: unknown): WaitlistEnvelope | null {
  const record = asWaitlistEnvelope(value);
  return (
    asWaitlistEnvelope(record?.data) ??
    asWaitlistEnvelope(record?.item) ??
    asWaitlistEnvelope(record?.result) ??
    null
  );
}

function isWaitlistRequestArray(value: unknown): value is WaitlistRequest[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === 'object' && !Array.isArray(item))
  );
}

function isWaitlistRequest(value: unknown): value is WaitlistRequest {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function readWaitlistNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function readWaitlistArray(value: unknown): WaitlistRequest[] | null {
  return isWaitlistRequestArray(value) ? value : null;
}

function readWaitlistEntity(value: unknown): WaitlistRequest | null {
  return isWaitlistRequest(value) ? value : null;
}

function readWaitlistRequests(value: unknown): WaitlistRequest[] | null {
  const record = asWaitlistEnvelope(value);
  if (!record) return null;

  return (
    readWaitlistArray(record.waitlistRequests) ??
    readWaitlistArray(record.data) ??
    readWaitlistRequests(record.data) ??
    readWaitlistRequests(record.result)
  );
}

function readWaitlistRequest(value: unknown): WaitlistRequest | null {
  const record = asWaitlistEnvelope(value);
  if (!record) return null;

  return (
    readWaitlistEntity(record.waitlistRequest) ??
    readWaitlistEntity(record.item) ??
    readWaitlistEntity(record.data) ??
    readWaitlistRequest(record.data) ??
    readWaitlistRequest(record.result)
  );
}

function normalizeWaitlistListResponse(
  response: WaitlistListResponse,
): WaitlistListResponse {
  const requests = readWaitlistRequests(response) ?? [];
  const nested = readWaitlistNestedEnvelope(response);

  return {
    ...response,
    waitlistRequests: requests,
    page:
      readWaitlistNumber(response.page) ??
      readWaitlistNumber(nested?.page) ??
      response.page,
    limit:
      readWaitlistNumber(response.limit) ??
      readWaitlistNumber(nested?.limit) ??
      response.limit,
    total:
      readWaitlistNumber(response.total) ??
      readWaitlistNumber(nested?.total) ??
      response.total,
    results:
      readWaitlistNumber(response.results) ??
      readWaitlistNumber(nested?.results) ??
      requests.length,
  };
}

function normalizeWaitlistDetailResponse<T extends { waitlistRequest?: WaitlistRequest }>(
  response: T,
): T {
  const waitlistRequest = readWaitlistRequest(response);
  return waitlistRequest ? { ...response, waitlistRequest } : response;
}

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
    return get<WaitlistListResponse>(path, { locale: 'ar' }).then(
      normalizeWaitlistListResponse,
    );
  },

  create: (body: CreateWaitlistRequestBody) =>
    post<CreateWaitlistRequestResponse>(waitlistEndpoints.list, body, {
      locale: 'ar',
    }).then(normalizeWaitlistDetailResponse),

  listMine: (params: WaitlistListParams = {}) => {
    const query = buildWaitlistQuery(params);
    const path = query
      ? `${waitlistEndpoints.mine}?${query}`
      : waitlistEndpoints.mine;
    return get<WaitlistListResponse>(path, { locale: 'ar' }).then(
      normalizeWaitlistListResponse,
    );
  },

  getById: (id: string) =>
    get<WaitlistDetailResponse>(waitlistEndpoints.byId(id), { locale: 'ar' }).then(
      normalizeWaitlistDetailResponse,
    ),

  cancel: (id: string, body?: { cancelReason?: string }) =>
    patch<{ messageKey?: string; message?: string; waitlistRequest?: unknown }>(
      waitlistEndpoints.cancel(id),
      body ?? {},
      { locale: 'ar' },
    ).then(normalizeWaitlistDetailResponse),

  markContacted: (id: string, body?: { note?: string }) =>
    patch<{ messageKey?: string; message?: string; waitlistRequest?: unknown }>(
      waitlistEndpoints.contacted(id),
      body ?? {},
      { locale: 'ar' },
    ).then(normalizeWaitlistDetailResponse),

  close: (id: string, body?: { closedReason?: string }) =>
    patch<{ messageKey?: string; message?: string; waitlistRequest?: unknown }>(
      waitlistEndpoints.close(id),
      body ?? {},
      { locale: 'ar' },
    ).then(normalizeWaitlistDetailResponse),

  book: (id: string, body: WaitlistBookBody) =>
    post<WaitlistBookResponse>(waitlistEndpoints.book(id), body, {
      locale: 'ar',
    }).then(normalizeWaitlistDetailResponse),

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
