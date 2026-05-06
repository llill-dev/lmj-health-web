import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useState } from 'react';
import {
  Info,
  Plus,
  Trash2,
  Clock,
  CalendarDays,
  Save,
  Coffee,
} from 'lucide-react';
import { useUpdateWorkSchedule, useWorkSchedule } from '@/hooks';
import AddExceptionDialog, {
  type ExceptionFormValues,
} from '@/components/doctor/work-schedule/add-exception-dialog';

type DayKey =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

type DaySchedule = {
  enabled: boolean;
  from: string;
  to: string;
};

type ExceptionItem = {
  id: string;
  title: string;
  date: string;
};

const days: Array<{ key: DayKey; label: string }> = [
  { key: 'sunday', label: 'الأحد' },
  { key: 'monday', label: 'الإثنين' },
  { key: 'tuesday', label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' },
  { key: 'friday', label: 'الجمعة' },
  { key: 'saturday', label: 'السبت' },
];

function buildTimeSlots(stepMinutes = 15) {
  const slots: string[] = [];
  for (let h = 0; h < 24; h += 1) {
    for (let m = 0; m < 60; m += stepMinutes) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function DoctorWorkSchedulePage() {
  const {
    workSchedule,
    isLoading: workScheduleLoading,
    error: workScheduleError,
    refetch,
  } = useWorkSchedule();
  const { updateWorkScheduleAsync, isLoading: saving } =
    useUpdateWorkSchedule();

  const [appointmentDuration, setAppointmentDuration] = useState('30');
  const [breakStart, setBreakStart] = useState('');
  const [breakEnd, setBreakEnd] = useState('');

  const timeSlots = useMemo(() => buildTimeSlots(15), []);

  const [weekly, setWeekly] = useState<Record<DayKey, DaySchedule>>({
    sunday: { enabled: true, from: '09:00', to: '17:00' },
    monday: { enabled: true, from: '09:00', to: '17:00' },
    tuesday: { enabled: true, from: '09:00', to: '17:00' },
    wednesday: { enabled: true, from: '09:00', to: '17:00' },
    thursday: { enabled: true, from: '09:00', to: '17:00' },
    friday: { enabled: false, from: '', to: '' },
    saturday: { enabled: false, from: '', to: '' },
  });

  const [exceptions, setExceptions] = useState<ExceptionItem[]>([
    { id: uid(), title: 'إجازة رسمية', date: '2024-12-25' },
  ]);

  const [isAddExceptionOpen, setIsAddExceptionOpen] = useState(false);

  useEffect(() => {
    if (!workSchedule) return;

    setAppointmentDuration(workSchedule.settings.appointmentDuration);
    setBreakStart(workSchedule.settings.breakStart);
    setBreakEnd(workSchedule.settings.breakEnd);

    setWeekly(workSchedule.weekly as unknown as Record<DayKey, DaySchedule>);
    setExceptions(workSchedule.exceptions as unknown as ExceptionItem[]);
  }, [workSchedule]);

  const handleAddExceptionSubmit = (values: ExceptionFormValues) => {
    setExceptions((prev) => [
      {
        id: uid(),
        title: values.reason,
        date: values.date,
      },
      ...prev,
    ]);
  };

  const handleSave = async () => {
    const payload = {
      settings: {
        appointmentDuration,
        breakStart,
        breakEnd,
      },
      weekly,
      exceptions,
    };

    try {
      await updateWorkScheduleAsync(payload as any);
    } catch {
      // UI stays as-is; errors surface via React Query
    }
  };

  const weekOverview = useMemo(() => {
    return days.map((d) => {
      const s = weekly[d.key];
      return {
        key: d.key,
        label: d.label,
        enabled: s.enabled,
        from: s.from,
        to: s.to,
      };
    });
  }, [weekly]);

  const workingDaysCount = useMemo(() => {
    return Object.values(weekly).filter((d) => d.enabled).length;
  }, [weekly]);

  return (
    <>
      <Helmet>
        <title>Work Schedule • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <AddExceptionDialog
          open={isAddExceptionOpen}
          onOpenChange={setIsAddExceptionOpen}
          onSubmit={handleAddExceptionSubmit}
        />

        {workScheduleError ? (
          <div className='mb-4 rounded-[14px] border border-[#FEE4E2] bg-[#FFF5F5] px-4 py-3'>
            <div className='flex items-center justify-between'>
              <div className='font-cairo text-[13px] font-bold text-[#B42318]'>
                فشل تحميل جدول العمل
              </div>
              <button
                type='button'
                onClick={() => refetch()}
                className='h-[32px] rounded-[10px] bg-[#F04438] px-4 font-cairo text-[12px] font-extrabold text-white'
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        ) : null}

        <section className='rounded-[16px] border-[1.82px] border-[#BFEDEC] bg-[#0F8F8B26] px-6 py-5'>
          <div className='flex items-start justify-start gap-2'>
            <div className='flex items-start gap-[16px]'>
              <Info className='h-[20px] w-[20px] text-primary' />
              <div className='space-y-[12px]'>
                <div className='font-cairo text-[16px] font-bold leading-[20px] text-primary'>
                  إدارة جدول المواعيد
                </div>
                <div className='font-cairo text-[16px] text-normal leading-[18px] text-primary'>
                  حدد أوقات العمل الأسبوعية، ويمكنك إضافة استثناءات لإنشاء
                  المواعيد المتاحة للحجز.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='mt-6 rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='text-right'>
            <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
              إعدادات الموعيد
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
              تحديد مدة الموعد ووقت الاستراحة
            </div>
          </div>

          <div className='mt-5 grid grid-cols-3 gap-4'>
            <div>
              <div className='flex mb-2 items-center gap-1'>
                <Clock className='w-[16px] h-[16px] text-primary' />
                <div className=' text-right font-cairo text-[12px] font-bold text-[#344054]'>
                  مدة الموعد (دقيقة)
                </div>
              </div>
              <div className='relative'>
                <select
                  value={appointmentDuration}
                  onChange={(e) => setAppointmentDuration(e.target.value)}
                  className='h-[40px] w-full rounded-[6px] border-[1.82px] border-primary bg-[#FFFFFF] px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary'
                >
                  <option value='15'>15 دقيقة</option>
                  <option value='30'>30 دقيقة</option>
                  <option value='45'>45 دقيقة</option>
                  <option value='60'>60 دقيقة</option>
                </select>
              </div>
            </div>

            <div>
              <div className='flex mb-2 items-center gap-1'>
                <Coffee className='w-[16px] h-[16px] text-primary' />
                <div className='text-right font-cairo text-[12px] font-bold text-[#344054]'>
                  بداية الاستراحة
                </div>
              </div>
              <div className='relative'>
                <select
                  value={breakStart}
                  onChange={(e) => setBreakStart(e.target.value)}
                  className='h-[40px] w-full rounded-[6px] border-[1.82px] border-primary bg-[#FFFFFF] px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary'
                >
                  <option value=''>—</option>
                  {timeSlots.map((t) => (
                    <option
                      key={t}
                      value={t}
                    >
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className='flex mb-2 items-center gap-1'>
                <Coffee className='w-[16px] h-[16px] text-primary' />
                <div className='text-right font-cairo text-[12px] font-bold text-[#344054]'>
                  نهاية الاستراحة
                </div>
              </div>
              <div className='relative'>
                <select
                  value={breakEnd}
                  onChange={(e) => setBreakEnd(e.target.value)}
                  className='h-[40px] w-full rounded-[6px] border-[1.82px] border-primary bg-[#FFFFFF] px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary'
                >
                  <option value=''>—</option>
                  {timeSlots.map((t) => (
                    <option
                      key={t}
                      value={t}
                    >
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className='mt-6 rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-start justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                أيام وساعات العمل
              </div>
              <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                حدد أيام العمل وأوقاتك لكل يوم
              </div>
            </div>
          </div>

          <div className='mt-5 space-y-3'>
            {days.map((d) => {
              const value = weekly[d.key];
              return (
                <div
                  key={d.key}
                  className='flex items-center justify-between rounded-[14px] border border-[#EEF2F6] bg-white px-4 py-3'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={
                        value.enabled
                          ? 'flex h-[28px] items-center justify-center rounded-[10px] bg-primary px-3 font-cairo text-[12px] font-extrabold text-white'
                          : 'flex h-[28px] items-center justify-center rounded-[10px] bg-[#F2F4F7] px-3 font-cairo text-[12px] font-extrabold text-[#667085]'
                      }
                    >
                      {d.label}
                    </div>

                    {value.enabled ? (
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                          <span>من</span>
                          <input
                            type='time'
                            value={value.from}
                            onChange={(e) =>
                              setWeekly((prev) => ({
                                ...prev,
                                [d.key]: {
                                  ...prev[d.key],
                                  from: e.target.value,
                                },
                              }))
                            }
                            className='h-[28px] w-[86px] rounded-[8px] border border-primary bg-white px-2 font-cairo text-[12px] font-extrabold text-[#111827] outline-none'
                          />
                        </div>
                        <div className='flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                          <span>إلى</span>
                          <input
                            type='time'
                            value={value.to}
                            onChange={(e) =>
                              setWeekly((prev) => ({
                                ...prev,
                                [d.key]: {
                                  ...prev[d.key],
                                  to: e.target.value,
                                },
                              }))
                            }
                            className='h-[28px] w-[86px] rounded-[8px] border border-primary bg-white px-2 font-cairo text-[12px] font-extrabold text-[#111827] outline-none'
                          />
                        </div>
                      </div>
                    ) : (
                      <div className='font-cairo text-[12px] font-bold text-[#98A2B3]'>
                        يوم إجازة
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className='mt-5 flex justify-end'>
            <button
              type='button'
              onClick={handleSave}
              disabled={saving || workScheduleLoading}
              className='flex h-[40px] items-center justify-center gap-2 rounded-[6px] bg-primary px-5 font-cairo text-[13px] font-extrabold text-white shadow-[0_14px_24px_rgba(15, 143, 139,0.25)]'
            >
              <Save className='h-4 w-4' />
              {saving ? 'جارٍ الحفظ...' : 'حفظ الجدول'}
            </button>
          </div>
        </section>

        <section className='mt-6 rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-start justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                الاستثناءات والإجازات
              </div>
              <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                إضافة أيام غير متاحة أو إجازات خاصة
              </div>
            </div>

            <button
              type='button'
              onClick={() => setIsAddExceptionOpen(true)}
              className='flex h-[34px] items-center justify-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054]'
            >
              <Plus className='h-4 w-4' />
              إضافة استثناء
            </button>
          </div>

          <div className='mt-5 space-y-3'>
            {exceptions.map((ex) => (
              <div
                key={ex.id}
                className='flex items-center justify-between rounded-[14px] border border-[#EEF2F6] bg-white px-4 py-3'
              >
                <div className='flex flex-1 items-center justify-start gap-3'>
                  <div className='flex items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2'>
                    <Clock className='h-4 w-4 text-primary' />
                    <input
                      type='text'
                      value={ex.title}
                      onChange={(e) =>
                        setExceptions((prev) =>
                          prev.map((p) =>
                            p.id === ex.id
                              ? { ...p, title: e.target.value }
                              : p,
                          ),
                        )
                      }
                      className='h-[20px] w-[220px] bg-transparent font-cairo text-[12px] font-extrabold text-[#111827] outline-none'
                    />
                  </div>
                  <div className='flex items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2'>
                    <CalendarDays className='h-4 w-4 text-primary' />
                    <input
                      type='date'
                      value={ex.date}
                      onChange={(e) =>
                        setExceptions((prev) =>
                          prev.map((p) =>
                            p.id === ex.id ? { ...p, date: e.target.value } : p,
                          ),
                        )
                      }
                      className='h-[20px] w-[140px] bg-transparent font-cairo text-[12px] font-extrabold text-[#111827] outline-none'
                    />
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() =>
                    setExceptions((prev) => prev.filter((p) => p.id !== ex.id))
                  }
                  className='flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#FEF3F2] text-[#F04438]'
                  aria-label='حذف'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className='mt-6 rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='text-right'>
            <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
              نظرة عامة على الأسبوع
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
              ملخص جدول العمل الأسبوعي
            </div>
          </div>

          <div className='mt-5 grid grid-cols-7 gap-2'>
            {weekOverview.map((d) => (
              <div
                key={d.key}
                className={
                  d.enabled
                    ? 'rounded-[6px] border border-[#BFEDEC] bg-[#F2FFFE] px-3 py-3 text-right'
                    : 'rounded-[6px] border border-[#EEF2F6] bg-white px-3 py-3 text-right'
                }
              >
                <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                  {d.label}
                </div>
                {d.enabled ? (
                  <>
                    <div className='mt-2 font-cairo text-[11px] font-bold text-primary'>
                      {d.from} - {d.to}
                    </div>
                    <div className='mt-2 inline-flex h-[20px] items-center justify-center rounded-full bg-primary px-2 font-cairo text-[11px] font-extrabold text-white'>
                      متاح
                    </div>
                  </>
                ) : (
                  <div className='mt-2 inline-flex h-[20px] items-center justify-center rounded-full bg-[#F2F4F7] px-2 font-cairo text-[11px] font-extrabold text-[#667085]'>
                    إجازة
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className='mt-4 rounded-[6px] bg-[#0F8F8B26] px-[16px] py-[16px]'>
            <div className='flex items-start justify-between'>
              <div className='text-right'>
                <div className='flex items-start gap-4'>
                  <Info className='h-4 w-4 text-primary' />
                  <div className='space-y-[12px]'>
                    <div className='font-cairo text-[1epx] font-bold text-primary leading-[20px]'>
                      معلومات إضافية:
                    </div>
                    <nav className='mt-2 font-cairo text-[12px] font-semibold leading-[18px] text-[#667085]'>
                      <li className='text-[14px] leading-[20px] text-primary'>
                        مدة كل الموعد : {appointmentDuration} دقيقة
                      </li>
                      <li className='text-[14px] leading-[20px] text-primary'>
                        وقت الاستراحة :{' '}
                        {breakStart && breakEnd
                          ? `${breakStart} - ${breakEnd}`
                          : '—'}
                      </li>
                      <li className='text-[14px] leading-[20px] text-primary'>
                        عدد ايام العمل : {workingDaysCount} أيام
                      </li>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
