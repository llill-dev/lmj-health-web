"use client";

import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import {
  Controller,
  type Control,
  type FieldValues,
  type UseFieldArrayReturn,
  type UseFormClearErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/form-field";
import StyledSelect from "@/components/ui/styled-select";
import { cn } from "@/lib/utils/utils";
import {
  CALL_OUT_VARIANT_OPTIONS,
  CONTENT_BLOCK_TYPE_OPTIONS,
  HEADING_LEVEL_OPTIONS,
  createEmptyBlock,
  faqItemsToText,
  getBlockValidationMessage,
  getLinkCardUrlValidationMessage,
  type BlockFormValue,
  type FaqFormItem,
  type SupportedBlockType,
} from "./contentBlockEditor.helpers";

type ContentBlockEditorProps<
  TFormValues extends FieldValues & { contentBlocks: BlockFormValue[] },
> = {
  control: Control<TFormValues>;
  register: UseFormRegister<TFormValues>;
  setValue: UseFormSetValue<TFormValues>;
  clearErrors: UseFormClearErrors<TFormValues>;
  // `ArrayPath<TFormValues>` can't be resolved against this open, bounded
  // generic (see the widening cast below) — loosen the field-array typing
  // at the prop boundary rather than fighting react-hook-form's variance.
  fieldArray: UseFieldArrayReturn<
    FieldValues & { contentBlocks: BlockFormValue[] },
    "contentBlocks",
    "id"
  >;
  blocks: BlockFormValue[];
  error?: unknown;
  disabled?: boolean;
  title?: string;
  description?: string;
};

export default function ContentBlockEditor<
  TFormValues extends FieldValues & { contentBlocks: BlockFormValue[] },
>({
  control,
  register,
  setValue,
  clearErrors,
  fieldArray,
  blocks,
  error,
  disabled = false,
  title = "محتوى المقال",
  description = "أنشئ البلوكات الفعلية للمقال مع إبقاء جسم المقال منفصلًا عن بيانات القالب.",
}: ContentBlockEditorProps<TFormValues>) {
  // react-hook-form's generic `Path<TFormValues>` can't be statically resolved
  // against a bounded-but-open generic like `TFormValues extends FieldValues & {...}`.
  // This component only ever touches the `contentBlocks` slice via dynamic template-
  // literal paths, so we widen to the loose `FieldValues` shape internally while
  // keeping the exported props strictly typed for callers.
  const formControl = control as unknown as Control<FieldValues>;
  const formRegister = register as unknown as UseFormRegister<FieldValues>;
  const formSetValue = setValue as unknown as UseFormSetValue<FieldValues>;
  const formClearErrors =
    clearErrors as unknown as UseFormClearErrors<FieldValues>;
  const { fields, append, insert, remove, move } = fieldArray;
  const errorMessage =
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
      ? error.message
      : undefined;

  return (
    <div className="rounded-[14px] border border-[#E6ECF2] bg-[#FBFCFD] p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="text-right">
          <h3 className="font-cairo text-[15px] font-extrabold text-primary">
            {title}
          </h3>
          <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => append(createEmptyBlock())}
          disabled={disabled}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-primary/15 bg-white px-3 font-cairo text-[12px] font-extrabold text-primary disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden />
          إضافة بلوك
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const blockType = blocks[index]?.type || "paragraph";
          const blockError = getBlockValidationMessage(
            blocks[index] ?? createEmptyBlock(),
          );
          const linkCardUrlMessage =
            blockType === "linkCard"
              ? getLinkCardUrlValidationMessage(blocks[index]?.url)
              : "";

          return (
            <div
              key={field.id}
              className="rounded-[12px] border border-[#E6ECF2] bg-white p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Controller
                    name={`contentBlocks.${index}.type` as const}
                    control={formControl}
                    render={({ field: controlledField }) => (
                      <StyledSelect
                        value={controlledField.value}
                        onChange={(value) => {
                          formSetValue(
                            `contentBlocks.${index}` as const,
                            createEmptyBlock(value as SupportedBlockType) as TFormValues["contentBlocks"][number],
                          );
                          formClearErrors("contentBlocks");
                        }}
                        onBlur={controlledField.onBlur}
                        name={controlledField.name}
                        options={CONTENT_BLOCK_TYPE_OPTIONS.map((option) => ({
                          value: option.value,
                          label: option.label,
                        }))}
                        placeholder="نوع البلوك"
                        listboxAriaLabel={`نوع البلوك ${index + 1}`}
                        disabled={disabled}
                      />
                    )}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={disabled || index === 0}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E6ECF2] text-[#667085] disabled:opacity-40"
                    aria-label="تحريك لأعلى"
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={disabled || index === fields.length - 1}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E6ECF2] text-[#667085] disabled:opacity-40"
                    aria-label="تحريك لأسفل"
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insert(
                        index + 1,
                        { ...(blocks[index] ?? createEmptyBlock()) } as TFormValues["contentBlocks"][number],
                      )
                    }
                    disabled={disabled}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E6ECF2] text-[#667085] disabled:opacity-40"
                    aria-label="تكرار البلوك"
                  >
                    <Copy className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      fields.length === 1
                        ? formSetValue(
                            `contentBlocks.${index}` as const,
                            createEmptyBlock(),
                          )
                        : remove(index)
                    }
                    disabled={disabled}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#FECACA] text-red-600 disabled:opacity-50"
                    aria-label="حذف البلوك"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>

              {blockType === "heading" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
                  <Controller
                    name={`contentBlocks.${index}.level` as const}
                    control={formControl}
                    render={({ field: controlledField }) => (
                      <AdminFormField label="المستوى">
                        <StyledSelect
                          value={String(controlledField.value ?? 2)}
                          onChange={(value) => controlledField.onChange(Number(value))}
                          onBlur={controlledField.onBlur}
                          name={controlledField.name}
                          options={HEADING_LEVEL_OPTIONS.map((option) => ({
                            value: String(option.value),
                            label: option.label,
                          }))}
                          placeholder="مستوى العنوان"
                          listboxAriaLabel="مستوى العنوان"
                          disabled={disabled}
                        />
                      </AdminFormField>
                    )}
                  />
                  <AdminFormField label="نص العنوان">
                    <input
                      {...formRegister(`contentBlocks.${index}.text` as const)}
                      disabled={disabled}
                      placeholder="أدخل العنوان الفرعي"
                      className={adminFieldClass(
                        cn(adminInputClass, "text-start placeholder:text-start"),
                        false,
                      )}
                    />
                  </AdminFormField>
                </div>
              ) : null}

              {blockType === "paragraph" ? (
                <AdminFormField label="النص">
                  <textarea
                    {...formRegister(`contentBlocks.${index}.text` as const)}
                    disabled={disabled}
                    rows={4}
                    placeholder="اكتب الفقرة الأساسية للمقال…"
                    className={adminFieldClass(
                      cn(adminTextareaClass, "text-start placeholder:text-start"),
                      false,
                    )}
                  />
                </AdminFormField>
              ) : null}

              {blockType === "list" ? (
                <div className="space-y-4">
                  <AdminFormField label="عناصر القائمة">
                    <textarea
                      {...formRegister(`contentBlocks.${index}.itemsText` as const)}
                      disabled={disabled}
                      rows={4}
                      placeholder="ضع كل عنصر في سطر مستقل"
                      className={adminFieldClass(
                        cn(adminTextareaClass, "text-start placeholder:text-start"),
                        false,
                      )}
                    />
                  </AdminFormField>
                  <label className="flex items-center justify-end gap-2 font-cairo text-[12px] font-bold text-[#344054]">
                    <span>قائمة مرقّمة</span>
                    <input
                      {...formRegister(`contentBlocks.${index}.ordered` as const)}
                      type="checkbox"
                      disabled={disabled}
                      className="h-4 w-4 rounded border-[#D0D5DD]"
                    />
                  </label>
                </div>
              ) : null}

              {blockType === "callout" ? (
                <div className="space-y-4">
                  <Controller
                    name={`contentBlocks.${index}.variant` as const}
                    control={formControl}
                    render={({ field: controlledField }) => (
                      <AdminFormField label="نوع التنبيه">
                        <StyledSelect
                          value={controlledField.value ?? "info"}
                          onChange={controlledField.onChange}
                          onBlur={controlledField.onBlur}
                          name={controlledField.name}
                          options={CALL_OUT_VARIANT_OPTIONS.map((option) => ({
                            value: option.value,
                            label: option.label,
                          }))}
                          placeholder="نوع التنبيه"
                          listboxAriaLabel="نوع التنبيه"
                          disabled={disabled}
                        />
                      </AdminFormField>
                    )}
                  />
                  <AdminFormField label="عنوان التنبيه">
                    <input
                      {...formRegister(`contentBlocks.${index}.title` as const)}
                      disabled={disabled}
                      placeholder="مثال: متى يجب طلب المساعدة؟"
                      className={adminFieldClass(
                        cn(adminInputClass, "text-start placeholder:text-start"),
                        false,
                      )}
                    />
                  </AdminFormField>
                  <AdminFormField label="النص">
                    <textarea
                      {...formRegister(`contentBlocks.${index}.text` as const)}
                      disabled={disabled}
                      rows={3}
                      placeholder="اكتب محتوى التنبيه أو المعلومة…"
                      className={adminFieldClass(
                        cn(adminTextareaClass, "text-start placeholder:text-start"),
                        false,
                      )}
                    />
                  </AdminFormField>
                </div>
              ) : null}

              {blockType === "linkCard" ? (
                <div className="space-y-4">
                  <AdminFormField label="عنوان البطاقة">
                    <input
                      {...formRegister(`contentBlocks.${index}.title` as const)}
                      disabled={disabled}
                      placeholder="مثال: رابط إرشادي موثوق"
                      className={adminFieldClass(
                        cn(adminInputClass, "text-start placeholder:text-start"),
                        false,
                      )}
                    />
                  </AdminFormField>
                  <AdminFormField label="وصف مختصر">
                    <textarea
                      {...formRegister(`contentBlocks.${index}.description` as const)}
                      disabled={disabled}
                      rows={3}
                      placeholder="ملخص قصير لما سيفتحه الرابط..."
                      className={adminFieldClass(
                        cn(adminTextareaClass, "text-start placeholder:text-start"),
                        false,
                      )}
                    />
                  </AdminFormField>
                  <AdminFormField label="الرابط">
                    <input
                      {...formRegister(`contentBlocks.${index}.url` as const)}
                      disabled={disabled}
                      dir="ltr"
                      placeholder="https://example.com"
                      aria-invalid={Boolean(linkCardUrlMessage)}
                      className={adminFieldClass(
                        cn(adminInputClass),
                        Boolean(linkCardUrlMessage),
                      )}
                    />
                  </AdminFormField>
                  {linkCardUrlMessage ? (
                    <p className="mt-1 text-right font-cairo text-[12px] font-bold text-red-600">
                      {linkCardUrlMessage}
                    </p>
                  ) : (
                    <p className="mt-1 text-right font-cairo text-[11px] font-semibold text-[#667085]">
                      يُفضّل استخدام روابط عامة موثوقة تبدأ بـ https://
                    </p>
                  )}
                </div>
              ) : null}

              {blockType === "faq" ? (
                <Controller
                  name={`contentBlocks.${index}.faqItems` as const}
                  control={formControl}
                  render={({ field: controlledField }) => {
                    const faqItems =
                      Array.isArray(controlledField.value) &&
                      controlledField.value.length
                        ? controlledField.value
                        : ([{ question: "", answer: "" }] as FaqFormItem[]);

                    const updateFaqItems = (nextItems: FaqFormItem[]) => {
                      controlledField.onChange(nextItems);
                      formSetValue(
                        `contentBlocks.${index}.faqItemsText` as const,
                        faqItemsToText(nextItems) as TFormValues[keyof TFormValues],
                      );
                      formClearErrors("contentBlocks");
                    };

                    return (
                      <div className="space-y-3">
                        <AdminFormField
                          label="الأسئلة والإجابات"
                          hint="أضف كل سؤال مع إجابته بشكل منفصل لرفع جودة المحتوى."
                        >
                          <div className="space-y-3">
                            {faqItems.map((item, faqIndex) => (
                              <div
                                key={`faq-item-${field.id}-${faqIndex}`}
                                className="rounded-[12px] border border-[#E4E7EC] bg-[#F9FAFB] p-3"
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="font-cairo text-[12px] font-extrabold text-[#344054]">
                                    عنصر FAQ {faqIndex + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateFaqItems(
                                        faqItems.length === 1
                                          ? [{ question: "", answer: "" }]
                                          : faqItems.filter((_, i) => i !== faqIndex),
                                      )
                                    }
                                    disabled={disabled}
                                    className="inline-flex h-7 items-center justify-center rounded-[8px] border border-[#FECACA] px-2 font-cairo text-[11px] font-bold text-red-600 disabled:opacity-50"
                                  >
                                    حذف
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  <input
                                    value={item.question}
                                    onChange={(event) =>
                                      updateFaqItems(
                                        faqItems.map((entry, i) =>
                                          i === faqIndex
                                            ? { ...entry, question: event.target.value }
                                            : entry,
                                        ),
                                      )
                                    }
                                    disabled={disabled}
                                    placeholder="السؤال"
                                    className={adminFieldClass(
                                      cn(adminInputClass, "text-start placeholder:text-start"),
                                      false,
                                    )}
                                  />
                                  <textarea
                                    value={item.answer}
                                    onChange={(event) =>
                                      updateFaqItems(
                                        faqItems.map((entry, i) =>
                                          i === faqIndex
                                            ? { ...entry, answer: event.target.value }
                                            : entry,
                                        ),
                                      )
                                    }
                                    disabled={disabled}
                                    rows={3}
                                    placeholder="الإجابة"
                                    className={adminFieldClass(
                                      cn(adminTextareaClass, "text-start placeholder:text-start"),
                                      false,
                                    )}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </AdminFormField>
                        <button
                          type="button"
                          onClick={() =>
                            updateFaqItems([...faqItems, { question: "", answer: "" }])
                          }
                          disabled={disabled}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-primary/20 bg-white px-3 font-cairo text-[12px] font-extrabold text-primary disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" aria-hidden />
                          إضافة سؤال
                        </button>
                      </div>
                    );
                  }}
                />
              ) : null}

              {blockType === "divider" ? (
                <div className="rounded-[10px] border border-dashed border-[#D0D5DD] bg-[#F9FAFB] px-4 py-3 text-right font-cairo text-[12px] font-bold text-[#667085]">
                  سيتم إدراج فاصل بصري بين أجزاء المقال.
                </div>
              ) : null}

              {blockError ? (
                <p className="mt-3 text-right font-cairo text-[12px] font-bold text-red-600">
                  {blockError}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {errorMessage ? (
        <p className="mt-4 text-right font-cairo text-[12px] font-bold text-red-600">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
