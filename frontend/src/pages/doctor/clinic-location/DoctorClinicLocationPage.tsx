import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Locate,
  Map as MapIcon,
  MapPin,
  Navigation,
  Search,
  XCircle,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { DoctorProfilePageLoading } from '@/components/doctor/profile-settings/doctor-profile-page-states';
import { useToast } from '@/components/ui/ToastProvider';
import { useDoctorClinicLocation } from '@/hooks';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { useRetryAction } from '@/lib/query/useRetryAction';
import { useI18n } from '@/i18n/provider';
import { geocodeAddress } from '@/lib/doctor/clinicLocation/geocode';
import {
  buildOpenStreetMapEmbedUrl,
  clinicVerificationLabel,
  DEFAULT_CLINIC_COORDS,
  formatCoordinate,
  validateClinicLocationForm,
  type ClinicLocationFormValues,
  type ClinicVerificationStatus,
} from '@/lib/doctor/clinicLocation/utils';
import { cn } from '@/lib/utils/utils';

function statusBadgeClassName(status: ClinicVerificationStatus) {
  if (status === 'verified') {
    return 'bg-[#DCFCE7] text-[#166534]';
  }
  if (status === 'pending') {
    return 'bg-[#FEF3C7] text-[#92400E]';
  }
  return 'bg-[#99A1AF] text-[#FFFFFF]';
}

function statusIcon(status: ClinicVerificationStatus) {
  if (status === 'verified') {
    return <CheckCircle2 className="h-4 w-4" aria-hidden />;
  }
  if (status === 'pending') {
    return <Clock3 className="h-4 w-4" aria-hidden />;
  }
  return <XCircle className="h-4 w-4" aria-hidden />;
}

