import type { RadiologyCatalogTab } from '@/components/doctor/radiology/radiology-types';
import type { EncounterOrderCategoryKey } from '@/lib/doctor/encounterOrderCategories';
import type { LucideIcon } from 'lucide-react';
import { FlaskConical, ScanLine } from 'lucide-react';

export type CatalogOrderCategory = Exclude<EncounterOrderCategoryKey, 'referral'>;

export type EncounterOrderClinicalVariant = 'full' | 'compact';

export type EncounterOrderCategoryConfig = {
  key: CatalogOrderCategory;
  /** عنوان الصفحة في الهيدر (مثال: الطلبات المخبرية) */
  pageTitle: string;
  title: string;
  headerIcon: LucideIcon;
  catalogTabs: Array<{ id: RadiologyCatalogTab; label: string }>;
  addButtonLabel: string;
  /** عنوان شريط قسم الكتالوج (مثال: إضافة تحليل) */
  catalogSectionLabel: string;
  searchPlaceholder: string;
  patientSubtitle: (patientName?: string) => string;
  manualFormTitle: string;
  selectedSectionTitle: (count: number) => string;
  emptySelectedHint: string;
  catalogAddToast: string;
  deleteItemTitle: string;
  finalizeTitle: string;
  finalizeDescription: (count: number) => string;
  loadingLabel: string;
  errorTitle: string;
  clinicalVariant: EncounterOrderClinicalVariant;
  centerInstructionsLabel: string;
  /** قائمة اختيار لدرجة الاستعجال (اختياري) */
  urgencyAsSelect?: boolean;
  manualPathSuffix: string;
  supportsManual: boolean;
  pdfSourceType: 'order' | 'imaging_order';
  previewPath: (patientId: string, encounterId: string) => string;
  workspacePath: (patientId: string, encounterId: string) => string;
  hubPath: (patientId: string, encounterId: string) => string;
};

export const ENCOUNTER_ORDER_CONFIG: Record<
  CatalogOrderCategory,
  EncounterOrderCategoryConfig
