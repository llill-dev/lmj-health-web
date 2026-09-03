"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, Users, TriangleAlert } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import StyledSelect from "@/components/ui/styled-select";
import { notificationsApi } from "@/lib/notifications/client";
import { getBroadcastNotificationErrorMessage } from "@/lib/admin/notifications/broadcastNotificationErrors";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/form-field";
import { useI18n } from "@/i18n/provider";

interface BroadcastNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function BroadcastNotificationDialog({
  open,
  onOpenChange,
  onSuccess,
}: BroadcastNotificationDialogProps) {
  const { locale, dir, t } = useI18n();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const GROUP_OPTIONS = [
    { value: "all", label: t("adminNotifications.group.all") },
    { value: "doctors", label: t("adminNotifications.group.doctors") },
    { value: "patients", label: t("adminNotifications.group.patients") },
    { value: "secretaries", label: t("adminNotifications.group.secretaries") },
    { value: "admins", label: t("adminNotifications.group.admins") },
  ];

  const TYPE_OPTIONS = [
    { value: "info", label: t("adminNotifications.type.info") },
    { value: "warning", label: t("adminNotifications.type.warning") },
    { value: "success", label: t("adminNotifications.type.success") },
    { value: "error", label: t("adminNotifications.type.error") },
    { value: "maintenance", label: t("adminNotifications.type.maintenance") },
    { value: "announcement", label: t("adminNotifications.type.announcement") },
  ];

  const createInitialFormData = () => ({
    group: "all",
    type: "info",
    title: "",
    body: "",
    data: "",
  });
  const [formData, setFormData] = useState(createInitialFormData);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open && !isSubmitting) {
      setFormData(createInitialFormData());
      setErrors({});
    }
  }, [open, isSubmitting]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onOpenChange(false);
    };

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange, isSubmitting]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.group) {
      newErrors.group = t("adminNotifications.broadcast.validation.groupRequired");
    }

    if (!formData.type) {
      newErrors.type = t("adminNotifications.broadcast.validation.typeRequired");
    }

    if (!formData.title.trim()) {
      newErrors.title = t("adminNotifications.broadcast.validation.titleRequired");
    } else if (formData.title.length > 100) {
      newErrors.title = t("adminNotifications.broadcast.validation.titleTooLong");
    }

    if (!formData.body.trim()) {
      newErrors.body = t("adminNotifications.broadcast.validation.bodyRequired");
    } else if (formData.body.length > 500) {
      newErrors.body = t("adminNotifications.broadcast.validation.bodyTooLong");
    }

    if (formData.data.trim()) {
      try {
        JSON.parse(formData.data);
      } catch {
        newErrors.data = t("adminNotifications.broadcast.validation.dataInvalid");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await notificationsApi.broadcast({
        group: formData.group,
        type: formData.type,
        title: formData.title.trim(),
        body: formData.body.trim(),
        data: formData.data.trim() || undefined,
      });

      toast(t("adminNotifications.broadcast.toast.sent"), {
        title: t("adminNotifications.broadcast.toast.sentTitle"),
        variant: "success",
        durationMs: 4200,
      });

      setFormData(createInitialFormData());
      setErrors({});
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast(getBroadcastNotificationErrorMessage(error, locale), {
        title: t("common.operationFailed"),
        variant: "error",
        durationMs: 4200,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting)
              onOpenChange(false);
          }}
        >
          <motion.div
            ref={dialogRef}
            className="relative w-[720px] max-w-[calc(100vw-32px)] max-h-[min(92vh,860px)] overflow-hidden rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            dir={dir}
            lang={locale}
            style={{ direction: dir }}
          >
            <div className="relative px-8 pb-7 pt-7">
              <button
                type="button"
                onClick={() => {
                  if (!isSubmitting) onOpenChange(false);
                }}
                disabled={isSubmitting}
                className="absolute end-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={t("common.close")}
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-start font-cairo text-[22px] font-extrabold leading-[28px] text-[#101828]">
                {t("adminNotifications.broadcast.ariaLabel")}
              </h2>

              <form
                onSubmit={handleSubmit}
                className="mt-10 max-h-[calc(92vh-220px)] overflow-y-auto space-y-6 ps-3 pe-2"
              >
                <div className="rounded-[8px] border border-[#FDE68A] bg-[#FFFBEB] p-3">
                  <div className="flex items-start gap-2">
                    <TriangleAlert className="mt-0.5 h-4 w-4 text-[#D97706]" />
                    <div className="font-cairo text-[11px] font-semibold leading-relaxed text-[#92400E]">
                      {t("adminNotifications.broadcast.warning.confirm")}
                    </div>
                  </div>
                </div>

                <AdminFormField
                  label={t("adminNotifications.broadcast.field.group.label")}
                  required
                  error={errors.group}
                >
                  <StyledSelect
                    value={formData.group}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, group: value }));
                      if (errors.group)
                        setErrors((prev) => ({ ...prev, group: "" }));
                    }}
                    options={GROUP_OPTIONS}
                    placeholder={t("adminNotifications.broadcast.field.group.placeholder")}
                    size="sm"
                    tone="muted"
                    dropdownMaxHeight={240}
                    listboxZIndex={10050}
                  />
                </AdminFormField>

                <AdminFormField
                  label={t("adminNotifications.broadcast.field.type.label")}
                  required
                  error={errors.type}
                >
                  <StyledSelect
                    value={formData.type}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, type: value }));
                      if (errors.type)
                        setErrors((prev) => ({ ...prev, type: "" }));
                    }}
                    options={TYPE_OPTIONS}
                    placeholder={t("adminNotifications.broadcast.field.type.placeholder")}
                    size="sm"
                    tone="muted"
                    dropdownMaxHeight={240}
                    listboxZIndex={10050}
                    listboxPortalRef={dialogRef}
                  />
                </AdminFormField>

                <AdminFormField
                  label={t("adminNotifications.broadcast.field.title.label")}
                  required
                  error={errors.title}
                >
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }));
                      if (errors.title)
                        setErrors((prev) => ({ ...prev, title: "" }));
                    }}
                    placeholder={t("adminNotifications.broadcast.field.title.placeholder")}
                    maxLength={100}
                    className={adminFieldClass(
                      adminInputClass,
                      Boolean(errors.title),
                    )}
                  />
                  <div className="mt-1 flex justify-between">
                    {errors.title && (
                      <p className="font-cairo text-[11px] font-semibold text-[#DC2626]">
                        {errors.title}
                      </p>
                    )}
                    <p className="mr-auto font-cairo text-[11px] font-semibold text-[#98A2B3]">
                      {formData.title.length}/100
                    </p>
                  </div>
                </AdminFormField>

                <AdminFormField
                  label={t("adminNotifications.broadcast.field.body.label")}
                  required
                  error={errors.body}
                >
                  <textarea
                    value={formData.body}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        body: e.target.value,
                      }));
                      if (errors.body)
                        setErrors((prev) => ({ ...prev, body: "" }));
                    }}
                    placeholder={t("adminNotifications.broadcast.field.body.placeholder")}
                    rows={4}
                    maxLength={500}
                    className={adminTextareaClass}
                  />
                  <div className="mt-1 flex justify-between">
                    {errors.body && (
                      <p className="font-cairo text-[11px] font-semibold text-[#DC2626]">
                        {errors.body}
                      </p>
                    )}
                    <p className="mr-auto font-cairo text-[11px] font-semibold text-[#98A2B3]">
                      {formData.body.length}/500
                    </p>
                  </div>
                </AdminFormField>

                <AdminFormField label={t("adminNotifications.broadcast.field.extraData.label")}>
                  <textarea
                    value={formData.data}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        data: e.target.value,
                      }));
                      if (errors.data)
                        setErrors((prev) => ({ ...prev, data: "" }));
                    }}
                    placeholder={t("adminNotifications.broadcast.field.extraData.placeholder")}
                    rows={2}
                    className="w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3 text-start font-cairo text-[11px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none font-mono"
                  />
                  {errors.data && (
                    <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                      {errors.data}
                    </p>
                  )}
                  <p className="mt-1 font-cairo text-[11px] font-semibold text-[#98A2B3]">
                    {t("adminNotifications.broadcast.field.extraData.hint")}
                  </p>
                </AdminFormField>

                <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-3">
                  <div className="flex items-start gap-2">
                    <Users className="mt-0.5 h-4 w-4 text-[#16A34A]" />
                    <div className="font-cairo text-[11px] font-semibold leading-relaxed text-[#14532D]">
                      {t("adminNotifications.broadcast.warning.sendAll")}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isSubmitting) onOpenChange(false);
                    }}
                    disabled={isSubmitting}
                    className="flex-1 h-[44px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white font-cairo text-[12px] font-extrabold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-[44px] items-center justify-center gap-2 rounded-[10px] border border-primary bg-primary font-cairo text-[12px] font-extrabold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      t("adminNotifications.broadcast.sending")
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t("adminNotifications.broadcast.submit")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
