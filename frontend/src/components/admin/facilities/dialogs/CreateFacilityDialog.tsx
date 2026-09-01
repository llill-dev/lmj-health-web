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
  Save,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import StyledSelect from "@/components/ui/styled-select";
import { adminApi } from "@/lib/admin/client";
import type { FacilityStatus, FacilityType } from "@/lib/admin/types";
import { resolveAdminFacilityFormFeedback } from "@/lib/admin/facilities/facilityFormErrors";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/form-field";
import { cn } from "@/lib/utils/utils";
import { useI18n } from "@/i18n/provider";

interface CreateFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

function formatFacilityAttributeLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export default function CreateFacilityDialog({
  open,
  onOpenChange,
  doctors,
  onSuccess,
}: CreateFacilityDialogProps) {
  const { dir, t, locale } = useI18n();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const FACILITY_TYPE_OPTIONS = [
    { value: "hospital", label: t("adminFacility.type.hospital") },
    { value: "clinic", label: t("adminFacility.type.clinic") },
    { value: "polyclinic", label: t("adminFacility.type.polyclinic") },
    { value: "medical_center", label: t("adminFacility.type.medicalCenter") },
    { value: "laboratory", label: t("adminFacility.type.laboratory") },
    { value: "imaging_center", label: t("adminFacility.type.imagingCenter") },
    { value: "pharmacy", label: t("adminFacility.type.pharmacy") },
    { value: "rehabilitation_center", label: t("adminFacility.type.rehabilitationCenter") },
    { value: "dialysis_center", label: t("adminFacility.type.dialysisCenter") },
    { value: "emergency_center", label: t("adminFacility.type.emergencyCenter") },
    { value: "other", label: t("adminFacility.type.other") },
  ];

  const STATUS_OPTIONS = [
    { value: "ACTIVE", label: t("common.active") },
    { value: "PENDING", label: t("adminFacility.status.pending") },
    { value: "INACTIVE", label: t("common.disabled") },
    { value: "DELETED", label: t("adminFacility.status.deleted") },
  ];

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    facilityType: "",
    country: "",
    address: "",
    phone: "",
    description: "",
    ownerDoctorId: "",
    status: "ACTIVE",
    attributes: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAttribute, setNewAttribute] = useState("");
  const [rootError, setRootError] = useState("");

  useEffect(() => {
    if (!open) return;

    setErrors({});
    setNewAttribute("");
    setRootError("");

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
  const ownerDoctorPlaceholder =
    doctorOptions.length > 0
      ? t("adminFacilityDialog.field.ownerDoctor.placeholder")
      : t("adminFacilityDialog.field.ownerDoctor.empty");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("adminFacilityDialog.validation.nameRequired");
    }

    if (!formData.city.trim()) {
      newErrors.city = t("adminFacilityDialog.validation.cityRequired");
    }

    if (!formData.facilityType) {
      newErrors.facilityType = t("adminFacilityDialog.validation.typeRequired");
    }

    if (
      formData.phone.trim() &&
      !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = t("adminFacilityDialog.validation.phoneInvalid");
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

    if (!validateForm()) return;

    setIsSubmitting(true);
    setRootError("");
    try {
      await adminApi.facilities.create({
        name: formData.name.trim(),
        city: formData.city.trim(),
        facilityType: formData.facilityType as FacilityType,
        country: formData.country.trim() || undefined,
        address: formData.address.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        description: formData.description.trim() || undefined,
        ownerDoctorId: formData.ownerDoctorId || undefined,
        status: formData.status as FacilityStatus,
        attributes: formData.attributes,
      });

      toast(t("adminFacilityDialog.toast.created"), {
        title: t("adminFacilityDialog.toast.createdTitle"),
        variant: "success",
        durationMs: 4200,
      });

      setFormData({
        name: "",
        city: "",
        facilityType: "",
        country: "",
        address: "",
        phone: "",
        description: "",
        ownerDoctorId: "",
        status: "ACTIVE",
        attributes: [],
      });
      setErrors({});
      setNewAttribute("");
      setRootError("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const feedback = resolveAdminFacilityFormFeedback(error, "create", locale);
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
          aria-label={t("adminFacilityDialog.create.ariaLabel")}
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
                className="absolute start-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
                aria-label={t("common.close")}
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <div className="relative text-start">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {t("adminFacilityDialog.create.ariaLabel")}
                </h2>
              </div>
            </div>

            <form dir={dir} onSubmit={handleSubmit}>
              <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  {rootError ? (
                    <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[12px] font-bold text-[#B42318]">
                      {rootError}
                    </div>
                  ) : null}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <AdminFormField
                      label={t("adminFacilityDialog.field.name.label")}
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
                        placeholder={t('adminFacilityDialog.field.name.placeholder')}
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
                      label={t("adminFacilityDialog.field.city.label")}
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
                        placeholder={t('common.enterCity')}
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
                      label={t("adminFacilityDialog.field.type.label")}
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
                        placeholder={t('adminFacilityDialog.field.type.placeholder')}
                        error={Boolean(errors.facilityType)}
                      />
                    </AdminFormField>

                    <AdminFormField
                      label={t("adminFacilityDialog.field.country.label")}
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
                        placeholder={t('common.enterCountry')}
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
                      label={t("adminFacilityDialog.field.phone.label")}
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
                    label={t("adminFacilityDialog.field.address.label")}
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
                      placeholder={t('adminFacilityDialog.field.address.placeholder')}
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
                    label={t("adminFacilityDialog.field.description.label")}
                    hint={t("adminFacilityDialog.field.description.hint")}
                  >
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder={t('adminFacilityDialog.field.description.placeholder')}
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
                    label={t("adminFacilityDialog.field.ownerDoctor.label")}
                    hint={t("adminFacilityDialog.field.ownerDoctor.hint")}
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
                        { value: "", label: t("adminFacilityDialog.field.ownerDoctor.none") },
                        ...doctorOptions,
                      ]}
                      placeholder={ownerDoctorPlaceholder}
                    />
                  </AdminFormField>

                  <AdminFormField label={t("common.statusLabel")} required>
                    <StyledSelect
                      value={formData.status}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                      options={STATUS_OPTIONS}
                      placeholder={t('common.selectStatus')}
                    />
                  </AdminFormField>

                  <AdminFormField
                    label={t("adminFacilityDialog.field.attributes.label")}
                    error={errors.attributes}
                    hint={t("adminFacilityDialog.field.attributes.hint")}
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
                        placeholder={t('adminFacilityDialog.field.tag.placeholder')}
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
                        aria-label={t('adminFacilityDialog.action.addTag')}
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
                            {formatFacilityAttributeLabel(attribute)}
                            <button
                              type="button"
                              onClick={() => removeAttribute(attribute)}
                              disabled={isSubmitting}
                              className="text-primary/70 transition hover:text-[#B42318] disabled:opacity-50"
                              aria-label={t("adminFacilityDialog.attributes.removeAria").replace("{name}", attribute)}
                            >
                              <X className="w-3 h-3" aria-hidden />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                        {t("adminFacilityDialog.attributes.empty")}
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
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                >
                  <Save className="w-4 h-4" aria-hidden />
                  {isSubmitting ? t("adminFacilityDialog.action.creating") : t("adminFacilityDialog.action.create")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
