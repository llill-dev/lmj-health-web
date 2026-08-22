import { post } from '@/lib/api';
import { deviceEndpoints } from '@/lib/devices/endpoints';

export type DevicePlatform = 'web';

export type RegisterDeviceBody = {
  token: string;
  deviceId: string;
  platform: DevicePlatform;
  clientType: 'web';
  userAgent?: string;
};

export type UnregisterDeviceBody = {
  token: string;
  deviceId: string;
};

export type DeviceMutationResponse = {
  messageKey?: string;
  message?: string;
};

/**
 * The repository confirms the devices endpoints exist, but does not expose a
 * detailed request schema. We keep the body minimal and web-specific so it is
 * easy to adjust if the backend tightens the contract later.
 */
export const devicesApi = {
  register: (body: RegisterDeviceBody) =>
    post<DeviceMutationResponse>(deviceEndpoints.register(), body, {
      locale: 'ar',
    }),

  unregister: (body: UnregisterDeviceBody) =>
    post<DeviceMutationResponse>(deviceEndpoints.unregister(), body, {
      locale: 'ar',
    }),
};
