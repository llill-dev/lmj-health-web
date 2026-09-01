'use client';

import { useState } from 'react';
import { AlertCircle, Clock, Loader2 } from 'lucide-react';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import {
  DoctorProfileFormField,
  profileInputClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import { useWaitlistSuggestions } from '@/hooks/doctor/waitlist/useDoctorWaitlist';
import { useI18n } from '@/i18n/provider';

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function WaitlistSuggestionsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { locale, dir, t } = useI18n();
  const today = formatLocalDate(new Date());

  const maxDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return formatLocalDate(d);
  })();

  const [selectedDate, setSelectedDate] = useState(today);

  const suggestions = useWaitlistSuggestions(
    { date: selectedDate, type: 'freeSlots' },
    open,
  );

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(`${dateStr}T12:00:00`);
      return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ar-SY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '—';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? t('doctor.waitlistSuggestions.pm') : t('doctor.waitlistSuggestions.am');
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${period}`;
    } catch {
      return time;
    }
  };

  const freeSlots = suggestions.data?.freeSlots ?? [];

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title={t('doctor.waitlistSuggestions.title')}
      maxWidthClass="max-w-[560px]"
      headerPattern
    >
      <div dir={dir} lang={locale} className="space-y-5 text-start">
        <p className="rounded-[12px] border border-[#E6F4F3] bg-[#F0FDFA] px-4 py-3 font-cairo text-[13px] font-semibold leading-relaxed text-[#667085]">
          {t('doctor.waitlistSuggestions.intro')}
        </p>

        <DoctorProfileFormField
          label={t('doctor.waitlistSuggestions.dateLabel')}
          required
          hint={formatDate(selectedDate)}
        >
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            min={today}
            max={maxDate}
            className={profileInputClass}
          />
        </DoctorProfileFormField>

        <div>
          <h3 className="mb-3 font-cairo text-[14px] font-extrabold text-[#111827]">
            {t('doctor.waitlistSuggestions.availableTimes')}
          </h3>

          {suggestions.isLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] py-10">
              <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
              <span className="font-cairo text-[13px] font-semibold text-[#667085]">
                {t('doctor.waitlistSuggestions.loading')}
              </span>
            </div>
          ) : suggestions.isError ? (
            <div className="flex items-start gap-2 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[#B42318]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p className="font-cairo text-[13px] font-semibold leading-relaxed">
                {t('doctor.waitlistSuggestions.loadError')}
              </p>
            </div>
          ) : freeSlots.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-5 py-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#E6F4F3]">
                <Clock className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <p className="font-cairo text-[13px] font-extrabold text-[#667085]">
                {t('doctor.waitlistSuggestions.noSlots')}
              </p>
              <p className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                {t('doctor.waitlistSuggestions.tryAnotherDate')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {freeSlots.map((slot, index) => (
                <div
                  key={`${slot.startTime}-${slot.endTime ?? index}`}
                  className="flex items-center gap-3 rounded-[12px] border border-[#0F8F8B]/20 bg-[#E6F4F3] px-4 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white shadow-sm">
                    <Clock className="h-4 w-4 text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 text-start">
                    <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
                      {formatTime(slot.startTime)}
                    </p>
                    {slot.endTime ? (
                      <p className="font-cairo text-[11px] font-semibold text-[#667085]">
                        {t('doctor.waitlistSuggestions.until')} {formatTime(slot.endTime)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[48px] w-full items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary transition hover:bg-[#F0FDFA]"
          >
            {t('doctor.waitlistSuggestions.close')}
          </button>
        </div>
      </div>
    </ClinicAccountsModalShell>
  );
}
