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

export const doctorProfileApi = {
  getProfile: () =>
    get<DoctorProfileResponse>('/api/doctors/me/profile', { locale: 'ar' }),

  patchProfile: (input: DoctorProfilePatchInput) => {
    const form = new FormData();
    appendIfPresent(form, 'fullName', input.fullName);
    appendIfPresent(form, 'phone', input.phone);
    appendIfPresent(form, 'address', input.address);
    appendIfPresent(form, 'dateOfBirth', input.dateOfBirth);
    appendIfPresent(form, 'bio', input.bio);
    if (input.consultationFee != null && !Number.isNaN(input.consultationFee)) {
      form.append('consultationFee', String(input.consultationFee));
    }
    if (input.consultationTypes?.length) {
      form.append('consultationTypes', JSON.stringify(input.consultationTypes));
    }
    if (input.photo) {
      form.append('photo', input.photo);
    }
    return patch<DoctorProfileResponse>('/api/doctors/me/profile', form, {
      locale: 'ar',
    });
  },
};
