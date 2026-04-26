import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import { LogOut } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/layout/sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { ConfirmActionDialog } from '@/components/admin/dialogs';
import { AdminAppSettingsProvider } from '@/contexts/AdminAppSettingsContext';
import {
  adminSidebarItems,
  type AdminSidebarItemId,
} from '@/constant/sidebar-items';
import { useAuthStore } from '@/store/authStore';
import { AnimatePresence } from 'framer-motion';
import { MotionProvider, PageTransition } from '@/motion';

export default function AdminLayout({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const performLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await useAuthStore.getState().logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }, [navigate]);

  const pathname = location.pathname;

  const active: AdminSidebarItemId =
    adminSidebarItems.find(
      (item) =>
        pathname === `/admin/${item.path}` ||
        pathname.startsWith(`/admin/${item.path}/`),
    )?.path ?? 'overview';

  return (
    <AdminAppSettingsProvider>
    <div className='h-screen overflow-hidden bg-[#F5F7FA] scrollbar-hide'>
      <div className='relative flex mx-auto h-screen w-full max-w-screen-2xl'>
        <main className='flex h-screen min-h-0 min-w-0 flex-1 flex-col bg-[#F5F7FA]'>
          <div className='sticky top-0 z-40 shrink-0 bg-white'>
            <AdminHeader
              onLogoutClick={() => setLogoutConfirmOpen(true)}
              loggingOut={loggingOut}
            />
          </div>
          <div className='min-h-0 flex-1 overflow-y-auto bg-[#F5F7FA] py-8 scrollbar-hide'>
            <MotionProvider>
              <AnimatePresence mode='wait'>
                <PageTransition key={pathname}>
                  <div className='mx-auto min-h-full w-full max-w-[1420px] px-6 pb-6 sm:px-10 lg:px-12'>
                    {children ?? <Outlet />}
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
          onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
          onLogout={() => setLogoutConfirmOpen(true)}
        />
      </div>

      <ConfirmActionDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        variant='primary'
        title='تأكيد تسجيل الخروج'
        icon={<LogOut className='h-6 w-6' strokeWidth={2} aria-hidden />}
        description={
          <>
            سيتم إنهاء جلستك الحالية وإزالة بيانات الدخول من هذا المتصفح. إذا
            ضغطت بالخطأ اختر «إلغاء» للبقاء داخل النظام.
          </>
        }
        cancelLabel='إلغاء'
        confirmLabel={loggingOut ? 'جاري تسجيل الخروج…' : 'تسجيل الخروج'}
        confirmDisabled={loggingOut}
        onConfirm={performLogout}
      />
    </div>
    </AdminAppSettingsProvider>
  );
}
