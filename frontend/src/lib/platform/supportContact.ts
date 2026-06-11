import { PLATFORM_FALLBACK_SUPPORT_EMAIL } from '@/lib/platform/endpoints';
import type { PlatformContactChannel } from '@/lib/platform/types';

export function resolveSupportEmail(
  channels: PlatformContactChannel[],
): string {
  const fromCms = channels.find((channel) => channel.kind === 'email');
  if (fromCms?.url) {
    return fromCms.url.replace(/^mailto:/i, '').trim();
  }
  return PLATFORM_FALLBACK_SUPPORT_EMAIL;
}

export function buildSupportMailtoUrl(input: {
  email?: string;
  subject: string;
  body: string;
}): string {
  const to = (input.email || PLATFORM_FALLBACK_SUPPORT_EMAIL).trim();
  const params = new URLSearchParams();
  if (input.subject.trim()) params.set('subject', input.subject.trim());
  if (input.body.trim()) params.set('body', input.body.trim());
  const query = params.toString();
  return query ? `mailto:${to}?${query}` : `mailto:${to}`;
}

export function openSupportMailto(input: {
  email?: string;
  subject: string;
  body: string;
}): void {
  window.location.href = buildSupportMailtoUrl(input);
}
