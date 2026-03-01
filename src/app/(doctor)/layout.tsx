'use client';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/doctor/sidebar';
import DashboardHeader from '@/components/doctor/dashboard-header';
import { sidebarItems, type SidebarItemId } from '@/constant/sidebar-items';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const active: SidebarItemId =
    sidebarItems.find(
      (item) =>
        pathname === `/${item.path}` || pathname.startsWith(`/${item.path}/`),
    )?.path ?? 'doctor';

  return (
    <div className='h-screen bg-white scrollbar-hide overflow-hidden'>
      <div className='relative mx-auto flex h-screen w-full max-w-screen-2xl'>
        <Sidebar
          active={active}
          onBack={() => router.back()}
          onLogout={() => {
            router.push('/');
          }}
        />

        <main className='flex h-screen flex-1 flex-col pr-[320px]'>
          <div className='sticky top-0 z-40'>
            <DashboardHeader />
          </div>

          <div className='flex-1 overflow-y-auto bg-white px-6 py-[31.99px] pr-[31.99px] pl-[59.26px]'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
