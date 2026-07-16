/**
 * أكواد حالة الطلب/الوصفة كما يرسلها الخادم (إنجليزي).
 * العرض للمستخدم عربي؛ الطلبات للـ API تبقى بالإنجليزي.
 */
/** تسميات عربية من الخادم → كود إنجليزي للمنطق والـ API */
const ORDER_STATUS_AR_TO_CODE: Record<string, string> = {
  'قيد الطلب': 'REQUESTED',
  'قيد الانتظار': 'PENDING',
  مسودة: 'DRAFT',
  مقبول: 'ACCEPTED',
  'قيد التنفيذ': 'IN_PROGRESS',
  مكتمل: 'COMPLETED',
  مكتملة: 'COMPLETED',
  معتمد: 'FINALIZED',
  معتمدة: 'FINALIZED',
  منجز: 'DONE',
  منجزة: 'DONE',
  ملغى: 'CANCELLED',
  ملغاة: 'CANCELLED',
  مرفوض: 'REJECTED',
  مرفوضة: 'REJECTED',
  منتهي: 'EXPIRED',
  منتهية: 'EXPIRED',
};

export const ORDER_STATUS_CODE_AR: Record<string, string> = {
  REQUESTED: 'قيد الطلب',
  PENDING: 'قيد الانتظار',
  DRAFT: 'مسودة',
  ACCEPTED: 'مقبول',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  FINALIZED: 'معتمد',
  FINAL: 'معتمد',
  CANCELLED: 'ملغى',
  CANCELED: 'ملغى',
  REJECTED: 'مرفوض',
  EXPIRED: 'منتهي',
  ACTIVE: 'نشطة',
  CLOSED: 'مغلقة',
  OPEN: 'مفتوحة',
  DONE: 'منجز',
  COMPLETE: 'مكتمل',
};

const STATUS_TOKEN_RE =
  /\b(REQUESTED|PENDING|DRAFT|FINALIZED|FINAL|IN_PROGRESS|INPROGRESS|COMPLETED|COMPLETE|CANCELLED|CANCELED|ACCEPTED|REJECTED|EXPIRED)\b/gi;

type DoctorOrderStatusRecord = {
  [key: string]: unknown;
};

function asRecord(value: unknown): DoctorOrderStatusRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DoctorOrderStatusRecord)
    : null;
}

function pickStatusString(...values: ReadonlyArray<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    const row = asRecord(value);
    if (!row) continue;
    const nested = pickStatusString(
      row.code,
      row.statusCode,
      row.status,
      row.value,
      row.key,
      row.label,
      row.name,
    );
    if (nested) return nested;
  }
  return undefined;
}

/**
 * يستخرج statusCode و status من استجابة API (نص، كائن متداخل، أو مرايا legacy).
 */
export function extractOrderStatusFieldsFromApi(raw: unknown): {
  statusCode?: string;
  status?: string;
} {
  const row = asRecord(raw);
  if (!row) return {};

  const statusCode = pickStatusString(
    row.statusCode,
    row.orderStatus,
    row.orderStatusCode,
    row.lifecycleStatus,
    row.workflowStatus,
    row.state,
    row.status,
  );

  const status = pickStatusString(
    row.statusLabel,
    row.statusName,
    row.statusText,
    typeof row.status === 'string' ? row.status : undefined,
    row.status,
  );

  return {
    statusCode: statusCode ?? status,
    status: status ?? statusCode,
  };
}

