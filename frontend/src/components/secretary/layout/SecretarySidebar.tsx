"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Stethoscope, X } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  secretarySidebarItems,
  type SecretarySidebarItemId,
} from "@/constant/sidebar-items";
import { useI18n } from "@/i18n/provider";

interface SecretarySidebarProps {
  active: SecretarySidebarItemId;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  profileName: string;
  profileEmail: string;
}

export default function SecretarySidebar({
  active,
  mobileOpen,
  onCloseMobile,
  onLogout,
  profileName,
  profileEmail,
}: SecretarySidebarProps) {
  const { locale, dir, t } = useI18n();
  const secretaryInitial =
    profileName.charAt(0).toUpperCase() || (locale === "ar" ? "س" : "S");

  const resolvedActive = active ?? "dashboard";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px] transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseMobile}
        aria-hidden={!mobileOpen}
      />

      <aside
        dir={dir}
        lang={locale}
        className={`fixed inset-y-0 start-0 z-50 flex h-dvh w-[min(20rem,calc(100vw-1rem))] max-w-full shrink-0 flex-col overflow-hidden border-[1.82px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_18px_48px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-in-out will-change-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 lg:shadow-none lg:w-[320px] ${
          mobileOpen
            ? "translate-x-0"
            : "ltr:-translate-x-full rtl:translate-x-full"
        }`}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b-[1.82px] border-b-[#E5E7EB] px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5 lg:px-[24px] lg:pb-[24px] lg:pt-[24px]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  key="brand"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex items-center gap-2"
                >
                  <div className="mt-0.5 flex h-[44px] w-[44px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-primary shadow-[0_14px_30px_rgba(15,143,139,0.30)]">
                    <Stethoscope className="h-6 w-6 text-white" aria-hidden />
                  </div>
                  <div className="flex min-w-0 flex-col items-center text-center">
                    <div className="max-w-[200px] truncate font-cairo text-[18px] font-extrabold leading-[20px] text-[#111827]">
                      LMJ HEALTH
                    </div>
                    <div className="mt-1 max-w-[220px] line-clamp-2 font-cairo text-[12px] font-bold leading-[14px] text-primary">
                      {t("secretary.sidebar.portal")}
                    </div>
                  </div>
                </motion.div>
              </div>

              <button
                type="button"
                onClick={onCloseMobile}
                className="mt-1 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7] lg:hidden"
                aria-label={t("common.closeMenu")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <motion.div
              key="profile"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden rounded-[6px] border border-[#BFEDEC] bg-[#F2FFFE] px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-[6px] bg-primary text-white shadow-[0_12px_25px_rgba(15,143,139,0.30)]">
                  <span className="font-cairo text-[18px] font-extrabold leading-none">
                    {secretaryInitial}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-start font-cairo text-[14px] font-extrabold leading-[18px] text-[#111827]">
                    {profileName}
                  </div>
                  <div className="mt-1 text-start font-cairo text-[12px] font-medium leading-[16px] text-[#667085]">
                    {profileEmail}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 scrollbar-hide sm:p-4 lg:p-[15.99px]">
            <div className="space-y-1">
              {secretarySidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path === resolvedActive;

                return (
                  <Link
                    key={item.path}
                    to={`/secretary/${item.path}`}
                    onClick={onCloseMobile}
                    className={
                      isActive
                        ? "relative flex w-full items-center rounded-[6px] bg-primary px-4 py-[10px] text-white shadow-[0_12px_24px_rgba(15,143,139,0.30)]"
                        : "relative flex w-full items-center rounded-[6px] px-4 py-[10px] text-[#344054] hover:bg-[#F2F4F7]"
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={
                          isActive
                            ? "h-[18px] w-[18px] text-white"
                            : "h-[18px] w-[18px] text-[#4A5565]"
                        }
                      />
                      <span
                        className={
                          isActive
                            ? "font-cairo text-[16px] font-extrabold leading-[24px] text-white"
                            : "font-cairo text-[16px] font-bold leading-[24px] text-[#4A5565]"
                        }
                      >
                        {item.label}
                      </span>
                    </div>

                    {typeof item.badge === "number" ? (
                      <div
                        className={
                          isActive
                            ? "ms-auto flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-white px-2 font-cairo text-[12px] font-extrabold text-primary shadow-[0_10px_20px_rgba(0,0,0,0.10)]"
                            : "ms-auto flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-primary px-2 font-cairo text-[12px] font-extrabold text-white shadow-[0_10px_20px_rgba(15,143,139,0.25)]"
                        }
                      >
                        {item.badge}
                      </div>
                    ) : (
                      <span className="ms-auto w-6" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t-[1.82px] border-t-[#E5E7EB] px-4 py-4 lg:h-[69.8px] lg:px-[16px] lg:py-[17.81px]">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-start gap-2 font-cairo text-[14px] font-extrabold text-[#E11D48] hover:text-[#BE123C]"
            >
              <LogOut className="h-4 w-4" />
              {t("common.logout")}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
