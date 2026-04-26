import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export default function AddOrderTypeButton({ onClick, disabled, className }: Props) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-[40px] shrink-0 items-center justify-center gap-2 rounded-[10px] border-2 border-primary bg-white px-4 font-cairo text-[13px] font-extrabold text-primary shadow-sm transition-colors hover:bg-[#E7FBFA] disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
    >
      <Plus className='h-4 w-4' strokeWidth={2.5} aria-hidden />
      إضافة نوع جديد
    </button>
  );
}
