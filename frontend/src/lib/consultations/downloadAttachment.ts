import { doctorApi } from '@/lib/doctor/client';
import type { ConsultationAttachmentFile } from '@/lib/consultations/types';

function resolveAttachmentFileId(attachment: ConsultationAttachmentFile) {
  return attachment.fileId?.trim() || attachment.ref?.trim() || '';
}

export async function openConsultationAttachmentDownload(
  doctorId: string,
  patientId: string,
  attachment: ConsultationAttachmentFile,
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
  window.open(url, '_blank', 'noopener,noreferrer');
}
