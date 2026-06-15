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
import { DoctorExpandableCardSkeleton } from '@/components/doctor/shared/skeletons';

type AccessRequestStatus = 'pending' | 'approved' | 'rejected' | 'expired';

function normalizeStatus(status?: string): AccessRequestStatus {
  if (status === 'approved') return 'approved';
  if (status === 'denied' || status === 'rejected') return 'rejected';
  if (status === 'expired') return 'expired';
  return 'pending';
}

function statusLabel(status: AccessRequestStatus) {
  switch (status) {
    case 'pending':
      return 'قيد المراجعة';
    case 'approved':
      return 'مقبول';
    case 'rejected':
      return 'مرفوض';
    case 'expired':
      return 'منتهي';
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

function formatArabicDate(value?: string | null) {
  if (!value) return 'غير محدد';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ar-SA');
}

export default function DoctorAccessRequestsPage() {
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
        <title>Access Requests • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar'>
        <DashboardOverviewSection
          sectionClassName='flex flex-col gap-[18px] mb-6 py-[22px] px-[24px] rounded-[24px] bg-primary shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]'
          overlay={
            mode === 'create' ? (
              <motion.button
                type='button'
                onClick={() => setMode('list')}
                className='absolute left-[16px] top-[16px] flex h-[40px] w-[40px] items-center justify-center rounded-[6px] bg-white shadow-[0_14px_24px_rgba(0,0,0,0.16)]'
                aria-label='إغلاق'
              >
                <X className='h-5 w-5 text-[#0F8F8B]' />
              </motion.button>
            ) : null
          }
          headerLeft={
            <div className='flex w-full flex-row items-start justify-between gap-[16px]'>
              <div className='flex flex-row items-start gap-[12px]'>
                <div className='bg-[#FFFFFF33] w-[56px] h-[56px] flex items-center justify-center rounded-[6px]'>
                  <Shield className='text-white w-[28px] h-[28px]' />
                </div>
                <div className='flex flex-col gap-1 text-right'>
                  <h1 className='font-cairo text-[12px] font-semibold leading-[18px] text-[#FFFFFFCC]'>
                    طلبات الوصول
                  </h1>
                  <span className='font-cairo text-[22px] font-black leading-[28px] text-[#FFFFFF]'>
                    {pendingCount} طلب
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
                إضافة طلب وصول
              </motion.button>
            ) : undefined
          }
          kpiGridClassName='grid grid-cols-3 gap-[10px]'
          cards={[
            <div key='rejected' className='flex h-[64px] items-center justify-center rounded-[6px] bg-white/15 px-4'>
              <div className='text-center'>
                <div className='font-cairo text-[18px] font-black text-white'>{rejectedCount}</div>
                <div className='mt-1 font-cairo text-[12px] font-bold text-white/80'>مرفوض</div>
              </div>
            </div>,
            <div key='approved' className='flex h-[64px] items-center justify-center rounded-[6px] bg-white/15 px-4'>
              <div className='text-center'>
                <div className='font-cairo text-[18px] font-black text-white'>{approvedCount}</div>
                <div className='mt-1 font-cairo text-[12px] font-bold text-white/80'>مقبول</div>
              </div>
            </div>,
            <div key='pending' className='flex h-[64px] items-center justify-center rounded-[6px] bg-white/15 px-4'>
              <div className='text-center'>
                <div className='font-cairo text-[18px] font-black text-white'>{pendingCount}</div>
                <div className='mt-1 font-cairo text-[12px] font-bold text-white/80'>قيد المراجعة</div>
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
                      },
                    });
                    toast('تم إرسال طلب الوصول بنجاح', {
                      title: 'تم الحفظ',
                      variant: 'success',
                    });
                    setMode('list');
                  } catch (error) {
                    toast(getUserFacingRequestErrorMessage(error), {
                      title: 'فشلت العملية',
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
              <section className='mb-6 rounded-[6px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_12px_26px_rgba(0,0,0,0.08)]'>
                <div className='relative'>
                  <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                    <Search className='h-4 w-4' />
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder='ابحث في الطلبات...'
                    className='h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white pr-4 pl-10 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]'
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
                    لا توجد طلبات وصول بعد
                  </div>
                  <div className='mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    يمكنك إنشاء طلب جديد من الزر أعلاه.
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  {filtered.map((request) => {
                    const status = normalizeStatus(request.status);
                    const patientName =
                      request.patient?.user?.fullName ??
                      request.patient?.userId?.fullName ??
                      'مريض';

                    return (
                      <div
                        key={request._id}
                        className='overflow-hidden rounded-[24px] border border-[#E7EEF5] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] shadow-[0_18px_34px_rgba(15,23,42,0.08)] transition hover:shadow-[0_24px_44px_rgba(15,23,42,0.12)]'
                      >
                        <div className='border-b border-[#EEF2F6] bg-[linear-gradient(90deg,#f7fbfb_0%,#ffffff_100%)] px-6 py-5'>
                          <div className='flex items-start justify-between gap-4'>
                            <div className='flex items-center gap-4'>
                              <div className='flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f8f8b_0%,#14b8a6_100%)] text-white shadow-[0_12px_22px_rgba(15,143,139,0.24)]'>
                                <UserRound className='h-5 w-5' />
                              </div>
                              <div className='text-right'>
                                <div className='font-cairo text-[15px] font-extrabold text-[#101828]'>
                                  {patientName}
                                </div>
                                <div className='mt-1 flex items-center justify-start gap-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                                  <span>{request.patient?.publicId ?? request._id}</span>
                                  <span className='h-1 w-1 rounded-full bg-[#D0D5DD]' />
                                  <span>طلب وصول طبي</span>
                                </div>
                              </div>
                            </div>
                            <div className={statusChipClassName(status)}>
                              {statusLabel(status)}
                            </div>
                          </div>
                        </div>

                        <div className='px-6 py-5'>
                          <div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
                            <div className='rounded-[16px] border border-[#EEF2F6] bg-[#F9FAFB] px-4 py-4 text-right'>
                              <div className='flex items-center justify-start gap-2 font-cairo text-[11px] font-bold text-[#98A2B3]'>
                                <FileText className='h-4 w-4' />
                                <span>تاريخ الطلب</span>
                              </div>
                              <div className='mt-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
                                {formatArabicDate(request.createdAt)}
                              </div>
                            </div>

                            <div className='rounded-[16px] border border-[#EEF2F6] bg-[#F9FAFB] px-4 py-4 text-right'>
                              <div className='flex items-center justify-start gap-2 font-cairo text-[11px] font-bold text-[#98A2B3]'>
                                <Shield className='h-4 w-4' />
                                <span>نطاق الوصول</span>
                              </div>
                              <div className='mt-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
                                {request.scope ?? 'PROFILE'}
                              </div>
                            </div>

                            <div className='rounded-[16px] border border-[#EEF2F6] bg-[#F9FAFB] px-4 py-4 text-right'>
                              <div className='flex items-center justify-start gap-2 font-cairo text-[11px] font-bold text-[#98A2B3]'>
                                <FileText className='h-4 w-4' />
                                <span>مصدر الطلب</span>
                              </div>
                              <div className='mt-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
                                الطبيب المعالج
                              </div>
                            </div>
                          </div>

                          <div className='mt-4 rounded-[18px] border border-[#E6F4F3] bg-[#F6FFFE] px-4 py-4 text-right'>
                            <div className='font-cairo text-[11px] font-bold text-primary/80'>
                              سبب الطلب
                            </div>
                            <div className='mt-2 font-cairo text-[13px] font-semibold leading-7 text-[#344054]'>
                              {request.reason ||
                                (status === 'approved'
                                  ? 'تمت الموافقة على طلب الوصول وأصبح الملف الطبي متاحاً للطبيب.'
                                  : status === 'rejected'
                                    ? 'تم رفض الطلب من قبل المريض أو انتهت مبررات الوصول الحالية.'
                                    : status === 'expired'
                                      ? 'انتهت صلاحية الطلب قبل مراجعته، ويمكن إرسال طلب جديد عند الحاجة.'
                                      : 'الطلب بانتظار موافقة المريض قبل إتاحة الملف الطبي الكامل.')}
                            </div>
                          </div>

                          <div className={bottomBarClassName(status)}>
                            {bottomBarIcon(status)}
                            <div className={bottomBarTextClassName(status)}>
                              {status === 'approved'
                                ? 'الوصول أصبح متاحاً ويمكن متابعة الملف الطبي الكامل.'
                                : status === 'rejected'
                                  ? 'الوصول غير متاح حالياً. يمكنك مراجعة السبب أو إعادة الطلب لاحقاً.'
                                  : status === 'expired'
                                    ? 'الطلب منتهي الصلاحية ويحتاج إلى إنشاء طلب جديد.'
                                    : 'بانتظار قرار المريض. سيتم تحديث الحالة تلقائياً عند المراجعة.'}
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
