import { doctorApi } from '@/lib/doctor/client';
import { triggerBrowserFileDownload } from '@/lib/files/triggerBrowserFileDownload';
import type { ConsultationAttachmentFile } from '@/lib/consultations/types';

function resolveAttachmentFileId(attachment: ConsultationAttachmentFile) {
  return attachment.fileId?.trim() || attachment.ref?.trim() || '';
}

export async function openConsultationAttachmentDownload(
  doctorId: string,
  patientId: string,
  attachment: ConsultationAttachmentFile,
  mode: 'open' | 'download' = 'open',
) {
  const fileId = resolveAttachmentFileId(attachment);
  if (!fileId) {
    throw new Error('missing attachment reference');
  }

  const response = await doctorApi.patients.getFileDownloadUrl(
    doctorId,
    patientId,
    fileId,
  );
  const url = response.url ?? response.downloadUrl;
  if (!url) {
    throw new Error('missing download url');
  }
  const filename =
    attachment.fileName?.trim() || attachment.ref?.split('/').pop() || 'attachment';

  if (mode === 'download') {
    await triggerBrowserFileDownload(url, filename);
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
