"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Building2,
  MapPin,
  Phone,
  FileText,
  User,
  Plus,
  Tag,
  Edit3,
  Save,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import StyledSelect from "@/components/ui/styled-select";
import { adminApi } from "@/lib/admin/client";
import { resolveAdminFacilityFormFeedback } from "@/lib/admin/facilities/facilityFormErrors";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/form-field";
import { cn } from "@/lib/utils/utils";
import type { FacilitySummary } from "@/lib/admin/types";

const FACILITY_TYPE_OPTIONS = [
  { value: "hospital", label: "مستشفى" },
  { value: "clinic", label: "عيادة" },
  { value: "polyclinic", label: "عيادات متعددة" },
  { value: "medical_center", label: "مركز طبي" },
  { value: "laboratory", label: "مختبر" },
  { value: "imaging_center", label: "مركز أشعة" },
  { value: "pharmacy", label: "صيدلية" },
  { value: "rehabilitation_center", label: "مركز تأهيل" },
  { value: "dialysis_center", label: "مركز غسيل كلوي" },
  { value: "emergency_center", label: "طوارئ" },
  { value: "other", label: "أخرى" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "نشط" },
  { value: "PENDING", label: "قيد المراجعة" },
  { value: "INACTIVE", label: "معطّل" },
  { value: "DELETED", label: "محذوف" },
];

interface EditFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facility: FacilitySummary | null;
  doctors: Array<{ _id: string; user?: { fullName?: string } }>;
  onSuccess?: () => void;
}

