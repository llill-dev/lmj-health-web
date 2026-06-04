import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ClipboardList, Loader2, Plus, Stethoscope } from "lucide-react";
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
import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import {
  useCloseDoctorPatientEncounter,
  useCreateDoctorPatientEncounter,
  useDoctorEncounterDetailsView,
  useDoctorMedicalEncountersPage,
  useDoctorPatientEncounterDetail,
  useDoctorPatients,
  prefetchEncounterWorkspace,
} from "@/hooks/doctor";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import {
  CreateEncounterSubmitError,
  isValidAppointmentObjectId,
  resolveCreateEncounterServerFeedback,
} from "@/lib/doctor/createEncounterFormErrors";
import { readAuthUser } from "@/lib/cookies";
import { useToast } from "@/components/ui/ToastProvider";

const DEFAULT_FILTERS: EncountersFiltersState = {
  search: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "startedAt",
  sortOrder: "desc",
  status: "all",
};

function getEmptyStateCopy(status: MedicalVisitStatusFilter): {
  title: string;
  subtitle: string;
} {
  if (status === "open") {
    return {
      title: "لا توجد زيارات نشطة حاليًا",
      subtitle:
        "ابدأ زيارة طبية جديدة لمتابعة المريض، إضافة الوصفات والتحاليل، وربط الموعد إن وجد.",
    };
  }
  if (status === "closed") {
    return {
      title: "لا توجد زيارات مغلقة",
      subtitle:
        "عند إغلاق الزيارات الطبية ستظهر هنا مع سجلها الكامل. يمكنك بدء زيارة جديدة في أي وقت.",
    };
  }
  return {
    title: "لا توجد زيارات لعرضها",
    subtitle:
      "أنشئ زيارة طبية جديدة لبدء التوثيق السريري للمريض، من الموعد أو مباشرة من العيادة.",
  };
}

export default function DoctorEncountersPage() {
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

  const { visits, stats, isLoading, isError, error, refetch, isFetching } =
    useDoctorMedicalEncountersPage(doctorId, filters);

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

  const encounterDetailQuery = useDoctorPatientEncounterDetail(
    doctorId,
    expandedVisit?.patientId ?? "",
    expandedVisit?.id ?? "",
    Boolean(expandedVisit),
  );

  const expandedVisitWithDetails = useDoctorEncounterDetailsView(
    expandedVisit,
    encounterDetailQuery.encounter,
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
    () => getEmptyStateCopy(filters.status),
    [filters.status],
  );

  const openCreateEncounterDialog = (patientId?: string) => {
    setCreateDialogPatientId(patientId ?? null);
    setCreateDialogOpen(true);
  };

  const handleCreateDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) setCreateDialogPatientId(null);
  };

  const isRefreshing = isFetching && !isLoading;

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
        <title>الزيارات الطبية • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="w-full">
        <DoctorDashboardOverview
          variant="encounters"
          surface="mint"
          title="الزيارات الطبية"
          subtitle="جميع زياراتك"
          headerIcon={<ClipboardList className="h-8 w-8 text-white" aria-hidden />}
          actionLabel="زيارة جديدة"
          actionIcon={<Plus className="h-4 w-4" aria-hidden />}
          onActionClick={() => openCreateEncounterDialog()}
          kpis={[
            {
              key: "all",
              icon: <ClipboardList className="h-5 w-5 shrink-0" />,
              value: displayStats.total,
              label: "الكل",
            },
            {
              key: "open",
              icon: <Stethoscope className="h-5 w-5 shrink-0" />,
              value: displayStats.active,
              label: "نشطة",
            },
            {
              key: "closed",
              icon: <ClipboardList className="h-5 w-5 shrink-0" />,
              value: displayStats.closed,
              label: "مغلقة",
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
          disabled={isRefreshing}
        />

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-[280px] items-center justify-center rounded-[16px] border border-dashed border-[#E2E8F0] bg-white"
          >
            <Loader2
              className="h-8 w-8 animate-spin text-primary"
              aria-label="جارٍ التحميل"
            />
          </motion.div>
        ) : isError ? (
          <DoctorListErrorState
            title="تعذّر تحميل الزيارات الطبية"
            brief={getUserFacingRequestErrorMessage(error)}
            detail={getUserFacingRequestErrorMessage(error)}
            retrying={isFetching}
            onRetry={refetch}
          />
        ) : (
          <EncountersListPanel
            panelKey={filters.status}
            isRefreshing={isRefreshing && visits.length > 0}
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
                      isExpanded && expandedVisitWithDetails
                        ? expandedVisitWithDetails
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
                            isExpanded && encounterDetailQuery.isLoading
                          }
                          detailsError={
                            isExpanded && encounterDetailQuery.isError
                              ? getUserFacingRequestErrorMessage(
                                  encounterDetailQuery.error,
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
