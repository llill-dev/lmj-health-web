'use client';
import Image from 'next/image';
import { Activity, Heart, Pill, Sparkles } from 'lucide-react';
import { useState } from 'react';
import doctorImg from '../../public/images/doctor.png';
import LoginForm from '@/components/auth/login/login-form';
import SignUpForm from '@/components/auth/signUp/signup-form';
import SignupSuccess from '@/components/auth/signUp/signup-success';
import VerifyAccount from '@/components/auth/verify/verify-account';
import NewPassword from '@/components/auth/newPassword/new-password';

import { AnimatePresence, motion } from 'framer-motion';

type View =
  | 'welcome'
  | 'login'
  | 'signup'
  | 'signup-success'
  | 'verify'
  | 'new-password';

export default function Home() {
  const [view, setView] = useState<View>('welcome');
  const [direction, setDirection] = useState<1 | -1>(1);

  const viewOrder: Record<View, number> = {
    welcome: 0,
    login: 1,
    signup: 2,
    'signup-success': 3,
    verify: 3,
    'new-password': 4,
  };

  const goTo = (next: View) => {
    setDirection(viewOrder[next] >= viewOrder[view] ? 1 : -1);
    setView(next);
  };

  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#d7f6f1_0%,#c5f0e9_35%,#baeae2_65%,#b6efe7_100%)]'>
      <div className='pointer-events-none absolute -left-24 top-20 h-80 w-80 rotate-[-12deg] rounded-3xl bg-white/10 blur-2xl' />
      <div className='pointer-events-none absolute -right-40 bottom-10 h-[28rem] w-[28rem] rotate-[12deg] rounded-[3rem] bg-white/10 blur-2xl' />
      <div className='pointer-events-none absolute left-10 top-24 grid gap-6'>
        <div className='relative flex h-10 w-10 rotate-12 items-center justify-center rounded-xl bg-transparent text-teal-500 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur'>
          <Pill size={18} />
        </div>
        <div className='relative ml-10 flex h-12 w-12 translate-x-1/2 -translate-y-1/2 rotate-8 items-center justify-center rounded-2xl bg-[#16C5C0] text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur'>
          <Heart
            size={20}
            className='fill-white'
          />
        </div>
        <div className='relative -left-10 -top-10 ml-10 flex h-12 w-12 -rotate-12 items-center justify-center rounded-2xl bg-transparent text-teal-500 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur'>
          <Heart
            size={20}
            className='fill-[#16C5C0]'
          />
        </div>
      </div>

      <div className='pointer-events-none absolute -left-96 top-36 grid gap-6'>
        <div className='relative h-[300px] w-[300px] translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-3xl opacity-[0.2] bg-[#0ac7c1] shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
      </div>

      <div className='pointer-events-none absolute -left-28 -bottom-24 grid gap-6'>
        <div className='relative h-[300px] w-[300px] -rotate-12 rounded-3xl opacity-[0.2] bg-[#0ac7c1] shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
      </div>
      <div className='pointer-events-none absolute left-[350px] -bottom-14 grid gap-6'>
        <div className='relative h-[300px] w-[300px] -rotate-12 rounded-3xl opacity-[0.1] bg-[#0ac7c1] shadow-[10px_25px_70px_rgba(0,0,0,1.20)]' />
      </div>
      <div className='pointer-events-none absolute left-[550px] -bottom-[300px] grid gap-6'>
        <div className='relative h-[300px] w-[300px] -rotate-12 rounded-3xl opacity-[0.1] bg-[#0ac7c1] shadow-[10px_25px_70px_rgba(0,0,0,1.20)]' />
      </div>

      <div className='pointer-events-none absolute z-20 -right-10 top-[150.27px] h-[455.4389px] w-[455.4389px] rotate-[12deg] rounded-[80px] bg-white/30'>
        <div className='relative w-fit'>
          <div className='pointer-events-none opacity-[0.2] absolute -right-64 -top-16 -z-10'>
            <div className='relative h-44 w-44'>
              <div className='absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl bg-teal-600/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
              <div className='absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-3xl bg-teal-500/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
            </div>
          </div>
        </div>
      </div>
      <div className='pointer-events-none absolute bottom-16 right-6 flex h-12 w-12 rotate-12 items-center justify-center rounded-2xl bg-white/80 text-teal-500 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur'>
        <Activity size={20} />
      </div>

      <AnimatePresence
        mode='wait'
        initial={false}
      >
        <motion.div
          key={view}
          custom={direction}
          variants={{
            enter: (dir: 1 | -1) => ({ opacity: 0, x: dir === 1 ? -28 : 28 }),
            center: { opacity: 1, x: 0 },
            exit: (dir: 1 | -1) => ({ opacity: 0, x: dir === 1 ? 28 : -28 }),
          }}
          initial='enter'
          animate='center'
          exit='exit'
          transition={{ duration: 0.26, ease: 'easeOut' }}
          className='relative z-10'
        >
          {view === 'welcome' ? (
            <section className='mx-auto flex w-full max-w-[480px] flex-col items-center gap-4 sm:py-16'>
              <div className='flex w-full justify-center'>
                <div className='mx-auto min-h-[70px] min-w-[265px] rounded-[20px] border border-[#FFFFFFCC] border-t-[1.27px] bg-[#FFFFFF99] px-3 py-1 shadow-[0px_25px_50px_-12px_#00000040] backdrop-blur'>
                  <div className='flex items-center gap-1'>
                    <div className='flex flex-col items-start justify-start text-center'>
                      <h1 className='h-[32px] w-[151px] text-[24px] font-bold leading-[32px] text-[#16C5C0]'>
                        LMJ HEALTH
                      </h1>
                      <div className='ms-10 flex items-center justify-start gap-1'>
                        <p className='text-[10px] font-bold leading-[16px] text-[#16C5C0B2]'>
                          بوّابة صحية متكامل
                        </p>
                        <Sparkles className='w-[11px] h-[11px] text-[#16C5C0B2]' />
                      </div>
                    </div>
                    <div className='h-6 w-px bg-teal-200' />
                    <Image
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
                      <Image
                        src={doctorImg}
                        alt='Doctor'
                        fill
                        priority
                        fetchPriority='high'
                        sizes='(max-width: 480px) 360px, 360px'
                        className='object-center'
                        quality={70}
                        placeholder='blur'
                      />
                    </div>
                    <div className='pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 rounded-[28px] bg-teal-600/30 blur-2xl' />
                  </div>
                </div>
              </div>

              <div className='flex h-[235px] w-[345px] flex-col items-center justify-center rounded-[32px] border-[1.82px] border-t-[1.82px] border-t-white/80 bg-transparent shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]'>
                <h1 className='bg-[#101828] bg-clip-text text-center font-cairo text-[24px] font-bold leading-[32px] text-transparent'>
                  مرحبًا بك في عالم الصحة
                </h1>

                <p className='mt-4 text-center font-cairo text-[14px] font-bold leading-[24.8px] text-[#4A5565]'>
                  ابدأ رحلتك في البحث عن طبيبك المناسب
                  <br />
                  واحصل على رعاية صحية متكاملة ومتطورة
                  <br />
                </p>
                <p className='text-[12px] mt-2 text-center leading-[16px] text-[#364153]'>
                  رعاية شاملة ... متابعة مستمرة ... أدوية منظمة
                </p>

                <div className='mt-5 flex items-center justify-center'>
                  <button
                    className='h-[63px] w-[297px] gap-[11.99px] rounded-[24px] bg-[#16C5C0] pl-[0.03px] font-cairo text-lg font-bold text-white opacity-100 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] transition-colors duration-200 hover:bg-[#14B3AE]'
                    type='button'
                    onClick={() => goTo('login')}
                  >
                    ابدأ الآن
                  </button>
                </div>
              </div>
            </section>
          ) : view === 'login' ? (
            <LoginForm
              onBack={() => goTo('welcome')}
              onSignUp={() => goTo('signup')}
              onForgotPassword={() => goTo('new-password')}
            />
          ) : view === 'verify' ? (
            <VerifyAccount
              email='Ahmad@gmail.com'
              onBack={() => goTo('signup')}
              onVerify={() => goTo('login')}
            />
          ) : view === 'signup-success' ? (
            <SignupSuccess onContinue={() => goTo('verify')} />
          ) : view === 'new-password' ? (
            <NewPassword
              onBack={() => goTo('login')}
              onSubmit={() => goTo('login')}
            />
          ) : (
            <SignUpForm
              onBack={() => goTo('welcome')}
              onLogin={() => goTo('login')}
              onVerify={() => goTo('verify')}
              onSuccess={() => goTo('signup-success')}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
