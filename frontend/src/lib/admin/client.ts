import { get, patch } from '@/lib/base';
import { adminEndpoints } from '@/lib/admin/endpoints';
import type {
  AppointmentCancelResponse,
  AppointmentDetailsResponse,
  AdminDoctorDetailsResponse,
  AdminDoctorsListParams,
  AdminDoctorsListResponse,
  VerificationRequestReviewBody,
} from '@/lib/admin/types';

export const adminApi = {
  doctors: {
    list: (params: AdminDoctorsListParams = {}) => {
      const qs = new URLSearchParams();

      if (params.status) qs.set('status', params.status);
      if (params.search) qs.set('search', params.search);
      if (params.specialization)
        qs.set('specialization', params.specialization);
      if (params.city) qs.set('city', params.city);
      if (params.country) qs.set('country', params.country);
      if (params.from) qs.set('from', params.from);
      if (params.to) qs.set('to', params.to);
      if (params.page) qs.set('page', String(params.page));
      if (params.limit) qs.set('limit', String(params.limit));

      const endpoint = qs.toString()
        ? `${adminEndpoints.doctors.list}?${qs.toString()}`
        : adminEndpoints.doctors.list;

      return get<AdminDoctorsListResponse>(endpoint, { locale: 'ar' });
    },
    getById: (doctorId: string) =>
      get<AdminDoctorDetailsResponse>(
        adminEndpoints.doctors.details(doctorId),
        {
          locale: 'ar',
        },
      ),
  },
  appointments: {
    getDetails: (appointmentId: string) =>
      get<AppointmentDetailsResponse>(
        adminEndpoints.appointments.details(appointmentId),
        {
          locale: 'ar',
        },
      ),
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
