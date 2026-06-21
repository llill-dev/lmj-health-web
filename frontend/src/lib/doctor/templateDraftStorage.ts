import type {
  DoctorTemplateApplyResponse,
  DoctorTemplateType,
} from '@/lib/doctor/templateTypes';

const STORAGE_KEY = 'doctor.templateDraft';

export type StoredDoctorTemplateDraft = {
  templateId: string;
  type: DoctorTemplateType;
  name: string;
  application: Record<string, unknown>;
  storedAt: string;
};

export function storeDoctorTemplateDraft(
  response: DoctorTemplateApplyResponse,
  templateId: string,
): StoredDoctorTemplateDraft | null {
  if (!response.type || !response.application) return null;

  const draft: StoredDoctorTemplateDraft = {
    templateId: response.templateId ?? templateId,
    type: response.type,
    name: response.name?.trim() || 'قالب',
    application: response.application,
    storedAt: new Date().toISOString(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    return null;
  }

  return draft;
}

export function readDoctorTemplateDraft(): StoredDoctorTemplateDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredDoctorTemplateDraft;
  } catch {
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
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
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
