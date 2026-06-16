'use client';

import { useEffect, useState } from 'react';
import StyledSelect from '@/components/ui/styled-select';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import type { AppointmentType } from '@/lib/doctor/types';
import type { WaitlistBookBody, WaitlistRequest } from '@/lib/doctor/waitlist/types';
import {
  resolveWaitlistPatientName,
} from '@/hooks/doctor/useDoctorWaitlist';

export function WaitlistBookDialog({
  open,
  request,
  appointmentTypes,
  busy,
  onClose,
  onBook,
}: {
  open: boolean;
  request: WaitlistRequest | null;
  appointmentTypes: AppointmentType[];
  busy?: boolean;
  onClose: () => void;
  onBook: (body: WaitlistBookBody) => Promise<void>;
}) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [appointmentTypeId, setAppointmentTypeId] = useState('');
  const [notes, setNotes] = useState('Booked from waitlist');

  useEffect(() => {
    if (!open || !request) return;
    const preferred = request.preferredDateFrom
      ? new Date(request.preferredDateFrom).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    setDate(preferred);
    setStartTime(request.preferredTimeWindows?.[0]?.startTime ?? '09:00');
    setAppointmentTypeId('');
    setNotes('Booked from waitlist');
  }, [open, request]);

  if (!request) return null;

  const typeOptions = [
    { value: '', label: 'بدون نوع موعد (اختياري)' },
    ...appointmentTypes.map((type) => ({
      value: type._id,
      label: type.name?.trim() || type._id,
    })),
  ];

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title="حجز من قائمة الانتظار"
      maxWidthClass="max-w-[520px]"
    >
      <div dir="rtl" lang="ar" className="space-y-4 text-right">
        <p className="font-cairo text-[13px] font-semibold text-[#667085]">
          حجز موعد للمريض{' '}
          <span className="font-extrabold text-[#111827]">
            {resolveWaitlistPatientName(request)}
          </span>
        </p>

        <label className="block">
          <span className="mb-2 block font-cairo text-[12px] font-extrabold text-[#344054]">
            التاريخ
          </span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-11 w-full rounded-[8px] border border-[#E5E7EB] px-3 font-cairo text-[13px]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-cairo text-[12px] font-extrabold text-[#344054]">
            وقت البداية
          </span>
          <input
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className="h-11 w-full rounded-[8px] border border-[#E5E7EB] px-3 font-cairo text-[13px]"
          />
        </label>

        <div>
          <span className="mb-2 block font-cairo text-[12px] font-extrabold text-[#344054]">
            نوع الموعد
          </span>
          <StyledSelect
            size="sm"
            tone="muted"
            value={appointmentTypeId}
            onChange={setAppointmentTypeId}
            options={typeOptions}
            placeholder="اختر نوع الموعد"
            listboxAriaLabel="نوع الموعد"
            listboxZIndex={200}
          />
        </div>

        <label className="block">
          <span className="mb-2 block font-cairo text-[12px] font-extrabold text-[#344054]">
            ملاحظات
          </span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="w-full rounded-[8px] border border-[#E5E7EB] px-3 py-2 font-cairo text-[13px]"
          />
        </label>

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
            disabled={busy || !date || !startTime}
            onClick={() =>
              void onBook({
                date,
                startTime,
                appointmentTypeId: appointmentTypeId || undefined,
                notes: notes.trim() || undefined,
              })
            }
            className="h-11 rounded-[8px] bg-primary font-cairo text-[13px] font-extrabold text-white disabled:opacity-60"
          >
            {busy ? 'جارٍ الحجز...' : 'تأكيد الحجز'}
          </button>
        </div>
      </div>
    </ClinicAccountsModalShell>
  );
}
