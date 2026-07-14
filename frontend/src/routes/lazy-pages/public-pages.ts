import { lazy } from "react";

export const WelcomePage = lazy(() => import("@/pages/welcome/WelcomePage"));
export const LoginPage = lazy(() => import("@/pages/auth/login/LoginPage"));
export const SignupPage = lazy(() => import("@/pages/auth/signup/SignupPage"));
export const ForgotPasswordPage = lazy(
  () => import("@/pages/auth/password/forgot-password/ForgotPasswordPage"),
);
export const ResetPasswordPage = lazy(
  () => import("@/pages/auth/password/reset-password/ResetPasswordPage"),
);
export const ResetPasswordVerifyPage = lazy(
  () =>
    import("@/pages/auth/password/reset-password-verify/ResetPasswordVerifyPage"),
);
export const ResetPasswordSuccessPage = lazy(
  () =>
    import("@/pages/auth/password/reset-password-success/ResetPasswordSuccessPage"),
);
export const ClaimAccountPage = lazy(
  () => import("@/pages/auth/claim-account/ClaimAccountPage"),
);
export const VerifyOtpPage = lazy(
  () => import("@/pages/auth/verify-otp/VerifyOtpPage"),
);
export const SignupSuccessPage = lazy(
  () => import("@/pages/auth/signup-success/SignupSuccessPage"),
);
export const OnboardingPage = lazy(
  () => import("@/pages/onboarding/OnboardingPage"),
);
export const PublicMedicalLibraryPage = lazy(
  () => import("@/pages/public/medical-library/PublicMedicalLibraryPage"),
);
export const PublicMedicalLibraryDetailsPage = lazy(
  () =>
    import("@/pages/public/medical-library/PublicMedicalLibraryDetailsPage"),
);
