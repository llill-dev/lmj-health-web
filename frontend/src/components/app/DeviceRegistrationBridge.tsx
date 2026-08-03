import { useEffect } from 'react';
import { ensureRegisteredDeviceForSession } from '@/lib/devices/lifecycle';
import {
  usePushDeviceSyncRecord,
  usePushDeviceStoreVersion,
  usePushDeviceToken,
} from '@/lib/devices/storage';
import { useAuthStore } from '@/store/authStore';

export default function DeviceRegistrationBridge() {
  const storeVersion = usePushDeviceStoreVersion();
  const token = usePushDeviceToken();
  const syncRecord = usePushDeviceSyncRecord();
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (!token || !accessToken || !userId) return;
    void ensureRegisteredDeviceForSession({ accessToken, userId }).catch(() => {
      // Device sync is background-only; failures should not break the app shell.
    });
  }, [storeVersion, token, accessToken, userId, syncRecord?.token, syncRecord?.userId]);

  return null;
}
