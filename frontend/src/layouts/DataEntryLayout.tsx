import { Suspense, useCallback, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import DashboardHeader from "@/components/layout/dashboard-header";
import Sidebar from "@/components/layout/sidebar";
import LogoutConfirmDialog, {
  type LogoutScope,
} from "@/components/auth/logout-confirm-dialog";
import { useToast } from "@/components/ui/ToastProvider";
import {
  dataEntrySidebarItems,
  getSectionBackNavigation,
  type DataEntrySidebarItemId,
} from "@/constant/sidebar-items";
import { readAuthUser } from "@/lib/cookies";
import { MotionProvider, PageTransition } from "@/motion";
import { DoctorRouteFallback } from "@/routes/RouteFallbacks";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from "@/i18n/provider";

export default function DataEntryLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const authUser = readAuthUser();
  const profileName = useMemo(() => {
    return authUser?.fullName?.trim() || t("sidebar.role.data-entry");
  }, [authUser?.fullName, t]);
  const profileEmail = authUser?.email?.trim() || "";

  const performLogout = useCallback(
    async (scope: LogoutScope) => {
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
    },
    [navigate, t, toast],
  );

  const pathname = location.pathname;
  const headerTitle = useMemo(() => {
    if (pathname.startsWith("/data-entry/medical-content")) {
      return t("dataEntry.header.medicalContent");
    }
    if (pathname.startsWith("/data-entry/content-templates")) {
      return t("dataEntry.header.contentTemplates");
    }
    if (pathname.startsWith("/data-entry/medical-orders")) {
      return t("dataEntry.header.medicalOrders");
    }
    if (pathname.startsWith("/data-entry/service-providers")) {
      return t("dataEntry.header.serviceProviders");
    }
    return t("dataEntry.header.dashboard");
  }, [pathname, t]);

  const active: DataEntrySidebarItemId =
    dataEntrySidebarItems.find(
      (item) =>
        pathname === `/data-entry/${item.path}`
        || pathname.startsWith(`/data-entry/${item.path}/`),
    )?.path ?? "dashboard";

  const backLink = useMemo(
    () =>
      getSectionBackNavigation(
        pathname,
        "/data-entry",
        dataEntrySidebarItems,
        t,
      ),
    [pathname, t],
  );

  return (
    <div className="h-dvh overflow-hidden scrollbar-hide bg-[linear-gradient(165deg,#f4faf9_0%,#f8fafc_42%,#ffffff_100%)]">
      <div className="relative mx-auto flex h-dvh w-full max-w-screen-2xl">
        <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-40">
            <DashboardHeader
              role="data-entry"
              title={headerTitle}
              onMenuClick={() => setIsMobileSidebarOpen(true)}
              showMessages={false}
              showUnreadBadge={false}
              showNotifications={false}
              backLink={backLink}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-transparent py-5 scrollbar-hide sm:py-6 lg:py-8">
            <MotionProvider>
              <AnimatePresence mode="wait">
                <PageTransition key={pathname}>
                  <div className="mx-auto w-full max-w-[1420px] px-4 sm:px-6 lg:px-12">
                    <Suspense fallback={<DoctorRouteFallback />}>
                      <Outlet />
                    </Suspense>
                  </div>
                </PageTransition>
              </AnimatePresence>
            </MotionProvider>
          </div>
        </main>

        <Sidebar
          role="data-entry"
          active={active}
          collapsed={isSidebarCollapsed}
          mobileOpen={isMobileSidebarOpen}
          onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onLogout={() => setLogoutConfirmOpen(true)}
          profileName={profileName}
          profileEmail={profileEmail}
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
