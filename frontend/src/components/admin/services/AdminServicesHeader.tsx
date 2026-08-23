import type { ReactNode } from 'react';
import { Building2 } from 'lucide-react';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import { useI18n } from '@/i18n/provider';

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
  const { t } = useI18n();
  return (
    <AdminDashboardOverview
      variant='admin'
      surface='mint'
      title={t('adminServices.header.title')}
      subtitle={subtitle ?? t('adminServices.header.subtitle')}
      headerIcon={<Building2 className='h-8 w-8 text-white' />}
      actionLabel={actionLabel}
      actionIcon={actionIcon}
      onActionClick={onAction}
    />
  );
}
