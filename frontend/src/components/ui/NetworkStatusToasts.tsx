"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { useI18n } from "@/i18n/provider";

/**
 * يُظهِر توستات عند فقدان/استعادة الاتصال (window online/offline).
 * يوضع داخل ToastProvider.
 */
export function NetworkStatusToasts() {
  const { toast } = useToast();
  const { t } = useI18n();
  const isOffline = useRef(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );

  useEffect(() => {
    if (isOffline.current) {
      toast(t("network.offlineMessage"), {
        title: t("network.offlineTitle"),
        variant: "warning",
        durationMs: 5200,
      });
    }

    const onOffline = () => {
      if (!isOffline.current) {
        isOffline.current = true;
        toast(t("network.offlineMessage"), {
          title: t("network.offlineTitle"),
          variant: "warning",
          durationMs: 5200,
        });
      }
    };
    const onOnline = () => {
      if (isOffline.current) {
        isOffline.current = false;
        toast(t("network.onlineMessage"), {
          title: t("network.onlineTitle"),
          variant: "success",
          durationMs: 3400,
        });
      }
    };

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [toast, t]);

  return null;
}
