import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LoginPage from '@/pages/auth/login/LoginPage';
import ProtectedRoute, { GuestRoute } from '@/routes/ProtectedRoute';
import { readStoredAuthSession } from '@/lib/auth/session';
import { fillLoginForm } from '@/test/helpers/auth';
import { mockLoginFailure, mockLoginPending, mockLoginSuccess } from '@/test/handlers/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { useAuthStore } from '@/store/authStore';

function renderAuthApp(route = '/login') {
  return renderWithProviders(
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route
        path="/doctor/dashboard"
        element={<div>لوحة الطبيب</div>}
      />
      <Route
        path="/data-entry/dashboard"
        element={<div>لوحة مدخل البيانات</div>}
      />
      <Route
        path="/doctor/patients"
        element={<div>صفحة المرضى</div>}
      />
      <Route path="/welcome" element={<div>أهلاً بك</div>} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={<ProtectedRoute allowedRoles={['doctor']} />}
      >
        <Route path="/doctor/secure" element={<div>منطقة محمية</div>} />
      </Route>
    </Routes>,
    { route },
  );
}

describe('Authentication integration', () => {
  it('validates invalid login input on the client before sending a request', async () => {
    const user = userEvent.setup();

    renderAuthApp();

    await user.type(screen.getByPlaceholderText('example@email.com'), 'bad-email');
    await user.type(screen.getByPlaceholderText('password123'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));

    expect(
      await screen.findByText('يرجى إدخال بريد إلكتروني صالح'),
    ).toBeInTheDocument();
  });

  it('shows a loading state while authentication is pending', async () => {
    mockLoginPending(150, { role: 'doctor' });

    renderAuthApp();

    const { user } = await fillLoginForm({
      identifier: 'doctor@example.com',
      password: 'secret1',
    });
    await user.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));

    expect(
      screen.getByRole('button', { name: 'جارٍ تسجيل الدخول...' }),
    ).toBeDisabled();

    expect(await screen.findByText('لوحة الطبيب')).toBeInTheDocument();
  });

  it('authenticates successfully, persists the session, and redirects to the role root', async () => {
    mockLoginSuccess({ role: 'doctor' });

    renderAuthApp();

    const { user } = await fillLoginForm({
      identifier: 'doctor@example.com',
      password: 'secret1',
    });
    await user.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));

    expect(await screen.findByText('لوحة الطبيب')).toBeInTheDocument();

    const session = readStoredAuthSession();
    expect(session.accessToken).toBe('access-token-1');
    expect(session.refreshToken).toBe('refresh-token-1');
    expect(session.user?.role).toBe('doctor');
  });

  it('redirects data-entry users to the canonical data-entry dashboard after login', async () => {
    mockLoginSuccess({ role: 'data_entry' });

    renderAuthApp();

    const { user } = await fillLoginForm({
      identifier: 'operator@example.com',
      password: 'secret1',
    });
    await user.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));

    expect(await screen.findByText('لوحة مدخل البيانات')).toBeInTheDocument();
    expect(readStoredAuthSession().user?.role).toBe('data_entry');
  });

  it('shows an authentication error and keeps the user on the login page when credentials are invalid', async () => {
    mockLoginFailure(401, {
      message: 'Invalid credentials',
      messageKey: 'errors.auth.invalidCredentials',
    });

    renderAuthApp();

    const { user } = await fillLoginForm({
      identifier: 'doctor@example.com',
      password: 'wrongpass',
    });
    await user.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    );
    expect(screen.getByRole('heading', { name: 'تسجيل الدخول' })).toBeInTheDocument();
  });

  it('redirects to the requested next path after successful login', async () => {
    mockLoginSuccess({ role: 'doctor' });

    renderAuthApp('/login?next=%2Fdoctor%2Fpatients');

    const { user } = await fillLoginForm({
      identifier: 'doctor@example.com',
      password: 'secret1',
    });
    await user.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));

    expect(await screen.findByText('صفحة المرضى')).toBeInTheDocument();
  });

  it('redirects authenticated users away from guest-only login routes', async () => {
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

    renderAuthApp('/login');

    expect(await screen.findByText('لوحة الطبيب')).toBeInTheDocument();
  });

  it('redirects unauthenticated users from protected routes to login', async () => {
    renderAuthApp('/doctor/secure');

    expect(
      await screen.findByRole('heading', { name: 'تسجيل الدخول' }),
    ).toBeInTheDocument();
  });
});
