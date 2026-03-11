'use client';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/doctor/sidebar';
import DashboardHeader from '@/components/doctor/dashboard-header';
import { sidebarItems, type SidebarItemId } from '@/constant/sidebar-items';
import { useAuthStore } from '@/store/authStore';
import { AnimatePresence } from 'framer-motion';
import { MotionProvider, PageTransition } from '@/motion';

export default function ProtectedLayout({
  children,
}: {
  children?: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const pathname = location.pathname;

  const active: SidebarItemId =
    sidebarItems.find(
      (item) =>
        pathname === `/doctor/${item.path}` ||
        pathname.startsWith(`/doctor/${item.path}/`),
    )?.path ?? 'dashboard';

  return (
    <div className='h-screen bg-white scrollbar-hide overflow-hidden'>
      <div className='relative mx-auto flex h-screen w-full max-w-screen-2xl'>
        <main className='flex h-screen flex-1 flex-col'>
          <div className='sticky top-0 z-40'>
            <DashboardHeader />
          </div>
          <div className='flex-1 overflow-y-auto py-8 bg-white scrollbar-hide'>
            <MotionProvider>
              <AnimatePresence mode='wait'>
                <PageTransition key={pathname}>
                  {children ?? <Outlet />}
                </PageTransition>
              </AnimatePresence>
            </MotionProvider>
          </div>
        </main>
        <Sidebar
          active={active}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
          onLogout={() => {
            useAuthStore.getState().logout();
            navigate('/');
          }}
        />
      </div>
    </div>
  );
}
