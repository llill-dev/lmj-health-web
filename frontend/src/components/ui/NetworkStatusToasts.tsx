'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/ToastProvider';

/**
 * يُظهِر توستات عند فقدان/استعادة الاتصال (window online/offline).
 * يوضع داخل ToastProvider.
 */
export function NetworkStatusToasts() {
  const { toast } = useToast();
  const isOffline = useRef(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );

  useEffect(() => {
    if (isOffline.current) {
      toast('تعذّر الوصول إلى الإنترنت. تحقق من الشبكة ثم أعد محاولة العملية.', {
        title: 'لا يوجد اتصال',
        variant: 'warning',
        durationMs: 5200,
      });
    }

    const onOffline = () => {
      if (!isOffline.current) {
        isOffline.current = true;
        toast('تعذّر الوصول إلى الإنترنت. تحقق من الشبكة ثم أعد محاولة العملية.', {
          title: 'لا يوجد اتصال',
          variant: 'warning',
          durationMs: 5200,
        });
      }
    };
    const onOnline = () => {
      if (isOffline.current) {
        isOffline.current = false;
        toast('عاد الاتصال. يمكنك متابعة العمل بشكل طبيعي.', {
          title: 'تم استعادة الاتصال',
          variant: 'success',
          durationMs: 3400,
        });
      }
    };

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [toast]);

  return null;
}
