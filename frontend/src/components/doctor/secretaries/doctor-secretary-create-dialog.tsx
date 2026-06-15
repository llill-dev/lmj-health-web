'use client';

import { useState } from 'react';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import {
  ASSIGNABLE_SECRETARY_PERMISSIONS,
  SECRETARY_PERMISSION_LABELS,
} from '@/lib/doctor/secretaries/permissionsUi';
import { cn } from '@/lib/utils/utils';

export function DoctorSecretaryCreateDialog({
  open,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  saving?: boolean;
  onClose: () => void;
  onSave: (input: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    gender: 'Male' | 'Female';
    permissions: string[];
  }) => void;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Female');
  const [permissions, setPermissions] = useState<string[]>([
    'appointments:view',
    'patients:view',
  ]);

  const togglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const reset = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setGender('Female');
    setPermissions(['appointments:view', 'patients:view']);
  };

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="إضافة سكرتير"
      maxWidthClass="max-w-[640px]"
    >
      <div className="space-y-4">
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
              الهاتف
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
              الجنس
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
              className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
            >
              <option value="Female">أنثى</option>
              <option value="Male">ذكر</option>
            </select>
          </div>
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
          disabled={saving || !fullName.trim() || !email.trim() || !password.trim()}
          onClick={() => {
            onSave({
              fullName: fullName.trim(),
              email: email.trim(),
              password,
              phone: phone.trim(),
              gender,
              permissions,
            });
            reset();
          }}
          className="flex h-[48px] w-full items-center justify-center rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
        >
          {saving ? 'جاري الإنشاء...' : 'إنشاء السكرتير'}
        </button>
      </div>
    </ClinicAccountsModalShell>
  );
}
