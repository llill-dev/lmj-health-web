'use client';

import * as Dialog from '@radix-ui/react-dialog';
import {
  Building2,
  CalendarDays,
  Loader2,
  MapPin,
  Phone,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react';
import { StatusBadge } from '@/components/admin/services/StatusBadge';
import { useFacilityById } from '@/hooks/admin/services/useAdminServices';
import type { FacilitySummary } from '@/lib/admin/types';

export default function FacilityDetailsDialog({
  open,
  onOpenChange,
  facility,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facility: FacilitySummary | null;
}) {
  const detailsQuery = useFacilityById(facility?.id ?? '', open && Boolean(facility?.id));
  const details = detailsQuery.data?.facility ?? facility;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-[120] bg-black/40' />
        <Dialog.Content className='fixed left-1/2 top-1/2 z-[121] max-h-[85vh] w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[14px] bg-white shadow-2xl'>
          <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
            <div className='text-right'>
              <Dialog.Title className='font-cairo text-[16px] font-black text-[#111827]'>
                تفاصيل المنشأة
              </Dialog.Title>
              <Dialog.Description className='mt-1 font-cairo text-[12px] font-semibold text-[#667085]'>
                {details?.name ?? '—'}
              </Dialog.Description>
            </div>
            <Dialog.Close className='rounded-[8px] p-2 text-[#667085] hover:bg-[#F9FAFB]'>
              <X className='h-5 w-5' />
            </Dialog.Close>
          </div>

          <div className='max-h-[70vh] overflow-y-auto px-6 py-5'>
            {detailsQuery.isLoading && !details ? (
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='h-7 w-7 animate-spin text-primary' />
              </div>
            ) : !details ? (
              <div className='rounded-[10px] border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-6 text-center font-cairo text-[12px] font-semibold text-[#B42318]'>
                تعذّر تحميل تفاصيل المنشأة.
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] px-5 py-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='text-right'>
                      <div className='font-cairo text-[18px] font-black text-[#111827]'>
                        {details.name}
                      </div>
                      <div className='mt-2 flex flex-wrap items-center justify-end gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                        <span className='inline-flex items-center gap-1.5'>
                          <Building2 className='h-4 w-4 text-primary' />
                          {details.facilityType}
                        </span>
                        <span>•</span>
                        <span className='inline-flex items-center gap-1.5'>
                          <Stethoscope className='h-4 w-4 text-primary' />
                          {details.doctorCount} طبيب
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={details.status} />
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-3 text-right'>
                    <div className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
                      الموقع
                    </div>
                    <div className='mt-1 inline-flex items-center gap-1.5 font-cairo text-[13px] font-bold text-[#111827]'>
                      <MapPin className='h-4 w-4 text-primary' />
                      {details.city}
                      {details.country ? ` • ${details.country}` : ''}
                    </div>
                    {details.address ? (
                      <div className='mt-2 font-cairo text-[12px] font-semibold text-[#667085]'>
                        {details.address}
                      </div>
                    ) : null}
                  </div>

                  <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-3 text-right'>
                    <div className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
                      التواصل والمالك
                    </div>
                    <div className='mt-1 space-y-2 font-cairo text-[12px] font-semibold text-[#667085]'>
                      <div className='inline-flex items-center gap-1.5'>
                        <Phone className='h-4 w-4 text-primary' />
                        <span dir='ltr'>{details.phone ?? '—'}</span>
                      </div>
                      <div className='inline-flex items-center gap-1.5'>
                        <UserRound className='h-4 w-4 text-primary' />
                        {details.ownerDoctorId ?? 'غير مربوطة بطبيب مالك'}
                      </div>
                    </div>
                  </div>

                  <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-3 text-right'>
                    <div className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
                      المعرّفات والتواريخ
                    </div>
                    <div className='mt-1 space-y-2 font-cairo text-[12px] font-semibold text-[#667085]'>
                      <div className='break-all'>{details.id}</div>
                      {details.createdAt ? (
                        <div className='inline-flex items-center gap-1.5'>
                          <CalendarDays className='h-4 w-4 text-primary' />
                          {new Date(details.createdAt).toLocaleString('ar-SA')}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-3 text-right'>
                    <div className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
                      السمات
                    </div>
                    <div className='mt-2 flex flex-wrap items-center justify-end gap-2'>
                      {details.attributes?.length ? (
                        details.attributes.map((attr) => (
                          <span
                            key={attr}
                            className='inline-flex h-[24px] items-center rounded-[6px] bg-[#E7FBFA] px-2.5 font-cairo text-[11px] font-extrabold text-primary'
                          >
                            {attr}
                          </span>
                        ))
                      ) : (
                        <span className='font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                          لا توجد سمات
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {details.description ? (
                  <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-3 text-right'>
                    <div className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
                      الوصف
                    </div>
                    <div className='mt-2 font-cairo text-[13px] font-semibold leading-7 text-[#344054]'>
                      {details.description}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
