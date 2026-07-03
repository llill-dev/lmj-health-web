"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, Users, Bell } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import StyledSelect from "@/components/ui/styled-select";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/form-field";

const GROUP_OPTIONS = [
  { value: "all", label: "جميع المستخدمين" },
  { value: "doctors", label: "الأطباء" },
  { value: "patients", label: "المرضى" },
  { value: "secretaries", label: "السكرتيرين" },
  { value: "admins", label: "المسؤولين" },
];

const TYPE_OPTIONS = [
  { value: "info", label: "معلومة" },
  { value: "warning", label: "تحذير" },
  { value: "success", label: "نجاح" },
  { value: "error", label: "خطأ" },
  { value: "maintenance", label: "صيانة" },
  { value: "announcement", label: "إعلان" },
];

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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    group: "all",
    type: "info",
    title: "",
    body: "",
    data: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
      newErrors.group = "يجب اختيار المجموعة المستهدفة";
    }

    if (!formData.type) {
      newErrors.type = "يجب اختيار نوع الإشعار";
    }

    if (!formData.title.trim()) {
      newErrors.title = "العنوان مطلوب";
    } else if (formData.title.length > 100) {
      newErrors.title = "العنوان يجب أن يكون أقل من 100 حرف";
    }

    if (!formData.body.trim()) {
      newErrors.body = "المحتوى مطلوب";
    } else if (formData.body.length > 500) {
      newErrors.body = "المحتوى يجب أن يكون أقل من 500 حرف";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // await adminApi.notifications.broadcast({
      //   group: formData.group,
      //   type: formData.type,
      //   title: formData.title,
      //   body: formData.body,
      //   data: formData.data || undefined,
      // });

      toast("تم إرسال الإشعار بنجاح", {
        title: "تم الإرسال",
        variant: "success",
        durationMs: 4200,
      });

      setFormData({
        group: "all",
        type: "info",
        title: "",
        body: "",
        data: "",
      });
      setErrors({});
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast("حدث خطأ أثناء إرسال الإشعار. يرجى المحاولة مرة أخرى.", {
        title: "فشلت العملية",
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
            dir="rtl"
            lang="ar"
            style={{ direction: "rtl" }}
          >
            <div className="relative px-8 pb-7 pt-7">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-right font-cairo text-[22px] font-extrabold leading-[28px] text-[#101828]">
                بث إشعار للمستخدمين
              </h2>

              <form
                onSubmit={handleSubmit}
                className="mt-10 max-h-[calc(92vh-220px)] overflow-y-auto space-y-6 pl-3 pr-2"
              >
                {/* Group */}
                <AdminFormField
                  label="المجموعة المستهدفة"
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
                    placeholder="اختر المجموعة"
                    size="sm"
                    tone="muted"
                    dropdownMaxHeight={240}
                    listboxZIndex={10050}
                  />
                </AdminFormField>

                {/* Type */}
                <AdminFormField
                  label="نوع الإشعار"
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
                    placeholder="اختر النوع"
                    size="sm"
                    tone="muted"
                    dropdownMaxHeight={240}
                    listboxZIndex={10050}
                    listboxPortalRef={dialogRef}
                  />
                </AdminFormField>

                {/* Title */}
                <AdminFormField
                  label="عنوان الإشعار"
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
                    placeholder="أدخل عنوان الإشعار"
                    maxLength={100}
                    className={adminFieldClass(
                      adminInputClass,
                      Boolean(errors.title),
                    )}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.title && (
                      <p className="font-cairo text-[11px] font-semibold text-[#DC2626]">
                        {errors.title}
                      </p>
                    )}
                    <p className="font-cairo text-[11px] font-semibold text-[#98A2B3] mr-auto">
                      {formData.title.length}/100
                    </p>
                  </div>
                </AdminFormField>

                {/* Body */}
                <AdminFormField
                  label="محتوى الإشعار"
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
                    placeholder="أدخل محتوى الإشعار"
                    rows={4}
                    maxLength={500}
                    className={adminTextareaClass}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.body && (
                      <p className="font-cairo text-[11px] font-semibold text-[#DC2626]">
                        {errors.body}
                      </p>
                    )}
                    <p className="font-cairo text-[11px] font-semibold text-[#98A2B3] mr-auto">
                      {formData.body.length}/500
                    </p>
                  </div>
                </AdminFormField>

                {/* Data (Optional) */}
                <AdminFormField label="بيانات إضافية (اختياري)">
                  <textarea
                    value={formData.data}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        data: e.target.value,
                      }));
                    }}
                    placeholder="بيانات إضافية بصيغة JSON (اختياري)"
                    rows={2}
                    className="w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3 text-right font-cairo text-[11px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none font-mono"
                  />
                  <p className="mt-1 font-cairo text-[11px] font-semibold text-[#98A2B3]">
                    يمكنك إضافة بيانات إضافية بصيغة JSON
                  </p>
                </AdminFormField>

                {/* Info Box */}
                <div className="rounded-[8px] bg-[#F0FDF4] border border-[#BBF7D0] p-3">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-[#16A34A] mt-0.5" />
                    <div className="font-cairo text-[11px] font-semibold text-[#14532D] leading-relaxed">
                      سيتم إرسال هذا الإشعار إلى جميع المستخدمين في المجموعة
                      المحددة. تأكد من صحة المحتوى قبل الإرسال.
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="flex-1 h-[44px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white font-cairo text-[12px] font-extrabold text-[#111827] transition hover:bg-[#F9FAFB]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-[44px] items-center justify-center gap-2 rounded-[10px] border border-primary bg-primary font-cairo text-[12px] font-extrabold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      "جارٍ الإرسال..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        إرسال الإشعار
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
