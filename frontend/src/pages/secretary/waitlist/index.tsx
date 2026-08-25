import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarClock, Plus } from "lucide-react";
import { ClinicAccountsModalShell } from "@/components/doctor/clinic-accounts";
import { DoctorListEmptyIllustration } from "@/components/doctor/shared/doctor-list-empty-illustration";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import {
  DoctorTableSkeleton,
  DoctorToolbarSkeleton,
} from "@/components/doctor/shared/skeletons";
import { WaitlistBookDialog } from "@/components/doctor/waitlist/waitlist-book-dialog";
import { WaitlistTable } from "@/components/doctor/waitlist/waitlist-table";
import { WaitlistToolbar } from "@/components/doctor/waitlist/waitlist-toolbar";
import { MedicalRecordsPagination } from "@/components/doctor/medical-records/medical-records-pagination";
import { useToast } from "@/components/ui/ToastProvider";
import {
  resolveWaitlistPatientName,
  resolveWaitlistPatientPublicId,
  useCreateWaitlistRequest,
  useDoctorWaitlist,
  useWaitlistMutations,
} from "@/hooks/doctor/waitlist/useDoctorWaitlist";
import { useAvailableAppointmentTypes } from "@/hooks/doctor/appointments/useAppointmentTypes";
import { useDoctorPatients } from "@/hooks/doctor/patients/useDoctorPatients";
import { useSecretaryAssignedDoctor } from "@/hooks/secretary/useSecretaryAssignedDoctor";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";
import {
  WAITLIST_CONTACT_PREFERENCES,
  waitlistContactPreferenceLabel,
  waitlistStatusLabel,
  waitlistUrgencyLabel,
} from "@/lib/doctor/waitlist/labels";
import { formatBillingDate } from "@/lib/doctor/billing/format";
import type { WaitlistRequest, WaitlistStatus, WaitlistUrgency } from "@/lib/doctor/waitlist/types";
import { useI18n } from "@/i18n/provider";

const createWaitlistSchema = z
  .object({
    patientId: z.string().trim().min(1, "patient"),
    urgencyLevel: z.enum(["low", "medium", "high"]),
    preferredDateFrom: z.string().trim().min(1, "dateFrom"),
    preferredDateTo: z.string().trim().min(1, "dateTo"),
    contactPreference: z.enum(WAITLIST_CONTACT_PREFERENCES),
    reason: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.preferredDateFrom &&
      data.preferredDateTo &&
      data.preferredDateTo < data.preferredDateFrom
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "dateRange",
        path: ["preferredDateTo"],
      });
    }
  });

type CreateWaitlistFormValues = z.infer<typeof createWaitlistSchema>;

function SurfaceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <header className="border-b border-[#EDF2F7] px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <h2 className="text-start font-cairo text-[23px] font-black leading-none text-[#243044]">
          {title}
        </h2>
      </header>
      <div className="p-4 sm:p-6 lg:p-8">{children}</div>
    </section>
  );
}

