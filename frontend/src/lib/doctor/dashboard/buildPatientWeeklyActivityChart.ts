export type PatientWeeklyActivityBar = {
  isoDate: string;
  dayLabel: string;
  patientCount: number;
  appointmentCount: number;
  /** Primary metric for bar height — appointments per day from API. */
  value: number;
};

export type PatientWeeklyActivityChart = {
  bars: PatientWeeklyActivityBar[];
  averagePatientsPerDay: number;
  totalUniquePatients: number;
  totalAppointments: number;
};

type AppointmentLike = {
  date?: string | null;
  startDateTime?: string | null;
  patient?: { _id?: string | null } | string | null;
};

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function resolveAppointmentDate(appointment: AppointmentLike): string | null {
  if (appointment.date) return appointment.date.slice(0, 10);
  if (appointment.startDateTime) {
    const parsed = new Date(appointment.startDateTime);
    if (!Number.isNaN(parsed.getTime())) {
      return toLocalIsoDate(parsed);
    }
    return appointment.startDateTime.slice(0, 10);
  }
  return null;
}

function resolvePatientId(appointment: AppointmentLike): string | null {
  const patient = appointment.patient;
  if (!patient) return null;
  if (typeof patient === 'string') return patient;
  return patient._id ?? null;
}

function formatWeekday(isoDate: string, locale: 'ar' | 'en' = 'ar'): string {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', {
    weekday: 'long',
  });
}

export function getLastSevenDaysRange(referenceDate = new Date()): {
  dateFrom: string;
  dateTo: string;
} {
  const end = new Date(referenceDate);
  end.setHours(12, 0, 0, 0);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);

  return {
    dateFrom: toLocalIsoDate(start),
    dateTo: toLocalIsoDate(end),
  };
}

export function buildPatientWeeklyActivityChart(
  appointments: ReadonlyArray<AppointmentLike>,
  referenceDate = new Date(),
  locale: 'ar' | 'en' = 'ar',
): PatientWeeklyActivityChart {
  const { dateFrom, dateTo } = getLastSevenDaysRange(referenceDate);
  const dayKeys: string[] = [];
  const cursor = new Date(`${dateFrom}T12:00:00`);

  for (let index = 0; index < 7; index += 1) {
    dayKeys.push(toLocalIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const patientsByDay = new Map<string, Set<string>>();
  const appointmentsByDay = new Map<string, number>();

  for (const day of dayKeys) {
    patientsByDay.set(day, new Set());
    appointmentsByDay.set(day, 0);
  }

  const allPatients = new Set<string>();

  for (const appointment of appointments) {
    const isoDate = resolveAppointmentDate(appointment);
    if (!isoDate || isoDate < dateFrom || isoDate > dateTo) continue;

    appointmentsByDay.set(isoDate, (appointmentsByDay.get(isoDate) ?? 0) + 1);

    const patientId = resolvePatientId(appointment);
    if (patientId) {
      patientsByDay.get(isoDate)?.add(patientId);
      allPatients.add(patientId);
    }
  }

  const bars = dayKeys.map((isoDate) => {
    const patientCount = patientsByDay.get(isoDate)?.size ?? 0;
    const appointmentCount = appointmentsByDay.get(isoDate) ?? 0;

    return {
      isoDate,
      dayLabel: formatWeekday(isoDate, locale),
      patientCount,
      appointmentCount,
      value: appointmentCount,
    };
  });

  const totalPatientsInWeek = bars.reduce((sum, bar) => sum + bar.patientCount, 0);
  const averagePatientsPerDay =
    bars.length > 0 ? Math.round((totalPatientsInWeek / bars.length) * 10) / 10 : 0;

  return {
    bars,
    averagePatientsPerDay,
    totalUniquePatients: allPatients.size,
    totalAppointments: appointments.reduce((sum, appointment) => {
      const isoDate = resolveAppointmentDate(appointment);
      if (!isoDate || isoDate < dateFrom || isoDate > dateTo) return sum;
      return sum + 1;
    }, 0),
  };
}

export function scaleWeeklyBarHeight(
  count: number,
  maxCount: number,
  maxHeight = 120,
  minNonZeroHeight = 28,
  zeroHeight = 6,
): number {
  if (count <= 0) return zeroHeight;
  if (maxCount <= 0) return minNonZeroHeight;
  if (count >= maxCount) return maxHeight;

  const ratio = count / maxCount;
  return Math.round(minNonZeroHeight + ratio * (maxHeight - minNonZeroHeight));
}
