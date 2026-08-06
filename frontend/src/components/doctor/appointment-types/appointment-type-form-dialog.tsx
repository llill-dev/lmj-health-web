'use client';

import { BadgeDollarSign, Tags } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import {
  DoctorProfileFormField,
  profileInputClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import ToggleSwitch from '@/components/ui/toggle-switch';
import type { AppointmentType } from '@/lib/doctor/types';
import { useI18n } from '@/i18n/provider';

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
  const { locale, dir } = useI18n();
  const priceVisibleId = useId();
  const activeId = useId();

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

  const title =
    mode === 'create' ? 'إضافة نوع موعد جديد' : 'تعديل نوع الموعد';

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title={title}
      maxWidthClass="max-w-[520px]"
      headerPattern
    >
      <div dir={dir} lang={locale} className="space-y-5 text-right">
        <p className="rounded-[12px] border border-[#E6F4F3] bg-[#F0FDFA] px-4 py-3 font-cairo text-[13px] font-semibold leading-relaxed text-[#667085]">
          {mode === 'create'
            ? 'أنشئ نوع موعد جديداً مع تحديد السعر وإظهاره للمريض عند الحجز.'
            : 'عدّل بيانات نوع الموعد والحالة الظاهرة للمرضى.'}
        </p>

        <DoctorProfileFormField label="اسم نوع الموعد" required>
          <div className="relative">
            <Tags
              className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
              aria-hidden
            />
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="مثال: كشفية عامة"
              className={`${profileInputClass} pe-4 ps-11`}
            />
          </div>
        </DoctorProfileFormField>

        <DoctorProfileFormField
          label="السعر"
          hint="اتركه فارغاً إذا لم يكن هناك سعر ثابت لهذا النوع."
        >
          <div className="relative">
            <BadgeDollarSign
              className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
              aria-hidden
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0.00"
              className={`${profileInputClass} pe-4 ps-11`}
            />
          </div>
        </DoctorProfileFormField>

        <div className="space-y-3 rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span
              id={priceVisibleId}
              className="font-cairo text-[13px] font-extrabold text-[#344054]"
            >
              إظهار السعر للمريض
            </span>
            <ToggleSwitch
              id={`${priceVisibleId}-switch`}
              size="sm"
              checked={priceVisibleToPatient}
              onChange={setPriceVisibleToPatient}
              label="إظهار السعر للمريض"
              aria-labelledby={priceVisibleId}
            />
          </div>

          {mode === 'edit' ? (
            <div className="flex flex-col gap-3 border-t border-[#EEF2F6] pt-3 sm:flex-row sm:items-center sm:justify-between">
              <span
                id={activeId}
                className="font-cairo text-[13px] font-extrabold text-[#344054]"
              >
                نوع الموعد نشط
              </span>
              <ToggleSwitch
                id={`${activeId}-switch`}
                size="sm"
                checked={isActive}
                onChange={setIsActive}
                label="نوع الموعد نشط"
                aria-labelledby={activeId}
              />
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex h-[48px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-extrabold text-[#667085] transition hover:bg-[#F9FAFB] disabled:opacity-60"
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
            className="inline-flex h-[48px] items-center justify-center rounded-[10px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_24px_-4px_rgba(15,143,139,0.35)] transition hover:bg-[#14B3AE] disabled:opacity-60"
          >
            {busy ? 'جارٍ الحفظ...' : mode === 'create' ? 'إضافة النوع' : 'حفظ التعديلات'}
          </button>
        </div>
      </div>
    </ClinicAccountsModalShell>
  );
}