export default function SecretaryWaitlistPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = useSecretaryPermissions();
  const { assignedDoctor } = useSecretaryAssignedDoctor();
  const doctorId = assignedDoctor?._id ?? "";
  const canViewWaitlist = hasPermission("waitlist:view");
  const canManageWaitlist = hasPermission("waitlist:manage");
  const canBookFromWaitlist = hasPermission("waitlist:book");
  const canCreateWaitlistRequest = hasPermission("waitlist:create");

  const [statusTab, setStatusTab] = useState<"all" | WaitlistStatus>("active");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [bookTarget, setBookTarget] = useState<WaitlistRequest | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Urgency/date-range filters survive refresh via the URL, per the API's
  // GET /waitlist support for urgencyLevel/dateFrom/dateTo.
  const [searchParams, setSearchParams] = useSearchParams();
  const [urgencyFilter, setUrgencyFilter] = useState<"" | WaitlistUrgency>(
    () => (searchParams.get("urgency") as "" | WaitlistUrgency) || "",
  );
  const [dateFromFilter, setDateFromFilter] = useState(
    () => searchParams.get("dateFrom") || "",
  );
  const [dateToFilter, setDateToFilter] = useState(
    () => searchParams.get("dateTo") || "",
  );

  useEffect(() => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (urgencyFilter) next.set("urgency", urgencyFilter);
        else next.delete("urgency");
        if (dateFromFilter) next.set("dateFrom", dateFromFilter);
        else next.delete("dateFrom");
        if (dateToFilter) next.set("dateTo", dateToFilter);
        else next.delete("dateTo");
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urgencyFilter, dateFromFilter, dateToFilter]);

  const patientsQuery = useDoctorPatients(
    { page: 1, limit: 100 },
    canCreateWaitlistRequest && createOpen,
  );
  const createWaitlistRequest = useCreateWaitlistRequest();

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreateForm,
    formState: { errors: createErrors },
  } = useForm<CreateWaitlistFormValues>({
    resolver: zodResolver(createWaitlistSchema),
    defaultValues: {
      patientId: "",
      urgencyLevel: "low",
      preferredDateFrom: "",
      preferredDateTo: "",
      contactPreference: "call",
      reason: "",
    },
  });

  const createFieldErrorLabel = (code?: string) => {
    switch (code) {
      case "patient":
        return tr("اختر مريضاً", "Choose a patient");
      case "dateFrom":
        return tr("تاريخ البداية المفضل مطلوب", "Preferred start date is required");
      case "dateTo":
        return tr("تاريخ النهاية المفضل مطلوب", "Preferred end date is required");
      case "dateRange":
        return tr(
          "يجب أن يكون تاريخ النهاية بعد تاريخ البداية أو يساويه",
          "End date must be on or after the start date",
        );
      default:
        return undefined;
    }
  };

  const listParams = useMemo(
    () => ({
      status: statusTab === "all" ? undefined : statusTab,
      q: search.trim() || undefined,
      urgencyLevel: urgencyFilter || undefined,
      dateFrom: dateFromFilter || undefined,
      dateTo: dateToFilter || undefined,
      page,
      limit: pageSize,
    }),
    [dateFromFilter, dateToFilter, page, pageSize, search, statusTab, urgencyFilter],
  );

  const list = useDoctorWaitlist(listParams, canViewWaitlist);
  const mutations = useWaitlistMutations();
  const { appointmentTypes } = useAvailableAppointmentTypes(doctorId);
  const { retry: retryList, retrying: retryingList } = useRetryAction(() =>
    list.refetch(),
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusTab, pageSize, urgencyFilter, dateFromFilter, dateToFilter]);

  const isFilteredEmpty =
    list.requests.length === 0 &&
    !list.isAwaitingData &&
    !list.isError &&
    (search.trim().length > 0 || statusTab !== "all");
  const isTrulyEmpty =
    list.requests.length === 0 &&
    !list.isAwaitingData &&
    !list.isError &&
    !isFilteredEmpty;

  const showingFrom = list.total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, list.total);

  const handleContacted = async (request: WaitlistRequest) => {
    if (!canManageWaitlist) {
      toast(tr("تتطلب هذه العملية صلاحية إدارة قائمة الانتظار.", "This action requires waitlist management permission."), {
        variant: "error",
      });
      return;
    }
    try {
      await mutations.markContacted({ id: request._id });
      toast(tr("تم تسجيل التواصل مع المريض.", "Patient contact was recorded."), {
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: "error" });
    }
  };

  const handleClose = async (request: WaitlistRequest) => {
    if (!canManageWaitlist) {
      toast(tr("تتطلب هذه العملية صلاحية إدارة قائمة الانتظار.", "This action requires waitlist management permission."), {
        variant: "error",
      });
      return;
    }
    const reason =
      window.prompt(tr("سبب الإغلاق (اختياري):", "Close reason (optional):")) ?? undefined;
    try {
      await mutations.closeRequest({
        id: request._id,
        closedReason: reason?.trim() || undefined,
      });
      toast(tr("تم إغلاق طلب قائمة الانتظار.", "Waitlist request was closed."), {
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: "error" });
    }
  };

  const handleBookClick = (request: WaitlistRequest) => {
    if (!canBookFromWaitlist) {
      toast(tr("تتطلب هذه العملية صلاحية الحجز من قائمة الانتظار.", "This action requires waitlist booking permission."), {
        variant: "error",
      });
      return;
    }
    setBookTarget(request);
  };

  const [detailTarget, setDetailTarget] = useState<WaitlistRequest | null>(null);
  const detailPatient =
    typeof detailTarget?.patient === "object" ? detailTarget.patient : undefined;

  return (
    <div dir={dir} lang={locale} className="space-y-6 pb-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection title={tr("قائمة الانتظار", "Waitlist")}>
        {canCreateWaitlistRequest ? (
          <div className="mb-5 flex justify-end">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex h-[42px] items-center gap-2 rounded-[10px] bg-primary px-5 font-cairo text-[14px] font-black text-white shadow-[0_10px_20px_rgba(15,143,139,0.30)] transition-colors hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              {tr("إضافة إلى قائمة الانتظار", "Add to waitlist")}
            </button>
          </div>
        ) : null}
        {!canViewWaitlist ? (
          <p className="py-10 text-center font-cairo text-[15px] font-semibold text-[#64748B]">
            {tr("ليست لديك صلاحية عرض قائمة الانتظار.", "You do not have permission to view the waitlist.")}
          </p>
        ) : (
          <div className="space-y-5">
            <WaitlistToolbar
              search={search}
              onSearchChange={setSearch}
              onClear={() => setSearch("")}
              statusTab={statusTab}
              onStatusTabChange={setStatusTab}
              urgency={urgencyFilter}
              onUrgencyChange={setUrgencyFilter}
              dateFrom={dateFromFilter}
              onDateFromChange={setDateFromFilter}
              dateTo={dateToFilter}
              onDateToChange={setDateToFilter}
            />

            {list.isAwaitingData && !list.requests.length ? (
              <div className="space-y-4">
                <DoctorToolbarSkeleton tabs={5} />
                <DoctorTableSkeleton rows={8} columns={6} />
              </div>
            ) : list.isError ? (
              <DoctorListErrorState
                title={tr("تعذّر تحميل قائمة الانتظار", "Could not load waitlist")}
                brief={tr("حدث خطأ أثناء جلب الطلبات.", "An error occurred while fetching requests.")}
                retrying={retryingList}
                onRetry={() => void retryList()}
              />
            ) : isTrulyEmpty || isFilteredEmpty ? (
              <DoctorListEmptyIllustration
                variant="teal"
                imageSrc="/images/photo-not-found_appotemint.png"
                imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.1)]"
                title={
                  isFilteredEmpty
                    ? tr("لا توجد طلبات تطابق البحث أو الفلتر الحالي", "No requests match the current search or filter")
                    : tr("لا توجد طلبات في قائمة الانتظار بعد", "No waitlist requests yet")
                }
                subtitle={
                  isFilteredEmpty
                    ? tr("جرّب تعديل كلمات البحث أو إعادة ضبط الفلاتر لعرض النتائج", "Try adjusting search keywords or resetting filters")
                    : tr("عندما يطلب المرضى موعداً عبر قائمة الانتظار ستظهر الطلبات هنا للمتابعة والحجز", "When patients request appointments via waitlist, they will appear here")
                }
                actionLabel={tr("عرض المواعيد", "View appointments")}
                onAction={() => navigate("/secretary/appointments")}
                actionIcon={<CalendarClock className="h-4 w-4" />}
              />
            ) : (
              <WaitlistTable
                requests={list.requests}
                busy={mutations.isBusy}
                urgencyLabel={(urgency) => waitlistUrgencyLabel(urgency, tr)}
                statusLabel={(status) => waitlistStatusLabel(status, tr)}
                onNavigateAppointments={() => navigate("/secretary/appointments")}
                onContacted={(request) => void handleContacted(request)}
                onBook={handleBookClick}
                onClose={(request) => void handleClose(request)}
                onViewDetails={setDetailTarget}
              />
            )}

            {!list.isAwaitingData && !list.isError && list.requests.length > 0 ? (
              <MedicalRecordsPagination
                page={page}
                totalPages={list.totalPages}
                showingFrom={showingFrom}
                showingTo={showingTo}
                total={list.total}
                pageSize={pageSize}
                itemLabel={tr("طلب", "request")}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            ) : null}
          </div>
        )}
      </SurfaceSection>

      <WaitlistBookDialog
        open={Boolean(bookTarget)}
        request={bookTarget}
        doctorId={doctorId}
        appointmentTypes={appointmentTypes}
        busy={mutations.isBusy}
        onClose={() => setBookTarget(null)}
        onBook={async (body) => {
          if (!bookTarget) return;
          const response = await mutations.bookRequest({
            id: bookTarget._id,
            body,
          });
          toast(tr("تم حجز الموعد من قائمة الانتظار.", "Appointment was booked from the waitlist."), {
            variant: "success",
          });
          setBookTarget(null);
          if (response.appointment?._id) {
            navigate("/secretary/appointments");
          }
        }}
      />

      <ClinicAccountsModalShell
        open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title={tr("تفاصيل طلب قائمة الانتظار", "Waitlist request details")}
        maxWidthClass="max-w-[520px]"
      >
        {detailTarget ? (
          <div dir={dir} className="space-y-1 text-start">
            {[
              [tr("المريض", "Patient"), resolveWaitlistPatientName(detailTarget)],
              [tr("الرقم العام", "Public ID"), resolveWaitlistPatientPublicId(detailTarget)],
              [tr("البريد الإلكتروني", "Email"), detailPatient?.userId?.email || "—"],
              [tr("الهاتف", "Phone"), detailPatient?.userId?.phone || "—"],
              [tr("الحالة", "Status"), waitlistStatusLabel(detailTarget.status, tr)],
              [tr("الأولوية", "Urgency"), waitlistUrgencyLabel(detailTarget.urgencyLevel, tr)],
              [
                tr("التاريخ المفضل من", "Preferred date from"),
                formatBillingDate(detailTarget.preferredDateFrom),
              ],
              [
                tr("التاريخ المفضل إلى", "Preferred date to"),
                formatBillingDate(detailTarget.preferredDateTo),
              ],
              [
                tr("طريقة التواصل المفضلة", "Preferred contact method"),
                waitlistContactPreferenceLabel(detailTarget.contactPreference, tr),
              ],
              [tr("السبب / ملاحظات", "Reason / notes"), detailTarget.reason?.trim() || "—"],
              [
                tr("عدد محاولات التواصل", "Contact attempts"),
                String(detailTarget.contactAttempts ?? 0),
              ],
              [
                tr("آخر تواصل", "Last contacted"),
                detailTarget.lastContactedAt
                  ? formatBillingDate(detailTarget.lastContactedAt)
                  : "—",
              ],
              [
                tr("تاريخ الإنشاء", "Created at"),
                formatBillingDate(detailTarget.createdAt),
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-start gap-3 border-b border-[#F2F4F7] py-3 last:border-b-0"
              >
                <div className="w-[150px] shrink-0 font-cairo text-[13px] font-bold text-primary">
                  {label}
                </div>
                <div className="flex-1 break-words font-cairo text-[13px] font-semibold text-[#1F2937]">
                  {value}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </ClinicAccountsModalShell>

      <ClinicAccountsModalShell
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          resetCreateForm();
        }}
        title={tr("إضافة إلى قائمة الانتظار", "Add to waitlist")}
        maxWidthClass="max-w-[520px]"
      >
        <form
          dir={dir}
          className="space-y-4 text-start"
          onSubmit={handleCreateSubmit(async (values) => {
            if (!doctorId) {
              toast(
                tr(
                  "لا يوجد طبيب مرتبط بحسابك حالياً.",
                  "No doctor is currently assigned to your account.",
                ),
                { variant: "error" },
              );
              return;
            }
            try {
              await createWaitlistRequest.mutateAsync({
                doctorId,
                patientId: values.patientId,
                urgencyLevel: values.urgencyLevel,
                preferredDateFrom: values.preferredDateFrom,
                preferredDateTo: values.preferredDateTo,
                contactPreference: values.contactPreference,
                reason: values.reason?.trim() || undefined,
              });
              toast(tr("تمت إضافة الطلب إلى قائمة الانتظار.", "The request was added to the waitlist."), {
                variant: "success",
              });
              setCreateOpen(false);
              resetCreateForm();
            } catch (error) {
              toast(getUserFacingRequestErrorMessage(error), { variant: "error" });
            }
          })}
        >
          <div>
            <select
              {...registerCreate("patientId")}
              disabled={patientsQuery.isAwaitingData}
              className="h-11 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[13px]"
            >
              <option value="">{tr("اختر مريضاً", "Choose a patient")}</option>
              {(patientsQuery.patients ?? []).map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.user?.fullName || tr("مريض", "Patient")} - {patient.publicId || patient._id}
                </option>
              ))}
            </select>
            {createErrors.patientId ? (
              <p className="mt-1 font-cairo text-[12px] font-bold text-[#D92D20]">
                {createFieldErrorLabel(createErrors.patientId.message)}
              </p>
            ) : null}
          </div>

          <div>
            <select
              {...registerCreate("urgencyLevel")}
              className="h-11 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[13px]"
            >
              <option value="low">{waitlistUrgencyLabel("low", tr)}</option>
              <option value="medium">{waitlistUrgencyLabel("medium", tr)}</option>
              <option value="high">{waitlistUrgencyLabel("high", tr)}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-cairo text-[12px] font-bold text-[#475467]">
                {tr("التاريخ المفضل من", "Preferred date from")}
              </label>
              <input
                type="date"
                {...registerCreate("preferredDateFrom")}
                className="h-11 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[13px]"
              />
              {createErrors.preferredDateFrom ? (
                <p className="mt-1 font-cairo text-[12px] font-bold text-[#D92D20]">
                  {createFieldErrorLabel(createErrors.preferredDateFrom.message)}
                </p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block font-cairo text-[12px] font-bold text-[#475467]">
                {tr("التاريخ المفضل إلى", "Preferred date to")}
              </label>
              <input
                type="date"
                {...registerCreate("preferredDateTo")}
                className="h-11 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[13px]"
              />
              {createErrors.preferredDateTo ? (
                <p className="mt-1 font-cairo text-[12px] font-bold text-[#D92D20]">
                  {createFieldErrorLabel(createErrors.preferredDateTo.message)}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-1 block font-cairo text-[12px] font-bold text-[#475467]">
              {tr("طريقة التواصل المفضلة", "Preferred contact method")}
            </label>
            <select
              {...registerCreate("contactPreference")}
              className="h-11 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[13px]"
            >
              {WAITLIST_CONTACT_PREFERENCES.map((preference) => (
                <option key={preference} value={preference}>
                  {waitlistContactPreferenceLabel(preference, tr)}
                </option>
              ))}
            </select>
          </div>

          <textarea
            {...registerCreate("reason")}
            placeholder={tr("السبب / ملاحظات (اختياري)", "Reason / notes (optional)")}
            rows={3}
            className="w-full rounded-[8px] border border-[#E5E7EB] px-3 py-2 font-cairo text-[13px]"
          />

          <button
            type="submit"
            disabled={createWaitlistRequest.isPending}
            className="h-11 w-full rounded-[8px] bg-primary font-cairo text-[13px] font-extrabold text-white disabled:opacity-60"
          >
            {createWaitlistRequest.isPending ? tr("جاري الإضافة...", "Adding...") : tr("إضافة", "Add")}
          </button>
        </form>
      </ClinicAccountsModalShell>
    </div>
  );
}
