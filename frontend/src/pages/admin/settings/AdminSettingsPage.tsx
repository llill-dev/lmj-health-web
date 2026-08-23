import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CloudUpload, Settings } from "lucide-react";
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
import { useI18n } from "@/i18n/provider";

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
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);

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
    queryFn: () => get<HealthResponse>("/api/health", { locale }),
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
      reader.onerror = () => reject(new Error(tr("فشل قراءة الملف", "Failed to read the file")));
      reader.readAsDataURL(file);
    });
  }

  function triggerLogoUpload() {
    logoInputRef.current?.click();
  }

  return (
    <>
      <Helmet>
        <title>
          {tr("الإعدادات", "Settings")} • {draftGeneral.platformName || "LMJ Health"}
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="min-h-[520px] bg-[#FCFDFE]">
        <div className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-2 sm:px-6 lg:px-10">
          <AdminDashboardOverview
            variant="admin"
            surface="mint"
            title={tr("الإعدادات", "Settings")}
            subtitle={tr(
              "إدارة اسم المنصة واللغة، مع إبقاء الشعار المحلي منفصلًا مؤقتًا",
              "Manage platform name and language while keeping local logo settings temporary",
            )}
            headerIcon={<Settings className="h-8 w-8 text-white" />}
            kpiColumns={3}
            kpis={[
              {
                key: "health",
                icon: <Settings className="h-5 w-5 shrink-0" />,
                value: healthAwaiting
                  ? "…"
                  : healthQuery.isError
                    ? tr("غير متاح", "Unavailable")
                    : `${healthQuery.data?.status ?? "—"}`,
                label: tr("حالة النظام", "System health"),
              },
              {
                key: "notifications",
                icon: <CloudUpload className="h-5 w-5 shrink-0" />,
                value: unreadAwaiting ? "…" : unreadCount,
                label: tr("إشعارات غير مقروءة", "Unread notifications"),
              },
              {
                key: "audit",
                icon: <Settings className="h-5 w-5 shrink-0" />,
                value: auditSummaryAwaiting ? "…" : weeklyAuditCount,
                label: tr("سجلات (7 أيام)", "Logs (7 days)"),
              },
            ]}
          />

          <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] px-4 py-3 text-start">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#175CD3]" />
            <div className="font-cairo text-sm font-semibold leading-6 text-[#175CD3]">
              {tr(
                "هذه الشاشة مخصّصة للإعدادات المحلية الظاهرة في لوحة الإدارة فقط. اسم المنصة واللغة والشعار هنا تُحفظ محليًا مؤقتًا، وليست بديلاً عن إعدادات backend العامة عند توفرها.",
                "This page is for local admin-facing settings only. The platform name, language, and logo here are saved locally for now and do not replace backend-managed global settings when available.",
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <SettingsSectionCard
              title={tr("الإعدادات العامة", "General settings")}
              icon={Settings}
              className="xl:col-span-7"
            >
              <div className="space-y-4">
                <SettingsField
                  label={tr("اسم المنصة", "Platform name")}
                  value={draftGeneral.platformName}
                  onChange={(v) =>
                    setDraftGeneral((prev) => ({ ...prev, platformName: v }))
                  }
                />

                <div className="space-y-2">
                  <div className="text-start font-cairo text-sm font-bold text-[#344054]">
                    {tr("اللغة الافتراضية", "Default language")}
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
                    className="inline-flex h-[36px] items-center gap-2 rounded-[8px] bg-primary px-5 font-cairo text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(15,143,139,0.20)] disabled:opacity-50"
                  >
                    {tr("حفظ الإعدادات", "Save settings")}
                  </button>
                </div>
                {saveStates.general === "saved" ? (
                  <div className="text-start font-cairo text-[12px] font-semibold text-[#16A34A]">
                    {tr(
                      "تم حفظ الإعدادات العامة محليًا",
                      "General settings saved locally",
                    )}
                  </div>
                ) : null}
              </div>
            </SettingsSectionCard>

            <SettingsSectionCard
              title={tr("الشعار المحلي", "Local logo")}
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
                    className="inline-flex h-[36px] items-center gap-2 rounded-[8px] border border-primary bg-white px-3 font-cairo text-sm font-extrabold text-primary"
                  >
                    {tr("تحميل شعار جديد", "Upload new logo")}
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png"
                    onChange={handleLogoPick}
                    className="hidden"
                  />
                  <div className="mt-2 text-start font-cairo text-[12px] font-medium text-[#98A2B3]">
                    {tr(
                      "الحجم المفضل 512×512 • الصيغة (PNG)",
                      "Preferred size 512×512 • format (PNG)",
                    )}
                  </div>
                  {saveStates.logo === "saved" ? (
                    <div className="mt-1 text-start font-cairo text-[12px] font-semibold text-[#16A34A]">
                      {tr("تم حفظ الشعار محليًا", "Logo saved locally")}
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
        title={tr("تأكيد حفظ الإعدادات العامة", "Confirm saving general settings")}
        icon={<Settings className="h-6 w-6" strokeWidth={2} aria-hidden />}
        description={
          <>
            {tr("سيتم حفظ الحقول التالية محليًا:", "The following fields will be saved locally:")}{" "}
            <span className="font-extrabold text-[#344054]">
              {tr("اسم المنصة", "Platform name")}
            </span>{" "}
            {tr("و", "and")}{" "}
            <span className="font-extrabold text-[#344054]">{tr("اللغة", "language")}</span>.
          </>
        }
        cancelLabel={tr("ليس الآن", "Not now")}
        confirmLabel={tr("نعم، احفظ", "Yes, save")}
        onConfirm={() => {
          saveGeneralSettings({
            platformName: draftGeneral.platformName.trim() || "LMJ Health",
            lang: draftGeneral.lang,
          });
        }}
        successToast={{
          title: tr("تم حفظ الإعدادات", "Settings saved"),
          message: tr(
            "تم تحديث الإعدادات العامة محليًا بنجاح.",
            "General settings updated locally successfully.",
          ),
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
        title={tr("تأكيد تغيير شعار التطبيق", "Confirm app logo change")}
        icon={<CloudUpload className="h-6 w-6" strokeWidth={2} aria-hidden />}
        description={tr(
          "سيُستبدل الشعار الحالي بالصورة التي اخترتها (PNG) وسيُحفظ محليًا مؤقتًا إلى أن يتوفر له دعم backend.",
          "The current logo will be replaced with your selected PNG and saved locally until backend support is available.",
        )}
        cancelLabel={tr("إلغاء", "Cancel")}
        confirmLabel={tr("نعم، استخدم هذا الشعار", "Yes, use this logo")}
        onConfirm={() => applyPendingLogo()}
        successToast={{
          title: tr("تم تحديث الشعار", "Logo updated"),
          message: tr(
            "يظهر شعارك الجديد فورًا في واجهة الإعدادات.",
            "Your new logo appears immediately in settings.",
          ),
          variant: "success",
        }}
      />
    </>
  );
}
