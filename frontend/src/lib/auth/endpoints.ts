export const authEndpoints = {
  signup: () => '/api/auth/signup',
  resendSignupOtp: () => '/api/auth/resend-signup-otp',
  verifySignupOtp: () => '/api/auth/verify-otp',
  login: () => '/api/auth/login',
  refresh: () => '/api/auth/refresh',
  logout: () => '/api/auth/logout',
  logoutAll: () => '/api/auth/logout-all',
  resetPassword: () => '/api/auth/reset-password',
  resendResetOtp: () => '/api/auth/resend-reset-otp',
  verifyResetOtp: () => '/api/auth/verify-reset-otp',
  newPassword: () => '/api/auth/new-password',
  claimAccountRequest: () => '/api/auth/claim-account/request',
  claimAccountVerify: () => '/api/auth/claim-account/verify',
  /** GET /api/meta/doctor-specializations */
  doctorSpecialties: () => '/api/meta/doctor-specializations',
};
