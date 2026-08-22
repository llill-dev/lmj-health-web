import type {
  AppointmentTypeApiBody,
  CreateAppointmentTypeBody,
  UpdateAppointmentTypeBody,
} from '@/lib/doctor/types';

/** Maps frontend form fields to API-3 POST/PATCH body (`isPriceVisibleToPatient`). */
export function toAppointmentTypeApiBody(
  body: CreateAppointmentTypeBody | UpdateAppointmentTypeBody,
): AppointmentTypeApiBody {
  const payload: AppointmentTypeApiBody = {};
  if (body.name != null) payload.name = body.name;
  if (body.description != null) payload.description = body.description;
  if (body.duration != null) payload.duration = body.duration;
  if (body.price != null) payload.price = body.price;
  if (body.priceVisibleToPatient != null) {
    payload.isPriceVisibleToPatient = body.priceVisibleToPatient;
  }
  if ('isActive' in body && body.isActive != null) {
    payload.isActive = body.isActive;
  }
  return payload;
}
