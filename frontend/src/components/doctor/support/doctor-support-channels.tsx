'use client';

import { ExternalLink, Mail, MessageCircle, Phone } from 'lucide-react';
import type { PlatformContactChannel } from '@/lib/platform/types';

function channelIcon(kind: PlatformContactChannel['kind']) {
  switch (kind) {
    case 'email':
      return Mail;
    case 'phone':
      return Phone;
    case 'whatsapp':
      return MessageCircle;
    default:
      return ExternalLink;
  }
}

export function DoctorSupportChannels({
  channels,
  loading,
}: {
  channels: PlatformContactChannel[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[72px] animate-pulse rounded-[12px] border border-[#EEF2F6] bg-[#F9FAFB]"
          />
        ))}
      </div>
    );
  }

  if (!channels.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {channels.map((channel) => {
        const Icon = channelIcon(channel.kind);
        const href =
          channel.kind === 'email' && !channel.url.startsWith('mailto:')
            ? `mailto:${channel.url}`
            : channel.url;

        return (
          <a
            key={channel.id}
            href={href}
            target={channel.kind === 'email' || channel.kind === 'phone' ? undefined : '_blank'}
            rel={channel.kind === 'social' || channel.kind === 'whatsapp' ? 'noreferrer' : undefined}
            className="flex items-center justify-between gap-3 rounded-[12px] border border-[#D1FAE5] bg-white px-4 py-4 text-right shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <ExternalLink className="h-4 w-4 shrink-0 text-[#98A2B3]" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
                {channel.label}
              </div>
              <div className="mt-1 truncate font-cairo text-[12px] font-semibold text-[#667085]" dir="ltr">
                {channel.url.replace(/^mailto:/i, '')}
              </div>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#F0FDFA] text-primary">
              <Icon className="h-4 w-4" aria-hidden />
            </div>
          </a>
        );
      })}
    </div>
  );
}
