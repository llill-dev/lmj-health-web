'use client';

import { useEffect, useState } from 'react';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import type { AppointmentType } from '@/lib/doctor/types';

export type AppointmentTypeFormValues = {
  name: string;
  price: string;
  priceVisibleToPatient: boolean;
  isActive: boolean;
};

export function AppointmentTypeFormDialog({
  open,
  mode,
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: AppointmentType | null;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (values: AppointmentTypeFormValues) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [priceVisibleToPatient, setPriceVisibleToPatient] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setPrice(initial?.price != null ? String(initial.price) : '');
    setPriceVisibleToPatient(initial?.priceVisibleToPatient ?? true);
    setIsActive(initial?.isActive ?? true);
  }, [open, initial]);

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'إضافة نوع موعد' : 'تعديل نوع الموعد'}
      maxWidthClass="max-w-[520px]"
    >
      <div dir="rtl" lang="ar" className="space-y-4 text-right">
        <label className="block">
          <span className="mb-2 block font-cairo text-[12px] font-extrabold text-[#344054]">
            الاسم
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-[8px] border border-[#E5E7EB] px-3 font-cairo text-[13px]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-cairo text-[12px] font-extrabold text-[#344054]">
            السعر (اختياري)
          </span>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="h-11 w-full rounded-[8px] border border-[#E5E7EB] px-3 font-cairo text-[13px]"
          />
        </label>

        <label className="flex items-center gap-2 font-cairo text-[13px] font-semibold text-[#344054]">
          <input
            type="checkbox"
            checked={priceVisibleToPatient}
            onChange={(event) => setPriceVisibleToPatient(event.target.checked)}
          />
          إظهار السعر للمريض
        </label>

        {mode === 'edit' ? (
          <label className="flex items-center gap-2 font-cairo text-[13px] font-semibold text-[#344054]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            نشط
          </label>
        ) : null}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-11 rounded-[8px] border border-[#E5E7EB] font-cairo text-[13px] font-extrabold text-[#475467]"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={busy || !name.trim()}
            onClick={() =>
              void onSubmit({
                name: name.trim(),
                price,
                priceVisibleToPatient,
                isActive,
              })
            }
            className="h-11 rounded-[8px] bg-primary font-cairo text-[13px] font-extrabold text-white disabled:opacity-60"
          >
            {busy ? 'جارٍ الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>
    </ClinicAccountsModalShell>
  );
}
