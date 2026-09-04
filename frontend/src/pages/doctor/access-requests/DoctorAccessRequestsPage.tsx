import { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Search,
  Shield,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import DashboardOverviewSection from '@/components/doctor/dashboard/dashboard-overview-section';
import AddAccessRequestForm from '@/components/doctor/access-requests/add-access-request-form';
import {
  useCreateDoctorAccessRequest,
  useDoctorAccessRequests,
  useDoctorPatients,
} from '@/hooks';
import { readAuthUser } from '@/lib/cookies';
import { useToast } from '@/components/ui/ToastProvider';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { useI18n } from '@/i18n/provider';
import { DoctorExpandableCardSkeleton } from '@/components/doctor/shared/skeletons';

type AccessRequestStatus = 'pending' | 'approved' | 'rejected' | 'expired';

function normalizeStatus(status?: string): AccessRequestStatus {
  if (status === 'approved') return 'approved';
  if (status === 'denied' || status === 'rejected') return 'rejected';
  if (status === 'expired') return 'expired';
  return 'pending';
}

function statusLabel(status: AccessRequestStatus, t: (key: string) => string) {
  switch (status) {
    case 'pending':
      return t('doctor.accessRequests.status.pending');
    case 'approved':
      return t('doctor.accessRequests.status.approved');
    case 'rejected':
      return t('doctor.accessRequests.status.rejected');
    case 'expired':
      return t('doctor.accessRequests.status.expired');
  }
}

function statusChipClassName(status: AccessRequestStatus) {
  switch (status) {
    case 'pending':
      return 'inline-flex items-center justify-center rounded-full bg-[#FEF6EE] px-3 py-1 font-cairo text-[11px] font-extrabold text-[#F79009]';
    case 'approved':
      return 'inline-flex items-center justify-center rounded-full bg-[#ECFDF3] px-3 py-1 font-cairo text-[11px] font-extrabold text-[#027A48]';
    case 'rejected':
      return 'inline-flex items-center justify-center rounded-full bg-[#FEF3F2] px-3 py-1 font-cairo text-[11px] font-extrabold text-[#B42318]';
    case 'expired':
      return 'inline-flex items-center justify-center rounded-full bg-[#F2F4F7] px-3 py-1 font-cairo text-[11px] font-extrabold text-[#667085]';
  }
}

function bottomBarClassName(status: AccessRequestStatus) {
  if (status === 'approved') {
    return 'mt-4 flex items-center justify-start gap-2 rounded-[6px] bg-[#F0FDF4] px-4 py-3';
  }
  if (status === 'rejected') {
    return 'mt-4 flex items-center justify-start gap-2 rounded-[6px] bg-[#FEF3F2] px-4 py-3';
  }
  if (status === 'expired') {
    return 'mt-4 flex items-center justify-start gap-2 rounded-[6px] bg-[#F2F4F7] px-4 py-3';
  }
  return 'mt-4 flex items-center justify-start gap-2 rounded-[6px] bg-[#FFFAEB] px-4 py-3';
}

function bottomBarIcon(status: AccessRequestStatus) {
  if (status === 'approved') {
    return <CheckCircle2 className='h-4 w-4 text-[#12B76A]' />;
  }
  if (status === 'rejected') {
    return <XCircle className='h-4 w-4 text-[#F04438]' />;
  }
  if (status === 'expired') {
    return <Clock className='h-4 w-4 text-[#667085]' />;
  }
  return <Clock className='h-4 w-4 text-primary' />;
}

function bottomBarTextClassName(status: AccessRequestStatus) {
  if (status === 'approved') {
    return 'font-cairo text-[12px] font-extrabold text-[#027A48]';
  }
  if (status === 'rejected') {
    return 'font-cairo text-[12px] font-extrabold text-[#B42318]';
  }
  if (status === 'expired') {
    return 'font-cairo text-[12px] font-extrabold text-[#667085]';
  }
  return 'font-cairo text-[12px] font-extrabold text-[#111827]';
}

function formatArabicDate(
  value: string | null | undefined,
  locale: 'ar' | 'en',
  t: (key: string) => string,
) {
  if (!value) return t('doctor.accessRequests.notSpecified');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US');
}

export default function DoctorAccessRequestsPage() {
  const { t, locale, dir } = useI18n();
  const { toast } = useToast();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState<'list' | 'create'>('list');

  const listQuery = useDoctorAccessRequests({ page: 1, limit: 50 });
  const patientsQuery = useDoctorPatients({ page: 1, limit: 100 });
  const createMutation = useCreateDoctorAccessRequest(doctorId);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return listQuery.requests.filter((request) => {
      const patientName =
        request.patient?.user?.fullName ??
        request.patient?.userId?.fullName ??
        '';
      if (!q) return true;
      return (
        patientName.toLowerCase().includes(q) ||
        (request.reason ?? '').toLowerCase().includes(q)
      );
    });
  }, [listQuery.requests, searchTerm]);

  const pendingCount = listQuery.requests.filter(
    (x) => normalizeStatus(x.status) === 'pending',
  ).length;
  const approvedCount = listQuery.requests.filter(
    (x) => normalizeStatus(x.status) === 'approved',
  ).length;
  const rejectedCount = listQuery.requests.filter(
    (x) => normalizeStatus(x.status) === 'rejected',
  ).length;

  return (
    <>
      <Helmet>
        <title>{t('doctor.accessRequests.page.title')} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale} className='pb-8 sm:pb-10'>
        <DashboardOverviewSection
          sectionClassName='flex flex-col gap-[18px] mb-6 py-[22px] px-[24px] rounded-[24px] bg-primary shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]'
          overlay={
            mode === 'create' ? (
              <motion.button
                type='button'
                onClick={() => setMode('list')}
                className='absolute end-4 top-4 flex h-[40px] w-[40px] items-center justify-center rounded-[6px] bg-white shadow-[0_14px_24px_rgba(0,0,0,0.16)] sm:end-[16px] sm:top-[16px]'
                aria-label={t('doctor.accessRequests.close')}
              >
                <X className='h-5 w-5 text-[#0F8F8B]' />
              </motion.button>
            ) : null
          }
          headerLeft={
            <div className='flex w-full flex-col items-start justify-between gap-[16px] sm:flex-row'>
              <div className='flex flex-row items-start gap-[12px]'>
                <div className='bg-[#FFFFFF33] w-[56px] h-[56px] flex items-center justify-center rounded-[6px]'>
                  <Shield className='text-white w-[28px] h-[28px]' />
                </div>
                <div className='flex flex-col gap-1 text-start'>
                  <h1 className='font-cairo text-[12px] font-semibold leading-[18px] text-[#FFFFFFCC]'>
                    {t('doctor.accessRequests.page.title')}
                  </h1>
                  <span className='font-cairo text-[22px] font-black leading-[28px] text-[#FFFFFF]'>
                    {t('doctor.accessRequests.requestsCount', { count: listQuery.total })}
                  </span>
                </div>
              </div>
            </div>
          }
          headerRight={
            mode !== 'create' ? (
              <motion.button
                type='button'
                onClick={() => setMode('create')}
                className='flex items-center justify-center gap-2 rounded-[6px] h-[40px] bg-[#FFFFFF] px-4 font-cairo text-[12px] font-extrabold text-primary shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]'
              >
                <Plus className='h-4 w-4' />
                {t('doctor.accessRequests.addRequest')}
              </motion.button>
            ) : undefined
          }
          kpiGridClassName='grid grid-cols-3 gap-[10px]'
          cards={[
            <div key='rejected' className='flex h-[64px] items-center justify-center rounded-[6px] bg-white/15 px-4'>
              <div className='text-center'>
                <div className='font-cairo text-[18px] font-black text-white'>{rejectedCount}</div>
                <div className='mt-1 font-cairo text-[12px] font-bold text-white/80'>{t('doctor.accessRequests.status.rejected')}</div>
              </div>
            </div>,
            <div key='approved' className='flex h-[64px] items-center justify-center rounded-[6px] bg-white/15 px-4'>
              <div className='text-center'>
                <div className='font-cairo text-[18px] font-black text-white'>{approvedCount}</div>
                <div className='mt-1 font-cairo text-[12px] font-bold text-white/80'>{t('doctor.accessRequests.status.approved')}</div>
              </div>
            </div>,
            <div key='pending' className='flex h-[64px] items-center justify-center rounded-[6px] bg-white/15 px-4'>
              <div className='text-center'>
                <div className='font-cairo text-[18px] font-black text-white'>{pendingCount}</div>
                <div className='mt-1 font-cairo text-[12px] font-bold text-white/80'>{t('doctor.accessRequests.status.pending')}</div>
              </div>
            </div>,
          ]}
        />

        <AnimatePresence mode='wait' initial={false}>
          {mode === 'create' ? (
            <motion.div
              key='create'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >

              <AddAccessRequestForm
                patients={patientsQuery.patients.map((patient) => ({
                  id: patient._id,
                  name: patient.user.fullName,
                }))}
                onCancel={() => setMode('list')}
                onSubmit={async (payload) => {
                  try {
                    await createMutation.mutateAsync({
                      patientId: payload.patientId,
                      body: {
                        reason: payload.reason,
                        items: payload.items.map((type) => ({ type })),
                        expiresAt: payload.expiresAt || undefined,
                      },
                    });
                    toast(t('doctor.accessRequests.toast.success'), {
                      title: t('doctor.accessRequests.toast.saved'),
                      variant: 'success',
                    });
                    setMode('list');
                    void listQuery.refetch();
                  } catch (error) {
                    toast(getUserFacingRequestErrorMessage(error), {
                      title: t('doctor.accessRequests.toast.failed'),
                      variant: 'error',
                    });
                  }
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key='list'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <section className='mb-6 rounded-[6px] border border-[#EEF2F6] bg-white px-4 py-4 shadow-[0_12px_26px_rgba(0,0,0,0.08)] sm:px-5'>
                <div className='relative'>
                  <div className='pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                    <Search className='h-4 w-4' />
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('doctor.accessRequests.search.placeholder')}
                    className='h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white pe-4 ps-10 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]'
                  />
                </div>
              </section>

              {listQuery.isAwaitingData ? (
                <DoctorExpandableCardSkeleton count={4} />
              ) : listQuery.error ? (
                <div className='rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center font-cairo text-[14px] font-semibold text-[#B42318]'>
                  {getUserFacingRequestErrorMessage(listQuery.error)}
                </div>
              ) : filtered.length === 0 ? (
                <div className='rounded-[18px] border border-dashed border-[#D0D5DD] bg-white px-6 py-12 text-center'>
                  <div className='font-cairo text-[15px] font-extrabold text-[#111827]'>
                    {t('doctor.accessRequests.empty.noRequests')}
                  </div>
                  <div className='mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    {t('doctor.accessRequests.empty.createNew')}
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  {filtered.map((request) => {
                    const status = normalizeStatus(request.status);
                    const patientName =
                      request.patient?.user?.fullName ??
                      request.patient?.userId?.fullName ??
                      t('doctor.accessRequests.patient');

                    return (
                      <div
                        key={request._id}
                        className='overflow-hidden rounded-[24px] border border-[#E7EEF5] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] shadow-[0_18px_34px_rgba(15,23,42,0.08)] transition hover:shadow-[0_24px_44px_rgba(15,23,42,0.12)]'
                      >
                        <div className='border-b border-[#EEF2F6] bg-[linear-gradient(90deg,#f7fbfb_0%,#ffffff_100%)] px-6 py-5'>
                          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                            <div className='flex items-center gap-4'>
                              <div className='flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f8f8b_0%,#14b8a6_100%)] text-white shadow-[0_12px_22px_rgba(15,143,139,0.24)]'>
                                <UserRound className='h-5 w-5' />
                              </div>
                              <div className='text-start'>
                                <div className='font-cairo text-[15px] font-extrabold text-[#101828]'>
                                  {patientName}
                                </div>
                                <div className='mt-1 flex items-center justify-start gap-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                                  <span>{request.patient?.publicId ?? request._id}</span>
                                  <span className='h-1 w-1 rounded-full bg-[#D0D5DD]' />
                                  <span>{t('doctor.accessRequests.medicalRequest')}</span>
                                </div>
                              </div>
                            </div>
                            <div className={statusChipClassName(status)}>
                              {statusLabel(status, t)}
                            </div>
                          </div>
                        </div>

                        <div className='px-6 py-5'>
                          <div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
                            <div className='rounded-[16px] border border-[#EEF2F6] bg-[#F9FAFB] px-4 py-4 text-start'>
                              <div className='flex items-center justify-start gap-2 font-cairo text-[11px] font-bold text-[#98A2B3]'>
                                <FileText className='h-4 w-4' />
                                <span>{t('doctor.accessRequests.requestDate')}</span>
                              </div>
                              <div className='mt-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
                                {formatArabicDate(request.createdAt, locale, t)}
                              </div>
                            </div>

                            <div className='rounded-[16px] border border-[#EEF2F6] bg-[#F9FAFB] px-4 py-4 text-start'>
                              <div className='flex items-center justify-start gap-2 font-cairo text-[11px] font-bold text-[#98A2B3]'>
                                <Shield className='h-4 w-4' />
                                <span>{t('doctor.accessRequests.accessScope')}</span>
                              </div>
                              <div className='mt-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
                                {request.scope ?? 'PROFILE'}
                              </div>
                            </div>

                            <div className='rounded-[16px] border border-[#EEF2F6] bg-[#F9FAFB] px-4 py-4 text-start'>
                              <div className='flex items-center justify-start gap-2 font-cairo text-[11px] font-bold text-[#98A2B3]'>
                                <FileText className='h-4 w-4' />
                                <span>{t('doctor.accessRequests.requestSource')}</span>
                              </div>
                              <div className='mt-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
                                {t('doctor.accessRequests.treatingDoctor')}
                              </div>
                            </div>
                          </div>

                          <div className='mt-4 rounded-[18px] border border-[#E6F4F3] bg-[#F6FFFE] px-4 py-4 text-start'>
                            <div className='font-cairo text-[11px] font-bold text-primary/80'>
                              {t('doctor.accessRequests.requestReason')}
                            </div>
                            <div className='mt-2 font-cairo text-[13px] font-semibold leading-7 text-[#344054]'>
                              {request.reason ||
                                (status === 'approved'
                                  ? t('doctor.accessRequests.reason.approved')
                                  : status === 'rejected'
                                    ? t('doctor.accessRequests.reason.rejected')
                                    : status === 'expired'
                                      ? t('doctor.accessRequests.reason.expired')
                                      : t('doctor.accessRequests.reason.pending'))}
                            </div>
                          </div>

                          <div className={bottomBarClassName(status)}>
                            {bottomBarIcon(status)}
                            <div className={bottomBarTextClassName(status)}>
                              {status === 'approved'
                                ? t('doctor.accessRequests.statusMessage.approved')
                                : status === 'rejected'
                                  ? t('doctor.accessRequests.statusMessage.rejected')
                                  : status === 'expired'
                                    ? t('doctor.accessRequests.statusMessage.expired')
                                    : t('doctor.accessRequests.statusMessage.pending')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
