"use client";

import { Bell, Menu } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from "@/i18n/provider";

const greetingWord = (locale: string): string => {
  const h = new Date().getHours();
  if (locale === "ar") {
    if (h >= 5 && h < 12) return "صباح الخير";
    if (h >= 12 && h < 17) return "طاب يومك";
    if (h >= 17 && h < 23) return "مساء الخير";
    return "أهلاً بك";
  }
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 23) return "Good evening";
  return "Welcome";
};

const initialsFromName = (name: string, fallback: string): string => {
  const t = name.trim();
  if (!t) return fallback;
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return `${a}${b}`.toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
};

interface SecretaryHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function SecretaryHeader({
  onMenuClick,
  title,
}: SecretaryHeaderProps) {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const resolvedTitle = title ?? tr("لوحة السكرتير", "Secretary dashboard");

  const displayName = useMemo(() => {
    const n = user?.name?.trim();
    if (n) return n;
    return tr("السكرتير", "Secretary");
  }, [user?.name, locale]);

  const initials = useMemo(
    () =>
      initialsFromName(
        user?.name?.trim() ?? "",
        locale === "ar" ? "س" : "S",
      ),
    [user?.name, locale],
  );

  const greeting = greetingWord(locale);

  const handleNotificationsClick = () => {
    navigate("/secretary/notifications");
  };

  return (
    <header
      dir={dir}
      lang={locale}
      className="w-full px-4 pb-3 pt-3 sm:px-6 lg:px-12"
    >
      <div className="mx-auto max-w-[1420px]">
        <div className="relative overflow-hidden rounded-[18px] border border-white/70 bg-gradient-to-br from-[#e8faf8] via-white to-[#f0fdf9] shadow-[0_14px_36px_-14px_rgba(15,143,139,0.2),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.45]"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(circle at 14% 40%, rgba(15,143,139,0.12), transparent 38%), radial-gradient(circle at 88% 30%, rgba(20,184,166,0.1), transparent 36%)",
            }}
          />
          <div
            className="pointer-events-none absolute -start-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[#14b8a6]/18 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -end-12 top-0 h-28 w-28 rounded-full bg-[#0f766e]/12 blur-2xl"
            aria-hidden
          />

          <div className="relative flex min-h-[80px] items-center gap-3 px-4 py-2.5 sm:min-h-[84px] sm:gap-5 sm:px-6 sm:py-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/85 bg-white/90 text-primary shadow-[0_8px_20px_rgba(15,23,42,0.06)] backdrop-blur-md transition hover:border-primary/22 hover:bg-white hover:shadow-[0_10px_24px_rgba(15,143,139,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
              aria-label="فتح القائمة"
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={2.25} />
            </button>

            <div className="flex min-h-0 min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[16px] bg-gradient-to-br from-[#0f766e] via-[#0f8f8b] to-[#14b8a6] font-cairo text-[15px] font-black tracking-wide text-white shadow-[0_12px_28px_rgba(15,143,139,0.32)] ring-2 ring-white/95 sm:h-[56px] sm:w-[56px] sm:rounded-[18px] sm:text-[16px]">
                  {initials}
                </div>
                <span
                  className="absolute -bottom-px -left-px h-3 w-3 rounded-full border-2 border-white bg-emerald-400 shadow-sm"
                  aria-hidden
                  title="متصل"
                />
              </div>

              <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-1 text-start">
                <div className="flex min-w-0 flex-wrap items-center justify-start gap-x-2 gap-y-0.5">
                  <h1 className="max-w-full truncate font-cairo text-[16px] font-black leading-tight text-[#0f172a] sm:text-[17px]">
                    {displayName}
                  </h1>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/18 bg-white/80 px-2.5 py-0.5 font-cairo text-[10px] font-bold text-primary shadow-sm backdrop-blur-sm sm:text-[11px]">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                    {resolvedTitle}
                  </span>
                </div>
                <p className="line-clamp-1 font-cairo text-[11px] font-semibold leading-snug text-[#64748b] sm:text-[12px]">
                  <span>{greeting}</span>
                  <span className="mx-1.5 text-[#cbd5e1]" aria-hidden>
                    ·
                  </span>
                  <span className="text-[#94a3b8]">إدارة المواعيد والمرضى</span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 border-e border-[#e2e8f0]/80 pe-2 sm:gap-2.5 sm:pe-4">
              <button
                type="button"
                onClick={handleNotificationsClick}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/85 bg-white/90 text-primary shadow-[0_8px_20px_rgba(15,23,42,0.06)] backdrop-blur-md transition hover:border-primary/22 hover:bg-white hover:shadow-[0_10px_24px_rgba(15,143,139,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-[42px] sm:w-[42px] sm:rounded-[13px]"
                aria-label="الإشعارات"
                title="الإشعارات"
              >
                <Bell className="h-[17px] w-[17px]" strokeWidth={2.25} />
              </button>
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-primary/25 to-transparent"
            aria-hidden
          />
        </div>
      </div>
    </header>
  );
}
