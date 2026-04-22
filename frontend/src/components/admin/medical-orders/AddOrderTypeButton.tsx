import { Plus } from 'lucide-react';

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export default function AddOrderTypeButton({ onClick, disabled }: Props) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className='inline-flex h-[40px] shrink-0 items-center justify-center gap-2 rounded-[10px] border-2 border-primary bg-white px-4 font-cairo text-[13px] font-extrabold text-primary shadow-sm transition-colors hover:bg-[#E7FBFA] disabled:pointer-events-none disabled:opacity-50'
    >
      <Plus className='h-4 w-4' strokeWidth={2.5} aria-hidden />
      إضافة نوع جديد
    </button>
  );
}
