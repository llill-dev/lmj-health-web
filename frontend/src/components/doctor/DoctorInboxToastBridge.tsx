'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { useDoctorUnreadNotificationCount } from '@/hooks/doctor/notifications/useDoctorNotifications';
import { useI18n } from '@/i18n/provider';

/**
 * عند زيادة عدد غير المقروء (استطلاع/تركيز النافذة) يُعلَم المستخدم بإشعار جديد.
 */
export default function DoctorInboxToastBridge() {
  const { data: unread } = useDoctorUnreadNotificationCount();
  const { toast } = useToast();
  const { t } = useI18n();
  const prev = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (unread == null) return;
    if (prev.current !== undefined && unread > prev.current) {
      const delta = unread - prev.current;
      toast(
        delta === 1
          ? t('doctor.inboxToast.single')
          : t('doctor.inboxToast.multiple').replace('{count}', String(delta)),
        { title: t('doctor.inboxToast.title'), variant: 'info', durationMs: 4200 },
      );
    }
    prev.current = unread;
  }, [unread, toast, t]);

  return null;
}