/** يحوّل نص الحالة (عربي/إنجليزي) إلى كود قياسي. */
export function resolveCanonicalDoctorOrderStatusCode(
  statusCode?: string | null,
  statusLabel?: string | null,
): string {
  const primary = (statusCode ?? '').trim();
  if (primary) {
    const upper = primary.toUpperCase().replace(/[\s-]+/g, '_');
    if (ORDER_STATUS_CODE_AR[upper]) return upper;
    const fromToken = normalizeStatusToken(primary);
    if (ORDER_STATUS_CODE_AR[fromToken]) return fromToken;
    const lower = primary.toLowerCase();
    if (lower.includes('cancel')) return 'CANCELLED';
    if (lower.includes('reject')) return 'REJECTED';
    if (lower.includes('expir')) return 'EXPIRED';
    if (lower.includes('final')) return 'FINALIZED';
    if (lower.includes('complete') || lower === 'done') return 'COMPLETED';
    if (lower.includes('progress')) return 'IN_PROGRESS';
    if (lower.includes('accept')) return 'ACCEPTED';
    if (lower.includes('pending') || lower.includes('draft') || lower.includes('request')) {
      return upper.includes('DRAFT') ? 'DRAFT' : upper.includes('REQUEST') ? 'REQUESTED' : 'PENDING';
    }
  }

  const label = (statusLabel ?? '').trim();
  if (label && ORDER_STATUS_AR_TO_CODE[label]) {
    return ORDER_STATUS_AR_TO_CODE[label];
  }

  if (/مكتمل|مكتملة|منجز|منجزة/.test(label)) return 'COMPLETED';
  if (/معتمد|معتمدة/.test(label)) return 'FINALIZED';
  if (/ملغ|ملغى|ملغاة/.test(label)) return 'CANCELLED';
  if (/مرفوض/.test(label)) return 'REJECTED';
  if (/منته/.test(label)) return 'EXPIRED';
  if (/قيد التنفيذ/.test(label)) return 'IN_PROGRESS';
  if (/مقبول/.test(label)) return 'ACCEPTED';
  if (/مسودة/.test(label)) return 'DRAFT';
  if (/قيد الطلب/.test(label)) return 'REQUESTED';
  if (/انتظار|انتظار/.test(label)) return 'PENDING';

  return normalizeDoctorOrderStatusCode(statusCode || statusLabel);
}

export type DoctorOrderStatusUiKey =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'unknown';

export function resolveDoctorOrderStatusUiMeta(
  statusCode?: string | null,
  statusLabel?: string | null,
): { code: string; key: DoctorOrderStatusUiKey; label: string } {
  const code = resolveCanonicalDoctorOrderStatusCode(statusCode, statusLabel);
  const label =
    statusLabel?.trim() ||
    resolveOrderStatusLabelAr(code) ||
    '—';

  if (code.includes('CANCEL')) {
    return { code: 'CANCELLED', key: 'cancelled', label: ORDER_STATUS_CODE_AR.CANCELLED };
  }
  if (
    code === 'FINALIZED' ||
    code === 'COMPLETED' ||
    code === 'COMPLETE' ||
    code === 'DONE'
  ) {
    return {
      code,
      key: 'completed',
      label: ORDER_STATUS_CODE_AR[code] ?? label,
    };
  }
  if (code === 'IN_PROGRESS' || code === 'ACCEPTED' || code === 'ACTIVE') {
    return {
      code,
      key: 'in_progress',
      label: ORDER_STATUS_CODE_AR[code] ?? label,
    };
  }
  if (
    code === 'PENDING' ||
    code === 'DRAFT' ||
    code === 'REQUESTED' ||
    code === 'OPEN'
  ) {
    return {
      code,
      key: 'pending',
      label: ORDER_STATUS_CODE_AR[code] ?? label,
    };
  }

  return { code, key: 'unknown', label };
}

const RESULT_SECTION_HIDDEN = new Set(['DRAFT', 'CANCELLED', 'REJECTED', 'EXPIRED']);

/** هل يُعرض قسم «النتيجة» (عرض/تحميل) في تفاصيل الطلب الطبي؟ */
export function isDoctorOrderEligibleForResultSection(input: {
  statusCode?: string | null;
  statusLabel?: string | null;
  statusKey?: DoctorOrderStatusUiKey;
  hasResultAttachment?: boolean;
}): boolean {
  const code = resolveCanonicalDoctorOrderStatusCode(
    input.statusCode,
    input.statusLabel,
  );
  if (RESULT_SECTION_HIDDEN.has(code)) return false;
  // تحاليل / أشعة / إجراءات: إظهار القسم لكل الحالات غير المخفية (بما فيها قيد الانتظار)
  return true;
}

