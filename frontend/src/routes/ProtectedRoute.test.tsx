import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ProtectedRoute, {
  GuestRoute,
  RootRedirect,
} from '@/routes/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/lib/cookies', () => ({
  readAuthUser: vi.fn(() => null),
}));

type MockRole = 'patient' | 'secretary' | 'data-entry' | 'doctor' | 'admin';

type MockStoreState = {
  accessToken: string | null;
  user: { role: MockRole } | null;
};

const mockStoreState: MockStoreState = {
  accessToken: null,
  user: null,
};

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn((selector?: (state: MockStoreState) => unknown) =>
    selector ? selector(mockStoreState) : mockStoreState,
  ),
}));

function renderProtectedRoute(
  ui: React.ReactNode,
  {
    route = '/doctor/dashboard',
  }: {
    route?: string;
  } = {},
) {
  return renderWithProviders(
    <MemoryRouter initialEntries={[route]}>
      <Routes>{ui}</Routes>
    </MemoryRouter>,
    { withRouter: false },
  );
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login and preserves the next path', () => {
    mockStoreState.accessToken = null;
    mockStoreState.user = null;

    renderProtectedRoute(
      <>
        <Route
          path="/doctor/dashboard"
          element={<ProtectedRoute allowedRoles={['doctor']} />}
        >
          <Route index element={<div>لوحة الطبيب</div>} />
        </Route>
        <Route path="/login" element={<div>صفحة تسجيل الدخول</div>} />
      </>,
    );

    expect(screen.getByText('صفحة تسجيل الدخول')).toBeInTheDocument();
  });

  it('redirects authenticated users with the wrong role to their own root', () => {
    mockStoreState.accessToken = 'token';
    mockStoreState.user = { role: 'admin' };

    renderProtectedRoute(
      <>
        <Route
          path="/doctor/dashboard"
          element={<ProtectedRoute allowedRoles={['doctor']} />}
        >
          <Route index element={<div>لوحة الطبيب</div>} />
        </Route>
        <Route path="/admin/overview" element={<div>لوحة المشرف</div>} />
      </>,
    );

    expect(screen.getByText('لوحة المشرف')).toBeInTheDocument();
  });

  it('renders the protected content for an allowed role', () => {
    mockStoreState.accessToken = 'token';
    mockStoreState.user = { role: 'doctor' };

    renderProtectedRoute(
      <Route
        path="/doctor/dashboard"
        element={<ProtectedRoute allowedRoles={['doctor']} />}
      >
        <Route index element={<div>لوحة الطبيب</div>} />
      </Route>,
    );

    expect(screen.getByText('لوحة الطبيب')).toBeInTheDocument();
  });
});

describe('GuestRoute', () => {
  it('redirects authenticated users away from guest pages', () => {
    mockStoreState.accessToken = 'token';
    mockStoreState.user = { role: 'doctor' };

    renderProtectedRoute(
      <>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<div>صفحة تسجيل الدخول</div>} />
        </Route>
        <Route path="/doctor/dashboard" element={<div>لوحة الطبيب</div>} />
      </>,
      { route: '/login' },
    );

    expect(screen.getByText('لوحة الطبيب')).toBeInTheDocument();
  });
});

describe('RootRedirect', () => {
  it('sends anonymous users to welcome', () => {
    mockStoreState.accessToken = null;
    mockStoreState.user = null;

    renderProtectedRoute(
      <>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/welcome" element={<div>أهلاً بك</div>} />
      </>,
      { route: '/' },
    );

    expect(screen.getByText('أهلاً بك')).toBeInTheDocument();
  });
});
