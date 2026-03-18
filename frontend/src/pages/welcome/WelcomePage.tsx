import { Helmet } from 'react-helmet-async';
import { Activity, Heart, Pill, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <section className='relative flex min-h-screen w-full justify-center bg-[#CFEFED] sm:py-16'>
      <Helmet>
        <title>Welcome • LMJ Health</title>
      </Helmet>

      <div className='mx-auto flex w-full max-w-[480px] flex-col items-center gap-4'>
        <div className='pointer-events-none absolute left-10 top-24 grid gap-6'>
          <div className='relative flex h-10 w-10 rotate-12 items-center justify-center rounded-xl bg-transparent text-teal-500 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur'>
            <Pill size={18} />
          </div>
          <div className='relative ml-10 flex h-12 w-12 translate-x-1/2 -translate-y-1/2 rotate-8 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur'>
            <Heart
              size={20}
              className='fill-white'
            />
          </div>
          <div className='relative -left-10 -top-10 ml-10 flex h-12 w-12 -rotate-12 items-center justify-center rounded-2xl bg-transparent text-teal-500 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur'>
            <Heart
              size={20}
              className='fill-[#0F8F8B]'
            />
          </div>
        </div>

        <div className='pointer-events-none absolute bottom-16 right-6 flex h-12 w-12 rotate-12 items-center justify-center rounded-2xl bg-white/80 text-teal-500 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur'>
          <Activity size={20} />
        </div>

        <div className='flex w-full justify-center'>
          <div className='mx-auto min-h-[70px] min-w-[265px] rounded-[6px] border border-[#FFFFFFCC] border-t-[1.27px] bg-[#FFFFFF99] px-3 py-1 shadow-[0px_25px_50px_-12px_#00000040] backdrop-blur'>
            <div className='flex items-center gap-1'>
              <div className='flex flex-col items-start justify-start text-center'>
                <h1 className='h-[32px] w-[151px] text-[24px] font-bold leading-[32px] text-primary'>
                  LMJ HEALTH
                </h1>
                <div className='ms-10 flex items-center justify-start gap-1'>
                  <p className='text-[10px] font-bold leading-[16px] text-[#0F8F8BB2]'>
                    بوّابة صحية متكامل
                  </p>
                  <Sparkles className='h-[11px] w-[11px] text-[#0F8F8BB2]' />
                </div>
              </div>
              <div className='h-6 w-px bg-teal-200' />
              <img
                src='/images/logo.png'
                alt='LMJ Health'
                width={80}
                height={90}
              />
            </div>
          </div>
        </div>

        <div className='relative flex w-full items-center justify-center'>
          <div className='relative w-fit'>
            <div className='pointer-events-none absolute -right-20 -top-6 -z-10'>
              <div className='relative h-44 w-44'>
                <div className='absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl bg-teal-600/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
                <div className='absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-3xl bg-teal-500/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
              </div>
            </div>

            <div className='relative h-[320px] w-[280.71px] rounded-[28px] border-4 border-white/70 bg-transparent shadow-[0_28px_80px_rgba(0,0,0,0.25)]'>
              <div className='pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 rounded-[28px] bg-teal-600/20 opacity-[0.2] blur-2xl' />
              <div className='relative h-full w-full overflow-hidden rounded-[24px]'>
                <img
                  src='/images/doctor.png'
                  alt='Doctor'
                  loading='eager'
                  className='absolute inset-0 h-full w-full object-cover object-center'
                />
              </div>
              <div className='pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 rounded-[28px] bg-teal-600/30 blur-2xl' />
            </div>
          </div>
        </div>

        <div className='flex h-[235px] w-[345px] flex-col items-center justify-center rounded-[6px] border-[1.82px] border-white border-t-[1.82px] bg-[#FFFFFFCC] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]'>
          <h1 className='bg-[#101828] bg-clip-text text-center font-cairo text-[24px] font-bold leading-[32px] text-transparent'>
            مرحبًا بك في عالم الصحة
          </h1>

          <p className='mt-4 text-center font-cairo text-[14px] font-bold leading-[24.8px] text-[#4A5565]'>
            ابدأ رحلتك في البحث عن طبيبك المناسب
            <br />
            واحصل على رعاية صحية متكاملة ومتطورة
            <br />
          </p>
          <p className='mt-2 text-center text-[12px] leading-[16px] text-[#364153]'>
            رعاية شاملة ... متابعة مستمرة ... أدوية منظمة
          </p>

          <div className='mt-5 flex items-center justify-center'>
            <button
              className='h-[63px] w-[297px] gap-[11.99px] rounded-[6px] bg-primary pl-[0.03px] font-cairo text-lg font-bold text-white opacity-100 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] transition-colors duration-200 hover:bg-[#14B3AE]'
              type='button'
              onClick={() => navigate('/login')}
            >
              ابدأ الآن
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
