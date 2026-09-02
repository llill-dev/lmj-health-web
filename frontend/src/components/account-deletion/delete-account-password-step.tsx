import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  buildDeleteAccountPasswordSchema,
  type DeleteAccountPasswordValues,
} from '@/lib/auth/accountDeletionSchemas';
import { useI18n } from '@/i18n/provider';

export function DeleteAccountPasswordStep({
  busy,
  error,
  onContinue,
  onBack,
}: {
  busy?: boolean;
  error?: string | null;
  onContinue: (password: string) => void | Promise<void>;
  onBack: () => void;
}) {
  const { t, locale } = useI18n();
  const [visible, setVisible] = useState(false);
  const deleteAccountPasswordSchema = useMemo(
    () => buildDeleteAccountPasswordSchema(t),
    [locale],
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeleteAccountPasswordValues>({
    resolver: zodResolver(deleteAccountPasswordSchema),
    defaultValues: { currentPassword: '' },
    mode: 'onSubmit',
  });

  return (
    <div className="text-center">
      <h2 className="font-cairo text-[18px] font-extrabold text-[#111827]">
        {t('accountDeletion.password.title')}
      </h2>
      <p className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
        {t('accountDeletion.password.subtitle')}
      </p>

      <form
        className="mt-6 text-start"
        noValidate
        onSubmit={handleSubmit((values) =>
          void onContinue(values.currentPassword),
        )}
      >
        <label
          htmlFor="delete-account-password"
          className="mb-2 block font-cairo text-[12px] font-extrabold text-[#344054]"
        >
          {t('accountDeletion.password.currentPasswordLabel')}
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
            aria-hidden
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-[#98A2B3] transition hover:text-[#667085]"
            aria-label={
              visible
                ? t('accountDeletion.password.hidePassword')
                : t('accountDeletion.password.showPassword')
            }
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
          <input
            id="delete-account-password"
            type={visible ? 'text' : 'password'}
            autoComplete="current-password"
            className="h-[48px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-10 ps-10 text-start font-cairo text-[13px] font-semibold text-[#111827] outline-none ring-[#EF4444]/20 focus:border-[#EF4444] focus:ring-2"
            placeholder="••••••••"
            {...register('currentPassword')}
          />
        </div>

        {errors.currentPassword ? (
          <p className="mt-2 text-start font-cairo text-[12px] font-bold text-[#DC2626]">
            {errors.currentPassword.message}
          </p>
        ) : null}

        <div className="mt-4 rounded-[10px] border border-[#FECACA] bg-[#FFFBEB] px-4 py-3 text-start">
          <p className="font-cairo text-[12px] font-semibold leading-[20px] text-[#92400E]">
            <span className="font-extrabold text-[#EF4444]">!</span>{' '}
            {t('accountDeletion.password.securityNotice')}
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-3 text-start font-cairo text-[12px] font-bold text-[#DC2626]"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 flex h-[48px] w-full items-center justify-center rounded-[10px] bg-[#EF4444] font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(239,68,68,0.28)] transition hover:bg-[#DC2626] disabled:opacity-60"
        >
          {busy
            ? t('accountDeletion.otp.verifying')
            : t('accountDeletion.password.continue')}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="mt-4 font-cairo text-[13px] font-extrabold text-[#667085] transition hover:text-[#111827]"
        >
          {t('accountDeletion.otp.back')}
        </button>
      </form>
    </div>
  );
}
