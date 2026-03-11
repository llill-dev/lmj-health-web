import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
  MessageSquareText,
  Video,
  ShieldClose,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

type ProfileStatus = 'active' | 'inactive';

type StatItem = {
  label: string;
  value: string;
  valueClassName?: string;
};

type InfoRow = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

export default function DoctorProfileSettingsPage() {
  const [status, setStatus] = useState<ProfileStatus>('active');

  const statusLabel = useMemo(() => {
    return status === 'active' ? 'نشط' : 'غير نشط';
  }, [status]);

  const stats: StatItem[] = [
    { label: 'استشارة', value: '1', valueClassName: 'text-[#16C5C0] ' },
    { label: 'سنوات خبرة', value: '15', valueClassName: 'text-[#16C5C0] ' },
    { label: 'التقييم', value: '4.8', valueClassName: 'text-[#16C5C0] ' },
  ];

  const contact: InfoRow[] = [
    {
      label: 'رقم الهاتف',
      value: '+966503456789',
      icon: <Phone className='h-4 w-4 text-white' />,
    },
    {
      label: 'البريد الإلكتروني',
      value: 'doctor1@example.com',
      icon: <Mail className='h-4 w-4 text-white' />,
    },
    {
      label: 'العنوان',
      value: 'دمشق، سوريا',
      icon: <MapPin className='h-4 w-4 text-white' />,
    },
  ];

  const professional: Array<{
    label: string;
    value: string;
    icon: React.ReactNode;
  }> = [
    {
      label: 'الرقم المهني',
      value: 'MED-12345',
      icon: <BadgeCheck className='h-4 w-4 text-white' />,
    },
    {
      label: 'التخصص',
      value: 'دكتور قلب',
      icon: <Stethoscope className='h-4 w-4 text-white' />,
    },
    {
      label: 'عنوان العيادة',
      value: 'مستشفى القلب التخصصي، دمشق',
      icon: <MapPin className='h-4 w-4 text-white' />,
    },
    {
      label: 'رسوم الاستشارة',
      value: '200 $',
      icon: <ShieldCheck className='h-4 w-4 text-white' />,
    },
    {
      label: 'سنوات الخبرة',
      value: '15 سنة',
      icon: <CalendarDays className='h-4 w-4 text-white' />,
    },
    {
      label: 'اللغة',
      value: 'العربية، الإنجليزية',
      icon: <MessageSquareText className='h-4 w-4 text-white' />,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Profile Settings • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
        className='mx-auto w-full max-w-[1120px] px-4'
      >
        <section className='relative overflow-hidden rounded-[6px] bg-[#16C5C0] px-6 pb-6 pt-8 shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]'>
          <div className='pointer-events-none absolute -right-16 -top-16 h-[220px] w-[220px] rounded-full bg-white/10' />
          <div className='pointer-events-none absolute -left-24 -bottom-24 h-[260px] w-[260px] rounded-full bg-white/10' />

          <div className='flex flex-col items-center text-center'>
            <div className='flex h-[64px] w-[64px] items-center justify-center rounded-full border-2 border-white/50 bg-white/15'>
              <span className='font-cairo text-[20px] font-extrabold text-white'>
                د
              </span>
            </div>

            <div className='mt-3 font-cairo text-[18px] font-extrabold text-white'>
              د. خالد عبدالله
            </div>
            <div className='mt-1 font-cairo text-[13px] font-semibold text-white/80'>
              طب القلب
            </div>

            <div className='mt-2 flex items-center gap-2 font-cairo text-[12px] font-extrabold text-white'>
              <span className='flex items-center gap-1'>
                4.8
                <Star
                  className='h-4 w-4 text-[#FACC15]'
                  fill='#FACC15'
                />
              </span>
              <span className='text-white/80 font-semibold'>|</span>
              <span className='font-semibold text-white/90'>15 تقييمًا</span>
            </div>

            <span className='mt-3 inline-flex h-[24px] items-center justify-center rounded-full bg-white/15 px-4 font-cairo text-[11px] font-extrabold text-white'>
              حساب محقق
            </span>
          </div>
        </section>

        <section className='mt-4 grid grid-cols-3 gap-4'>
          {stats.map((s) => (
            <div
              key={s.label}
              className='rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-4 text-center shadow-[0_14px_24px_rgba(0,0,0,0.08)]'
            >
              <div
                className={`font-cairo text-[24px] font-black ${
                  s.valueClassName ?? 'text-[#111827]'
                }`}
              >
                {s.value}
              </div>
              <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                {s.label}
              </div>
            </div>
          ))}
        </section>

        <section className='mt-5 rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
          <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
            نبذة عن الطبيب
          </div>
          <div className='mt-2 font-cairo text-[12px] font-semibold leading-[20px] text-[#667085]'>
            استشاري أمراض القلب مع خبرة 15 سنة في التشخيص والعلاج.
          </div>
        </section>

        <section className='mt-5 overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
          <div className='border-b border-[#EEF2F6] px-6 py-4'>
            <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
              معلومات الاتصال
            </div>
          </div>

          <div className='divide-y divide-[#EEF2F6]'>
            {contact.map((row) => (
              <div
                key={row.label}
                className='flex items-center justify-between px-6 py-4'
              >
                <div className='flex items-center gap-3'>
                  <div className='flex h-[32px] w-[32px] items-center justify-center rounded-[6px] bg-[#16C5C0]'>
                    {row.icon}
                  </div>
                  <div className='text-right'>
                    <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                      {row.label}
                    </div>
                    <div className='mt-1 font-cairo text-[12px] font-extrabold text-[#111827]'>
                      {row.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className='mt-5 overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
          <div className='border-b border-[#EEF2F6] px-6 py-4'>
            <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
              طرق الاستشارة
            </div>
          </div>

          <div className='px-6 py-5'>
            <div className='space-y-3'>
              {[
                {
                  title: 'استشارة في العيادة',
                  subtitle: 'زيارة شخصية مباشرة',
                  icon: <MessageSquareText className='h-4 w-4 text-white' />,
                },
                {
                  title: 'استشارة عبر الإنترنت',
                  subtitle: 'استشارة عن بعد',
                  icon: <Video className='h-4 w-4 text-white' />,
                },
                {
                  title: 'استشارة هاتفية',
                  subtitle: 'مكالمات صوتية مباشرة',
                  icon: <Phone className='h-4 w-4 text-white' />,
                },
              ].map((m) => (
                <div
                  key={m.title}
                  className='flex h-[64px] items-center justify-between rounded-[6px] bg-[#16C5C026] px-2 py-2'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-[40px] w-[40px] items-center justify-center rounded-[6px] bg-[#16C5C0]'>
                      {m.icon}
                    </div>
                    <div className='text-right'>
                      <p className='font-cairo text-[14px] font-bold text-[#1F2937]'>
                        {m.title}
                      </p>
                      <p className='mt-1 font-cairo text-[12px] font-semibold text-[#6A7282]'>
                        {m.subtitle}
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className='h-4 w-4 text-[#16C5C0]' />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='mt-5 overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
          <div className='border-b border-[#EEF2F6] px-6 py-4'>
            <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
              المعلومات المهنية
            </div>
          </div>

          <div className='px-6 py-5'>
            <div className='space-y-3'>
              {professional.map((row) => (
                <div
                  key={row.label}
                  className='h-[64px] flex items-center justify-between rounded-[6px] bg-[#E9FFFE] px-2 py-2'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-[#16C5C0]'>
                      {row.icon}
                    </div>
                    <div className='text-right'>
                      <p className='font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                        {row.label}
                      </p>
                      <p className='mt-1 font-cairo text-[14px] font-bold text-[#101828]'>
                        {row.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='mt-6 overflow-hidden rounded-[6px] bg-[#16C5C0] px-6 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={() =>
                  setStatus((s) => (s === 'active' ? 'inactive' : 'active'))
                }
                className='flex h-[36px] w-[36px] items-center justify-center rounded-[6px] bg-white/15'
                aria-label='تبديل الحالة'
              >
                {status === 'active' ? (
                  <ShieldCheck className='h-5 w-5 text-white' />
                ) : (
                  <ShieldClose className='h-5 w-5 text-white' />
                )}
              </button>
              <div className='text-right'>
                <div className='font-cairo text-[11px] font-semibold text-white/80'>
                  حالة الحساب
                </div>
                <div className='mt-1 font-cairo text-[13px] font-extrabold text-white'>
                  {statusLabel}
                </div>
              </div>
            </div>
            <button
              type='button'
              className='h-[36px] rounded-[6px] bg-[#FFFFFF33] px-4 font-cairo text-[12px] font-extrabold text-[#FFFFFF]'
            >
              تعديل الملف
            </button>
          </div>
        </section>

        <div className='h-10' />
      </div>
    </>
  );
}
