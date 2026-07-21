import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DeviceRegistrationBridge from '@/components/app/DeviceRegistrationBridge';
import { persistAuthSession, readStoredAuthSession } from '@/lib/auth/session';
import {
  clearPushDeviceSyncRecord,
  readPushDeviceSyncRecord,
  setPushDeviceToken,
} from '@/lib/devices/storage';
import {
  getRegisterDeviceRequests,
  getUnregisterDeviceRequests,
  mockDeviceRegisterFailure,
} from '@/test/handlers/devices';
import { renderWithProviders } from '@/test/renderWithProviders';
import { useAuthStore } from '@/store/authStore';

function seedAuthenticatedDoctor() {
  persistAuthSession(
    {
      accessToken: 'access-token-1',
      refreshToken: 'refresh-token-1',
      refreshExpiresAt: '2030-01-01T00:00:00.000Z',
    },
    {
      userId: 'user-1',
      role: 'doctor',
      fullName: 'أحمد الطبيب',
      email: 'doctor@example.com',
      phone: '+963912345678',
      actorIds: { doctorId: 'doctor-1' },
    },
  );

  useAuthStore.setState({
    accessToken: 'access-token-1',
    refreshToken: 'refresh-token-1',
    refreshExpiresAt: '2030-01-01T00:00:00.000Z',
    isAuthenticated: true,
    user: {
      id: 'user-1',
      email: 'doctor@example.com',
      phone: '+963912345678',
      role: 'doctor',
      verified: true,
      name: 'أحمد الطبيب',
    },
  });
}

describe('Device registration lifecycle', () => {
  it('registers the current push token once for an authenticated session and avoids duplicates on rerender', async () => {
    seedAuthenticatedDoctor();
    setPushDeviceToken('push-token-1');

    const { rerender } = renderWithProviders(<DeviceRegistrationBridge />);

    await waitFor(() => {
      expect(getRegisterDeviceRequests()).toHaveLength(1);
    });

    expect(getRegisterDeviceRequests()[0]).toMatchObject({
      token: 'push-token-1',
      platform: 'web',
      clientType: 'web',
    });
    expect(readPushDeviceSyncRecord()).toEqual({
      userId: 'user-1',
      token: 'push-token-1',
    });

    rerender(<DeviceRegistrationBridge />);

    await waitFor(() => {
      expect(getRegisterDeviceRequests()).toHaveLength(1);
    });
  });

  it('updates the backend registration when the push token changes', async () => {
    seedAuthenticatedDoctor();
    setPushDeviceToken('push-token-1');

    renderWithProviders(<DeviceRegistrationBridge />);

    await waitFor(() => {
      expect(getRegisterDeviceRequests()).toHaveLength(1);
    });

    setPushDeviceToken('push-token-2');

    await waitFor(() => {
      expect(getRegisterDeviceRequests()).toHaveLength(2);
    });

    expect(getRegisterDeviceRequests()[1]).toMatchObject({
      token: 'push-token-2',
      platform: 'web',
      clientType: 'web',
    });
    expect(readPushDeviceSyncRecord()).toEqual({
      userId: 'user-1',
      token: 'push-token-2',
    });
  });

  it('keeps the device unsynced after register failure so the same token can retry safely', async () => {
    seedAuthenticatedDoctor();
    setPushDeviceToken('push-token-1');
    mockDeviceRegisterFailure();

    renderWithProviders(<DeviceRegistrationBridge />);

    await waitFor(() => {
      expect(getRegisterDeviceRequests()).toHaveLength(1);
    });

    expect(readPushDeviceSyncRecord()).toBeNull();

    clearPushDeviceSyncRecord();
    setPushDeviceToken('push-token-1');

    await waitFor(() => {
      expect(getRegisterDeviceRequests()).toHaveLength(2);
    });
  });

  it('unregisters the device on current-session logout and clears the local sync state', async () => {
    seedAuthenticatedDoctor();
    setPushDeviceToken('push-token-1');

    renderWithProviders(<DeviceRegistrationBridge />);

    await waitFor(() => {
      expect(getRegisterDeviceRequests()).toHaveLength(1);
    });

    await useAuthStore.getState().logout({ scope: 'current' });

    expect(getUnregisterDeviceRequests()).toHaveLength(1);
    expect(getUnregisterDeviceRequests()[0].token).toBe('push-token-1');
    expect(readPushDeviceSyncRecord()).toBeNull();
    expect(readStoredAuthSession().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('skips device unregister on logout-all because the backend removes devices server-side and still clears local sync state', async () => {
    seedAuthenticatedDoctor();
    setPushDeviceToken('push-token-1');

    renderWithProviders(<DeviceRegistrationBridge />);

    await waitFor(() => {
      expect(getRegisterDeviceRequests()).toHaveLength(1);
    });

    await useAuthStore.getState().logout({ scope: 'all' });

    expect(getUnregisterDeviceRequests()).toHaveLength(0);
    expect(readPushDeviceSyncRecord()).toBeNull();
    expect(readStoredAuthSession().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
