import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BadgeCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileBadge2,
  MapPinned,
  Stethoscope,
} from 'lucide-react';
import ReviewVerificationRequestDialog from '@/components/admin/dialogs/ReviewVerificationRequestDialog';
import { adminApi } from '@/lib/admin/client';
import type { VerificationRequestSummary } from '@/lib/admin/types';

function formatRequestedAt(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString('ar-SY', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return sameDay ? `اليوم ${time}` : d.toLocaleDateString('ar-SY');
}

type ChangeRow = {
  key: string;
  label: string;
  before: string;
  after: string;
};

const FIELD_LABELS: Record<string, string> = {
  education: 'التعليم',
  specialization: 'التخصص',
  medicalLicenseNumber: 'رقم الترخيص',
  licenseNumber: 'رقم الترخيص',
  clinicAddress: 'عنوان العيادة',
  locationCity: 'المدينة',
  locationCountry: 'الدولة',
  consultationFee: 'أجرة الاستشارة',
  bio: 'النبذة التعريفية',
};

function labelForField(key: string) {
  return FIELD_LABELS[key] ?? key;
}

function formatAnyValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) return value.map((v) => formatAnyValue(v)).join('، ');
  try {
    return JSON.stringify(value);
  } catch {
    return '—';
  }
}

function extractRequestFromDetails(details: any): VerificationRequestSummary | null {
  return (
    details?.request ??
    details?.verificationRequest ??
    details?.item ??
    details?.data ??
    null
  );
}

function buildChangeRows(request: VerificationRequestSummary | null): ChangeRow[] {
  if (!request) {
    return [
      {
        key: 'education',
        label: 'التعليم',
        before: 'ماجستير طب الأطفال',
        after: 'دكتوراه طب الأطفال',
      },
      {
        key: 'medicalLicenseNumber',
        label: 'رقم الترخيص',
        before: 'MED-12345',
        after: 'MED-2468',
      },
    ];
  }

  const requestAny = request as any;
  const requestedChanges =
    requestAny?.requestedChanges ??
    requestAny?.changes ??
    requestAny?.profileChanges ??
    {};

  const doctorSource = requestAny?.doctor ?? {};
  const rows: ChangeRow[] = [];

  if (requestedChanges && typeof requestedChanges === 'object') {
    Object.entries(requestedChanges as Record<string, unknown>).forEach(([key, raw]) => {
      const rawAny = raw as any;
      if (
        rawAny &&
        typeof rawAny === 'object' &&
        ('before' in rawAny || 'after' in rawAny)
      ) {
        rows.push({
          key,
          label: labelForField(key),
          before: formatAnyValue(rawAny.before),
          after: formatAnyValue(rawAny.after),
        });
        return;
      }

      rows.push({
        key,
        label: labelForField(key),
        before: formatAnyValue(doctorSource?.[key]),
        after: formatAnyValue(raw),
      });
    });
  }

  if (rows.length === 0) {
    rows.push({
      key: 'education',
      label: 'التعليم',
      before: formatAnyValue(requestAny?.doctor?.education ?? request.doctor?.specialization),
      after: formatAnyValue(requestAny?.doctor?.education ?? request.doctor?.specialization),
    });
    rows.push({
      key: 'medicalLicenseNumber',
      label: 'رقم الترخيص',
      before: formatAnyValue(request.doctor?.medicalLicenseNumber),
      after: formatAnyValue(request.doctor?.medicalLicenseNumber),
    });
  }

  return rows;
}

