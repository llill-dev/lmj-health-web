import { delay, http, HttpResponse } from 'msw';
import type {
  RegisterDeviceBody,
  UnregisterDeviceBody,
} from '@/lib/devices/client';
import { deviceMutationResponseFactory } from '@/test/factories/devices';

type FailureResponse = {
  status: number;
  body: Record<string, unknown>;
};

const registerRequests: RegisterDeviceBody[] = [];
const unregisterRequests: UnregisterDeviceBody[] = [];

let registerFailure: FailureResponse | null = null;
let unregisterFailure: FailureResponse | null = null;
let registerDelayMs = 0;

function endpoint(path: string) {
  return `*/api/devices/${path}`;
}

export function getRegisterDeviceRequests() {
  return [...registerRequests];
}

export function getUnregisterDeviceRequests() {
  return [...unregisterRequests];
}

export function mockDeviceRegisterFailure(
  status = 500,
  body: Record<string, unknown> = {
    message: 'تعذّر تسجيل الجهاز',
    messageKey: 'devices.register.failed',
  },
) {
  registerFailure = { status, body };
}

export function mockDeviceUnregisterFailure(
  status = 500,
  body: Record<string, unknown> = {
    message: 'تعذّر إلغاء تسجيل الجهاز',
    messageKey: 'devices.unregister.failed',
  },
) {
  unregisterFailure = { status, body };
}

export function mockDeviceRegisterPending(delayMs: number) {
  registerDelayMs = delayMs;
}

export function resetDeviceHandlers() {
  registerRequests.length = 0;
  unregisterRequests.length = 0;
  registerFailure = null;
  unregisterFailure = null;
  registerDelayMs = 0;
}

export const deviceHandlers = [
  http.post(endpoint('register'), async ({ request }) => {
    const body = (await request.json()) as RegisterDeviceBody;
    registerRequests.push(body);

    if (registerDelayMs > 0) {
      await delay(registerDelayMs);
      registerDelayMs = 0;
    }

    if (registerFailure) {
      return HttpResponse.json(registerFailure.body, {
        status: registerFailure.status,
      });
    }

    return HttpResponse.json(deviceMutationResponseFactory());
  }),

  http.post(endpoint('unregister'), async ({ request }) => {
    const body = (await request.json()) as UnregisterDeviceBody;
    unregisterRequests.push(body);

    if (unregisterFailure) {
      return HttpResponse.json(unregisterFailure.body, {
        status: unregisterFailure.status,
      });
    }

    return HttpResponse.json(
      deviceMutationResponseFactory({
        message: 'تم إلغاء تسجيل الجهاز بنجاح',
        messageKey: 'devices.unregistered',
      }),
    );
  }),
];
