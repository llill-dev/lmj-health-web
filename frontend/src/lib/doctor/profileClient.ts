import { get, patch } from '@/lib/api';

export type DoctorConsultationType = 'online' | 'offline';

export type DoctorProfileUser = {
  _id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  photoUrl?: string | null;
  photoKey?: string | null;
  photoUrlExpiresIn?: number;
};

export type DoctorProfileRecord = {
  _id?: string;
  specialization?: string;
  medicalLicenseNumber?: string;
  education?: string;
  clinicAddress?: string;
  locationCity?: string;
  locationCountry?: string;
  clinicLat?: number | null;
  clinicLng?: number | null;
  bio?: string;
  consultationFee?: number | null;
  consultationTypes?: DoctorConsultationType[] | string[];
  isApproved?: boolean;
  user?: DoctorProfileUser;
};

export type DoctorProfileResponse = {
  message?: string;
  messageKey?: string;
  actorIds?: {
    doctorId?: string | null;
  };
  doctor?: DoctorProfileRecord;
};

export type DoctorProfilePatchInput = {
  fullName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  bio?: string;
  consultationFee?: number | null;
  consultationTypes?: DoctorConsultationType[];
  photo?: File | null;
};

function appendIfPresent(form: FormData, key: string, value: string | undefined) {
  const trimmed = value?.trim();
  if (trimmed) form.append(key, trimmed);
}

/** API expects calendar date; normalize date input / ISO strings. */
export function normalizeProfileDateOfBirth(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return trimmed;
  return date.toISOString().slice(0, 10);
}

function appendConsultationTypes(
  form: FormData,
  types?: DoctorConsultationType[],
) {
  if (!types?.length) return;
  for (const type of types) {
    form.append('consultationTypes', type);
  }
}

export const doctorProfileApi = {
  getProfile: () =>
    get<DoctorProfileResponse>('/api/doctors/me/profile', { locale: 'ar' }),

  patchProfile: (input: DoctorProfilePatchInput) => {
    const form = new FormData();
    appendIfPresent(form, 'fullName', input.fullName);
    appendIfPresent(form, 'phone', input.phone);
    appendIfPresent(form, 'address', input.address);
    appendIfPresent(
      form,
      'dateOfBirth',
      normalizeProfileDateOfBirth(input.dateOfBirth),
    );
    appendIfPresent(form, 'bio', input.bio);
    if (input.consultationFee != null && !Number.isNaN(input.consultationFee)) {
      form.append('consultationFee', String(Math.trunc(input.consultationFee)));
    }
    appendConsultationTypes(form, input.consultationTypes);
    if (input.photo) {
      form.append('photo', input.photo);
    }
    return patch<DoctorProfileResponse>('/api/doctors/me/profile', form, {
      locale: 'ar',
    });
  },
};
