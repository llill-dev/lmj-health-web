import type {
  DoctorTemplateApplyResponse,
  DoctorTemplateApplication,
  DoctorTemplateType,
} from '@/lib/doctor/templates/templateTypes';
import { getCurrentLocale } from '@/i18n/runtime';

function defaultTemplateName(): string {
  return getCurrentLocale() === 'en' ? 'Template' : 'قالب';
}

const STORAGE_KEY = 'doctor.templateDraft';
/** Drafts older than this are discarded on read (tab session safety). */
const DRAFT_MAX_AGE_MS = 8 * 60 * 60 * 1000;

const VALID_TEMPLATE_TYPES: readonly DoctorTemplateType[] = [
  'PRESCRIPTION',
  'LAB_ORDER',
  'IMAGING_ORDER',
  'PROCEDURE_ORDER',
  'REFERRAL_ORDER',
];

export type StoredDoctorTemplateDraft = {
  templateId: string;
  type: DoctorTemplateType;
  name: string;
  application: DoctorTemplateApplication;
  storedAt: string;
};

type TemplateApplicationEnvelope = {
  application?: DoctorTemplateApplication;
};

type TemplateDraftStorageRecord = {
  [key: string]: unknown;
};

type StoredDoctorTemplateDraftRecord = {
  templateId?: unknown;
  type?: unknown;
  name?: unknown;
  application?: unknown;
  storedAt?: unknown;
};

type TemplateApplyPayloadRecord = TemplateDraftStorageRecord & {
  application?: unknown;
};

function asObjectRecord(value: unknown): TemplateDraftStorageRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as TemplateDraftStorageRecord)
    : null;
}

function asTemplateApplication(
  value: unknown,
): DoctorTemplateApplication | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DoctorTemplateApplication)
    : null;
}

function parseTemplateDraftRaw(
  raw: string,
): TemplateDraftStorageRecord | null {
  return asObjectRecord(JSON.parse(raw));
}

function readTemplateDraftString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function isValidTemplateType(value: unknown): value is DoctorTemplateType {
  return (
    typeof value === 'string' &&
    VALID_TEMPLATE_TYPES.some((entry) => entry === value)
  );
}

function resolveApplicationFromApplyResponse(
  response: DoctorTemplateApplyResponse,
): DoctorTemplateApplication | null {
  const direct = asTemplateApplication(response.application);
  if (direct) return direct;

  const payload = response.template?.payload;
  const payloadRecord = asObjectRecord(payload);
  if (!payloadRecord) {
    return null;
  }

  const nested = asTemplateApplication(payloadRecord.application);
  if (nested) return nested;

  return asTemplateApplication(payloadRecord);
}

export function storeDoctorTemplateDraft(
  response: DoctorTemplateApplyResponse,
  templateId: string,
): StoredDoctorTemplateDraft | null {
  const application = resolveApplicationFromApplyResponse(response);
  const type = response.type ?? response.template?.type;
  if (!type || !isValidTemplateType(type) || !application) return null;

  const draft: StoredDoctorTemplateDraft = {
    templateId: response.templateId ?? templateId,
    type,
    name: response.name?.trim() || response.template?.name?.trim() || defaultTemplateName(),
    application,
    storedAt: new Date().toISOString(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    return null;
  }

  return draft;
}

function parseStoredDraft(raw: string): StoredDoctorTemplateDraft | null {
  let parsed: TemplateDraftStorageRecord | null;
  try {
    parsed = parseTemplateDraftRaw(raw);
  } catch {
    return null;
  }

  const record = parsed;
  if (!record) return null;

  const templateId = readTemplateDraftString(record.templateId);
  if (!templateId) return null;
  if (!isValidTemplateType(record.type)) return null;
  const application = asTemplateApplication(record.application);
  if (!application) return null;

  const storedAt = readTemplateDraftString(record.storedAt);
  if (storedAt) {
    const storedAtMs = new Date(storedAt).getTime();
    if (Number.isNaN(storedAtMs)) return null;
    if (Date.now() - storedAtMs > DRAFT_MAX_AGE_MS) return null;
  }

  return {
    templateId,
    type: record.type,
    name: readTemplateDraftString(record.name) ?? defaultTemplateName(),
    application,
    storedAt: storedAt ?? new Date().toISOString(),
  };
}

export function readDoctorTemplateDraft(): StoredDoctorTemplateDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const draft = parseStoredDraft(raw);
    if (!draft) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return draft;
  } catch {
    clearDoctorTemplateDraft();
    return null;
  }
}

export function clearDoctorTemplateDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function summarizeTemplateApplication(
  application: DoctorTemplateApplication | undefined,
  t?: (key: string, fallback?: string) => string,
): string[] {
  if (!application) return [];

  const lines: string[] = [];
  for (const [key, value] of Object.entries(application)) {
    if (value == null || value === '') continue;
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      lines.push(`${key}: ${String(value)}`);
      continue;
    }
    if (Array.isArray(value)) {
      const itemCount = t
        ? t('doctor.templateApplyDialog.itemCount').replace(
            '{count}',
            String(value.length),
          )
        : `${value.length} عنصر`;
      lines.push(`${key}: ${itemCount}`);
      continue;
    }
    lines.push(`${key}: …`);
  }
  return lines.slice(0, 8);
}
