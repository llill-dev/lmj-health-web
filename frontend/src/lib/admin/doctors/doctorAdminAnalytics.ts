import type {
  AdminDoctorAnalyticsRange,
  AdminDoctorDetailsDoctor,
  DiagnosisChartItem,
  DoctorSummaryStats,
} from '@/lib/admin/types';

type AdminDoctorAnalyticsRecord = {
  [key: string]: unknown;
};

type DiagnosisSeriesPoint = {
  periodStart: string;
  count: number;
};

type SummarySeriesPoint = AdminDoctorAnalyticsRecord & {
  periodStart?: string;
  consultations?: number;
  ordersCreated?: number;
  accessRequests?: number;
  medicalRecords?: number;
  appointmentsCompleted?: number;
  appointmentsNoShow?: number;
  newLinkedPatients?: number;
};

function num(x: unknown): number {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function asRecord(x: unknown): AdminDoctorAnalyticsRecord | null {
  return x && typeof x === 'object' && !Array.isArray(x)
    ? (x as AdminDoctorAnalyticsRecord)
    : null;
}

function readRecordString(
  record: AdminDoctorAnalyticsRecord,
  key: string,
): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function isAdminDoctorAnalyticsRange(
  value: unknown,
): value is AdminDoctorAnalyticsRange {
  return (
    value === 'day' ||
    value === 'week' ||
    value === 'month' ||
    value === 'year'
  );
}

function asRecordArray(value: unknown): AdminDoctorAnalyticsRecord[] | null {
  if (!Array.isArray(value)) return null;
  return value
    .map((entry) => asRecord(entry))
    .filter((entry): entry is AdminDoctorAnalyticsRecord => entry != null);
}

export function formatPeriodStartLabel(
  periodStartIso: string,
  range: AdminDoctorAnalyticsRange | undefined,
): string {
  const d = new Date(periodStartIso);
  if (Number.isNaN(d.getTime())) return '—';
  if (range === 'day' || !range) {
    return d.toLocaleDateString('ar-SY', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  if (range === 'week') {
    return d.toLocaleDateString('ar-SY', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  if (range === 'month') {
    return d.toLocaleDateString('ar-SY', { month: 'long', year: 'numeric' });
  }
  if (range === 'year') {
    return d.toLocaleDateString('ar-SY', { year: 'numeric' });
  }
  return d.toLocaleDateString('ar-SY', { day: 'numeric', month: 'short' });
}

function isDiagnosisTimeSeries(
  s: unknown,
): s is DiagnosisSeriesPoint[] {
  if (!Array.isArray(s)) return false;
  if (s.length === 0) return true;
  const r = asRecord(s[0]);
  return r != null && typeof r.periodStart === 'string' && 'count' in r;
}

/**
 * GET .../analytics/diagnosis — الشكل الكنسي (API-3):
 * { series: [{ periodStart, count }], total, range, from, to }
 * مع بقاء دعم أشكال أقدم (قوائم بأسماء تشخيص) إن وُجدت.
 */
export function parseDiagnosisAnalytics(
  raw: unknown,
  requestRange: AdminDoctorAnalyticsRange | undefined,
): DiagnosisChartItem[] {
  const root = asRecord(raw) ?? {};
  const inner =
    asRecord(root.data) ??
    asRecord(root.result) ??
    asRecord(root.payload) ??
    root;

  const fromBody = (() => {
    const range =
      readRecordString(inner, 'range') ??
      readRecordString(root, 'range') ??
      requestRange;

    if (Array.isArray(inner.series) && isDiagnosisTimeSeries(inner.series)) {
      if (inner.series.length === 0) return [];
      return inner.series.map((p) => ({
        label: formatPeriodStartLabel(
          p.periodStart,
          isAdminDoctorAnalyticsRange(range) ? range : requestRange,
        ),
        value: num(p.count),
      }));
    }
    return null;
  })();
  if (fromBody != null) return fromBody;

  const tried: AdminDoctorAnalyticsRecord[][] = [];
  for (const candidate of [
    inner.items,
    inner.diagnoses,
    inner.rows,
    inner.topDiagnoses,
  ]) {
    const normalized = asRecordArray(candidate);
    if (normalized) tried.push(normalized);
  }

  const arr = tried[0] ?? [];
  return arr
    .map((row) => {
      const r = asRecord(row);
      if (!r) return null;
      const label = String(
        r.label ??
          r.name ??
          r.title ??
          r.diagnosis ??
          r.diagnosisTitle ??
          r.key ??
          r._id ??
          '—',
      );
      const value = num(
        r.count ?? r.value ?? r.total ?? r.cases ?? r.patients ?? r.n,
      );
      if (value < 0) return null;
      return { label, value };
    })
    .filter((x): x is DiagnosisChartItem => x != null);
}

/**
 * GET .../analytics/summary — الشكل الكنسي (API-3): `totals` أو تجميع `series`.
 * التقييمات ومتوسط التقييم تُرَكّب من `mergeDoctorProfileIntoSummaryStats` من ملف الطبيب.
 */
export function parseSummaryAnalytics(raw: unknown): DoctorSummaryStats {
  const root = asRecord(raw) ?? {};
  const inner =
    asRecord(root.data) ?? asRecord(root.result) ?? asRecord(root.payload) ?? root;

  const totals = asRecord(inner.totals);
  if (totals) {
    return {
      patients: num(totals.newLinkedPatients),
      visits: num(totals.appointmentsCompleted),
      diagnoses: num(totals.medicalRecords),
      ratings: 0,
      averageRating: 0,
    };
  }

  const ser = asRecordArray(
    Array.isArray(inner.series)
      ? inner.series
      : Array.isArray(root.series)
        ? root.series
        : [],
  );
  if (ser && ser.length > 0) {
    const sum = (k: string): number =>
      ser.reduce<number>(
        (acc, row) => acc + num(asRecord(row)?.[k]),
        0,
      );
    return {
      patients: sum('newLinkedPatients'),
      visits: sum('appointmentsCompleted'),
      diagnoses: sum('medicalRecords'),
      ratings: 0,
      averageRating: 0,
    };
  }

  return {
    patients: 0,
    visits: 0,
    diagnoses: 0,
    ratings: 0,
    averageRating: 0,
  };
}

export function mergeDoctorProfileIntoSummaryStats(
  summary: DoctorSummaryStats,
  doctor: AdminDoctorDetailsDoctor | undefined,
): DoctorSummaryStats {
  if (!doctor) return summary;
  const r =
    doctor.totalReviews !== undefined
      ? num(doctor.totalReviews)
      : summary.ratings;
  const ar =
    doctor.averageRating !== undefined
      ? num(doctor.averageRating)
      : summary.averageRating;
  return {
    ...summary,
    ratings: r,
    averageRating: ar,
  };
}

/** يحوّل القيم إلى أعمدة بنسبة من 0–cap لعرضها في نفس المخطط. */
export function scaleToChartBand(values: number[], cap = 200): number[] {
  const m = Math.max(1, ...values);
  return values.map((v) => (v / m) * cap);
}
