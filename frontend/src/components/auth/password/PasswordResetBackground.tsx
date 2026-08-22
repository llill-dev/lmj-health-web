import type { ReactNode } from 'react';

export default function PasswordResetBackground({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#E3F3F2] via-[#EDF8F7] to-[#D4EBEA]'>
      <div
        className='pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-[45%] bg-[#0F8F8B]/12 blur-[1px]'
        aria-hidden
      />
      <div
        className='pointer-events-none absolute -right-20 top-16 h-[360px] w-[360px] rounded-[42%] bg-[#65BFEC]/14'
        aria-hidden
      />
      <div
        className='pointer-events-none absolute bottom-0 left-1/3 h-[280px] w-[480px] rounded-t-[50%] bg-[#0F8F8B]/8'
        aria-hidden
      />
      <div className='relative z-10'>{children}</div>
    </div>
  );
}
