import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/sidebar";
import DashboardHeader from "@/components/layout/dashboard-header";
import ConfirmActionDialog from "@/components/doctor/confirm-action-dialog";
import { useToast } from "@/components/ui/ToastProvider";
import {
  secretarySidebarItems,
  type SecretarySidebarItemId,
} from "@/constant/sidebar-items";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { readAuthUser } from "@/lib/cookies";
import { SecretaryRouteFallback } from "@/routes/RouteFallbacks";
import { useAuthStore } from "@/store/authStore";
import MotionProvider from "@/motion/MotionProvider";
import PageTransition from "@/motion/PageTransition";
import { useI18n } from "@/i18n/provider";

export default function SecretaryLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { locale, dir, t } = useI18n();

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const secretaryPermissions = useSecretaryPermissions();

  const authUser = readAuthUser();
  const secretaryName = authUser?.fullName?.trim() || t("sidebar.role.secretary");
  const secretaryEmail = authUser?.email?.trim() || "";
  const permissionsReady =
    !secretaryPermissions.isLoading && !secretaryPermissions.isPending;
  const visibleSidebarItems = useMemo(
    () =>
      !permissionsReady
        ? []
        : secretarySidebarItems.filter((item) =>
            secretaryPermissions.canAccessItem(item.path),
          ),
    [permissionsReady, secretaryPermissions.permissions],
  );

  const performLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await useAuthStore.getState().logout();
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

  const active: SecretarySidebarItemId =
    visibleSidebarItems.find(
      (item) =>
        pathname === `/secretary/${item.path}` ||
        pathname.startsWith(`/secretary/${item.path}/`),
    )?.path ?? "dashboard";

  useEffect(() => {
    if (!permissionsReady) return;
    const firstPath = visibleSidebarItems[0]?.path ?? "dashboard";
    const currentSegment = pathname.split("/")[2] as SecretarySidebarItemId | undefined;
    if (!currentSegment) return;
    if (secretaryPermissions.canAccessItem(currentSegment)) return;
    navigate(`/secretary/${firstPath}`, { replace: true });
  }, [
    navigate,
    pathname,
    permissionsReady,
    secretaryPermissions.permissions,
    visibleSidebarItems,
  ]);

  if (!permissionsReady) {
    return <SecretaryRouteFallback />;
  }

  return (
    <div
      dir={dir}
      lang={locale}
      className="h-dvh overflow-hidden bg-white scrollbar-hide"
    >
      <div className="relative mx-auto flex h-dvh w-full max-w-screen-2xl">
        <Sidebar
          role="secretary"
          active={active}
          collapsed={isSidebarCollapsed}
          mobileOpen={isMobileSidebarOpen}
          onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onLogout={() => setLogoutConfirmOpen(true)}
          profileName={secretaryName}
          profileEmail={secretaryEmail}
          items={visibleSidebarItems}
        />
        <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-40">
            <DashboardHeader
              role="secretary"
              onMenuClick={() => setIsMobileSidebarOpen(true)}
              showMessages={false}
              showUnreadBadge={false}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-white py-5 scrollbar-hide sm:py-6 lg:py-8">
            <MotionProvider>
              <PageTransition key={pathname}>
                <div className="mx-auto min-h-full w-full max-w-[1420px] px-4 pb-5 sm:px-6 sm:pb-6 lg:px-12">
                  <Suspense fallback={<SecretaryRouteFallback />}>
                    <Outlet />
                  </Suspense>
                </div>
              </PageTransition>
            </MotionProvider>
          </div>
        </main>
      </div>

      <ConfirmActionDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title={t("logout.title")}
        description={t("logout.secretary.description")}
        confirmLabel={loggingOut ? t("logout.pending") : t("common.logout")}
        confirmDisabled={loggingOut}
        cancelLabel={t("common.cancel")}
        onConfirm={performLogout}
      />
    </div>
  );
}
