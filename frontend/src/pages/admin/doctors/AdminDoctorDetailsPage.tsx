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

function verificationRequestId(
  r: { _id?: string; id?: string } | null | undefined,
): string | undefined {
  if (!r) return undefined;
  return r._id ?? r.id;
}

/**
 * API-3.pdf: طلب التحقق عند التسجيل يُراجع عبر PATCH …/doctor-verification-requests
 * بينما الطبيب غير معتمد بعد. نعرض أزرار المراجعة إذا لم يكن الطبيب approved/rejected
 * صراحةً؛ و`pending` (بأي حالة أحرف) يكفي. إن غاب `approvalStatus` لكن `isApproved`
 * ليس true نعتبره نفس سياق «بانتظار الموافقة» في القائمة.
 */
function doctorNeedsSignupVerificationReview(
  d: AdminDoctorDetailsDoctor | undefined,
): boolean {
  if (!d) return false;
  const s = d.approvalStatus?.toString().toLowerCase().trim() ?? '';
  if (s === 'approved' || s === 'rejected') return false;
  if (s === 'pending') return true;
  return d.isApproved !== true;
}

function extractRequestRowDoctorId(row: unknown): string | undefined {
  if (!row || typeof row !== 'object') return undefined;
  const r = row as Record<string, unknown>;
  if (typeof r.doctorId === 'string') return r.doctorId;
  if (typeof r.doctor_id === 'string') return r.doctor_id;
  const doc = r.doctor;
  if (typeof doc === 'string') return doc;
  if (doc && typeof doc === 'object') {
    const o = doc as Record<string, unknown>;
    const id = o._id ?? o.id;
    if (id != null && id !== '') return String(id);
  }
  return undefined;
}

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
    verificationRequest: verificationFromDetails,
    isLoading,
    error,
    refetch: refetchDoctor,
  } = useAdminDoctor(doctorId);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionDialogMode, setActionDialogMode] = useState<
    'approve' | 'reject' | 'map'
  >('approve');

  const displayName = doctor?.user?.fullName ?? doctor?.userId?.fullName ?? '—';

  const vrQueryEnabled =
    Boolean(doctorId) && doctorNeedsSignupVerificationReview(doctor);

  const { data: vrList, isFetching: vrFetching } = useQuery({
    queryKey: ['admin-verification-requests', 'pending-for-doctor', doctorId],
    queryFn: () =>
      adminApi.verificationRequests.list({
        status: 'pending',
        page: 1,
        limit: 200,
      }),
    enabled: vrQueryEnabled,
    staleTime: 30_000,
  });

  const pendingRequest = useMemo(() => {
    /** طلب لا يزال قابلاً لمراجعة الإدارة (ليس approved/rejected على مستوى الطلب) */
    const requestStillOpen = (s: string | undefined) => {
      const x = s?.toString().toLowerCase().trim() ?? '';
      return x !== 'approved' && x !== 'rejected';
    };
    if (
      verificationFromDetails &&
      requestStillOpen(verificationFromDetails.status) &&
      verificationRequestId(verificationFromDetails)
    ) {
      return verificationFromDetails;
    }
    const raw = vrList?.requests ?? (vrList as { data?: unknown } | null)?.data;
    const list = Array.isArray(raw) ? raw : [];
    return list.find((r) => {
      if (!r || !requestStillOpen((r as { status?: string }).status))
        return false;
      const rec = r as {
        doctor?: { _id?: string };
        doctorId?: string;
      };
      const did = rec.doctor?._id ?? rec.doctorId;
      return did != null && String(did) === String(doctorId);
    });
  }, [verificationFromDetails, vrList, doctorId]);

  const activeVerificationId = verificationRequestId(pendingRequest);

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
            <div className='rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-10 text-center font-cairo text-sm font-semibold text-[#667085] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'>
              جاري تحميل بيانات الطبيب...
            </div>
          ) : error ? (
            <div className='rounded-[10px] border border-red-200 bg-red-50 px-4 py-8 text-center font-cairo text-sm font-semibold text-red-800'>
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
                    <div className='flex flex-col flex-1 gap-5 min-w-0 sm:flex-row sm:gap-6 md:gap-8'>
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
              {doctorNeedsSignupVerificationReview(doctor) ? (
                <div className='flex flex-col gap-3 items-center pt-2 pb-6'>
                  {activeVerificationId ? (
                    <div className='flex flex-col gap-3 justify-center items-stretch w-full max-w-2xl sm:flex-row sm:items-center sm:justify-center sm:gap-4'>
                      <button
                        type='button'
                        onClick={() => {
                          setActionDialogMode('approve');
                          setActionDialogOpen(true);
                        }}
                        className='inline-flex h-12 min-w-[148px] flex-1 items-center justify-center rounded-lg bg-[#00C853] px-8 font-cairo text-[15px] font-extrabold text-white transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C853]'
                      >
                        <span
                          dir='ltr'
                          className='inline-flex gap-2 justify-center items-center'
                        >
                          <CheckCircle2
                            className='w-6 h-6 text-white shrink-0'
                            strokeWidth={2.25}
                            aria-hidden
                          />
                          <span
                            dir='rtl'
                            className='leading-none'
                          >
                            قبول
                          </span>
                        </span>
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          setActionDialogMode('reject');
                          setActionDialogOpen(true);
                        }}
                        className='inline-flex h-12 min-w-[148px] flex-1 items-center justify-center rounded-lg bg-[#F44336] px-8 font-cairo text-[15px] font-extrabold text-white transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F44336]'
                      >
                        <span
                          dir='ltr'
                          className='inline-flex gap-2 justify-center items-center'
                        >
                          <Ban
                            className='w-6 h-6 text-white shrink-0'
                            strokeWidth={2.25}
                            aria-hidden
                          />
                          <span
                            dir='rtl'
                            className='leading-none'
                          >
                            رفض
                          </span>
                        </span>
                      </button>
                    </div>
                  ) : vrQueryEnabled && vrFetching ? (
                    <p className='text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                      جاري تحميل طلب التحقق المرتبط...
                    </p>
                  ) : (
                    <p className='max-w-md text-center font-cairo text-[13px] font-semibold text-[#667085]'>
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
                requestId={activeVerificationId ?? null}
                doctorName={displayName}
                lat={clinicLat}
                lng={clinicLng}
                mode={actionDialogMode}
              />
            </>
          ) : (
            <div className='rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-8 text-center font-cairo text-sm font-semibold text-[#667085] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'>
              لا توجد بيانات.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
