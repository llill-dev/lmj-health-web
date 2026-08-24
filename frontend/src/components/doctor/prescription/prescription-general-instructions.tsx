import {
  profileFieldClass,
  profileInputInvalidClass,
  profileTextareaClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import { cn } from '@/lib/utils/utils';
import { useI18n } from '@/i18n/provider';

export function PrescriptionGeneralInstructions({
  value,
  onChange,
  disabled,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  const { locale, dir } = useI18n();
  return (
    <section className="mb-6">
      <h2 className="mb-1 text-start font-cairo text-[14px] font-extrabold text-[#667085]">
        التعليمات العامة
        <span className="ms-1 font-semibold text-[#98A2B3]">(اختياري)</span>
      </h2>
      <p className="mb-3 text-start font-cairo text-[12px] font-semibold text-[#98A2B3]">
        يمكنك ترك هذا الحقل فارغاً. الأدوية تُحفظ عند إضافتها؛ «حفظ المسودة»
        يحفظ التعليمات العامة فقط عند تعديلها.
      </p>
      <textarea
        dir={dir}
        lang={locale}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="أضف تعليمات عامة للمريض (اختياري)..."
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={cn(
          profileFieldClass(profileTextareaClass, Boolean(error)),
          'min-h-[120px] disabled:cursor-not-allowed disabled:opacity-70',
          error && profileInputInvalidClass,
        )}
      />
      {error ? (
        <p
          role="alert"
          className="mt-1.5 text-start font-cairo text-[11px] font-bold text-[#D92D20]"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
