import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";
import { useI18n } from "@/i18n/provider";
import type { AppLocale } from "@/i18n/runtime";
import type {
  EncountersFiltersState,
  MedicalVisitCardData,
  MedicalVisitDraft,
  MedicalVisitStatusFilter,
} from "@/components/doctor/encounters/types";
import {
  doctorApi,
  doctorEncountersQueryKeys,
  doctorPatientsQueryKeys,
} from "@/lib/doctor/client";
import type {
  EncounterOrder,
  EncounterPrescription,
} from "@/lib/doctor/encounters/encounterClinicalTypes";
import {
  filterEncounterOrdersByCategory,
  isDraftEncounterOrder,
} from "@/lib/doctor/encounters/encounterOrderCategories";
import { normalizeEncounterOrdersList } from "@/lib/doctor/encounters/encounterOrderLoad";
import type { DoctorEncounterSummary } from "@/lib/doctor/types";
import { useDoctorPatientEncounterDetail } from "@/hooks/doctor/patients/useDoctorPatients";

const ENCOUNTER_EXPAND_STALE_MS = 1000 * 60;

const ENCOUNTERS_LIST_LIMIT = 100;

function formatLinkedAppointmentDate(value?: string | null): string {
  if (!value) return "—";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatVisitDate(value?: string | null, locale: AppLocale = "ar"): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatVisitTime(value?: string | null, locale: AppLocale = "ar"): string {
  if (!value) return "-";
  if (/^\d{1,2}:\d{2}/.test(value)) return value.slice(0, 5);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString(locale === "ar" ? "ar-SA" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatTimeWithPeriod(
  value?: string | null,
  locale: AppLocale = "ar",
): {
  time: string;
  period: string;
} {
  if (!value) return { time: "-", period: "" };

  let hours = 0;
  let minutes = 0;

  if (/^\d{1,2}:\d{2}/.test(value)) {
    const [h, m] = value.split(":").map((part) => Number(part));
    hours = Number.isFinite(h) ? h : 0;
    minutes = Number.isFinite(m) ? m : 0;
  } else {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return { time: value, period: "" };
    }
    hours = date.getHours();
    minutes = date.getMinutes();
  }

  const period =
    locale === "ar"
      ? hours < 12
        ? "صباحًا"
        : "مساءً"
      : hours < 12
        ? "AM"
        : "PM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const time = `${String(displayHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return { time, period };
}

function originToVisitType(origin: string | undefined, locale: AppLocale): string {
  if (locale === "en") {
    switch (origin) {
      case "appointment":
        return "Scheduled visit";
      case "walk_in":
        return "Walk-in visit";
      case "follow_up":
        return "Follow-up";
      case "manual":
        return "Manual visit";
      default:
        return "Medical visit";
    }
  }
  switch (origin) {
    case "appointment":
      return "فحص دوري";
    case "walk_in":
      return "زيارة مباشرة";
    case "follow_up":
      return "متابعة";
    case "manual":
      return "زيارة يدوية";
    default:
      return "زيارة طبية";
  }
}

function fallbackPatientName(locale: AppLocale): string {
  return locale === "ar" ? "مريض" : "Patient";
}

function isDraftPrescription(rx: EncounterPrescription) {
  const status = (rx.status ?? "").toLowerCase();
  return !status.includes("final") && !rx.finalizedAt;
}

function buildVisitDrafts(
  encounter: DoctorEncounterSummary,
  locale: AppLocale,
  clinical?: {
    prescriptions?: EncounterPrescription[];
    orders?: EncounterOrder[];
  },
): MedicalVisitDraft[] {
  if (encounter.status === "closed" || !clinical) return [];

  const prescriptions = clinical.prescriptions ?? [];
  const orders = clinical.orders ?? [];
  const prescriptionsCount = prescriptions.filter(isDraftPrescription).length;
  const labTestsCount = filterEncounterOrdersByCategory(orders, "lab").filter(
    isDraftEncounterOrder,
  ).length;
  const imagingCount = filterEncounterOrdersByCategory(
    orders,
    "radiology",
  ).filter(isDraftEncounterOrder).length;

  return [
    {
      id: `${encounter._id}-draft`,
      code: `ENC-${encounter._id.slice(-6).toUpperCase()}`,
      updatedAtLabel: formatVisitDate(encounter.createdAt, locale),
      prescriptionsCount,
      labTestsCount,
      imagingCount,
    },
  ];
}

function mapEncounterToMedicalVisit(
  encounter: DoctorEncounterSummary,
  locale: AppLocale,
  clinical?: {
    prescriptions?: EncounterPrescription[];
    orders?: EncounterOrder[];
  },
): MedicalVisitCardData {
  const patient = encounter.patient;
  const patientId = patient?._id ?? "";
  const status: "open" | "closed" =
    encounter.status === "closed" ? "closed" : "open";
  const started = encounter.startedAt ?? encounter.createdAt;
  const apptDate = encounter.appointment?.date;
  const apptTime = encounter.appointment?.startTime;
  const listTimeSource = apptTime ?? started;
  const { time: listTimeLabel, period: listTimePeriodLabel } =
    formatTimeWithPeriod(listTimeSource, locale);

  return {
    id: encounter._id,
    patientId,
    patientName: patient?.user?.fullName ?? fallbackPatientName(locale),
    patientAge: patient?.age ?? null,
    fileNumber: patient?.publicId
      ? `#${patient.publicId}`
      : patientId
        ? `#${patientId.slice(-6)}`
        : "#—",
    visitTypeLabel: originToVisitType(encounter.origin, locale),
    status,
    origin: encounter.origin,
    notes: encounter.notes,
    startedAtLabel: formatVisitDate(started, locale),
    closedAtLabel: formatVisitDate(encounter.closedAt, locale),
    appointmentAtLabel: apptTime
      ? `${formatVisitDate(apptDate, locale)} ${formatVisitTime(apptTime, locale)}`.trim()
      : formatVisitDate(apptDate, locale),
    listDateLabel: formatVisitDate(started, locale),
    listTimeLabel,
    listTimePeriodLabel,
    appointmentTypeName:
      encounter.appointment?.appointmentTypeNameSnapshot ??
      encounter.appointment?.appointmentType ??
      null,
    linkedAppointment:
      apptDate || apptTime
        ? {
            date:
              apptDate && formatLinkedAppointmentDate(apptDate) !== "—"
                ? formatLinkedAppointmentDate(apptDate)
                : "—",
            time:
              apptTime && formatVisitTime(apptTime, locale) !== "-"
                ? formatVisitTime(apptTime, locale)
                : "—",
          }
        : null,
    drafts: buildVisitDrafts(encounter, locale, clinical),
  };
}

function mergeListVisitWithEncounterDetail(
  visit: MedicalVisitCardData,
  encounter: DoctorEncounterSummary,
  locale: AppLocale,
  clinical?: {
    prescriptions?: EncounterPrescription[];
    orders?: EncounterOrder[];
  },
): MedicalVisitCardData {
  const mapped = mapEncounterToMedicalVisit(encounter, locale, clinical);
  const fallback = fallbackPatientName(locale);

  return {
    ...visit,
    ...mapped,
    id: visit.id,
    patientId: mapped.patientId || visit.patientId,
    patientName:
      mapped.patientName !== fallback ? mapped.patientName : visit.patientName,
    patientAge: mapped.patientAge ?? visit.patientAge,
  };
}

function matchesSearch(visit: MedicalVisitCardData, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    visit.patientName,
    visit.fileNumber,
    visit.visitTypeLabel,
    visit.listDateLabel,
  ].some((value) => value.toLowerCase().includes(q));
}

function matchesStatus(
  visit: MedicalVisitCardData,
  status: MedicalVisitStatusFilter,
): boolean {
  if (status === "all") return true;
  if (status === "open") return visit.status === "open";
  return visit.status === "closed";
}

export function useDoctorMedicalEncountersPage(
  doctorId: string,
  filters: EncountersFiltersState,
) {
  const { locale } = useI18n();
  const listParams = useMemo(
    () => ({
      status: filters.status === "all" ? undefined : filters.status,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: 1,
      limit: ENCOUNTERS_LIST_LIMIT,
    }),
    [
      filters.status,
      filters.dateFrom,
      filters.dateTo,
      filters.sortBy,
      filters.sortOrder,
    ],
  );

  const encountersQuery = useQuery({
    queryKey: doctorEncountersQueryKeys.list(doctorId, listParams),
    queryFn: () => doctorApi.encounters.list(doctorId, listParams),
    enabled: Boolean(doctorId),
    staleTime: 1000 * 60,
  });

  const apiVisits = useMemo(() => {
    const encounters = encountersQuery.data?.encounters ?? [];
    return encounters.map((encounter) =>
      mapEncounterToMedicalVisit(encounter, locale),
    );
  }, [encountersQuery.data?.encounters, locale]);

  const visits = useMemo(() => {
    return apiVisits
      .filter((visit) => matchesStatus(visit, filters.status))
      .filter((visit) => matchesSearch(visit, filters.search));
  }, [apiVisits, filters.search, filters.status]);

  const stats = useMemo(() => {
    const all = visits.length;
    const active = visits.filter((v) => v.status === "open").length;
    const closed = visits.filter((v) => v.status === "closed").length;
    return { all, active, closed };
  }, [visits]);

  return {
    visits,
    stats,
    isAwaitingData:
      Boolean(doctorId) &&
      isAwaitingInitialQueryData(encountersQuery.data, encountersQuery.isError),
    isError: encountersQuery.isError,
    error: encountersQuery.error,
    refetch: () => {
      void encountersQuery.refetch();
    },
  };
}

/** Fetches encounter detail + clinical lists when a list card is expanded. */
export function useDoctorEncounterCardExpandDetail(
  doctorId: string,
  visit: MedicalVisitCardData | null,
  expanded: boolean,
) {
  const { locale } = useI18n();
  const patientId = visit?.patientId ?? "";
  const encounterId = visit?.id ?? "";
  const enabled =
    expanded &&
    Boolean(doctorId) &&
    Boolean(patientId) &&
    Boolean(encounterId);

  const encounterQuery = useDoctorPatientEncounterDetail(
    doctorId,
    patientId,
    encounterId,
    enabled,
  );

  const [prescriptionsQuery, ordersQuery] = useQueries({
    queries: [
      {
        queryKey: [
          ...doctorPatientsQueryKeys.encounterWorkspace(
            doctorId,
            patientId,
            encounterId,
          ),
          "prescriptions",
        ],
        queryFn: () =>
          doctorApi.patients.listEncounterPrescriptions(
            doctorId,
            patientId,
            encounterId,
            { limit: 100, page: 1 },
          ),
        enabled,
        staleTime: ENCOUNTER_EXPAND_STALE_MS,
      },
      {
        queryKey: [
          ...doctorPatientsQueryKeys.encounterWorkspace(
            doctorId,
            patientId,
            encounterId,
          ),
          "orders",
        ],
        queryFn: () =>
          doctorApi.patients.listEncounterOrders(
            doctorId,
            patientId,
            encounterId,
            { limit: 100, page: 1 },
          ),
        enabled,
        staleTime: ENCOUNTER_EXPAND_STALE_MS,
      },
    ],
  });

  const clinical = useMemo(
    () => ({
      prescriptions: prescriptionsQuery.data?.prescriptions,
      orders: normalizeEncounterOrdersList(ordersQuery.data),
    }),
    [ordersQuery.data, prescriptionsQuery.data?.prescriptions],
  );

  const visitWithDetails = useMemo(() => {
    if (!visit) return null;
    if (!encounterQuery.encounter) return visit;
    return mergeListVisitWithEncounterDetail(
      visit,
      encounterQuery.encounter,
      locale,
      clinical,
    );
  }, [clinical, encounterQuery.encounter, locale, visit]);

  const clinicalAwaiting =
    enabled &&
    (isAwaitingInitialQueryData(
      prescriptionsQuery.data,
      prescriptionsQuery.isError,
    ) ||
      isAwaitingInitialQueryData(ordersQuery.data, ordersQuery.isError));

  return {
    visit: visitWithDetails,
    isAwaitingData: enabled && (encounterQuery.isAwaitingData || clinicalAwaiting),
    isError: encounterQuery.isError,
    error: encounterQuery.error,
  };
}

export function useDoctorEncounterDetailsView(
  visit: MedicalVisitCardData | null,
  encounter: DoctorEncounterSummary | null | undefined,
  clinical?: {
    prescriptions?: EncounterPrescription[];
    orders?: EncounterOrder[];
  },
) {
  const { locale } = useI18n();
  return useMemo(() => {
    if (!visit || !encounter) return visit;
    return mergeListVisitWithEncounterDetail(visit, encounter, locale, clinical);
  }, [clinical, encounter, locale, visit]);
}

export const useDoctorMedicalVisitsPage = useDoctorMedicalEncountersPage;
