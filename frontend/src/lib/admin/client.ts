import { get, patch } from '@/lib/base';
import { adminEndpoints } from '@/lib/admin/endpoints';
import type {
  AppointmentCancelResponse,
  AppointmentDetailsResponse,
  VerificationRequestReviewBody,
} from '@/lib/admin/types';

export const adminApi = {
  appointments: {
    getDetails: (appointmentId: string) =>
      get<AppointmentDetailsResponse>(adminEndpoints.appointments.details(appointmentId), {
        locale: 'ar',
      }),
    cancel: (appointmentId: string, reason: string) =>
      patch<AppointmentCancelResponse>(
        adminEndpoints.appointments.cancel(appointmentId),
        { reason },
        { locale: 'ar' },
      ),
  },
  verificationRequests: {
    review: (requestId: string, body: VerificationRequestReviewBody) =>
      patch<any>(adminEndpoints.verificationRequests.review(requestId), body, {
        locale: 'ar',
      }),
  },
};

