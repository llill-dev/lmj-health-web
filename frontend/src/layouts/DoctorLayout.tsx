import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layout/sidebar';
import DashboardHeader from '@/components/doctor/dashboard-header';
import { sidebarItems, type SidebarItemId } from '@/constant/sidebar-items';
import { useAuthStore } from '@/store/authStore';

export default function DoctorLayout() {
  const location = useLocation();
  const navigate = useNavigate();

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
        <Sidebar
          active={active}
          onLogout={() => {
            useAuthStore.getState().logout();
            navigate('/');
          }}
        />

        <main className='flex h-screen flex-1 flex-col pr-[290px]'>
          <div className='sticky top-0 z-40'>
            <DashboardHeader />
          </div>

          <div className='flex-1 overflow-y-auto py-8 bg-white scrollbar-hide'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
