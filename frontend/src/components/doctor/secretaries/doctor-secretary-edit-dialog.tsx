'use client';

import { useEffect, useState } from 'react';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import {
  ASSIGNABLE_SECRETARY_PERMISSIONS,
  SECRETARY_PERMISSION_LABELS,
} from '@/lib/doctor/secretaries/permissionsUi';
import type { DoctorSecretary } from '@/lib/doctor/secretaries/types';
import { cn } from '@/lib/utils/utils';

export function DoctorSecretaryEditDialog({
  open,
  secretary,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  secretary: DoctorSecretary | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (input: {
    fullName: string;
    phone: string;
    permissions: string[];
  }) => void;
}) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !secretary) return;
    setFullName(secretary.user?.fullName ?? '');
    setPhone(secretary.user?.phone ?? '');
    setPermissions(secretary.permissions ?? []);
  }, [open, secretary]);

  const togglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title="تعديل السكرتير"
      maxWidthClass="max-w-[640px]"
    >
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
            الاسم الكامل
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
            رقم الهاتف
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
          />
        </div>
        <div>
          <p className="mb-3 text-start font-cairo text-[13px] font-extrabold text-[#111827]">
            الصلاحيات
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ASSIGNABLE_SECRETARY_PERMISSIONS.map((key) => {
              const active = permissions.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePermission(key)}
                  className={cn(
                    'rounded-[10px] border px-3 py-2.5 text-start font-cairo text-[12px] font-bold transition',
                    active
                      ? 'border-primary bg-[#F0FDFA] text-primary'
                      : 'border-[#EEF2F6] bg-white text-[#667085] hover:border-primary/30',
                  )}
                >
                  {SECRETARY_PERMISSION_LABELS[key] ?? key}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          disabled={saving || !fullName.trim()}
          onClick={() =>
            onSave({
              fullName: fullName.trim(),
              phone: phone.trim(),
              permissions,
            })
          }
          className="flex h-[48px] w-full items-center justify-center rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </button>
      </div>
    </ClinicAccountsModalShell>
  );
}
