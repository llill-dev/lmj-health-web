'use client';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/sidebar';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { sidebarItems, type SidebarItemId } from '@/constant/sidebar-items';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const active: SidebarItemId =
    sidebarItems.find(
      (item) =>
        pathname === `/${item.path}` || pathname.startsWith(`/${item.path}/`),
    )?.path ?? 'dashboard';

  return (
    <div className='min-h-screen bg-white'>
      <div className='mx-auto flex w-full max-w-screen-2xl'>
        <main className='min-h-screen flex-1'>
          <DashboardHeader />
          <div className='bg-white px-6 py-[31.99px] pr-[31.99px] pl-[59.26px]'>
            {children}
          </div>
        </main>
        <Sidebar
          active={active}
          onBack={() => router.back()}
          onLogout={() => {
            router.push('/');
          }}
        />
      </div>
    </div>
  );
}
