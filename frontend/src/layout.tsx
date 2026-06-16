'use client';

import type { ReactNode } from 'react';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Sidebar from '@/components/layout/sidebar';
import DashboardHeader from '@/components/doctor/dashboard-header';
import {
  PlatformFooter,
  PlatformSupportProvider,
} from '@/components/platform';
import LogoutConfirmDialog, {
  type LogoutScope,
} from '@/components/auth/logout-confirm-dialog';
import { useToast } from '@/components/ui/ToastProvider';
import { sidebarItems, type SidebarItemId } from '@/constant/sidebar-items';
import { readAuthUser } from '@/lib/cookies';
import { useDoctorProfile } from '@/hooks';
import { MotionProvider, PageTransition } from '@/motion';
import { DoctorRouteFallback } from '@/routes/RouteFallbacks';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedLayout({
  children,
}: {
  children?: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const authUser = readAuthUser();
  const profileQuery = useDoctorProfile();
  const profileUser = profileQuery.data?.doctor?.user;

  const doctorName = useMemo(() => {
    const fullName =
      profileUser?.fullName?.trim() || authUser?.fullName?.trim();
    if (!fullName) return 'الطبيب';
    return /^د\.?\s/u.test(fullName) ? fullName : `د. ${fullName}`;
  }, [authUser?.fullName, profileUser?.fullName]);
  const doctorEmail =
    profileUser?.email?.trim() || authUser?.email?.trim() || '';
  const doctorPhotoUrl =
    profileUser?.photoUrl ?? authUser?.photoUrl ?? null;

  const performLogout = useCallback(
    async (scope: LogoutScope) => {
      setLoggingOut(true);
      try {
        await useAuthStore.getState().logout({ scope });
        toast('نراك في زيارة قادمة.', {
          title: 'تم تسجيل الخروج',
          variant: 'success',
        });
        navigate('/login', { replace: true });
      } catch {
        toast('تعذّر إتمام تسجيل الخروج الآن. حاول مرة أخرى.', {
          title: 'فشل تسجيل الخروج',
          variant: 'error',
        });
        throw new Error('logout_failed');
      } finally {
        setLoggingOut(false);
      }
    },
    [navigate, toast],
  );

  const pathname = location.pathname;

  const active: SidebarItemId =
    sidebarItems.find(
      (item) =>
        pathname === `/doctor/${item.path}` ||
        pathname.startsWith(`/doctor/${item.path}/`),
    )?.path ?? 'dashboard';

  return (
    <PlatformSupportProvider>
      <div className='h-screen overflow-hidden scrollbar-hide bg-[linear-gradient(165deg,#f4faf9_0%,#f8fafc_42%,#ffffff_100%)]'>
        <div className='relative mx-auto flex h-screen w-full max-w-screen-2xl'>
          <main className='flex h-screen flex-1 flex-col'>
            <div className='sticky top-0 z-40'>
              <DashboardHeader />
            </div>
            <div className='flex-1 overflow-y-auto bg-transparent py-8 scrollbar-hide'>
              <MotionProvider>
                <AnimatePresence mode='wait'>
                  <PageTransition key={pathname}>
                    <div className='mx-auto w-full max-w-[1420px] px-12'>
                      <Suspense fallback={<DoctorRouteFallback />}>
                        {children ?? <Outlet />}
                      </Suspense>
                      {!pathname.startsWith('/doctor/support') ? (
                        <PlatformFooter />
                      ) : null}
                    </div>
                  </PageTransition>
                </AnimatePresence>
              </MotionProvider>
            </div>
          </main>

          <Sidebar
            active={active}
            collapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)}
            onLogout={() => setLogoutConfirmOpen(true)}
            profileName={doctorName}
            profileEmail={doctorEmail}
            profilePhotoUrl={doctorPhotoUrl}
          />
        </div>

        <LogoutConfirmDialog
          open={logoutConfirmOpen}
          onOpenChange={setLogoutConfirmOpen}
          confirmDisabled={loggingOut}
          onConfirm={performLogout}
        />
      </div>
    </PlatformSupportProvider>
  );
}
