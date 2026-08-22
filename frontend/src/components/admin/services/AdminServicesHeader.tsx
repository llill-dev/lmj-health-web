import type { ReactNode } from 'react';
import { Building2 } from 'lucide-react';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';

export function AdminServicesHeader({
  actionLabel,
  actionIcon,
  onAction,
  subtitle,
}: {
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
  subtitle?: string;
}) {
  return (
    <AdminDashboardOverview
      variant='admin'
      surface='mint'
      title='دليل الخدمات'
      subtitle={
        subtitle ??
        'تصفح مزوّدي كل نوع خدمة وإدارتهم؛ إدارة تعريف أنواع الخدمات نفسها متاحة من شاشة أنواع الخدمات'
      }
      headerIcon={<Building2 className='h-8 w-8 text-white' />}
      actionLabel={actionLabel}
      actionIcon={actionIcon}
      onActionClick={onAction}
    />
  );
}
