import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCircle2, MapPin } from 'lucide-react';
import { useAdminDoctor } from '@/hooks/useAdminDoctor';
import { adminApi, verificationRequestsFromListEnvelope } from '@/lib/admin/client';
import {
  mergeDoctorProfileIntoSummaryStats,
  parseDiagnosisAnalytics,
  parseSummaryAnalytics,
} from '@/lib/admin/doctorAdminAnalytics';
import type { AdminDoctorDetailsDoctor, AdminDoctorAnalyticsRange } from '@/lib/admin/types';
import { AdminDoctorAnalyticsPanels } from '@/components/admin/doctor/AdminDoctorAnalyticsPanels';
import { FieldBlock, SectionTitle } from '@/components/admin/doctors/DoctorDetailsPrimitives';
import ReviewVerificationRequestDialog from '@/components/admin/verification-requests/dialogs/ReviewVerificationRequestDialog';


function requestStillOpen(status: string | undefined): boolean {
  const x = status?.toString().toLowerCase().trim() ?? '';
  return x !== 'approved' && x !== 'rejected';
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

function buildAddress(d: AdminDoctorDetailsDoctor) {
  const parts = [d.clinicAddress, d.locationCity, d.locationCountry].filter(
    Boolean,
  );
  return parts.length ? parts.join(' - ') : '—';
}

function coordsToLatLng(d: AdminDoctorDetailsDoctor) {
  const c = d.clinicLocation?.coordinates;
  if (!c || c.length < 2)
    return {
      lat: undefined as string | undefined,
      lng: undefined as string | undefined,
    };
  const [lng, lat] = c;
  return { lat: String(lat), lng: String(lng) };
}

export default function AdminDoctorDetailsPage() {
  const { doctorId } = useParams();
  const queryClient = useQueryClient();
  const {
    doctor,
    verificationRequest: verificationFromDetails,
    pendingVerificationRequestId: pendingRequestIdFromApi,
    isLoading,
    error,
    refetch: refetchDoctor,
  } = useAdminDoctor(doctorId);

  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionDialogMode, setActionDialogMode] = useState<
    'approve' | 'reject' | 'map'
  >('approve');

  const { data: vrListData } = useQuery({
    queryKey: ['admin-verification-requests', 'by-doctor', doctorId],
    queryFn: () =>
      adminApi.verificationRequests.list({
        doctorId: String(doctorId),
        page: 1,
        limit: 100,
      }),
    enabled: Boolean(doctorId) && doctor?.approvalStatus === 'pending',
    staleTime: 30_000,
  });

  const pendingFromList = useMemo(() => {
    const list = verificationRequestsFromListEnvelope(
      vrListData as Record<string, unknown> | null | undefined,
    );
    return list.find(
      (r) =>
        String(r.doctor?._id ?? '') === String(doctorId) &&
        requestStillOpen(r.status),
    );
  }, [vrListData, doctorId]);

  const verificationRequestId = useMemo(() => {
    if (
      verificationFromDetails?._id &&
      requestStillOpen(verificationFromDetails.status)
    ) {
      return verificationFromDetails._id;
    }
    if (typeof pendingRequestIdFromApi === 'string' && pendingRequestIdFromApi) {
      return pendingRequestIdFromApi;
    }
    return pendingFromList?._id;
  }, [verificationFromDetails, pendingRequestIdFromApi, pendingFromList]);

  const clinicCoords = useMemo(
    () => (doctor ? coordsToLatLng(doctor) : { lat: undefined, lng: undefined }),
    [doctor],
  );

  const handleReviewed = async () => {
    await refetchDoctor();
    await queryClient.invalidateQueries({
      queryKey: ['admin-verification-requests', 'by-doctor', doctorId],
    });
    await queryClient.invalidateQueries({
      queryKey: ['admin', 'doctor', doctorId, 'analytics'],
    });
  };

  const analyticsRange: AdminDoctorAnalyticsRange = 'month';
  const {
    data: diagnosisRaw,
    isLoading: diagnosisLoading,
    isError: diagnosisError,
  } = useQuery({
    queryKey: ['admin', 'doctor', doctorId, 'analytics', 'diagnosis', analyticsRange],
    queryFn: () =>
      adminApi.doctors.analyticsDiagnosis(String(doctorId), {
        range: analyticsRange,
      }),
    enabled: Boolean(doctorId) && Boolean(doctor),
    staleTime: 60_000,
  });
  const {
    data: summaryRaw,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useQuery({
    queryKey: ['admin', 'doctor', doctorId, 'analytics', 'summary', analyticsRange],
    queryFn: () =>
      adminApi.doctors.analyticsSummary(String(doctorId), {
        range: analyticsRange,
      }),
    enabled: Boolean(doctorId) && Boolean(doctor),
    staleTime: 60_000,
  });

  const diagnosisItems = useMemo(
    () => parseDiagnosisAnalytics(diagnosisRaw, analyticsRange),
    [diagnosisRaw, analyticsRange],
  );
  const summaryStats = useMemo(
    () =>
      mergeDoctorProfileIntoSummaryStats(
        parseSummaryAnalytics(summaryRaw),
        doctor,
      ),
    [summaryRaw, doctor],
  );

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
                          value={doctor.user?.fullName ?? '—'}
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

              <AdminDoctorAnalyticsPanels
                diagnosisItems={diagnosisItems}
                summary={summaryStats}
                isDiagnosisLoading={diagnosisLoading}
                isSummaryLoading={summaryLoading}
                hasDiagnosisError={diagnosisError}
                hasSummaryError={summaryError}
              />

              {doctor.approvalStatus === 'pending' ? (
                <div className='flex flex-col items-center gap-3 pb-6 pt-2'>
                  {verificationRequestId ? (
                    <div className='flex w-full max-w-2xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4'>
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
                          className='inline-flex items-center justify-center gap-2'
                        >
                          <CheckCircle2
                            className='h-6 w-6 shrink-0 text-white'
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
                          className='inline-flex items-center justify-center gap-2'
                        >
                          <Ban
                            className='h-6 w-6 shrink-0 text-white'
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
                      {clinicCoords.lat && clinicCoords.lng ? (
                        <button
                          type='button'
                          onClick={() => {
                            setActionDialogMode('map');
                            setActionDialogOpen(true);
                          }}
                          className='inline-flex h-12 min-w-[148px] flex-1 items-center justify-center rounded-lg border-2 border-[#0F8F8B] bg-white px-8 font-cairo text-[15px] font-extrabold text-[#0F8F8B] transition hover:bg-[#E6F4F3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F8F8B] sm:max-w-[10rem] sm:flex-none'
                        >
                          <span
                            dir='ltr'
                            className='inline-flex items-center justify-center gap-2'
                          >
                            <MapPin
                              className='h-6 w-6 shrink-0'
                              strokeWidth={2.25}
                              aria-hidden
                            />
                            <span
                              dir='rtl'
                              className='leading-none'
                            >
                              الموقع
                            </span>
                          </span>
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <p className='max-w-md text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                      تعذّر العثور على طلب التحقق المرتبط بهذا الطبيب. جرّب إعادة
                      التحميل أو راجع طلبات التحقق من لوحة الإدارة.
                    </p>
                  )}
                </div>
              ) : null}

              {doctor && verificationRequestId ? (
                <ReviewVerificationRequestDialog
                  key={`${verificationRequestId}-${actionDialogMode}`}
                  open={actionDialogOpen}
                  onOpenChange={setActionDialogOpen}
                  requestId={verificationRequestId}
                  doctorName={doctor.user?.fullName ?? '—'}
                  lat={clinicCoords.lat}
                  lng={clinicCoords.lng}
                  mode={actionDialogMode}
                  onReviewed={handleReviewed}
                />
              ) : null}

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
