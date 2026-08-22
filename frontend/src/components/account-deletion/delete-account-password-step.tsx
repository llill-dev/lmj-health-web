import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  deleteAccountPasswordSchema,
  type DeleteAccountPasswordValues,
} from '@/lib/auth/accountDeletionSchemas';

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
  const [visible, setVisible] = useState(false);
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
        تأكيد الهوية
      </h2>
      <p className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
        أدخل كلمة المرور للمتابعة
      </p>

      <form
        className="mt-6 text-right"
        noValidate
        onSubmit={handleSubmit((values) =>
          void onContinue(values.currentPassword),
        )}
      >
        <label
          htmlFor="delete-account-password"
          className="mb-2 block font-cairo text-[12px] font-extrabold text-[#344054]"
        >
          كلمة المرور الحالية
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
            aria-hidden
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-[#98A2B3] transition hover:text-[#667085]"
            aria-label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
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
            className="h-[48px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-10 ps-10 text-right font-cairo text-[13px] font-semibold text-[#111827] outline-none ring-[#EF4444]/20 focus:border-[#EF4444] focus:ring-2"
            placeholder="••••••••"
            {...register('currentPassword')}
          />
        </div>

        {errors.currentPassword ? (
          <p className="mt-2 text-right font-cairo text-[12px] font-bold text-[#DC2626]">
            {errors.currentPassword.message}
          </p>
        ) : null}

        <div className="mt-4 rounded-[10px] border border-[#FECACA] bg-[#FFFBEB] px-4 py-3 text-right">
          <p className="font-cairo text-[12px] font-semibold leading-[20px] text-[#92400E]">
            <span className="font-extrabold text-[#EF4444]">!</span> لحماية حسابك،
            نحتاج إلى التأكد من هويتك قبل إتمام عملية الحذف
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-3 text-right font-cairo text-[12px] font-bold text-[#DC2626]"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 flex h-[48px] w-full items-center justify-center rounded-[10px] bg-[#EF4444] font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(239,68,68,0.28)] transition hover:bg-[#DC2626] disabled:opacity-60"
        >
          {busy ? 'جارٍ التحقق…' : 'متابعة'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="mt-4 font-cairo text-[13px] font-extrabold text-[#667085] transition hover:text-[#111827]"
        >
          الرجوع ←
        </button>
      </form>
    </div>
  );
}
