'use client';

import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Phone, XCircle } from 'lucide-react';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import {
  DoctorTableSkeleton,
  DoctorToolbarSkeleton,
} from '@/components/doctor/shared/skeletons';
import { WaitlistBookDialog } from '@/components/doctor/waitlist/waitlist-book-dialog';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useDoctorWaitlist,
  useWaitlistMutations,
  resolveWaitlistPatientName,
  resolveWaitlistPatientPublicId,
} from '@/hooks/doctor/useDoctorWaitlist';
import { useAvailableAppointmentTypes } from '@/hooks/doctor/useAppointmentTypes';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { useRetryAction } from '@/lib/query/useRetryAction';
import {
  WAITLIST_STATUS_TABS,
  isWaitlistActionable,
  waitlistStatusLabel,
  waitlistUrgencyLabel,
} from '@/lib/doctor/waitlist/labels';
import type { WaitlistRequest } from '@/lib/doctor/waitlist/types';
import { readAuthUser } from '@/lib/cookies';

function formatPreferredRange(request: WaitlistRequest): string {
  const from = request.preferredDateFrom
    ? new Date(request.preferredDateFrom).toLocaleDateString('ar')
    : '—';
  const to = request.preferredDateTo
    ? new Date(request.preferredDateTo).toLocaleDateString('ar')
    : from;
  return from === to ? from : `${from} – ${to}`;
}

