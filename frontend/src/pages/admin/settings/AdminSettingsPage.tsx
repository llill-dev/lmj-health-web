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
  const { t, locale, dir, setLocale } = useI18n();

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

  // Load general settings from localStorage on mount; the language field
  // always reflects the app's actual active locale, not a stale copy.
  const loadGeneralSettingsFromStorage = (): AdminGeneralSettingsForm => {
    try {
      const stored = localStorage.getItem("admin_general_settings");
      if (stored) {
        return { ...normalizeGeneralSettings(JSON.parse(stored)), lang: locale };
      }
    } catch (e) {
      console.error("Failed to load general settings from localStorage", e);
    }
    return { ...normalizeGeneralSettings(), lang: locale };
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

  // Save general settings to localStorage and apply the selected language.
  const saveGeneralSettings = (settings: AdminGeneralSettingsForm) => {
    try {
      localStorage.setItem("admin_general_settings", JSON.stringify(settings));
      markSaved("general");
    } catch (e) {
      console.error("Failed to save general settings to localStorage", e);
    }
    setLocale(settings.lang);
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
      reader.onerror = () =>
        reject(new Error(t("admin.settings.error.fileRead")));
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
          {t("admin.settings.page.title")} •{" "}
          {draftGeneral.platformName || "LMJ Health"}
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="min-h-[520px] bg-[#FCFDFE]">
        <div className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-2 sm:px-6 lg:px-10">
          <AdminDashboardOverview
            variant="admin"
            surface="mint"
            title={t("admin.settings.overview.title")}
            subtitle={t("admin.settings.overview.subtitle")}
            headerIcon={<Settings className="h-8 w-8 text-white" />}
            kpiColumns={3}
            kpis={[
              {
                key: "health",
                icon: <Settings className="h-5 w-5 shrink-0" />,
                value: healthAwaiting
                  ? "…"
                  : healthQuery.isError
                    ? t("admin.settings.kpi.unavailable")
                    : `${healthQuery.data?.status ?? "—"}`,
                label: t("admin.settings.kpi.health"),
              },
              {
                key: "notifications",
                icon: <CloudUpload className="h-5 w-5 shrink-0" />,
                value: unreadAwaiting ? "…" : unreadCount,
                label: t("admin.settings.kpi.notifications"),
              },
              {
                key: "audit",
                icon: <Settings className="h-5 w-5 shrink-0" />,
                value: auditSummaryAwaiting ? "…" : weeklyAuditCount,
                label: t("admin.settings.kpi.logs"),
              },
            ]}
          />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <SettingsSectionCard
              title={t("admin.settings.section.general")}
              icon={Settings}
              className="xl:col-span-7"
            >
              <div className="space-y-4">
                <SettingsField
                  label={t("admin.settings.general.platformName")}
                  value={draftGeneral.platformName}
                  onChange={(v) =>
                    setDraftGeneral((prev) => ({ ...prev, platformName: v }))
                  }
                />

                <div className="space-y-2">
                  <div className="text-start font-cairo text-sm font-bold text-[#344054]">
                    {t("admin.settings.general.defaultLanguage")}
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
                    {t("admin.settings.general.save")}
                  </button>
                </div>
                {saveStates.general === "saved" ? (
                  <div className="text-start font-cairo text-[12px] font-semibold text-[#16A34A]">
                    {t("admin.settings.general.saved")}
                  </div>
                ) : null}
              </div>
            </SettingsSectionCard>

            <SettingsSectionCard
              title={t("admin.settings.section.logo")}
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
                    {t("admin.settings.logo.upload")}
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png"
                    onChange={handleLogoPick}
                    className="hidden"
                  />
                  <div className="mt-2 text-start font-cairo text-[12px] font-medium text-[#98A2B3]">
                    {t("admin.settings.logo.format")}
                  </div>
                  {saveStates.logo === "saved" ? (
                    <div className="mt-1 text-start font-cairo text-[12px] font-semibold text-[#16A34A]">
                      {t("admin.settings.logo.saved")}
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
        title={t("admin.settings.confirm.generalTitle")}
        icon={<Settings className="h-6 w-6" strokeWidth={2} aria-hidden />}
        description={
          <>
            {t("admin.settings.confirm.generalDescription")}{" "}
            <span className="font-extrabold text-[#344054]">
              {t("admin.settings.confirm.platformName")}
            </span>{" "}
            {t("admin.settings.confirm.and")}{" "}
            <span className="font-extrabold text-[#344054]">
              {t("admin.settings.confirm.language")}
            </span>
            .
          </>
        }
        cancelLabel={t("admin.settings.confirm.cancel")}
        confirmLabel={t("admin.settings.confirm.save")}
        onConfirm={() => {
          saveGeneralSettings({
            platformName: draftGeneral.platformName.trim() || "LMJ Health",
            lang: draftGeneral.lang,
          });
        }}
        successToast={{
          title: t("admin.settings.toast.settingsSaved"),
          message: t("admin.settings.toast.settingsMessage"),
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
        title={t("admin.settings.confirm.logoTitle")}
        icon={<CloudUpload className="h-6 w-6" strokeWidth={2} aria-hidden />}
        description={t("admin.settings.confirm.logoDescription")}
        cancelLabel={t("admin.settings.confirm.cancel")}
        confirmLabel={t("admin.settings.confirm.useLogo")}
        onConfirm={() => applyPendingLogo()}
        successToast={{
          title: t("admin.settings.toast.logoUpdated"),
          message: t("admin.settings.toast.logoMessage"),
          variant: "success",
        }}
      />
    </>
  );
}
