import { delay, http, HttpResponse } from 'msw';
import type { CreateServiceTypeBody } from '@/lib/admin/types';
import { serviceTypeResponseFactory } from '@/test/factories/serviceTypes';

type ServiceTypeMutationMode =
  | { type: 'success'; delayMs?: number }
  | { type: 'failure'; status: number; body: Record<string, unknown> };

let createMode: ServiceTypeMutationMode = { type: 'success' };
let lastCreatePayload: CreateServiceTypeBody | null = null;

function serviceTypesEndpoint() {
  return '*/api/service-types';
}

export function mockCreateServiceTypeSuccess(options: { delayMs?: number } = {}) {
  createMode = { type: 'success', delayMs: options.delayMs };
}

export function mockCreateServiceTypeFailure(
  status: number,
  body: Record<string, unknown>,
) {
  createMode = { type: 'failure', status, body };
}

export function getLastCreateServiceTypePayload() {
  return lastCreatePayload;
}

export function resetServiceTypeHandlers() {
  createMode = { type: 'success' };
  lastCreatePayload = null;
}

export const serviceTypeHandlers = [
  http.post(serviceTypesEndpoint(), async ({ request }) => {
    lastCreatePayload = (await request.json()) as CreateServiceTypeBody;

    if (createMode.type === 'failure') {
      return HttpResponse.json(createMode.body, { status: createMode.status });
    }

    if (createMode.delayMs) {
      await delay(createMode.delayMs);
    }

    return HttpResponse.json(
      serviceTypeResponseFactory({
        serviceType: {
          _id: 'service-type-created',
          schemaVersion: 1,
          isActive: true,
          ...lastCreatePayload,
        },
      }),
    );
  }),
];
