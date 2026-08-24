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
import { useI18n } from "@/i18n/provider";
import {
  createEmptyBlock,
  faqItemsToText,
  getBlockValidationMessage,
  getCalloutVariantOptions,
  getContentBlockTypeOptions,
  getLinkCardUrlValidationMessage,
  HEADING_LEVEL_OPTIONS,
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
  title,
  description,
}: ContentBlockEditorProps<TFormValues>) {
  const { t } = useI18n();
  const resolvedTitle = title ?? t("contentBlockEditor.title");
  const resolvedDescription = description ?? t("contentBlockEditor.description");
  const contentBlockTypeOptions = getContentBlockTypeOptions(t);
  const calloutVariantOptions = getCalloutVariantOptions(t);

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
        <div className="text-start">
          <h3 className="font-cairo text-[15px] font-extrabold text-primary">
            {resolvedTitle}
          </h3>
          <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
            {resolvedDescription}
          </p>
        </div>
        <button
          type="button"
          onClick={() => append(createEmptyBlock())}
          disabled={disabled}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-primary/15 bg-white px-3 font-cairo text-[12px] font-extrabold text-primary disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t("contentBlockEditor.action.addBlock")}
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const blockType = blocks[index]?.type || "paragraph";
          const blockError = getBlockValidationMessage(
            blocks[index] ?? createEmptyBlock(),
            t,
          );
          const linkCardUrlMessage =
            blockType === "linkCard"
              ? getLinkCardUrlValidationMessage(blocks[index]?.url, t)
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
                        options={contentBlockTypeOptions}
                        placeholder={t("contentBlockEditor.field.blockType.placeholder")}
                        listboxAriaLabel={t(
                          "contentBlockEditor.field.blockType.ariaLabel",
                        ).replace("{index}", String(index + 1))}
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
                    aria-label={t("contentBlockEditor.action.moveUp")}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={disabled || index === fields.length - 1}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E6ECF2] text-[#667085] disabled:opacity-40"
                    aria-label={t("contentBlockEditor.action.moveDown")}
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
                    aria-label={t("contentBlockEditor.action.duplicate")}
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
                    aria-label={t("contentBlockEditor.action.delete")}
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
                      <AdminFormField label={t("contentBlockEditor.field.headingLevel.label")}>
                        <StyledSelect
                          value={String(controlledField.value ?? 2)}
                          onChange={(value) => controlledField.onChange(Number(value))}
                          onBlur={controlledField.onBlur}
                          name={controlledField.name}
                          options={HEADING_LEVEL_OPTIONS.map((option) => ({
                            value: String(option.value),
                            label: option.label,
                          }))}
                          placeholder={t(
                            "contentBlockEditor.field.headingLevel.placeholder",
                          )}
                          listboxAriaLabel={t(
                            "contentBlockEditor.field.headingLevel.placeholder",
                          )}
                          disabled={disabled}
                        />
                      </AdminFormField>
                    )}
                  />
                  <AdminFormField label={t("contentBlockEditor.field.headingText.label")}>
                    <input
                      {...formRegister(`contentBlocks.${index}.text` as const)}
                      disabled={disabled}
                      placeholder={t(
                        "contentBlockEditor.field.headingText.placeholder",
                      )}
                      className={adminFieldClass(
                        cn(adminInputClass, "text-start placeholder:text-start"),
                        false,
                      )}
                    />
                  </AdminFormField>
                </div>
              ) : null}

              {blockType === "paragraph" ? (
                <AdminFormField label={t("contentBlockEditor.field.paragraphText.label")}>
                  <textarea
                    {...formRegister(`contentBlocks.${index}.text` as const)}
                    disabled={disabled}
                    rows={4}
                    placeholder={t(
                      "contentBlockEditor.field.paragraphText.placeholder",
                    )}
                    className={adminFieldClass(
                      cn(adminTextareaClass, "text-start placeholder:text-start"),
                      false,
                    )}
                  />
                </AdminFormField>
              ) : null}

              {blockType === "list" ? (
                <div className="space-y-4">
                  <AdminFormField label={t("contentBlockEditor.field.listItems.label")}>
                    <textarea
                      {...formRegister(`contentBlocks.${index}.itemsText` as const)}
                      disabled={disabled}
                      rows={4}
                      placeholder={t(
                        "contentBlockEditor.field.listItems.placeholder",
                      )}
                      className={adminFieldClass(
                        cn(adminTextareaClass, "text-start placeholder:text-start"),
                        false,
                      )}
                    />
                  </AdminFormField>
                  <label className="flex items-center justify-end gap-2 font-cairo text-[12px] font-bold text-[#344054]">
                    <span>{t("contentBlockEditor.field.listOrdered.label")}</span>
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
                      <AdminFormField label={t("contentBlockEditor.field.calloutVariant.label")}>
                        <StyledSelect
                          value={controlledField.value ?? "info"}
                          onChange={controlledField.onChange}
                          onBlur={controlledField.onBlur}
                          name={controlledField.name}
                          options={calloutVariantOptions}
                          placeholder={t(
                            "contentBlockEditor.field.calloutVariant.placeholder",
                          )}
                          listboxAriaLabel={t(
                            "contentBlockEditor.field.calloutVariant.label",
                          )}
                          disabled={disabled}
                        />
                      </AdminFormField>
                    )}
                  />
                  <AdminFormField label={t("contentBlockEditor.field.calloutTitle.label")}>
                    <input
                      {...formRegister(`contentBlocks.${index}.title` as const)}
                      disabled={disabled}
                      placeholder={t(
                        "contentBlockEditor.field.calloutTitle.placeholder",
                      )}
                      className={adminFieldClass(
                        cn(adminInputClass, "text-start placeholder:text-start"),
                        false,
                      )}
                    />
                  </AdminFormField>
                  <AdminFormField label={t("contentBlockEditor.field.calloutText.label")}>
                    <textarea
                      {...formRegister(`contentBlocks.${index}.text` as const)}
                      disabled={disabled}
                      rows={3}
                      placeholder={t(
                        "contentBlockEditor.field.calloutText.placeholder",
                      )}
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
                  <AdminFormField label={t("contentBlockEditor.field.linkCardTitle.label")}>
                    <input
                      {...formRegister(`contentBlocks.${index}.title` as const)}
                      disabled={disabled}
                      placeholder={t(
                        "contentBlockEditor.field.linkCardTitle.placeholder",
                      )}
                      className={adminFieldClass(
                        cn(adminInputClass, "text-start placeholder:text-start"),
                        false,
                      )}
                    />
                  </AdminFormField>
                  <AdminFormField label={t("contentBlockEditor.field.linkCardDescription.label")}>
                    <textarea
                      {...formRegister(`contentBlocks.${index}.description` as const)}
                      disabled={disabled}
                      rows={3}
                      placeholder={t(
                        "contentBlockEditor.field.linkCardDescription.placeholder",
                      )}
                      className={adminFieldClass(
                        cn(adminTextareaClass, "text-start placeholder:text-start"),
                        false,
                      )}
                    />
                  </AdminFormField>
                  <AdminFormField label={t("contentBlockEditor.field.linkCardUrl.label")}>
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
                    <p className="mt-1 text-start font-cairo text-[12px] font-bold text-red-600">
                      {linkCardUrlMessage}
                    </p>
                  ) : (
                    <p className="mt-1 text-start font-cairo text-[11px] font-semibold text-[#667085]">
                      {t("contentBlockEditor.field.linkCardUrl.hint")}
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
                          label={t("contentBlockEditor.field.faqItems.label")}
                          hint={t("contentBlockEditor.field.faqItems.hint")}
                        >
                          <div className="space-y-3">
                            {faqItems.map((item, faqIndex) => (
                              <div
                                key={`faq-item-${field.id}-${faqIndex}`}
                                className="rounded-[12px] border border-[#E4E7EC] bg-[#F9FAFB] p-3"
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="font-cairo text-[12px] font-extrabold text-[#344054]">
                                    {t("contentBlockEditor.faq.itemLabel").replace(
                                      "{index}",
                                      String(faqIndex + 1),
                                    )}
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
                                    {t("contentBlockEditor.action.deleteFaqItem")}
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
                                    placeholder={t(
                                      "contentBlockEditor.field.faqQuestion.placeholder",
                                    )}
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
                                    placeholder={t(
                                      "contentBlockEditor.field.faqAnswer.placeholder",
                                    )}
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
                          {t("contentBlockEditor.action.addFaqItem")}
                        </button>
                      </div>
                    );
                  }}
                />
              ) : null}

              {blockType === "divider" ? (
                <div className="rounded-[10px] border border-dashed border-[#D0D5DD] bg-[#F9FAFB] px-4 py-3 text-start font-cairo text-[12px] font-bold text-[#667085]">
                  {t("contentBlockEditor.dividerNote")}
                </div>
              ) : null}

              {blockError ? (
                <p className="mt-3 text-start font-cairo text-[12px] font-bold text-red-600">
                  {blockError}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {errorMessage ? (
        <p className="mt-4 text-start font-cairo text-[12px] font-bold text-red-600">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
