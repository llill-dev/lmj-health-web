import {
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Stethoscope,
  ToggleLeft,
  ToggleRight,
  X,
} from 'lucide-react';
import type { ElementType } from 'react';
import { StatusBadge } from '@/components/admin/services/StatusBadge';
import type { FacilitySummary } from '@/lib/admin/services/types';

export function FacilityCard({
  facility,
  tabIcon: TabIcon,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling,
}: {
  facility: FacilitySummary;
  tabIcon: ElementType;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  isToggling: boolean;
}) {
  const isActive = facility.status === 'ACTIVE';

  return (
    <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_16px_32px_rgba(0,0,0,0.09)]'>
      <div className='flex items-start justify-between'>
        <div className='flex items-start gap-4'>
          <div className='flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.25)]'>
            <TabIcon className='h-5 w-5' />
          </div>
          <div className='text-right'>
            <div className='flex items-center gap-2'>
              <span className='font-cairo text-[16px] font-black text-[#111827]'>{facility.name}</span>
              <StatusBadge status={facility.status} />
            </div>

            <div className='mt-2 flex flex-wrap items-center justify-start gap-5 font-cairo text-[12px] font-bold text-[#98A2B3]'>
              <div className='inline-flex items-center gap-1.5'>
                <MapPin className='h-3.5 w-3.5 text-primary' />
                {facility.city}
                {facility.country ? ` · ${facility.country}` : ''}
              </div>
              {facility.phone && (
                <div className='inline-flex items-center gap-1.5' dir='ltr'>
                  <Phone className='h-3.5 w-3.5 text-primary' />
                  {facility.phone}
                </div>
              )}
              {facility.doctorCount > 0 && (
                <div className='inline-flex items-center gap-1.5'>
                  <Stethoscope className='h-3.5 w-3.5 text-primary' />
                  {facility.doctorCount} طبيب
                </div>
              )}
            </div>

            {facility.description && (
              <p className='mt-2 max-w-[480px] font-cairo text-[12px] font-semibold leading-[18px] text-[#6B7280]'>
                {facility.description}
              </p>
            )}

            {facility.attributes.length > 0 && (
              <div className='mt-3 flex flex-wrap items-center justify-start gap-2'>
                {facility.attributes.map((attr) => (
                  <span
                    key={attr}
                    className='inline-flex h-[22px] items-center rounded-[6px] bg-[#E7FBFA] px-2.5 font-cairo text-[11px] font-extrabold text-primary'
                  >
                    {attr}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-2 pt-1'>
          <button
            type='button'
            title={isActive ? 'تعطيل' : 'تفعيل'}
            onClick={onToggleStatus}
            disabled={isToggling || facility.status === 'DELETED'}
            className='flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#667085] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40'
          >
            {isToggling ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : isActive ? (
              <ToggleRight className='h-4 w-4' />
            ) : (
              <ToggleLeft className='h-4 w-4' />
            )}
          </button>

          <button
            type='button'
            title='تعديل'
            onClick={onEdit}
            className='flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-[#D1FAE5] bg-white text-primary transition hover:bg-[#E7FBFA]'
          >
            <Pencil className='h-3.5 w-3.5' />
          </button>

          <button
            type='button'
            title='حذف'
            onClick={onDelete}
            className='flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-[#FEE2E2] bg-white text-[#EF4444] transition hover:bg-[#FEF2F2]'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
}
