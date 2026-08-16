import { Building2 } from 'lucide-react';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';

export function AdminServicesHeader({
  actionLabel,
  onAction,
}: {
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <AdminDashboardOverview
      variant='admin'
      surface='mint'
      title='إدارة دليل الخدمات'
      subtitle='إدارة المنشآت الصحية والخدمات الفعلية، بينما تبقى أنواع الخدمات ومزوّدوها في الشاشات المرتبطة بها'
      headerIcon={<Building2 className='h-8 w-8 text-white' />}
      actionLabel={actionLabel}
      onActionClick={onAction}
    />
  );
}
