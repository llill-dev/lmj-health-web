import type { AuditLogCategory, AuditLogOutcome } from '@/lib/admin/types';

export const PAGE_SIZE = 20;

export const CATEGORY_LABELS: Record<AuditLogCategory, string> = {
  AUTH: 'مصادقة',
  AUTHZ: 'صلاحيات',
  PHI: 'بيانات طبية',
  DATA: 'بيانات',
  ADMIN: 'إدارة',
  SYSTEM: 'نظام',
};

export const CATEGORY_STYLES: Record<
  AuditLogCategory,
  { bg: string; text: string; dot: string }
> = {
  AUTH: { bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]', dot: 'bg-[#3B82F6]' },
  AUTHZ: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', dot: 'bg-[#F59E0B]' },
  PHI: { bg: 'bg-[#FDF2F8]', text: 'text-[#9D174D]', dot: 'bg-[#EC4899]' },
  DATA: { bg: 'bg-[#ECFDF5]', text: 'text-[#065F46]', dot: 'bg-[#10B981]' },
  ADMIN: { bg: 'bg-[#F5F3FF]', text: 'text-[#5B21B6]', dot: 'bg-[#8B5CF6]' },
  SYSTEM: { bg: 'bg-[#F0F9FF]', text: 'text-[#0369A1]', dot: 'bg-[#0EA5E9]' },
};

export const OUTCOME_LABELS: Record<AuditLogOutcome, string> = {
  SUCCESS: 'ناجح',
  FAIL: 'فشل',
  DENY: 'مرفوض',
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'مدير',
  doctor: 'طبيب',
  patient: 'مريض',
  secretary: 'سكرتير',
  data_entry: 'إدخال بيانات',
};

export const FILTER_CATEGORIES: Array<{ value: AuditLogCategory | ''; label: string }> = [
  { value: '', label: 'جميع الفئات' },
  { value: 'AUTH', label: 'مصادقة (AUTH)' },
  { value: 'AUTHZ', label: 'صلاحيات (AUTHZ)' },
  { value: 'PHI', label: 'بيانات طبية (PHI)' },
  { value: 'DATA', label: 'بيانات (DATA)' },
  { value: 'ADMIN', label: 'إدارة (ADMIN)' },
  { value: 'SYSTEM', label: 'نظام (SYSTEM)' },
];

export const FILTER_OUTCOMES: Array<{ value: AuditLogOutcome | ''; label: string }> = [
  { value: '', label: 'جميع النتائج' },
  { value: 'SUCCESS', label: 'ناجح' },
  { value: 'FAIL', label: 'فشل' },
  { value: 'DENY', label: 'مرفوض' },
];

export const FILTER_ROLES: Array<{ value: string; label: string }> = [
  { value: '', label: 'جميع الأدوار' },
  { value: 'admin', label: 'مدير' },
  { value: 'doctor', label: 'طبيب' },
  { value: 'patient', label: 'مريض' },
  { value: 'secretary', label: 'سكرتير' },
  { value: 'data_entry', label: 'إدخال بيانات' },
];

export const SELECT_CLASS =
  'h-[40px] rounded-[10px] border border-[#EEF2F6] bg-white px-3 font-cairo text-[13px] font-bold text-[#344054] focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer';
