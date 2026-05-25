export type ConsultationAttachmentFile = {
  ref?: string;
  fileId?: string;
  fileName?: string;
  fileType?: string | null;
  mimeType?: string | null;
  extension?: string | null;
};

export type ConsultationReview = {
  rating?: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PendingConsultationAttachment = {
  ref: string;
  fileName: string;
};
