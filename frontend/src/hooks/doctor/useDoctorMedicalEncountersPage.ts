import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  isAwaitingAnyQueryResults,
} from "@/lib/query/queryUi";
import type {
  EncountersFiltersState,
  MedicalVisitCardData,
  MedicalVisitStatusFilter,
} from "@/components/doctor/encounters/types";
import { doctorApi, doctorPatientsQueryKeys } from "@/lib/doctor/client";
import type {
  DoctorEncounterSummary,
  DoctorPatientListItem,
} from "@/lib/doctor/types";
import { useDoctorPatients } from "./useDoctorPatients";

const MAX_PATIENTS_FOR_ENCOUNTERS = 100;

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

function formatVisitDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatVisitTime(value?: string | null): string {
  if (!value) return "-";
  if (/^\d{1,2}:\d{2}/.test(value)) return value.slice(0, 5);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatArabicTimeWithPeriod(value?: string | null): {
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

  const period = hours < 12 ? "صباحًا" : "مساءً";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const time = `${String(displayHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return { time, period };
}

function originToVisitType(origin?: string): string {
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

function mapEncounterToMedicalVisit(
  encounter: DoctorEncounterSummary,
  patient: Pick<DoctorPatientListItem, "_id" | "publicId" | "user">,
): MedicalVisitCardData {
  const status: "open" | "closed" =
    encounter.status === "closed" ? "closed" : "open";
  const started = encounter.startedAt ?? encounter.createdAt;
  const apptDate = encounter.appointment?.date;
  const apptTime = encounter.appointment?.startTime;
  const listTimeSource = apptTime ?? started;
  const { time: listTimeLabel, period: listTimePeriodLabel } =
    formatArabicTimeWithPeriod(listTimeSource);

  return {
    id: encounter._id,
    patientId: patient._id,
    patientName: patient.user?.fullName ?? "مريض",
    patientAge: null,
    fileNumber: patient.publicId ? `#${patient.publicId}` : `#${patient._id.slice(-6)}`,
    visitTypeLabel: originToVisitType(encounter.origin),
    status,
    origin: encounter.origin,
    notes: encounter.notes,
    startedAtLabel: formatVisitDate(started),
    closedAtLabel: formatVisitDate(encounter.closedAt),
    appointmentAtLabel: apptTime
      ? `${formatVisitDate(apptDate)} ${formatVisitTime(apptTime)}`.trim()
      : formatVisitDate(apptDate),
    listDateLabel: formatVisitDate(started),
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
              apptTime && formatVisitTime(apptTime) !== "-"
                ? formatVisitTime(apptTime)
                : "—",
          }
        : null,
    drafts:
      status === "open"
        ? [
            {
              id: `${encounter._id}-draft`,
              code: `ENC-${encounter._id.slice(-6).toUpperCase()}`,
              updatedAtLabel: formatVisitDate(encounter.createdAt),
              prescriptionsCount: 0,
              labTestsCount: 0,
              imagingCount: 0,
            },
          ]
        : [],
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
  const patientsQuery = useDoctorPatients({
    page: 1,
    limit: MAX_PATIENTS_FOR_ENCOUNTERS,
  });

  const patients = patientsQuery.patients;

  const encounterQueries = useQueries({
    queries: patients.map((patient) => ({
      queryKey: doctorPatientsQueryKeys.encounters(doctorId, patient._id, {
        status: filters.status === "all" ? undefined : filters.status,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: 1,
        limit: 20,
      }),
      queryFn: () =>
        doctorApi.patients.listEncounters(doctorId, patient._id, {
          status: filters.status === "all" ? undefined : filters.status,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          page: 1,
          limit: 20,
        }),
      enabled: Boolean(doctorId && patient._id),
      staleTime: 1000 * 30,
    })),
  });

  const apiVisits = useMemo(() => {
    const items: MedicalVisitCardData[] = [];
    encounterQueries.forEach((query, index) => {
      const patient = patients[index];
      if (!patient || !query.data?.encounters?.length) return;
      for (const encounter of query.data.encounters) {
        items.push(mapEncounterToMedicalVisit(encounter, patient));
      }
    });
    return items;
  }, [encounterQueries, patients]);

  const visits = useMemo(() => {
    const unique = new Map<string, MedicalVisitCardData>();
    for (const visit of apiVisits) {
      unique.set(visit.id, visit);
    }

    return [...unique.values()]
      .filter((visit) => matchesStatus(visit, filters.status))
      .filter((visit) => matchesSearch(visit, filters.search));
  }, [apiVisits, filters.search, filters.status]);

  const stats = useMemo(() => {
    const all = visits.length;
    const active = visits.filter((v) => v.status === "open").length;
    const closed = visits.filter((v) => v.status === "closed").length;
    return { all, active, closed };
  }, [visits]);

  const firstEncounterError =
    encounterQueries.find((query) => query.isError)?.error ?? null;
  const isAwaitingData =
    patientsQuery.isAwaitingData ||
    isAwaitingAnyQueryResults(encounterQueries);
  const isError = patientsQuery.isError || Boolean(firstEncounterError);
  const error = patientsQuery.error ?? firstEncounterError;

  return {
    visits,
    stats,
    isAwaitingData,
    isError,
    error,
    refetch: () => {
      void patientsQuery.refetch();
      encounterQueries.forEach((q) => void q.refetch());
    },
  };
}

export function useDoctorEncounterDetailsView(
  visit: MedicalVisitCardData | null,
  encounter: DoctorEncounterSummary | null | undefined,
) {
  return useMemo(() => {
    if (!visit || !encounter) return visit;

    const mapped = mapEncounterToMedicalVisit(encounter, {
      _id: visit.patientId,
      publicId: visit.fileNumber.replace(/^#/, ""),
      user: {
        _id: visit.patientId,
        fullName: visit.patientName,
      },
    });

    return {
      ...visit,
      ...mapped,
      id: visit.id,
      patientId: visit.patientId,
      patientName: visit.patientName,
      patientAge: visit.patientAge,
      drafts: visit.drafts,
    };
  }, [encounter, visit]);
}

export const useDoctorMedicalVisitsPage = useDoctorMedicalEncountersPage;
