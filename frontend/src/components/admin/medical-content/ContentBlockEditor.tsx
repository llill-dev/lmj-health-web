"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
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
  getBlockValidationMessage,
  type BlockFormValue,
  type SupportedBlockType,
} from "./contentBlockEditor.helpers";

type ContentBlockEditorProps<
  TFormValues extends FieldValues & { contentBlocks: BlockFormValue[] },
> = {
  control: Control<TFormValues>;
  register: UseFormRegister<TFormValues>;
  setValue: UseFormSetValue<TFormValues>;
  clearErrors: UseFormClearErrors<TFormValues>;
  fieldArray: UseFieldArrayReturn<TFormValues, "contentBlocks", "id">;
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
  const { fields, append, remove, move } = fieldArray;
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
          onClick={() =>
            append(createEmptyBlock() as TFormValues["contentBlocks"][number])
          }
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
          const blockError = getBlockValidationMessage(blocks[index] ?? createEmptyBlock());

          return (
            <div
              key={field.id}
              className="rounded-[12px] border border-[#E6ECF2] bg-white p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Controller
                    name={`contentBlocks.${index}.type` as const}
                    control={control}
                    render={({ field: controlledField }) => (
                      <StyledSelect
                        value={controlledField.value}
                        onChange={(value) => {
                          setValue(
                            `contentBlocks.${index}` as const,
                            createEmptyBlock(value as SupportedBlockType) as TFormValues["contentBlocks"][number],
                          );
                          clearErrors("contentBlocks");
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
                      fields.length === 1
                        ? setValue(
                            `contentBlocks.${index}` as const,
                            createEmptyBlock() as TFormValues["contentBlocks"][number],
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
                    control={control}
                    render={({ field: controlledField }) => (
                      <AdminFormField label="المستوى">
                        <StyledSelect
                          value={controlledField.value ?? 2}
                          onChange={(value) => controlledField.onChange(Number(value))}
                          onBlur={controlledField.onBlur}
                          name={controlledField.name}
                          options={HEADING_LEVEL_OPTIONS.map((option) => ({
                            value: option.value,
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
                      {...register(`contentBlocks.${index}.text` as const)}
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
                    {...register(`contentBlocks.${index}.text` as const)}
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
                      {...register(`contentBlocks.${index}.itemsText` as const)}
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
                      {...register(`contentBlocks.${index}.ordered` as const)}
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
                    control={control}
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
                      {...register(`contentBlocks.${index}.title` as const)}
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
                      {...register(`contentBlocks.${index}.text` as const)}
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
                      {...register(`contentBlocks.${index}.title` as const)}
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
                      {...register(`contentBlocks.${index}.description` as const)}
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
                      {...register(`contentBlocks.${index}.url` as const)}
                      disabled={disabled}
                      dir="ltr"
                      placeholder="https://example.com"
                      className={adminFieldClass(cn(adminInputClass), false)}
                    />
                  </AdminFormField>
                </div>
              ) : null}

              {blockType === "faq" ? (
                <AdminFormField
                  label="الأسئلة والإجابات"
                  hint="كل سطر بصيغة: السؤال | الإجابة"
                >
                  <textarea
                    {...register(`contentBlocks.${index}.faqItemsText` as const)}
                    disabled={disabled}
                    rows={5}
                    placeholder="ما الأعراض المبكرة؟ | قد تشمل..."
                    className={adminFieldClass(
                      cn(adminTextareaClass, "text-start placeholder:text-start"),
                      false,
                    )}
                  />
                </AdminFormField>
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
