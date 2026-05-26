'use client';

import { BadgeCheck, Star } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import {
  doctorInitial,
  formatDoctorDisplayName,
} from '@/components/doctor/profile-settings/doctor-profile-utils';

export default function DoctorProfileHeroCard({
  fullName,
  specialization,
  photoUrl,
  isApproved,
  rating,
  ratingCount,
  className,
}: {
  fullName?: string | null;
  specialization?: string | null;
  photoUrl?: string | null;
  isApproved?: boolean;
  rating?: number | null;
  ratingCount?: number | null;
  className?: string;
}) {
  const displayName = formatDoctorDisplayName(fullName);
  const initial = doctorInitial(fullName);
  const specialty = specialization?.trim() || '—';
  const showRating = rating != null && !Number.isNaN(rating);

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[6px] px-6 pb-8 pt-10 shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[6px] bg-[#E6F4F3]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[6px] bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center bg-no-repeat opacity-90"
        aria-hidden
      />

      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 font-cairo text-[11px] font-extrabold text-primary shadow-sm">
        <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
        {isApproved ? 'حالة الحساب: نشط' : 'حالة الحساب: قيد المراجعة'}
      </span>

      <div className="relative flex flex-col items-center text-center">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={displayName}
            className="h-[88px] w-[88px] rounded-full border-[3px] border-white object-cover shadow-[0_8px_24px_rgba(15,143,139,0.2)]"
          />
        ) : (
          <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-[3px] border-white bg-white/80 shadow-[0_8px_24px_rgba(15,143,139,0.2)]">
            <span className="font-cairo text-[28px] font-extrabold text-primary">
              {initial}
            </span>
          </div>
        )}

        <h1 className="mt-4 font-cairo text-[20px] font-extrabold text-[#101828]">
          {displayName}
        </h1>
        <p className="mt-1 font-cairo text-[14px] font-semibold text-[#667085]">
          {specialty}
        </p>

        {showRating ? (
          <div className="mt-2 inline-flex items-center gap-1.5 font-cairo text-[13px] font-bold text-[#101828]">
            <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" aria-hidden />
            <span>{rating.toFixed(1)}</span>
            {ratingCount != null ? (
              <span className="font-semibold text-[#667085]">
                ({ratingCount} {ratingCount === 1 ? 'تقييم' : 'تقييمات'})
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
