import { Pencil, Plus, Trash2, type LucideIcon } from 'lucide-react';

type MedicalFileOptionCardTone = {
  border: string;
  headerBg: string;
  titleText: string;
  itemBg: string;
  itemText: string;
  addText: string;
};

export type MedicalFileOptionItem = {
  id: string;
  label: string;
  isActive?: boolean;
};

type MedicalFileOptionCardProps = {
  title: string;
  items: MedicalFileOptionItem[];
  icon: LucideIcon;
  addLabel: string;
  tone: MedicalFileOptionCardTone;
  variant?: 'rows' | 'chips';
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  onAdd?: () => void;
  removingId?: string | null;
  editingId?: string | null;
};

export function MedicalFileOptionCard({
  title,
  items,
  icon: Icon,
  addLabel,
  tone,
  variant = 'rows',
  onRemove,
  onEdit,
  onAdd,
  removingId = null,
  editingId = null,
}: MedicalFileOptionCardProps) {
  return (
    <div
      className={`rounded-[10px] border bg-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] ${tone.border}`}
    >
      <div
        className={`flex items-center justify-between rounded-t-[10px] px-5 py-4 ${tone.headerBg}`}
      >
        <div className={`font-cairo text-[14px] font-extrabold ${tone.titleText}`}>
          {title}
        </div>
        <Icon className={`h-5 w-5 ${tone.titleText}`} />
      </div>

      <div className='px-5 py-4'>
        {variant === 'chips' ? (
          <div className='flex flex-1 flex-wrap justify-end gap-2'>
            {items.map((item) => (
              <span
                key={item.id}
                className={`inline-flex h-[28px] items-center justify-center rounded-[8px] px-3 font-cairo text-[12px] font-extrabold ${tone.itemBg} ${tone.itemText}`}
              >
                {item.label}
              </span>
            ))}
          </div>
        ) : (
          <div className='space-y-2'>
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex h-[40px] items-center justify-between rounded-[6px] px-4 ${tone.itemBg}`}
              >
                <div className={`font-cairo text-[12px] font-bold ${tone.itemText}`}>
                  {item.label}
                </div>
                <div className='flex items-center gap-1'>
                  <button
                    type='button'
                    onClick={() => onEdit?.(item.id)}
                    disabled={!onEdit || editingId === item.id}
                    className='flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[#667085] disabled:opacity-50'
                    aria-label={`تحرير ${item.label}`}
                  >
                    <Pencil className='h-4 w-4' />
                  </button>
                  <button
                    type='button'
                    onClick={() => onRemove?.(item.id)}
                    disabled={!onRemove || removingId === item.id}
                    className='flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[#EF4444] disabled:opacity-50'
                    aria-label={`حذف ${item.label}`}
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type='button'
          onClick={onAdd}
          disabled={!onAdd}
          className={`mt-4 inline-flex h-[36px] w-full items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] font-cairo text-[12px] font-extrabold ${tone.addText} disabled:opacity-50`}
        >
          <Plus className='h-4 w-4' />
          {addLabel}
        </button>
      </div>
    </div>
  );
}
