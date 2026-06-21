import type { EncounterOrder } from '@/lib/doctor/encounterClinicalTypes';
import { normalizeEncounterOrderCategory } from '@/lib/doctor/encounterOrderCategories';
import type { EncounterPrescriptionRecord } from '@/lib/doctor/prescriptionTypes';
import type {
  DoctorEncounterSummary,
  DoctorPatientFullProfile,
  DoctorPatientMedicalRecord,
  DoctorPatientMedication,
  DoctorPatientPublicProfile,
} from '@/lib/doctor/types';
import type {
  EncounterSummaryDiagnosis,
  EncounterSummaryDiagnosisBadge,
  EncounterSummaryViewModel,
} from './encounter-summary-types';

export type EncounterSummaryApiSources = {
  encounter?: DoctorEncounterSummary | null;
  profile?: DoctorPatientFullProfile | null;
  publicProfile?: DoctorPatientPublicProfile | null;
  prescriptions?: EncounterPrescriptionRecord[];
  orders?: EncounterOrder[];
  medicalRecords?: DoctorPatientMedicalRecord[];
};

function formatAgeFromProfile(
  profile?: DoctorPatientFullProfile | null,
  encounter?: DoctorEncounterSummary | null,
  publicProfile?: DoctorPatientPublicProfile | null,
): string {
  if (typeof profile?.age === 'number' && profile.age > 0) {
    return `${profile.age} سنة`;
  }
  const encounterAge = encounter?.patient?.age;
  if (typeof encounterAge === 'number' && encounterAge > 0) {
    return `${encounterAge} سنة`;
  }
  const dob =
    profile?.dateOfBirth ??
    encounter?.patient?.dateOfBirth;
  if (!dob) return '—';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '—';
  const years = Math.floor(
    (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
  return years > 0 ? `${years} سنة` : '—';
}

function resolvePatientName(
  encounter?: DoctorEncounterSummary | null,
  profile?: DoctorPatientFullProfile | null,
  publicProfile?: DoctorPatientPublicProfile | null,
): string {
  return (
    encounter?.patient?.user?.fullName?.trim() ??
    profile?.user?.fullName?.trim() ??
    publicProfile?.user?.fullName?.trim() ??
    '—'
  );
}

function resolveFileNumber(
  encounter?: DoctorEncounterSummary | null,
  profile?: DoctorPatientFullProfile | null,
  publicProfile?: DoctorPatientPublicProfile | null,
): string {
  const publicId =
    encounter?.patient?.publicId?.trim() ??
    (profile as { publicId?: string } | undefined)?.publicId?.trim();
  if (publicId) return publicId.startsWith('#') ? publicId : `#${publicId}`;
  const id =
    encounter?.patient?._id ??
    profile?._id ??
    profile?.patientId ??
    publicProfile?._id;
  if (!id) return '—';
  return `#${id.slice(-5).toUpperCase()}`;
}

function normalizeOrderCategory(order: EncounterOrder): string {
  const category = normalizeEncounterOrderCategory(order);
  return category === 'other' ? 'other' : category;
}

function isUrgentOrder(order: EncounterOrder): boolean {
  const raw = `${order.urgency ?? ''} ${order.priority ?? ''} ${order.urgencyLevel ?? ''}`.toLowerCase();
  return (
    raw.includes('urgent') ||
    raw.includes('high') ||
    raw.includes('عاجل') ||
    raw.includes('حرج')
  );
}

function orderTitle(order: EncounterOrder): string {
  const itemTitle = order.items?.[0]?.title ?? order.items?.[0]?.name;
  if (itemTitle?.trim()) return itemTitle.trim();
  return (
    order.orderTitle?.trim() ??
    order.orderName?.trim() ??
    order.clinicalSummary?.trim() ??
    order.reason?.trim() ??
    'طلب طبي'
  );
}

function mapDiagnosisBadges(
  diagnosis: string,
  index: number,
): EncounterSummaryDiagnosisBadge[] {
  const badges: EncounterSummaryDiagnosisBadge[] = [
    {
      label: index === 0 ? 'رئيسي' : 'ثانوي',
      tone: index === 0 ? 'primary' : 'secondary',
    },
  ];
  const lower = diagnosis.toLowerCase();
  if (
    lower.includes('مزمن') ||
    lower.includes('chronic') ||
    lower.includes('سكري') ||
    lower.includes('ضغط')
  ) {
    badges.push({ label: 'مزمن', tone: 'warning' });
  }
  if (
    lower.includes('حاد') ||
    lower.includes('عالي') ||
    lower.includes('خطير') ||
    lower.includes('unstable')
  ) {
    badges.push({ label: 'خطورة عالية', tone: 'danger' });
  }
  return badges;
}

function recordsForEncounter(
  records: DoctorPatientMedicalRecord[],
  encounterId: string,
  encounter?: DoctorEncounterSummary | null,
): DoctorPatientMedicalRecord[] {
  const scoped = records.filter((record) => {
    const recordEncounterId = (record as { encounterId?: string }).encounterId;
    return recordEncounterId === encounterId;
  });
  if (scoped.length) return scoped;

  const started = encounter?.startedAt ?? encounter?.createdAt;
  const closed = encounter?.closedAt;
  if (!started) return records.slice(0, 3);

  const startMs = new Date(started).getTime();
  const endMs = closed ? new Date(closed).getTime() : Date.now();
  const windowed = records.filter((record) => {
    const stamp = record.createdAt ?? record.date;
    if (!stamp) return false;
    const ms = new Date(stamp).getTime();
    return ms >= startMs - 86_400_000 && ms <= endMs + 86_400_000;
  });
  return windowed.length ? windowed : records.slice(0, 3);
}

function isFinalizedPrescription(rx: EncounterPrescriptionRecord) {
  return (rx.status ?? '').toLowerCase().includes('final');
}

function mapMedicationsFromPrescriptions(
  prescriptions: EncounterPrescriptionRecord[],
): EncounterSummaryViewModel['medications'] {
  const finalized = prescriptions.filter(isFinalizedPrescription);
  const source = finalized.length > 0 ? finalized : prescriptions;
  const items: EncounterSummaryViewModel['medications'] = [];
  for (const rx of source) {
    for (const item of rx.items ?? []) {
      if (!item.name?.trim()) continue;
      items.push({
        id: item._id ?? `${rx._id}-${items.length}`,
        name: item.name.trim(),
        dosage: item.dosage?.trim() || '—',
        frequency: item.frequency?.trim() || item.duration?.trim() || '—',
      });
    }
  }
  return items;
}

function mapMedicationsFromProfile(
  medications?: DoctorPatientMedication[],
): EncounterSummaryViewModel['medications'] {
  return (medications ?? [])
    .filter((med) => med.name?.trim())
    .map((med, index) => ({
      id: med._id ?? `profile-med-${index}`,
      name: med.name!.trim(),
      dosage: med.dosage?.trim() || '—',
      frequency: med.frequency?.trim() || '—',
    }));
}

export function mapEncounterSummaryFromApi(
  sources: EncounterSummaryApiSources,
): EncounterSummaryViewModel {
  const {
    encounter,
    profile,
    publicProfile,
    prescriptions = [],
    orders = [],
    medicalRecords = [],
  } = sources;

  const encounterId = encounter?._id ?? '';
  const scopedRecords = encounterId
    ? recordsForEncounter(medicalRecords, encounterId, encounter)
    : medicalRecords;

  const diagnoses: EncounterSummaryDiagnosis[] = scopedRecords
    .map((record) => record.diagnosis?.trim())
    .filter((value): value is string => Boolean(value))
    .filter((value, index, list) => list.indexOf(value) === index)
    .map((title, index) => ({
      id: `dx-${index}`,
      title,
      badges: mapDiagnosisBadges(title, index),
    }));

  const historyCurrent =
    scopedRecords[0]?.title?.trim() ??
    encounter?.notes?.trim() ??
    '—';
  const pastIllnesses =
    profile?.medicalConditions?.length
      ? profile.medicalConditions.join('، ')
      : publicProfile?.medicalConditions?.length
        ? publicProfile.medicalConditions.join('، ')
        : '—';
  const historyMeds =
    profile?.medications?.length
      ? profile.medications
          .map((med) => med.name?.trim())
          .filter(Boolean)
          .join('، ') || '—'
      : '—';

  const rxMedications = mapMedicationsFromPrescriptions(prescriptions);
  const medications =
    rxMedications.length > 0
      ? rxMedications
      : mapMedicationsFromProfile(profile?.medications);

  const labs = orders
    .filter((order) => normalizeOrderCategory(order) === 'lab')
    .map((order) => ({
      id: order._id,
      title: orderTitle(order),
      urgent: isUrgentOrder(order),
    }));

  const radiology = orders
    .filter((order) => normalizeOrderCategory(order) === 'radiology')
    .map((order) => ({
      id: order._id,
      title: orderTitle(order),
      urgent: isUrgentOrder(order),
    }));

  const referrals = orders
    .filter((order) => normalizeOrderCategory(order) === 'referral')
    .map((order) => ({
      id: order._id,
      specialty: order.specialty?.trim() || orderTitle(order),
      doctorName: order.referredDoctorName?.trim() || '—',
      urgent: isUrgentOrder(order),
    }));

  const closedAt = encounter?.closedAt;
  const closedAtLabel =
    closedAt && !Number.isNaN(new Date(closedAt).getTime())
      ? new Date(closedAt).toLocaleString('ar-SA', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : undefined;

  return {
    patient: {
      name: resolvePatientName(encounter, profile, publicProfile),
      ageLabel: formatAgeFromProfile(profile, encounter, publicProfile),
      fileNumber: resolveFileNumber(encounter, profile, publicProfile),
    },
    chiefComplaint: encounter?.notes?.trim() || '—',
    history: {
      currentIllness: historyCurrent,
      pastIllnesses,
      medications: historyMeds,
    },
    diagnoses,
    medications,
    labs,
    radiology,
    referrals,
    closedAtLabel,
  };
}
