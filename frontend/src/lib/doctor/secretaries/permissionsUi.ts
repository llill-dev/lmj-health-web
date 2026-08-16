/** Permissions allowed by API-3 SECRETARY_PERMISSIONS (PUT /secretaries/:id). */
export const ASSIGNABLE_SECRETARY_PERMISSIONS = [
  'appointments:book',
  'appointments:view',
  'appointments:edit',
  'appointments:cancel',
  'waitlist:create',
  'waitlist:view',
  'waitlist:manage',
  'waitlist:book',
  'patients:view',
  'patients:edit',
  'patients:temporary:create',
  'patients:files:view',
  'patients:files:upload',
  'schedule:view',
  'billing:dashboard:view',
  'billing:invoices:view',
  'billing:invoices:manage',
  'billing:payments:view',
  'billing:payments:manage',
  'billing:refunds:view',
  'billing:refunds:manage',
  'billing:expenses:view',
  'billing:expenses:manage',
  'billing:reports:view',
  'billing:reports:export',
  'billing:settings:view',
  'billing:settings:manage',
  'billing:services:view',
  'billing:services:manage',
] as const;

export type AssignableSecretaryPermission =
  (typeof ASSIGNABLE_SECRETARY_PERMISSIONS)[number];

export const SECRETARY_PERMISSION_LABELS: Record<string, string> = {
  'appointments:book': 'حجز المواعيد',
  'appointments:view': 'عرض المواعيد',
  'appointments:edit': 'تعديل المواعيد',
  'appointments:cancel': 'إلغاء المواعيد',
  'waitlist:create': 'إنشاء قائمة الانتظار',
  'waitlist:view': 'عرض قائمة الانتظار',
  'waitlist:manage': 'إدارة قائمة الانتظار',
  'waitlist:book': 'حجز من قائمة الانتظار',
  'patients:view': 'عرض المرضى',
  'patients:edit': 'تعديل المرضى',
  'patients:temporary:create': 'إنشاء مريض مؤقت',
  'patients:files:view': 'عرض السجلات الطبية',
  'patients:files:upload': 'تعديل السجلات الطبية',
  'schedule:view': 'عرض الجدول',
  'billing:dashboard:view': 'عرض لوحة الحسابات',
  'billing:invoices:view': 'عرض الفواتير',
  'billing:invoices:manage': 'إدارة الفواتير',
  'billing:payments:view': 'عرض الدفعات',
  'billing:payments:manage': 'إدارة الدفعات',
  'billing:refunds:view': 'عرض الاسترجاعات',
  'billing:refunds:manage': 'إدارة الاسترجاعات',
  'billing:expenses:view': 'عرض المصاريف',
  'billing:expenses:manage': 'إدارة المصاريف',
  'billing:reports:view': 'عرض التقارير المالية',
  'billing:reports:export': 'تصدير التقارير المالية',
  'billing:settings:view': 'عرض الإعدادات المالية',
  'billing:settings:manage': 'إدارة الإعدادات المالية',
  'billing:services:view': 'عرض خدمات الفوترة',
  'billing:services:manage': 'إدارة خدمات الفوترة',
};

/** Primary rows shown on secretary cards (API-supported permissions only). */
export const SECRETARY_CARD_PERMISSION_ROWS: Array<{
  id: string;
  label: string;
  apiKey: AssignableSecretaryPermission;
}> = [
  { id: 'patients-view', label: 'عرض المرضى', apiKey: 'patients:view' },
  { id: 'patients-edit', label: 'تعديل المرضى', apiKey: 'patients:edit' },
  { id: 'appointments-view', label: 'عرض المواعيد', apiKey: 'appointments:view' },
  { id: 'appointments-edit', label: 'تعديل المواعيد', apiKey: 'appointments:edit' },
  { id: 'records-view', label: 'عرض السجلات الطبية', apiKey: 'patients:files:view' },
  { id: 'records-edit', label: 'تعديل السجلات الطبية', apiKey: 'patients:files:upload' },
];

export function countGrantedCardPermissions(permissions: string[] = []) {
  const granted = SECRETARY_CARD_PERMISSION_ROWS.filter((row) =>
    permissions.includes(row.apiKey),
  ).length;
  return { granted, total: SECRETARY_CARD_PERMISSION_ROWS.length };
}

export function isSecretaryActive(user?: { accountStatus?: string }) {
  const status = user?.accountStatus?.toLowerCase();
  if (!status || status === 'active') return true;
  return false;
}
