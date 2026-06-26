import type {
  DoctorTemplateApplyResponse,
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
  application: Record<string, unknown>;
  storedAt: string;
};

function isValidTemplateType(value: unknown): value is DoctorTemplateType {
  return (
    typeof value === 'string' &&
    (VALID_TEMPLATE_TYPES as readonly string[]).includes(value)
  );
}

function resolveApplicationFromApplyResponse(
  response: DoctorTemplateApplyResponse,
): Record<string, unknown> | null {
  if (
    response.application &&
    typeof response.application === 'object' &&
    !Array.isArray(response.application)
  ) {
    return response.application;
  }

  const payload = response.template?.payload;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }

  const nested = (payload as Record<string, unknown>).application;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }

  return payload as Record<string, unknown>;
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
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object') return null;
  const record = parsed as Partial<StoredDoctorTemplateDraft>;

  if (!record.templateId || typeof record.templateId !== 'string') return null;
  if (!isValidTemplateType(record.type)) return null;
  if (
    !record.application ||
    typeof record.application !== 'object' ||
    Array.isArray(record.application)
  ) {
    return null;
  }

  if (record.storedAt) {
    const storedAtMs = new Date(record.storedAt).getTime();
    if (Number.isNaN(storedAtMs)) return null;
    if (Date.now() - storedAtMs > DRAFT_MAX_AGE_MS) return null;
  }

  return {
    templateId: record.templateId,
    type: record.type,
    name: record.name?.trim() || 'قالب',
    application: record.application,
    storedAt: record.storedAt ?? new Date().toISOString(),
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
  application: Record<string, unknown> | undefined,
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
