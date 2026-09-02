'use client';

import {
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Pencil,
  Shield,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  countGrantedCardPermissions,
  isSecretaryActive,
  secretaryPermissionLabel,
  getSecretaryCardPermissionRows,
} from '@/lib/doctor/secretaries/permissionsUi';
import type { DoctorSecretary } from '@/lib/doctor/secretaries/types';
import { cn } from '@/lib/utils/utils';
import { useI18n } from '@/i18n/provider';

export function DoctorSecretaryCard({
  secretary,
  onEdit,
  onUnassign,
}: {
  secretary: DoctorSecretary;
  onEdit: (secretary: DoctorSecretary) => void;
  onUnassign: (secretary: DoctorSecretary) => void;
}) {
  const { t, locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const cardPermissionRows = useMemo(
    () => getSecretaryCardPermissionRows(tr),
    [locale],
  );
  const [expanded, setExpanded] = useState(true);
  const permissions = secretary.permissions ?? [];
  const { granted, total } = countGrantedCardPermissions(permissions);
  const active = isSecretaryActive(secretary.user);
  const name = secretary.user?.fullName ?? secretary.fullName ?? '—';
  const email = secretary.user?.email ?? secretary.email;
  const phone = secretary.user?.phone ?? secretary.phone;

  return (
    <article className="overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#F2F4F7] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-[#F0FDFA] text-primary">
              <UserRound className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 text-start">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-cairo text-[16px] font-extrabold text-[#111827]">
                  {name}
                </h3>
                <span
                  className={cn(
                    'rounded-[8px] px-2.5 py-1 font-cairo text-[11px] font-extrabold',
                    active
                      ? 'bg-[#F0FDFA] text-primary'
                      : 'bg-[#FEF2F2] text-[#DC2626]',
                  )}
                >
                  {active
                    ? t('doctor.secretaryCard.active')
                    : t('doctor.secretaryCard.inactive')}
                </span>
              </div>
              <div className="mt-2 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-4">
                {email ? (
                  <span className="inline-flex items-center gap-1.5 font-cairo text-[12px] font-semibold text-[#667085]">
                    <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {email}
                  </span>
                ) : null}
                {phone ? (
                  <span className="inline-flex items-center gap-1.5 font-cairo text-[12px] font-semibold text-[#667085]">
                    <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {phone}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => onUnassign(secretary)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] transition hover:bg-[#FEE2E2]"
              title={t('doctor.secretaryCard.unassign')}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onEdit(secretary)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#9EE8E0] bg-[#F0FDFA] text-primary transition hover:bg-[#E6F4F3]"
              title={t('doctor.secretaryCard.edit')}
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3 text-start"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" aria-hidden />
            <span className="font-cairo text-[14px] font-extrabold text-[#111827]">
              {t('doctor.secretaryCard.permissionsCount')
                .replace('{granted}', String(granted))
                .replace('{total}', String(total))}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-[#667085]" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#667085]" aria-hidden />
          )}
        </button>

        {expanded ? (
          <ul className="mt-4 space-y-3">
            {cardPermissionRows.map((row) => {
              const grantedRow = permissions.includes(row.apiKey);
              return (
                <li
                  key={row.id}
                  className="flex flex-col gap-2 border-b border-[#F2F4F7] pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <span className="font-cairo text-[13px] font-semibold text-[#111827]">
                    {secretaryPermissionLabel(row.apiKey, tr)}
                  </span>
                  {grantedRow ? (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F0FDFA] text-primary">
                      ✓
                    </span>
                  ) : (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F3F4F6] text-[#98A2B3]">
                      ✕
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
