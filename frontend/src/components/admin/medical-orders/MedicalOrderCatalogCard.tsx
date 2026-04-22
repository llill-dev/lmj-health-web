import type {
  MedicalOrderCatalogItem,
  MedicalOrderCatalogKind,
} from '@/lib/admin/types';
import { medicalOrderCatalogHeaderIcon } from './constants';
import MedicalOrderCatalogRow from './MedicalOrderCatalogRow';
import { MEDICAL_ORDER_TAB_META } from './constants';

type Props = {
  kind: MedicalOrderCatalogKind;
  items: MedicalOrderCatalogItem[];
  onEdit: (item: MedicalOrderCatalogItem) => void;
  onDelete: (item: MedicalOrderCatalogItem) => void;
  isBusy?: boolean;
};

export default function MedicalOrderCatalogCard({
  kind,
  items,
  onEdit,
  onDelete,
  isBusy,
}: Props) {
  const title =
    MEDICAL_ORDER_TAB_META.find((t) => t.kind === kind)?.label ?? '';
  const Icon = medicalOrderCatalogHeaderIcon(kind);

  return (
    <section
      className='overflow-hidden rounded-[10px] border border-[#99F6E4] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.08)]'
      aria-label={title}
    >
      <div className='flex items-center justify-between bg-gradient-to-l from-primary/25 via-[#E7FBFA]/90 to-white px-5 py-3.5'>
        <div className='font-cairo text-[15px] font-extrabold text-primary'>
          {title}
        </div>
        <Icon className='h-5 w-5 text-primary' aria-hidden />
      </div>
      <div className='px-5 py-2'>
        {items.length === 0 ? (
          <p className='py-8 text-center font-cairo text-[13px] font-semibold text-[#98A2B3]'>
            لا توجد عناصر في هذه الفئة بعد.
          </p>
        ) : (
          items.map((item) => (
            <MedicalOrderCatalogRow
              key={item._id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              deleteDisabled={isBusy}
            />
          ))
        )}
      </div>
    </section>
  );
}
