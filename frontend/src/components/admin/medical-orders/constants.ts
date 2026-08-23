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
  labelKey: string;
}> = [
  { kind: 'lab', labelKey: 'adminMedicalOrders.tab.lab' },
  { kind: 'imaging', labelKey: 'adminMedicalOrders.tab.imaging' },
  { kind: 'procedure', labelKey: 'adminMedicalOrders.tab.procedure' },
  { kind: 'referral', labelKey: 'adminMedicalOrders.tab.referral' },
];

export const SUPPORTED_MEDICAL_ORDER_TAB_META = MEDICAL_ORDER_TAB_META.filter(
  ({ kind }) => kind !== 'referral',
);

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

export function medicalOrderCatalogDeleteSupported() {
  return false;
}

export function medicalOrderCatalogKindSupported(kind: MedicalOrderCatalogKind) {
  return kind !== 'referral';
}
