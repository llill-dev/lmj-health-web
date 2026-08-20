import { lazyWithRetry } from "@/lib/routing/lazyWithRetry";

export const WelcomePage = lazyWithRetry(() => import("@/pages/welcome/WelcomePage"));
export const LoginPage = lazyWithRetry(() => import("@/pages/auth/login/LoginPage"));
export const SignupPage = lazyWithRetry(() => import("@/pages/auth/signup/SignupPage"));
export const ForgotPasswordPage = lazyWithRetry(
  () => import("@/pages/auth/password/forgot-password/ForgotPasswordPage"),
);
export const ResetPasswordPage = lazyWithRetry(
  () => import("@/pages/auth/password/reset-password/ResetPasswordPage"),
);
export const ResetPasswordVerifyPage = lazyWithRetry(
  () =>
    import("@/pages/auth/password/reset-password-verify/ResetPasswordVerifyPage"),
);
export const ResetPasswordSuccessPage = lazyWithRetry(
  () =>
    import("@/pages/auth/password/reset-password-success/ResetPasswordSuccessPage"),
);
export const ClaimAccountPage = lazyWithRetry(
  () => import("@/pages/auth/claim-account/ClaimAccountPage"),
);
export const VerifyOtpPage = lazyWithRetry(
  () => import("@/pages/auth/verify-otp/VerifyOtpPage"),
);
export const SignupSuccessPage = lazyWithRetry(
  () => import("@/pages/auth/signup-success/SignupSuccessPage"),
);
export const OnboardingPage = lazyWithRetry(
  () => import("@/pages/onboarding/OnboardingPage"),
);
export const PublicMedicalLibraryPage = lazyWithRetry(
  () => import("@/pages/public/medical-library/PublicMedicalLibraryPage"),
);
export const PublicMedicalLibraryDetailsPage = lazyWithRetry(
  () =>
    import("@/pages/public/medical-library/PublicMedicalLibraryDetailsPage"),
);
