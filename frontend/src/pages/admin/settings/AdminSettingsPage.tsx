import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { CloudUpload, Settings } from "lucide-react";
import { get } from "@/lib/api";
import { adminApi } from "@/lib/admin/client";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";
import { notificationsApi } from "@/lib/notifications/client";
import { useAdminAppSettings } from "@/contexts/AdminAppSettingsContext";
import { ConfirmActionDialog } from "@/components/admin/dialogs";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import SettingsField from "@/components/admin/settings/SettingsField";
import SettingsSectionCard from "@/components/admin/settings/SettingsSectionCard";
import StyledSelect from "@/components/ui/styled-select";

type SectionState = "idle" | "saved";
type SaveStates = Record<"general" | "logo", SectionState>;

type HealthResponse = {
  ok?: boolean;
  status?: string;
  storage?: string;
};

type AdminGeneralSettingsResponse = {
  platformName: string;
  lang?: "ar" | "en";
};

type AdminGeneralSettingsForm = {
  platformName: string;
  lang: "ar" | "en";
};

function normalizeGeneralSettings(
  data?: Partial<AdminGeneralSettingsResponse> | null,
): AdminGeneralSettingsForm {
  return {
    platformName: data?.platformName?.trim() || "LMJ Health",
    lang: data?.lang === "en" ? "en" : "ar",
  };
}

