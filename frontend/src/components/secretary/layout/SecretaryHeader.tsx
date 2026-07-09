"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const greetingWord = (): string => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "صباح الخير";
  if (h >= 12 && h < 17) return "طاب يومك";
  if (h >= 17 && h < 23) return "مساء الخير";
  return "أهلاً بك";
};

const initialsFromName = (name: string): string => {
  const t = name.trim();
  if (!t) return "س";
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
  title = "لوحة التحكم",
}: SecretaryHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const displayName = useMemo(() => {
    const n = user?.name?.trim();
    if (n) return n;
    return "السكرتير";
  }, [user?.name]);

  const initials = useMemo(
    () => initialsFromName(user?.name?.trim() ?? ""),
    [user?.name],
  );

  const greeting = greetingWord();

  const handleNotificationsClick = () => {
    navigate("/secretary/notifications");
  };

  return (
    <header
      dir="rtl"
      lang="ar"
      className="w-full px-4 pb-3 pt-3 sm:px-6 lg:px-12"
    >
      <div className="mx-auto max-w-[1420px]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/85 bg-white/90 text-primary shadow-[0_8px_20px_rgba(15,23,42,0.06)] backdrop-blur-md transition hover:border-primary/22 hover:bg-white hover:shadow-[0_10px_24px_rgba(15,143,139,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
              aria-label="فتح القائمة"
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={2.25} />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-gradient-to-br from-[#0f766e] via-[#0f8f8b] to-[#14b8a6] font-cairo text-[14px] font-black tracking-wide text-white shadow-[0_12px_28px_rgba(15,143,139,0.32)] ring-2 ring-white/95">
                  {initials}
                </div>
                <span
                  className="absolute -bottom-px -left-px h-3 w-3 rounded-full border-2 border-white bg-emerald-400 shadow-sm"
                  aria-hidden
                  title="متصل"
                />
              </div>

              <div className="hidden sm:block">
                <div className="font-cairo text-[14px] font-bold leading-tight text-[#0f172a]">
                  {displayName}
                </div>
                <div className="font-cairo text-[11px] font-medium text-[#64748b]">
                  متصل الآن
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white/90 px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
              <Search className="h-4 w-4 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="بحث..."
                className="w-48 bg-transparent font-cairo text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleNotificationsClick}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/85 bg-white/90 text-primary shadow-[0_8px_20px_rgba(15,23,42,0.06)] backdrop-blur-md transition hover:border-primary/22 hover:bg-white hover:shadow-[0_10px_24px_rgba(15,143,139,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="الإشعارات"
              title="الإشعارات"
            >
              <Bell className="h-[17px] w-[17px]" strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <h1 className="font-cairo text-[24px] font-black text-[#0f172a]">
            {title}
          </h1>
          <p className="mt-1 font-cairo text-[14px] font-medium text-[#64748b]">
            {greeting}، {displayName}
          </p>
        </div>
      </div>
    </header>
  );
}
