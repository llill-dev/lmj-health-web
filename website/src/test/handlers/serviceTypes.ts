import { delay, http, HttpResponse } from 'msw';
import type { CreateServiceTypeBody } from '@/lib/admin/types';
import { serviceTypeResponseFactory } from '@/test/factories/serviceTypes';

type ServiceTypeMutationMode =
  | { type: 'success'; delayMs?: number }
  | { type: 'failure'; status: number; body: Record<string, unknown> };

// The wire payload sends `fields` as a real structured array — the live backend
// rejects a JSON-encoded string here (422: "fields.forEach is not a function").
type CreateServiceTypeWirePayload = CreateServiceTypeBody;

let createMode: ServiceTypeMutationMode = { type: 'success' };
let lastCreatePayload: CreateServiceTypeWirePayload | null = null;

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
    lastCreatePayload = (await request.json()) as CreateServiceTypeWirePayload;

    if (createMode.type === 'failure') {
      return HttpResponse.json(createMode.body, { status: createMode.status });
    }

    if (createMode.delayMs) {
      await delay(createMode.delayMs);
    }

    return HttpResponse.json(
      serviceTypeResponseFactory({
        serviceType: {
          ...lastCreatePayload,
          fields: lastCreatePayload?.fields ?? [],
          _id: 'service-type-created',
          schemaVersion: 1,
          isActive: true,
        },
      }),
    );
  }),
];
