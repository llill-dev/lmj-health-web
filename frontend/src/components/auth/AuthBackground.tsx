import type { ReactNode } from 'react';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { useI18n } from '@/i18n/provider';

export default function AuthBackground({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const { locale, dir } = useI18n();

  return (
    <div
      dir={dir}
      lang={locale}
      className={`min-h-screen w-full bg-[url('/images/bg-auth.jpg')] bg-cover bg-center bg-no-repeat ${className}`}
    >
      <div className='flex justify-end px-4 pt-4 sm:px-6'>
        <LanguageSwitcher />
      </div>
      {children}
    </div>
  );
}
