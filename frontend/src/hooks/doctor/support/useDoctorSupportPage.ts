'use client';

import { useMemo } from 'react';
import { isAwaitingAnyInitialQueryData, isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import {
  usePlatformContactContent,
  usePlatformFaqContent,
  usePlatformPrivacyContent,
  usePlatformTermsContent,
} from '@/hooks/platform/usePlatformContent';
import { useDoctorProfile } from '@/hooks/doctor/profile/useDoctorProfile';
import { resolveSupportEmail } from '@/lib/platform/supportContact';
import type { DoctorSupportIdentity } from '@/lib/doctor/support/types';

export function useDoctorSupportPage(language: 'ar' | 'en' = 'ar') {
  const profileQuery = useDoctorProfile();
  const faqQuery = usePlatformFaqContent(language);
  const contactQuery = usePlatformContactContent(language);
  const termsQuery = usePlatformTermsContent(language);
  const privacyQuery = usePlatformPrivacyContent(language);

  const identity = useMemo<DoctorSupportIdentity>(() => {
    const doctor = profileQuery.data?.doctor;
    const user = doctor?.user;
    return {
      doctorProfileId:
        doctor?._id ?? profileQuery.data?.actorIds?.doctorId ?? null,
      fullName: user?.fullName ?? null,
      email: user?.email ?? null,
      phone: user?.phone ?? null,
    };
  }, [profileQuery.data]);

  const supportEmail = useMemo(
    () => resolveSupportEmail(contactQuery.channels),
    [contactQuery.channels],
  );

  const isAwaitingData = isAwaitingAnyInitialQueryData([
    { data: profileQuery.data, isError: profileQuery.isError },
    { data: faqQuery.data, isError: false },
    { data: contactQuery.data, isError: false },
    { data: termsQuery.data, isError: false },
    { data: privacyQuery.data, isError: false },
  ]);

  const isAwaitingProfileData = isAwaitingInitialQueryData(
    profileQuery.data,
    profileQuery.isError,
  );

  const isAwaitingFaqData = isAwaitingInitialQueryData(
    faqQuery.data,
    false,
  );

  const isAwaitingContactData = isAwaitingInitialQueryData(
    contactQuery.data,
    false,
  );

  const hasCmsContact = contactQuery.channels.length > 0;

  return {
    identity,
    supportEmail,
    faqItems: faqQuery.items,
    contactChannels: contactQuery.channels,
    termsDocument: termsQuery.document,
    privacyDocument: privacyQuery.document,
    isAwaitingData,
    isAwaitingProfileData,
    isAwaitingFaqData,
    isAwaitingContactData,
    hasCmsContact,
    profileError: profileQuery.isError,
  };
}
