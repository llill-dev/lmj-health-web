import type { AdminContentBlock } from '@/lib/admin/types';
import type { AdminContentType } from '@/lib/admin/types';

export type PlatformContentLanguage = 'ar' | 'en';
export type PlatformContentType = AdminContentType;

export type PlatformSettingsListItem = {
  id: string;
  type: PlatformContentType | string;
  title: string;
  slug: string;
  language?: string;
  summary?: string;
  pageVersion?: string | null;
  publishedAt?: string;
};

export type PlatformContentListItem = PlatformSettingsListItem & {
  viewCount?: number;
  coverImage?: string;
  sourceName?: string;
};

export type PlatformContentDetails = {
  id: string;
  type: PlatformContentType | string;
  title: string;
  slug: string;
  language?: string;
  summary?: string;
  pageVersion?: string | null;
  publishedAt?: string;
  lastReviewedAt?: string | null;
  coverImage?: string;
  sourceName?: string;
  sources?: Array<{ title?: string; url?: string }>;
  contentBlocks: AdminContentBlock[];
};

export type PlatformContentListResponse = {
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  items?: PlatformContentListItem[];
};

export type PlatformContentSearchResponse = {
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  items?: PlatformContentListItem[];
  contentItems?: PlatformContentListItem[];
  content?: PlatformContentListItem[];
};

export type PlatformContentDetailsResponse = {
  contentItem?: PlatformContentDetails;
  item?: PlatformContentDetails;
  content?: PlatformContentDetails;
};

export type PlatformContentApiRecord = {
  [key: string]: unknown;
};

export type PlatformContentListEnvelope = {
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  items?: PlatformContentApiRecord[];
  contentItems?: PlatformContentApiRecord[];
  content?: PlatformContentApiRecord[];
};

export type PlatformContentDetailsEnvelope = {
  contentItem?: PlatformContentApiRecord;
  item?: PlatformContentApiRecord;
  content?: PlatformContentApiRecord;
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

export type PlatformContentSearchParams = {
  q: string;
  language?: PlatformContentLanguage;
  type?: PlatformContentType;
  page?: number;
  limit?: number;
};
