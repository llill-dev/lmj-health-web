import { useLayoutEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate, useLocation } from "react-router-dom";
import DoctorProfileSuccessScreen from "@/components/doctor/profile-settings/doctor-profile-success-screen";
import {
  clearDoctorProfileSuccessNavState,
  peekDoctorProfileSuccessNavState,
  resolveDoctorProfileSuccessNavState,
  type DoctorProfileSuccessNavState,
} from "@/lib/doctor/profile/doctorProfileSuccessNavState";
import { useI18n } from "@/i18n/provider";

export default function DoctorProfileSuccessPage() {
  const { t } = useI18n();
  const location = useLocation();
  const [state, setState] = useState<DoctorProfileSuccessNavState | null>(null);
  const [resolved, setResolved] = useState(false);

  useLayoutEffect(() => {
    const fromHistory = resolveDoctorProfileSuccessNavState(location.state);
    if (fromHistory) {
      setState(fromHistory);
      clearDoctorProfileSuccessNavState();
    } else {
      setState(peekDoctorProfileSuccessNavState());
    }
    setResolved(true);
  }, [location.state, location.key]);

  if (!resolved) {
    return null;
  }

  if (!state) {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{t("doctor.profileSuccess.pageTitle")} • LMJ Health</title>
      </Helmet>
      <DoctorProfileSuccessScreen
        redirectTo={state.redirectTo?.trim() || "/doctor/dashboard"}
      />
    </>
  );
}
