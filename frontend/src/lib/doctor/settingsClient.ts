import { post, put } from '@/lib/api';

export type ChangeDoctorPasswordBody = {
  currentPassword: string;
  newPassword: string;
};

export type ChangeDoctorEmailRequestBody = {
  currentPassword: string;
  newEmail: string;
};

export type ChangeDoctorEmailConfirmBody = {
  otp: string;
};

export type ChangeDoctorPhoneRequestBody = {
  currentPassword: string;
  newPhone: string;
};

export type ChangeDoctorPhoneConfirmBody = {
  otp: string;
};

export type SettingsMutationResponse = {
  message?: string;
  messageKey?: string;
};

export const doctorSettingsApi = {
  changePassword: (body: ChangeDoctorPasswordBody) =>
    put<SettingsMutationResponse>('/api/doctors/me/settings/password', body, {
      locale: 'ar',
    }),

  requestEmailChange: (body: ChangeDoctorEmailRequestBody) =>
    post<SettingsMutationResponse>(
      '/api/doctors/me/settings/email/request',
      body,
      { locale: 'ar' },
    ),

  confirmEmailChange: (body: ChangeDoctorEmailConfirmBody) =>
    post<SettingsMutationResponse>(
      '/api/doctors/me/settings/email/confirm',
      body,
      { locale: 'ar' },
    ),

  requestPhoneChange: (body: ChangeDoctorPhoneRequestBody) =>
    post<SettingsMutationResponse>(
      '/api/doctors/me/settings/phone/request',
      body,
      { locale: 'ar' },
    ),

  confirmPhoneChange: (body: ChangeDoctorPhoneConfirmBody) =>
    post<SettingsMutationResponse>(
      '/api/doctors/me/settings/phone/confirm',
      body,
      { locale: 'ar' },
    ),
};
