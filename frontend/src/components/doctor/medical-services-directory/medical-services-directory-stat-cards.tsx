'use client';

import {
  Building2,
  FlaskConical,
  ScanLine,
  Stethoscope,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { MedicalServiceCategory } from '@/lib/doctor/medical-services-directory/types';
import { formatBillingNumber } from '@/lib/doctor/billing/format';

export type MedicalServicesDirectoryKpi = {
  key: string;
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
};

export function buildMedicalServicesDirectoryKpis(
  counts: Record<MedicalServiceCategory, number>,
): MedicalServicesDirectoryKpi[] {
  const formatCount = (value: number) =>
    formatBillingNumber(value, { maximumFractionDigits: 0 });

  return [
    {
      key: 'clinics',
      icon: <Stethoscope className="h-5 w-5 shrink-0" />,
      value: formatCount(counts.clinics),
      label: 'عيادات',
    },
    {
      key: 'imaging',
      icon: <ScanLine className="h-5 w-5 shrink-0" />,
      value: formatCount(counts.imaging),
      label: 'تصوير طبي',
    },
    {
      key: 'treatment',
      icon: <Building2 className="h-5 w-5 shrink-0" />,
      value: formatCount(counts.treatment),
      label: 'مراكز علاج',
    },
    {
      key: 'labs',
      icon: <FlaskConical className="h-5 w-5 shrink-0" />,
      value: formatCount(counts.labs),
      label: 'مخابر',
    },
  ];
}
