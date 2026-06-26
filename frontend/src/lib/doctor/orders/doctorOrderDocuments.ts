import { API_BASE_URL, ApiError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export type GenerateDoctorDocumentBody = {
  sourceType: 'order' | 'imaging_order' | 'prescription' | 'diagnosis';
  sourceId: string;
};

/** @deprecated استخدم GenerateDoctorDocumentBody */
export type GenerateOrderDocumentBody = {
  sourceType: 'order' | 'imaging_order';
  sourceId: string;
};

export async function generateDoctorDocumentPdf(
  body: GenerateDoctorDocumentBody,
): Promise<Blob> {
  const token = useAuthStore.getState().accessToken?.trim();
  const endpoint = `${API_BASE_URL}/api/documents/generate`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/pdf',
      'x-lang': 'ar',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const contentType = (res.headers.get('content-type') ?? '').toLowerCase();

  if (!res.ok || contentType.includes('application/json')) {
    let message = 'تعذّر إنشاء ملف PDF.';
    let messageKey: string | null = null;
    let body: Record<string, unknown> = {};

    try {
      body = (await res.json()) as Record<string, unknown>;
      messageKey = (body.messageKey as string | null) ?? null;
      message =
        (typeof body.message === 'string' && body.message.trim()) || message;
    } catch {
      // body غير JSON
    }

    throw new ApiError(
      res.ok ? 500 : res.status,
      messageKey,
      body,
      message,
    );
  }

  const blob = await res.blob();
  if (blob.size < 128) {
    throw new ApiError(
      404,
      'errors.documents.empty',
      {},
      'لا توجد بيانات كافية لإنشاء ملف النتيجة.',
    );
  }

  return blob;
}

export async function generateDoctorOrderDocumentPdf(
  body: GenerateOrderDocumentBody,
): Promise<Blob> {
  return generateDoctorDocumentPdf(body);
}

export function openPdfBlobInNewTab(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
