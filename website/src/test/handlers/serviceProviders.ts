import { http, HttpResponse } from 'msw';
import {
  managedServiceProviderDetailResponseFactory,
  managedServiceProviderListResponseFactory,
} from '@/test/factories/serviceProviders';

type CapturedWritePayload = Record<string, unknown> | null;

let lastCreatePayload: CapturedWritePayload = null;
let lastUpdatePayload: CapturedWritePayload = null;
let lastListUrl: URL | null = null;

export function getLastCreateProviderPayload() {
  return lastCreatePayload;
}

export function getLastUpdateProviderPayload() {
  return lastUpdatePayload;
}

export function getLastProviderListUrl() {
  return lastListUrl;
}

export function resetServiceProviderHandlers() {
  lastCreatePayload = null;
  lastUpdatePayload = null;
  lastListUrl = null;
}

export const serviceProviderHandlers = [
  http.get('*/api/service-providers', ({ request }) => {
    lastListUrl = new URL(request.url);
    return HttpResponse.json(managedServiceProviderListResponseFactory());
  }),
  http.get('*/api/service-providers/:id', () => {
    return HttpResponse.json(managedServiceProviderDetailResponseFactory());
  }),
  http.post('*/api/service-providers', async ({ request }) => {
    lastCreatePayload = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { status: 201, messageKey: 'success.created', message: 'Created.', id: 'provider-1' },
      { status: 201 },
    );
  }),
  http.put('*/api/service-providers/:id', async ({ request }) => {
    lastUpdatePayload = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      status: 200,
      messageKey: 'success.ok',
      message: 'Updated.',
    });
  }),
];
