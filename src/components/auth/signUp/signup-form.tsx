'use client';

import Image from 'next/image';
import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import SignUpStep1Account from './signup-step1-account';
import SignUpStep2Personal from './signup-step2-personal';
import SignUpStep3Professional from './signup-step3-professional';
import SignUpStep4Additional from './signup-step4-additional';
import SignUpStepper from './signup-stepper';

import {
  signUpSchema,
  type SignUpValues,
  type Step1AccountValues,
  type Step2PersonalValues,
  type Step3ProfessionalValues,
  type Step4AdditionalValues,
} from './signup-schemas';

export default function SignUpForm({
  onBack,
  onLogin,
  onVerify,
  onSuccess,
}: {
  onBack: () => void;
  onLogin: () => void;
  onVerify: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [draft, setDraft] = useState<Partial<SignUpValues>>({
    channel: 'whatsapp',
  });

  const stepVariants = {
    enter: (dir: 1 | -1) => ({
      opacity: 0,
      x: dir === 1 ? -24 : 24,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (dir: 1 | -1) => ({
      opacity: 0,
      x: dir === 1 ? 24 : -24,
    }),
  };

  const handleStep1Next = (values: Step1AccountValues) => {
    setDirection(1);
    setDraft((prev) => ({ ...prev, ...values }));
    setStep(2);
  };

  const handleStep2Next = (values: Step2PersonalValues) => {
    setDirection(1);
    setDraft((prev) => ({ ...prev, ...values }));
    setStep(3);
  };

  const handleStep3Next = (values: Step3ProfessionalValues) => {
    setDirection(1);
    setDraft((prev) => ({ ...prev, ...values }));
    setStep(4);
  };

  const handleStep4Complete = (values: Step4AdditionalValues) => {
    const merged = { ...draft, ...values };
    const parsed = signUpSchema.safeParse(merged);
    if (!parsed.success) {
      setStep(1);
      return;
    }
    onSuccess();
  };

  return (
    <section className='mx-auto flex flex-col items-center'>
      <div>
        <Image
          src='/images/logo.png'
          alt='LMJ Health'
          width={226}
          height={120}
          className='max-h-[120px]'
        />
      </div>
      <h1 className='my-6 text-[#4A5565] text-[16px] font-bold'>
        تسجيل حساب طبيب جديد
      </h1>
      <div
        dir='rtl'
        lang='ar'
        className='relative'
      >
        <div className='relative w-fit'>
          <div className='pointer-events-none absolute -right-[125px] -top-[80px] -z-10'>
            <div className='relative h-44 w-44'>
              <div className='absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl bg-teal-600/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
              <div className='absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-3xl bg-teal-500/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
            </div>
          </div>

          <div
            className={`w-[672px] ${step === 1 ? 'min-h-[947.175px] pb-12 mb-8' : step === 2 ? 'min-h-[727.17px] pb-12 mb-8' : step === 3 ? 'min-h-[999.16px] pb-12 mb-8' : 'min-h-[727.1749877929688px] pb-12 mb-8'} top-[212px] rounded-[32px] pt-8 px-8 gap-8 bg-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]`}
          >
            <SignUpStepper step={step} />

            <AnimatePresence
              mode='wait'
              initial={false}
              custom={direction}
            >
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial='enter'
                animate='center'
                exit='exit'
                transition={{ duration: 0.26, ease: 'easeOut' }}
              >
                {step === 1 ? (
                  <SignUpStep1Account
                    onBack={onBack}
                    defaultValues={draft}
                    onNext={handleStep1Next}
                  />
                ) : step === 2 ? (
                  <SignUpStep2Personal
                    onPrev={() => {
                      setDirection(-1);
                      setStep(1);
                    }}
                    defaultValues={draft}
                    onNext={handleStep2Next}
                  />
                ) : step === 3 ? (
                  <SignUpStep3Professional
                    onPrev={() => {
                      setDirection(-1);
                      setStep(2);
                    }}
                    defaultValues={draft}
                    onNext={handleStep3Next}
                  />
                ) : step === 4 ? (
                  <SignUpStep4Additional
                    onPrev={() => {
                      setDirection(-1);
                      setStep(3);
                    }}
                    defaultValues={draft}
                    onComplete={handleStep4Complete}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {step === 1 && (
            <div className='pt-2 text-center font-cairo text-[14px] font-semibold text-[#6A7282]'>
              لديك حساب بالفعل؟
              <button
                type='button'
                onClick={onLogin}
                className='ps-2 font-bold text-[#FFFFFF] py-4 transition-colors hover:text-[#14B3AE]'
              >
                تسجيل الدخول
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
