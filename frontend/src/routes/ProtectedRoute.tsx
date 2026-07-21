import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  isAccountDeletionPending,
  resolveRestorePath,
} from '@/lib/auth/accountDeletionSession';
import { readAuthUser } from '@/lib/cookies';
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
      return '/data-entry/dashboard';
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
  const accessToken = useAuthStore((s) => s.accessToken);
  const user  = useAuthStore((s) => s.user);
  const role  = user?.role as AppRole | undefined;

  if (!accessToken || !role) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getRoleRoot(role)} replace />;
  }

  const authUser = readAuthUser();
  const restorePath = resolveRestorePath(role);
  const isDeletionRoute =
    location.pathname.startsWith('/doctor/delete-account') ||
    location.pathname.startsWith('/doctor/restore-account') ||
    location.pathname.startsWith('/patient/delete-account') ||
    location.pathname.startsWith('/patient/restore-account');

  if (
    !isDeletionRoute &&
    isAccountDeletionPending({
      accountDeletionStatus: authUser?.accountDeletionStatus,
      recoverUntil: authUser?.deletionRecoverUntil ?? null,
    })
  ) {
    return <Navigate to={restorePath} replace />;
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
  const accessToken = useAuthStore((s) => s.accessToken);
  const user  = useAuthStore((s) => s.user);
  const authUser = readAuthUser();

  if (accessToken && user?.role) {
    if (
      isAccountDeletionPending({
        accountDeletionStatus: authUser?.accountDeletionStatus,
        recoverUntil: authUser?.deletionRecoverUntil ?? null,
      })
    ) {
      return <Navigate to={resolveRestorePath(user.role)} replace />;
    }
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
/** Legacy/bookmarked URLs without the /doctor or /admin prefix. */
export function LegacySecretariesRedirect() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role) as AppRole | undefined;

  if (accessToken && role === 'admin') {
    return <Navigate to='/admin/secretaries' replace />;
  }

  if (accessToken && role === 'doctor') {
    return <Navigate to='/doctor/secretaries' replace />;
  }

  return <Navigate to='/login?next=%2Fdoctor%2Fsecretaries' replace />;
}

export function RootRedirect() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user  = useAuthStore((s) => s.user);
  const authUser = readAuthUser();

  if (accessToken && user?.role) {
    if (
      isAccountDeletionPending({
        accountDeletionStatus: authUser?.accountDeletionStatus,
        recoverUntil: authUser?.deletionRecoverUntil ?? null,
      })
    ) {
      return <Navigate to={resolveRestorePath(user.role)} replace />;
    }
    return <Navigate to={getRoleRoot(user.role as AppRole)} replace />;
  }

  return <Navigate to='/welcome' replace />;
}
