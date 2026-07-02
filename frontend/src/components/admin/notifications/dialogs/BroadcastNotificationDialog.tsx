"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X, Send, Users, Bell } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import StyledSelect from "@/components/ui/styled-select";

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

  const [formData, setFormData] = useState({
    group: "all",
    type: "info",
    title: "",
    body: "",
    data: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-white rounded-[16px] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <Dialog.Title className="font-cairo text-[16px] font-extrabold text-[#111827]">
                      بث إشعار للمستخدمين
                    </Dialog.Title>
                    <Dialog.Description className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                      أرسل إشعاراً لمجموعة من المستخدمين
                    </Dialog.Description>
                  </div>
                </div>
                <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#667085] transition hover:bg-[#F9FAFB]">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {/* Group */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    المجموعة المستهدفة *
                  </label>
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
                  />
                  {errors.group && (
                    <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                      {errors.group}
                    </p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    نوع الإشعار *
                  </label>
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
                  />
                  {errors.type && (
                    <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                      {errors.type}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    عنوان الإشعار *
                  </label>
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
                    className={`w-full h-[44px] rounded-[10px] border bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                      errors.title
                        ? "border-[#FECACA] bg-[#FEF2F2]"
                        : "border-[#E5E7EB]"
                    }`}
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
                </div>

                {/* Body */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    محتوى الإشعار *
                  </label>
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
                    className={`w-full rounded-[10px] border bg-white px-4 py-3 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none ${
                      errors.body
                        ? "border-[#FECACA] bg-[#FEF2F2]"
                        : "border-[#E5E7EB]"
                    }`}
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
                </div>

                {/* Data (Optional) */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    بيانات إضافية (اختياري)
                  </label>
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
                </div>

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
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 h-[44px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white font-cairo text-[12px] font-extrabold text-[#111827] transition hover:bg-[#F9FAFB]"
                    >
                      إلغاء
                    </button>
                  </Dialog.Close>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
