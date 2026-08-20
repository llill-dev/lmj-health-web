"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Tag, Save, ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { useI18n } from "@/i18n/provider";
import StyledSelect from "@/components/ui/styled-select";
import type { ProviderStatus, ServiceType } from "@/lib/admin/types";
import { resolveLabel } from "@/lib/admin/types";
import { adminApi } from "@/lib/admin/client";
import { useServiceProvider } from "@/hooks/admin/services/useAdminServices";
import {
  getAdminServiceProviderMutationErrorMessage,
  extractFieldValidationErrors,
} from "@/lib/admin/adminWriteFlowErrors";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/form-field";
import DynamicProviderFieldRenderer from "@/components/admin/service-providers/DynamicProviderFieldRenderer";
import { cn } from "@/lib/utils/utils";

const STATUS_OPTIONS = [
  { value: "draft", label: "مسودة" },
  { value: "active", label: "نشط" },
  { value: "inactive", label: "معطّل" },
];

interface EditServiceProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Only the id is required — full data + serviceType schema are hydrated via GET /:id. */
  providerId: string | null;
  onSuccess?: () => void;
  allowAdvancedJson?: boolean;
  /** Data-entry users own drafts only — publication is an admin-only decision, so the
   * status selector is hidden entirely and the record's status is left untouched. */
  allowStatusControl?: boolean;
}

