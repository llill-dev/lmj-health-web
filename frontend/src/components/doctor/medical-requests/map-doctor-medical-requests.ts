import type { DoctorOrderCategory, DoctorOrderRecord } from '@/lib/doctor/orders/doctorOrderTypes';
import {
  buildDoctorOrderStatusUpdateOptions,
  isDoctorOrderEligibleForResultSection,
  isTerminalDoctorOrderStatus,
  canAppendDoctorOrderResults,
  resolveDoctorOrderStatusUiMeta,
} from '@/lib/doctor/orders/orderStatusLabels';

import { isUiOnlyMode } from '@/lib/env/uiOnlyMode';

const UI_ONLY = isUiOnlyMode();

export type MedicalRequestStatusKey =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'unknown';

export type MedicalRequestRowVm = {
  id: string;
  systemId: string;
  patientName: string;
  patientPhone: string;
  typeLabel: string;
  category: DoctorOrderCategory;
  typeDotClass: string;
  dateLabel: string;
  statusKey: MedicalRequestStatusKey;
  statusLabel: string;
  raw: DoctorOrderRecord;
};

export type MedicalRequestDetailVm = MedicalRequestRowVm & {
  statusCode: string;
  additionalNotes: string;
  typeDetail: string;
  resultTitle: string;
  resultDownloadUrl?: string;
  resultViewUrl?: string;
  radiologyImageLabel: string;
  radiologyReport: string;
  radiologyFileName: string;
  radiologyFileUrl?: string;
  patientInitial: string;
  patientId?: string;
  encounterId?: string;
  canUpdateStatus: boolean;
  canUploadResults: boolean;
  pdfSourceType: 'order' | 'imaging_order';
};

export const DEMO_MEDICAL_REQUESTS: DoctorOrderRecord[] = [
  {
    _id: 'demo-order-1',
    orderType: 'IMAGING_ORDER',
    orderTitle: 'أشعة صدر',
    statusCode: 'PENDING',
    createdAt: '2024-02-08T10:00:00.000Z',
    patient: {
      publicId: 'P-00231',
      user: { fullName: 'أحمد محمد علي', phone: '0591234567' },
    },
    notes: 'يتطلب الصيام',
    results: [],
  },
  {
    _id: 'demo-order-2b',
    orderType: 'LAB_ORDER',
    orderTitle: 'تحليل CBC (معتمد)',
    status: 'معتمد',
    createdAt: '2024-02-08T11:00:00.000Z',
    patient: {
      publicId: 'P-00419',
      user: { fullName: 'د. خالد الموسى', phone: '0590001122' },
    },
    notes: 'يتطلب الصيام',
    results: [],
  },
  {
    _id: 'demo-order-2',
    orderType: 'LAB_ORDER',
    orderTitle: 'تحليل CBC',
    statusCode: 'COMPLETED',
    createdAt: '2024-02-08T09:30:00.000Z',
    patient: {
      publicId: 'P-00418',
      user: { fullName: 'سارة خالد الحربي', phone: '0569876543' },
    },
    notes: 'يتطلب الصيام',
    results: [
      {
        title: 'نتيجة CBC',
        downloadUrl: '#',
        url: '#',
      },
    ],
  },
  {
    _id: 'demo-order-3',
    orderType: 'LAB_ORDER',
    orderTitle: 'وظائف الكلى',
    statusCode: 'IN_PROGRESS',
    createdAt: '2024-02-07T14:20:00.000Z',
    patient: {
      publicId: 'P-00112',
      user: { fullName: 'محمد عبدالرحمن', phone: '0551122334' },
    },
    notes: '',
  },
  {
    _id: 'demo-order-4',
    orderType: 'PROCEDURE_ORDER',
    orderTitle: 'خزعة جلدية',
    statusCode: 'CANCELLED',
    createdAt: '2024-02-06T11:00:00.000Z',
    patient: {
      publicId: 'P-00305',
      user: { fullName: 'نورة سعد القحطاني', phone: '0544455667' },
    },
    notes: 'أُلغي بناءً على طلب المريض',
  },
  {
    _id: 'demo-order-5',
    orderType: 'LAB_ORDER',
    orderTitle: 'سكر صائم',
    statusCode: 'PENDING',
    createdAt: '2024-02-05T08:15:00.000Z',
    patient: {
      publicId: 'P-00567',
      user: { fullName: 'فهد العتيبي', phone: '0537788990' },
    },
    notes: 'صيام 8 ساعات',
  },
  {
    _id: 'demo-order-6',
    orderType: 'IMAGING_ORDER',
    orderTitle: 'رنين مغناطيسي ركبة',
    statusCode: 'IN_PROGRESS',
    createdAt: '2024-02-04T16:45:00.000Z',
    patient: {
      publicId: 'P-00621',
      user: { fullName: 'ريم عبدالله الشمري', phone: '0583344556' },
    },
    notes: '',
    results: [
      {
        title: 'تقرير الرنين',
        reportText: 'لا توجد أي تشوهات',
        fileName: 'أشعة صدر.pdf',
        downloadUrl: '#',
      },
    ],
  },
  {
    _id: 'demo-order-7',
    orderType: 'LAB_ORDER',
    orderTitle: 'وظائف الكبد',
    statusCode: 'COMPLETED',
    createdAt: '2024-02-03T12:00:00.000Z',
    patient: {
      publicId: 'P-00789',
      user: { fullName: 'خالد يوسف المطيري', phone: '0502211334' },
    },
    notes: '',
    results: [{ title: 'نتيجة وظائف الكبد', downloadUrl: '#' }],
  },
  {
    _id: 'demo-order-8',
    orderType: 'IMAGING_ORDER',
    orderTitle: 'أشعة بطن',
    statusCode: 'COMPLETED',
    createdAt: '2024-02-02T09:00:00.000Z',
    patient: {
      publicId: 'P-00890',
      user: { fullName: 'لينا محمد الزهراني', phone: '0576655443' },
    },
    notes: 'مع مادة تباين',
    results: [
      {
        reportText: 'لا توجد أي تشوهات',
        fileName: 'أشعة بطن.pdf',
        downloadUrl: '#',
      },
    ],
  },
];