export default function DoctorWaitlistPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';

  const [statusTab, setStatusTab] = useState<
    (typeof WAITLIST_STATUS_TABS)[number]['value']
  >('active');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const listParams = useMemo(
    () => ({
      status: statusTab === 'all' ? undefined : statusTab,
      q: search.trim() || undefined,
      page,
      limit,
    }),
    [limit, page, search, statusTab],
  );

  const list = useDoctorWaitlist(listParams);
  const mutations = useWaitlistMutations();
  const { appointmentTypes } = useAvailableAppointmentTypes(doctorId);
  const { retry: retryList, retrying: retryingList } = useRetryAction(() =>
    list.refetch(),
  );

  const [bookTarget, setBookTarget] = useState<WaitlistRequest | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, statusTab]);

  useEffect(() => {
    if (page > list.totalPages) setPage(list.totalPages);
  }, [list.totalPages, page]);

  const handleContacted = async (request: WaitlistRequest) => {
    try {
      await mutations.markContacted({ id: request._id });
      toast('تم تسجيل التواصل مع المريض.', { variant: 'success' });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });
    }
  };

  const handleClose = async (request: WaitlistRequest) => {
    const reason = window.prompt('سبب الإغلاق (اختياري):') ?? undefined;
    try {
      await mutations.closeRequest({
        id: request._id,
        closedReason: reason?.trim() || undefined,
      });
      toast('تم إغلاق طلب قائمة الانتظار.', { variant: 'success' });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });
    }
  };

  return (
    <>
      <Helmet>
        <title>قائمة الانتظار • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="w-full pb-10">
        <header className="mb-6 text-right">
          <h1 className="font-cairo text-[28px] font-black text-[#111827]">
            قائمة الانتظار
          </h1>
          <p className="mt-2 font-cairo text-[14px] font-semibold text-[#667085]">
            إدارة طلبات الانتظار، التواصل مع المرضى، والحجز من القائمة.
          </p>
        </header>

        <section className="rounded-[12px] border border-[#EEF2F6] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {WAITLIST_STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusTab(tab.value)}
                  className={`rounded-[8px] px-4 py-2 font-cairo text-[13px] font-extrabold transition ${
                    statusTab === tab.value
                      ? 'bg-primary text-white'
                      : 'bg-[#F8FAFC] text-[#475467] hover:bg-[#EEF2F6]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="بحث بالاسم أو الرقم العام..."
              className="h-11 w-full max-w-md rounded-[8px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[13px] font-semibold text-[#111827] outline-none focus:border-primary"
            />
          </div>

          <div className="mt-6">
            {list.isAwaitingData && !list.requests.length ? (
              <div className="space-y-4">
                <DoctorToolbarSkeleton tabs={4} />
                <DoctorTableSkeleton rows={6} columns={5} />
              </div>
            ) : list.isError ? (
              <DoctorListErrorState
                message="تعذّر تحميل قائمة الانتظار."
                onRetry={() => void retryList()}
                retrying={retryingList}
              />
            ) : list.requests.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-[10px] border border-dashed border-[#D0D5DD] bg-[#FAFAFA] px-4 text-center font-cairo text-[14px] font-semibold text-[#667085]">
                لا توجد طلبات في هذه الحالة.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-right">
                  <thead>
                    <tr className="border-b border-[#EEF2F6] font-cairo text-[12px] font-extrabold text-[#667085]">
                      <th className="px-3 py-3">المريض</th>
                      <th className="px-3 py-3">الأولوية</th>
                      <th className="px-3 py-3">الفترة المفضلة</th>
                      <th className="px-3 py-3">الحالة</th>
                      <th className="px-3 py-3">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.requests.map((request) => {
                      const actionable = isWaitlistActionable(request.status);
                      const appointmentId =
                        typeof request.appointment === 'string'
                          ? request.appointment
                          : request.appointment?._id;

                      return (
                        <tr
                          key={request._id}
                          className="border-b border-[#F2F4F7] font-cairo text-[13px]"
                        >
                          <td className="px-3 py-4">
                            <div className="font-extrabold text-[#111827]">
                              {resolveWaitlistPatientName(request)}
                            </div>
                            <div className="mt-1 text-[11px] font-semibold text-[#98A2B3]">
                              {resolveWaitlistPatientPublicId(request)}
                            </div>
                          </td>
                          <td className="px-3 py-4 font-semibold text-[#344054]">
                            {waitlistUrgencyLabel(request.urgencyLevel)}
                          </td>
                          <td className="px-3 py-4 font-semibold text-[#344054]">
                            {formatPreferredRange(request)}
                          </td>
                          <td className="px-3 py-4">
                            <span className="inline-flex rounded-full bg-[#F0FDFA] px-3 py-1 text-[11px] font-extrabold text-primary">
                              {waitlistStatusLabel(request.status)}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex flex-wrap gap-2">
                              {appointmentId ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate('/doctor/appointments')
                                  }
                                  className="inline-flex items-center gap-1 rounded-[6px] border border-primary px-3 py-1.5 text-[11px] font-extrabold text-primary"
                                >
                                  <CalendarClock className="h-3.5 w-3.5" />
                                  الموعد
                                </button>
                              ) : null}
                              {actionable ? (
                                <>
                                  <button
                                    type="button"
                                    disabled={mutations.isBusy}
                                    onClick={() => void handleContacted(request)}
                                    className="inline-flex items-center gap-1 rounded-[6px] bg-[#EFF8FF] px-3 py-1.5 text-[11px] font-extrabold text-[#175CD3] disabled:opacity-60"
                                  >
                                    <Phone className="h-3.5 w-3.5" />
                                    تم التواصل
                                  </button>
                                  <button
                                    type="button"
                                    disabled={mutations.isBusy}
                                    onClick={() => setBookTarget(request)}
                                    className="inline-flex items-center gap-1 rounded-[6px] bg-primary px-3 py-1.5 text-[11px] font-extrabold text-white disabled:opacity-60"
                                  >
                                    حجز
                                  </button>
                                  <button
                                    type="button"
                                    disabled={mutations.isBusy}
                                    onClick={() => void handleClose(request)}
                                    className="inline-flex items-center gap-1 rounded-[6px] bg-[#FEF3F2] px-3 py-1.5 text-[11px] font-extrabold text-[#B42318] disabled:opacity-60"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    إغلاق
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {list.totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 font-cairo text-[12px] font-extrabold disabled:opacity-50"
              >
                السابق
              </button>
              <span className="font-cairo text-[12px] font-semibold text-[#667085]">
                {page} / {list.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= list.totalPages}
                onClick={() =>
                  setPage((value) => Math.min(list.totalPages, value + 1))
                }
                className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 font-cairo text-[12px] font-extrabold disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          ) : null}
        </section>
      </div>

      <WaitlistBookDialog
        open={Boolean(bookTarget)}
        request={bookTarget}
        appointmentTypes={appointmentTypes}
        busy={mutations.isBusy}
        onClose={() => setBookTarget(null)}
        onBook={async (body) => {
          if (!bookTarget) return;
          try {
            const response = await mutations.bookRequest({
              id: bookTarget._id,
              body,
            });
            toast('تم حجز الموعد من قائمة الانتظار.', { variant: 'success' });
            setBookTarget(null);
            if (response.appointment?._id) {
              navigate('/doctor/appointments');
            }
          } catch (error) {
            toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });
          }
        }}
      />
    </>
  );
}
