import type { AuditLogCategory, AuditLogOutcome } from '@/lib/admin/types';
import type { AppLocale } from '@/i18n/runtime';
import { getTranslationValue } from '@/i18n/translations';

export const PAGE_SIZE = 20;

function tt(locale: AppLocale, key: string): string {
  return getTranslationValue(locale, key) ?? key;
}

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

const CATEGORIES: AuditLogCategory[] = ['AUTH', 'AUTHZ', 'PHI', 'DATA', 'ADMIN', 'SYSTEM'];
const OUTCOMES: AuditLogOutcome[] = ['SUCCESS', 'FAIL', 'DENY'];
const ROLES = ['admin', 'doctor', 'patient', 'secretary', 'data_entry'] as const;

export function categoryLabel(category: AuditLogCategory, locale: AppLocale = 'ar'): string {
  return tt(locale, `adminAuditLog.category.${category}`);
}

export function outcomeLabel(outcome: AuditLogOutcome, locale: AppLocale = 'ar'): string {
  return tt(locale, `adminAuditLog.outcome.${outcome}`);
}

export function roleLabel(role: string, locale: AppLocale = 'ar'): string {
  return getTranslationValue(locale, `adminAuditLog.role.${role}`) ?? role;
}

export function categoryLabels(locale: AppLocale = 'ar'): Record<AuditLogCategory, string> {
  return Object.fromEntries(CATEGORIES.map((c) => [c, categoryLabel(c, locale)])) as Record<AuditLogCategory, string>;
}

export function outcomeLabels(locale: AppLocale = 'ar'): Record<AuditLogOutcome, string> {
  return Object.fromEntries(OUTCOMES.map((o) => [o, outcomeLabel(o, locale)])) as Record<AuditLogOutcome, string>;
}

export function roleLabels(locale: AppLocale = 'ar'): Record<string, string> {
  return Object.fromEntries(ROLES.map((r) => [r, roleLabel(r, locale)]));
}

export function filterCategories(locale: AppLocale = 'ar'): Array<{ value: AuditLogCategory | ''; label: string }> {
  return [
    { value: '', label: tt(locale, 'adminAuditLog.filter.allCategories') },
    ...CATEGORIES.map((c) => ({ value: c, label: `${categoryLabel(c, locale)} (${c})` })),
  ];
}

export function filterOutcomes(locale: AppLocale = 'ar'): Array<{ value: AuditLogOutcome | ''; label: string }> {
  return [
    { value: '', label: tt(locale, 'adminAuditLog.filter.allOutcomes') },
    ...OUTCOMES.map((o) => ({ value: o, label: outcomeLabel(o, locale) })),
  ];
}

export function filterRoles(locale: AppLocale = 'ar'): Array<{ value: string; label: string }> {
  return [
    { value: '', label: tt(locale, 'adminAuditLog.filter.allRoles') },
    ...ROLES.map((r) => ({ value: r, label: roleLabel(r, locale) })),
  ];
}

export const SELECT_CLASS =
  'h-[40px] rounded-[10px] border border-[#EEF2F6] bg-white px-3 font-cairo text-[13px] font-bold text-[#344054] focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer';
