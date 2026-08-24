"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronsRight, LogOut, Stethoscope, X } from "lucide-react";
import { type ComponentType, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  adminSidebarItems,
  dataEntrySidebarItems,
  sidebarItems,
  secretarySidebarItems,
  type AdminSidebarItemId,
  type DataEntrySidebarItemId,
  type SecretarySidebarItemId,
  type SidebarItemId,
} from "@/constant/sidebar-items";
import { useAdminBrandingForSidebar } from "@/contexts/AdminAppSettingsContext";
import { useI18n } from "@/i18n/provider";

type SidebarNavItem = {
  id: string;
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
  href?: string;
};

function localizedSidebarLabel(
  itemId: string,
  fallbackLabel: string,
  locale: "ar" | "en",
  t: (key: string, fallback?: string) => string,
): string {
  // Keep existing Arabic-first labels in Arabic mode.
  if (locale === "ar") return fallbackLabel;
  return t(`sidebar.item.${itemId}`, fallbackLabel);
}

export default function Sidebar({
  active,
  role = "doctor",
  collapsed = false,
  mobileOpen = false,
  onToggleCollapse,
  onCloseMobile,
  onLogout,
  profileName,
  profileEmail,
  profilePhotoUrl,
  items,
}: {
  active?:
    | SidebarItemId
    | AdminSidebarItemId
    | SecretarySidebarItemId
    | DataEntrySidebarItemId;
  role?: "doctor" | "admin" | "secretary" | "data-entry";
  collapsed?: boolean;
  mobileOpen?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  onLogout?: () => void;
  profileName?: string;
  profileEmail?: string;
  profilePhotoUrl?: string | null;
  items?: SidebarNavItem[];
}) {
  const { locale, dir, t } = useI18n();
  const navItems = useMemo(() => {
    if (items?.length) return items;
    if (role === "admin") return adminSidebarItems;
    if (role === "secretary") return secretarySidebarItems;
    if (role === "data-entry") return dataEntrySidebarItems;
    return sidebarItems;
  }, [items, role]);

  const adminBranding = useAdminBrandingForSidebar();
  const brandTitle =
    role === "admin"
      ? adminBranding.appName.trim() || "LMJ HEALTH"
      : "LMJ HEALTH";
  const brandSubtitle =
    role === "admin"
      ? adminBranding.appDescription.trim() || t("sidebar.brand.adminPortal")
      : role === "secretary"
        ? t("sidebar.brand.secretaryPortal")
        : role === "data-entry"
          ? t("sidebar.brand.dataEntryPortal")
          : t("sidebar.brand.doctorPortal");

  const basePath =
    role === "admin"
      ? "/admin"
      : role === "secretary"
        ? "/secretary"
        : role === "data-entry"
          ? "/data-entry"
          : "/doctor";
  const displayName =
    profileName?.trim() ||
    (role === "secretary"
      ? t("sidebar.role.secretary")
      : role === "data-entry"
        ? t("sidebar.role.data-entry")
        : t("sidebar.role.doctor"));
  const displayEmail = profileEmail?.trim() || "—";
  const displayInitial = displayName.charAt(0).toUpperCase() || "L";

  const resolvedActive =
    (active as
      | (
          | SidebarItemId
          | AdminSidebarItemId
          | SecretarySidebarItemId
          | DataEntrySidebarItemId
        )
      | undefined) ?? (role === "admin" ? "overview" : "dashboard");

  const desktopWidthClass = collapsed ? "lg:w-[88px]" : "lg:w-[320px]";
  const desktopOrderClass = "lg:order-first";
  const mobileAnchorClass = locale === "ar" ? "end-0" : "start-0";
  const mobileClosedTransform =
    locale === "ar" ? "translate-x-full" : "-translate-x-full";
  const expanded = !collapsed || mobileOpen;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px] transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseMobile}
        aria-hidden={!mobileOpen}
      />

      <aside
        dir={dir}
        lang={locale}
        className={`fixed inset-y-0 ${mobileAnchorClass} z-50 flex h-dvh w-[min(20rem,calc(100vw-1rem))] max-w-full shrink-0 flex-col overflow-hidden border-[1.82px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_18px_48px_rgba(15,23,42,0.18)] transition-[transform,width] duration-300 ease-in-out will-change-[transform,width] lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 lg:shadow-none ${desktopWidthClass} ${desktopOrderClass} ${
          mobileOpen ? "translate-x-0" : mobileClosedTransform
        }`}
      >
        <div className="flex flex-col h-full min-h-0">
          <div
            className={
              collapsed
                ? "border-b-[1.82px] border-b-[#E5E7EB] px-[16px] pb-[16px] pt-[16px]"
                : "border-b-[1.82px] border-b-[#E5E7EB] px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5 lg:px-[24px] lg:pb-[24px] lg:pt-[24px]"
            }
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-2 items-center">
                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.div
                      key="brand"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="flex gap-2 items-center"
                    >
                      <div className="mt-0.5 flex h-[44px] w-[44px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-primary shadow-[0_14px_30px_rgba(15,143,139,0.30)]">
                        {role === "admin" && adminBranding.logo.dataUrl ? (
                          <img
                            src={adminBranding.logo.dataUrl}
                            alt=""
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Stethoscope
                            className="w-6 h-6 text-white"
                            aria-hidden
                          />
                        )}
                      </div>
                      <div className="flex flex-col items-center min-w-0 text-center">
                        <div className="max-w-[200px] truncate font-cairo text-[18px] font-extrabold leading-[20px] text-[#111827]">
                          {brandTitle}
                        </div>
                        <div
                          className="mt-1 max-w-[220px] line-clamp-2 font-cairo text-[12px] font-bold leading-[14px] text-primary"
                          title={brandSubtitle}
                        >
                          {brandSubtitle}
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="mt-1 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7] lg:hidden"
                  aria-label={t("common.closeSidebar")}
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="mt-1 hidden h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7] lg:flex"
                  aria-label={
                    collapsed
                      ? t("common.expandSidebar")
                      : t("common.collapseSidebar")
                  }
                >
                  <ChevronsRight
                    className={collapsed ? "w-5 h-5 rotate-180" : "w-5 h-5"}
                  />
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden rounded-[6px] border border-[#BFEDEC] bg-[#F2FFFE] px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex gap-3 items-center">
                    <div className="flex h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-[6px] bg-primary text-white shadow-[0_12px_25px_rgba(15,143,139,0.30)]">
                      {role === "admin" && adminBranding.logo.dataUrl ? (
                        <img
                          src={adminBranding.logo.dataUrl}
                          alt=""
                          className="object-cover w-full h-full"
                        />
                      ) : role === "doctor" && profilePhotoUrl ? (
                        <img
                          src={profilePhotoUrl}
                          alt={displayName}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="font-cairo text-[18px] font-extrabold leading-none">
                          {role === "admin"
                            ? adminBranding.appName.trim().charAt(0) || "A"
                            : displayInitial}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-start font-cairo text-[14px] font-extrabold leading-[18px] text-[#111827]">
                        {role === "admin"
                          ? t("sidebar.role.admin")
                          : displayName}
                      </div>
                      <div className="mt-1 text-start font-cairo text-[12px] font-medium leading-[16px] text-[#667085]">
                        {role === "admin"
                          ? t("sidebar.admin.emailDefault")
                          : role === "data-entry" && displayEmail === "—"
                            ? t("sidebar.dataEntry.emailDefault")
                            : displayEmail}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <nav
            className={
              collapsed
                ? "flex-1 overflow-y-auto p-3 scrollbar-hide"
                : "flex-1 overflow-y-auto p-3 scrollbar-hide sm:p-4 lg:p-[15.99px]"
            }
          >
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path === resolvedActive;
                const itemHref =
                  "href" in item && typeof item.href === "string"
                    ? item.href
                    : `${basePath}/${item.path}`;

                return (
                  <Link
                    key={item.path}
                    to={itemHref}
                    onClick={onCloseMobile}
                    className={
                      isActive
                        ? collapsed
                          ? "relative flex w-full items-center justify-center rounded-[10px] bg-primary px-3 py-3 text-white shadow-[0_12px_24px_rgba(15,143,139,0.30)]"
                          : "relative flex w-full items-center rounded-[6px] bg-primary px-4 py-[10px] text-white shadow-[0_12px_24px_rgba(15,143,139,0.30)]"
                        : collapsed
                          ? "relative flex w-full items-center justify-center rounded-[10px] px-3 py-3 text-[#344054] hover:bg-[#F2F4F7]"
                          : "relative flex w-full items-center rounded-[6px] px-4 py-[10px] text-[#344054] hover:bg-[#F2F4F7]"
                    }
                  >
                    <div
                      className={
                        collapsed
                          ? "flex gap-3 items-center"
                          : "flex gap-3 items-center"
                      }
                    >
                      <Icon
                        className={
                          isActive
                            ? "h-[18px] w-[18px] text-white"
                            : "h-[18px] w-[18px] text-[#4A5565]"
                        }
                      />
                      {expanded ? (
                        <span
                          className={
                            isActive
                              ? "font-cairo text-[16px] font-extrabold leading-[24px] text-white"
                              : "font-cairo text-[16px] font-bold leading-[24px] text-[#4A5565]"
                          }
                        >
                          {localizedSidebarLabel(
                            item.id,
                            item.label,
                            locale,
                            t,
                          )}
                        </span>
                      ) : null}
                    </div>

                    {expanded && typeof item.badge === "number" ? (
                      <div
                        className={
                          isActive
                            ? "ms-auto flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-white px-2 font-cairo text-[12px] font-extrabold text-primary shadow-[0_10px_20px_rgba(0,0,0,0.10)]"
                            : "ms-auto flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-primary px-2 font-cairo text-[12px] font-extrabold text-white shadow-[0_10px_20px_rgba(15,143,139,0.25)]"
                        }
                      >
                        {item.badge}
                      </div>
                    ) : expanded ? (
                      <span className="w-6 ms-auto" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div
            className={
              collapsed
                ? "border-t-[1.82px] border-t-[#E5E7EB] p-3"
                : "border-t-[1.82px] border-t-[#E5E7EB] px-4 py-4 lg:h-[69.8px] lg:px-[16px] lg:py-[17.81px]"
            }
          >
            <button
              type="button"
              onClick={onLogout}
              className={
                collapsed
                  ? "flex w-full items-center justify-center rounded-[10px] p-3 text-[#E11D48] hover:bg-[#FFF1F2] hover:text-[#BE123C]"
                  : "flex w-full items-center justify-start gap-2 font-cairo text-[14px] font-extrabold text-[#E11D48] hover:text-[#BE123C]"
              }
            >
              <LogOut className="w-4 h-4" />
              {expanded ? t("common.logout") : null}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
