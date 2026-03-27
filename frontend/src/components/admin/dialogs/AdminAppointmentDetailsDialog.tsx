'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X, CalendarDays, Clock, User, Stethoscope, Ban } from 'lucide-react';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import CancelAppointmentDialog from '@/components/admin/dialogs/CancelAppointmentDialog';
import { useState } from 'react';

export default function AdminAppointmentDetailsDialog({
  open,
  onOpenChange,
  appointmentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string | null;
}) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const enabled = open && !!appointmentId;

  const detailsQuery = useQuery({
    queryKey: ['admin', 'appointment', appointmentId],
    queryFn: async () => adminApi.appointments.getDetails(String(appointmentId)),
    enabled,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (!open) return;
    setLastError(null);

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

  const appointment = detailsQuery.data?.appointment;

  return (
    <>
      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          onOpenChange(next);
          if (!next) setCancelOpen(false);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            forceMount
            asChild
          >
            <motion.div
              initial={false}
              animate={open ? 'open' : 'closed'}
              variants={{
                open: {
                  opacity: 1,
                  visibility: 'visible',
                  pointerEvents: 'auto',
                  transition: { duration: 0.22, ease: 'easeOut' },
                },
                closed: {
                  opacity: 0,
                  transition: { duration: 0.22, ease: 'easeOut' },
                  pointerEvents: 'none',
                  transitionEnd: { visibility: 'hidden' },
                },
              }}
              className='fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]'
              style={{ touchAction: 'none' }}
            />
          </Dialog.Overlay>

          <Dialog.Content
            forceMount
            asChild
          >
            <motion.div
              initial={false}
              animate={open ? 'open' : 'closed'}
              variants={{
                open: {
                  opacity: 1,
                  visibility: 'visible',
                  pointerEvents: 'auto',
                  transition: { duration: 0.18, ease: 'easeOut' },
                },
                closed: {
                  opacity: 0,
                  transition: { duration: 0.18, ease: 'easeOut' },
                  pointerEvents: 'none',
                  transitionEnd: { visibility: 'hidden' },
                },
              }}
              className='fixed left-1/2 top-1/2 z-[10000] w-[720px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none'
              dir='rtl'
              lang='ar'
            >
              <div className='relative px-8 pb-7 pt-7'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
                    aria-label='إغلاق'
                  >
                    <X className='h-5 w-5' />
                  </button>
                </Dialog.Close>

                <Dialog.Title className='text-right font-cairo text-[22px] font-extrabold leading-[28px] text-[#101828]'>
                  تفاصيل الموعد
                </Dialog.Title>

                {detailsQuery.isLoading ? (
                  <div className='mt-6 font-cairo text-[13px] font-semibold text-[#667085]'>
                    جارِ التحميل...
                  </div>
                ) : detailsQuery.isError ? (
                  <div className='mt-6 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[13px] font-bold text-[#991B1B]'>
                    تعذّر تحميل تفاصيل الموعد.
                  </div>
                ) : !appointment ? (
                  <div className='mt-6 font-cairo text-[13px] font-semibold text-[#667085]'>
                    لا توجد بيانات.
                  </div>
                ) : (
                  <>
                    <div className='mt-6 grid grid-cols-2 gap-4'>
                      <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4'>
                        <div className='flex items-center gap-2 text-primary'>
                          <CalendarDays className='h-4 w-4' />
                          <div className='font-cairo text-[12px] font-extrabold'>
                            التاريخ/الوقت
                          </div>
                        </div>
                        <div className='mt-3 space-y-2 font-cairo text-[12px] font-bold text-[#344054]'>
                          <div className='flex items-center gap-2'>
                            <Clock className='h-4 w-4 text-primary' />
                            <span>{appointment.startTime ?? '—'}</span>
                          </div>
                          <div className='text-[#667085]'>
                            {appointment.date ??
                              (appointment.startDateTime
                                ? new Date(appointment.startDateTime).toLocaleString()
                                : '—')}
                          </div>
                        </div>
                      </div>

                      <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4'>
                        <div className='flex items-center gap-2 text-primary'>
                          <Ban className='h-4 w-4' />
                          <div className='font-cairo text-[12px] font-extrabold'>
                            الحالة
                          </div>
                        </div>
                        <div className='mt-3 font-cairo text-[13px] font-extrabold text-[#111827]'>
                          {appointment.status}
                        </div>
                        {appointment.cancelReason ? (
                          <div className='mt-2 font-cairo text-[12px] font-semibold text-[#667085]'>
                            سبب الإلغاء: {appointment.cancelReason}
                          </div>
                        ) : null}
                      </div>

                      <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4'>
                        <div className='flex items-center gap-2 text-primary'>
                          <User className='h-4 w-4' />
                          <div className='font-cairo text-[12px] font-extrabold'>
                            المريض
                          </div>
                        </div>
                        <div className='mt-3 font-cairo text-[13px] font-extrabold text-[#111827]'>
                          {appointment.patient?.userId?.fullName ??
                            appointment.patient?.publicId ??
                            '—'}
                        </div>
                      </div>

                      <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4'>
                        <div className='flex items-center gap-2 text-primary'>
                          <Stethoscope className='h-4 w-4' />
                          <div className='font-cairo text-[12px] font-extrabold'>
                            الطبيب
                          </div>
                        </div>
                        <div className='mt-3 font-cairo text-[13px] font-extrabold text-[#111827]'>
                          {appointment.doctor?.userId?.fullName ?? '—'}
                        </div>
                        {appointment.doctor?.specialization ? (
                          <div className='mt-2 font-cairo text-[12px] font-semibold text-[#667085]'>
                            {appointment.doctor.specialization}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {lastError ? (
                      <div className='mt-5 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[13px] font-bold text-[#991B1B]'>
                        {lastError}
                      </div>
                    ) : null}

                    <div className='mt-6 flex items-center justify-end gap-3'>
                      <button
                        type='button'
                        onClick={() => setCancelOpen(true)}
                        className='inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#FB923C] bg-white px-5 font-cairo text-[12px] font-extrabold text-[#F97316]'
                      >
                        <Ban className='h-4 w-4' />
                        إلغاء الموعد
                      </button>

                      <Dialog.Close asChild>
                        <button
                          type='button'
                          className='h-[40px] rounded-[10px] bg-primary px-8 font-cairo text-[12px] font-extrabold text-white'
                        >
                          إغلاق
                        </button>
                      </Dialog.Close>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <CancelAppointmentDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        targetName={
          appointment?.patient?.userId?.fullName
            ? `المريض: ${appointment.patient.userId.fullName}`
            : 'الموعد'
        }
        onConfirm={async (reason) => {
          if (!appointmentId) return;
          setLastError(null);
          try {
            await adminApi.appointments.cancel(appointmentId, reason);
            // Refetch details to reflect cancelled state
            await detailsQuery.refetch();
          } catch (e: any) {
            setLastError(e?.message || 'فشل إلغاء الموعد');
          }
        }}
      />
    </>
  );
}

