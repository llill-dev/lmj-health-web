import { Search } from 'lucide-react';
import AddOrderTypeButton from './AddOrderTypeButton';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  addDisabled?: boolean;
};

export default function MedicalOrderCatalogToolbar({
  search,
  onSearchChange,
  onAddClick,
  addDisabled,
}: Props) {
  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <AddOrderTypeButton onClick={onAddClick} disabled={addDisabled} />
      <div className='relative min-w-0 flex-1 sm:max-w-2xl'>
        <Search
          className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]'
          aria-hidden
        />
        <input
          type='search'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder='بحث في القائمة…'
          className='h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-white py-2 pe-10 ps-4 text-right font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/20'
          autoComplete='off'
        />
      </div>
    </div>
  );
}
