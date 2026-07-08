'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Loader2, Stethoscope, X } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useFacilityDoctors } from '@/hooks/admin/services/useAdminServices';
import type { FacilitySummary } from '@/lib/admin/types';

const PAGE_SIZE = 10;

function resolveFacilityId(facility: FacilitySummary | null): string {
  return facility?.id || facility?._id || '';
}

function getDoctorStatusLabel(status?: string) {
  switch (status) {
    case 'approved':
      return 'مقبول';
    case 'rejected':
      return 'مرفوض';
    default:
      return 'قيد المراجعة';
  }
}

export default function FacilityDoctorsDialog({
  open,
  onOpenChange,
  facility,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facility: FacilitySummary | null;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim());
  const facilityId = resolveFacilityId(facility);

  useEffect(() => {
    if (!open) {
      setPage(1);
      setSearch('');
    }
  }, [facilityId, open]);

  const doctorsQuery = useFacilityDoctors(
    facilityId,
    {
      page,
      limit: PAGE_SIZE,
      q: deferredSearch || undefined,
      sortBy: 'name',
      sortOrder: 'asc',
    },
    open && Boolean(facilityId),
  );

  const totalPages = Math.max(1, Math.ceil((doctorsQuery.total || 0) / PAGE_SIZE));
  const rows = useMemo(() => doctorsQuery.doctors, [doctorsQuery.doctors]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-[120] bg-black/40' />
        <Dialog.Content className='fixed left-1/2 top-1/2 z-[121] max-h-[85vh] w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[14px] bg-white shadow-2xl'>
          <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
            <div className='text-right'>
              <Dialog.Title className='font-cairo text-[16px] font-black text-[#111827]'>
                أطباء المنشأة
              </Dialog.Title>
              <Dialog.Description className='mt-1 font-cairo text-[12px] font-semibold text-[#667085]'>
                {facility?.name ?? '—'}
                {doctorsQuery.total > 0 ? ` — ${doctorsQuery.total} طبيب` : ''}
              </Dialog.Description>
            </div>
            <Dialog.Close className='rounded-[8px] p-2 text-[#667085] hover:bg-[#F9FAFB]'>
              <X className='h-5 w-5' />
            </Dialog.Close>
          </div>

          <div className='border-b border-[#EEF2F6] px-6 py-3'>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder='بحث بالاسم أو التخصص...'
              className='h-[40px] w-full rounded-[8px] border border-[#E5E7EB] px-3 text-right font-cairo text-[12px] font-bold text-[#111827]'
            />
          </div>

          <div className='max-h-[52vh] overflow-y-auto px-6 py-4'>
            {doctorsQuery.isAwaitingData ? (
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='h-7 w-7 animate-spin text-primary' />
              </div>
            ) : rows.length === 0 ? (
              <p className='py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                لا يوجد أطباء مرتبطون بهذه المنشأة.
              </p>
            ) : (
              <div className='space-y-2'>
                {rows.map((doctor) => {
                  const doctorId = doctor.id ?? doctor._id ?? '';
                  const name = doctor.user?.fullName?.trim() || '—';
                  const status = getDoctorStatusLabel(doctor.approvalStatus);

                  return (
                    <div
                      key={doctorId}
                      className='flex items-center justify-between rounded-[10px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-3'
                    >
                      <div className='text-right'>
                        <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>{name}</div>
                        <div className='mt-1 font-cairo text-[11px] font-semibold text-[#667085]'>
                          {doctor.specialization?.trim() || '—'}
                          {doctor.user?.email ? ` · ${doctor.user.email}` : ''}
                        </div>
                      </div>
                      <span className='inline-flex items-center gap-1 rounded-[6px] bg-[#E7FBFA] px-2.5 py-1 font-cairo text-[11px] font-extrabold text-primary'>
                        <Stethoscope className='h-3.5 w-3.5' />
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {doctorsQuery.total > PAGE_SIZE ? (
            <div className='flex items-center justify-between border-t border-[#EEF2F6] px-6 py-3'>
              <button
                type='button'
                disabled={page <= 1}
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                className='rounded-[8px] border border-[#E5E7EB] px-3 py-1.5 font-cairo text-[12px] font-bold disabled:opacity-50'
              >
                السابق
              </button>
              <span className='font-cairo text-[12px] font-semibold text-[#667085]'>
                {page} / {totalPages}
              </span>
              <button
                type='button'
                disabled={page >= totalPages}
                onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                className='rounded-[8px] border border-[#E5E7EB] px-3 py-1.5 font-cairo text-[12px] font-bold disabled:opacity-50'
              >
                التالي
              </button>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