function normalizeStatusToken(token: string): string {
  const upper = token.toUpperCase().replace(/[^A-Z]/g, '_').replace(/_+/g, '_');
  if (upper === 'FINAL') return 'FINALIZED';
  if (upper === 'COMPLETE') return 'COMPLETED';
  if (upper === 'CANCELED') return 'CANCELLED';
  if (upper === 'INPROGRESS') return 'IN_PROGRESS';
  return upper;
}

/** ترجمة كود حالة واحد للعرض (لا يُستخدم عند الإرسال للخادم). */
export function resolveOrderStatusLabelAr(
  code?: string | null,
  fallback?: string | null,
): string {
  const raw = (code ?? fallback ?? '').trim();
  if (!raw) return '—';

  const direct = ORDER_STATUS_CODE_AR[raw.toUpperCase()];
  if (direct) return direct;

  const normalized = raw.toUpperCase().replace(/[\s-]+/g, '_');
  if (ORDER_STATUS_CODE_AR[normalized]) return ORDER_STATUS_CODE_AR[normalized];

  if (/^[A-Za-z][A-Za-z0-9_\s-]*$/.test(raw) && raw.length <= 40) {
    return ORDER_STATUS_CODE_AR[normalized] ?? 'غير معروف';
  }

  return raw;
}

/** حالات نهائية — API-3: لا PATCH status ولا إلحاق نتائج. */
const DOCTOR_ORDER_TERMINAL_CODES = new Set([
  'COMPLETED',
  'COMPLETE',
  'DONE',
  'FINALIZED',
  'FINAL',
  'CANCELLED',
  'CANCELED',
  'REJECTED',
  'EXPIRED',
]);

export function normalizeDoctorOrderStatusCode(
  code?: string | null,
): string {
  return (code ?? '').trim().toUpperCase();
}

export function isTerminalDoctorOrderStatus(code?: string | null): boolean {
  const normalized = normalizeDoctorOrderStatusCode(code);
  if (!normalized) return false;
  if (DOCTOR_ORDER_TERMINAL_CODES.has(normalized)) return true;
  const lower = normalized.toLowerCase();
  return (
    lower.includes('cancel') ||
    lower.includes('reject') ||
    lower.includes('expir') ||
    lower.includes('final') ||
    lower.includes('complete') ||
    lower === 'done'
  );
}

/** POST /doctors/orders/:orderId/results — API-3 working states only. */
export function canAppendDoctorOrderResults(code?: string | null): boolean {
  const normalized = normalizeDoctorOrderStatusCode(code);
  return normalized === 'ACCEPTED' || normalized === 'IN_PROGRESS';
}

/**
 * خيارات PATCH /api/doctors/orders/:orderId/status حسب سياسة الانتقال في API-3.
 * الحالات النهائية: COMPLETED، CANCELLED، REJECTED، EXPIRED (+ FINALIZED للطلبات المعتمدة).
 */
export function buildDoctorOrderStatusUpdateOptions(currentCode?: string | null): Array<{
  value: string;
  label: string;
}> {
  const code = normalizeDoctorOrderStatusCode(currentCode);
  if (isTerminalDoctorOrderStatus(code)) return [];

  const next = new Set<string>();

  const isEarly =
    !code ||
    code === 'REQUESTED' ||
    code === 'PENDING' ||
    code === 'DRAFT';

  if (isEarly) {
    next.add('ACCEPTED');
  }
  if (code === 'ACCEPTED' || code === 'PENDING' || code === 'REQUESTED') {
    next.add('IN_PROGRESS');
  }
  if (code === 'ACCEPTED' || code === 'IN_PROGRESS') {
    next.add('COMPLETED');
  }
  next.add('CANCELLED');

  if (code) next.delete(code);

  return Array.from(next).map((value) => ({
    value,
    label: resolveOrderStatusLabelAr(value),
  }));
}

/** استبدال أكواد الحالة الإنجليزية داخل رسالة عربية من الخادم. */
export function localizeOrderStatusesInMessage(message: string): string {
  if (!message.trim()) return message;
  return message.replace(STATUS_TOKEN_RE, (match) => {
    const key = normalizeStatusToken(match);
    return ORDER_STATUS_CODE_AR[key] ?? match;
  });
}
