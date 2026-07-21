import { useEffect } from 'react';
import { ensureRegisteredDeviceForSession } from '@/lib/devices/lifecycle';
import { usePushDeviceToken } from '@/lib/devices/storage';
import { useAuthStore } from '@/store/authStore';

export default function DeviceRegistrationBridge() {
  const token = usePushDeviceToken();
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (!token || !accessToken || !userId) return;
    void ensureRegisteredDeviceForSession({ accessToken, userId }).catch(() => {
      // Device sync is background-only; failures should not break the app shell.
    });
  }, [token, accessToken, userId]);

  return null;
}
