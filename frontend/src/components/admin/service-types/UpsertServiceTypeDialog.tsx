"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Trash2, Layers } from "lucide-react";
import { useEffect } from "react";
import type { Control, UseFormRegister, UseFormSetError } from "react-hook-form";
import { useFieldArray, useForm, useWatch, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateServiceType,
  useMutateServiceType,
} from "@/hooks/admin/services/useAdminServices";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import { extractFieldValidationErrors } from "@/lib/admin/adminWriteFlowErrors";
import { AppCheckbox } from "@/components/ui";
import { useToast } from "@/components/ui/ToastProvider";
import StyledSelect from "@/components/ui/styled-select";
import type { ServiceType, ServiceTypeField } from "@/lib/admin/types";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/form-field";
import { requiredLatinSlugSchema } from "@/lib/forms/slugValidation";
import { useI18n } from "@/i18n/provider";

/**
 * Script checks for bilingual service-type fields (API-3 accepts any string per locale object;
 * UX rule: EN inputs Latin-only, AR inputs Arabic-only — avoids pasted text in wrong column).
 */
const ARABIC_SCRIPT =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

function containsArabicScript(value: string): boolean {
  return ARABIC_SCRIPT.test(value);
}

function containsLatinLetters(value: string): boolean {
  return /[A-Za-z]/.test(value);
}

const MSG_EN_SCRIPT =
  "يجب أن يكون النص بالإنجليزية فقط: لا تُدخل حروفًا عربية في الحقول الإنجليزية.";
const MSG_AR_SCRIPT =
  "يجب أن يكون النص بالعربية فقط: لا تُدخل حروفًا لاتينية (إنجليزية) في الحقول العربية.";
const fieldTypes = [
  { value: "string" as const, label: "نص" },
  { value: "number" as const, label: "رقم" },
  { value: "boolean" as const, label: "نعم/لا" },
  { value: "array" as const, label: "مصفوفة" },
  { value: "object" as const, label: "كائن" },
];

const formSchema = z.object({
  nameEn: z
    .string()
    .min(1, "مطلوب")
    .refine((s) => !containsArabicScript(s), MSG_EN_SCRIPT),
  nameAr: z
    .string()
    .min(1, "مطلوب")
    .refine((s) => !containsLatinLetters(s), MSG_AR_SCRIPT),
  slug: requiredLatinSlugSchema("مطلوب"),
  descEn: z
    .string()
    .optional()
    .refine(
      (s) => !(s ?? "").trim() || !containsArabicScript(s),
      MSG_EN_SCRIPT,
    ),
  descAr: z
    .string()
    .optional()
    .refine(
      (s) => !(s ?? "").trim() || !containsLatinLetters(s),
      MSG_AR_SCRIPT,
    ),
  fields: z
    .array(
      z.object({
        key: z
          .string()
          .min(1, "مفتاح الحقل مطلوب")
          .regex(
            /^[A-Za-z][A-Za-z0-9_]*$/,
            "يجب أن يبدأ المفتاح بحرف لاتيني، ثم حروف/أرقام/شرطة سفلية فقط",
          ),
        labelEn: z
          .string()
          .min(1, "مطلوب")
          .refine((s) => !containsArabicScript(s), MSG_EN_SCRIPT),
        labelAr: z
          .string()
          .min(1, "مطلوب")
          .refine((s) => !containsLatinLetters(s), MSG_AR_SCRIPT),
        type: z.enum(["string", "number", "boolean", "array", "object"]),
        required: z.boolean(),
        isPublic: z.boolean(),
        /** Comma-separated list; only meaningful for string/number types. */
        enumValues: z.string().optional(),
        min: z.string().optional(),
        max: z.string().optional(),
        regex: z.string().optional(),
      }),
    )
    .min(1, "أضف حقلاً schema واحداً على الأقل"),
});

type FormValues = z.infer<typeof formSchema>;

function toFormValues(st: ServiceType): FormValues {
  const name = st.name;
  const nameEn = typeof name === "string" ? name : (name?.en ?? "");
  const nameAr = typeof name === "string" ? name : (name?.ar ?? "");
  const d = st.description;
  const descEn =
    d === undefined ? "" : typeof d === "string" ? d : (d?.en ?? "");
  const descAr =
    d === undefined ? "" : typeof d === "string" ? d : (d?.ar ?? "");
  return {
    nameEn,
    nameAr,
    slug: st.slug,
    descEn,
    descAr,
    fields: (st.fields?.length
      ? st.fields
      : [
          {
            key: "name",
            label: { en: "Name", ar: "الاسم" },
            type: "string",
            required: true,
            isPublic: true,
          } as ServiceTypeField,
        ]
    ).map((f) => ({
      key: f.key,
      labelEn: typeof f.label === "string" ? f.label : (f.label?.en ?? ""),
      labelAr: typeof f.label === "string" ? f.label : (f.label?.ar ?? ""),
      type: f.type,
      required: !!f.required,
      isPublic: f.isPublic !== false,
      enumValues: f.enum?.length ? f.enum.map((v) => String(v)).join(", ") : "",
      min: f.min !== undefined ? String(f.min) : "",
      max: f.max !== undefined ? String(f.max) : "",
      regex: f.regex ?? "",
    })),
  };
}

