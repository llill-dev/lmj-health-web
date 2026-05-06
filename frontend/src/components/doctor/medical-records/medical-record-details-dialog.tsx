'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  ClipboardList,
  Heart,
  Info,
  Stethoscope,
  X,
} from 'lucide-react';
import { useEffect } from 'react';

export type MedicalRecordPrescription = {
  name: string;
  dosage: string;
  duration: string;
  frequency: string;
  notes: string;
};

export type MedicalRecordDetails = {
  id: string;
  patientName: string;
  date: string;
  diagnosisSubtitle: string;
  symptoms: string[];
  vitals: { label: string; value: string }[];
  medicinesCount: number;
  prescriptions: MedicalRecordPrescription[];
  followUpDate: string;
  additionalNotes: string;
};

function getVitalCardStyle(label: string): {
  wrapper: string;
  label: string;
  value: string;
} {
  const key = label.trim();
  if (key.includes('الوزن')) {
    return {
      wrapper: 'bg-[#EEF6FF] text-right',
      label: 'text-[#2563EB]',
      value: 'text-[#1D4ED8]',
    };
  }
  if (key.includes('الحرارة')) {
    return {
      wrapper: 'bg-[#FFF7ED] text-right',
      label: 'text-[#F97316]',
      value: 'text-[#9A3412]',
    };
  }
  if (key.includes('النبض')) {
    return {
      wrapper: 'bg-[#FFF1F3] text-right',
      label: 'text-[#F43F5E]',
      value: 'text-[#BE123C]',
    };
  }
  if (key.includes('ضغط')) {
    return {
      wrapper: 'bg-[#F5F3FF] text-right',
      label: 'text-[#7C3AED]',
      value: 'text-[#6D28D9]',
    };
  }
  return {
    wrapper: 'bg-[#F9FAFB] text-right',
    label: 'text-[#98A2B3]',
    value: 'text-[#111827]',
  };
}