export default function EditServiceProviderDialog({
  open,
  onOpenChange,
  providerId,
  onSuccess,
  allowAdvancedJson = true,
  allowStatusControl = true,
}: EditServiceProviderDialogProps) {
  const { dir, locale } = useI18n();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detailQuery = useServiceProvider(providerId ?? "", open && !!providerId);
  const provider = detailQuery.data?.provider ?? null;
  const serviceType: ServiceType | null = detailQuery.data?.serviceType ?? null;

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("draft");
  const [aliases, setAliases] = useState<string[]>([]);
  const [dynamicData, setDynamicData] = useState<Record<string, unknown>>({});
  const [showAdvancedJson, setShowAdvancedJson] = useState(false);
  const [advancedJson, setAdvancedJson] = useState("");
  const [advancedJsonError, setAdvancedJsonError] = useState<string | null>(null);

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

  useEffect(() => {
    if (provider) {
      setName(provider.name ?? "");
      setCity(provider.city ?? "");
      setCountry(provider.country ?? "");
      setStatus(provider.status || "draft");
      setAliases(provider.aliases ?? []);
      setDynamicData(provider.data ?? {});
      setShowAdvancedJson(false);
      setAdvancedJson(JSON.stringify(provider.data ?? {}, null, 2));
      setErrors({});
    }
  }, [provider]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setNewAlias("");
      setAdvancedJsonError(null);
    }
  }, [open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "الاسم مطلوب";
    }
    if (!city.trim()) {
      newErrors.city = "المدينة مطلوبة";
    }
    if (!country.trim()) {
      newErrors.country = "البلد مطلوب";
    }

    if (showAdvancedJson && advancedJson.trim()) {
      try {
        JSON.parse(advancedJson);
        setAdvancedJsonError(null);
      } catch {
        setAdvancedJsonError("صيغة JSON غير صالحة");
        newErrors.data = "صيغة JSON غير صالحة";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addAlias = () => {
    const trimmed = newAlias.trim();
    if (trimmed && !aliases.includes(trimmed)) {
      setAliases((prev) => [...prev, trimmed]);
      setNewAlias("");
    }
  };

  const removeAlias = (alias: string) => {
    setAliases((prev) => prev.filter((a) => a !== alias));
  };

  const resolveData = (): Record<string, unknown> | undefined => {
    if (showAdvancedJson) {
      if (!advancedJson.trim()) return undefined;
      return JSON.parse(advancedJson);
    }
    return dynamicData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!provider || !validateForm()) return;

    setIsSubmitting(true);
    try {
      await adminApi.serviceProviders.update(provider.id, {
        name,
        city,
        country,
        data: resolveData(),
        aliases,
        status: (allowStatusControl ? status : provider.status) as ProviderStatus,
      });

      toast("تم تحديث بيانات مزود الخدمة بنجاح", {
        title: "تم التحديث",
        variant: "success",
        durationMs: 4200,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const fieldErrors = extractFieldValidationErrors(error);
      if (fieldErrors) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
      toast(getAdminServiceProviderMutationErrorMessage(error, "update"), {
        title: "فشلت العملية",
        variant: "error",
        durationMs: 4200,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInactiveType = serviceType ? !serviceType.isActive : false;
  // Soft UX guard (backend documents no transition matrix): never offer "active" while
  // the service type is inactive, and never offer moving an already-active provider
  // back to "draft".
  const statusOptions = STATUS_OPTIONS.filter((o) => {
    if (isInactiveType && o.value === "active") return false;
    if (provider?.status === "active" && o.value === "draft") return false;
    return true;
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="تعديل بيانات مزود الخدمة"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting)
              onOpenChange(false);
          }}
        >
          <motion.div
            className="relative flex max-h-[min(92vh,860px)] w-full max-w-[760px] flex-col overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
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
                  تعديل بيانات مزود الخدمة
                </h2>
                <p className="mt-2 max-w-[560px] font-cairo text-[12px] font-bold leading-6 text-[#667085]">
                  هذه النافذة تعدّل سجل مزوّد الخدمة الحالي فقط. نوع الخدمة
                  المرجعي ثابت هنا، وأي تعديل على الاسم أو الحالة سينعكس على
                  القوائم والكروت المرتبطة بهذا المزوّد.
                </p>
              </div>
            </div>

            {detailQuery.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : detailQuery.isError || !provider ? (
              <div className="px-8 py-10 text-center font-cairo text-[13px] font-bold text-[#B42318]">
                تعذر تحميل بيانات مزود الخدمة.
              </div>
            ) : (
              <form dir={dir} onSubmit={handleSubmit}>
                <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
                  <div className="space-y-5">
                    <AdminFormField label="نوع الخدمة" hint="لا يمكن التعديل">
                      <input
                        type="text"
                        value={resolveLabel(serviceType?.name, "ar") || serviceType?.slug || ""}
                        disabled
                        className="w-full h-[48px] rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-right font-cairo text-[13px] font-bold text-[#667085] outline-none cursor-not-allowed"
                      />
                    </AdminFormField>

                    {isInactiveType ? (
                      <div className="rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 font-cairo text-[12px] font-bold text-[#92400E]">
                        نوع الخدمة هذا غير مُفعّل حاليًا. يمكنك تعديل بيانات
                        المزود أو تعطيله، لكن لا يمكن تفعيله قبل تفعيل النوع.
                      </div>
                    ) : null}

                    <AdminFormField label="الاسم" required error={errors.name}>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
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
                            value={city}
                            onChange={(e) => {
                              setCity(e.target.value);
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
                            value={country}
                            onChange={(e) => {
                              setCountry(e.target.value);
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

                    {serviceType ? (
                      <div>
                        <h3 className="mb-3 text-right font-cairo text-[14px] font-extrabold text-[#111827]">
                          بيانات {resolveLabel(serviceType.name, "ar")}
                        </h3>
                        <DynamicProviderFieldRenderer
                          fields={serviceType.fields ?? []}
                          value={dynamicData}
                          onChange={setDynamicData}
                          errors={errors}
                          locale={locale}
                          disabled={showAdvancedJson}
                        />
                      </div>
                    ) : null}

                    {allowAdvancedJson ? (
                      <div className="rounded-[12px] border border-[#E5E7EB]">
                        <button
                          type="button"
                          onClick={() => setShowAdvancedJson((prev) => !prev)}
                          className="flex w-full items-center justify-between px-4 py-3 font-cairo text-[12px] font-extrabold text-[#344054]"
                        >
                          <span>متقدّم: تحرير JSON مباشرةً (اختياري)</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              showAdvancedJson && "rotate-180",
                            )}
                          />
                        </button>
                        {showAdvancedJson ? (
                          <div className="border-t border-[#E5E7EB] px-4 py-3">
                            <AdminFormField
                              label="بيانات إضافية (JSON)"
                              hint="يستبدل الحقول المولدة أعلاه عند الحفظ."
                              error={errors.data ?? advancedJsonError ?? undefined}
                            >
                              <textarea
                                value={advancedJson}
                                onChange={(e) => {
                                  setAdvancedJson(e.target.value);
                                  setAdvancedJsonError(null);
                                }}
                                rows={6}
                                className={adminFieldClass(
                                  cn(
                                    adminTextareaClass,
                                    "text-start placeholder:text-start font-mono",
                                  ),
                                  Boolean(advancedJsonError),
                                )}
                              />
                            </AdminFormField>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <AdminFormField label="الأسماء البديلة">
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
                      {aliases.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {aliases.map((alias) => (
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

                    {allowStatusControl ? (
                      <AdminFormField label="الحالة" required>
                        <StyledSelect
                          value={status}
                          onChange={setStatus}
                          options={statusOptions}
                          placeholder="اختر الحالة"
                        />
                      </AdminFormField>
                    ) : (
                      <div className="rounded-[12px] border border-[#EEF2F6] bg-[#F9FAFB] px-4 py-3 font-cairo text-[12px] font-bold text-[#667085]">
                        تفعيل مزود الخدمة أو تعطيله متاح للإدارة فقط.
                      </div>
                    )}
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
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
