import type { DeviceMutationResponse } from '@/lib/devices/client';

export function deviceMutationResponseFactory(
  overrides: Partial<DeviceMutationResponse> = {},
): DeviceMutationResponse {
  return {
    message: 'تمت مزامنة الجهاز بنجاح',
    messageKey: 'devices.ok',
    ...overrides,
  };
}
