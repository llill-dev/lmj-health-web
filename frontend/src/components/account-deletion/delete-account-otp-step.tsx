import { deleteAccountOtpSchema } from '@/lib/auth/accountDeletionSchemas';
import { ArrowLeft } from 'lucide-react';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n/provider';

export function DeleteAccountOtpStep({
  destination,
  busy,
  resendBusy,
  error,
  onVerify,
  onResend,
  onBack,
  onChangeChannel,
  title,
  subtitle,
  verifyLabel,
}: {
  destination: string;
  busy?: boolean;
  resendBusy?: boolean;
  error?: string | null;
  onVerify: (otp: string) => void | Promise<void>;
  onResend: () => void | Promise<void>;
  onBack: () => void;
  onChangeChannel?: () => void;
  title?: string;
  subtitle?: string;
  verifyLabel?: string;
}) {
  const { t } = useI18n();
  const resolvedTitle = title ?? t('accountDeletion.otp.defaultTitle');
  const resolvedSubtitle = subtitle ?? t('accountDeletion.otp.defaultSubtitle');
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: 6 }, () => ''),
  );
  const [fieldError, setFieldError] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const merged = digits.join('');

  const submitOtp = () => {
    const parsed = deleteAccountOtpSchema.safeParse({ otp: merged });
    if (!parsed.success) {
      setFieldError(
        parsed.error.issues[0]?.message ?? t('accountDeletion.otp.invalidCode'),
      );
      return;
    }
    setFieldError(null);
    void onVerify(parsed.data.otp);
  };

  const handleChange = (index: number, value: string) => {
    const next = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const copy = [...prev];
      copy[index] = next;
      return copy;
    });
    if (next && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Backspace') return;
    if (digits[index]) {
      setDigits((prev) => prev.map((digit, i) => (i === index ? '' : digit)));
      return;
    }
    if (index > 0) inputsRef.current[index - 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (!pasted) return;
    setDigits(Array.from({ length: 6 }, (_, index) => pasted[index] ?? ''));
    const focusIndex = Math.min(pasted.length, 5);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="text-center">
      <h2 className="font-cairo text-[18px] font-extrabold text-[#111827]">
        {resolvedTitle}
      </h2>
      <p className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
        {resolvedSubtitle}
      </p>

      <div className="mt-6 flex flex-col items-center justify-center text-center">
        <h3 className="font-cairo text-[18px] font-extrabold text-[#111827]">
          {t('accountDeletion.otp.enterCode')}
        </h3>
        <p className="mt-1 font-cairo text-[12px] font-semibold leading-[20px] text-[#667085]">
          {t('accountDeletion.otp.sentTo')}
          <br />
          <span className="font-extrabold text-[#111827]">{destination}</span>
        </p>
      </div>

      <div className="mt-5 flex justify-center gap-2.5" dir="ltr">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            className="h-[52px] w-[46px] rounded-[10px] border border-[#E5E7EB] bg-white text-center font-cairo text-[20px] font-extrabold text-[#111827] outline-none ring-[#F87171]/25 focus:border-[#F87171] focus:ring-2 sm:h-[56px] sm:w-[50px]"
            aria-label={t('accountDeletion.otp.digitAriaLabel').replace(
              '{index}',
              String(index + 1),
            )}
          />
        ))}
      </div>

      {fieldError ? (
        <p className="mt-3 text-center font-cairo text-[12px] font-bold text-[#DC2626]">
          {fieldError}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-3 text-center font-cairo text-[12px] font-bold text-[#DC2626]"
        >
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={busy || merged.length !== 6}
        onClick={submitOtp}
        className="mt-6 flex h-[48px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#F88379] font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(248,131,121,0.35)] transition hover:bg-[#F87171] disabled:opacity-60"
      >
        <span>
          {busy
            ? t('accountDeletion.otp.verifying')
            : verifyLabel ?? t('accountDeletion.otp.verifyDefault')}
        </span>
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>

      <div className="mt-5 flex flex-col items-center justify-center space-y-2 text-center">
        <p className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
          {t('accountDeletion.otp.noCodeReceived')}
        </p>
        <button
          type="button"
          disabled={resendBusy}
          onClick={() => void onResend()}
          className="font-cairo text-[13px] font-extrabold text-[#EF4444] transition hover:text-[#DC2626] disabled:opacity-60"
        >
          {resendBusy
            ? t('accountDeletion.otp.resending')
            : t('accountDeletion.otp.resendCode')}
        </button>
        {onChangeChannel ? (
          <button
            type="button"
            onClick={onChangeChannel}
            className="mx-auto flex items-center justify-center gap-1 font-cairo text-[12px] font-bold text-[#667085] transition hover:text-[#111827]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            <span>{t('accountDeletion.otp.changeChannel')}</span>
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 font-cairo text-[13px] font-extrabold text-[#667085] transition hover:text-[#111827]"
      >
        {t('accountDeletion.otp.back')}
      </button>
    </div>
  );
}
