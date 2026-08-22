import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import SignUpForm from "@/components/auth/signUp/signup-form";
import AuthBackground from "@/components/auth/AuthBackground";
import { useI18n } from "@/i18n/provider";

export default function SignupPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>{t("auth.page.signup.title")}</title>
      </Helmet>

      <AuthBackground>
        <SignUpForm
          onBack={() => navigate("/welcome")}
          onLogin={() => navigate("/login")}
          onVerify={() => navigate("/verify-otp")}
          onSuccess={() => navigate("/signup-success")}
        />
      </AuthBackground>
    </>
  );
}