function normalizeCategory(order: DoctorOrderRecord): DoctorOrderCategory {
  const raw = [
    order.orderType,
    order.category,
    order.type,
    order.orderTitle,
    order.orderName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    raw.includes('imaging') ||
    raw.includes('radiology') ||
    raw.includes('أشعة') ||
    raw.includes('اشعة')
  ) {
    return 'radiology';
  }
  if (
    raw.includes('procedure') ||
    raw.includes('إجراء') ||
    raw.includes('اجراء')
  ) {
    return 'procedure';
  }
  if (raw.includes('lab') || raw.includes('تحليل') || raw.includes('مختبر')) {
    return 'lab';
  }
  if (raw.includes('referral') || raw.includes('refer') || raw.includes('إحالة')) {
    return 'referral';
  }
  return 'lab';
}

export function resolveMedicalRequestTypeLabel(
  category: DoctorOrderCategory,
): string {
  if (category === 'radiology') return 'أشعة';
  if (category === 'procedure') return 'إجراءات';
  if (category === 'referral') return 'إحالة';
  return 'تحاليل';
}

function typeDotClass(category: DoctorOrderCategory): string {
  if (category === 'radiology') return 'bg-[#14B8A6]';
  if (category === 'procedure') return 'bg-[#F59E0B]';
  return 'bg-primary';
}

function normalizeStatus(order: DoctorOrderRecord): {
  key: MedicalRequestStatusKey;
  label: string;
  code: string;
} {
  const meta = resolveDoctorOrderStatusUiMeta(
    order.statusCode,
    order.status,
  );
  return {
    key: meta.key,
    label: meta.label,
    code: meta.code,
  };
}

export function formatMedicalRequestDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatMedicalRequestSystemId(order: DoctorOrderRecord): string {
  const publicId = order.patient?.publicId?.trim();
  if (publicId) {
    const normalized = publicId.startsWith('P-') || publicId.startsWith('PAT-')
      ? publicId
      : `P-${publicId}`;
    const year = order.createdAt
      ? new Date(order.createdAt).getFullYear()
      : new Date().getFullYear();
    const suffix = normalized.replace(/^(P|PAT)-?/i, '');
    return `MR-SY-${year}-${suffix.padStart(8, '0').slice(-8)}`;
  }
  const tail = order._id.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase();
  return `MR-SY-${new Date().getFullYear()}-${tail || '00000000'}`;
}

function pickUrl(...values: (string | undefined)[]): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed && trimmed !== '#') return trimmed;
  }
  return undefined;
}