function normalizeFacilityAttribute(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function EditFacilityDialog({
  open,
  onOpenChange,
  facility,
  doctors,
  onSuccess,
}: EditFacilityDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    facilityType: "",
    country: "",
    address: "",
    phone: "",
    description: "",
    ownerDoctorId: "",
    attributes: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAttribute, setNewAttribute] = useState("");
  const [rootError, setRootError] = useState("");

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

  const doctorOptions = doctors.map((doctor) => ({
    value: doctor._id,
    label: doctor.user?.fullName || doctor._id,
  }));

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name || "",
        city: facility.city || "",
        facilityType: facility.facilityType || "",
        country: facility.country || "",
        address: facility.address || "",
        phone: facility.phone || "",
        description: facility.description || "",
        ownerDoctorId: facility.ownerDoctorId || "",
        attributes: facility.attributes || [],
      });
      setErrors({});
      setRootError("");
    }
  }, [facility]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم المنشأة مطلوب";
    }

    if (!formData.city.trim()) {
      newErrors.city = "المدينة مطلوبة";
    }

    if (!formData.facilityType) {
      newErrors.facilityType = "يجب اختيار نوع المنشأة";
    }

    if (
      formData.phone.trim() &&
      !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "رقم الهاتف غير صالح";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addAttribute = () => {
    const normalized = normalizeFacilityAttribute(newAttribute);
    if (normalized && !formData.attributes.includes(normalized)) {
      setFormData((prev) => ({
        ...prev,
        attributes: [...prev.attributes, normalized],
      }));
      setNewAttribute("");
      if (errors.attributes) {
        setErrors((prev) => ({ ...prev, attributes: "" }));
      }
    }
  };

  const removeAttribute = (attribute: string) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((a) => a !== attribute),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!facility || !validateForm()) return;

    setIsSubmitting(true);
    setRootError("");
    try {
      await adminApi.facilities.update(facility._id || facility.id, {
        name: formData.name.trim(),
        city: formData.city.trim(),
        facilityType: formData.facilityType,
        country: formData.country.trim() || undefined,
        address: formData.address.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        description: formData.description.trim() || undefined,
        ownerDoctorId: formData.ownerDoctorId || undefined,
        attributes: formData.attributes,
      });

      toast("تم تحديث بيانات المنشأة بنجاح", {
        title: "تم التحديث",
        variant: "success",
        durationMs: 4200,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const feedback = resolveAdminFacilityFormFeedback(error, "edit");
      setErrors(feedback.fields);
      setRootError(feedback.rootBanner ?? "");
      toast(feedback.toastMessage, {
        title: feedback.toastTitle,
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
          aria-label="تعديل بيانات المنشأة الطبية"
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
                  تعديل بيانات المنشأة الطبية
                </h2>
              </div>
            </div>

            <form dir="rtl" onSubmit={handleSubmit}>
              <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  {rootError ? (
                    <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[12px] font-bold text-[#B42318]">
                      {rootError}
                    </div>
                  ) : null}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <AdminFormField
                      label="اسم المنشأة"
                      required
                      error={errors.name}
                    >
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
                        placeholder="أدخل اسم المنشأة"
                        className={adminFieldClass(
                          cn(
                            adminInputClass,
                            "text-start placeholder:text-start",
                          ),
                          Boolean(errors.name),
                        )}
                      />
                    </AdminFormField>

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
                      label="نوع المنشأة"
                      required
                      error={errors.facilityType}
                    >
                      <StyledSelect
                        value={formData.facilityType}
                        onChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            facilityType: value,
                          }));
                          if (errors.facilityType)
                            setErrors((prev) => ({
                              ...prev,
                              facilityType: "",
                            }));
                        }}
                        options={FACILITY_TYPE_OPTIONS}
                        placeholder="اختر نوع المنشأة"
                        error={Boolean(errors.facilityType)}
                      />
                    </AdminFormField>

                    <AdminFormField
                      label="البلد"
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
                  </div>

                  <AdminFormField
                    label="العنوان"
                    error={errors.address}
                  >
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }));
                        if (errors.address)
                          setErrors((prev) => ({ ...prev, address: "" }));
                      }}
                      placeholder="أدخل العنوان الكامل"
                      className={adminFieldClass(
                        cn(
                          adminInputClass,
                          "text-start placeholder:text-start",
                        ),
                        Boolean(errors.address),
                      )}
                    />
                  </AdminFormField>

                  <AdminFormField
                    label="الوصف"
                    hint="أدخل وصفاً للمنشأة (اختياري)"
                  >
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="أدخل وصفاً للمنشأة"
                      rows={3}
                      className={adminFieldClass(
                        cn(
                          adminTextareaClass,
                          "text-start placeholder:text-start",
                        ),
                        false,
                      )}
                    />
                  </AdminFormField>

                  <AdminFormField
                    label="الطبيب المالك"
                    hint="اختر الطبيب المالك (اختياري)"
                  >
                    <StyledSelect
                      value={formData.ownerDoctorId}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          ownerDoctorId: value,
                        }));
                        if (errors.ownerDoctorId) {
                          setErrors((prev) => ({ ...prev, ownerDoctorId: "" }));
                        }
                      }}
                      options={[
                        { value: "", label: "بدون طبيب مالك" },
                        ...doctorOptions,
                      ]}
                      placeholder="اختر الطبيب المالك"
                    />
                  </AdminFormField>

                  <AdminFormField
                    label="السمات والخصائص"
                    error={errors.attributes}
                    hint="سيتم حفظ السمات بصيغة مفاتيح مثل night_shift و echo_available."
                  >
                    <div className="flex gap-2 items-center">
                      <input
                        value={newAttribute}
                        onChange={(event) =>
                          setNewAttribute(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addAttribute();
                          }
                        }}
                        placeholder="أضف سمة (مثال: طوارئ، ICU)"
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
                        onClick={addAttribute}
                        disabled={isSubmitting || !newAttribute.trim()}
                        className="inline-flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-primary text-white disabled:opacity-50"
                        aria-label="إضافة سمة"
                      >
                        <Plus className="w-4 h-4" aria-hidden />
                      </button>
                    </div>
                    {formData.attributes.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.attributes.map((attribute) => (
                          <span
                            key={attribute}
                            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#E6F4F3] px-3 py-1 font-cairo text-[11px] font-bold text-primary"
                          >
                            <Tag className="w-3 h-3" aria-hidden />
                            {attribute}
                            <button
                              type="button"
                              onClick={() => removeAttribute(attribute)}
                              disabled={isSubmitting}
                              className="text-primary/70 transition hover:text-[#B42318] disabled:opacity-50"
                              aria-label={`إزالة ${attribute}`}
                            >
                              <X className="w-3 h-3" aria-hidden />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                        لا توجد سمات مضافة بعد.
                      </p>
                    )}
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
