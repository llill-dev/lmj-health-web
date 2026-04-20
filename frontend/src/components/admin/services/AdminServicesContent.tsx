import type { ElementType } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { EmptyState } from '@/components/admin/services/EmptyState';
import { FacilityCard } from '@/components/admin/services/FacilityCard';
import { Pagination } from '@/components/admin/services/Pagination';
import { ServiceTypeCard } from '@/components/admin/services/ServiceTypeCard';
import { ADMIN_SERVICES_PAGE_SIZE } from '@/components/admin/services/tabsConfig';
import type { FacilitySummary, ServiceType } from '@/lib/admin/services/types';

export function AdminServicesContent({
  isLoading,
  isError,
  isFacilityTab,
  facilityTabIcon,
  onRetry,
  facilities,
  serviceTypes,
  page,
  total,
  totalPages,
  onPageChange,
  togglingId,
  onEditFacility,
  onDeleteFacility,
  onToggleFacilityStatus,
}: {
  isLoading: boolean;
  isError: boolean;
  isFacilityTab: boolean;
  facilityTabIcon: ElementType;
  onRetry: () => void;
  facilities: FacilitySummary[];
  serviceTypes: ServiceType[];
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  togglingId: string | null;
  onEditFacility: (f: FacilitySummary) => void;
  onDeleteFacility: (f: FacilitySummary) => void;
  onToggleFacilityStatus: (f: FacilitySummary) => void;
}) {
  return (
    <section className='mt-6 space-y-4'>
      {isLoading && (
        <div className='flex items-center justify-center py-16'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      )}

      {isError && !isLoading && (
        <div className='flex flex-col items-center gap-3 rounded-[12px] border border-[#FEE2E2] bg-white py-12 text-center'>
          <AlertCircle className='h-8 w-8 text-[#F04438]' />
          <p className='font-cairo text-[14px] font-bold text-[#F04438]'>حدث خطأ أثناء تحميل البيانات</p>
          <button
            type='button'
            onClick={onRetry}
            className='inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[12px] font-bold text-[#667085]'
          >
            <RefreshCw className='h-4 w-4' />
            إعادة المحاولة
          </button>
        </div>
      )}

      {!isLoading && !isError && isFacilityTab && (
        <>
          {facilities.length === 0 ? (
            <EmptyState message='لا توجد منشآت لهذا النوع. أضف منشأة جديدة من الزر أعلاه.' />
          ) : (
            facilities.map((facility) => (
              <FacilityCard
                key={facility.id}
                facility={facility}
                tabIcon={facilityTabIcon}
                onEdit={() => onEditFacility(facility)}
                onDelete={() => onDeleteFacility(facility)}
                onToggleStatus={() => onToggleFacilityStatus(facility)}
                isToggling={togglingId === facility.id}
              />
            ))
          )}

          {total > 0 && (
            <div className='flex items-center justify-between pt-2'>
              <p className='font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                عرض {(page - 1) * ADMIN_SERVICES_PAGE_SIZE + 1}–
                {Math.min(page * ADMIN_SERVICES_PAGE_SIZE, total)} من {total} منشأة
              </p>
              <Pagination page={page} totalPages={totalPages} onPage={onPageChange} />
            </div>
          )}
        </>
      )}

      {!isLoading && !isError && !isFacilityTab && (
        <>
          {serviceTypes.length === 0 ? (
            <EmptyState message='لا توجد أنواع خدمات مُعرَّفة بعد.' />
          ) : (
            serviceTypes.map((st) => <ServiceTypeCard key={st._id} st={st} />)
          )}
        </>
      )}
    </section>
  );
}
