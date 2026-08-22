import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, CheckCircle2, ChevronRight, MapPin, UserX } from "lucide-react";
import { useAdminDoctor } from "@/hooks/admin/doctors/useAdminDoctor";
import { useAdminLookups } from "@/hooks/admin/lookups/useAdminLookups";
import {
  adminApi,
  verificationRequestsFromListEnvelope,
} from "@/lib/admin/client";
import { resolveAdminDoctorUserId } from "@/lib/admin/doctors/resolveAdminDoctorUserId";
import { isAdminDoctorOffboarded } from "@/lib/admin/doctors/isAdminDoctorOffboarded";
import { formatPhoneForDisplay } from "@/lib/phone/formatPhoneForDisplay";
import {
  mergeDoctorProfileIntoSummaryStats,
  parseDiagnosisAnalytics,
  parseSummaryAnalytics,
} from "@/lib/admin/doctors/doctorAdminAnalytics";
import type {
  AdminDoctorDetailsDoctor,
  AdminDoctorAnalyticsRange,
} from "@/lib/admin/types";
import { AdminDoctorAnalyticsPanels } from "@/components/admin/doctor/AdminDoctorAnalyticsPanels";
import {
  FieldBlock,
  SectionTitle,
} from "@/components/admin/doctors/DoctorDetailsPrimitives";
import { DoctorSpecializationReviewBanner } from "@/components/admin/verification-requests/DoctorSpecializationReviewBanner";
import ReviewVerificationRequestDialog from "@/components/admin/verification-requests/dialogs/ReviewVerificationRequestDialog";
import OffboardDialog from "@/components/admin/secretaries/dialogs/OffboardDialog";
import { resolveDoctorSpecializationReviewState } from "@/lib/admin/doctors/doctorSpecializationReview";
import { resolveDoctorSpecialtyLookupCategory } from "@/lib/admin/doctors/doctorSpecialtyLookupCategory";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";
import { useI18n } from "@/i18n/provider";

function requestStillOpen(status: string | undefined): boolean {
  const x = status?.toString().toLowerCase().trim() ?? "";
  return x !== "approved" && x !== "rejected";
}

function formatGender(
  g: string | undefined,
  tr: (ar: string, en: string) => string,
) {
  if (!g) return "—";
  const x = g.toLowerCase();
  if (x === "male" || x === "m") return tr("ذكر", "Male");
  if (x === "female" || x === "f") return tr("أنثى", "Female");
  return g;
}

function formatConsultationTypes(
  types: string[] | undefined,
  tr: (ar: string, en: string) => string,
) {
  if (!types?.length) return "—";
  const map: Record<string, string> = {
    online: tr("عبر الإنترنت", "Online"),
    offline: tr("في العيادة", "In clinic"),
  };
  return types.map((t) => String(map[t] ?? t)).join(tr(" ، ", ", "));
}