export default function DoctorClinicLocationPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const { toast } = useToast();
  const {
    doctor,
    initialValues,
    verificationStatus,
    hasPendingLocationRequest,
    isAwaitingData,
    isError,
    isSubmitting,
    profileQuery,
    submitLocationChange,
    buildChangeItems,
  } = useDoctorClinicLocation();
  const { retry: retryProfile, retrying: retryingProfile } = useRetryAction(
    () => profileQuery.refetch(),
  );

  const [query, setQuery] = useState('');
  const [form, setForm] = useState<ClinicLocationFormValues>(initialValues);
  const [geoLoading, setGeoLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) {
      setForm(initialValues);
    }
  }, [initialValues, dirty]);

  const statusLabel = clinicVerificationLabel(verificationStatus, tr);

  const parsedCoords = useMemo(() => {
    const lat = Number(form.lat);
    const lng = Number(form.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return DEFAULT_CLINIC_COORDS;
    }
    return { lat, lng };
  }, [form.lat, form.lng]);

  const mapUrl = useMemo(
    () => buildOpenStreetMapEmbedUrl(parsedCoords.lat, parsedCoords.lng),
    [parsedCoords.lat, parsedCoords.lng],
  );

  const updateField = <K extends keyof ClinicLocationFormValues>(
    key: K,
    value: ClinicLocationFormValues[K],
  ) => {
    setDirty(true);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const applyCoordinates = (lat: number, lng: number, address?: string) => {
    setDirty(true);
    setForm((current) => ({
      ...current,
      lat: formatCoordinate(lat),
      lng: formatCoordinate(lng),
      address: address?.trim() ? address.trim() : current.address,
    }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast(tr('المتصفح لا يدعم تحديد الموقع الجغرافي.', 'The browser does not support geolocation.'), {
        title: tr('غير متاح', 'Unavailable'),
        variant: 'error',
      });
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyCoordinates(
          position.coords.latitude,
          position.coords.longitude,
        );
        setGeoLoading(false);
        toast(tr('تم تحديد موقعك الحالي على الخريطة.', 'Your current location was pinned on the map.'), {
          title: tr('تم التحديد', 'Located'),
          variant: 'success',
        });
      },
      () => {
        setGeoLoading(false);
        toast(
          tr(
            'تعذّر الحصول على موقعك. تحقق من أذونات المتصفح.',
            'Could not get your location. Check your browser permissions.',
          ),
          {
            title: tr('فشل تحديد الموقع', 'Failed to locate'),
            variant: 'error',
          },
        );
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const handleSearchAddress = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      toast(tr('اكتب عنواناً للبحث أولاً.', 'Type an address to search first.'), {
        title: tr('بحث فارغ', 'Empty search'),
        variant: 'error',
      });
      return;
    }

    setSearchLoading(true);
    try {
      const result = await geocodeAddress(trimmed);
      if (!result) {
        toast(tr('لم نجد نتيجة مطابقة لهذا العنوان.', 'No matching result was found for this address.'), {
          title: tr('لا توجد نتائج', 'No results'),
          variant: 'error',
        });
        return;
      }
      applyCoordinates(result.lat, result.lng, result.displayName);
      toast(tr('تم تحديد الموقع من نتيجة البحث.', 'The location was set from the search result.'), {
        title: tr('تم العثور على العنوان', 'Address found'),
        variant: 'success',
      });
    } catch {
      toast(
        tr(
          'تعذّر البحث عن العنوان حالياً. حاول مرة أخرى.',
          'Could not search for the address right now. Please try again.',
        ),
        {
          title: tr('خطأ في البحث', 'Search error'),
          variant: 'error',
        },
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!doctor) return;

    const validationError = validateClinicLocationForm(form, tr);
    if (validationError) {
      toast(validationError, { title: tr('تحقق من البيانات', 'Check the data'), variant: 'error' });
      return;
    }

    const items = buildChangeItems(doctor, form);
    if (!items.length) {
      toast(tr('لم يتم تغيير الموقع أو العنوان.', 'The location or address was not changed.'), {
        title: tr('لا توجد تغييرات', 'No changes'),
        variant: 'error',
      });
      return;
    }

    try {
      await submitLocationChange({
        items,
        reason: tr('طلب تحديث موقع العيادة', 'Request to update the clinic location'),
      });
      setDirty(false);
      toast(
        hasPendingLocationRequest
          ? tr('تم تحديث طلب المراجعة الحالي.', 'The current review request was updated.')
          : tr('تم إرسال موقع العيادة للمراجعة. ستُحدَّث حالة التوثيق بعد موافقة الإدارة.', 'The clinic location was submitted for review. Its verification status will update after admin approval.'),
        {
          title: tr('تم الإرسال', 'Submitted'),
          variant: 'success',
        },
      );
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: tr('تعذّر إرسال الطلب', 'Could not submit the request'),
        variant: 'error',
      });
    }
  };

  if (isAwaitingData) {
    return (
      <>
        <Helmet>
          <title>
            {tr('موقع العيادة • LMJ Health', 'Clinic Location • LMJ Health')}
          </title>
        </Helmet>
        <DoctorProfilePageLoading />
      </>
    );
  }

  if (isError || !doctor) {
    return (
      <>
        <Helmet>
          <title>
            {tr('موقع العيادة • LMJ Health', 'Clinic Location • LMJ Health')}
          </title>
        </Helmet>
        <DoctorListErrorState
          title={tr('تعذّر تحميل موقع العيادة', 'Failed to load clinic location')}
          brief={tr(
            'حدث خطأ أثناء جلب بيانات الملف الشخصي.',
            'An error occurred while fetching profile data.',
          )}
          onRetry={() => void retryProfile()}
          retrying={retryingProfile}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {tr('موقع العيادة • LMJ Health', 'Clinic Location • LMJ Health')}
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="pb-8 sm:pb-10">
        <section className="rounded-[6px] border border-[#EEF2F6] bg-white px-4 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)] sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="flex h-[36px] w-[36px] items-center justify-center rounded-[6px] bg-primary text-white"
                aria-label={tr('موقع', 'Location')}
              >
                <MapPin className="h-4 w-4" />
              </button>
              <div className="text-start">
                <div className="font-cairo text-[16px] font-extrabold text-[#111827]">
                  {tr('موقع العيادة', 'Clinic location')}
                </div>
                <div className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                  {tr(
                    'حدد موقع عيادتك بدقة على الخريطة',
                    'Pin your clinic location accurately on the map',
                  )}
                </div>
              </div>
            </div>

            <span
              className={cn(
                'flex h-[22px] items-center justify-center gap-2 rounded-full px-3 font-cairo text-[12px] font-semibold',
                statusBadgeClassName(verificationStatus),
              )}
            >
              {statusLabel}
              {statusIcon(verificationStatus)}
            </span>
          </div>

          {hasPendingLocationRequest ? (
            <div className="mt-4 rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 font-cairo text-[12px] font-semibold text-[#92400E]">
              {tr(
                'لديك طلب موقع قيد المراجعة. يمكنك تعديل الإحداثيات وإعادة الإرسال لتحديث الطلب قبل موافقة الإدارة.',
                'You have a location request under review. You can edit the coordinates and resubmit to update the request before admin approval.',
              )}
            </div>
          ) : null}

          {profileQuery.isRefetching ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-[10px] border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2 font-cairo text-[12px] font-bold text-[#047857]">
              <Loader2 className="h-4 w-4 animate-spin" />
              {tr('جارٍ تحديث بيانات موقع العيادة...', 'Updating clinic location data...')}
            </div>
          ) : null}
        </section>

        <section className="mt-5 rounded-[6px] border border-[#EEF2F6] bg-white p-4 shadow-[0_18px_30px_rgba(0,0,0,0.10)] sm:p-5">
          <div className="relative">
            <div className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#98A2B3]">
              <Search className="h-4 w-4" />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleSearchAddress();
                }
              }}
              placeholder={tr('ابحث عن عنوان...', 'Search for an address...')}
              className="h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white ps-4 pe-10 font-cairo text-[13px] font-semibold text-[#111827] outline-none transition focus:border-primary placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void handleSearchAddress()}
              disabled={searchLoading}
              className="flex h-[44px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white font-cairo text-[13px] font-extrabold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
            >
              {searchLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Search className="h-4 w-4 text-primary" />
              )}
              {tr('بحث عن العنوان', 'Search for address')}
            </button>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={geoLoading}
              className="flex h-[44px] items-center justify-center gap-2 rounded-[6px] bg-primary font-cairo text-[13px] font-extrabold text-white shadow-[0_18px_40px_rgba(15,143,139,0.30)] transition-colors hover:bg-[#14B3AE] disabled:opacity-60"
            >
              {geoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Locate className="h-4 w-4" />
              )}
              {tr('الحصول على موقعي الحالي', 'Get my current location')}
            </button>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]">
          <div className="relative h-[340px] bg-[#F3F4F6]">
            <iframe
              title={tr('خريطة موقع العيادة', 'Clinic location map')}
              src={mapUrl}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
              <div className="rounded-full bg-white/90 px-4 py-2 shadow-sm">
                <div className="flex items-center gap-2 font-cairo text-[12px] font-semibold text-[#667085]">
                  <MapIcon className="h-4 w-4 text-primary" />
                  {tr('عدّل الإحداثيات أدناه لتحديث المؤشر', 'Edit the coordinates below to update the marker')}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 start-0 end-0 grid grid-cols-1 gap-3 bg-white/95 px-4 py-4 backdrop-blur-sm sm:grid-cols-2 sm:px-5">
              <div className="text-start">
                <div className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                  {tr('خط العرض', 'Latitude')}
                </div>
                <div className="mt-1 font-cairo text-[12px] font-extrabold tabular-nums text-[#111827]">
                  {form.lat || '—'}
                </div>
              </div>
              <div className="text-start">
                <div className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                  {tr('خط الطول', 'Longitude')}
                </div>
                <div className="mt-1 font-cairo text-[12px] font-extrabold tabular-nums text-[#111827]">
                  {form.lng || '—'}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[6px] border border-[#EEF2F6] bg-white px-4 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)] sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[6px] bg-[#E9FFFE] text-primary">
                <Navigation className="h-4 w-4" />
              </div>
              <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
                {tr('تفاصيل الموقع', 'Location details')}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-start font-cairo text-[12px] font-extrabold text-[#111827]">
                {tr('خط العرض (Latitude)', 'Latitude')}
              </div>
              <input
                value={form.lat}
                onChange={(e) => updateField('lat', e.target.value)}
                inputMode="decimal"
                className="h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold tabular-nums text-[#111827] outline-none transition focus:border-primary"
              />
            </div>
            <div>
              <div className="mb-2 text-start font-cairo text-[12px] font-extrabold text-[#111827]">
                {tr('خط الطول (Longitude)', 'Longitude')}
              </div>
              <input
                value={form.lng}
                onChange={(e) => updateField('lng', e.target.value)}
                inputMode="decimal"
                className="h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold tabular-nums text-[#111827] outline-none transition focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-start font-cairo text-[12px] font-extrabold text-[#111827]">
              {tr('عنوان العيادة', 'Clinic address')}
            </div>
            <input
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold text-[#111827] outline-none transition focus:border-primary"
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-start">
              <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                {tr('حالة التحقق', 'Verification status')}
              </div>
            </div>
            <span
              className={cn(
                'inline-flex h-[22px] items-center justify-center rounded-full px-3 font-cairo text-[11px] font-extrabold',
                statusBadgeClassName(verificationStatus),
              )}
            >
              {statusLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={() => void handleSubmitReview()}
            disabled={isSubmitting}
            className="mt-5 flex h-[48px] w-full items-center justify-center gap-2 rounded-[6px] bg-primary font-cairo text-[13px] font-extrabold text-white shadow-[0_18px_40px_rgba(15,143,139,0.30)] transition-colors hover:bg-[#14B3AE] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            {tr('إرسال المراجعة', 'Submit for review')}
          </button>
        </section>

        <section className="mt-5 rounded-[6px] border border-[#EEF2F6] bg-white px-4 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)] sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-[30px] w-[30px] items-center justify-center text-primary">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
                {tr('تعليمات التحديد', 'Pinning instructions')}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[16px] bg-[#F8FAFC]">
            <ol className="space-y-3 p-4">
              {[
                tr('انقر على "الحصول على موقعي الحالي" لتحديد تلقائي', 'Click "Get my current location" for automatic detection'),
                tr('ابحث عن العنوان أو عدّل الإحداثيات يدوياً لتحديث المؤشر على الخريطة', 'Search for the address or manually edit the coordinates to update the marker on the map'),
                tr('اكتب عنوان العيادة الكامل في الحقل المخصص', 'Type the full clinic address in the dedicated field'),
                tr('اضغط على "إرسال المراجعة" لإرسال التعديلات عبر طلب تغيير الملف', 'Click "Submit for review" to send the changes via a profile change request'),
                tr('بعد موافقة الإدارة يُحدَّث الموقع وتصبح حالة التوثيق «موثق»', 'Once approved by admin, the location is updated and the verification status becomes "Verified"'),
              ].map((text, idx) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="mt-[1px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-primary font-cairo text-[12px] font-extrabold text-[#E9FFFE]">
                    {idx + 1}
                  </div>
                  <div className="font-cairo text-[14px] leading-[20px] text-[#667085]">
                    {text}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="h-8 sm:h-10" />
      </div>
    </>
  );
}
