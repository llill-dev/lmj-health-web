import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardHeader from "@/components/layout/dashboard-header";
import { renderWithProviders } from "@/test/renderWithProviders";

vi.mock("@/hooks/doctor/notifications/useDoctorNotifications", () => ({
  useDoctorUnreadNotificationCount: () => ({
    data: 0,
    isAwaitingData: false,
  }),
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (state: { user: { name: string } }) => unknown) =>
    selector({ user: { name: "أحمد علي" } }),
}));

vi.mock("@/i18n/provider", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/i18n/provider")>();

  return {
    ...actual,
    useI18n: () => ({
      dir: "rtl",
      locale: "ar",
      t: (key: string, fallback?: string) => {
        const messages: Record<string, string> = {
          "dashboard.title.default": "لوحة التحكم",
          "doctor.dashboard.guest": "الطبيب",
          "secretary.dashboard.defaultName": "السكرتارية",
          "dataEntry.dashboard.defaultName": "مدخل البيانات",
          "doctor.badge": "د.",
          "doctor.dashboard.subtitle": "متابعة المرضى والمواعيد",
          "secretary.dashboard.subtitle": "إدارة الحجوزات والمرضى",
          "dataEntry.dashboard.subtitle": "إدارة المحتوى الطبي",
          "common.openMenu": "فتح القائمة",
          "common.connected": "متصل",
          "header.notifications": "الإشعارات",
          "header.messages": "الرسائل",
          "header.backToSection": "العودة إلى {section}",
        };
        return messages[key] ?? fallback ?? key;
      },
    }),
  };
});

vi.mock("@/components/ui/language-switcher", () => ({
  default: () => <div>language-switcher</div>,
}));

describe("DashboardHeader", () => {
  it("renders the section back link when provided", () => {
    renderWithProviders(
      <DashboardHeader
        role="doctor"
        title="المواعيد"
        onMenuClick={vi.fn()}
        showMessages={false}
        showNotifications={false}
        showUnreadBadge={false}
        backLink={{ href: "/doctor/appointments", label: "المواعيد" }}
      />,
    );

    const backLink = screen.getByRole("link", { name: "العودة إلى المواعيد" });

    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/doctor/appointments");
  });
});
