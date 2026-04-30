export const authEndpoints = {
  signup: () => '/api/auth/signup',
  /** اختياري: تحقّق توفّر البريد والهاتف قبل إكمال باقي الخطوات؛ 404 مرور عبر المناداة ⇒ يُتخطّى المحلّياً. */
  signupContactPrecheck: () => '/api/auth/check-signup-contact',
  resendSignupOtp: () => '/api/auth/resend-signup-otp',
  verifySignupOtp: () => '/api/auth/verify-otp',
  login: () => '/api/auth/login',
  logoutAll: () => '/api/auth/logout-all',
  /** GET /api/meta/doctor-specializations */
  doctorSpecialties: () => '/api/meta/doctor-specializations',
};
