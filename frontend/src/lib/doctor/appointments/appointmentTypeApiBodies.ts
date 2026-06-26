import type {
  CreateAppointmentTypeBody,
  UpdateAppointmentTypeBody,
} from '@/lib/doctor/types';

/** Maps frontend form fields to API-3 POST/PATCH body (`isPriceVisibleToPatient`). */
export function toAppointmentTypeApiBody(
  body: CreateAppointmentTypeBody | UpdateAppointmentTypeBody,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (body.name != null) payload.name = body.name;
  if (body.price != null) payload.price = body.price;
  if (body.priceVisibleToPatient != null) {
    payload.isPriceVisibleToPatient = body.priceVisibleToPatient;
  }
  if ('isActive' in body && body.isActive != null) {
    payload.isActive = body.isActive;
  }
  return payload;
}
