import type { AdminContentBlock } from '@/lib/admin/types';

export type PlatformContentLanguage = 'ar' | 'en';

export type PlatformSettingsListItem = {
  id: string;
  type: string;
  title: string;
  slug: string;
  language?: string;
  summary?: string;
  pageVersion?: string | null;
  publishedAt?: string;
};

export type PlatformContentDetails = {
  id: string;
  type: string;
  title: string;
  slug: string;
  language?: string;
  summary?: string;
  pageVersion?: string | null;
  publishedAt?: string;
  lastReviewedAt?: string | null;
  contentBlocks: AdminContentBlock[];
};

export type PlatformContentListResponse = {
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  items?: PlatformSettingsListItem[];
};

export type PlatformContentDetailsResponse = {
  contentItem?: PlatformContentDetails;
  item?: PlatformContentDetails;
};

export type PlatformContactChannel = {
  id: string;
  label: string;
  url: string;
  kind: 'email' | 'phone' | 'whatsapp' | 'social' | 'link';
};

export type PlatformFaqItem = {
  id: string;
  number: string;
  question: string;
  answer: string;
};

export type PlatformLegalDocument = {
  id: string;
  title: string;
  sectionTitle: string;
  body: string;
  lastUpdated: string;
  pageVersion?: string | null;
};

export type CreateComplaintBody = {
  type: 'technical' | 'other' | 'appointment' | 'consultation' | 'access_request';
  subject?: string;
  message: string;
  attachments?: Array<{ fileId: string; label?: string }>;
};

export type CreateComplaintResponse = {
  message?: string;
  messageKey?: string;
  complaint?: { _id: string; status?: string };
};

export type PlatformServiceTypeItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
};
