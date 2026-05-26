import type {
  DoctorEncounterSummary,
  DoctorPatientFullProfile,
  DoctorPatientOrder,
} from '@/lib/doctor/types';
import type {
  EncounterWorkspacePatientViewModel,
  EncounterWorkspaceSectionStatus,
  EncounterWorkspaceSectionViewModel,
} from './encounter-workspace-types';

function formatIsoDate(value?: string | null): string {
  if (!value) return '—';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(value?: string | null): string {
  if (!value) return '—';
  if (/^\d{1,2}:\d{2}/.test(value)) return value.slice(0, 5);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatStartedLabel(encounter: DoctorEncounterSummary): string {
  const started = encounter.startedAt ?? encounter.createdAt;
  const date = formatIsoDate(started);
  const time = formatTime(started);
  if (date === '—' && time === '—') return '—';
  if (time === '—') return date;
  const shortDate = date.length >= 10 ? `${date.slice(8, 10)}-${date.slice(5, 7)}` : date;
  return `${shortDate} ${time}`;
}

function normalizeOrderCategory(order: DoctorPatientOrder): string {
  const raw = `${order.orderType ?? ''} ${order.type ?? ''} ${order.category ?? ''} ${order.orderTitle ?? ''}`.toLowerCase();
  if (raw.includes('refer')) return 'referral';
  if (raw.includes('lab') || raw.includes('تحل')) return 'lab';
  if (raw.includes('radio') || raw.includes('image') || raw.includes('scan') || raw.includes('أشعة')) {
    return 'radiology';
  }
  if (raw.includes('procedure') || raw.includes('إجر')) return 'procedure';
  return 'other';
}

function resolveSectionStatus(
  count: number,
  statuses: string[],
): { status: EncounterWorkspaceSectionStatus; label: string; hint: string } {
  if (count === 0) {
    return {
      status: 'empty',
      label: 'فارغة',
      hint: 'بحاجة للإسناد',
    };
  }

  const normalized = statuses.map((s) => s.toLowerCase());
  const allApproved = normalized.every(
    (s) =>
      s.includes('approved') ||
      s.includes('complete') ||
      s.includes('final') ||
      s.includes('معتمد'),
  );

  if (allApproved) {
    return {
      status: 'approved',
      label: 'معتمدة',
      hint: 'معتمدة ونهائية',
    };
  }

  return {
    status: 'draft',
    label: 'مسودة',
    hint: 'بحاجة للاعتماد',
  };
}

function mapPrescriptionSection(
  prescriptions: Array<{ status?: string }>,
): EncounterWorkspaceSectionViewModel {
  const count = prescriptions.length;
  const { status, label, hint } = resolveSectionStatus(
    count,
    prescriptions.map((item) => item.status ?? 'draft'),
  );

  return {
    key: 'prescription',
    count,
    status,
    statusLabel: label,
    footerHint: hint,
    defaultExpanded: count > 0,
  };
}

function mapOrdersSection(
  key: 'lab' | 'radiology' | 'procedure' | 'referral',
  orders: DoctorPatientOrder[],
): EncounterWorkspaceSectionViewModel {
  const filtered = orders.filter((order) => normalizeOrderCategory(order) === key);
  const count = filtered.length;
  const { status, label, hint } = resolveSectionStatus(
    count,
    filtered.map((order) => order.status ?? order.statusCode ?? 'draft'),
  );

  const referrals =
    key === 'referral'
      ? filtered.map((order, index) => ({
          id: order._id ?? `referral-${index}`,
          code: order.orderTitle ?? order.orderName ?? `REF-${index + 1}`,
          doctorName: 'طبيب مختص',
          specialty: order.orderType ?? order.type ?? 'تحويل طبي',
          urgency:
            (order.status ?? '').toLowerCase().includes('urgent') ||
            (order.statusCode ?? '').toLowerCase().includes('urgent')
              ? ('urgent' as const)
              : undefined,
          statusLabel:
            order.status === 'active' || order.statusCode === 'active'
              ? 'نشط'
              : (order.status ?? order.statusCode ?? '—'),
        }))
      : undefined;

  return {
    key,
    count,
    status,
    statusLabel: label,
    footerHint: hint,
    defaultExpanded: key === 'referral' ? Boolean(referrals?.length) : count > 0,
    referrals,
  };
}

export function mapEncounterWorkspacePatient(
  encounter: DoctorEncounterSummary,
  patient?: DoctorPatientFullProfile,
  publicId?: string,
): EncounterWorkspacePatientViewModel {
  const isActive = encounter.status !== 'closed';
  const apptDate = encounter.appointment?.date;
  const apptTime = encounter.appointment?.startTime;

  return {
    name: patient?.user?.fullName ?? 'مريض',
    ageLabel: patient?.age != null ? `${patient.age} سنة` : '—',
    fileNumber: publicId ? `#${publicId}` : patient?._id ? `#${patient._id.slice(-6)}` : '—',
    statusLabel: isActive ? 'نشطة' : 'مغلقة',
    isActive,
    startedLabel: formatStartedLabel(encounter),
    appointmentTimeLabel: formatTime(apptTime ?? encounter.startedAt),
    linkedAppointmentDate: formatIsoDate(apptDate),
    linkedAppointmentTime: formatTime(apptTime),
  };
}

export function mapEncounterWorkspaceSections(
  patient?: DoctorPatientFullProfile,
): EncounterWorkspaceSectionViewModel[] {
  const prescriptions = ((patient as { prescriptions?: Array<{ status?: string }> } | undefined)
    ?.prescriptions ?? []) as Array<{ status?: string }>;
  const orders = patient?.orders ?? [];

  return [
    mapPrescriptionSection(prescriptions),
    mapOrdersSection('lab', orders),
    mapOrdersSection('radiology', orders),
    mapOrdersSection('procedure', orders),
    mapOrdersSection('referral', orders),
  ];
}

export function buildEncounterWorkspaceDemoSections(): EncounterWorkspaceSectionViewModel[] {
  return [
    {
      key: 'prescription',
      count: 5,
      status: 'draft',
      statusLabel: 'مسودة',
      footerHint: 'بحاجة للاعتماد',
      defaultExpanded: true,
    },
    {
      key: 'lab',
      count: 3,
      status: 'approved',
      statusLabel: 'معتمدة',
      footerHint: 'معتمدة ونهائية',
      defaultExpanded: true,
    },
    {
      key: 'radiology',
      count: 2,
      status: 'draft',
      statusLabel: 'مسودة',
      footerHint: 'بحاجة للاعتماد',
      defaultExpanded: true,
    },
    {
      key: 'procedure',
      count: 0,
      status: 'empty',
      statusLabel: 'فارغة',
      footerHint: 'بحاجة للإسناد',
    },
    {
      key: 'referral',
      count: 1,
      status: 'draft',
      statusLabel: 'مسودة',
      footerHint: 'بحاجة للاعتماد',
      defaultExpanded: true,
      referrals: [
        {
          id: 'ref-demo-1',
          code: 'REF-1023',
          doctorName: 'د. خالد الشهري',
          specialty: 'قلب — نشط',
          urgency: 'urgent',
          statusLabel: 'نشط',
        },
      ],
    },
  ];
}
