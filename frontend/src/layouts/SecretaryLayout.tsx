import { Suspense, useCallback, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/sidebar";
import DashboardHeader from "@/components/layout/dashboard-header";
import ConfirmActionDialog from "@/components/doctor/confirm-action-dialog";
import { useToast } from "@/components/ui/ToastProvider";
import {
  secretarySidebarItems,
  type SecretarySidebarItemId,
} from "@/constant/sidebar-items";
import { readAuthUser } from "@/lib/cookies";
import { SecretaryRouteFallback } from "@/routes/RouteFallbacks";
import { useAuthStore } from "@/store/authStore";

export default function SecretaryLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const authUser = readAuthUser();
  const secretaryName = authUser?.fullName?.trim() || "السكرتير";
  const secretaryEmail = authUser?.email?.trim() || "";

  const performLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await useAuthStore.getState().logout();
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
  }, [navigate, toast]);

  const pathname = location.pathname;

  const active: SecretarySidebarItemId =
    secretarySidebarItems.find(
      (item) =>
        pathname === `/secretary/${item.path}` ||
        pathname.startsWith(`/secretary/${item.path}/`),
    )?.path ?? "dashboard";

  return (
    <div
      dir="rtl"
      lang="ar"
      className="h-dvh overflow-hidden bg-white scrollbar-hide"
    >
      <div className="relative mx-auto flex h-dvh w-full max-w-screen-2xl">
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
            <Suspense fallback={<SecretaryRouteFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </main>

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
        />
      </div>

      <ConfirmActionDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="تأكيد تسجيل الخروج"
        description="سيتم إنهاء جلستك الحالية وإعادتك إلى صفحة تسجيل الدخول. إذا كنت لا تزال بحاجة إلى العمل، اختر إلغاء."
        confirmLabel={loggingOut ? "جاري تسجيل الخروج…" : "تسجيل الخروج"}
        confirmDisabled={loggingOut}
        onConfirm={performLogout}
      />
    </div>
  );
}
