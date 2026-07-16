import type {
  DoctorTemplateApplyResponse,
  DoctorTemplateApplication,
  DoctorTemplateType,
} from '@/lib/doctor/templates/templateTypes';

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
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function asTemplateApplication(
  value: unknown,
): DoctorTemplateApplication | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : null;
}

function parseTemplateDraftRaw(raw: string): unknown {
  return JSON.parse(raw);
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
  if (
    response.application &&
    typeof response.application === 'object' &&
    !Array.isArray(response.application)
  ) {
    return response.application;
  }

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
    name: response.name?.trim() || response.template?.name?.trim() || 'قالب',
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
  let parsed: unknown;
  try {
    parsed = parseTemplateDraftRaw(raw);
  } catch {
    return null;
  }

  const record = asObjectRecord(parsed);
  if (!record) return null;

  if (!record.templateId || typeof record.templateId !== 'string') return null;
  if (!isValidTemplateType(record.type)) return null;
  const application = asTemplateApplication(record.application);
  if (!application) return null;

  if (record.storedAt) {
    const storedAtMs = new Date(record.storedAt).getTime();
    if (Number.isNaN(storedAtMs)) return null;
    if (Date.now() - storedAtMs > DRAFT_MAX_AGE_MS) return null;
  }

  return {
    templateId: record.templateId,
    type: record.type,
    name: typeof record.name === 'string' && record.name.trim() ? record.name.trim() : 'قالب',
    application,
    storedAt:
      typeof record.storedAt === 'string' ? record.storedAt : new Date().toISOString(),
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
      lines.push(`${key}: ${value.length} عنصر`);
      continue;
    }
    lines.push(`${key}: …`);
  }
  return lines.slice(0, 8);
}
