import type {
  DoctorActivityLogDetails,
  DoctorActivityLogRecord,
} from '@/lib/doctor/activityLog/api-types';
import type {
  ActivityLogActionType,
  DoctorActivityLogItem,
} from '@/lib/doctor/activityLog/types';

const ACTOR_ROLE_LABELS: Record<string, string> = {
  doctor: 'طبيب',
  patient: 'مريض',
  secretary: 'سكرتير',
  admin: 'مدير',
  data_entry: 'إدخال بيانات',
};

const CLIENT_TYPE_LABELS: Record<string, string> = {
  doctor_mobile: 'تطبيق الطبيب',
  patient_mobile: 'تطبيق المريض',
  web: 'الويب',
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  login_success: 'تسجيل دخول ناجح',
  login_failed: 'محاولة تسجيل دخول فاشلة',
  logout: 'تسجيل خروج',
  password_changed: 'تغيير كلمة المرور',
  email_changed: 'تغيير البريد الإلكتروني',
  phone_changed: 'تغيير رقم الهاتف',
  profile_updated: 'تحديث الملف الشخصي',
  appointment_booked: 'حجز موعد',
  appointment_cancelled: 'إلغاء موعد',
  appointment_rescheduled: 'إعادة جدولة موعد',
  appointment_completed: 'إكمال موعد',
  consultation_opened: 'فتح استشارة',
  consultation_message_sent: 'إرسال رسالة استشارة',
  consultation_status_updated: 'تحديث حالة الاستشارة',
  access_request_created: 'إنشاء طلب وصول',
  access_request_decided: 'قرار طلب وصول',
  medical_record_opened: 'فتح سجل طبي',
  medical_record_created: 'إنشاء سجل طبي',
  prescription_opened: 'فتح وصفة طبية',
  patient_file_downloaded: 'تنزيل ملف مريض',
  patient_file_uploaded: 'رفع ملف مريض',
  order_created: 'إنشاء طلب طبي',
  order_updated: 'تحديث طلب طبي',
  schedule_updated: 'تحديث الجدول',
  session_revoked: 'إلغاء جلسة',
};

function readDetailString(
  details: DoctorActivityLogDetails | undefined,
  key: string,
): string | undefined {
  const value = details?.[key];
  if (typeof value === 'string' && value.trim()) return value.trim();
  return undefined;
}

function readActivityLogRecords(
  records: DoctorActivityLogRecord[] | undefined,
): DoctorActivityLogRecord[] {
  return Array.isArray(records) ? records : [];
}

function formatActivityDateParts(iso: string): {
  dateLabel: string;
  timeLabel: string;
} {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { dateLabel: '—', timeLabel: '—' };
  }

  return {
    dateLabel: date.toLocaleDateString('ar-SY', {
      day: 'numeric',
      month: 'long',
    }),
    timeLabel: date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

export function getActivityTypeLabel(type: string): string {
  const normalized = type.trim().toLowerCase();
  if (ACTIVITY_TYPE_LABELS[normalized]) return ACTIVITY_TYPE_LABELS[normalized];
  return normalized.replace(/_/g, ' ');
}

export function resolveActivityLogActionType(type: string): ActivityLogActionType {
  const normalized = type.trim().toLowerCase();

  if (
    normalized.includes('login') ||
    normalized.includes('logout') ||
    normalized.includes('password') ||
    normalized.includes('session')
  ) {
    return 'login';
  }

  if (
    normalized.includes('profile') ||
    normalized.includes('email') ||
    normalized.includes('phone') ||
    normalized.includes('settings')
  ) {
    return 'update_profile';
  }

  if (normalized.includes('access_request') || normalized.includes('access')) {
    return 'access_request';
  }

  if (
    normalized.includes('upload') ||
    normalized.includes('file_upload') ||
    normalized.includes('patient_file')
  ) {
    return normalized.includes('upload') || normalized.includes('uploaded')
      ? 'upload_file'
      : 'view_record';
  }

  if (
    normalized.includes('medical_record') ||
    normalized.includes('prescription') ||
    normalized.includes('download')
  ) {
    return 'view_record';
  }

  if (normalized.includes('appointment')) return 'appointment';
  if (normalized.includes('consultation')) return 'consultation';
  if (normalized.includes('order')) return 'order';

  if (
    normalized.includes('failed') ||
    normalized.includes('denied') ||
    normalized.includes('blocked')
  ) {
    return 'security';
  }

  return 'other';
}

function formatClientDevice(details?: DoctorActivityLogDetails): string | undefined {
  const clientType = readDetailString(details, 'clientType');
  const userAgent = readDetailString(details, 'userAgent');
  const platform = readDetailString(details, 'platform');

  if (clientType && userAgent) {
    const clientLabel = CLIENT_TYPE_LABELS[clientType] ?? clientType;
    return `${clientLabel} · ${userAgent}`;
  }

  if (clientType) return CLIENT_TYPE_LABELS[clientType] ?? clientType;
  if (userAgent) return userAgent;
  if (platform) return platform;
  return undefined;
}

function buildActivityTitle(record: DoctorActivityLogRecord): string {
  const label = getActivityTypeLabel(record.type);
  const actor = record.actorDisplayName?.trim();
  const patient =
    readDetailString(record.details, 'patientName') ??
    readDetailString(record.details, 'patientPublicId');
  const normalized = record.type.trim().toLowerCase();

  if (normalized.includes('login_success')) {
    return actor ? `تم تسجيل الدخول إلى حسابك — ${actor}` : 'تم تسجيل الدخول إلى حسابك';
  }

  if (normalized.includes('login_failed')) {
    return 'محاولة تسجيل دخول غير ناجحة';
  }

  if (normalized.includes('appointment') && patient) {
    return `${label} — ${patient}`;
  }

  if (normalized.includes('access_request') && patient) {
    return `${label} — ${patient}`;
  }

  if (
    (normalized.includes('medical_record') ||
      normalized.includes('prescription') ||
      normalized.includes('patient_file')) &&
    patient
  ) {
    return `${label} — ${patient}`;
  }

  if (actor && record.actorRole && record.actorRole !== 'doctor') {
    return `${label} — ${actor}`;
  }

  return actor ? `${label} — ${actor}` : label;
}

export function mapDoctorActivityLogItem(
  record: DoctorActivityLogRecord,
): DoctorActivityLogItem {
  const { dateLabel, timeLabel } = formatActivityDateParts(record.occurredAt);
  const patientName = readDetailString(record.details, 'patientName');
  const actorRoleLabel = record.actorRole
    ? ACTOR_ROLE_LABELS[record.actorRole] ?? record.actorRole
    : undefined;

  return {
    id: record._id,
    title: buildActivityTitle(record),
    timestamp: record.occurredAt,
    actionType: resolveActivityLogActionType(record.type),
    dateLabel,
    timeLabel,
    patientName,
    operationTypeLabel: getActivityTypeLabel(record.type),
    actorRoleLabel,
    actorDisplayName: record.actorDisplayName?.trim() || undefined,
    ip: readDetailString(record.details, 'ip'),
    device: formatClientDevice(record.details),
  };
}

export function mapDoctorActivityLogItems(
  records: DoctorActivityLogRecord[] | undefined,
): DoctorActivityLogItem[] {
  return readActivityLogRecords(records).map(mapDoctorActivityLogItem);
}
