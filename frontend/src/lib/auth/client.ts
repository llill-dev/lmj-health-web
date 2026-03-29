import { post } from '@/lib/base';
import { authEndpoints } from '@/lib/auth/endpoints';
import type { DoctorSignupBody, ResendSignupOtpBody, SignupResponse } from '@/lib/auth/types';

export const authApi = {
  signupDoctor: (body: DoctorSignupBody) =>
    post<SignupResponse>(authEndpoints.signup(), body, { locale: 'ar' }),
  resendSignupOtp: (body: ResendSignupOtpBody) =>
    post<SignupResponse>(authEndpoints.resendSignupOtp(), body, { locale: 'ar' }),
};
