import { Search } from 'lucide-react';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
};

/** حقل بحث فقط — زر «إضافة» يُعرض بجانب العنوان في الصفحة. */
export default function MedicalOrderCatalogToolbar({
  search,
  onSearchChange,
}: Props) {
  return (
    <div className='relative min-w-0 w-full'>
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
        aria-label='بحث في كتالوج الطلبات'
      />
    </div>
  );
}
