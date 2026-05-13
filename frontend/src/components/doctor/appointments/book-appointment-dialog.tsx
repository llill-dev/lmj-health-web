'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Clock3,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAvailableAppointmentTypes } from '@/hooks/doctor';
import { useSlots } from '@/hooks';
import { getUserFacingRequestErrorMessage } from '@/lib/api';

export type BookAppointmentValues = {
  patientId: string;
  date: string;
  time: string;
  consultationType: 'clinic' | 'video';
  appointmentTypeId?: string;
  notes?: string;
};

const bookAppointmentSchema = z.object({
  patientId: z.string().min(1, 'يرجى اختيار المريض.'),
  date: z
    .string()
    .min(1, 'يرجى اختيار تاريخ الموعد.')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'صيغة التاريخ غير صحيحة.'),
  time: z
    .string()
    .min(1, 'يرجى اختيار وقت الموعد.')
    .regex(/^\d{2}:\d{2}$/, 'صيغة الوقت غير صحيحة.'),
  consultationType: z.enum(['clinic', 'video'], {
    message: 'يرجى تحديد نوع الاستشارة.',
  }),
  appointmentTypeId: z.string().optional(),
  notes: z
    .string()
    .max(500, 'الحد الأقصى للملاحظات هو 500 حرف.')
    .optional(),
});

type BookAppointmentFormValues = z.infer<typeof bookAppointmentSchema>;

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

