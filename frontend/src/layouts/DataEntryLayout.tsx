import { Suspense, useCallback, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/layout/dashboard-header";
import Sidebar from "@/components/layout/sidebar";
import LogoutConfirmDialog, {
  type LogoutScope,
} from "@/components/auth/logout-confirm-dialog";
import { useToast } from "@/components/ui/ToastProvider";
import {
  dataEntrySidebarItems,
  type DataEntrySidebarItemId,
} from "@/constant/sidebar-items";
import { readAuthUser } from "@/lib/cookies";
import { SecretaryRouteFallback } from "@/routes/RouteFallbacks";
import { useAuthStore } from "@/store/authStore";

export default function DataEntryLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const authUser = readAuthUser();
  const profileName = useMemo(() => {
    return authUser?.fullName?.trim() || "مدخل البيانات";
  }, [authUser?.fullName]);
  const profileEmail = authUser?.email?.trim() || "";

  const performLogout = useCallback(
    async (scope: LogoutScope) => {
      setLoggingOut(true);
      try {
        await useAuthStore.getState().logout({ scope });
        toast("نراك في زيارة قادمة.", {
          title: "تم تسجيل الخروج",
          variant: "success",
        });
        navigate("/login", { replace: true });
      } catch {
        toast("تعذّر إتمام تسجيل الخروج الآن. حاول مرة أخرى.", {
          title: "فشل تسجيل الخروج",
          variant: "error",
        });
        throw new Error("logout_failed");
      } finally {
        setLoggingOut(false);
      }
    },
    [navigate, toast],
  );

  const pathname = location.pathname;

  const active: DataEntrySidebarItemId =
    dataEntrySidebarItems.find(
      (item) =>
        pathname === `/data-entry/${item.path}`
        || pathname.startsWith(`/data-entry/${item.path}/`),
    )?.path ?? "dashboard";

  return (
    <div className="h-dvh overflow-hidden bg-white scrollbar-hide">
      <div className="relative mx-auto flex h-dvh w-full max-w-screen-2xl">
        <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-40">
            <DashboardHeader
              role="data-entry"
              title="لوحة إدخال البيانات"
              onMenuClick={() => setIsMobileSidebarOpen(true)}
              showMessages={false}
              showUnreadBadge={false}
              showNotifications={false}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-white py-5 scrollbar-hide sm:py-6 lg:py-8">
            <Suspense fallback={<SecretaryRouteFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </main>

        <Sidebar
          role="data-entry"
          active={active}
          collapsed={false}
          mobileOpen={isMobileSidebarOpen}
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
