import type { ReactNode } from 'react';
import { Suspense, useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/layout/sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminInboxToastBridge from '@/components/admin/AdminInboxToastBridge';
import LogoutConfirmDialog, {
  type LogoutScope,
} from '@/components/auth/logout-confirm-dialog';
import { AdminAppSettingsProvider } from '@/contexts/AdminAppSettingsContext';
import {
  adminSidebarItems,
  type AdminSidebarItemId,
} from '@/constant/sidebar-items';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import { AnimatePresence } from 'framer-motion';
import { MotionProvider, PageTransition } from '@/motion';
import { AdminRouteFallback } from '@/routes/RouteFallbacks';

export default function AdminLayout({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

  const active: AdminSidebarItemId =
    adminSidebarItems.find(
      (item) =>
        pathname === `/admin/${item.path}` ||
        pathname.startsWith(`/admin/${item.path}/`),
    )?.path ?? 'overview';

  return (
    <AdminAppSettingsProvider>
    <AdminInboxToastBridge />
    <div className='h-dvh overflow-hidden bg-[#F5F7FA] scrollbar-hide'>
      <div className='relative mx-auto flex h-dvh w-full max-w-screen-2xl'>
        <main className='flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[#F5F7FA]'>
          <div className='sticky top-0 z-40 shrink-0 bg-white'>
            <AdminHeader
              onMenuClick={() => setIsMobileSidebarOpen(true)}
              onLogoutClick={() => setLogoutConfirmOpen(true)}
              loggingOut={loggingOut}
            />
          </div>
          <div className='min-h-0 flex-1 overflow-y-auto bg-[#F5F7FA] py-5 scrollbar-hide sm:py-6 lg:py-8'>
            <MotionProvider>
              <AnimatePresence mode='wait'>
                <PageTransition key={pathname}>
                  <div className='mx-auto min-h-full w-full max-w-[1420px] px-4 pb-5 sm:px-6 sm:pb-6 lg:px-12'>
                    <Suspense fallback={<AdminRouteFallback />}>
                      {children ?? <Outlet />}
                    </Suspense>
                  </div>
                </PageTransition>
              </AnimatePresence>
            </MotionProvider>
          </div>
        </main>

        <AdminSidebar
          role='admin'
          active={active}
          collapsed={isSidebarCollapsed}
          mobileOpen={isMobileSidebarOpen}
          onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onLogout={() => setLogoutConfirmOpen(true)}
        />
      </div>

      <LogoutConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        confirmDisabled={loggingOut}
        onConfirm={performLogout}
      />
    </div>
    </AdminAppSettingsProvider>
  );
}