> = {
  radiology: {
    key: 'radiology',
    pageTitle: 'طلبات الأشعة',
    title: 'طلبات الأشعة',
    headerIcon: ScanLine,
    catalogTabs: [
      { id: 'favorites', label: 'المفضلة' },
      { id: 'devices', label: 'الأجهزة' },
      { id: 'lab', label: 'مختبري' },
      { id: 'manual', label: 'يدوي' },
    ],
    addButtonLabel: 'إضافة أشعة',
    catalogSectionLabel: 'إضافة أشعة',
    searchPlaceholder: 'بحث عن فحص أو أشعة...',
    patientSubtitle: (name) =>
      name?.trim()
        ? `طلب الأشعة الخاص بالمريض ${name.trim()}`
        : 'طلبات الأشعة',
    manualFormTitle: 'إدخال أشعة يدوياً',
    selectedSectionTitle: (n) => `الأشعة المختارة (${n})`,
    emptySelectedHint: 'لم تُضف فحوصات بعد. استخدم «إضافة أشعة» أو الإدخال اليدوي.',
    catalogAddToast: 'تمت إضافة الفحص.',
    deleteItemTitle: 'حذف الفحص',
    finalizeTitle: 'اعتماد نهائي',
    finalizeDescription: (n) => `اعتماد طلب الأشعة (${n} فحص)`,
    loadingLabel: 'جارٍ تحميل طلب الأشعة...',
    errorTitle: 'تعذّر تحميل طلب الأشعة',
    clinicalVariant: 'full',
    centerInstructionsLabel: 'تعليمات للمختبر / مركز الأشعة',
    manualPathSuffix: 'radiology/manual',
    supportsManual: true,
    pdfSourceType: 'imaging_order',
    previewPath: (patientId, encounterId) =>
      `/doctor/encounters/${patientId}/${encounterId}/radiology/preview`,
    workspacePath: (patientId, encounterId) =>
      `/doctor/encounters/${patientId}/${encounterId}/radiology`,
    hubPath: (patientId, encounterId) =>
      `/doctor/encounters/${patientId}/${encounterId}`,
  },
  lab: {
    key: 'lab',
    pageTitle: 'الطلبات المخبرية',
    title: 'الطلبات المخبرية',
    headerIcon: FlaskConical,
    catalogTabs: [
      { id: 'favorites', label: 'المفضلة' },
      { id: 'recent', label: 'الأخيرة' },
      { id: 'lab', label: 'مختبري' },
      { id: 'manual', label: 'يدوي' },
    ],
    addButtonLabel: 'إضافة تحليل',
    catalogSectionLabel: 'إضافة تحليل',
    searchPlaceholder: 'بحث عن دواء...',
    patientSubtitle: (name) => {
      const trimmed = name?.trim();
      if (!trimmed) return 'الطلبات المخبرية';
      const file = trimmed.startsWith('P-') ? trimmed : `P-${trimmed}`;
      return `${trimmed} — ${file}`;
    },
    manualFormTitle: 'إدخال تحليل يدوياً',
    selectedSectionTitle: (n) => `التحاليل المختارة (${n})`,
    emptySelectedHint: 'لم تُضف تحاليل بعد. اختر من الكتالوج أو الإدخال اليدوي.',
    catalogAddToast: 'تمت إضافة التحليل.',
    deleteItemTitle: 'حذف التحليل',
    finalizeTitle: 'اعتماد نهائي',
    finalizeDescription: (n) => `اعتماد طلب التحاليل (${n} بند)`,
    loadingLabel: 'جارٍ تحميل طلب التحاليل...',
    errorTitle: 'تعذّر تحميل طلب التحاليل',
    clinicalVariant: 'full',
    centerInstructionsLabel: 'تعليمات للمختبر',
    urgencyAsSelect: true,
    manualPathSuffix: 'lab/manual',
    supportsManual: true,
    pdfSourceType: 'order',
    previewPath: (patientId, encounterId) =>
      `/doctor/encounters/${patientId}/${encounterId}/lab/preview`,
    workspacePath: (patientId, encounterId) =>
      `/doctor/encounters/${patientId}/${encounterId}/lab`,
    hubPath: (patientId, encounterId) =>
      `/doctor/encounters/${patientId}/${encounterId}`,
  },
  procedure: {
    key: 'procedure',
    pageTitle: 'طلبات الإجراءات',
    title: 'طلبات الإجراءات',
    headerIcon: ScanLine,
    catalogTabs: [
      { id: 'favorites', label: 'المفضلة' },
      { id: 'recent', label: 'الأخيرة' },
      { id: 'lab', label: 'الكتالوج' },
      { id: 'manual', label: 'يدوي' },
    ],
    addButtonLabel: 'إضافة إجراء',
    catalogSectionLabel: 'إضافة إجراء',
    searchPlaceholder: 'بحث عن إجراء...',
    patientSubtitle: (name) =>
      name?.trim()
        ? `طلب الإجراءات الخاص بالمريض ${name.trim()}`
        : 'طلبات الإجراءات',
    manualFormTitle: 'إدخال إجراء يدوياً',
    selectedSectionTitle: (n) => `الإجراءات المختارة (${n})`,
    emptySelectedHint: 'لم تُضف إجراءات بعد. اختر من الكتالوج.',
    catalogAddToast: 'تمت إضافة الإجراء.',
    deleteItemTitle: 'حذف الإجراء',
    finalizeTitle: 'اعتماد نهائي',
    finalizeDescription: (n) => `اعتماد طلب الإجراءات (${n} بند)`,
    loadingLabel: 'جارٍ تحميل طلب الإجراءات...',
    errorTitle: 'تعذّر تحميل طلب الإجراءات',
    clinicalVariant: 'compact',
    centerInstructionsLabel: 'تعليمات',
    manualPathSuffix: 'procedure/manual',
    supportsManual: false,
    pdfSourceType: 'order',
    previewPath: (patientId, encounterId) =>
      `/doctor/encounters/${patientId}/${encounterId}/procedure/preview`,
    workspacePath: (patientId, encounterId) =>
      `/doctor/encounters/${patientId}/${encounterId}/procedure`,
    hubPath: (patientId, encounterId) =>
      `/doctor/encounters/${patientId}/${encounterId}`,
  },
};

export const REFERRAL_WORKSPACE_CONFIG = {
  title: 'إنشاء تحويل طبي',
  loadingLabel: 'جارٍ تحميل التحويل...',
  errorTitle: 'تعذّر تحميل التحويل',
  hubPath: (patientId: string, encounterId: string) =>
    `/doctor/encounters/${patientId}/${encounterId}`,
  workspacePath: (patientId: string, encounterId: string) =>
    `/doctor/encounters/${patientId}/${encounterId}/referral`,
};
