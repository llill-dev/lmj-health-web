import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { resetAuthHandlers } from '@/test/handlers/auth';
import { resetDeviceHandlers } from '@/test/handlers/devices';
import { resetServiceTypeHandlers } from '@/test/handlers/serviceTypes';
import { server } from '@/test/server';
import { useAuthStore } from '@/store/authStore';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  resetAuthHandlers();
  resetDeviceHandlers();
  resetServiceTypeHandlers();
  server.resetHandlers();
  document.cookie = '';
  localStorage.clear();
  sessionStorage.clear();
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    refreshExpiresAt: null,
    isAuthenticated: false,
    pendingVerification: null,
  });
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

afterAll(() => {
  server.close();
});
window.scrollTo = vi.fn();
