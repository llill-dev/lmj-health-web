"use client";

import { useMemo } from "react";
import {
  isAwaitingAnyInitialQueryData,
} from "@/lib/query/queryUi";
import {
  buildClinicLocationChangeItems,
  buildClinicLocationFormValues,
  extractClinicCoordinates,
  hasPendingLocationChangeRequest,
  resolveClinicVerificationStatus,
} from "@/lib/doctor/clinicLocation/utils";
import {
  useDoctorProfile,
  useDoctorProfileChangeRequests,
  useSubmitDoctorProfileChangeRequest,
} from "@/hooks/doctor/useDoctorProfile";

export function useDoctorClinicLocation() {
  const profileQuery = useDoctorProfile();
  const pendingRequestsQuery = useDoctorProfileChangeRequests("pending");
  const submitMutation = useSubmitDoctorProfileChangeRequest();

  const doctor = profileQuery.data?.doctor;
  const pendingRequests = pendingRequestsQuery.data?.requests ?? [];

  const initialValues = useMemo(
    () => buildClinicLocationFormValues(doctor),
    [doctor],
  );

  const coordinates = useMemo(() => extractClinicCoordinates(doctor), [doctor]);

  const hasPendingLocationRequest = useMemo(
    () => hasPendingLocationChangeRequest(pendingRequests),
    [pendingRequests],
  );

  const verificationStatus = useMemo(
    () =>
      resolveClinicVerificationStatus(
        doctor?.geoStatus,
        hasPendingLocationRequest,
      ),
    [doctor?.geoStatus, hasPendingLocationRequest],
  );

  const isAwaitingData = isAwaitingAnyInitialQueryData([
    { data: profileQuery.data, isError: profileQuery.isError },
    { data: pendingRequestsQuery.data, isError: pendingRequestsQuery.isError },
  ]);

  const isError = profileQuery.isError;

  return {
    doctor,
    initialValues,
    coordinates,
    verificationStatus,
    hasPendingLocationRequest,
    isAwaitingData,
    isError,
    isSubmitting: submitMutation.isPending,
    profileQuery,
    pendingRequestsQuery,
    submitLocationChange: submitMutation.mutateAsync,
    buildChangeItems: buildClinicLocationChangeItems,
  };
}
