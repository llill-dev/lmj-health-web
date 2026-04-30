import { QueryClient } from '@tanstack/react-query';

/** عميل React Query واحد للتطبيق — يُستورد من مسارات الجلسة لتفريغ الكاش عند انتهاء الصلاحية */
export const queryClient = new QueryClient();
