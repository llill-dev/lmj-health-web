import { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  DollarSign,
  Video,
  Building,
  Loader2,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import DoctorDetailsDialog, {
  type DoctorCardItem,
} from '@/components/doctor/doctors-directory/doctor-details-dialog';
import { DoctorDirectoryCardsSkeleton } from '@/components/doctor/doctors-directory/doctor-directory-cards-skeleton';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { useDoctorDoctorsDirectory } from '@/hooks';
import { getUserFacingRequestErrorMessage } from '@/lib/api';

function tagChipClassName(tag: string) {
  if (tag === 'حضوري') {
    return 'border-[#2E90FA] text-[#2E90FA]';
  }
  return 'border-primary text-primary';
}

export default function DoctorDoctorsDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorCardItem | null>(
    null,
  );
  const [geoCoords, setGeoCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const pageSize = 8;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const directoryQuery = useDoctorDoctorsDirectory({
    search: debouncedSearch || undefined,
    page,
    limit: pageSize,
    lat: geoCoords?.lat,
    lng: geoCoords?.lng,
    radiusKm: geoCoords ? 25 : undefined,
  });

  const doctors = directoryQuery.doctors;
  const total = directoryQuery.total;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(total, page * pageSize);

  const errorMessage = useMemo(() => {
    if (!directoryQuery.error) return null;
    return getUserFacingRequestErrorMessage(directoryQuery.error);
  }, [directoryQuery.error]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setPage(1);
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  if (directoryQuery.isLoading && !directoryQuery.data) {
    return (
      <>
        <Helmet>
          <title>Doctors Directory • LMJ Health</title>
        </Helmet>
        <DoctorDirectoryCardsSkeleton cardCount={6} />
      </>
    );
  }

  if (directoryQuery.isError) {
    return (
      <>
        <Helmet>
          <title>Doctors Directory • LMJ Health</title>
        </Helmet>
        <DoctorListErrorState
          title="تعذّر تحميل دليل الأطباء"
          brief={errorMessage ?? 'حدث خطأ أثناء تحميل القائمة.'}
          onRetry={() => directoryQuery.refetch()}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Doctors Directory • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <section className="rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)]">
          <div className="flex items-start justify-between">
            <div className="text-right">
              <div className="font-cairo text-[18px] font-extrabold text-[#111827]">
                دليل الأطباء
              </div>
              <div className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                تصفح وابحث عن الأطباء المعتمدين
              </div>
            </div>

            <span className="inline-flex h-[32px] items-center justify-center rounded-[6px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white">
              {total} طبيب
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                <Search className="h-4 w-4" />
              </div>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم الطبيب أو تخصصه أو مدينته..."
                className="h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-white pr-4 pl-10 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]"
              />
            </div>

            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={geoLoading}
              className="flex h-[44px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] shadow-[0_10px_20px_rgba(0,0,0,0.06)] disabled:opacity-60"
            >
              {geoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Navigation className="h-4 w-4 text-primary" />
              )}
              {geoCoords ? 'تم تحديد الموقع' : 'استخدم موقعي'}
            </button>

            <button
              type="button"
              disabled
              title="قريباً"
              className="flex h-[44px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 font-cairo text-[12px] font-extrabold text-[#98A2B3] shadow-[0_10px_20px_rgba(0,0,0,0.06)]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              فلاتر متقدمة
            </button>
          </div>
        </section>

        {directoryQuery.isFetching && !directoryQuery.isLoading ? (
          <div className="mt-4 flex items-center justify-center gap-2 font-cairo text-[12px] font-semibold text-[#667085]">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            جارٍ تحديث النتائج…
          </div>
        ) : null}

        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {doctors.length === 0 ? (
            <div className="col-span-full rounded-[12px] border border-dashed border-[#D0D5DD] bg-white px-6 py-16 text-center font-cairo text-[14px] font-semibold text-[#667085]">
              لا توجد نتائج مطابقة لبحثك حالياً.
            </div>
          ) : (
            doctors.map((d) => (
              <div
                key={d.id}
                className="relative overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white px-6 pb-5 pt-6 text-center shadow-[0_18px_30px_rgba(0,0,0,0.10)]"
              >
                <div className="mx-auto flex h-[78px] w-[78px] items-center justify-center overflow-hidden rounded-full border-2 border-[#C7F3F1] bg-[#F8FAFC]">
                  {d.photoUrl ? (
                    <img
                      src={d.photoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-cairo text-[18px] font-extrabold text-[#98A2B3]">
                      {d.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="mt-4 font-cairo text-[14px] font-extrabold text-[#111827]">
                  {d.name}
                </div>
                <div className="mt-1 flex items-center justify-center gap-2 font-cairo text-[12px] font-semibold text-primary">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  {d.specialty}
                </div>

                <div className="mt-2 flex items-center justify-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                  <span className="flex items-center gap-1">
                    {d.rating.toFixed(1)}
                    <Star className="h-4 w-4 text-[#FACC15]" fill="#FACC15" />
                  </span>
                  <span className="font-semibold text-[#98A2B3]">
                    ({d.reviews} تقييم)
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {d.tags.map((t) => (
                    <span
                      key={t}
                      className={`flex h-[22px] items-center justify-center gap-1 rounded-full border-[1.82px] px-3 font-cairo text-[11px] font-extrabold ${tagChipClassName(t)}`}
                    >
                      {t === 'أونلاين' ? (
                        <Video className="h-4 w-4 text-primary" />
                      ) : (
                        <Building className="h-3 w-3 text-[#2E90FA]" />
                      )}
                      {t}
                    </span>
                  ))}
                </div>

                {d.price != null ? (
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <DollarSign className="h-4 w-4 text-[#16A34A]" />
                    <span className="font-cairo text-[14px] font-extrabold text-[#16A34A]">
                      {d.price}
                    </span>
                  </div>
                ) : null}

                <div className="mt-2 flex items-center justify-center gap-2 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                  <MapPin className="h-4 w-4 text-[#98A2B3]" />
                  {d.city}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDoctor(d)}
                  className="mt-5 flex h-[36px] w-full max-w-[290px] items-center justify-center rounded-[16px] bg-gradient-to-b from-[#0F8F8B] to-[#14B3AE] font-cairo text-[14px] font-semibold text-white transition-colors hover:from-[#14B3AE] hover:to-[#12A8A4] mx-auto"
                >
                  عرض التفاصيل
                </button>
              </div>
            ))
          )}
        </section>

        <DoctorDetailsDialog
          open={Boolean(selectedDoctor)}
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
        />

        <section className="mt-8 rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_18px_30px_rgba(0,0,0,0.10)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="font-cairo text-[12px] font-semibold text-[#667085]">
              عرض {showingFrom}-{showingTo} من أصل {total} طبيب
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || directoryQuery.isFetching}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#667085] disabled:opacity-40"
                aria-label="السابق"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-2">
                <div className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                  صفحة
                </div>
                <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                  {page} من {totalPages}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || directoryQuery.isFetching}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#667085] disabled:opacity-40"
                aria-label="التالي"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2">
              <div className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                عدد النتائج:
              </div>
              <div className="rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                {total}
              </div>
            </div>
          </div>
        </section>

        <div className="h-10" />
      </div>
    </>
  );
}
