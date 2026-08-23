'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { useAdminUnreadNotificationCount } from '@/hooks/admin/notifications/useAdminNotifications';
import { useI18n } from '@/i18n/provider';

/**
 * عند زيادة عدد غير المقروء (استطلاع/تركيز النافذة) يُعلَم المستخدم بإشعار جديد.
 */
export default function AdminInboxToastBridge() {
  const { data: unread } = useAdminUnreadNotificationCount();
  const { toast } = useToast();
  const { t } = useI18n();
  const prev = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (unread == null) return;
    if (prev.current !== undefined && unread > prev.current) {
      const delta = unread - prev.current;
      toast(
        delta === 1
          ? t('adminNotifications.toast.newSingle')
          : t('adminNotifications.toast.newMultiple').replace('{count}', String(delta)),
        { title: t('adminNotifications.toast.newAlertTitle'), variant: 'info', durationMs: 4200 },
      );
    }
    prev.current = unread;
  }, [unread, toast, t]);

  return null;
}
