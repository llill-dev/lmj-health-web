import { adminSidebarItems, type AdminSidebarItemId } from '@/constant/sidebar-items';

/**
 * عناوين الهيدر حسب مسار الأدمن (منسقة مع عناصر الشريط الجانبي).
 */
export function getAdminPageMeta(pathname: string): {
  title: string;
  subtitle: string;
} {
  const fallback = {
    title: 'لوحة التحكم',
    subtitle: 'نظام إدارة LMJ Health',
  };
  if (!pathname.startsWith('/admin')) return fallback;

  const segs = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  if (segs.length === 0 || segs[0] === 'overview' || segs[0] === 'dashboard') {
    return {
      title: 'نظرة عامة',
      subtitle: 'مؤشرات وأنشطة النظام',
    };
  }

  const top = segs[0] as AdminSidebarItemId;
  const item = adminSidebarItems.find((i) => i.path === top);

  if (segs.length >= 2) {
    if (top === 'doctors') {
      return {
        title: 'تفاصيل الطبيب',
        subtitle: 'مراجعة الملف والموافقات والتحقق',
      };
    }
    if (top === 'patients') {
      return {
        title: 'تفاصيل المريض',
        subtitle: 'السجل والملفات والحساب',
      };
    }
    if (top === 'secretaries') {
      if (segs.includes('appointments')) {
        return {
          title: 'مواعيد السكرتير',
          subtitle: 'إدارة الجداول والحجوزات',
        };
      }
      return {
        title: 'تفاصيل السكرتير',
        subtitle: 'الصلاحيات والارتباط بالطبيب',
      };
    }
    if (top === 'verification-requests') {
      return {
        title: 'تفاصيل طلب التحقق',
        subtitle: 'مراجعة تسجيل الطبيب',
      };
    }
    if (top === 'complaints') {
      return {
        title: 'تفاصيل الشكوى',
        subtitle: 'متابعة الحالة والرد',
      };
    }
  }

  if (item) {
    return {
      title: item.label,
      subtitle: 'إدارة ومراجعة البيانات',
    };
  }

  return fallback;
}
