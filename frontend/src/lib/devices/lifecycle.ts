import { devicesApi } from '@/lib/devices/client';
import {
  clearPushDeviceSyncRecord,
  ensurePushDeviceId,
  readPushDeviceSyncRecord,
  readPushDeviceToken,
  writePushDeviceSyncRecord,
} from '@/lib/devices/storage';

export type DeviceSessionContext = {
  accessToken: string;
  userId: string;
};

function browserUserAgent(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return navigator.userAgent || undefined;
}

function hasMatchingSyncRecord(userId: string, token: string): boolean {
  const syncRecord = readPushDeviceSyncRecord();
  return syncRecord?.userId === userId && syncRecord.token === token;
}

export async function ensureRegisteredDeviceForSession(
  session: DeviceSessionContext,
): Promise<boolean> {
  const token = readPushDeviceToken();
  if (!token) return false;
  if (hasMatchingSyncRecord(session.userId, token)) return false;

  await devicesApi.register({
    token,
    deviceId: ensurePushDeviceId(),
    platform: 'web',
    clientType: 'web',
    userAgent: browserUserAgent(),
  });

  writePushDeviceSyncRecord({
    userId: session.userId,
    token,
  });
  return true;
}

export async function unregisterDeviceForSession(
  _session: DeviceSessionContext,
): Promise<boolean> {
  const token = readPushDeviceToken();
  if (!token) {
    clearPushDeviceSyncRecord();
    return false;
  }

  await devicesApi.unregister({
    token,
    deviceId: ensurePushDeviceId(),
  });
  clearPushDeviceSyncRecord();
  return true;
}
