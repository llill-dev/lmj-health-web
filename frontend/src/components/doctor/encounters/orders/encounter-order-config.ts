import type { RadiologyCatalogTab } from '@/components/doctor/radiology/radiology-types';
import type { EncounterOrderCategoryKey } from '@/lib/doctor/encounters/encounterOrderCategories';
import type { LucideIcon } from 'lucide-react';
import { FlaskConical, ScanLine } from 'lucide-react';

export type CatalogOrderCategory = Exclude<EncounterOrderCategoryKey, 'referral'>;

export type EncounterOrderClinicalVariant = 'full' | 'compact';

type TFn = (key: string, fallback?: string) => string;

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

export function getEncounterOrderConfig(
  t: TFn,
): Record<CatalogOrderCategory, EncounterOrderCategoryConfig> {
  return {
    radiology: {
      key: 'radiology',
      pageTitle: t('doctor.encounterOrder.radiology.title'),
      title: t('doctor.encounterOrder.radiology.title'),
      headerIcon: ScanLine,
      catalogTabs: [
        { id: 'favorites', label: t('doctor.encounterOrder.tabs.favorites') },
        { id: 'devices', label: t('doctor.encounterOrder.tabs.devices') },
        { id: 'lab', label: t('doctor.encounterOrder.tabs.lab') },
        { id: 'manual', label: t('doctor.encounterOrder.tabs.manual') },
      ],
      addButtonLabel: t('doctor.encounterOrder.radiology.addButtonLabel'),
      catalogSectionLabel: t('doctor.encounterOrder.radiology.addButtonLabel'),
      searchPlaceholder: t('doctor.encounterOrder.radiology.searchPlaceholder'),
      patientSubtitle: (name) =>
        name?.trim()
          ? t('doctor.encounterOrder.radiology.patientSubtitle').replace(
              '{name}',
              name.trim(),
            )
          : t('doctor.encounterOrder.radiology.title'),
      manualFormTitle: t('doctor.encounterOrder.radiology.manualFormTitle'),
      selectedSectionTitle: (n) =>
        t('doctor.encounterOrder.radiology.selectedSectionTitle').replace(
          '{count}',
          String(n),
        ),
      emptySelectedHint: t('doctor.encounterOrder.radiology.emptySelectedHint'),
      catalogAddToast: t('doctor.encounterOrder.radiology.catalogAddToast'),
      deleteItemTitle: t('doctor.encounterOrder.radiology.deleteItemTitle'),
      finalizeTitle: t('doctor.encounterOrder.finalizeTitle'),
      finalizeDescription: (n) =>
        t('doctor.encounterOrder.radiology.finalizeDescription').replace(
          '{count}',
          String(n),
        ),
      loadingLabel: t('doctor.encounterOrder.radiology.loadingLabel'),
      errorTitle: t('doctor.encounterOrder.radiology.errorTitle'),
      clinicalVariant: 'full',
      centerInstructionsLabel: t(
        'doctor.encounterOrder.radiology.centerInstructionsLabel',
      ),
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
      pageTitle: t('doctor.encounterOrder.lab.title'),
      title: t('doctor.encounterOrder.lab.title'),
      headerIcon: FlaskConical,
      catalogTabs: [
        { id: 'favorites', label: t('doctor.encounterOrder.tabs.favorites') },
        { id: 'recent', label: t('doctor.encounterOrder.tabs.recent') },
        { id: 'lab', label: t('doctor.encounterOrder.tabs.lab') },
        { id: 'manual', label: t('doctor.encounterOrder.tabs.manual') },
      ],
      addButtonLabel: t('doctor.encounterOrder.lab.addButtonLabel'),
      catalogSectionLabel: t('doctor.encounterOrder.lab.addButtonLabel'),
      searchPlaceholder: t('doctor.encounterOrder.lab.searchPlaceholder'),
      patientSubtitle: (name) => {
        const trimmed = name?.trim();
        if (!trimmed) return t('doctor.encounterOrder.lab.title');
        const file = trimmed.startsWith('P-') ? trimmed : `P-${trimmed}`;
        return `${trimmed} — ${file}`;
      },
      manualFormTitle: t('doctor.encounterOrder.lab.manualFormTitle'),
      selectedSectionTitle: (n) =>
        t('doctor.encounterOrder.lab.selectedSectionTitle').replace(
          '{count}',
          String(n),
        ),
      emptySelectedHint: t('doctor.encounterOrder.lab.emptySelectedHint'),
      catalogAddToast: t('doctor.encounterOrder.lab.catalogAddToast'),
      deleteItemTitle: t('doctor.encounterOrder.lab.deleteItemTitle'),
      finalizeTitle: t('doctor.encounterOrder.finalizeTitle'),
      finalizeDescription: (n) =>
        t('doctor.encounterOrder.lab.finalizeDescription').replace(
          '{count}',
          String(n),
        ),
      loadingLabel: t('doctor.encounterOrder.lab.loadingLabel'),
      errorTitle: t('doctor.encounterOrder.lab.errorTitle'),
      clinicalVariant: 'full',
      centerInstructionsLabel: t(
        'doctor.encounterOrder.lab.centerInstructionsLabel',
      ),
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
      pageTitle: t('doctor.encounterOrder.procedure.title'),
      title: t('doctor.encounterOrder.procedure.title'),
      headerIcon: ScanLine,
      catalogTabs: [
        { id: 'favorites', label: t('doctor.encounterOrder.tabs.favorites') },
        { id: 'recent', label: t('doctor.encounterOrder.tabs.recent') },
        { id: 'lab', label: t('doctor.encounterOrder.tabs.catalog') },
        { id: 'manual', label: t('doctor.encounterOrder.tabs.manual') },
      ],
      addButtonLabel: t('doctor.encounterOrder.procedure.addButtonLabel'),
      catalogSectionLabel: t('doctor.encounterOrder.procedure.addButtonLabel'),
      searchPlaceholder: t('doctor.encounterOrder.procedure.searchPlaceholder'),
      patientSubtitle: (name) =>
        name?.trim()
          ? t('doctor.encounterOrder.procedure.patientSubtitle').replace(
              '{name}',
              name.trim(),
            )
          : t('doctor.encounterOrder.procedure.title'),
      manualFormTitle: t('doctor.encounterOrder.procedure.manualFormTitle'),
      selectedSectionTitle: (n) =>
        t('doctor.encounterOrder.procedure.selectedSectionTitle').replace(
          '{count}',
          String(n),
        ),
      emptySelectedHint: t('doctor.encounterOrder.procedure.emptySelectedHint'),
      catalogAddToast: t('doctor.encounterOrder.procedure.catalogAddToast'),
      deleteItemTitle: t('doctor.encounterOrder.procedure.deleteItemTitle'),
      finalizeTitle: t('doctor.encounterOrder.finalizeTitle'),
      finalizeDescription: (n) =>
        t('doctor.encounterOrder.procedure.finalizeDescription').replace(
          '{count}',
          String(n),
        ),
      loadingLabel: t('doctor.encounterOrder.procedure.loadingLabel'),
      errorTitle: t('doctor.encounterOrder.procedure.errorTitle'),
      clinicalVariant: 'compact',
      centerInstructionsLabel: t(
        'doctor.encounterOrder.procedure.centerInstructionsLabel',
      ),
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
}

export function getReferralWorkspaceConfig(t: TFn) {
  return {
    title: t('doctor.encounterOrder.referral.title'),
    loadingLabel: t('doctor.encounterOrder.referral.loadingLabel'),
    errorTitle: t('doctor.encounterOrder.referral.errorTitle'),
    hubPath: (patientId: string, encounterId: string) =>
      `/doctor/encounters/${patientId}/${encounterId}`,
    workspacePath: (patientId: string, encounterId: string) =>
      `/doctor/encounters/${patientId}/${encounterId}/referral`,
  };
}
