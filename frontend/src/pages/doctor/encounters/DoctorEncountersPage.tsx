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
  t: (key: string) => string,
): {
  title: string;
  subtitle: string;
} {
  if (status === "open") {
    return {
      title: t("doctor.encounters.empty.open.title"),
      subtitle: t("doctor.encounters.empty.open.subtitle"),
    };
  }
  if (status === "closed") {
    return {
      title: t("doctor.encounters.empty.closed.title"),
      subtitle: t("doctor.encounters.empty.closed.subtitle"),
    };
  }
  return {
    title: t("doctor.encounters.empty.all.title"),
    subtitle: t("doctor.encounters.empty.all.subtitle"),
  };
}

export default function DoctorEncountersPage() {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? "";

  const [filters, setFilters] =
    useState<EncountersFiltersState>(DEFAULT_FILTERS);
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogPatientId, setCreateDialogPatientId] = useState<
    string | null
  >(null);
  const [closeTarget, setCloseTarget] = useState<MedicalVisitCardData | null>(
    null,
  );

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
    () => getEmptyStateCopy(filters.status, t),
    [filters.status, t],
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
      toast(response.message ?? t("doctor.encounters.createSuccess"), {
        title: t("doctor.encounters.createTitle"),
        variant: "success",
      });
      void refetch();
    } catch (requestError) {
      const feedback = resolveCreateEncounterServerFeedback(requestError);
      throw new CreateEncounterSubmitError(
        feedback.fields,
        feedback.toastMessage,
      );
    }
  };

  const handleCloseEncounter = async () => {
    if (!closeTarget) return;

    try {
      const response = await closeEncounterMutation.mutateAsync({
        patientId: closeTarget.patientId,
        encounterId: closeTarget.id,
      });

      toast(response.message ?? t("doctor.encounters.closeSuccess"), {
        title: t("doctor.encounters.closeTitle"),
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
        title: t("doctor.encounters.closeFailed"),
        variant: "error",
      });
      throw requestError;
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("doctor.encounters.page.title")}</title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full">
        <DoctorDashboardOverview
          variant="encounters"
          surface="mint"
          title={t("doctor.encounters.title")}
          subtitle={t("doctor.encounters.subtitle")}
          headerIcon={
            <ClipboardList className="h-8 w-8 text-white" aria-hidden />
          }
          actionLabel={t("doctor.encounters.newEncounter")}
          actionIcon={<Plus className="h-4 w-4" aria-hidden />}
          onActionClick={() => openCreateEncounterDialog()}
          kpis={[
            {
              key: "all",
              icon: <ClipboardList className="h-5 w-5 shrink-0" />,
              value: displayStats.total,
              label: t("doctor.encounters.kpi.all"),
            },
            {
              key: "open",
              icon: <Stethoscope className="h-5 w-5 shrink-0" />,
              value: displayStats.active,
              label: t("doctor.encounters.kpi.active"),
            },
            {
              key: "closed",
              icon: <ClipboardList className="h-5 w-5 shrink-0" />,
              value: displayStats.closed,
              label: t("doctor.encounters.kpi.closed"),
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
            title={t("doctor.encounters.loadFailed")}
            brief={getUserFacingRequestErrorMessage(error)}
            detail={getUserFacingRequestErrorMessage(error)}
            retrying={retryingEncounters}
            onRetry={() => void retryEncounters()}
          />
        ) : (
          <EncountersListPanel panelKey={filters.status} isRefreshing={false}>
            {visits.length === 0 ? (
              <PatientTabEmptyIllustration
                variant="teal"
                imageSrc="/images/photo-not-meduical-file.png"
                title={emptyCopy.title}
                subtitle={emptyCopy.subtitle}
                actionLabel={t("doctor.encounters.empty.addNew")}
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
        title={t("doctor.encounters.confirmCloseTitle")}
        description={
          closeTarget ? (
            locale === "ar" ? (
              <>
                سيتم إغلاق زيارة المريض{" "}
                <strong>{closeTarget.patientName}</strong>. تأكد من عدم وجود
                مسودات وصفات أو طلبات غير مكتملة قبل المتابعة.
              </>
            ) : (
              <>
                The encounter for patient{" "}
                <strong>{closeTarget.patientName}</strong> will be closed. Make
                sure there are no incomplete prescription drafts or orders
                before proceeding.
              </>
            )
          ) : (
            t("doctor.encounters.confirmCloseDescription")
          )
        }
        confirmLabel={t("doctor.encounters.confirmCloseLabel")}
        confirmDisabled={closeEncounterMutation.isPending}
        onConfirm={handleCloseEncounter}
      />
    </>
  );
}
