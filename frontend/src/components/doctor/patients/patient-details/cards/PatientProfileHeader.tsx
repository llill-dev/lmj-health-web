'use client';

import {
  Calendar,
  Phone,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { PatientQuickInfo } from '@/components/doctor/patients/patient-details/cards/PatientQuickInfo';
import { cn } from '@/lib/utils/utils';

type PatientProfileHeaderPatient = {
  name: string;
  fileNo: string;
  phone: string;
  lastVisit: string;
  accountStatusLabel: string;
  accountStatusKey?: 'active' | 'temporary' | 'suspended';
  bloodType: string;
  heightLabel?: string;
  weightLabel?: string;
  allergies: string[];
  medicalConditions: string[];
};

type RelationshipTone = {
  bg: string;
  text: string;
  ring?: string;
  border?: string;
};

type PatientProfileHeaderProps = {
  variant?: 'page' | 'compact';
  patient: PatientProfileHeaderPatient;
  relationshipLabel?: string;
  relationshipTone?: RelationshipTone;
  relationshipIcon?: LucideIcon;
};

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('966') && digits.length >= 12) return `+${digits}`;
  if (digits.startsWith('5') && digits.length >= 9) return `+966${digits}`;
  if (digits.startsWith('05')) return `+966${digits.slice(1)}`;
  return phone;
}

export function PatientProfileHeader({
  variant = 'page',
  patient,
  relationshipLabel,
  relationshipTone,
  relationshipIcon: RelationshipIcon,
}: PatientProfileHeaderProps) {
  const statusTone =
    patient.accountStatusKey === 'temporary'
      ? 'bg-[#FFF4ED] text-[#C4320A] ring-[#FED7AA]'
      : patient.accountStatusKey === 'suspended'
        ? 'bg-[#FEF2F2] text-[#B42318] ring-[#FECACA]'
        : 'bg-[#ECFDF3] text-[#027A48] ring-[#ABEFC6]';

  const phoneDisplay = formatPhoneDisplay(patient.phone);

  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        variant === 'page' && 'lg:flex-row lg:items-start lg:justify-between',
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-5">
        <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[22px] bg-primary text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)]">
          <UserRound className="h-9 w-9" aria-hidden strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1 space-y-3 text-start">
          <p className="font-cairo text-[12px] font-bold text-[#64748B]">
            ملف المريض
          </p>

          <h1 className="font-cairo text-[24px] font-black leading-tight text-[#0F172A] sm:text-[28px]">
            {patient.name}
          </h1>

          <div className="flex flex-wrap justify-start gap-2">
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-1 font-cairo text-[12px] font-extrabold ring-1 ring-inset',
                statusTone,
              )}
            >
              {patient.accountStatusLabel}
            </span>

            {relationshipLabel && relationshipTone ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-cairo text-[12px] font-extrabold ring-1 ring-inset',
                  relationshipTone.bg,
                  relationshipTone.text,
                  relationshipTone.ring,
                )}
              >
                {RelationshipIcon ? (
                  <RelationshipIcon className="h-3.5 w-3.5" aria-hidden />
                ) : null}
                {relationshipLabel}
              </span>
            ) : null}
          </div>

          <p className="font-cairo text-[13px] font-semibold text-[#98A2B3]">
            ملف #{patient.fileNo}
          </p>

          <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 font-cairo text-[13px] font-semibold text-[#667085]">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span dir="ltr" className="text-end font-semibold text-[#344054]">
                {phoneDisplay}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                آخر زيارة:{' '}
                <span className="text-[#1F2937]">{patient.lastVisit}</span>
              </span>
            </span>
          </div>
        </div>
      </div>

      {variant === 'page' ? (
        <div className="flex w-full flex-col items-start gap-3 lg:w-auto lg:min-w-[360px]">
          <PatientQuickInfo
            bloodType={patient.bloodType}
            heightLabel={patient.heightLabel}
            weightLabel={patient.weightLabel}
            allergiesCount={patient.allergies.length}
            medicalConditionsCount={patient.medicalConditions.length}
            relationshipLabel={relationshipLabel}
          />
        </div>
      ) : null}
    </div>
  );
}
