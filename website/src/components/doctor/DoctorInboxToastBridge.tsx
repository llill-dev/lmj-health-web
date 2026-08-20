'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { useDoctorUnreadNotificationCount } from '@/hooks/doctor/notifications/useDoctorNotifications';

/**
 * عند زيادة عدد غير المقروء (استطلاع/تركيز النافذة) يُعلَم المستخدم بإشعار جديد.
 */
export default function DoctorInboxToastBridge() {
  const { data: unread } = useDoctorUnreadNotificationCount();
  const { toast } = useToast();
  const prev = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (unread == null) return;
    if (prev.current !== undefined && unread > prev.current) {
      const delta = unread - prev.current;
      toast(
        delta === 1
          ? 'وصلك إشعار جديد. افتح صفحة «الإشعارات» لمراجعته.'
          : `وصلتك ${delta} إشعارات جديدة غير مقروءة.`,
        { title: 'تنبيه — إشعار جديد', variant: 'info', durationMs: 4200 },
      );
    }
    prev.current = unread;
  }, [unread, toast]);

  return null;
}