export default function MedicalRecordDetailsDialog({
  open,
  onOpenChange,
  record,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: MedicalRecordDetails | null;
}) {
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

  if (!record) return null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
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
            className='fixed left-1/2 top-1/2 z-[10000] w-[720px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[6px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none'
            dir='rtl'
            lang='ar'
          >
            <motion.div
              initial={false}
              animate={open ? 'open' : 'closed'}
              variants={{
                open: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 520, damping: 38 },
                },
                closed: {
                  opacity: 0,
                  y: 24,
                  scale: 0.96,
                  transition: { duration: 0.22, ease: 'easeOut' },
                },
              }}
              style={{ transformOrigin: 'center' }}
            >
              <div className='relative px-8 pt-7'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
                    aria-label='إغلاق'
                  >
                    <X className='h-5 w-5' />
                  </button>
                </Dialog.Close>

                <Dialog.Title className='text-right font-cairo text-[20px] font-extrabold leading-[28px] text-[#101828]'>
                  تفاصيل السجل الطبي
                </Dialog.Title>
              </div>

              <div className='mt-6 h-px w-full bg-[#EEF2F6]' />

              <div className='max-h-[calc(100vh-220px)] overflow-auto px-8 pb-6 pt-6'>
                <div className='rounded-[6px] bg-gradient-to-r from-[#F0FDF4] to-[#ECFDF5] px-5 py-4'>
                  <div className='flex items-center justify-start gap-4'>
                    <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-primary text-white font-bold'>
                      {record.patientName[0]}
                    </div>
                    <div className='text-right'>
                      <div className='font-cairo text-[14px] font-extrabold text-[#101828]'>
                        {record.patientName}
                      </div>
                      <div className='mt-1 flex items-center justify-start gap-2 font-cairo text-[12px] font-semibold text-[#667085]'>
                        <Calendar className='w-3 h-3' />
                        <span>{record.date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='mt-6'>
                  <div className='mb-2 flex items-center justify-start gap-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                    <Stethoscope className='h-4 w-4 text-[#2563EB]' />
                    التشخيص
                  </div>
                  <div className='rounded-[6px] bg-[#EEF6FF] px-5 py-4 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                    {record.diagnosisSubtitle}
                  </div>
                </div>

                <div className='mt-6'>
                  <div className='mb-2 flex items-center justify-start gap-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                    <Activity className='h-4 w-4 text-[#F04438]' />
                    الأعراض
                  </div>
                  <div className='flex flex-wrap justify-start gap-2'>
                    {record.symptoms.map((s) => (
                      <div
                        key={s}
                        className='inline-flex h-[30px] items-center justify-center rounded-[6px] bg-[#FEE4E2] px-4 font-cairo text-[12px] font-extrabold text-[#B42318]'
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                <div className='mt-6'>
                  <div className='mb-2 flex items-center justify-start gap-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                    <Heart className='h-4 w-4 text-[#7C3AED]' />
                    العلامات الحيوية
                  </div>

                  <div className='grid grid-cols-4 gap-3'>
                    {record.vitals
                      .slice()
                      .reverse()
                      .map((v) => {
                        const styles = getVitalCardStyle(v.label);
                        return (
                          <div
                            key={v.label}
                            className={`rounded-[6px] px-4 py-3 ${styles.wrapper}`}
                          >
                            <div
                              className={`font-cairo text-[12px] font-extrabold ${styles.label}`}
                            >
                              {v.label}
                            </div>
                            <div
                              className={`mt-1 font-cairo text-[14px] font-extrabold ${styles.value}`}
                            >
                              {v.value}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className='mt-6'>
                  <div className='mb-2 flex items-center justify-start gap-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                    <ClipboardList className='h-4 w-4 text-[#7C3AED]' />
                    الوصفات الطبية ({record.medicinesCount})
                  </div>

                  <div className='space-y-4'>
                    {record.prescriptions.map((p, idx) => (
                      <div
                        key={`${p.name}-${idx}`}
                        className='rounded-[6px] border-[1.82px] border-[#E9D4FF] bg-[#FAF5FF] px-5 py-4'
                      >
                        <div className='flex items-center justify-between gap-4'>
                          <div className='flex items-start gap-2'>
                            {' '}
                            <div className='flex h-[32px] w-[32px] items-center justify-center rounded-[6px] bg-primary font-cairo text-[13px] font-extrabold text-white'>
                              {idx + 1}
                            </div>
                            <div className='text-right'>
                              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                                {p.name}
                              </div>
                              <div className='mt-2 space-y-1 font-cairo text-[12px] font-semibold text-[#667085]'>
                                <div>
                                  <span className='text-[#111827]'>
                                    الجرعة:
                                  </span>{' '}
                                  {p.dosage}
                                </div>
                                <div>
                                  <span className='text-[#111827]'>المدة:</span>{' '}
                                  {p.duration}
                                </div>
                                <div>
                                  <span className='text-[#111827]'>
                                    ملاحظات:
                                  </span>{' '}
                                  {p.notes}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                            التكرار :{' '}
                            <span className='text-[12px] font-normal'>
                              {p.frequency}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='mt-5 flex items-center justify-between rounded-[6px] bg-[#FFF6ED] px-5 py-4'>
                  <div className='flex items-center gap-2'>
                    <Activity className='h-5 w-5 text-[#F54900]' />
                    <div className='space-y-1'>
                      <div className='font-cairo text-[14px] font-extrabold text-[#B54708]'>
                        يحتاج متابعة
                      </div>
                      <div className='flex gap-1 font-cairo text-[14px] leading-[20px] font-normal text-[#9F2D00]'>
                        الموعد المقترح:
                        <span>{record.followUpDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='mt-6'>
                  <div className='mb-2 flex items-center justify-start gap-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                    <ClipboardList className='h-4 w-4 text-[#667085]' />
                    ملاحظات إضافية
                  </div>
                  <div className='rounded-[6px] bg-[#F2F4F7] px-5 py-4 text-right font-cairo text-[13px] font-semibold leading-[22px] text-[#344054]'>
                    {record.additionalNotes}
                  </div>
                </div>

                <div className='mt-7'>
                  <Dialog.Close asChild>
                    <button
                      type='button'
                      className='h-[46px] w-full rounded-[6px] bg-[#EAECF0] font-cairo text-[14px] font-extrabold text-[#344054]'
                    >
                      إغلاق
                    </button>
                  </Dialog.Close>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