export function extractOrderResultDownloadUrl(
  order: DoctorOrderRecord,
): string | undefined {
  for (const result of order.results ?? []) {
    const url = pickUrl(result.downloadUrl, result.url);
    if (url) return url;
  }

  const extra = order as DoctorOrderRecord & {
    downloadUrl?: string;
    pdfUrl?: string;
    documentUrl?: string;
    previewUrl?: string;
    resultUrl?: string;
    resultDocument?: { downloadUrl?: string; url?: string; pdfUrl?: string };
  };

  return pickUrl(
    extra.downloadUrl,
    extra.pdfUrl,
    extra.documentUrl,
    extra.previewUrl,
    extra.resultUrl,
    extra.resultDocument?.downloadUrl,
    extra.resultDocument?.url,
    extra.resultDocument?.pdfUrl,
  );
}

/** أقسام النتيجة (عرض/تحميل) — تحاليل وأشعة وإجراءات، وليس التحويلات. */
const RESULT_SECTION_CATEGORIES = new Set<DoctorOrderCategory>([
  'lab',
  'radiology',
  'procedure',
]);

/**
 * إظهار قسم «النتيجة» في ديالوج تفاصيل الطلب (تحاليل / أشعة / إجراءات).
 * يُخفى فقط للمسودة والحالات الملغاة/المرفوضة/المنتهية.
 */
export function resolveMedicalRequestResultSectionVisible(
  vm: Pick<MedicalRequestDetailVm, 'category' | 'statusCode' | 'statusLabel'>,
): boolean {
  if (!RESULT_SECTION_CATEGORIES.has(vm.category)) return false;

  return isDoctorOrderEligibleForResultSection({
    statusCode: vm.statusCode,
    statusLabel: vm.statusLabel,
  });
}

/** @deprecated استخدم resolveMedicalRequestResultSectionVisible */
export function shouldShowMedicalRequestResultSection(
  vm: Pick<
    MedicalRequestDetailVm,
    | 'category'
    | 'statusCode'
    | 'statusLabel'
    | 'statusKey'
    | 'resultDownloadUrl'
    | 'resultViewUrl'
  >,
): boolean {
  return resolveMedicalRequestResultSectionVisible(vm);
}

export function canGenerateMedicalRequestResultPdf(
  vm: Pick<
    MedicalRequestDetailVm,
    'category' | 'statusCode' | 'statusLabel'
  >,
): boolean {
  return resolveMedicalRequestResultSectionVisible(vm);
}

function isUsableResultUrl(url?: string | null): boolean {
  const trimmed = url?.trim();
  return Boolean(trimmed && trimmed !== '#');
}

/** هل يوجد مرفق نتيجة برابط تحميل/عرض فعلي (وليس placeholder). */
export function hasMedicalRequestResultAttachment(
  vm: Pick<
    MedicalRequestDetailVm,
    'resultDownloadUrl' | 'resultViewUrl' | 'radiologyFileUrl' | 'raw'
  >,
): boolean {
  if (
    isUsableResultUrl(vm.resultDownloadUrl) ||
    isUsableResultUrl(vm.resultViewUrl) ||
    isUsableResultUrl(vm.radiologyFileUrl)
  ) {
    return true;
  }

  for (const result of vm.raw?.results ?? []) {
    if (isUsableResultUrl(result.downloadUrl) || isUsableResultUrl(result.url)) {
      return true;
    }
  }

  return false;
}

export function resolveMedicalRequestReorderPath(
  order: DoctorOrderRecord,
): string | null {
  const patientId = order.patientId ?? order.patient?._id;
  if (!patientId) return null;

  const category = normalizeCategory(order);
  const encounterId = order.encounterId?.trim();

  if (encounterId && category === 'radiology') {
    return `/doctor/encounters/${patientId}/${encounterId}/radiology`;
  }
  if (encounterId) {
    return `/doctor/encounters/${patientId}/${encounterId}`;
  }
  return `/doctor/patients/${patientId}`;
}

function resolveTitle(order: DoctorOrderRecord): string {
  return (
    order.orderTitle?.trim() ||
    order.orderName?.trim() ||
    order.items?.[0]?.title?.trim() ||
    order.items?.[0]?.name?.trim() ||
    order.items?.[0]?.testName?.trim() ||
    'طلب طبي'
  );
}