function formatMoney(n: number | undefined, locale: string) {
  if (n === undefined || n === null || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString(locale === "ar" ? "ar-SY" : "en-US");
}

function formatDateLocalized(iso: string | undefined, locale: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale === "ar" ? "ar-SY" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildAddress(d: AdminDoctorDetailsDoctor) {
  const parts = [d.clinicAddress, d.locationCity, d.locationCountry].filter(
    Boolean,
  );
  return parts.length ? parts.join(" - ") : "—";
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
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const navigate = useNavigate();

  const ANALYTICS_RANGE_OPTIONS: Array<{
    value: AdminDoctorAnalyticsRange;
    label: string;
  }> = [
    { value: "day", label: tr("يومي", "Daily") },
    { value: "week", label: tr("أسبوعي", "Weekly") },
    { value: "month", label: tr("شهري", "Monthly") },
    { value: "year", label: tr("سنوي", "Yearly") },
  ];

  const { doctorId } = useParams();
  const queryClient = useQueryClient();
  const {
    doctor,
    verificationRequest: verificationFromDetails,
    pendingVerificationRequestId: pendingRequestIdFromApi,
    isAwaitingData,
    error,
    refetch: refetchDoctor,
  } = useAdminDoctor(doctorId);

  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionDialogMode, setActionDialogMode] = useState<
    "approve" | "reject" | "map"
  >("approve");
  const [offboardOpen, setOffboardOpen] = useState(false);
  const [analyticsRange, setAnalyticsRange] =
    useState<AdminDoctorAnalyticsRange>("month");

  const offboardUserId = useMemo(
    () => resolveAdminDoctorUserId(doctor),
    [doctor],
  );
  const isOffboarded = isAdminDoctorOffboarded(doctor);
  const phoneDisplay = useMemo(
    () => formatPhoneForDisplay(doctor?.user?.phone),
    [doctor?.user?.phone],
  );

  // `GET /admin/doctor-verification-requests` only supports status/page/limit
  // (no doctorId filter server-side), so this fetches the latest pending
  // requests and matches this doctor client-side in `pendingFromList` below.
  const { data: vrListData } = useQuery({
    queryKey: ["admin-verification-requests", "by-doctor", doctorId],
    queryFn: () =>
      adminApi.verificationRequests.list({
        status: "pending",
        page: 1,
        limit: 100,
      }),
    enabled: Boolean(doctorId) && doctor?.approvalStatus === "pending",
    staleTime: 30_000,
  });

  const pendingFromList = useMemo(() => {
    const list = verificationRequestsFromListEnvelope(
      vrListData as Record<string, unknown> | null | undefined,
    );
    return list.find(
      (r) =>
        String(r.doctor?._id ?? "") === String(doctorId) &&
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
    if (
      typeof pendingRequestIdFromApi === "string" &&
      pendingRequestIdFromApi
    ) {
      return pendingRequestIdFromApi;
    }
    return pendingFromList?._id;
  }, [verificationFromDetails, pendingRequestIdFromApi, pendingFromList]);

  const clinicCoords = useMemo(
    () =>
      doctor ? coordsToLatLng(doctor) : { lat: undefined, lng: undefined },
    [doctor],
  );

  const lookupCategory = resolveDoctorSpecialtyLookupCategory();
  const lookupsQuery = useAdminLookups({
    category: lookupCategory,
    includeInactive: false,
  });

  const specializationState = useMemo(
    () =>
      resolveDoctorSpecializationReviewState(
        doctor,
        lookupsQuery.data?.lookups,
      ),
    [doctor, lookupsQuery.data?.lookups],
  );

  const handleReviewed = async () => {
    await refetchDoctor();
    await queryClient.invalidateQueries({
      queryKey: ["admin-verification-requests", "by-doctor", doctorId],
    });
    await queryClient.invalidateQueries({
      queryKey: ["admin", "doctor", doctorId, "analytics"],
    });
  };

  const diagnosisQuery = useQuery({
    queryKey: [
      "admin",
      "doctor",
      doctorId,
      "analytics",
      "diagnosis",
      analyticsRange,
    ],
    queryFn: () =>
      adminApi.doctors.analyticsDiagnosis(String(doctorId), {
        range: analyticsRange,
      }),
    enabled: Boolean(doctorId) && Boolean(doctor),
    staleTime: 60_000,
  });
  const summaryQuery = useQuery({
    queryKey: [
      "admin",
      "doctor",
      doctorId,
      "analytics",
      "summary",
      analyticsRange,
    ],
    queryFn: () =>
      adminApi.doctors.analyticsSummary(String(doctorId), {
        range: analyticsRange,
      }),
    enabled: Boolean(doctorId) && Boolean(doctor),
    staleTime: 60_000,
  });
  const diagnosisRaw = diagnosisQuery.data;
  const summaryRaw = summaryQuery.data;
  const diagnosisAwaiting = isAwaitingInitialQueryData(
    diagnosisQuery.data,
    diagnosisQuery.isError,
  );
  const diagnosisError = diagnosisQuery.isError;
  const summaryAwaiting = isAwaitingInitialQueryData(
    summaryQuery.data,
    summaryQuery.isError,
  );
  const summaryError = summaryQuery.isError;

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
        <title>{tr("تفاصيل الطبيب", "Doctor details")} • LMJ Health</title>
      </Helmet>

      <div
        dir={dir}
        lang={locale}
        className="-mx-3 -mt-6 mb-0 min-h-[calc(100vh-5.5rem)] px-3 py-6 font-cairo sm:-mx-6 sm:-mt-8 sm:px-6 sm:py-8 md:px-8 lg:px-12"
      >
        <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 sm:gap-8">
          <button
            type="button"
            onClick={() => navigate("/admin/doctors")}
            className="inline-flex items-center gap-1 self-start font-cairo text-[13px] font-bold text-primary hover:underline"
          >
            <ChevronRight className="h-4 w-4" />
            {tr("العودة إلى قائمة الأطباء", "Back to doctors")}
          </button>

          {isAwaitingData ? (
            <div className="rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-10 text-center font-cairo text-sm font-semibold text-[#667085] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              {tr("جاري تحميل بيانات الطبيب...", "Loading doctor details…")}
            </div>
          ) : error ? (
            <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-8 text-center font-cairo text-sm font-semibold text-red-800">
              {tr("فشل تحميل بيانات الطبيب", "Failed to load doctor details")}
            </div>
          ) : doctor ? (
            <>
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                  <div className="mb-2 font-cairo text-[11px] font-bold text-[#667085]">
                    {tr("نوع السجل", "Record type")}
                  </div>
                  <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                    {tr("ملف طبيب", "Doctor profile")}
                  </div>
                </div>
                <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                  <div className="mb-2 font-cairo text-[11px] font-bold text-[#667085]">
                    {tr("حالة الطبيب", "Doctor status")}
                  </div>
                  <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                    {doctor.approvalStatus === "pending"
                      ? tr("بانتظار المراجعة", "Pending review")
                      : doctor.approvalStatus === "approved"
                        ? tr("مقبول", "Approved")
                        : doctor.approvalStatus === "rejected"
                          ? tr("مرفوض", "Rejected")
                          : doctor.approvalStatus ?? "—"}
                  </div>
                </div>
                <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                  <div className="mb-2 font-cairo text-[11px] font-bold text-[#667085]">
                    {tr("طلب التحقق", "Verification request")}
                  </div>
                  <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                    {verificationRequestId
                      ? tr("موجود ومربوط بهذا الطبيب", "Linked to this doctor")
                      : tr("غير متاح حالياً", "Not currently available")}
                  </div>
                </div>
                <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                  <div className="mb-2 font-cairo text-[11px] font-bold text-[#667085]">
                    {tr("الإجراء الحالي", "Current action")}
                  </div>
                  <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                    {isOffboarded
                      ? tr("الحساب موقوف للقراءة والمتابعة فقط", "Account is offboarded for review only")
                      : doctor.approvalStatus === "pending"
                        ? verificationRequestId
                          ? tr("قبول أو رفض طلب التحقق", "Approve or reject the verification request")
                          : tr("مراجعة طلبات التحقق المرتبطة", "Review linked verification requests")
                        : tr("مراجعة الملف والتحليلات", "Review profile and analytics")}
                  </div>
                </div>
              </section>

              <section className="rounded-[10px] border border-[#D6EEEC] bg-[#F3FBFA] px-4 py-4 sm:px-5">
                <p className="font-cairo text-[13px] font-semibold leading-6 text-[#215A57]">
                  {tr(
                    "هذه الصفحة مخصّصة لمراجعة ملف الطبيب وطلب التحقق المرتبط به من مكان واحد. استخدم أزرار القبول أو الرفض فقط عندما تكون حالة الطبيب بانتظار المراجعة، بينما تبقى بقية البيانات مرجعية للمراجعة والتحقق.",
                    "This page combines doctor profile review with the linked verification request. Use approve or reject only while the doctor is pending review; the remaining information is reference context for validation.",
                  )}
                </p>
              </section>

              <section>
                <SectionTitle>{tr("المعلومات الشخصية", "Personal information")}</SectionTitle>
                <div className="rounded-[6px] border-[1.82px] border-[#F3F4F6] bg-[#FFFFFF] p-4 shadow-[0px_1px_3px_0px_#0000001A] sm:p-5 md:p-6 md:min-h-[12rem]">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-[15px]">
                    <div className="mx-auto shrink-0 rounded-[10px] text-primary md:mx-0">
                      {doctor.user?.photoUrl ? (
                        <img
                          src={doctor.user.photoUrl}
                          alt=""
                          className="h-[120px] w-[120px] rounded-xl border border-[#0F8F8B] object-cover sm:h-[140px] sm:w-[140px] md:h-[150px] md:w-[150px]"
                        />
                      ) : (
                        <div className="flex h-[120px] w-[120px] flex-col items-center justify-center rounded-[10px] border border-[#0F8F8B]/40 bg-[#E6F4F3] font-cairo text-[12px] font-semibold text-primary sm:h-[140px] sm:w-[140px] md:h-[150px] md:w-[150px]">
                          photo
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 gap-5 min-w-0 sm:flex-row sm:gap-6 md:gap-8">
                      <div className="flex flex-col flex-1 gap-4 min-w-0">
                        <FieldBlock
                          label={tr("الاسم", "Name")}
                          value={doctor.user?.fullName ?? "—"}
                        />
                        <FieldBlock
                          label={tr("رقم الهاتف", "Phone")}
                          value={phoneDisplay}
                          valueDir="ltr"
                        />
                        <FieldBlock
                          label={tr("الايميل", "Email")}
                          value={doctor.user?.email ?? "—"}
                        />
                      </div>
                      <div className="flex flex-col flex-1 gap-4 min-w-0">
                        <FieldBlock
                          label={tr("تاريخ الميلاد", "Date of birth")}
                          value={formatDateLocalized(doctor.user?.dateOfBirth, locale)}
                        />
                        <FieldBlock
                          label={tr("الجنس", "Gender")}
                          value={formatGender(doctor.user?.gender, tr)}
                        />
                        <FieldBlock
                          label={tr("العنوان", "Address")}
                          value={buildAddress(doctor)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <SectionTitle>{tr("المعلومات المهنية", "Professional information")}</SectionTitle>
                <div className="rounded-[6px] border-[1.82px] border-[#F3F4F6] bg-[#FFFFFF] p-4 shadow-[0px_1px_3px_0px_#0000001A] sm:p-5 md:p-6 md:min-h-[12rem]">
                  <DoctorSpecializationReviewBanner
                    state={specializationState}
                  />
                  <div className="mt-4 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 md:gap-10">
                    <div className="flex flex-col gap-4">
                      <FieldBlock
                        label={tr("التخصص المعروض", "Displayed specialization")}
                        value={specializationState.displayLabel}
                      />
                      <FieldBlock
                        label={tr("حالة التخصص", "Specialization status")}
                        value={specializationState.statusLabel}
                      />
                      {specializationState.specializationKey ? (
                        <FieldBlock
                          label={tr("رمز التخصص", "Specialization key")}
                          value={specializationState.specializationKey}
                        />
                      ) : null}
                      {specializationState.customSpecializationText ? (
                        <FieldBlock
                          label={tr("التخصص المُدخل يدوياً", "Custom specialization")}
                          value={specializationState.customSpecializationText}
                        />
                      ) : null}
                      <FieldBlock
                        label={tr("رقم الترخيص", "License number")}
                        value={doctor.medicalLicenseNumber ?? "—"}
                      />
                      <FieldBlock
                        label={tr("التعليم", "Education")}
                        value={doctor.education ?? "—"}
                      />
                    </div>
                    <div className="flex flex-col gap-4">
                      <FieldBlock
                        label={tr("نبذة عن الطبيب", "Doctor bio")}
                        value={doctor.bio ?? "—"}
                      />
                      <FieldBlock
                        label={tr("أنواع الاستشارة", "Consultation types")}
                        value={formatConsultationTypes(
                          doctor.consultationTypes as string[] | undefined,
                          tr,
                        )}
                      />
                      <FieldBlock
                        label={tr("رسوم الاستشارة", "Consultation fee")}
                        value={formatMoney(doctor.consultationFee, locale)}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 rounded-[6px] border border-[#F3F4F6] bg-white p-4 shadow-[0px_1px_3px_0px_#0000001A] sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="text-start">
                    <h2 className="font-cairo text-base font-bold text-primary sm:text-lg">
                      {tr("نطاق التحليلات", "Analytics range")}
                    </h2>
                    <p className="mt-1 font-cairo text-sm text-[#667085]">
                      {tr(
                        "اختر الفترة لعرض ملخص الأداء والتشخيصات.",
                        "Choose a period to view performance and diagnosis summaries.",
                      )}
                    </p>
                  </div>
                  <div
                    className="flex flex-wrap justify-end gap-2"
                    role="group"
                    aria-label={tr("اختيار نطاق التحليلات", "Select analytics range")}
                  >
                    {ANALYTICS_RANGE_OPTIONS.map((option) => {
                      const active = analyticsRange === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setAnalyticsRange(option.value)}
                          className={`rounded-full border px-4 py-2 font-cairo text-sm font-semibold transition-colors ${
                            active
                              ? "border-primary bg-primary text-white"
                              : "border-[#D0D5DD] bg-white text-[#344054] hover:border-primary hover:text-primary"
                          }`}
                          aria-pressed={active}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <AdminDoctorAnalyticsPanels
                  diagnosisItems={diagnosisItems}
                  summary={summaryStats}
                  isDiagnosisLoading={diagnosisAwaiting}
                  isSummaryLoading={summaryAwaiting}
                  hasDiagnosisError={diagnosisError}
                  hasSummaryError={summaryError}
                />
              </section>

              {doctor.approvalStatus === "pending" && !isOffboarded ? (
                <div className="flex flex-col items-center gap-3 pb-6 pt-2">
                  {specializationState.needsAdminResolve ? (
                    <p className="max-w-lg text-center font-cairo text-[12px] font-semibold text-[#92400E]">
                      {tr(
                        "هذا الطبيب لديه تخصص مخصص معلّق. عند «قبول» يجب اختيار تخصصاً مُداراً من القائمة أو إنشاء تخصص جديد في نافذة التأكيد.",
                        "This doctor has a pending custom specialization. On “Approve”, select a managed specialization from the list or create a new one in the confirmation dialog.",
                      )}
                    </p>
                  ) : null}
                  {verificationRequestId ? (
                    <div className="flex w-full max-w-2xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setActionDialogMode("approve");
                          setActionDialogOpen(true);
                        }}
                        className="inline-flex h-12 min-w-[148px] flex-1 items-center justify-center rounded-lg bg-[#00C853] px-8 font-cairo text-[15px] font-extrabold text-white transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C853]"
                      >
                        <span
                          dir="ltr"
                          className="inline-flex items-center justify-center gap-2"
                        >
                          <CheckCircle2
                            className="h-6 w-6 shrink-0 text-white"
                            strokeWidth={2.25}
                            aria-hidden
                          />
                          <span dir={dir} className="leading-none">
                            {tr("قبول", "Approve")}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActionDialogMode("reject");
                          setActionDialogOpen(true);
                        }}
                        className="inline-flex h-12 min-w-[148px] flex-1 items-center justify-center rounded-lg bg-[#F44336] px-8 font-cairo text-[15px] font-extrabold text-white transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F44336]"
                      >
                        <span
                          dir="ltr"
                          className="inline-flex items-center justify-center gap-2"
                        >
                          <Ban
                            className="h-6 w-6 shrink-0 text-white"
                            strokeWidth={2.25}
                            aria-hidden
                          />
                          <span dir={dir} className="leading-none">
                            {tr("رفض", "Reject")}
                          </span>
                        </span>
                      </button>
                      {clinicCoords.lat && clinicCoords.lng ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActionDialogMode("map");
                            setActionDialogOpen(true);
                          }}
                          className="inline-flex h-12 min-w-[148px] flex-1 items-center justify-center rounded-lg border-2 border-[#0F8F8B] bg-white px-8 font-cairo text-[15px] font-extrabold text-[#0F8F8B] transition hover:bg-[#E6F4F3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F8F8B] sm:max-w-[10rem] sm:flex-none"
                        >
                          <span
                            dir="ltr"
                            className="inline-flex items-center justify-center gap-2"
                          >
                            <MapPin
                              className="h-6 w-6 shrink-0"
                              strokeWidth={2.25}
                              aria-hidden
                            />
                            <span dir={dir} className="leading-none">
                              {tr("الموقع", "Location")}
                            </span>
                          </span>
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <p className="max-w-md text-center font-cairo text-[13px] font-semibold text-[#667085]">
                      {tr(
                        "تعذّر العثور على طلب التحقق المرتبط بهذا الطبيب. جرّب إعادة التحميل أو راجع طلبات التحقق من لوحة الإدارة.",
                        "Unable to find a verification request linked to this doctor. Try reloading or review verification requests from admin.",
                      )}
                    </p>
                  )}
                </div>
              ) : null}

              {isOffboarded ? (
                <section className="rounded-[10px] border border-[#FECACA] bg-[#FFF5F5] px-4 py-5 sm:px-6">
                  <SectionTitle>{tr("إدارة الحساب", "Account management")}</SectionTitle>
                  <div className="flex items-start gap-3 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-4">
                    <UserX
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#991B1B]"
                      aria-hidden
                    />
                    <div>
                      <p className="font-cairo text-[14px] font-extrabold text-[#991B1B]">
                        {tr("الحساب موقوف", "Account is offboarded")}
                      </p>
                      <p className="mt-1 font-cairo text-[13px] font-semibold leading-relaxed text-[#7F1D1D]">
                        {tr(
                          "تم إيقاف وصول هذا الطبيب إلى المنصة. لا يظهر في البحث للمرضى ولا يمكن إعادة إيقافه.",
                          "This doctor no longer has platform access. They are hidden from patient search and cannot be offboarded again.",
                        )}
                      </p>
                    </div>
                  </div>
                </section>
              ) : offboardUserId ? (
                <section className="rounded-[10px] border border-[#FECACA] bg-[#FFF5F5] px-4 py-5 sm:px-6">
                  <SectionTitle>{tr("إدارة الحساب", "Account management")}</SectionTitle>
                  <p className="mb-4 font-cairo text-[13px] font-semibold leading-relaxed text-[#7F1D1D]">
                    {tr(
                      "إيقاف الحساب يُستخدم للحسابات المكرّرة أو التجريبية. يُخفى الطبيب من البحث وتُلغى مواعيده المستقبلية.",
                      "Offboarding is for duplicate or testing accounts. The doctor is hidden from search and future appointments are canceled.",
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOffboardOpen(true)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-6 font-cairo text-[14px] font-extrabold text-white transition hover:bg-[#B91C1C]"
                  >
                    <UserX className="h-5 w-5 shrink-0" aria-hidden />
                    {tr("إيقاف حساب الطبيب", "Offboard doctor account")}
                  </button>
                </section>
              ) : null}

              {doctor && verificationRequestId ? (
                <ReviewVerificationRequestDialog
                  key={`${verificationRequestId}-${actionDialogMode}`}
                  open={actionDialogOpen}
                  onOpenChange={setActionDialogOpen}
                  requestId={verificationRequestId}
                  doctorName={doctor.user?.fullName ?? "—"}
                  doctorProfile={doctor}
                  lat={clinicCoords.lat}
                  lng={clinicCoords.lng}
                  mode={actionDialogMode}
                  onReviewed={handleReviewed}
                />
              ) : null}
            </>
          ) : (
            <div className="rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-8 text-center font-cairo text-sm font-semibold text-[#667085] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              {tr("لا توجد بيانات.", "No data available.")}
            </div>
          )}
        </div>
      </div>

      <OffboardDialog
        open={offboardOpen}
        onOpenChange={setOffboardOpen}
        targetUserId={offboardUserId}
        targetDoctorId={doctorId ?? null}
        targetLabel={doctor?.user?.fullName?.trim() || phoneDisplay}
        accountRole="doctor"
        onSuccess={() => {
          void refetchDoctor();
          void queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
        }}
      />
    </>
  );
}
