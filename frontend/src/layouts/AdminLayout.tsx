import type { ReactNode } from 'react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/layout/sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
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

  const pathname = location.pathname;

  const active: AdminSidebarItemId =
    adminSidebarItems.find(
      (item) =>
        pathname === `/admin/${item.path}` ||
        pathname.startsWith(`/admin/${item.path}/`),
    )?.path ?? 'overview';

  return (
    <div className='h-screen bg-white scrollbar-hide overflow-hidden'>
      <div className='relative mx-auto flex h-screen w-full max-w-screen-2xl'>
        <main className='flex h-screen flex-1 flex-col'>
          <div className='sticky top-0 z-40'>
            <AdminHeader
              title='لوحة التحكم'
              subtitle='مرحباً، المدير (وضع العرض)'
            />
          </div>
          <div className='flex-1 overflow-y-auto py-8 bg-white scrollbar-hide'>
            <MotionProvider>
              <AnimatePresence mode='wait'>
                <PageTransition key={pathname}>
                  <div className='mx-auto w-full max-w-[1420px] px-12 pb-6'>
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
          onLogout={() => {
            useAuthStore.getState().logout();
            navigate('/login');
          }}
        />
      </div>
    </div>
  );
}
