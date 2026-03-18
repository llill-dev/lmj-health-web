'use client';
import { CircleCheck, ArrowRight } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const verifyAccountSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'يرجى إدخال رمز تحقق مكوّن من 6 أرقام'),
});

type VerifyAccountValues = z.infer<typeof verifyAccountSchema>;

export default function VerifyAccount({
  email,
  onBack,
  onVerify,
}: {
  email: string;
  onBack: () => void;
  onVerify?: (code: string) => void;
}) {
  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyAccountValues>({
    resolver: zodResolver(verifyAccountSchema),
    defaultValues: {
      code: '',
    },
    mode: 'onSubmit',
  });

  const [code, setCode] = useState<string[]>(
    Array.from({ length: 6 }, () => ''),
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (index: number, value: string) => {
    const next = value.replace(/\D/g, '').slice(-1);
    setCode((prev) => {
      const copy = [...prev];
      copy[index] = next;
      return copy;
    });

    const merged = code.map((c, i) => (i === index ? next : c)).join('');
    setValue('code', merged, { shouldDirty: true });

    if (next && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return;

    if (code[index]) {
      const nextDigits = code.map((c, i) => (i === index ? '' : c));
      setCode(nextDigits);
      setValue('code', nextDigits.join(''), { shouldDirty: true });
      return;
    }

    if (index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (!pasted) return;

    const next = Array.from({ length: 6 }, (_, i) => pasted[i] ?? '');
    setCode(next);

    setValue('code', next.join(''), { shouldDirty: true });

    const lastFilled = Math.min(pasted.length, 6) - 1;
    if (lastFilled >= 0) inputsRef.current[lastFilled]?.focus();
  };

  return (
    <section className='mx-auto flex flex-col items-center'>
      <div className=''>
        <img
          src='/images/logo.png'
          alt='LMJ Health'
          width={300}
          height={200}
          className='max-h-[200px] -mt-8'
          loading='eager'
        />
      </div>
      <h1 className='my-6 text-[#1F2937] text-[32px] leading-[32px] font-bold'>
        التحقق من حسابك
      </h1>
      <div
        lang='ar'
        className='relative'
      >
        <div className='relative w-fit'>
          <div className='pointer-events-none absolute -right-[100px] -top-[170px] z-10'>
            <div className='relative h-44 w-44'>
              <div className='absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl bg-teal-600/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
              <div className='absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-3xl bg-teal-500/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
            </div>
          </div>

          <div className='w-[557px] min-h-[300px] rounded-[6px] bg-white px-[108px] py-[28px] mt-8 shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1),0px_10px_15px_-3px_rgba(0,0,0,0.1)]'>
            <form onSubmit={handleSubmit((values) => onVerify?.(values.code))}>
              <div className='text-center'>
                <div className='font-cairo text-[14px] leading-[14px] text-[#B5B7BA]'>
                  لقد أرسلنا رمزاً مكوناً من 6 أرقام إلى
                </div>
                <div className='mt-2 font-cairo text-[14px] leading-[20px]  text-[#1F2937]'>
                  {email}
                </div>
              </div>

              <div className='mt-8 mx-auto flex w-[307.84px] items-center justify-center gap-1'>
                {code.map((v, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    value={v}
                    inputMode='numeric'
                    autoComplete='one-time-code'
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className='h-[47.99px] w-[47.99px] rounded-[8px] border-[1.9px] border-[#E5E7EB] bg-[#EFEFEF] text-center font-cairo text-[18px] font-extrabold text-[#101828] shadow-[0_10px_25px_rgba(0,0,0,0.06)] outline-none focus:border-primary focus:bg-white'
                  />
                ))}
              </div>

              <div className='mx-auto mt-2 min-h-[18px] w-[307.84px] text-center font-cairo text-[12px] font-semibold text-red-500'>
                {errors.code?.message ?? ''}
              </div>

              <div className='mt-10 w-[341.21px] flex items-center justify-center'>
                <button
                  type='submit'
                  className='flex h-[43.98px] w-[341.22px] text-[#FFFFFF] items-center justify-center gap-2 rounded-[8px] bg-primary font-cairo text-[14px]  shadow-[0_18px_40px_rgba(15, 143, 139,0.35)] transition-colors hover:bg-[#14B3AE]'
                >
                  <CircleCheck className='h-4 w-4' />
                  التحقق من الحساب
                </button>
              </div>

              <div className='mt-8 text-center font-cairo text-[13px] font-semibold text-[#98A2B3]'>
                أعد إرسال الرمز خلال {secondsLeft} ثانية
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
