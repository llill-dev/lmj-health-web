import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export type AppRole =
  | 'patient'
  | 'secretary'
  | 'data-entry'
  | 'doctor'
  | 'admin';

/**
 * Maps each role to its home dashboard path.
 * Centralising this here means a single place to update
 * when new role areas are added.
 */
export function getRoleRoot(role: AppRole): string {
  switch (role) {
    case 'doctor':
      return '/doctor/dashboard';
    case 'admin':
      return '/admin/overview';
    case 'patient':
      return '/patient';
    case 'secretary':
      return '/secretary';
    case 'data-entry':
      return '/data-entry';
    default:
      return '/welcome';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ProtectedRoute
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps routes that require authentication + a specific role.
 *
 * Behaviour:
 *  • No token / no role  → /login?next=<current-path>   (preserve intended destination)
 *  • Wrong role          → role's own home path         (no infinite loops)
 *  • Authorised          → renders <Outlet />
 */
export default function ProtectedRoute({
  allowedRoles,
}: {
  allowedRoles: AppRole[];
}) {
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const user  = useAuthStore((s) => s.user);
  const role  = user?.role as AppRole | undefined;

  if (!token || !role) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getRoleRoot(role)} replace />;
  }

  return <Outlet />;
}

// ─────────────────────────────────────────────────────────────────────────────
// GuestRoute
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps guest-only pages (/login, /signup, /welcome, …).
 *
 * If the user is already authenticated they are immediately redirected
 * to their role's home dashboard so they never see the auth pages again.
 *
 * Accepts either children (for inline use) or renders <Outlet /> for
 * use as a layout route inside <Routes>.
 */
export function GuestRoute({ children }: { children?: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const user  = useAuthStore((s) => s.user);

  if (token && user?.role) {
    return <Navigate to={getRoleRoot(user.role as AppRole)} replace />;
  }

  return children != null ? <>{children}</> : <Outlet />;
}

// ─────────────────────────────────────────────────────────────────────────────
// RootRedirect
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handles the bare "/" path intelligently.
 *
 * • Authenticated user → their role's home dashboard (no login flash)
 * • Anonymous visitor  → /welcome
 */
export function RootRedirect() {
  const token = useAuthStore((s) => s.token);
  const user  = useAuthStore((s) => s.user);

  if (token && user?.role) {
    return <Navigate to={getRoleRoot(user.role as AppRole)} replace />;
  }

  return <Navigate to='/welcome' replace />;
}
