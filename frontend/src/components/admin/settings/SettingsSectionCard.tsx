import type { ComponentType, ReactNode } from 'react';

export default function SettingsSectionCard({
  title,
  icon: Icon,
  children,
  className = '',
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[14px] border border-[#EAECF0] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.05)] ${className}`}
    >
      <div className='flex justify-between items-center px-6 py-4 md:px-7'>
        <div className='flex gap-2 items-center text-right'>
          <div className='flex h-7 w-7 items-center justify-center rounded-[8px] bg-primary/10'>
            <Icon className='w-4 h-4 text-primary' />
          </div>
          <div className='font-cairo text-[14px] font-black text-[#111827]'>
            {title}
          </div>
        </div>
      </div>
      <div className='border-t border-[#EAECF0] px-6 py-5 md:px-7'>
        {children}
      </div>
    </section>
  );
}