export default function AdminSettingsPage() {
  const { settings, setSettings } = useAdminAppSettings();
  const [confirmGeneralOpen, setConfirmGeneralOpen] = useState(false);
  const [logoConfirmOpen, setLogoConfirmOpen] = useState(false);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [saveStates, setSaveStates] = useState<SaveStates>({
    general: "idle",
    logo: "idle",
  });
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const weekRange = useMemo(() => {
    const to = new Date();
    const from = new Date(to);
    from.setDate(to.getDate() - 7);
    return { from: from.toISOString(), to: to.toISOString() };
  }, []);

  // Load general settings from localStorage on mount
  const loadGeneralSettingsFromStorage = (): AdminGeneralSettingsForm => {
    try {
      const stored = localStorage.getItem("admin_general_settings");
      if (stored) {
        return normalizeGeneralSettings(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load general settings from localStorage", e);
    }
    return normalizeGeneralSettings();
  };

  const [draftGeneral, setDraftGeneral] = useState<AdminGeneralSettingsForm>(
    loadGeneralSettingsFromStorage,
  );

  const healthQuery = useQuery({
    queryKey: ["admin", "settings", "health"],
    queryFn: () => get<HealthResponse>("/api/health", { locale: "ar" }),
    staleTime: 60_000,
    retry: 1,
  });

  const unreadNotificationsQuery = useQuery({
    queryKey: ["admin", "settings", "notifications-unread"],
    queryFn: () =>
      notificationsApi.list({
        unread_only: true,
        page: 1,
        limit: 1,
      }),
    staleTime: 20_000,
    retry: 1,
  });

  const auditSummaryQuery = useQuery({
    queryKey: [
      "admin",
      "settings",
      "audit-summary",
      weekRange.from,
      weekRange.to,
    ],
    queryFn: () =>
      adminApi.auditLogs.list({
        page: 1,
        limit: 1,
        from: weekRange.from,
        to: weekRange.to,
      }),
    staleTime: 60_000,
    retry: 1,
  });

  // Save general settings to localStorage
  const saveGeneralSettings = (settings: AdminGeneralSettingsForm) => {
    try {
      localStorage.setItem("admin_general_settings", JSON.stringify(settings));
      markSaved("general");
    } catch (e) {
      console.error("Failed to save general settings to localStorage", e);
    }
  };

  const unreadCount =
    unreadNotificationsQuery.data?.total ??
    unreadNotificationsQuery.data?.notifications?.filter((n) => !n.isRead)
      .length ??
    0;
  const weeklyAuditCount = auditSummaryQuery.data?.total ?? 0;
  const healthAwaiting = isAwaitingInitialQueryData(
    healthQuery.data,
    healthQuery.isError,
  );
  const unreadAwaiting = isAwaitingInitialQueryData(
    unreadNotificationsQuery.data,
    unreadNotificationsQuery.isError,
  );
  const auditSummaryAwaiting = isAwaitingInitialQueryData(
    auditSummaryQuery.data,
    auditSummaryQuery.isError,
  );

  function markSaved(section: keyof SaveStates) {
    setSaveStates((prev) => ({ ...prev, [section]: "saved" }));
    window.setTimeout(() => {
      setSaveStates((prev) => ({ ...prev, [section]: "idle" }));
    }, 2200);
  }

  function handleLogoPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "image/png") {
      return;
    }

    setPendingLogoFile(file);
    setLogoConfirmOpen(true);
  }

  function applyPendingLogo(): Promise<void> {
    const file = pendingLogoFile;
    if (!file) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setSettings((prev) => ({
            ...prev,
            logo: { ...prev.logo, dataUrl: result },
          }));
          markSaved("logo");
        }
        setPendingLogoFile(null);
        resolve();
      };
      reader.onerror = () => reject(new Error("فشل قراءة الملف"));
      reader.readAsDataURL(file);
    });
  }

  function triggerLogoUpload() {
    logoInputRef.current?.click();
  }

  return (
    <>
      <Helmet>
        <title>الإعدادات • {draftGeneral.platformName || "LMJ Health"}</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="min-h-[520px] bg-[#FCFDFE]">
        <div className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-2 sm:px-6 lg:px-10">
          <AdminDashboardOverview
            variant="admin"
            surface="mint"
            title="الإعدادات"
            subtitle="إدارة اسم المنصة واللغة، مع إبقاء الشعار المحلي منفصلًا مؤقتًا"
            headerIcon={<Settings className="h-8 w-8 text-white" />}
            kpiColumns={3}
            kpis={[
              {
                key: "health",
                icon: <Settings className="h-5 w-5 shrink-0" />,
                value: healthAwaiting
                  ? "…"
                  : healthQuery.isError
                    ? "غير متاح"
                    : `${healthQuery.data?.status ?? "—"}`,
                label: "حالة النظام",
              },
              {
                key: "notifications",
                icon: <CloudUpload className="h-5 w-5 shrink-0" />,
                value: unreadAwaiting ? "…" : unreadCount,
                label: "إشعارات غير مقروءة",
              },
              {
                key: "audit",
                icon: <Settings className="h-5 w-5 shrink-0" />,
                value: auditSummaryAwaiting ? "…" : weeklyAuditCount,
                label: "سجلات (7 أيام)",
              },
            ]}
          />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <SettingsSectionCard
              title="الإعدادات العامة"
              icon={Settings}
              className="xl:col-span-7"
            >
              <div className="space-y-4">
                <SettingsField
                  label="اسم المنصة"
                  value={draftGeneral.platformName}
                  onChange={(v) =>
                    setDraftGeneral((prev) => ({ ...prev, platformName: v }))
                  }
                />

                <div className="space-y-2">
                  <div className="text-right font-cairo text-[12px] font-bold text-[#344054]">
                    اللغة الافتراضية
                  </div>
                  <StyledSelect
                    value={draftGeneral.lang}
                    onChange={(value) =>
                      setDraftGeneral((prev) => ({
                        ...prev,
                        lang: value === "en" ? "en" : "ar",
                      }))
                    }
                    options={[
                      { value: "ar", label: "العربية" },
                      { value: "en", label: "English" },
                    ]}
                    size="sm"
                    tone="muted"
                  />
                </div>

                <div className="flex justify-start pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmGeneralOpen(true)}
                    className="inline-flex h-[34px] items-center gap-2 rounded-[8px] bg-primary px-5 font-cairo text-[12px] font-extrabold text-white shadow-[0_12px_24px_rgba(15,143,139,0.20)] disabled:opacity-50"
                  >
                    حفظ الإعدادات
                  </button>
                </div>
                {saveStates.general === "saved" ? (
                  <div className="text-right font-cairo text-[11px] font-semibold text-[#16A34A]">
                    تم حفظ الإعدادات العامة محليًا
                  </div>
                ) : null}
              </div>
            </SettingsSectionCard>

            <SettingsSectionCard
              title="الشعار المحلي"
              icon={CloudUpload}
              className="xl:col-span-5"
            >
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <div className="flex min-h-[96px] min-w-[96px] shrink-0 items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_14px_30px_rgba(15,143,139,0.25)]">
                  {settings.logo.dataUrl ? (
                    <img
                      src={settings.logo.dataUrl}
                      alt="App Logo"
                      className="h-[96px] w-[96px] rounded-[6px] object-cover"
                    />
                  ) : (
                    <div className="px-8 font-cairo text-[25px] font-black leading-[36px]">
                      {settings.logo.initials}
                    </div>
                  )}
                </div>
                <div className="w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={triggerLogoUpload}
                    className="inline-flex h-[36px] items-center gap-2 rounded-[8px] border border-primary bg-white px-2 font-cairo text-[12px] font-extrabold text-primary"
                  >
                    تحميل شعار جديد
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png"
                    onChange={handleLogoPick}
                    className="hidden"
                  />
                  <div className="mt-2 text-right font-cairo text-[11px] font-medium text-[#98A2B3]">
                    الحجم المفضل 512×512 • الصيغة (PNG)
                  </div>
                  {saveStates.logo === "saved" ? (
                    <div className="mt-1 text-right font-cairo text-[11px] font-semibold text-[#16A34A]">
                      تم حفظ الشعار محليًا
                    </div>
                  ) : null}
                </div>
              </div>
            </SettingsSectionCard>
          </div>
        </div>
      </div>

      <ConfirmActionDialog
        open={confirmGeneralOpen}
        onOpenChange={setConfirmGeneralOpen}
        variant="primary"
        title="تأكيد حفظ الإعدادات العامة"
        icon={<Settings className="h-6 w-6" strokeWidth={2} aria-hidden />}
        description={
          <>
            سيتم حفظ الحقول التالية محليًا:{" "}
            <span className="font-extrabold text-[#344054]">اسم المنصة</span> و
            <span className="font-extrabold text-[#344054]">اللغة</span>.
          </>
        }
        cancelLabel="ليس الآن"
        confirmLabel="نعم، احفظ"
        onConfirm={() => {
          saveGeneralSettings({
            platformName: draftGeneral.platformName.trim() || "LMJ Health",
            lang: draftGeneral.lang,
          });
        }}
        successToast={{
          title: "تم حفظ الإعدادات",
          message: "تم تحديث الإعدادات العامة محليًا بنجاح.",
          variant: "success",
        }}
      />

      <ConfirmActionDialog
        open={logoConfirmOpen}
        onOpenChange={(o) => {
          setLogoConfirmOpen(o);
          if (!o) setPendingLogoFile(null);
        }}
        variant="primary"
        title="تأكيد تغيير شعار التطبيق"
        icon={<CloudUpload className="h-6 w-6" strokeWidth={2} aria-hidden />}
        description="سيُستبدل الشعار الحالي بالصورة التي اخترتها (PNG) وسيُحفظ محليًا مؤقتًا إلى أن يتوفر له دعم backend."
        cancelLabel="إلغاء"
        confirmLabel="نعم، استخدم هذا الشعار"
        onConfirm={() => applyPendingLogo()}
        successToast={{
          title: "تم تحديث الشعار",
          message: "يظهر شعارك الجديد فورًا في واجهة الإعدادات.",
          variant: "success",
        }}
      />
    </>
  );
}
