"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X, Building2, MapPin, Plus, Tag, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import StyledSelect from "@/components/ui/styled-select";
import { resolveLabel } from "@/lib/admin/types";
import { adminApi } from "@/lib/admin/client";
import { getAdminServiceProviderMutationErrorMessage } from "@/lib/admin/adminWriteFlowErrors";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/form-field";
import { cn } from "@/lib/utils/utils";

const STATUS_OPTIONS = [
  { value: "draft", label: "مسودة" },
  { value: "active", label: "نشط" },
  { value: "inactive", label: "معطّل" },
];

interface CreateServiceProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceTypes: Array<{
    _id: string;
    name: string | { en: string; ar: string };
    slug: string;
  }>;
  onSuccess?: () => void;
}

export default function CreateServiceProviderDialog({
  open,
  onOpenChange,
  serviceTypes,
  onSuccess,
}: CreateServiceProviderDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    serviceType: "",
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
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onOpenChange(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange, isSubmitting]);

  const typeOptions = serviceTypes.map((type) => ({
    value: type._id,
    label: resolveLabel(type.name, "ar") || type.slug,
  }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceType) {
      newErrors.serviceType = "يجب اختيار نوع الخدمة";
    }

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

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await adminApi.serviceProviders.create({
        serviceType: formData.serviceType,
        name: formData.name,
        city: formData.city,
        country: formData.country,
        data: formData.data ? JSON.parse(formData.data) : undefined,
        aliases: formData.aliases,
        status: formData.status,
      });

      toast("تم إنشاء مزود الخدمة بنجاح", {
        title: "تم الإنشاء",
        variant: "success",
        durationMs: 4200,
      });

      setFormData({
        serviceType: "",
        name: "",
        city: "",
        country: "",
        data: "",
        aliases: [],
        status: "draft",
      });
      setErrors({});
      setNewAlias("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast(getAdminServiceProviderMutationErrorMessage(error, "create"), {
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
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="إنشاء مزود خدمة جديد"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting)
              onOpenChange(false);
          }}
        >
          <motion.div
            className="relative max-h-[min(92vh,860px)] w-full max-w-[760px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden border-b border-[#EEF2F6] px-8 pb-5 pt-8">
              <div
                className="pointer-events-none absolute inset-0 bg-[#E6F4F3]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center opacity-80"
                aria-hidden
              />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="absolute left-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <div className="relative text-right">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  إنشاء مزود خدمة جديد
                </h2>
                <p className="mt-2 max-w-[560px] font-cairo text-[12px] font-bold leading-6 text-[#667085]">
                  أنشئ هنا سجل مزوّد الخدمة نفسه وربطه بنوع خدمة واحد. الحقول
                  الأساسية الظاهرة في الكروت والقوائم تؤخذ من هذا النموذج، أما
                  حقل JSON فهو فقط لبيانات إضافية لا تظهر مباشرة للمستخدم.
                </p>
              </div>
            </div>

            <form dir="rtl" onSubmit={handleSubmit}>
              <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  <AdminFormField
                    label="نوع الخدمة"
                    required
                    hint="اختر التصنيف المرجعي الذي سيظهر هذا المزوّد تحته داخل الإدارة."
                    error={errors.serviceType}
                  >
                    <StyledSelect
                      value={formData.serviceType}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          serviceType: value,
                        }));
                        if (errors.serviceType)
                          setErrors((prev) => ({ ...prev, serviceType: "" }));
                      }}
                      options={typeOptions}
                      placeholder="اختر نوع الخدمة"
                      error={Boolean(errors.serviceType)}
                    />
                  </AdminFormField>

                  <AdminFormField label="الاسم" required error={errors.name}>
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
                      className={adminFieldClass(
                        cn(
                          adminInputClass,
                          "text-start placeholder:text-start",
                        ),
                        Boolean(errors.name),
                      )}
                    />
                  </AdminFormField>

                  <div>
                    <h3 className="mb-3 text-right font-cairo text-[14px] font-extrabold text-[#111827]">
                      الموقع
                    </h3>
                    <div className="space-y-4">
                      <AdminFormField
                        label="المدينة"
                        required
                        error={errors.city}
                      >
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
                          className={adminFieldClass(
                            cn(
                              adminInputClass,
                              "text-start placeholder:text-start",
                            ),
                            Boolean(errors.city),
                          )}
                        />
                      </AdminFormField>

                      <AdminFormField
                        label="البلد"
                        required
                        error={errors.country}
                      >
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
                          className={adminFieldClass(
                            cn(
                              adminInputClass,
                              "text-start placeholder:text-start",
                            ),
                            Boolean(errors.country),
                          )}
                        />
                      </AdminFormField>
                    </div>
                  </div>

                  <AdminFormField
                    label="بيانات إضافية"
                    hint="اختياري: حقول تقنية أو تكاملية بصيغة JSON. لا تكرر هنا الاسم أو المدينة أو البلد."
                  >
                    <textarea
                      value={formData.data}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          data: e.target.value,
                        }));
                      }}
                      placeholder="بيانات إضافية بصيغة JSON"
                      rows={2}
                      className={adminFieldClass(
                        cn(
                          adminTextareaClass,
                          "text-start placeholder:text-start font-mono",
                        ),
                        false,
                      )}
                    />
                  </AdminFormField>

                  <AdminFormField
                    label="الأسماء البديلة"
                    hint="تُستخدم لتوسيع البحث أو حفظ صيغ كتابة مختلفة لنفس المزوّد."
                  >
                    <div className="flex gap-2 items-center">
                      <input
                        value={newAlias}
                        onChange={(event) => setNewAlias(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addAlias();
                          }
                        }}
                        placeholder="أضف اسماً بديلاً"
                        disabled={isSubmitting}
                        className={adminFieldClass(
                          cn(
                            adminInputClass,
                            "text-start placeholder:text-start",
                          ),
                          false,
                        )}
                      />
                      <button
                        type="button"
                        onClick={addAlias}
                        disabled={isSubmitting || !newAlias.trim()}
                        className="inline-flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-primary text-white disabled:opacity-50"
                        aria-label="إضافة اسم بديل"
                      >
                        <Plus className="w-4 h-4" aria-hidden />
                      </button>
                    </div>
                    {formData.aliases.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.aliases.map((alias) => (
                          <span
                            key={alias}
                            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#E6F4F3] px-3 py-1 font-cairo text-[11px] font-bold text-primary"
                          >
                            <Tag className="w-3 h-3" aria-hidden />
                            {alias}
                            <button
                              type="button"
                              onClick={() => removeAlias(alias)}
                              disabled={isSubmitting}
                              className="text-primary/70 transition hover:text-[#B42318] disabled:opacity-50"
                              aria-label={`إزالة ${alias}`}
                            >
                              <X className="w-3 h-3" aria-hidden />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                        لا توجد أسماء بديلة مضافة بعد.
                      </p>
                    )}
                  </AdminFormField>

                  <AdminFormField
                    label="الحالة"
                    required
                    hint="مسودة للمراجعة الداخلية، نشط للظهور والاستخدام، معطّل لإخفائه دون حذف السجل."
                  >
                    <StyledSelect
                      value={formData.status}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                      options={STATUS_OPTIONS}
                      placeholder="اختر الحالة"
                    />
                  </AdminFormField>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#EEF2F6] px-8 py-5">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                >
                  <Save className="w-4 h-4" aria-hidden />
                  {isSubmitting ? "جارٍ الإنشاء…" : "إنشاء مزود الخدمة"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
