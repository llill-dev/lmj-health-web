import { useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import LogoutConfirmDialog, {
  type LogoutScope,
} from '@/components/auth/logout-confirm-dialog';
import { persistAuthSession, readStoredAuthSession } from '@/lib/auth/session';
import { mockLogoutFailure } from '@/test/handlers/auth';
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

function LogoutHarness() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (scope: LogoutScope) => {
    setLoading(true);
    try {
      await useAuthStore.getState().logout({ scope });
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Routes>
      <Route
        path="/doctor/dashboard"
        element={
          <LogoutConfirmDialog
            open={open}
            onOpenChange={setOpen}
            confirmDisabled={loading}
            onConfirm={handleConfirm}
          />
        }
      />
      <Route path="/login" element={<div>صفحة تسجيل الدخول</div>} />
    </Routes>
  );
}

describe('Logout integration', () => {
  it('logs out the current session, clears persisted auth data, and redirects to login', async () => {
    seedAuthenticatedDoctor();

    renderWithProviders(<LogoutHarness />, { route: '/doctor/dashboard' });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'تسجيل الخروج' }));

    expect(await screen.findByText('صفحة تسجيل الدخول')).toBeInTheDocument();
    expect(readStoredAuthSession().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('keeps the dialog open and preserves the session when logout fails', async () => {
    seedAuthenticatedDoctor();
    mockLogoutFailure('current');

    renderWithProviders(<LogoutHarness />, { route: '/doctor/dashboard' });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'تسجيل الخروج' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'تأكيد تسجيل الخروج' }),
      ).toBeInTheDocument();
    });

    expect(readStoredAuthSession().accessToken).toBe('access-token-1');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('submits the all-devices logout scope when selected', async () => {
    seedAuthenticatedDoctor();

    const logoutSpy = vi.spyOn(useAuthStore.getState(), 'logout');

    renderWithProviders(<LogoutHarness />, { route: '/doctor/dashboard' });

    const user = userEvent.setup();
    await user.click(screen.getByLabelText('جميع الأجهزة'));
    await user.click(screen.getByRole('button', { name: 'تسجيل الخروج' }));

    await waitFor(() => {
      expect(logoutSpy).toHaveBeenCalledWith({ scope: 'all' });
    });
  });
});
