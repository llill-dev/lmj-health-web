import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export type AppRole =
  | 'patient'
  | 'secretary'
  | 'data-entry'
  | 'doctor'
  | 'admin';

function getRoleRoot(role: AppRole) {
  return `/${role}`;
}

export default function ProtectedRoute({
  allowedRoles,
}: {
  allowedRoles: AppRole[];
}) {
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const role = (user?.role as AppRole | undefined) ?? undefined;

  if (!token || !role) {
    const next = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(next)}`}
        replace
      />
    );
  }

  if (!allowedRoles.includes(role)) {
    return (
      <Navigate
        to={getRoleRoot(role)}
        replace
      />
    );
  }

  return <Outlet />;
}