export default function BookAppointmentDialog({
  open,
  onOpenChange,
  patients,
  onSubmit,
  doctorId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: { id: string; name: string }[];
  onSubmit: (values: BookAppointmentValues) => Promise<void>;
  doctorId?: string;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<BookAppointmentFormValues>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: {
      patientId: '',
      date: '',
      time: '',
      consultationType: 'clinic',
      appointmentTypeId: '',
      notes: '',
    },
  });

  const selectedPatientId = watch('patientId');
  const selectedDate = watch('date');
  const selectedTime = watch('time');
  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId),
    [patients, selectedPatientId],
  );

  const { appointmentTypes, isLoading: isLoadingTypes } =
    useAvailableAppointmentTypes(doctorId);
  const today = useMemo(() => formatLocalDate(new Date()), []);
  const {
    freeSlots,
    totalFreeSlots,
    isLoading: isLoadingSlots,
    error: slotsError,
  } = useSlots(selectedDate, 'free', doctorId);
  const availableTimes = useMemo(() => {
    return freeSlots
      .filter((slot) => {
        if (!selectedDate) return false;
        if (selectedDate !== today) return true;
        return !isPastSlot(selectedDate, slot.startTime);
      })
      .map((slot) => slot.startTime);
  }, [freeSlots, selectedDate, today]);
  const isSelectedTimeAvailable =
    !selectedTime || availableTimes.includes(selectedTime);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  useEffect(() => {
    if (!selectedDate) {
      if (selectedTime !== '') {
        setValue('time', '', { shouldValidate: true });
      }
      return;
    }
    if (selectedTime && !availableTimes.includes(selectedTime)) {
      setValue('time', '', { shouldValidate: true });
    }
  }, [availableTimes, selectedDate, selectedTime, setValue]);

  const resetForm = () => {
    setSubmitError(null);
    reset({
      patientId: '',
      date: '',
      time: '',
      consultationType: 'clinic',
      appointmentTypeId: '',
      notes: '',
    });
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) resetForm();
      }}
    >
      <Dialog.Portal>
        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-[9999]'
            >
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={{ opacity: 1, backdropFilter: 'blur(6px)' }}
                  exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className='absolute inset-0 bg-[radial-gradient(circle_at_top,#0f8f8b24,transparent_35%),rgba(15,23,42,0.5)]'
                />
              </Dialog.Overlay>

              <Dialog.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, x: '-50%', y: 'calc(-50% + 42px)', scale: 0.94, rotateX: -6 }}
                  animate={{ opacity: 1, x: '-50%', y: '-50%', scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, x: '-50%', y: 'calc(-50% + 24px)', scale: 0.97, rotateX: -3 }}
                  transition={{
                    type: 'spring',
                    stiffness: 340,
                    damping: 28,
                    mass: 0.9,
                  }}
                  className='fixed left-1/2 top-1/2 z-[10000] flex w-[720px] max-h-[calc(100vh-56px)] max-w-[calc(100vw-28px)] flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_30px_90px_rgba(2,6,23,0.28)] outline-none'
                  dir='rtl'
                  lang='ar'
                  style={{ transformOrigin: 'center top' }}
                >
                  <div className='relative overflow-hidden bg-[linear-gradient(135deg,#0f8f8b_0%,#14b8a6_62%,#dff8f6_100%)] px-8 pb-7 pt-7 text-white'>
                    <div className='absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl' />
                    <div className='absolute -bottom-14 right-8 h-28 w-28 rounded-full bg-[#083344]/20 blur-2xl' />

                    <Dialog.Close asChild>
                      <button
                        type='button'
                        className='absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white transition hover:bg-white/20 hover:scale-105'
                        aria-label='إغلاق'
                      >
                        <X className='h-5 w-5' />
                      </button>
                    </Dialog.Close>

                    <div className='relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8'>
                      <div className='max-w-[440px] pr-12 text-right lg:pr-0'>
                        <Dialog.Title className='font-cairo text-[24px] font-black leading-[30px]'>
                          حجز موعد جديد
                        </Dialog.Title>
                        <p className='mt-2 font-cairo text-[13px] font-semibold leading-6 text-white/85'>
                          اختر المريض والتاريخ والوقت المناسب، ثم أكد الحجز ليتم إنشاء الموعد مباشرة في جدول الطبيب.
                        </p>
                      </div>

                      <div className='grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-3 lg:gap-2'>
                        <div className='rounded-2xl border border-white/15 bg-white/12 px-3 py-3'>
                          <div className='flex items-center justify-end gap-2 text-[11px] font-bold text-white/80'>
                            <span>المريض</span>
                            <UserRound className='h-3.5 w-3.5' />
                          </div>
                          <div className='mt-2 font-cairo text-[13px] font-extrabold text-white'>
                            {selectedPatient?.name ?? 'غير محدد'}
                          </div>
                        </div>

                        <div className='rounded-2xl border border-white/15 bg-white/12 px-3 py-3'>
                          <div className='flex items-center justify-end gap-2 text-[11px] font-bold text-white/80'>
                            <span>التاريخ</span>
                            <CalendarDays className='h-3.5 w-3.5' />
                          </div>
                          <div className='mt-2 font-cairo text-[13px] font-extrabold text-white'>
                            {selectedDate || '—'}
                          </div>
                        </div>

                        <div className='rounded-2xl border border-white/15 bg-white/12 px-3 py-3 sm:col-span-2 lg:col-span-1'>
                          <div className='flex items-center justify-end gap-2 text-[11px] font-bold text-white/80'>
                            <span>الوقت</span>
                            <Clock3 className='h-3.5 w-3.5' />
                          </div>
                          <div className='mt-2 font-cairo text-[13px] font-extrabold text-white'>
                            {selectedTime || '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form
                    className='min-h-0 flex-1 overflow-y-auto px-8 pb-8 pt-7 [scrollbar-color:#0f8f8b_#dff6f5] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-track]:bg-[#E6F7F6] [&::-webkit-scrollbar]:w-2'
                    onSubmit={handleSubmit(async (values) => {
                      setSubmitError(null);
                      try {
                        await onSubmit({
                          patientId: values.patientId,
                          date: values.date,
                          time: values.time,
                          consultationType: values.consultationType,
                          appointmentTypeId:
                            values.appointmentTypeId?.trim() || undefined,
                          notes: values.notes?.trim()
                            ? values.notes.trim()
                            : undefined,
                        });
                        onOpenChange(false);
                        resetForm();
                      } catch (error) {
                        setSubmitError(getUserFacingRequestErrorMessage(error));
                      }
                    })}
                  >
                    <div className='space-y-5'>
                      {submitError ? (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className='flex items-start gap-3 rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-4 text-right'
                        >
                          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]' />
                          <div>
                            <div className='font-cairo text-[13px] font-extrabold text-[#991B1B]'>
                              تعذر إتمام الحجز
                            </div>
                            <div className='mt-1 font-cairo text-[12px] font-semibold leading-6 text-[#B42318]'>
                              {submitError}
                            </div>
                          </div>
                        </motion.div>
                      ) : null}

                      <div>
                        <div className='mb-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                          اختر المريض
                        </div>
                        <div className='relative'>
                          <select
                            {...register('patientId')}
                            className={`h-[48px] w-full appearance-none rounded-[16px] border-[1.82px] ${
                              errors.patientId ? 'border-[#F04438]' : 'border-primary/60'
                            } bg-white px-4 font-cairo text-[13px] font-extrabold text-[#111827] outline-none`}
                          >
                            <option value='' disabled>
                              اختر...
                            </option>
                            {patients.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                          <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]'>
                            <ChevronDown className='h-4 w-4' />
                          </div>
                        </div>
                        {errors.patientId ? (
                          <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                            {errors.patientId.message}
                          </div>
                        ) : null}
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <div className='mb-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                            التاريخ
                          </div>
                          <input
                            type='date'
                            {...register('date')}
                            min={today}
                            className={`h-[48px] w-full rounded-[16px] border-[1.82px] ${
                              errors.date ? 'border-[#F04438]' : 'border-primary/60'
                            } bg-white px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none`}
                          />
                          {errors.date ? (
                            <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                              {errors.date.message}
                            </div>
                          ) : null}
                        </div>

                        <div>
                          <div className='mb-2 flex items-center justify-between gap-3'>
                            <div className='text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                              الوقت المتاح
                            </div>
                            {selectedDate ? (
                              <div className='font-cairo text-[11px] font-bold text-[#667085]'>
                                {isLoadingSlots
                                  ? 'جارٍ تحميل الفترات...'
                                  : `${totalFreeSlots} فترات متاحة`}
                              </div>
                            ) : null}
                          </div>

                          <div
                            className={`rounded-[16px] border-[1.82px] ${
                              errors.time || !isSelectedTimeAvailable
                                ? 'border-[#F04438]'
                                : 'border-primary/60'
                            } bg-white p-3`}
                          >
                            {!selectedDate ? (
                              <div className='rounded-[12px] bg-[#F9FAFB] px-4 py-4 text-right font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                                اختر التاريخ أولاً حتى تظهر لك المواعيد المتاحة فقط.
                              </div>
                            ) : isLoadingSlots ? (
                              <div className='rounded-[12px] bg-[#F9FAFB] px-4 py-4 text-right font-cairo text-[12px] font-semibold text-[#667085]'>
                                جارٍ تحميل الأوقات المتاحة...
                              </div>
                            ) : slotsError ? (
                              <div className='rounded-[12px] bg-[#FEF2F2] px-4 py-4 text-right font-cairo text-[12px] font-semibold text-[#B42318]'>
                                تعذر تحميل الأوقات المتاحة لهذا التاريخ.
                              </div>
                            ) : availableTimes.length === 0 ? (
                              <div className='rounded-[12px] bg-[#FFF7ED] px-4 py-4 text-right font-cairo text-[12px] font-semibold text-[#C2410C]'>
                                لا توجد أوقات متاحة في هذا التاريخ. اختر تاريخاً آخر.
                              </div>
                            ) : (
                              <div className='space-y-3'>
                                <div className='relative'>
                                  <select
                                    {...register('time')}
                                    className={`h-[48px] w-full appearance-none rounded-[14px] border bg-white px-4 font-cairo text-[13px] font-extrabold text-[#111827] outline-none ${
                                      errors.time || !isSelectedTimeAvailable
                                        ? 'border-[#F04438]'
                                        : 'border-[#D0D5DD]'
                                    }`}
                                  >
                                    <option value=''>اختر وقتاً متاحاً...</option>
                                    {availableTimes.map((time) => (
                                      <option key={time} value={time}>
                                        {time}
                                      </option>
                                    ))}
                                  </select>
                                  <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]'>
                                    <ChevronDown className='h-4 w-4' />
                                  </div>
                                </div>

                                <div className='max-h-[160px] space-y-2 overflow-y-auto rounded-[12px] bg-[#F9FAFB] p-2'>
                                  {availableTimes.map((time) => {
                                    const active = selectedTime === time;
                                    return (
                                      <button
                                        key={time}
                                        type='button'
                                        onClick={() =>
                                          setValue('time', time, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                          })
                                        }
                                        className={`flex h-[42px] w-full items-center justify-between rounded-[10px] px-3 font-cairo text-[13px] font-extrabold transition ${
                                          active
                                            ? 'bg-primary text-white shadow-[0_10px_18px_rgba(15,143,139,0.20)]'
                                            : 'bg-white text-[#344054] hover:bg-[#F2FFFE]'
                                        }`}
                                      >
                                        <span>{active ? 'محدد' : 'متاح'}</span>
                                        <span>{time}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {errors.time ? (
                            <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                              {errors.time.message}
                            </div>
                          ) : !isSelectedTimeAvailable ? (
                            <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                              الوقت المحدد لم يعد متاحاً. اختر وقتاً من الأوقات المتاحة.
                            </div>
                          ) : (
                            <div className='mt-2 text-right font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                              تظهر لك فقط الأوقات القادمة والمتاحة حسب جدول الطبيب والـ slots الفعلية.
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className='mb-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                          نوع الاستشارة
                        </div>
                        <div className='relative'>
                          <select
                            {...register('consultationType')}
                            className={`h-[48px] w-full appearance-none rounded-[16px] border-[1.82px] ${
                              errors.consultationType
                                ? 'border-[#F04438]'
                                : 'border-primary/60'
                            } bg-white px-4 font-cairo text-[13px] font-extrabold text-[#111827] outline-none`}
                          >
                            <option value='clinic'>حضوري</option>
                            <option value='video'>أونلاين</option>
                          </select>
                          <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]'>
                            <ChevronDown className='h-4 w-4' />
                          </div>
                        </div>
                      </div>

                      {appointmentTypes.length > 0 ? (
                        <div>
                          <div className='mb-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                            نوع الموعد
                          </div>
                          <div className='relative'>
                            <select
                              {...register('appointmentTypeId')}
                              disabled={isLoadingTypes}
                              className='h-[48px] w-full appearance-none rounded-[16px] border-[1.82px] border-primary/60 bg-white px-4 font-cairo text-[13px] font-extrabold text-[#111827] outline-none disabled:cursor-not-allowed disabled:opacity-50'
                            >
                              <option value=''>بدون تحديد نوع</option>
                              {appointmentTypes.map((type) => (
                                <option key={type._id} value={type._id}>
                                  {type.name}
                                  {type.priceVisibleToPatient && type.price
                                    ? ` - ${type.price}`
                                    : ''}
                                </option>
                              ))}
                            </select>
                            <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]'>
                              <ChevronDown className='h-4 w-4' />
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div>
                        <div className='mb-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                          ملاحظات
                        </div>
                        <textarea
                          {...register('notes')}
                          placeholder='أضف ملاحظات داخلية للطبيب أو السكرتيرة...'
                          className={`min-h-[104px] w-full resize-none rounded-[16px] border-[1.82px] ${
                            errors.notes ? 'border-[#F04438]' : 'border-primary/60'
                          } bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]`}
                        />
                        {errors.notes ? (
                          <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                            {errors.notes.message}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className='mt-7 grid grid-cols-2 gap-4'>
                      <Dialog.Close asChild>
                        <button
                          type='button'
                          className='h-[50px] w-full rounded-[16px] border border-[#D0D5DD] bg-[#F9FAFB] font-cairo text-[14px] font-extrabold text-[#344054] transition hover:bg-[#F2F4F7]'
                        >
                          إلغاء
                        </button>
                      </Dialog.Close>

                      <button
                        type='submit'
                        disabled={isSubmitting}
                        className='h-[50px] w-full rounded-[16px] bg-[linear-gradient(135deg,#0f8f8b_0%,#14b8a6_100%)] font-cairo text-[14px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.28)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60'
                      >
                        {isSubmitting ? 'جارٍ إنشاء الموعد...' : 'تأكيد الحجز'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </Dialog.Content>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
