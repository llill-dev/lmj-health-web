import type {
  DoctorActivityLogDetails,
  DoctorActivityLogRecord,
} from '@/lib/doctor/activityLog/api-types';
import type {
  ActivityLogActionType,
  DoctorActivityLogItem,
} from '@/lib/doctor/activityLog/types';
import { getTranslationValue } from '@/i18n/translations';
import type { AppLocale } from '@/i18n/runtime';

function tr(locale: AppLocale, key: string, params?: Record<string, unknown>): string {
  const raw = getTranslationValue(locale, key) ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, name) =>
    params[name] != null ? String(params[name]) : m,
  );
}

const ACTOR_ROLE_KEYS: Record<string, string> = {
  doctor: 'activityLog.role.doctor',
  patient: 'activityLog.role.patient',
  secretary: 'activityLog.role.secretary',
  admin: 'activityLog.role.admin',
  data_entry: 'activityLog.role.data_entry',
};

const CLIENT_TYPE_KEYS: Record<string, string> = {
  doctor_mobile: 'activityLog.client.doctor_mobile',
  patient_mobile: 'activityLog.client.patient_mobile',
  web: 'activityLog.client.web',
};

const ACTIVITY_TYPE_KEYS: Record<string, string> = {
  login_success: 'activityLog.type.login_success',
  login_failed: 'activityLog.type.login_failed',
  logout: 'activityLog.type.logout',
  password_changed: 'activityLog.type.password_changed',
  email_changed: 'activityLog.type.email_changed',
  phone_changed: 'activityLog.type.phone_changed',
  profile_updated: 'activityLog.type.profile_updated',
  appointment_booked: 'activityLog.type.appointment_booked',
  appointment_cancelled: 'activityLog.type.appointment_cancelled',
  appointment_rescheduled: 'activityLog.type.appointment_rescheduled',
  appointment_completed: 'activityLog.type.appointment_completed',
  consultation_opened: 'activityLog.type.consultation_opened',
  consultation_message_sent: 'activityLog.type.consultation_message_sent',
  consultation_status_updated: 'activityLog.type.consultation_status_updated',
  access_request_created: 'activityLog.type.access_request_created',
  access_request_decided: 'activityLog.type.access_request_decided',
  medical_record_opened: 'activityLog.type.medical_record_opened',
  medical_record_created: 'activityLog.type.medical_record_created',
  prescription_opened: 'activityLog.type.prescription_opened',
  patient_file_downloaded: 'activityLog.type.patient_file_downloaded',
  patient_file_uploaded: 'activityLog.type.patient_file_uploaded',
  order_created: 'activityLog.type.order_created',
  order_updated: 'activityLog.type.order_updated',
  schedule_updated: 'activityLog.type.schedule_updated',
  session_revoked: 'activityLog.type.session_revoked',
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

function formatActivityDateParts(
  iso: string,
  locale: AppLocale = 'ar',
): {
  dateLabel: string;
  timeLabel: string;
} {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { dateLabel: '—', timeLabel: '—' };
  }

  return {
    dateLabel: date.toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SY', {
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

export function getActivityTypeLabel(
  type: string,
  locale: AppLocale = 'ar',
): string {
  const normalized = type.trim().toLowerCase();
  const key = ACTIVITY_TYPE_KEYS[normalized];
  if (key) return tr(locale, key);
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

function formatClientDevice(
  details?: DoctorActivityLogDetails,
  locale: AppLocale = 'ar',
): string | undefined {
  const clientType = readDetailString(details, 'clientType');
  const userAgent = readDetailString(details, 'userAgent');
  const platform = readDetailString(details, 'platform');
  const clientKey = clientType ? CLIENT_TYPE_KEYS[clientType] : undefined;
  const clientLabel = clientKey ? tr(locale, clientKey) : clientType;

  if (clientType && userAgent) {
    return `${clientLabel ?? clientType} · ${userAgent}`;
  }

  if (clientType) return clientLabel ?? clientType;
  if (userAgent) return userAgent;
  if (platform) return platform;
  return undefined;
}

function buildActivityTitle(
  record: DoctorActivityLogRecord,
  locale: AppLocale = 'ar',
): string {
  const label = getActivityTypeLabel(record.type, locale);
  const actor = record.actorDisplayName?.trim();
  const patient =
    readDetailString(record.details, 'patientName') ??
    readDetailString(record.details, 'patientPublicId');
  const normalized = record.type.trim().toLowerCase();

  if (normalized.includes('login_success')) {
    return actor
      ? tr(locale, 'activityLog.title.loginSuccessWithActor', { actor })
      : tr(locale, 'activityLog.title.loginSuccess');
  }

  if (normalized.includes('login_failed')) {
    return tr(locale, 'activityLog.title.loginFailed');
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
  locale: AppLocale = 'ar',
): DoctorActivityLogItem {
  const { dateLabel, timeLabel } = formatActivityDateParts(
    record.occurredAt,
    locale,
  );
  const patientName = readDetailString(record.details, 'patientName');
  const actorRoleKey = record.actorRole
    ? ACTOR_ROLE_KEYS[record.actorRole]
    : undefined;
  const actorRoleLabel = record.actorRole
    ? (actorRoleKey ? tr(locale, actorRoleKey) : record.actorRole)
    : undefined;

  return {
    id: record._id,
    title: buildActivityTitle(record, locale),
    timestamp: record.occurredAt,
    actionType: resolveActivityLogActionType(record.type),
    dateLabel,
    timeLabel,
    patientName,
    operationTypeLabel: getActivityTypeLabel(record.type, locale),
    actorRoleLabel,
    actorDisplayName: record.actorDisplayName?.trim() || undefined,
    ip: readDetailString(record.details, 'ip'),
    device: formatClientDevice(record.details, locale),
  };
}

export function mapDoctorActivityLogItems(
  records: DoctorActivityLogRecord[] | undefined,
  locale: AppLocale = 'ar',
): DoctorActivityLogItem[] {
  return readActivityLogRecords(records).map((record) =>
    mapDoctorActivityLogItem(record, locale),
  );
}
