import { readAuthRefreshExpiresAt, readAuthUser, writeAuthUser } from '@/lib/cookies';
import { cookieMaxAgeFromRefreshExpires } from '@/lib/auth/session';
import type { DoctorProfileResponse } from '@/lib/doctor/profile/profileClient';

/** Keep sidebar/header auth snapshot in sync after profile PATCH. */
export function syncAuthUserFromDoctorProfile(
  response: DoctorProfileResponse | undefined,
) {
  const stored = readAuthUser();
  const profileUser = response?.doctor?.user;
  if (!stored || !profileUser) return;

  writeAuthUser(
    {
      ...stored,
      fullName: profileUser.fullName?.trim() || stored.fullName,
      email: profileUser.email?.trim() || stored.email,
      phone: profileUser.phone?.trim() || stored.phone,
      photoUrl: profileUser.photoUrl ?? stored.photoUrl ?? null,
    },
    cookieMaxAgeFromRefreshExpires(readAuthRefreshExpiresAt()),
  );
}
