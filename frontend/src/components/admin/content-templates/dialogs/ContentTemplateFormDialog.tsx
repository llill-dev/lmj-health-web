"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Save, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateAdminContentTemplate,
  useUpdateAdminContentTemplate,
} from "@/hooks/admin/content-templates/useAdminContentTemplates";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import { useToast } from "@/components/ui/ToastProvider";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
} from "@/components/admin/form-field";
import StyledSelect from "@/components/ui/styled-select";
import { cn } from "@/lib/utils/utils";
import type {
  AdminContentTemplate,
  AdminContentTemplateParentType,
  CreateAdminContentTemplateBody,
} from "@/lib/admin/types";

const fieldSchema = z.object({
  key: z
    .string()
    .min(1, "مفتاح الحقل مطلوب")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "المفتاح: حروف لاتينية وأرقام وشرطة سفلية",
    ),
  label: z.string().optional(),
  type: z.enum(["text", "textarea", "number", "date", "boolean", "select"]),
  required: z.boolean(),
});

const formSchema = z.object({
  name: z.string().min(1, "اسم القالب مطلوب"),
  slug: z
    .string()
    .optional()
    .refine((s) => !s || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s), {
      message: "المعرّف: أحرف لاتينية صغيرة وأرقام وشرطات",
    }),
  parentType: z.enum(["CONDITION", "SYMPTOM", "GENERAL_ADVICE", "MEDICATION"]),
  fields: z.array(fieldSchema),
});

type FormValues = z.infer<typeof formSchema>;

const parentTypeOptions: {
  value: AdminContentTemplateParentType;
  label: string;
}[] = [
  { value: "CONDITION", label: "الحالات الطبية" },
  { value: "SYMPTOM", label: "الأعراض" },
  { value: "GENERAL_ADVICE", label: "نصائح عامة" },
  { value: "MEDICATION", label: "الأدوية" },
];

const fieldTypeOptions = [
  { value: "text", label: "نص قصير" },
  { value: "textarea", label: "نص طويل" },
  { value: "number", label: "رقم" },
  { value: "date", label: "تاريخ" },
  { value: "boolean", label: "قيمة منطقية" },
  { value: "select", label: "قائمة اختيار" },
];

const EMPTY_FORM: FormValues = {
  name: "",
  slug: "",
  parentType: "CONDITION",
  fields: [],
};

function templateToForm(template: AdminContentTemplate): FormValues {
  const parent = (
    ["CONDITION", "SYMPTOM", "GENERAL_ADVICE", "MEDICATION"] as const
  ).includes(template.parentType as AdminContentTemplateParentType)
    ? (template.parentType as AdminContentTemplateParentType)
    : "CONDITION";
  return {
    name: template.name ?? "",
    slug: template.slug ?? "",
    parentType: parent,
    fields: (template.fields ?? []).map((f) => {
      const rawLabel =
        typeof f.label === "string"
          ? f.label
          : (f.label?.ar ?? f.label?.en ?? "");
      const allowed = [
        "text",
        "textarea",
        "number",
        "date",
        "boolean",
        "select",
      ];
      return {
        key: f.key ?? "",
        label: rawLabel,
        type: (allowed.includes(String(f.type)) ? f.type : "text") as
          | "text"
          | "textarea"
          | "number"
          | "date"
          | "boolean"
          | "select",
        required: Boolean(f.required),
      };
    }),
  };
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** عند تمريره يتحوّل الحوار لوضع التحرير. */
  template?: AdminContentTemplate | null;
};

