'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Save, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import type {
  DoctorFacility,
  DoctorFacilityFormValues,
} from '@/lib/doctor/facilities/types';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#111827]">
        {label}
        {required ? <span className="ms-1 text-[#DC2626]">*</span> : null}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-start font-cairo text-[13px] font-semibold text-[#111827] outline-none transition focus:border-primary';

const textareaClass =
  'w-full rounded-[12px] border border-[#E5E7EB] px-4 py-3 text-start font-cairo text-[13px] font-semibold outline-none focus:border-primary';

const EMPTY_FORM: DoctorFacilityFormValues = {
  name: '',
  description: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  workHoursFrom: '',
  workHoursTo: '',
  active: true,
};

function facilityToForm(facility: DoctorFacility): DoctorFacilityFormValues {
  return {
    name: facility.name,
    description: facility.description ?? '',
    city: facility.city,
    address: facility.address,
    phone: facility.phone,
    email: facility.email ?? '',
    workHoursFrom: facility.workHoursFrom,
    workHoursTo: facility.workHoursTo,
    active: facility.status === 'active',
  };
}

export function FacilityFormDialog({
  open,
  mode,
  initialFacility,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  initialFacility?: DoctorFacility | null;
  onClose: () => void;
  onSubmit: (values: DoctorFacilityFormValues) => void;
}) {
  const [form, setForm] = useState<DoctorFacilityFormValues>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    setForm(
      mode === 'edit' && initialFacility
        ? facilityToForm(initialFacility)
        : EMPTY_FORM,
    );
  }, [open, mode, initialFacility]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const title = mode === 'edit' ? 'تعديل منشأة' : 'إضافة منشأة';
  const subtitle = 'توثيق المنشآت';

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="relative max-h-[min(92vh,860px)] w-full max-w-[760px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden border-b border-[#EEF2F6] px-8 pb-5 pt-8">
              <div
                className="pointer-events-none absolute inset-0 bg-[#E6F4F3]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center opacity-80"
                aria-hidden
              />
              <button
                type="button"
                onClick={onClose}
                className="absolute left-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <div className="relative text-right">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {title}
                </h2>
                <p className="mt-1 font-cairo text-[13px] font-bold text-primary/80">
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
              <div className="space-y-5">
                <Field label="اسم المنشأة" required>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="أدخل اسم المنشأة"
                    className={inputClass}
                  />
                </Field>

                <Field label="الوصف">
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="أدخل وصف المنشأة"
                    className={textareaClass}
                  />
                </Field>

                <div>
                  <h3 className="mb-3 text-right font-cairo text-[14px] font-extrabold text-[#111827]">
                    الموقع
                  </h3>
                  <div className="space-y-4">
                    <Field label="المدينة" required>
                      <input
                        value={form.city}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, city: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="العنوان" required>
                      <input
                        value={form.address}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        placeholder="أدخل العنوان التفصيلي"
                        className={inputClass}
                      />
                    </Field>
                    <div className="flex h-[180px] items-center justify-center rounded-[12px] border border-dashed border-[#D1FAE5] bg-[#FAFAFA] font-cairo text-[13px] font-semibold text-[#98A2B3]">
                      [ Map Picker ]
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-right font-cairo text-[14px] font-extrabold text-[#111827]">
                    التواصل
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="الهاتف" required>
                      <input
                        value={form.phone}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="09xxxxxxxx"
                        className={inputClass}
                        dir="ltr"
                      />
                    </Field>
                    <Field label="البريد الإلكتروني">
                      <input
                        value={form.email}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="email@example.com"
                        className={inputClass}
                        dir="ltr"
                      />
                    </Field>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-right font-cairo text-[14px] font-extrabold text-[#111827]">
                    ساعات العمل
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="من" required>
                      <input
                        type="time"
                        value={form.workHoursFrom}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            workHoursFrom: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="إلى" required>
                      <input
                        type="time"
                        value={form.workHoursTo}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            workHoursTo: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.active}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, active: !prev.active }))
                    }
                    className={
                      form.active
                        ? 'relative h-7 w-12 rounded-full bg-primary transition'
                        : 'relative h-7 w-12 rounded-full bg-[#D0D5DD] transition'
                    }
                  >
                    <span
                      className={
                        form.active
                          ? 'absolute end-1 top-1 h-5 w-5 rounded-full bg-white shadow transition'
                          : 'absolute start-1 top-1 h-5 w-5 rounded-full bg-white shadow transition'
                      }
                    />
                  </button>
                  <span className="font-cairo text-[13px] font-extrabold text-[#667085]">
                    {form.active ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-[#EEF2F6] px-8 py-5">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => onSubmit(form)}
                className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white"
              >
                <Save className="h-4 w-4" aria-hidden />
                حفظ
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