export function mapDoctorOrderToRow(order: DoctorOrderRecord): MedicalRequestRowVm {
  const category = normalizeCategory(order);
  const status = normalizeStatus(order);
  const patientName =
    order.patient?.user?.fullName?.trim() || 'مريض غير معروف';

  return {
    id: order._id,
    systemId: formatMedicalRequestSystemId(order),
    patientName,
    patientPhone: order.patient?.user?.phone?.trim() || '—',
    typeLabel: resolveMedicalRequestTypeLabel(category),
    category,
    typeDotClass: typeDotClass(category),
    dateLabel: formatMedicalRequestDate(order.createdAt),
    statusKey: status.key,
    statusLabel: status.label,
    raw: order,
  };
}

export function mapDoctorOrderToDetail(
  order: DoctorOrderRecord,
): MedicalRequestDetailVm {
  const row = mapDoctorOrderToRow(order);
  const title = resolveTitle(order);
  const firstResult = order.results?.[0];
  const category = row.category;

  const status = normalizeStatus(order);
  const downloadUrl = extractOrderResultDownloadUrl(order);

  return {
    ...row,
    statusCode: status.code,
    patientId: order.patientId ?? order.patient?._id,
    encounterId: order.encounterId,
    canUpdateStatus: !isTerminalDoctorOrderStatus(status.code),
    canUploadResults: canAppendDoctorOrderResults(status.code),
    pdfSourceType:
      category === 'radiology' ? 'imaging_order' : 'order',
    patientInitial: row.patientName.trim().charAt(0) || 'م',
    typeDetail:
      category === 'radiology'
        ? `صورة : ${title}`
        : `${resolveMedicalRequestTypeLabel(category)} ${title}`,
    additionalNotes:
      order.notes?.trim() ||
      order.labInstructions?.trim() ||
      order.imagingCenterInstructions?.trim() ||
      order.clinicalSummary?.trim() ||
      order.instructionsToPatient?.trim() ||
      order.clinicalReason?.trim() ||
      '—',
    resultTitle: firstResult?.title ?? firstResult?.name ?? title,
    resultDownloadUrl: downloadUrl ?? firstResult?.downloadUrl ?? firstResult?.url,
    resultViewUrl: downloadUrl ?? firstResult?.url ?? firstResult?.downloadUrl,
    radiologyImageLabel: `صورة : ${title}`,
    radiologyReport:
      firstResult?.reportText?.trim() ||
      firstResult?.summary?.trim() ||
      'لا توجد أي تشوهات',
    radiologyFileName: firstResult?.fileName?.trim() || `${title}.pdf`,
    radiologyFileUrl: firstResult?.downloadUrl ?? firstResult?.url,
  };
}

export function filterOrdersByCategory(
  orders: DoctorOrderRecord[],
  tab: DoctorOrderCategory,
): DoctorOrderRecord[] {
  if (tab === 'all') return orders;
  return orders.filter((order) => normalizeCategory(order) === tab);
}

export function countOrdersByCategory(orders: DoctorOrderRecord[]) {
  const rows = orders.map(mapDoctorOrderToRow);
  return {
    all: rows.length,
    lab: rows.filter((r) => r.category === 'lab').length,
    radiology: rows.filter((r) => r.category === 'radiology').length,
    procedure: rows.filter((r) => r.category === 'procedure').length,
    referral: rows.filter((r) => r.category === 'referral').length,
  };
}

export function shouldUseDemoMedicalRequests(
  apiOrders: DoctorOrderRecord[] | undefined,
): boolean {
  return UI_ONLY && (apiOrders?.length ?? 0) === 0;
}

export function resolveOrdersForUi(
  apiOrders: DoctorOrderRecord[] | undefined,
): DoctorOrderRecord[] {
  if (shouldUseDemoMedicalRequests(apiOrders)) {
    return DEMO_MEDICAL_REQUESTS;
  }
  return apiOrders ?? [];
}

/** @deprecated استخدم buildDoctorOrderStatusUpdateOptions من orderStatusLabels */
export function buildStatusUpdateOptions(currentCode: string) {
  return buildDoctorOrderStatusUpdateOptions(currentCode);
}

export function orderTypeQueryForTab(
  tab: Exclude<DoctorOrderCategory, 'all'>,
): string | undefined {
  if (tab === 'lab') return 'LAB_ORDER';
  if (tab === 'radiology') return 'IMAGING_ORDER';
  if (tab === 'procedure') return 'PROCEDURE_ORDER';
  if (tab === 'referral') return 'REFERRAL_ORDER';
  return undefined;
}
