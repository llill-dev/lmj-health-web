import { Helmet } from 'react-helmet-async';
import { useMemo, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCircle2 } from 'lucide-react';
import { useAdminDoctor } from '@/hooks/useAdminDoctor';
import { adminApi } from '@/lib/admin/client';
import ReviewVerificationRequestDialog from '@/components/admin/dialogs/ReviewVerificationRequestDialog';
import type { AdminDoctorDetailsDoctor } from '@/lib/admin/types';

type DoctorRow = AdminDoctorDetailsDoctor;

function formatGender(g?: string) {
  if (!g) return '—';
  const x = g.toLowerCase();
  if (x === 'male' || x === 'm') return 'ذكر';
  if (x === 'female' || x === 'f') return 'أنثى';
  return g;
}

function formatConsultationTypes(types?: string[]) {
  if (!types?.length) return '—';
  const map: Record<string, string> = {
    online: 'عبر الإنترنت',
    offline: 'في العيادة',
  };
  return types.map((t) => String(map[t] ?? t)).join(' ، ');
}

function formatMoney(n?: number) {
  if (n === undefined || n === null || Number.isNaN(Number(n))) return '—';
  return Number(n).toLocaleString('ar-SY');
}

function formatDateAr(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ar-SY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildAddress(d: DoctorRow) {
  const parts = [d.clinicAddress, d.locationCity, d.locationCountry].filter(
    Boolean,
  );
  return parts.length ? parts.join(' - ') : '—';
}

function coordsToLatLng(d: DoctorRow) {
  const c = d.clinicLocation?.coordinates;
  if (!c || c.length < 2)
    return {
      lat: undefined as string | undefined,
      lng: undefined as string | undefined,
    };
  const [lng, lat] = c;
  return { lat: String(lat), lng: String(lng) };
}

function FieldBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col gap-0.5 text-right sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2 sm:gap-y-0'>
      <div className='shrink-0 font-cairo text-sm font-semibold leading-snug text-primary sm:text-base md:text-lg lg:text-[22px] lg:leading-[28px]'>
        {label} :
      </div>
      <div className='min-w-0 break-words font-cairo text-sm font-medium leading-relaxed text-[#1F2937] sm:text-base md:text-lg lg:text-[22px] lg:leading-[28px]'>
        {value}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className='mb-2 text-xl font-bold leading-snug text-primary sm:mb-3 sm:text-2xl md:text-[25px] md:leading-[35px]'>
      {children}
    </h2>
  );
}

