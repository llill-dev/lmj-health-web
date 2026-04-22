import {
  ArrowLeftRight,
  FlaskConical,
  ScanLine,
  Stethoscope,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { MedicalOrderCatalogKind } from '@/lib/admin/types';

export const MEDICAL_ORDER_TAB_META: Array<{
  kind: MedicalOrderCatalogKind;
  label: string;
}> = [
  { kind: 'lab', label: 'التحاليل' },
  { kind: 'imaging', label: 'الأشعة' },
  { kind: 'procedure', label: 'الإجراءات' },
  { kind: 'referral', label: 'التحويلات' },
];

const HEADER_ICONS: Record<MedicalOrderCatalogKind, LucideIcon> = {
  lab: FlaskConical,
  imaging: ScanLine,
  procedure: Stethoscope,
  referral: ArrowLeftRight,
};

export function medicalOrderCatalogHeaderIcon(
  kind: MedicalOrderCatalogKind,
): LucideIcon {
  return HEADER_ICONS[kind];
}
