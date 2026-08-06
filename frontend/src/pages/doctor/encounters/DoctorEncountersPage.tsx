import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ClipboardList, Plus, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmActionDialog from "@/components/doctor/confirm-action-dialog";
import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";
import {
  CreateEncounterDialog,
  EncountersFiltersBar,
  EncountersListPanel,
  EncountersStatusTabs,
  MedicalVisitExpandableCard,
  ENCOUNTERS_LIST_ITEM,
  ENCOUNTERS_LIST_STAGGER,
  type EncountersFiltersState,
  type MedicalVisitCardData,
  type MedicalVisitStatusFilter,
} from "@/components/doctor/encounters";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { DoctorExpandableCardSkeleton } from "@/components/doctor/shared/skeletons";
import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import {
  useCloseDoctorPatientEncounter,
  useCreateDoctorPatientEncounter,
  useDoctorEncounterCardExpandDetail,
  useDoctorMedicalEncountersPage,
  useDoctorPatients,
  prefetchEncounterWorkspace,
} from "@/hooks/doctor";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";
import {
  CreateEncounterSubmitError,
  isValidAppointmentObjectId,
  resolveCreateEncounterServerFeedback,
} from "@/lib/doctor/encounters/createEncounterFormErrors";
import { readAuthUser } from "@/lib/cookies";
import { useToast } from "@/components/ui/ToastProvider";
import { useI18n } from "@/i18n/provider";

const DEFAULT_FILTERS: EncountersFiltersState = {
  search: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "startedAt",
  sortOrder: "desc",
  status: "all",
};

function getEmptyStateCopy(
  status: MedicalVisitStatusFilter,
  tr: (ar: string, en: string) => string,
): {
  title: string;
  subtitle: string;
} {
  if (status === "open") {
    return {
      title: tr("لا توجد زيارات نشطة حاليًا", "No active encounters right now"),
      subtitle: tr(
        "ابدأ زيارة طبية جديدة لمتابعة المريض، إضافة الوصفات والتحاليل، وربط الموعد إن وجد.",
        "Start a new medical encounter to follow the patient, add prescriptions/labs, and link an appointment if available.",
      ),
    };
  }
  if (status === "closed") {
    return {
      title: tr("لا توجد زيارات مغلقة", "No closed encounters"),
      subtitle: tr(
        "عند إغلاق الزيارات الطبية ستظهر هنا مع سجلها الكامل. يمكنك بدء زيارة جديدة في أي وقت.",
        "Closed medical encounters will appear here with their full history. You can start a new encounter anytime.",
      ),
    };
  }
  return {
    title: tr("لا توجد زيارات لعرضها", "No encounters to show"),
    subtitle: tr(
      "أنشئ زيارة طبية جديدة لبدء التوثيق السريري للمريض، من الموعد أو مباشرة من العيادة.",
      "Create a new medical encounter to start clinical documentation from an appointment or directly in clinic.",
    ),
  };
}

