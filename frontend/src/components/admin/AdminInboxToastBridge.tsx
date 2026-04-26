'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { useAdminUnreadNotificationCount } from '@/hooks/useAdminNotifications';

/**
 * عند زيادة عدد غير المقروء (استطلاع/تركيز النافذة) يُعلَم المستخدم بإشعار جديد.
 */
export default function AdminInboxToastBridge() {
  const { data: unread } = useAdminUnreadNotificationCount();
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
