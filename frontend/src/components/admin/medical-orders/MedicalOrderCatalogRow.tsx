import { Edit, Trash2 } from 'lucide-react';
import type { MedicalOrderCatalogItem } from '@/lib/admin/types';

type Props = {
  item: MedicalOrderCatalogItem;
  onEdit: (item: MedicalOrderCatalogItem) => void;
  onDelete: (item: MedicalOrderCatalogItem) => void;
  deleteDisabled?: boolean;
};

export default function MedicalOrderCatalogRow({
  item,
  onEdit,
  onDelete,
  deleteDisabled,
}: Props) {
  const active = item.isActive !== false;
  const visible = item.isVisible !== false;

  return (
    <div className='flex items-center justify-between gap-3 border-b border-[#F2F4F7] py-3 last:border-b-0'>
      <div className='min-w-0 flex-1 text-right'>
        <div className='font-cairo text-[13px] font-semibold text-[#344054]'>
          {item.label}
        </div>
        <div className='mt-1 flex flex-wrap justify-end gap-2'>
          <span
            className={`inline-flex items-center rounded-[999px] border px-2.5 py-0.5 font-cairo text-[10px] font-extrabold ${
              active
                ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]'
                : 'border-[#FECACA] bg-[#FEF2F2] text-[#B42318]'
            }`}
          >
            {active ? 'نشط' : 'معطّل'}
          </span>
          <span
            className={`inline-flex items-center rounded-[999px] border px-2.5 py-0.5 font-cairo text-[10px] font-extrabold ${
              visible
                ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]'
                : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#667085]'
            }`}
          >
            {visible ? 'ظاهر' : 'مخفي'}
          </span>
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-1.5'>
        <button
          type='button'
          onClick={() => onEdit(item)}
          className='flex h-8 w-8 items-center justify-center rounded-[8px] border border-primary/25 bg-[#E7FBFA] text-primary transition-colors hover:bg-primary/10'
          aria-label={`تعديل ${item.label}`}
        >
          <Edit className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => onDelete(item)}
          disabled={deleteDisabled}
          className='flex h-8 w-8 items-center justify-center rounded-[8px] text-[#EF4444] transition-colors hover:bg-red-50 disabled:pointer-events-none disabled:opacity-40'
          aria-label={`حذف ${item.label}`}
        >
          <Trash2 className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}