export default function AdminVerificationRequestDetailsPage() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'approve' | 'reject' | 'map'>(
    'map',
  );

  const requestQuery = useQuery({
    queryKey: ['admin', 'verification-request', requestId],
    queryFn: async () => {
      if (!requestId) return null;
      try {
        const details = await adminApi.verificationRequests.getById(requestId);
        const direct = extractRequestFromDetails(details as any);
        if (direct?._id) return direct;
      } catch {
        // Fall through to list-based fallback.
      }

      const listFallback = await adminApi.verificationRequests.list({
        page: 1,
        limit: 200,
      });
      return listFallback.requests.find((item) => item._id === requestId) ?? null;
    },
    enabled: Boolean(requestId),
    staleTime: 15_000,
  });

  const cardData = useMemo(() => {
    const request = requestQuery.data;
    if (!request) {
      return {
        id: requestId ?? '',
        doctor: '—',
        specialty: '—',
        address: '—',
        requestedAt: '—',
        status: 'معلق',
        lat: '—',
        lng: '—',
        changeRows: buildChangeRows(null),
      };
    }

    const requestAny = request as any;
    const coords = request.doctor?.clinicLocation?.coordinates ?? [];
    const lng = typeof coords[0] === 'number' ? coords[0].toFixed(4) : '—';
    const lat = typeof coords[1] === 'number' ? coords[1].toFixed(4) : '—';
    const requestedChanges =
      requestAny?.requestedChanges ??
      requestAny?.changes ??
      requestAny?.profileChanges ??
      {};
    const doctorName =
      request.doctor?.userId?.fullName || request.requestedBy?.fullName || '—';
    const addressParts = [
      request.doctor?.clinicAddress,
      request.doctor?.locationCity,
      request.doctor?.locationCountry,
    ].filter(Boolean);

    return {
      id: request._id,
      doctor: doctorName,
      specialty: request.doctor?.specialization || '—',
      address: addressParts.length > 0 ? addressParts.join('، ') : '—',
      requestedAt: formatRequestedAt(request.createdAt),
      status:
        request.status === 'pending'
          ? 'معلق'
          : request.status === 'approved'
            ? 'مقبول'
            : 'مرفوض',
      lat,
      lng,
      changeRows: buildChangeRows({
        ...request,
        requestedChanges,
      }),
    };
  }, [requestId, requestQuery.data]);

  return (
    <>
      <Helmet>
        <title>تفاصيل طلب التحقق • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='my-8 flex items-center justify-between'>
          <div className='text-right'>
            <div className='font-cairo text-[28px] font-black leading-[34px] text-[#1F2937]'>
              تفاصيل طلب التحقق
            </div>
          </div>
          <button
            type='button'
            onClick={() => navigate('/admin/verification-requests')}
            className='inline-flex h-[34px] items-center gap-1 rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-bold text-[#344054]'
          >
            رجوع
            <ChevronLeft className='h-4 w-4' />
          </button>
        </div>

        {requestQuery.isLoading ? (
          <div className='rounded-[10px] border border-[#D1E9E6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
            جارِ تحميل تفاصيل الطلب...
          </div>
        ) : requestQuery.error ? (
          <div className='rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#B42318]'>
            تعذر تحميل تفاصيل الطلب.
          </div>
        ) : (
          <section className='rounded-[10px] border border-[#B9D8D6] bg-white px-6 py-5 shadow-[0_6px_14px_rgba(16,24,40,0.05)]'>
            <div className='flex  items-start justify-between gap-3'>
              <div className='flex items-center gap-3 flex-1'>
                <div className='flex items-center gap-3'>
                  <button
                    type='button'
                    onClick={() => {
                      setDialogMode('map');
                      setDialogOpen(true);
                    }}
                    className='flex h-[58px] w-[58px] items-center justify-center rounded-[6px] bg-[#129692] text-white'
                    aria-label='عرض الخريطة'
                  >
                    <Stethoscope className='h-6 w-6' />
                  </button>
                  <div className='text-right'>
                    <div className='mb-2'>
                      <div className='font-cairo text-[20px] font-bold leading-[28px] text-[#1F2937]'>
                        {cardData.doctor}
                      </div>
                      <div className='font-cairo text-[18px] font-semibold leading-[20px] text-[#1F2937]'>
                        {cardData.specialty}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='inline-flex h-[24px] items-center gap-1 rounded-[8px] border border-[#0F8F89] bg-[#0F8F89] px-2.5 font-cairo text-[11px] font-bold text-white'>
                <BadgeCheck className='h-3.5 w-3.5' />
                {cardData.status}
              </div>
            </div>
            <div className='flex  items-center justify-between my-5'>
              <div className='mt-1 font-cairo text-[16px] font-semibold leading-[20px] text-[#4A5565]'>
                {cardData.address}
              </div>
              <div className='font-cairo text-[14px] font-semibold leading-[20px] text-[#99A1AF]'>
                {cardData.requestedAt}
              </div>
            </div>

            <div className='mt-3 border-t border-[#B9D8D6] pt-2' />

            <div className='my-6 text-right font-cairo text-[20px] font-semibold leading-[20px] text-[#000000]'>
              طلب الدكتور {cardData.doctor} تعديل الحقول التالية:
            </div>

            <div className='mt-3 overflow-hidden rounded-[6px] border border-[#0F8F89]'>
              <table className='w-full border-collapse text-right'>
                <thead>
                  <tr className='bg-[#F8FAFA]'>
                    <th className='w-1/3 border border-[#0F8F89] px-4 py-3 font-cairo text-[16px] font-extrabold text-[#0F8F89]'>
                      طلب التعديل
                    </th>
                    <th className='w-1/3 border border-[#0F8F89] px-4 py-3 font-cairo text-[16px] font-extrabold text-[#0F8F89]'>
                      قبل التعديل
                    </th>
                    <th className='w-1/3 border border-[#0F8F89] px-4 py-3 font-cairo text-[16px] font-extrabold text-[#0F8F89]'>
                      بعد التعديل
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cardData.changeRows.map((row) => (
                    <tr key={row.key}>
                      <td className='border border-[#0F8F89] px-4 py-3 font-cairo text-[16px] font-extrabold text-[#0F8F89]'>
                        {row.label}
                      </td>
                      <td className='border border-[#0F8F89] px-4 py-3 font-cairo text-[16px] font-semibold text-[#1F2937]'>
                        {row.before}
                      </td>
                      <td className='border border-[#0F8F89] px-4 py-3 font-cairo text-[16px] font-semibold text-[#1F2937]'>
                        {row.after}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
              <button
                type='button'
                onClick={() => {
                  setDialogMode('map');
                  setDialogOpen(true);
                }}
                className='inline-flex h-[50px] items-center gap-2 rounded-[8px] bg-[#129692] px-5 font-cairo text-[16px] font-bold text-white'
              >
                <MapPinned className='h-4 w-4' />
                الملف الشخصي
              </button>
              <button
                type='button'
                onClick={() => {
                  setDialogMode('approve');
                  setDialogOpen(true);
                }}
                className='inline-flex h-[50px] items-center gap-2 rounded-[8px] bg-[#16A34A] px-5 font-cairo text-[16px] font-bold text-white'
              >
                <BookOpen className='h-4 w-4' />
                قبول التعديلات
              </button>
              <button
                type='button'
                onClick={() => {
                  setDialogMode('reject');
                  setDialogOpen(true);
                }}
                className='inline-flex h-[50px] items-center gap-2 rounded-[8px] bg-[#EF4444] px-5 font-cairo text-[16px] font-bold text-white'
              >
                <FileBadge2 className='h-4 w-4' />
                رفض التعديلات
              </button>
            </div>
          </section>
        )}
      </div>

      <ReviewVerificationRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onReviewed={async () => {
          await requestQuery.refetch();
        }}
        requestId={cardData.id}
        doctorName={cardData.doctor}
        lat={cardData.lat}
        lng={cardData.lng}
        mode={dialogMode}
      />
    </>
  );
}
