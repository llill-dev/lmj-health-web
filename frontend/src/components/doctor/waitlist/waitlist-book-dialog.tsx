'use client';

import { AlertCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import {
  DoctorProfileFormField,
  profileInputClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import StyledSelect from '@/components/ui/styled-select';
import { useSlots } from '@/hooks/doctor/useSlots';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import type { AppointmentType } from '@/lib/doctor/types';
import type { WaitlistBookBody, WaitlistRequest } from '@/lib/doctor/waitlist/types';
import { resolveWaitlistPatientName } from '@/hooks/doctor/useDoctorWaitlist';

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isPastSlot(selectedDate: string, startTime: string) {
  const slotDateTime = new Date(`${selectedDate}T${startTime}:00`);
  return slotDateTime <= new Date();
}

function normalizeTime(value: string): string {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value.trim();
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export function WaitlistBookDialog({
  open,
  request,
  doctorId,
  appointmentTypes,
  busy,
  onClose,
  onBook,
}: {
  open: boolean;
  request: WaitlistRequest | null;
  doctorId?: string;
  appointmentTypes: AppointmentType[];
  busy?: boolean;
  onClose: () => void;
  onBook: (body: WaitlistBookBody) => Promise<void>;
}) {
  const today = useMemo(() => formatLocalDate(new Date()), []);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [appointmentTypeId, setAppointmentTypeId] = useState('');
  const [notes, setNotes] = useState('Booked from waitlist');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    freeSlots,
    totalFreeSlots,
    isAwaitingData: isAwaitingSlots,
    error: slotsError,
  } = useSlots(date, 'free', doctorId);

  const availableTimes = useMemo(() => {
    return freeSlots
      .filter((slot) => {
        if (!date || !slot.startTime) return false;
        if (date !== today) return true;
        return !isPastSlot(date, slot.startTime);
      })
      .map((slot) => slot.startTime as string);
  }, [date, freeSlots, today]);

  const timeOptions = useMemo(
    () =>
      availableTimes.map((time) => ({
        value: time,
        label: time,
      })),
    [availableTimes],
  );

  useEffect(() => {
    if (!open || !request) return;
    const preferred = request.preferredDateFrom
      ? new Date(request.preferredDateFrom).toISOString().slice(0, 10)
      : today;
    setDate(preferred >= today ? preferred : today);
    setStartTime('');
    setAppointmentTypeId('');
    setNotes('Booked from waitlist');
    setSubmitError(null);
  }, [open, request, today]);

  useEffect(() => {
    if (!open || !date) return;
    if (isAwaitingSlots) return;

    if (availableTimes.length === 0) {
      if (startTime !== '') setStartTime('');
      return;
    }

    if (!startTime || !availableTimes.includes(startTime)) {
      setStartTime(availableTimes[0]);
    }
  }, [availableTimes, date, isAwaitingSlots, open, startTime]);

  if (!request) return null;

  const typeOptions = [
    { value: '', label: 'بدون نوع موعد (اختياري)' },
    ...appointmentTypes.map((type) => ({
      value: type._id,
      label: type.name?.trim() || type._id,
    })),
  ];

  const slotsLoadError = slotsError
    ? getUserFacingRequestErrorMessage(slotsError)
    : null;

  const canSubmit =
    Boolean(date && startTime) &&
    !busy &&
    !isAwaitingSlots &&
    !slotsLoadError &&
    availableTimes.length > 0 &&
    availableTimes.includes(startTime);

  const handleSubmit = async () => {
    setSubmitError(null);
    try {
      await onBook({
        date,
        startTime: normalizeTime(startTime),
        appointmentTypeId: appointmentTypeId || undefined,
        notes: notes.trim() || undefined,
      });
    } catch (error) {
      setSubmitError(getUserFacingRequestErrorMessage(error));
    }
  };

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title="حجز من قائمة الانتظار"
      maxWidthClass="max-w-[520px]"
      headerPattern
    >
      <div dir="rtl" lang="ar" className="space-y-4 text-right">
        <p className="rounded-[12px] border border-[#E6F4F3] bg-[#F0FDFA] px-4 py-3 font-cairo text-[13px] font-semibold leading-relaxed text-[#667085]">
          حجز موعد للمريض{' '}
          <span className="font-extrabold text-[#111827]">
            {resolveWaitlistPatientName(request)}
          </span>
        </p>

        <DoctorProfileFormField label="التاريخ" required>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={profileInputClass}
          />
        </DoctorProfileFormField>

        <DoctorProfileFormField label="وقت البداية" required>
          {isAwaitingSlots ? (
            <p className="font-cairo text-[13px] font-semibold text-[#667085]">
              جارٍ تحميل الأوقات المتاحة...
            </p>
          ) : slotsLoadError ? (
            <p className="font-cairo text-[13px] font-semibold text-[#B42318]">
              {slotsLoadError}
            </p>
          ) : availableTimes.length === 0 ? (
            <p className="rounded-[10px] border border-dashed border-[#FECACA] bg-[#FEF2F2] px-3 py-2 font-cairo text-[13px] font-semibold text-[#B42318]">
              لا توجد أوقات متاحة في هذا التاريخ. اختر تاريخاً آخر أو راجع جدول
              العمل.
            </p>
          ) : (
            <StyledSelect
              size="sm"
              tone="muted"
              value={startTime}
              onChange={setStartTime}
              options={timeOptions}
              placeholder="اختر وقت الموعد"
              listboxAriaLabel="وقت البداية"
              listboxZIndex={200}
            />
          )}
          {!isAwaitingSlots && !slotsLoadError && availableTimes.length > 0 ? (
            <p className="mt-1.5 font-cairo text-[12px] font-semibold text-[#667085]">
              {totalFreeSlots} وقت متاح في هذا اليوم
            </p>
          ) : null}
        </DoctorProfileFormField>

        <DoctorProfileFormField label="نوع الموعد">
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
        </DoctorProfileFormField>

        <DoctorProfileFormField label="ملاحظات">
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className={`${profileInputClass} min-h-[96px] resize-y py-3`}
          />
        </DoctorProfileFormField>

        {submitError ? (
          <div className="flex items-start gap-2 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5 text-[#B42318]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p className="font-cairo text-[13px] font-semibold leading-relaxed">
              {submitError}
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 pt-1">
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
            disabled={!canSubmit}
            onClick={() => void handleSubmit()}
            className="inline-flex h-[48px] items-center justify-center rounded-[10px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_24px_-4px_rgba(15,143,139,0.35)] transition hover:bg-[#14B3AE] disabled:opacity-60"
          >
            {busy ? 'جارٍ الحجز...' : 'تأكيد الحجز'}
          </button>
        </div>
      </div>
    </ClinicAccountsModalShell>
  );
}