export default function AdminDoctorDetailsPage() {
  const { doctorId } = useParams();
  const queryClient = useQueryClient();
  const {
    doctor,
    isLoading,
    error,
    refetch: refetchDoctor,
  } = useAdminDoctor(doctorId);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionDialogMode, setActionDialogMode] = useState<
    'approve' | 'reject' | 'map'
  >('approve');

  const displayName = doctor?.user?.fullName ?? doctor?.userId?.fullName ?? '—';

  const { data: vrList, isLoading: vrLoading } = useQuery({
    queryKey: ['admin-verification-requests', 'pending-for-doctor', doctorId],
    queryFn: () =>
      adminApi.verificationRequests.list({
        status: 'pending',
        page: 1,
        limit: 200,
      }),
    enabled: Boolean(doctorId) && doctor?.approvalStatus === 'pending',
    staleTime: 30_000,
  });

  const pendingRequest = useMemo(
    () =>
      vrList?.requests?.find(
        (r) => r.doctor?._id === doctorId && r.status === 'pending',
      ),
    [vrList?.requests, doctorId],
  );

  const { lat: clinicLat, lng: clinicLng } = doctor
    ? coordsToLatLng(doctor)
    : { lat: undefined, lng: undefined };

  return (
    <>
      <Helmet>
        <title>تفاصيل الطبيب • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
        className='-mx-3 -mt-6 mb-0 min-h-[calc(100vh-5.5rem)] px-3 py-6 font-cairo sm:-mx-6 sm:-mt-8 sm:px-6 sm:py-8 md:px-8 lg:px-12'
      >
        <div className='mx-auto flex w-full max-w-[1100px] flex-col gap-6 sm:gap-8'>
          {isLoading ? (
            <div className='px-4 py-8 text-sm text-center rounded-xl bg-white/5 font-cairo text-slate-400'>
              جاري تحميل بيانات الطبيب...
            </div>
          ) : error ? (
            <div className='px-4 py-8 text-sm text-center text-red-400 rounded-xl bg-white/5 font-cairo'>
              فشل تحميل بيانات الطبيب
            </div>
          ) : doctor ? (
            <>
              {/* المعلومات الشخصية */}
              <section>
                <SectionTitle>المعلومات الشخصية</SectionTitle>
                <div className='rounded-[6px] border-[1.82px] border-[#F3F4F6] bg-[#FFFFFF] p-4 shadow-[0px_1px_3px_0px_#0000001A] sm:p-5 md:p-6 md:min-h-[12rem]'>
                  <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-[15px]'>
                    <div className='mx-auto shrink-0 rounded-[10px] text-primary md:mx-0'>
                      {doctor.user?.photoUrl ? (
                        <img
                          src={doctor.user.photoUrl}
                          alt=''
                          className='h-[120px] w-[120px] rounded-xl border border-[#0F8F8B] object-cover sm:h-[140px] sm:w-[140px] md:h-[150px] md:w-[150px]'
                        />
                      ) : (
                        <div className='flex h-[120px] w-[120px] flex-col items-center justify-center rounded-[10px] border border-[#0F8F8B]/40 bg-[#E6F4F3] font-cairo text-[12px] font-semibold text-primary sm:h-[140px] sm:w-[140px] md:h-[150px] md:w-[150px]'>
                          photo
                        </div>
                      )}
                    </div>
                    <div className='flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:gap-6 md:gap-8'>
                      <div className='flex flex-col flex-1 gap-4 min-w-0'>
                        <FieldBlock
                          label='الاسم'
                          value={displayName}
                        />
                        <FieldBlock
                          label='رقم الهاتف'
                          value={doctor.user?.phone ?? '—'}
                        />
                        <FieldBlock
                          label='الايميل'
                          value={doctor.user?.email ?? '—'}
                        />
                      </div>
                      <div className='flex flex-col flex-1 gap-4 min-w-0'>
                        <FieldBlock
                          label='تاريخ الميلاد'
                          value={formatDateAr(doctor.user?.dateOfBirth)}
                        />
                        <FieldBlock
                          label='الجنس'
                          value={formatGender(doctor.user?.gender)}
                        />
                        <FieldBlock
                          label='العنوان'
                          value={buildAddress(doctor)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* المعلومات المهنية */}
              <section>
                <SectionTitle>المعلومات المهنية</SectionTitle>
                <div className='rounded-[6px] border-[1.82px] border-[#F3F4F6] bg-[#FFFFFF] p-4 shadow-[0px_1px_3px_0px_#0000001A] sm:p-5 md:p-6 md:min-h-[12rem]'>
                  <div className='grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 md:gap-10'>
                    <div className='flex flex-col gap-4'>
                      <FieldBlock
                        label='التخصص'
                        value={doctor.specialization ?? '—'}
                      />
                      <FieldBlock
                        label='رقم الترخيص'
                        value={doctor.medicalLicenseNumber ?? '—'}
                      />
                      <FieldBlock
                        label='التعليم'
                        value={doctor.education ?? '—'}
                      />
                    </div>
                    <div className='flex flex-col gap-4'>
                      <FieldBlock
                        label='نبذة عن الطبيب'
                        value={doctor.bio ?? '—'}
                      />
                      <FieldBlock
                        label='أنواع الاستشارة'
                        value={formatConsultationTypes(
                          doctor.consultationTypes as string[] | undefined,
                        )}
                      />
                      <FieldBlock
                        label='رسوم الاستشارة'
                        value={formatMoney(doctor.consultationFee)}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {doctor.approvalStatus === 'pending' ? (
                <div className='flex flex-col gap-3 items-center pt-2 pb-6'>
                  {vrLoading ? (
                    <p className='text-center font-cairo text-[13px] font-semibold text-slate-500'>
                      جاري تحميل طلب التحقق المرتبط...
                    </p>
                  ) : pendingRequest?._id ? (
                    <div className='flex flex-col gap-3 w-full max-w-2xl sm:flex-row sm:justify-center sm:gap-4'>
                      <button
                        type='button'
                        onClick={() => {
                          setActionDialogMode('approve');
                          setActionDialogOpen(true);
                        }}
                        className='inline-flex h-[52px] min-w-[140px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#00C853] px-6 font-cairo text-[15px] font-extrabold text-white shadow-[0_8px_24px_rgba(0,200,83,0.35)] transition hover:brightness-110'
                      >
                        <CheckCircle2
                          className='w-6 h-6 shrink-0'
                          strokeWidth={2.25}
                        />
                        قبول
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          setActionDialogMode('reject');
                          setActionDialogOpen(true);
                        }}
                        className='inline-flex h-[52px] min-w-[140px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF1744] px-6 font-cairo text-[15px] font-extrabold text-white shadow-[0_8px_24px_rgba(255,23,68,0.35)] transition hover:brightness-110'
                      >
                        <Ban
                          className='w-6 h-6 shrink-0'
                          strokeWidth={2.25}
                        />
                        رفض
                      </button>
                    </div>
                  ) : (
                    <p className='max-w-md text-center font-cairo text-[13px] font-semibold text-slate-500'>
                      لا يوجد طلب تحقق معلّق مرتبط بهذا الطبيب في القائمة
                      الحالية. يمكنك المراجعة من صفحة طلبات التحقق.
                    </p>
                  )}
                </div>
              ) : null}

              <ReviewVerificationRequestDialog
                open={actionDialogOpen}
                onOpenChange={(open) => {
                  setActionDialogOpen(open);
                }}
                onReviewed={async () => {
                  await refetchDoctor();
                  await queryClient.invalidateQueries({
                    queryKey: ['admin-verification-requests'],
                  });
                  await queryClient.invalidateQueries({
                    queryKey: ['admin', 'verification-requests'],
                  });
                }}
                requestId={pendingRequest?._id ?? null}
                doctorName={displayName}
                lat={clinicLat}
                lng={clinicLng}
                mode={actionDialogMode}
              />
            </>
          ) : (
            <div className='px-4 py-8 text-sm text-center rounded-xl bg-white/5 font-cairo text-slate-400'>
              لا توجد بيانات.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
