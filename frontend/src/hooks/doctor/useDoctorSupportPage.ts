'use client';

import { useMemo } from 'react';
import {
  usePlatformContactContent,
  usePlatformFaqContent,
  usePlatformPrivacyContent,
  usePlatformTermsContent,
} from '@/hooks/platform/usePlatformContent';
import { useDoctorProfile } from '@/hooks/doctor/useDoctorProfile';
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

  const isLoading =
    profileQuery.isLoading ||
    faqQuery.isLoading ||
    contactQuery.isLoading ||
    termsQuery.isLoading ||
    privacyQuery.isLoading;

  const hasCmsContact = contactQuery.channels.length > 0;

  return {
    identity,
    supportEmail,
    faqItems: faqQuery.items,
    contactChannels: contactQuery.channels,
    termsDocument: termsQuery.document,
    privacyDocument: privacyQuery.document,
    isLoading,
    isProfileLoading: profileQuery.isLoading,
    isFaqLoading: faqQuery.isLoading,
    isContactLoading: contactQuery.isLoading,
    hasCmsContact,
    profileError: profileQuery.isError,
  };
}
