'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building,
  CircleCheck,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Star,
  Stethoscope,
  Video,
  X,
} from 'lucide-react';

export type DoctorCardItem = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  tags: string[];
  price: number;
  city: string;
};

export default function DoctorDetailsDialog({
  open,
  doctor,
  onClose,
}: {
  open: boolean;
  doctor: DoctorCardItem | null;
  onClose: () => void;
}) {
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

  return (
    <AnimatePresence>
      {open && doctor ? (
        <motion.div
          key='overlay'
          className='fixed inset-0 z-50 max-h-[752px] flex items-center justify-center bg-black/40 px-4'
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          role='dialog'
          aria-modal='true'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <motion.div
            key='panel'
            className='relative w-full max-w-[512px] overflow-hidden rounded-[18px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]'
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type='button'
              onClick={onClose}
              className='absolute left-4 top-4 text-[#667085]'
              aria-label='إغلاق'
            >
              <X className='h-4 w-4' />
            </button>

            <div className='px-7 pb-6 pt-6'>
              <div className='text-right font-cairo text-[24px] font-bold text-[#101828]'>
                تفاصيل الطبيب
              </div>

              <div className='flex gap-[24px] mt-6'>
                <div className='h-[128px] w-[128px] rounded-full border-[3.65px] border-[#C7F3F1] bg-[#F8FAFC]' />
                <div className='flex gap-4 flex-1 flex-col items-start'>
                  <div className='flex items-center gap-16'>
                    <div className='font-cairo text-[20px] font-extrabold text-[#111827]'>
                      {doctor.name}
                    </div>
                    <span className='inline-flex h-[24px] items-center justify-center gap-2 rounded-full bg-[#00C950] px-4 font-cairo text-[11px] text-[#fff]'>
                      معتمد
                      <CircleCheck className='h-4 w-4' />
                    </span>
                  </div>
                  <div className='flex items-center justify-center gap-2 font-cairo text-[18px] font-semibold text-[#16C5C0]'>
                    <Stethoscope className='h-5 w-5 text-[#16C5C0]' />
                    {doctor.specialty}
                  </div>
                  <div className=' flex items-center justify-center gap-3 font-cairo text-[13px] font-extrabold text-[#111827]'>
                    <span className='flex items-center gap-2'>
                      <Star
                        className='h-5 w-5 text-[#FACC15]'
                        fill='#FACC15'
                      />
                      {doctor.rating.toFixed(1)}
                    </span>
                    <span className='text-[#98A2B3] font-semibold'>
                      ({doctor.reviews} تقييم)
                    </span>
                  </div>
                  <div className=' flex items-center justify-center gap-2'>
                    <span className='flex h-[24px] w-[124px] items-center justify-center gap-2 rounded-full border-[1.82px] border-[#16C5C0] bg-[#FFFFFF] px-2 font-cairo text-[12px] font-semibold text-[#16C5C0]'>
                      <Video className='h-[12px] w-[12px]' />
                      استشارة أونلاين
                    </span>
                    <span className='flex h-[24px] w-[124px] items-center justify-center gap-2 rounded-full border-[1.82px] border-[#16C5C0] bg-[#16C5C0] px-2 font-cairo text-[12px] font-semibold text-[#E9FFFE]'>
                      <Building className='h-[12px] w-[12px]' />
                      استشارة حضورية
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className='h-px w-full bg-[#EEF2F6]' />

            <div className='px-7 py-6'>
              <div className='grid grid-cols-2 gap-6'>
                <div className='text-right'>
                  <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                    البريد الإلكتروني
                  </div>
                  <div className='mt-2 font-cairo text-[12px] font-bold text-[#111827]'>
                    mona.abdullah@hospital.sa
                  </div>
                </div>
                <div className='text-right'>
                  <div className='flex gap-2 items-center'>
                    <Phone className='h-4 w-4 text-[#16C5C0]' />
                    <div>
                      <p className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                        رقم الهاتف
                      </p>
                      <p className='mt-1 flex items-center justify-end gap-2 font-cairo text-[12px] font-bold text-[#111827]'>
                        +966507890123
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex mt-8 gap-2 items-center'>
                <DollarSign className='h-5 w-5 text-[#16A34A]' />
                <div>
                  <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                    سعر الكشف
                  </div>
                  <span className='font-cairo text-[16px] font-extrabold text-[#16A34A]'>
                    {doctor.price}
                  </span>
                </div>
              </div>
            </div>

            <div className='h-px w-full bg-[#EEF2F6]' />

            <div className='px-7 py-6'>
              <div className='flex items-start justify-start gap-2'>
                <MapPin className='h-5 w-5 text-[#16C5C0]' />
                <div className='space-y-6'>
                  <div className='font-cairo text-[16px] font-extrabold text-[#111827]'>
                    موقع العيادة
                  </div>
                  <div>
                    <div className='text-right font-cairo text-[13px] font-semibold text-[#667085]'>
                      شارع بغداد
                    </div>
                    <div className='text-right font-cairo text-[13px] font-semibold text-[#667085]'>
                      دمشق، سوريا
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4 px-7 pb-6'>
              <button
                type='button'
                className='flex h-[46px] items-center justify-center gap-2 rounded-[14px] border border-[#16C5C0] bg-white font-cairo text-[13px] font-extrabold text-[#16C5C0]'
              >
                <Mail className='h-4 w-4' />
                إرسال رسالة
              </button>

              <button
                type='button'
                className='flex h-[46px] items-center justify-center gap-2 rounded-[14px] bg-gradient-to-b from-[#16C5C0] to-[#14B3AE] font-cairo text-[13px] font-extrabold text-white'
              >
                <Phone className='h-4 w-4' />
                اتصال
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
