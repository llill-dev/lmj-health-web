"use client";

import { Activity, Check, Heart, Pill } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/provider";

const REDIRECT_SECONDS = 4;

function FloatingIcon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/10 text-white/70 ${className ?? ""}`}
      aria-hidden
    >
      {children}
    </div>
  );
}

export default function DoctorProfileSuccessScreen({
  title = "تم تعديل بياناتك الشخصية بنجاح",
  subtitle = "شكراً لك ♡",
  redirectTo = "/doctor/dashboard",
  redirectSeconds = REDIRECT_SECONDS,
}: {
  title?: string;
  subtitle?: string;
  redirectTo?: string;
  redirectSeconds?: number;
}) {
  const { locale, dir } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, redirectSeconds * 1000);
    return () => clearTimeout(timer);
  }, [navigate, redirectTo, redirectSeconds]);

  return (
    <section
      dir={dir}
      lang={locale}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-primary px-6 py-16"
    >
      <div className="pointer-events-none absolute -end-16 -top-16 h-[220px] w-[220px] rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -start-24 -bottom-24 h-[260px] w-[260px] rounded-full bg-white/10" />
      <div className="pointer-events-none absolute start-1/4 top-1/3 h-[120px] w-[120px] rounded-full bg-white/5" />

      <FloatingIcon className="start-[12%] top-[18%]">
        <Heart className="h-5 w-5" />
      </FloatingIcon>
      <FloatingIcon className="end-[14%] top-[22%]">
        <Pill className="h-5 w-5" />
      </FloatingIcon>
      <FloatingIcon className="start-[18%] bottom-[20%]">
        <Activity className="h-5 w-5" />
      </FloatingIcon>
      <FloatingIcon className="end-[20%] bottom-[24%]">
        <Heart className="h-5 w-5" />
      </FloatingIcon>

      <div className="relative z-10 text-center">
        <div className="mx-auto flex h-[100px] w-[100px] items-center justify-center rounded-full border-[6px] border-white/30 bg-white/10">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white">
            <Check
              className="h-9 w-9 text-primary"
              strokeWidth={3}
              aria-hidden
            />
          </div>
        </div>

        <h1 className="mt-8 font-cairo text-[22px] font-extrabold text-white sm:text-[24px]">
          {title}
        </h1>
        <p className="mt-2 font-cairo text-[15px] font-semibold text-white/90">
          {subtitle}
        </p>
        <p className="mt-6 font-cairo text-[13px] font-medium text-white/75">
          سيتم تحويلك إلى لوحة التحكم خلال {redirectSeconds} ثوانٍ…
        </p>
      </div>
    </section>
  );
}
