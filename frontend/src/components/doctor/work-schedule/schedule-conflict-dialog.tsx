'use client';
import { AlertCircle, Calendar, Clock, ExternalLink } from 'lucide-react';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useI18n } from '@/i18n/provider';

// Helper function to format date
function formatDate(dateStr: string, format: string): string {
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (format === 'dd/MM/yyyy') {
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export interface ScheduleConflictData {
  totalConflicts: number;
  conflicts: Array<{
    appointmentId: string;
    date: string;
    startTime: string;
    endTime?: string;
  }>;
  operation: 'update_day' | 'delete_day' | 'replace_weekly_schedule' | 'update_slot';
  day?: string;
  nextAction?: string;
}

interface ScheduleConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ScheduleConflictData | null;
  onViewAppointments?: () => void;
  onForceUpdate?: () => void;
}

export default function ScheduleConflictDialog({
  open,
  onOpenChange,
  data,
  onViewAppointments,
  onForceUpdate,
}: ScheduleConflictDialogProps) {
  const { locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  if (!data) return null;

  const operationLabels = {
    update_day: tr('تحديث جدول اليوم', 'update this day schedule'),
    delete_day: tr('حذف اليوم', 'delete this day'),
    replace_weekly_schedule: tr(
      'استبدال الجدول الأسبوعي',
      'replace the weekly schedule',
    ),
    update_slot: tr('تحديث الفترة الزمنية', 'update this time slot'),
  };

  const conflictNoun =
    data.totalConflicts === 1
      ? tr('موعد محجوز', 'booked appointment')
      : data.totalConflicts === 2
        ? tr('موعدان محجوزان', 'booked appointments')
        : tr('مواعيد محجوزة', 'booked appointments');

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tr('تعارض في المواعيد المحجوزة', 'Booked appointment conflict')}
      description={tr(
        `لا يمكن ${operationLabels[data.operation]} لأن هناك ${data.totalConflicts} ${conflictNoun} ستتأثر بهذا التغيير.`,
        `Cannot ${operationLabels[data.operation]} because ${data.totalConflicts} ${conflictNoun} would be affected.`,
      )}
      variant="warning"
      icon={AlertCircle}
      maxWidth="680px"
      customActions={
        <div className='flex flex-row-reverse gap-3'>
          <button
            type='button'
            onClick={() => onOpenChange(false)}
            className='h-[46px] rounded-[10px] border border-[#D0D5DD] bg-[#F9FAFB] px-6 font-cairo text-[14px] font-extrabold text-[#344054] transition-colors hover:bg-[#F2F4F7]'
          >
            {tr('إلغاء', 'Cancel')}
          </button>

          {onViewAppointments && (
            <button
              type='button'
              onClick={() => {
                onViewAppointments();
                onOpenChange(false);
              }}
              className='flex h-[46px] items-center gap-2 rounded-[10px] bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] px-6 font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_24px_rgba(37,99,235,0.25)] transition-opacity hover:opacity-90'
            >
              <ExternalLink className='h-4 w-4' />
              {tr('عرض المواعيد', 'View appointments')}
            </button>
          )}

          {onForceUpdate && (
            <button
              type='button'
              onClick={() => {
                onForceUpdate();
                onOpenChange(false);
              }}
              className='h-[46px] rounded-[10px] bg-gradient-to-b from-[#DC2626] to-[#B91C1C] px-6 font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_24px_rgba(220,38,38,0.25)] transition-opacity hover:opacity-90'
            >
              {tr(
                'تطبيق التغيير وإشعار المرضى',
                'Apply change and notify patients',
              )}
            </button>
          )}
        </div>
      }
    >
      <h4 className='mb-3 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
        {tr('المواعيد المتعارضة:', 'Conflicting appointments:')}
      </h4>
      <div className='max-h-[300px] space-y-2 overflow-y-auto'>
        {data.conflicts.map((conflict, index) => (
          <div
            key={conflict.appointmentId}
            className='flex items-center justify-between rounded-[10px] border border-amber-200 bg-amber-50 p-3'
          >
            <div className='flex-1 text-right'>
              <div className='flex items-center justify-end gap-2'>
                <span className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                  {tr('موعد', 'Appointment')} #{index + 1}
                </span>
              </div>
              <div className='mt-1 flex items-center justify-end gap-3 font-cairo text-[12px] font-semibold text-[#667085]'>
                <span className='flex items-center gap-1'>
                  <Clock className='h-3 w-3' />
                  {conflict.startTime}
                  {conflict.endTime && ` - ${conflict.endTime}`}
                </span>
                <span className='flex items-center gap-1'>
                  <Calendar className='h-3 w-3' />
                  {formatDate(conflict.date, 'dd/MM/yyyy')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.nextAction && (
        <div className='mt-4 rounded-[10px] border border-blue-200 bg-blue-50 p-3 text-right'>
          <p className='font-cairo text-[13px] font-semibold text-blue-900'>
            <span className='font-extrabold'>
              {tr('الإجراء المطلوب:', 'Required action:')}
            </span>{' '}
            {data.nextAction}
          </p>
        </div>
      )}
    </ConfirmDialog>
  );
}
