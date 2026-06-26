export type PatientAppointmentCounts = {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  noShow: number;
};

function normalizeAppointmentStatus(status?: string | null): string {
  return (status ?? "").trim().toLowerCase().replace(/_/g, "-");
}

export function countPatientAppointments(
  appointments: ReadonlyArray<{ status?: string | null }>,
): PatientAppointmentCounts {
  let upcoming = 0;
  let completed = 0;
  let cancelled = 0;
  let noShow = 0;

  for (const appointment of appointments) {
    const status = normalizeAppointmentStatus(appointment.status);
    if (status === "scheduled" || status === "rescheduled") {
      upcoming += 1;
    } else if (status === "completed") {
      completed += 1;
    } else if (status === "cancelled") {
      cancelled += 1;
    } else if (status === "no-show") {
      noShow += 1;
    }
  }

  return {
    total: appointments.length,
    upcoming,
    completed,
    cancelled,
    noShow,
  };
}
