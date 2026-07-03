"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X, User, Phone, Shield, Edit3, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import StyledSelect from "@/components/ui/styled-select";
import { AppCheckbox } from "@/components/ui";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
} from "@/components/admin/form-field";
import { cn } from "@/lib/utils/utils";

const GENDER_OPTIONS = [
  { value: "Male", label: "ذكر" },
  { value: "Female", label: "أنثى" },
];

const PERMISSION_OPTIONS = [
  { value: "appointments", label: "إدارة المواعيد" },
  { value: "patients", label: "إدارة المرضى" },
  { value: "prescriptions", label: "إدارة الوصفات" },
  { value: "medical_records", label: "السجلات الطبية" },
  { value: "billing", label: "الفواتير والدفع" },
  { value: "reports", label: "التقارير" },
];

interface Secretary {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  gender?: string;
  permissions?: string[];
}

interface AdminSecretarySummary {
  _id: string;
  user?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  phone?: string;
  gender?: string;
  permissions?: string[];
}

interface EditSecretaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  secretary: AdminSecretarySummary | null;
  onSuccess?: () => void;
}

export default function EditSecretaryDialog({
  open,
  onOpenChange,
  secretary,
  onSuccess,
}: EditSecretaryDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "Male",
    permissions: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  useEffect(() => {
    if (secretary) {
      setFormData({
        fullName: secretary.user?.fullName || "",
        phone: secretary.phone || secretary.user?.phone || "",
        gender: secretary.gender || "Male",
        permissions: secretary.permissions || [],
      });
      setErrors({});
    }
  }, [secretary]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "الاسم الكامل مطلوب";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "رقم الهاتف مطلوب";
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "رقم الهاتف غير صالح";
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = "يجب اختيار صلاحية واحدة على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretary || !validateForm()) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // await adminApi.secretaries.update(secretary._id, {
      //   fullName: formData.fullName,
      //   phone: formData.phone,
      //   gender: formData.gender,
      //   permissions: formData.permissions.join(','),
      // });

      toast("تم تحديث بيانات السكرتير بنجاح", {
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

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
    if (errors.permissions) {
      setErrors((prev) => ({ ...prev, permissions: "" }));
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="تعديل بيانات السكرتير"
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
                  تعديل بيانات السكرتير
                </h2>
              </div>
            </div>

            <form dir="rtl" onSubmit={handleSubmit}>
              <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  <AdminFormField
                    label="البريد الإلكتروني"
                    hint="لا يمكن التعديل"
                  >
                    <input
                      type="email"
                      value={secretary?.user?.email || ""}
                      disabled
                      className="w-full h-[48px] rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-right font-cairo text-[13px] font-bold text-[#667085] outline-none cursor-not-allowed"
                    />
                  </AdminFormField>

                  <AdminFormField
                    label="الاسم الكامل"
                    required
                    error={errors.fullName}
                  >
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }));
                        if (errors.fullName)
                          setErrors((prev) => ({ ...prev, fullName: "" }));
                      }}
                      placeholder="أدخل الاسم الكامل"
                      className={adminFieldClass(
                        cn(
                          adminInputClass,
                          "text-start placeholder:text-start",
                        ),
                        Boolean(errors.fullName),
                      )}
                    />
                  </AdminFormField>

                  <AdminFormField
                    label="رقم الهاتف"
                    required
                    error={errors.phone}
                  >
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }));
                        if (errors.phone)
                          setErrors((prev) => ({ ...prev, phone: "" }));
                      }}
                      placeholder="+963944000000"
                      className={adminFieldClass(
                        cn(
                          adminInputClass,
                          "text-start placeholder:text-start",
                        ),
                        Boolean(errors.phone),
                      )}
                    />
                  </AdminFormField>

                  <AdminFormField label="الجنس" required>
                    <StyledSelect
                      value={formData.gender}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, gender: value }))
                      }
                      options={GENDER_OPTIONS}
                      placeholder="اختر الجنس"
                    />
                  </AdminFormField>

                  <AdminFormField
                    label="الصلاحيات"
                    required
                    error={errors.permissions}
                  >
                    <div className="flex flex-wrap gap-2">
                      {PERMISSION_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center gap-2 rounded-[8px] border px-3 py-2 cursor-pointer transition ${
                            formData.permissions.includes(option.value)
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-[#E5E7EB] bg-white text-[#667085] hover:border-[#D1D5DB]"
                          }`}
                        >
                          <AppCheckbox
                            size="sm"
                            checked={formData.permissions.includes(
                              option.value,
                            )}
                            onChange={() => togglePermission(option.value)}
                          />
                          <span className="font-cairo text-[12px] font-bold">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
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
                  {isSubmitting ? "جارٍ التحديث…" : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