export default function DoctorEncountersPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? "";

  const [filters, setFilters] = useState<EncountersFiltersState>(DEFAULT_FILTERS);
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogPatientId, setCreateDialogPatientId] = useState<
    string | null
  >(null);
  const [closeTarget, setCloseTarget] = useState<MedicalVisitCardData | null>(null);

  const { visits, stats, isAwaitingData, isError, error, refetch } =
    useDoctorMedicalEncountersPage(doctorId, filters);
  const { retry: retryEncounters, retrying: retryingEncounters } =
    useRetryAction(() => Promise.resolve(refetch()));

  const patientsQuery = useDoctorPatients({
    page: 1,
    limit: 100,
  });

  const createEncounterMutation = useCreateDoctorPatientEncounter(doctorId);
  const closeEncounterMutation = useCloseDoctorPatientEncounter(doctorId);

  const expandedVisit = useMemo(
    () => visits.find((visit) => visit.id === expandedVisitId) ?? null,
    [expandedVisitId, visits],
  );

  const expandDetail = useDoctorEncounterCardExpandDetail(
    doctorId,
    expandedVisit,
    Boolean(expandedVisit),
  );

  const displayStats = useMemo(
    () => ({
      total: stats.all,
      active: stats.active,
      closed: stats.closed,
    }),
    [stats],
  );

  const emptyCopy = useMemo(
    () => getEmptyStateCopy(filters.status, tr),
    [filters.status, locale],
  );

  const openCreateEncounterDialog = (patientId?: string) => {
    setCreateDialogPatientId(patientId ?? null);
    setCreateDialogOpen(true);
  };

  const handleCreateDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) setCreateDialogPatientId(null);
  };

  const isRefreshing = false;

  const handleStatusTab = (status: MedicalVisitStatusFilter) => {
    setFilters((prev) => ({ ...prev, status }));
    setExpandedVisitId(null);
  };

  const handleCreateEncounter = async ({
    patientId,
    origin,
    notes,
    appointmentId,
  }: {
    patientId: string;
    origin: string;
    notes: string;
    appointmentId: string;
  }) => {
    const trimmedAppointmentId = appointmentId.trim();
    const validAppointmentId = isValidAppointmentObjectId(trimmedAppointmentId)
      ? trimmedAppointmentId
      : undefined;

    try {
      const response = await createEncounterMutation.mutateAsync({
        patientId,
        body: {
          origin,
          notes: notes.trim() || undefined,
          ...(validAppointmentId ? { appointmentId: validAppointmentId } : {}),
        },
      });

      setCreateDialogOpen(false);
      setCreateDialogPatientId(null);
      setExpandedVisitId(response.encounter._id);
      setFilters((prev) => ({ ...prev, status: "all" }));
      toast(response.message ?? "تم إنشاء الزيارة الطبية بنجاح.", {
        title: "إنشاء زيارة",
        variant: "success",
      });
      void refetch();
    } catch (requestError) {
      const feedback = resolveCreateEncounterServerFeedback(requestError);
      throw new CreateEncounterSubmitError(feedback.fields, feedback.toastMessage);
    }
  };

  const handleCloseEncounter = async () => {
    if (!closeTarget) return;

    try {
      const response = await closeEncounterMutation.mutateAsync({
        patientId: closeTarget.patientId,
        encounterId: closeTarget.id,
      });

      toast(response.message ?? "تم إغلاق الزيارة الطبية بنجاح.", {
        title: "إغلاق زيارة",
        variant: "success",
      });
      const closedPatientId = closeTarget.patientId;
      const closedEncounterId = closeTarget.id;
      setCloseTarget(null);
      navigate(
        `/doctor/encounters/${closedPatientId}/${closedEncounterId}/summary`,
        { replace: true },
      );
    } catch (requestError) {
      toast(getUserFacingRequestErrorMessage(requestError), {
        title: "تعذر إغلاق الزيارة",
        variant: "error",
      });
      throw requestError;
    }
  };

  return (
    <>
      <Helmet>
        <title>{tr("الزيارات الطبية • LMJ Health", "Encounters • LMJ Health")}</title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full">
        <DoctorDashboardOverview
          variant="encounters"
          surface="mint"
          title={tr("الزيارات الطبية", "Medical Encounters")}
          subtitle={tr("جميع زياراتك", "All your encounters")}
          headerIcon={<ClipboardList className="h-8 w-8 text-white" aria-hidden />}
          actionLabel={tr("زيارة جديدة", "New encounter")}
          actionIcon={<Plus className="h-4 w-4" aria-hidden />}
          onActionClick={() => openCreateEncounterDialog()}
          kpis={[
            {
              key: "all",
              icon: <ClipboardList className="h-5 w-5 shrink-0" />,
              value: displayStats.total,
              label: tr("الكل", "All"),
            },
            {
              key: "open",
              icon: <Stethoscope className="h-5 w-5 shrink-0" />,
              value: displayStats.active,
              label: tr("نشطة", "Active"),
            },
            {
              key: "closed",
              icon: <ClipboardList className="h-5 w-5 shrink-0" />,
              value: displayStats.closed,
              label: tr("مغلقة", "Closed"),
            },
          ]}
        />

        <EncountersFiltersBar
          filters={filters}
          onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        />

        <EncountersStatusTabs
          value={filters.status}
          onChange={handleStatusTab}
          disabled={false}
        />

        {isAwaitingData ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DoctorExpandableCardSkeleton count={5} />
          </motion.div>
        ) : isError ? (
          <DoctorListErrorState
            title="تعذّر تحميل الزيارات الطبية"
            brief={getUserFacingRequestErrorMessage(error)}
            detail={getUserFacingRequestErrorMessage(error)}
            retrying={retryingEncounters}
            onRetry={() => void retryEncounters()}
          />
        ) : (
          <EncountersListPanel
            panelKey={filters.status}
            isRefreshing={false}
          >
            {visits.length === 0 ? (
              <PatientTabEmptyIllustration
                variant="teal"
                imageSrc="/images/photo-not-meduical-file.png"
                title={emptyCopy.title}
                subtitle={emptyCopy.subtitle}
                actionLabel="إضافة زيارة جديدة"
                onAction={() => openCreateEncounterDialog()}
                actionIcon={<Plus className="h-4 w-4" />}
              />
            ) : (
              <motion.div
                variants={ENCOUNTERS_LIST_STAGGER}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                <AnimatePresence mode="popLayout">
                  {visits.map((visit) => {
                    const isExpanded = expandedVisitId === visit.id;
                    const displayVisit =
                      isExpanded && expandDetail.visit
                        ? expandDetail.visit
                        : visit;

                    return (
                      <motion.div
                        key={visit.id}
                        layout
                        variants={ENCOUNTERS_LIST_ITEM}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                      >
                        <MedicalVisitExpandableCard
                          visit={displayVisit}
                          expanded={isExpanded}
                          detailsLoading={
                            isExpanded && expandDetail.isAwaitingData
                          }
                          detailsError={
                            isExpanded && expandDetail.isError
                              ? getUserFacingRequestErrorMessage(
                                  expandDetail.error,
                                )
                              : null
                          }
                          closing={
                            closeEncounterMutation.isPending &&
                            closeTarget?.id === visit.id
                          }
                          onToggle={() =>
                            setExpandedVisitId((current) =>
                              current === visit.id ? null : visit.id,
                            )
                          }
                          onContinueDraft={() => {
                            prefetchEncounterWorkspace(
                              queryClient,
                              doctorId,
                              visit.patientId,
                              visit.id,
                            );
                            navigate(
                              `/doctor/encounters/${visit.patientId}/${visit.id}`,
                            );
                          }}
                          onWarmWorkspace={() =>
                            prefetchEncounterWorkspace(
                              queryClient,
                              doctorId,
                              visit.patientId,
                              visit.id,
                            )
                          }
                          onStartNewVisit={() =>
                            openCreateEncounterDialog(visit.patientId)
                          }
                          onCloseVisit={() => setCloseTarget(displayVisit)}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </EncountersListPanel>
        )}
      </div>

      <CreateEncounterDialog
        open={createDialogOpen}
        onOpenChange={handleCreateDialogOpenChange}
        defaultPatientId={createDialogPatientId ?? undefined}
        patients={patientsQuery.patients}
        submitting={createEncounterMutation.isPending}
        onSubmit={handleCreateEncounter}
      />

      <ConfirmActionDialog
        open={Boolean(closeTarget)}
        onOpenChange={(open) => {
          if (!open) setCloseTarget(null);
        }}
        title="إغلاق الزيارة الطبية"
        description={
          closeTarget ? (
            <>
              سيتم إغلاق زيارة المريض <strong>{closeTarget.patientName}</strong>.
              تأكد من عدم وجود مسودات وصفات أو طلبات غير مكتملة قبل المتابعة.
            </>
          ) : (
            "سيتم إغلاق الزيارة الحالية."
          )
        }
        confirmLabel="تأكيد الإغلاق"
        confirmDisabled={closeEncounterMutation.isPending}
        onConfirm={handleCloseEncounter}
      />
    </>
  );
}