const defaultCreate: FormValues = {
  nameEn: "",
  nameAr: "",
  slug: "",
  descEn: "",
  descAr: "",
  fields: [
    {
      key: "name",
      labelEn: "Name",
      labelAr: "الاسم",
      type: "string",
      required: true,
      isPublic: true,
      enumValues: "",
      min: "",
      max: "",
      regex: "",
    },
  ],
};

/** min/max/regex/enum only apply to string/number types; object/boolean/array
 * cannot be searchable/filterable/sortable per the backend guardrails, so these
 * capabilities are hidden for them in the UI (see fieldSupportsConstraints). */
function fieldSupportsConstraints(type: FormValues["fields"][0]["type"]): boolean {
  return type === "string" || type === "number";
}

function formToServiceTypeField(
  row: FormValues["fields"][0],
): ServiceTypeField {
  const supportsConstraints = fieldSupportsConstraints(row.type);
  const enumValues = supportsConstraints
    ? (row.enumValues ?? "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];
  const min = supportsConstraints && row.min?.trim() ? Number(row.min) : undefined;
  const max = supportsConstraints && row.max?.trim() ? Number(row.max) : undefined;
  const regex =
    supportsConstraints && row.regex?.trim() ? row.regex.trim() : undefined;

  return {
    key: row.key.trim(),
    label: { en: row.labelEn.trim(), ar: row.labelAr.trim() },
    type: row.type,
    required: row.required,
    isPublic: row.isPublic,
    enum: enumValues.length > 0 ? enumValues : undefined,
    min,
    max,
    regex,
  };
}

/** Maps a server 422 `{ [path]: message }` map (see `extractFieldValidationErrors`)
 * onto the corresponding rendered form control so the person editing sees the
 * exact reason next to the exact field, instead of one generic banner. Handles:
 * - top-level bilingual objects: `name.ar` / `name.en` / `description.ar` / `description.en`
 * - simple top-level keys: `slug`
 * - schema field rows, in either express-validator array path style:
 *   `fields[0].key` or `fields.0.key`, plus their bilingual `label.en`/`label.ar`
 * Anything unrecognized is left for the generic `serverError` banner to surface. */
const TOP_LEVEL_BILINGUAL_MAP: Record<string, keyof FormValues> = {
  "name.ar": "nameAr",
  "name.en": "nameEn",
  "description.ar": "descAr",
  "description.en": "descEn",
};

const FIELD_ROW_KEY_MAP: Record<string, string> = {
  key: "key",
  "label.ar": "labelAr",
  "label.en": "labelEn",
  type: "type",
  required: "required",
  isPublic: "isPublic",
  enum: "enumValues",
  min: "min",
  max: "max",
  regex: "regex",
};

function applyServerFieldErrors(
  serverErrors: Record<string, string>,
  setError: UseFormSetError<FormValues>,
) {
  const fieldRowPattern = /^fields(?:\[(\d+)\]|\.(\d+))\.(.+)$/;

  for (const [path, message] of Object.entries(serverErrors)) {
    if (path === "slug") {
      setError("slug", { type: "server", message });
      continue;
    }
    if (path in TOP_LEVEL_BILINGUAL_MAP) {
      setError(TOP_LEVEL_BILINGUAL_MAP[path], { type: "server", message });
      continue;
    }

    const rowMatch = fieldRowPattern.exec(path);
    if (rowMatch) {
      const index = Number(rowMatch[1] ?? rowMatch[2]);
      const subPath = rowMatch[3];
      const mappedKey = FIELD_ROW_KEY_MAP[subPath];
      if (mappedKey && Number.isInteger(index)) {
        setError(`fields.${index}.${mappedKey}` as `fields.${number}.key`, {
          type: "server",
          message,
        });
      }
    }
    // "fields" (the whole array) and anything else unmapped fall through to the
    // generic `serverError` banner rendered below the form.
  }
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTarget?: ServiceType | null;
  onSuccess?: () => void;
};

export default function UpsertServiceTypeDialog({
  open,
  onOpenChange,
  editTarget,
  onSuccess,
}: Props) {
  const { locale, dir } = useI18n();
  const { toast } = useToast();
  const isEdit = !!editTarget?._id;
  const createMut = useCreateServiceType();
  const updateMut = useMutateServiceType();
  const busy = createMut.isPending || updateMut.isPending;
  const serverErr = createMut.error ?? updateMut.error;
  const serverError = serverErr ? userFacingErrorMessage(serverErr) : undefined;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultCreate,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "fields" });

  useEffect(() => {
    if (!open) return;
    if (editTarget) {
      reset(toFormValues(editTarget));
    } else {
      reset(defaultCreate);
    }
  }, [open, editTarget, reset]);

  useEffect(() => {
    if (!open) return;
    const p = document.body.style.overflow;
    const pr = document.body.style.paddingRight;
    const w = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (w > 0) document.body.style.paddingRight = `${w}px`;
    return () => {
      document.body.style.overflow = p;
      document.body.style.paddingRight = pr;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[10030] flex items-center justify-center bg-black/45 backdrop-blur-[2px] px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-type-dialog-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busy) {
              onOpenChange(false);
              reset(defaultCreate);
            }
          }}
        >
          <motion.div
            className="relative flex max-h-[min(90vh,760px)] w-full max-w-[640px] flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            dir={dir}
            lang={locale}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#F2F4F7] bg-white/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/80">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <h2
                  id="service-type-dialog-title"
                  className="font-cairo text-[18px] font-extrabold text-[#101828]"
                >
                  {isEdit ? "تعديل نوع الخدمة" : "إضافة نوع خدمة"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  reset(defaultCreate);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#F2F4F7]"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={handleSubmit(async (values) => {
                const body = {
                  name: { en: values.nameEn.trim(), ar: values.nameAr.trim() },
                  slug: values.slug.trim(),
                  description:
                    values.descEn?.trim() || values.descAr?.trim()
                      ? {
                          en: (values.descEn ?? "").trim(),
                          ar: (values.descAr ?? "").trim(),
                        }
                      : undefined,
                  fields: values.fields.map(formToServiceTypeField),
                };
                try {
                  if (isEdit && editTarget) {
                    await updateMut.mutateAsync({ id: editTarget._id, body });
                    toast(
                      `تم حفظ تعديلات نوع الخدمة «${values.nameAr.trim() || values.nameEn.trim()}» والحقول المرتبطة به.`,
                      {
                        title: "تم التعديل",
                        variant: "success",
                        durationMs: 4000,
                      },
                    );
                  } else {
                    await createMut.mutateAsync(body);
                    toast(
                      `أُضيف نوع الخدمة «${values.nameAr.trim() || values.nameEn.trim()}» إلى النظام. راجع حالة التفعيل عند الحاجة.`,
                      {
                        title: "تمت الإضافة",
                        variant: "success",
                        durationMs: 4000,
                      },
                    );
                  }
                  onOpenChange(false);
                  onSuccess?.();
                } catch (err) {
                  const fieldErrors = extractFieldValidationErrors(err);
                  if (fieldErrors) applyServerFieldErrors(fieldErrors, setError);
                  /* أي خطأ غير مُعرَّف على حقل محدد يظهر عبر serverError أدناه */
                }
              })}
            >
              <div className="min-h-0 flex-1 overflow-hidden px-2 py-2">
                <div className="max-h-[calc(min(90vh,760px)-148px)] space-y-5 overflow-y-auto px-4 py-3 overscroll-contain scroll-smooth [scrollbar-color:#0f8f8b_#E5E7EB] [scrollbar-width:thin] sm:px-5 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#E5E7EB] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/75 [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-[#E5E7EB] hover:[&::-webkit-scrollbar-thumb]:bg-primary">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AdminFormField
                    label="الاسم (عربي)"
                    required
                    error={errors.nameAr?.message}
                  >
                    <input
                      {...register("nameAr")}
                      aria-label="الاسم (عربي)"
                      className={adminFieldClass(
                        adminInputClass,
                        Boolean(errors.nameAr),
                      )}
                      placeholder="مثال: مختبرات"
                    />
                  </AdminFormField>
                  <AdminFormField
                    label="الاسم (English)"
                    required
                    error={errors.nameEn?.message}
                  >
                    <input
                      {...register("nameEn")}
                      aria-label="الاسم (English)"
                      className={adminFieldClass(
                        adminInputClass,
                        Boolean(errors.nameEn),
                      )}
                      dir="ltr"
                      placeholder="e.g. Laboratory"
                    />
                  </AdminFormField>
                </div>
                <AdminFormField
                  label="Slug"
                  required
                  error={errors.slug?.message}
                >
                    <input
                      {...register("slug")}
                      aria-label="Slug"
                      className={adminFieldClass(
                        adminInputClass,
                        Boolean(errors.slug),
                      )}
                      dir="ltr"
                      disabled={isEdit}
                      placeholder="lab"
                    />
                  {isEdit && (
                    <p className="mt-1 text-right font-cairo text-[11px] text-[#98A2B3]">
                      لا يُنصح بتغيير الـ slug بعد الربط.
                    </p>
                  )}
                </AdminFormField>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AdminFormField
                    label="وصف (عربي)"
                    error={errors.descAr?.message}
                  >
                    <textarea
                      {...register("descAr")}
                      aria-label="وصف (عربي)"
                      rows={2}
                      className={adminTextareaClass}
                      placeholder="اختياري"
                    />
                  </AdminFormField>
                  <AdminFormField
                    label="وصف (English)"
                    error={errors.descEn?.message}
                  >
                    <textarea
                      {...register("descEn")}
                      aria-label="وصف (English)"
                      rows={2}
                      className={adminTextareaClass}
                      dir="ltr"
                      placeholder="optional"
                    />
                  </AdminFormField>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-cairo text-[12px] font-bold text-[#344054]">
                        حقول الـ schema
                      </span>
                      <span className="text-red-500">*</span>
                    </div>
                    {typeof errors.fields?.message === "string" && (
                      <p className="text-right font-cairo text-[11px] text-red-600">
                        {errors.fields.message}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        append({
                          key: `field_${fields.length + 1}`,
                          labelEn: "Field",
                          labelAr: "حقل",
                          type: "string",
                          required: false,
                          isPublic: true,
                          enumValues: "",
                          min: "",
                          max: "",
                          regex: "",
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-[8px] border border-primary/30 bg-[#E7FBFA] px-2 py-1.5 font-cairo text-[11px] font-extrabold text-primary transition hover:bg-primary/10"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      إضافة حقل
                    </button>
                  </div>
                  <div className="space-y-3 rounded-[12px] border border-[#E9EEF2] bg-[#FAFBFC] p-3">
                    {fields.map((row, index) => (
                      <div
                        key={row.id}
                        className="rounded-[10px] border border-white bg-white p-3 shadow-sm"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-cairo text-[12px] font-extrabold text-primary">
                            حقل {index + 1}
                          </span>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="rounded-[6px] p-1.5 text-[#EF4444] hover:bg-red-50"
                              aria-label="حذف الحقل"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <AdminFormField
                            label="key"
                            required
                            error={errors.fields?.[index]?.key?.message}
                          >
                            <input
                              {...register(`fields.${index}.key` as const)}
                              aria-label={`key حقل ${index + 1}`}
                              className={adminFieldClass(
                                adminInputClass,
                                Boolean(errors.fields?.[index]?.key),
                              )}
                              dir="ltr"
                            />
                          </AdminFormField>
                          <AdminFormField
                            label="النوع"
                            required
                            error={errors.fields?.[index]?.type?.message}
                          >
                            <Controller
                              control={control}
                              name={`fields.${index}.type`}
                              render={({ field }) => (
                                <StyledSelect
                                  options={fieldTypes.map((o) => ({
                                    value: o.value,
                                    label: o.label,
                                  }))}
                                  value={field.value}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  triggerClassName={adminInputClass}
                                  listboxAriaLabel={`نوع حقل ${index + 1}`}
                                />
                              )}
                            />
                          </AdminFormField>
                          <AdminFormField
                            label="تسمية (عربي)"
                            required
                            error={errors.fields?.[index]?.labelAr?.message}
                          >
                            <input
                              {...register(`fields.${index}.labelAr` as const)}
                              aria-label={`تسمية عربية لحقل ${index + 1}`}
                              className={adminFieldClass(
                                adminInputClass,
                                Boolean(errors.fields?.[index]?.labelAr),
                              )}
                            />
                          </AdminFormField>
                          <AdminFormField
                            label="Label (EN)"
                            required
                            error={errors.fields?.[index]?.labelEn?.message}
                          >
                            <input
                              {...register(`fields.${index}.labelEn` as const)}
                              aria-label={`تسمية إنجليزية لحقل ${index + 1}`}
                              className={adminFieldClass(
                                adminInputClass,
                                Boolean(errors.fields?.[index]?.labelEn),
                              )}
                              dir="ltr"
                            />
                          </AdminFormField>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center justify-end gap-4">
                          <label className="inline-flex cursor-pointer items-center gap-2 font-cairo text-[12px] font-semibold text-[#344054]">
                            <Controller
                              control={control}
                              name={`fields.${index}.required`}
                              render={({ field: { value, onChange, ref } }) => (
                                <AppCheckbox
                                  ref={ref}
                                  size="sm"
                                  checked={value}
                                  onChange={(e) => onChange(e.target.checked)}
                                />
                              )}
                            />
                            مطلوب
                          </label>
                          <label className="inline-flex cursor-pointer items-center gap-2 font-cairo text-[12px] font-semibold text-[#344054]">
                            <Controller
                              control={control}
                              name={`fields.${index}.isPublic`}
                              render={({ field: { value, onChange, ref } }) => (
                                <AppCheckbox
                                  ref={ref}
                                  size="sm"
                                  checked={value}
                                  onChange={(e) => onChange(e.target.checked)}
                                />
                              )}
                            />
                            حقل عام (isPublic)
                          </label>
                        </div>
                        <FieldConstraintsRow
                          control={control}
                          register={register}
                          index={index}
                          errors={errors.fields?.[index]}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {isEdit && editTarget && (
                  <p className="text-right font-cairo text-[12px] font-semibold text-[#667085]">
                    schemaVersion الحالي: {editTarget.schemaVersion}
                  </p>
                )}

                {serverError && (
                  <div className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-right font-cairo text-[12px] font-bold text-red-800">
                    {serverError}
                  </div>
                )}
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#F2F4F7] bg-white/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    reset(defaultCreate);
                  }}
                  className="h-11 rounded-[10px] border border-[#E5E7EB] bg-white px-5 font-cairo text-[13px] font-extrabold text-[#344054] hover:bg-[#F9FAFB] disabled:opacity-50"
                  disabled={busy}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="h-11 rounded-[10px] bg-primary px-6 font-cairo text-[13px] font-extrabold text-white shadow-[0_8px_24px_rgba(15,143,139,0.3)] transition hover:brightness-105 disabled:opacity-50"
                >
                  {busy ? "جاري الحفظ…" : isEdit ? "حفظ التعديل" : "إنشاء"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * enum/min/max/regex are only meaningful for string/number fields — object and
 * geo_point-less array/boolean fields cannot be searchable/filterable/sortable
 * per the backend guardrails, so these inputs are hidden rather than sent as
 * dead weight. Isolated as its own component so only this row re-renders on
 * type change (useWatch is scoped to a single field path).
 */
function FieldConstraintsRow({
  control,
  register,
  index,
  errors,
}: {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  index: number;
  errors?: {
    enumValues?: { message?: string };
    regex?: { message?: string };
    min?: { message?: string };
    max?: { message?: string };
  };
}) {
  const type = useWatch({ control, name: `fields.${index}.type` });
  if (!fieldSupportsConstraints(type)) return null;

  return (
    <div className="mt-3 grid grid-cols-1 gap-2 border-t border-[#F2F4F7] pt-3 sm:grid-cols-2">
      <AdminFormField
        label="القيم المسموحة (enum)"
        hint="افصل بفاصلة، اتركه فارغاً إن لم يكن مطلوباً"
        error={errors?.enumValues?.message}
      >
        <input
          {...register(`fields.${index}.enumValues` as const)}
          aria-label={`enum حقل ${index + 1}`}
          className={adminFieldClass(adminInputClass, Boolean(errors?.enumValues))}
          dir="ltr"
          placeholder="a, b, c"
        />
      </AdminFormField>
      <AdminFormField label="النمط (regex)" error={errors?.regex?.message}>
        <input
          {...register(`fields.${index}.regex` as const)}
          aria-label={`regex حقل ${index + 1}`}
          className={adminFieldClass(adminInputClass, Boolean(errors?.regex))}
          dir="ltr"
        />
      </AdminFormField>
      <AdminFormField label="الحد الأدنى (min)" error={errors?.min?.message}>
        <input
          type="number"
          {...register(`fields.${index}.min` as const)}
          aria-label={`min حقل ${index + 1}`}
          className={adminFieldClass(adminInputClass, Boolean(errors?.min))}
          dir="ltr"
        />
      </AdminFormField>
      <AdminFormField label="الحد الأقصى (max)" error={errors?.max?.message}>
        <input
          type="number"
          {...register(`fields.${index}.max` as const)}
          aria-label={`max حقل ${index + 1}`}
          className={adminFieldClass(adminInputClass, Boolean(errors?.max))}
          dir="ltr"
        />
      </AdminFormField>
    </div>
  );
}