export default function ContentTemplateFormDialog({
  open,
  onOpenChange,
  template,
}: Props) {
  const { toast } = useToast();
  const isEdit = Boolean(template?._id);
  const createMut = useCreateAdminContentTemplate();
  const updateMut = useUpdateAdminContentTemplate();
  const activeMut = isEdit ? updateMut : createMut;
  const submitting = activeMut.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_FORM,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "fields" });

  useEffect(() => {
    if (open) {
      reset(template ? templateToForm(template) : EMPTY_FORM);
      createMut.reset();
      updateMut.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, template]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onOpenChange(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange, submitting]);

  const onSubmit = handleSubmit(async (v) => {
    const body: CreateAdminContentTemplateBody = {
      name: v.name.trim(),
      slug: v.slug?.trim() || undefined,
      parentType: v.parentType,
      fields: v.fields.map((f) => ({
        key: f.key.trim(),
        label: f.label?.trim() || undefined,
        type: f.type,
        required: f.required,
      })),
    };
    try {
      if (isEdit && template) {
        await updateMut.mutateAsync({ id: template._id, body });
        toast(`حُدّث القالب «${body.name}».`, {
          title: "تم التحديث",
          variant: "success",
        });
      } else {
        await createMut.mutateAsync(body);
        toast(`أُضيف القالب «${body.name}».`, {
          title: "تم الإنشاء",
          variant: "success",
        });
      }
      onOpenChange(false);
    } catch {
      // الخطأ يظهر عبر activeMut.isError
    }
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={isEdit ? "تعديل قالب بيانات" : "إضافة قالب بيانات"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              onOpenChange(false);
            }
          }}
        >
          <motion.div
            className="relative max-h-[min(92vh,920px)] w-full max-w-[680px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
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
                disabled={submitting}
                className="absolute left-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <div className="relative text-right">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {isEdit ? "تعديل قالب البيانات" : "إضافة قالب بيانات"}
                </h2>
                <p className="mt-1 font-cairo text-[13px] font-semibold text-[#5B7B79]">
                  عرّف حقول البيانات الوصفية التي يملؤها فريق المحتوى لهذا
                  النوع.
                </p>
              </div>
            </div>

            <form dir="rtl" onSubmit={onSubmit}>
              <div className="max-h-[calc(92vh-240px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <AdminFormField
                      label="اسم القالب"
                      required
                      error={errors.name?.message}
                    >
                      <input
                        {...register("name")}
                        placeholder="اسم واضح للقالب"
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
                      label="النوع الأب"
                      required
                      error={errors.parentType?.message}
                    >
                      <Controller
                        name="parentType"
                        control={control}
                        render={({ field }) => (
                          <StyledSelect
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            options={parentTypeOptions}
                            placeholder="اختر النوع"
                            listboxAriaLabel="النوع الأب"
                          />
                        )}
                      />
                    </AdminFormField>
                  </div>

                  <AdminFormField
                    label="Slug (اختياري)"
                    error={errors.slug?.message}
                  >
                    <input
                      {...register("slug")}
                      dir="ltr"
                      placeholder="my-template"
                      className={adminFieldClass(
                        cn(adminInputClass),
                        Boolean(errors.slug),
                      )}
                    />
                  </AdminFormField>

                  <div className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFBFC] p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                        حقول القالب
                        <span className="mr-2 rounded-full bg-[#EEF2F6] px-2 py-0.5 font-cairo text-[11px] font-bold text-[#667085]">
                          {fields.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          append({
                            key: "",
                            label: "",
                            type: "text",
                            required: false,
                          })
                        }
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[10px] border border-primary bg-white px-3 font-cairo text-[12px] font-extrabold text-primary transition hover:bg-[#F0FDFA]"
                      >
                        <Plus className="h-4 w-4" aria-hidden />
                        إضافة حقل
                      </button>
                    </div>

                    {fields.length === 0 ? (
                      <p className="mt-3 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                        لا توجد حقول بعد. أضف حقلاً لتعريف بنية البيانات.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {fields.map((row, index) => (
                          <div
                            key={row.id}
                            className="rounded-[12px] border border-[#EEF2F6] bg-white p-3"
                          >
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <AdminFormField
                                label="المفتاح"
                                required
                                error={errors.fields?.[index]?.key?.message}
                              >
                                <input
                                  {...register(`fields.${index}.key` as const)}
                                  dir="ltr"
                                  placeholder="fieldKey"
                                  className={adminFieldClass(
                                    cn(adminInputClass),
                                    Boolean(errors.fields?.[index]?.key),
                                  )}
                                />
                              </AdminFormField>

                              <AdminFormField label="التسمية (اختياري)">
                                <input
                                  {...register(
                                    `fields.${index}.label` as const,
                                  )}
                                  placeholder="تسمية ظاهرة للحقل"
                                  className={adminFieldClass(
                                    cn(
                                      adminInputClass,
                                      "text-start placeholder:text-start",
                                    ),
                                    false,
                                  )}
                                />
                              </AdminFormField>
                            </div>

                            <div className="mt-3 flex flex-wrap items-end gap-3">
                              <div className="min-w-[180px] flex-1">
                                <AdminFormField label="النوع">
                                  <Controller
                                    name={`fields.${index}.type` as const}
                                    control={control}
                                    render={({ field }) => (
                                      <StyledSelect
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        options={fieldTypeOptions}
                                        placeholder="نوع الحقل"
                                        listboxAriaLabel="نوع الحقل"
                                      />
                                    )}
                                  />
                                </AdminFormField>
                              </div>

                              <label className="inline-flex h-[44px] cursor-pointer items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#344054]">
                                <input
                                  type="checkbox"
                                  {...register(
                                    `fields.${index}.required` as const,
                                  )}
                                  className="h-4 w-4 accent-[#0F8F8B]"
                                />
                                إلزامي
                              </label>

                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[10px] border border-[#FECACA] text-[#EF4444] transition hover:bg-[#FEF2F2]"
                                aria-label="حذف الحقل"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {activeMut.isError ? (
                    <div className="rounded-[12px] border border-[#FECDCA] bg-red-50 px-4 py-3 text-right font-cairo text-[12px] font-bold text-red-600">
                      {userFacingErrorMessage(
                        activeMut.error,
                        isEdit ? "تعذّر التحديث" : "تعذّر الإنشاء",
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#EEF2F6] px-8 py-5">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                  className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                >
                  <Save className="h-4 w-4" aria-hidden />
                  {submitting
                    ? "جارٍ الحفظ…"
                    : isEdit
                      ? "حفظ التعديلات"
                      : "حفظ القالب"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
