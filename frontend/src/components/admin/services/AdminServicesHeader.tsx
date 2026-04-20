import { ClipboardList } from 'lucide-react';

export function AdminServicesHeader({
  showAddFacility,
  onAddFacility,
}: {
  showAddFacility: boolean;
  onAddFacility: () => void;
}) {
  return (
    <div className='flex items-start justify-between'>
      <div className='text-right'>
        <h1 className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
          إدارة دليل الخدمات
        </h1>
        <p className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
          إدارة المنشآت الصحية وأنواع الخدمات المتاحة للمرضى
        </p>
      </div>

      {showAddFacility && (
        <button
          type='button'
          onClick={onAddFacility}
          className='inline-flex h-[36px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.20)]'
        >
          <ClipboardList className='h-4 w-4' />
          إضافة منشأة
        </button>
      )}
    </div>
  );
}
