import type { ReactNode } from 'react';

export default function AuthBackground({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-h-screen w-full bg-[url('/images/bg-auth.jpg')] bg-cover bg-center bg-no-repeat ${className}`}
    >
      {children}
    </div>
  );
}
