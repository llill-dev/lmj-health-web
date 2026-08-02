import { Suspense, useCallback, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Sidebar from "@/components/layout/sidebar";
import DashboardHeader from "@/components/layout/dashboard-header";
import LogoutConfirmDialog, {
  type LogoutScope,
} from "@/components/auth/logout-confirm-dialog";
import DoctorInboxToastBridge from "@/components/doctor/DoctorInboxToastBridge";
import { useToast } from "@/components/ui/ToastProvider";
import {
  getSectionBackNavigation,
  sidebarItems,
  type SidebarItemId,
} from "@/constant/sidebar-items";
import { readAuthUser } from "@/lib/cookies";
import { DoctorRouteFallback } from "@/routes/RouteFallbacks";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from "@/i18n/provider";

export default function DoctorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const authUser = readAuthUser();
  const doctorName = useMemo(() => {
    const fullName = authUser?.fullName?.trim();
    if (!fullName) return "الطبيب";
    return /^د\.?\s/u.test(fullName) ? fullName : `د. ${fullName}`;
  }, [authUser?.fullName]);
  const doctorEmail = authUser?.email?.trim() || "";

  const performLogout = useCallback(async (scope: LogoutScope) => {
    setLoggingOut(true);
    try {
      await useAuthStore.getState().logout({ scope });
      toast(t("logout.toast.success.body"), {
        title: t("logout.toast.success.title"),
        variant: "success",
      });
      navigate("/login", { replace: true });
    } catch {
      toast(t("logout.toast.error.body"), {
        title: t("logout.toast.error.title"),
        variant: "error",
      });
      throw new Error("logout_failed");
    } finally {
      setLoggingOut(false);
    }
  }, [navigate, t, toast]);

  const pathname = location.pathname;

  const active: SidebarItemId =
    sidebarItems.find(
      (item) =>
        pathname === `/doctor/${item.path}` ||
        pathname.startsWith(`/doctor/${item.path}/`),
    )?.path ?? "dashboard";

  const backLink = useMemo(
    () => getSectionBackNavigation(pathname, "/doctor", sidebarItems),
    [pathname],
  );

  return (
    <div className="h-dvh overflow-hidden bg-white scrollbar-hide">
      <DoctorInboxToastBridge />
      <div className="relative mx-auto flex h-dvh w-full max-w-screen-2xl">
        <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-40">
            <DashboardHeader
              role="doctor"
              onMenuClick={() => setIsMobileSidebarOpen(true)}
              backLink={backLink}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-white py-5 scrollbar-hide sm:py-6 lg:py-8">
            <Suspense fallback={<DoctorRouteFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </main>

        <Sidebar
          active={active}
          collapsed={false}
          mobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onLogout={() => setLogoutConfirmOpen(true)}
          profileName={doctorName}
          profileEmail={doctorEmail}
        />
      </div>

      <LogoutConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        confirmDisabled={loggingOut}
        onConfirm={performLogout}
      />
    </div>
  );
}
