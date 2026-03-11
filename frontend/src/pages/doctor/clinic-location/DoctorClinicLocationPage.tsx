import { useMemo, useState } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Map as MapIcon,
  XCircle,
  Locate,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

type VerificationStatus = 'unverified' | 'pending' | 'verified';

export default function DoctorClinicLocationPage() {
  const [query, setQuery] = useState('');
  const [lat, setLat] = useState('24.713600');
  const [lng, setLng] = useState('46.675300');
  const [address, setAddress] = useState('مستشفى الملك فيصل التخصصي - الرياض');
  const [status, setStatus] = useState<VerificationStatus>('unverified');

  const statusLabel = useMemo(() => {
    if (status === 'verified') return 'موثق';
    if (status === 'pending') return 'قيد المراجعة';
    return 'غير محقق';
  }, [status]);

  return (
    <>
      <Helmet>
        <title>Clinic Location • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
        className='mx-auto w-full max-w-[1120px] px-4'
      >
        <section className='rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-3'>
              <button
                type='button'
                className='flex h-[36px] w-[36px] items-center justify-center rounded-[6px] bg-[#16C5C0] text-white'
                aria-label='موقع'
              >
                <MapPin className='h-4 w-4' />
              </button>
              <div className='text-right'>
                <div className='font-cairo text-[16px] font-extrabold text-[#111827]'>
                  موقع العيادة
                </div>
                <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                  حدد موقع عيادتك بدقة على الخريطة
                </div>
              </div>
            </div>

            <span className='flex py-1 gap-2 h-[22px] items-center font-semibold  justify-center rounded-full bg-[#99A1AF] px-3 font-cairo text-[12px]  text-[#FFFFFF]'>
              {statusLabel}
              <XCircle className='h-4 w-4 text-[#FFFFFF]' />
            </span>
          </div>
        </section>

        <section className='mt-5 rounded-[6px] border border-[#EEF2F6] bg-white p-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
          <div className='relative'>
            <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
              <Search className='h-4 w-4' />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='ابحث عن عنوان...'
              className='h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white pr-4 pl-10 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]'
            />
          </div>

          <button
            type='button'
            onClick={() => {
              setStatus('pending');
            }}
            className='mt-4 flex h-[44px] w-full items-center justify-center gap-2 rounded-[6px] bg-[#16C5C0] font-cairo text-[13px] font-extrabold text-white shadow-[0_18px_40px_rgba(22,197,192,0.30)] transition-colors hover:bg-[#14B3AE]'
          >
            <Locate className='h-4 w-4' />
            الحصول على موقعي الحالي
          </button>
        </section>

        <section className='mt-5 overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
          <div className='relative h-[340px] bg-gradient-to-br from-gray-100 to-gray-200'>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='flex flex-col items-center'>
                <div className='relative flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#16C5C0] text-white shadow-[0_18px_40px_rgba(22,197,192,0.28)]'>
                  <MapIcon className='h-[40px] w-[40px]' />
                  <MapPin className='absolute -bottom-4 h-[48px] w-[48px] fill-[#F04438] stroke-[#F04438]' />
                </div>
                <div className='mt-4 text-center'>
                  <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                    خريطة تفاعلية
                  </div>
                  <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    اسحب وأفلت لتحديد الموقع بدقة
                  </div>
                </div>
              </div>
            </div>

            <div className='absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-3 bg-white px-5 py-4'>
              <div className='text-right'>
                <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                  خط العرض
                </div>
                <div className='mt-1 font-cairo text-[12px] font-extrabold text-[#111827]'>
                  {lat}
                </div>
              </div>
              <div className='text-right'>
                <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                  خط الطول
                </div>
                <div className='mt-1 font-cairo text-[12px] font-extrabold text-[#111827]'>
                  {lng}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='mt-5 rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex h-[30px] w-[30px] items-center justify-center rounded-[6px] bg-[#E9FFFE] text-[#16C5C0]'>
                <Navigation className='h-4 w-4' />
              </div>
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                تفاصيل الموقع
              </div>
            </div>
          </div>

          <div className='mt-5 grid grid-cols-2 gap-4'>
            <div>
              <div className='mb-2 text-right font-cairo text-[12px] font-extrabold text-[#111827]'>
                خط العرض (Latitude)
              </div>
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className='h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold text-[#111827] outline-none'
              />
            </div>
            <div>
              <div className='mb-2 text-right font-cairo text-[12px] font-extrabold text-[#111827]'>
                خط الطول (Longitude)
              </div>
              <input
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className='h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold text-[#111827] outline-none'
              />
            </div>
          </div>

          <div className='mt-4'>
            <div className='mb-2 text-right font-cairo text-[12px] font-extrabold text-[#111827]'>
              عنوان العيادة
            </div>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className='h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold text-[#6B7280] outline-none'
            />
          </div>

          <div className='mt-4 flex items-center justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                حالة التحقق
              </div>
            </div>
            <span className='inline-flex h-[22px] items-center justify-center rounded-full bg-[#F2F4F7] px-3 font-cairo text-[11px] font-extrabold text-[#667085]'>
              {statusLabel}
            </span>
          </div>

          <button
            type='button'
            onClick={() => setStatus('pending')}
            className='mt-5 flex h-[48px] w-full items-center justify-center gap-2 rounded-[6px] bg-[#16C5C0] font-cairo text-[13px] font-extrabold text-white shadow-[0_18px_40px_rgba(22,197,192,0.30)] transition-colors hover:bg-[#14B3AE]'
          >
            <Navigation className='h-4 w-4' />
            إرسال المراجعة
          </button>
        </section>

        <section className='mt-5 rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex h-[30px] w-[30px] items-center justify-center text-[#16C5C0]'>
                <MapPin className='h-4 w-4' />
              </div>
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                تعليمات التحديد
              </div>
            </div>
          </div>

          <div className='mt-5 rounded-[16px] bg-[#F8FAFC]'>
            <ol className='space-y-3'>
              {[
                'انقر على "الحصول على موقعي الحالي" لتحديد تلقائي',
                'اسحب وأفلت المؤشر على الخريطة لتحديد موقع دقيق',
                'أدخل الإحداثيات يدويًا إذا أردت تعديلها',
                'اكتب عنوان العيادة الكامل في الحقل المخصص',
                'اضغط على "إرسال المراجعة" لبدء عملية التحقق',
                'سيتم مراجعة موقعك والتوثيق خلال مدة 24-48 ساعة',
              ].map((t, idx) => (
                <li
                  key={t}
                  className='flex items-start gap-3'
                >
                  <div className='mt-[1px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#16C5C0] font-cairo text-[12px] font-extrabold text-[#E9FFFE]'>
                    {idx + 1}
                  </div>
                  <div className='font-cairo text-[14px] leading-[20px] text-[#667085]'>
                    {t}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className='h-10' />
      </div>
    </>
  );
}
