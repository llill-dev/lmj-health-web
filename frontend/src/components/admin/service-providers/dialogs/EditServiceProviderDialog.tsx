"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X, Building2, MapPin, Plus, Tag, Edit3 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import StyledSelect from "@/components/ui/styled-select";
import type { ServiceProvider } from "@/lib/admin/types";
import { resolveLabel } from "@/lib/admin/types";
import { adminApi } from "@/lib/admin/client";

const STATUS_OPTIONS = [
  { value: "draft", label: "مسودة" },
  { value: "active", label: "نشط" },
  { value: "inactive", label: "معطّل" },
];

interface EditServiceProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ServiceProvider | null;
  onSuccess?: () => void;
}

export default function EditServiceProviderDialog({
  open,
  onOpenChange,
  provider,
  onSuccess,
}: EditServiceProviderDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    country: "",
    data: "",
    aliases: [] as string[],
    status: "draft",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAlias, setNewAlias] = useState("");

  useEffect(() => {
    if (provider) {
      const data = provider.data || {};
      setFormData({
        name: resolveLabel(data.name as any, "ar") || "",
        city: (data.city as string) || "",
        country: (data.country as string) || "",
        data: typeof data === "string" ? data : JSON.stringify(data, null, 2),
        aliases: (data.aliases as string[]) || [],
        status: provider.status || "draft",
      });
      setErrors({});
    }
  }, [provider]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "الاسم مطلوب";
    }

    if (!formData.city.trim()) {
      newErrors.city = "المدينة مطلوبة";
    }

    if (!formData.country.trim()) {
      newErrors.country = "البلد مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addAlias = () => {
    const trimmed = newAlias.trim();
    if (trimmed && !formData.aliases.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        aliases: [...prev.aliases, trimmed],
      }));
      setNewAlias("");
    }
  };

  const removeAlias = (alias: string) => {
    setFormData((prev) => ({
      ...prev,
      aliases: prev.aliases.filter((a) => a !== alias),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!provider || !validateForm()) return;

    setIsSubmitting(true);
    try {
      await adminApi.serviceProviders.update(provider._id, {
        name: formData.name,
        city: formData.city,
        country: formData.country,
        data: formData.data ? JSON.parse(formData.data) : undefined,
        aliases: formData.aliases,
        status: formData.status,
      });

      toast("تم تحديث بيانات مزود الخدمة بنجاح", {
        title: "تم التحديث",
        variant: "success",
        durationMs: 4200,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast("حدث خطأ أثناء تحديث البيانات. يرجى المحاولة مرة أخرى.", {
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
        <div className="pointer-events-none fixed inset-0 z-[100] box-border grid place-items-center">
          <Dialog.Content asChild forceMount>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pointer-events-auto w-full max-w-2xl"
            >
              <div className="bg-white rounded-[16px] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Edit3 className="h-5 w-5" />
                    </div>
                    <div>
                      <Dialog.Title className="font-cairo text-[16px] font-extrabold text-[#111827]">
                        تعديل بيانات مزود الخدمة
                      </Dialog.Title>
                      <Dialog.Description className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                        قم بتحديث بيانات مزود الخدمة
                      </Dialog.Description>
                    </div>
                  </div>
                  <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#667085] transition hover:bg-[#F9FAFB]">
                    <X className="h-4 w-4" />
                  </Dialog.Close>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto"
                >
                  {/* Service Type (Read-only) */}
                  <div>
                    <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#667085]">
                      نوع الخدمة (لا يمكن التعديل)
                    </label>
                    <input
                      type="text"
                      value={
                        typeof provider?.serviceType === "string"
                          ? provider.serviceType
                          : resolveLabel(provider?.serviceType?.name, "ar") ||
                            provider?.serviceType?.slug ||
                            ""
                      }
                      disabled
                      className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-right font-cairo text-[12px] font-bold text-[#667085] outline-none cursor-not-allowed"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                      الاسم *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }));
                        if (errors.name)
                          setErrors((prev) => ({ ...prev, name: "" }));
                      }}
                      placeholder="أدخل اسم مزود الخدمة"
                      className={`w-full h-[44px] rounded-[10px] border bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                        errors.name
                          ? "border-[#FECACA] bg-[#FEF2F2]"
                          : "border-[#E5E7EB]"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                      المدينة *
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }));
                          if (errors.city)
                            setErrors((prev) => ({ ...prev, city: "" }));
                        }}
                        placeholder="أدخل المدينة"
                        className={`w-full h-[44px] rounded-[10px] border bg-white pe-10 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                          errors.city
                            ? "border-[#FECACA] bg-[#FEF2F2]"
                            : "border-[#E5E7EB]"
                        }`}
                      />
                    </div>
                    {errors.city && (
                      <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                      البلد *
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }));
                        if (errors.country)
                          setErrors((prev) => ({ ...prev, country: "" }));
                      }}
                      placeholder="أدخل البلد"
                      className={`w-full h-[44px] rounded-[10px] border bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                        errors.country
                          ? "border-[#FECACA] bg-[#FEF2F2]"
                          : "border-[#E5E7EB]"
                      }`}
                    />
                    {errors.country && (
                      <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                        {errors.country}
                      </p>
                    )}
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
                  </div>

                  {/* Aliases */}
                  <div>
                    <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                      الأسماء البديلة
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newAlias}
                        onChange={(e) => setNewAlias(e.target.value)}
                        placeholder="أضف اسماً بديلاً"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addAlias();
                          }
                        }}
                        className="flex-1 h-[44px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                      <button
                        type="button"
                        onClick={addAlias}
                        className="h-[44px] w-[44px] flex items-center justify-center rounded-[10px] border border-primary bg-primary text-white transition hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    {formData.aliases.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.aliases.map((alias) => (
                          <span
                            key={alias}
                            className="inline-flex items-center gap-1 rounded-[8px] bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-1.5 font-cairo text-[11px] font-bold text-[#166534]"
                          >
                            <Tag className="h-3 w-3" />
                            {alias}
                            <button
                              type="button"
                              onClick={() => removeAlias(alias)}
                              className="mr-1 text-[#166534] hover:text-[#DC2626] transition"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                      الحالة *
                    </label>
                    <StyledSelect
                      value={formData.status}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                      options={STATUS_OPTIONS}
                      placeholder="اختر الحالة"
                      size="sm"
                      tone="muted"
                    />
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
                      className="flex-1 h-[44px] items-center justify-center rounded-[10px] border border-primary bg-primary font-cairo text-[12px] font-extrabold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? "جارٍ التحديث..." : "حفظ التغييرات"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
