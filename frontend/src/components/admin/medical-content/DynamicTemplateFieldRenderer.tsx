"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/form-field";
import StyledSelect from "@/components/ui/styled-select";
import type {
  AdminContentDynamicRecord,
  AdminContentTemplate,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils/utils";
import {
  coerceArrayTextareaValue,
  coercePrimitiveFieldValue,
  DynamicTemplateField,
  getArrayItemField,
  getArrayTextareaValue,
  getFieldHelperText,
  getLocalizedTemplateText,
  getNestedTemplateFields,
  getPrimitiveInputValue,
  getTemplateFieldSelectOptions,
  getTemplateFieldType,
  getTemplateSelectValue,
  getTemplateValueAtPath,
  isLocalizedRecord,
  updateTemplateValueAtPath,
} from "./dynamicTemplateFieldRenderer.helpers";

type Props = {
  template?: AdminContentTemplate | null;
  value?: AdminContentDynamicRecord;
  language: "ar" | "en";
  disabled?: boolean;
  getError?: (path: string) => string | undefined;
  onChange: (next: AdminContentDynamicRecord) => void;
};

const actionButtonClass =
  "inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-[#D0D5DD] bg-white px-3 font-cairo text-[12px] font-bold text-[#344054] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60";

function buildEmptyObject(fields: DynamicTemplateField[]): AdminContentDynamicRecord {
  return fields.reduce<AdminContentDynamicRecord>((acc, field) => {
    const nestedFields = getNestedTemplateFields(field);
    const fieldType = getTemplateFieldType(field);
    if (fieldType === "object" && nestedFields.length) {
      acc[field.key] = buildEmptyObject(nestedFields);
    }
    return acc;
  }, {});
}

export default function DynamicTemplateFieldRenderer({
  template,
  value,
  language,
  disabled,
  getError,
  onChange,
}: Props) {
  if (!template?.fields?.length) return null;

  const recordValue = value ?? {};

  const setPathValue = (path: string[], nextValue: unknown) => {
    onChange(updateTemplateValueAtPath(recordValue, path, nextValue));
  };

  const renderField = (field: DynamicTemplateField, parentPath: string[] = []) => {
    const path = [...parentPath, field.key];
    const key = path.join(".");
    const label = getLocalizedTemplateText(field.label, language) || field.key;
    const helper = getFieldHelperText(field, language);
    const placeholder = getLocalizedTemplateText(field.placeholder, language);
    const fieldType = getTemplateFieldType(field);
    const nestedFields = getNestedTemplateFields(field);
    const currentValue = getTemplateValueAtPath(recordValue, path);
    const error = getError?.(key);
    const selectOptions = getTemplateFieldSelectOptions(field, language);

    if (fieldType === "boolean") {
      return (
        <AdminFormField
          key={key}
          label={label}
          required={field.required}
          hint={helper}
          error={error}
        >
          <StyledSelect
            value={
              typeof currentValue === "boolean" ? String(currentValue) : ""
            }
            onChange={(nextValue) =>
              setPathValue(
                path,
                nextValue === "true"
                  ? true
                  : nextValue === "false"
                    ? false
                    : undefined,
              )
            }
            options={[
              {
                value: "true",
                label: language === "en" ? "Yes" : "نعم",
              },
              {
                value: "false",
                label: language === "en" ? "No" : "لا",
              },
            ]}
            placeholder="اختر القيمة"
            listboxAriaLabel={label}
          />
        </AdminFormField>
      );
    }

    if (selectOptions.length > 0) {
      return (
        <AdminFormField
          key={key}
          label={label}
          required={field.required}
          hint={helper}
          error={error}
        >
          <StyledSelect
            value={getTemplateSelectValue(currentValue, language)}
            onChange={(nextValue) => setPathValue(path, nextValue || undefined)}
            options={selectOptions}
            placeholder="اختر القيمة"
            listboxAriaLabel={label}
          />
        </AdminFormField>
      );
    }

    if (fieldType === "object" && nestedFields.length) {
      return (
        <div key={key} className="rounded-[14px] border border-[#D8E6E5] bg-white p-4">
          <div className="mb-4 text-right">
            <div className="font-cairo text-[14px] font-extrabold text-primary">
              {label}
            </div>
            {helper ? (
              <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                {helper}
              </div>
            ) : null}
          </div>
          <div className="space-y-4">
            {nestedFields.map((nestedField) => renderField(nestedField, path))}
          </div>
        </div>
      );
    }

    if (fieldType === "array" && nestedFields.length) {
      const items = Array.isArray(currentValue) ? currentValue : [];
      return (
        <div key={key} className="rounded-[14px] border border-[#D8E6E5] bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const nextItems = [
                  ...items,
                  buildEmptyObject(nestedFields) as unknown,
                ];
                setPathValue(path, nextItems);
              }}
              className={actionButtonClass}
            >
              <Plus className="h-4 w-4" aria-hidden />
              إضافة عنصر
            </button>
            <div className="text-right">
              <div className="font-cairo text-[14px] font-extrabold text-primary">
                {label}
              </div>
              {helper ? (
                <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                  {helper}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            {items.length ? (
              items.map((item, index) => {
                return (
                  <div
                    key={`${key}.${index}`}
                    className="rounded-[12px] border border-[#E4E7EC] bg-[#FCFCFD] p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          const nextItems = items.filter((_, itemIndex) => itemIndex !== index);
                          setPathValue(path, nextItems.length ? nextItems : undefined);
                        }}
                        className={cn(actionButtonClass, "border-[#FECACA] text-[#B42318]")}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        حذف
                      </button>
                      <div className="font-cairo text-[12px] font-bold text-[#475467]">
                        عنصر {index + 1}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {nestedFields.map((nestedField) =>
                        renderField(nestedField, [...path, String(index)]),
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[12px] border border-dashed border-[#D0D5DD] bg-[#F8FAFC] px-4 py-3 text-right font-cairo text-[12px] font-semibold text-[#667085]">
                لا توجد عناصر بعد. أضف أول عنصر لبدء تعبئة هذا الحقل المركب.
              </div>
            )}
          </div>
        </div>
      );
    }

    if (fieldType === "array") {
      const itemField = getArrayItemField(field);
      return (
        <AdminFormField
          key={key}
          label={label}
          required={field.required}
          hint={
            helper ||
            "أدخل كل عنصر في سطر مستقل. يدعم هذا الإدخال القوائم البسيطة فقط."
          }
          error={error}
        >
          <textarea
            value={getArrayTextareaValue(currentValue)}
            onChange={(event) =>
              setPathValue(
                path,
                coerceArrayTextareaValue(event.target.value, itemField),
              )
            }
            rows={4}
            disabled={disabled}
            placeholder={placeholder || "عنصر أول\nعنصر ثانٍ"}
            className={adminFieldClass(
              cn(adminTextareaClass, "text-start placeholder:text-start"),
              Boolean(error),
            )}
          />
        </AdminFormField>
      );
    }

    if (fieldType === "object") {
      const uiHints = field.uiHints as Record<string, unknown> | undefined;
      const localizedHint =
        uiHints?.localized === true ||
        uiHints?.bilingual === true ||
        uiHints?.valueKind === "localized";
      if (localizedHint || isLocalizedRecord(currentValue)) {
        const localizedValue = isLocalizedRecord(currentValue)
          ? currentValue
          : {};

        return (
          <AdminFormField
            key={key}
            label={label}
            required={field.required}
            hint={
              helper ||
              "أدخل القيم المحلية مباشرة بدل تحرير JSON لهذا الحقل."
            }
            error={error}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={localizedValue.ar || ""}
                onChange={(event) => {
                  const ar = event.target.value;
                  const en = localizedValue.en || "";
                  setPathValue(path, ar.trim() || en.trim() ? { ar, en } : undefined);
                }}
                disabled={disabled}
                placeholder="العربية"
                className={adminFieldClass(
                  cn(adminInputClass, "text-start placeholder:text-start"),
                  Boolean(error),
                )}
              />
              <input
                value={localizedValue.en || ""}
                onChange={(event) => {
                  const en = event.target.value;
                  const ar = localizedValue.ar || "";
                  setPathValue(path, ar.trim() || en.trim() ? { ar, en } : undefined);
                }}
                disabled={disabled}
                placeholder="English"
                className={adminFieldClass(
                  cn(adminInputClass, "text-start placeholder:text-start"),
                  Boolean(error),
                )}
              />
            </div>
          </AdminFormField>
        );
      }

      const serializedObject =
        currentValue && typeof currentValue === "object"
          ? JSON.stringify(currentValue, null, 2)
          : "";

      return (
        <AdminFormField
          key={key}
          label={label}
          required={field.required}
          hint={
            helper ||
            "أدخل JSON صالحًا عندما لا يوفّر القالب حقولاً فرعية مفصلة لهذا الكائن."
          }
          error={error}
        >
          <textarea
            key={`${key}:${serializedObject}`}
            defaultValue={serializedObject}
            onBlur={(event) => {
              const rawValue = event.target.value.trim();
              if (!rawValue) {
                setPathValue(path, undefined);
                return;
              }

              try {
                setPathValue(path, JSON.parse(rawValue));
              } catch {
                // Keep the current value until the user provides valid JSON.
              }
            }}
            rows={6}
            disabled={disabled}
            placeholder={placeholder || '{"key":"value"}'}
            className={adminFieldClass(
              cn(adminTextareaClass, "font-mono text-[12px]"),
              Boolean(error),
            )}
          />
        </AdminFormField>
      );
    }

    return (
      <AdminFormField
        key={key}
        label={label}
        required={field.required}
        hint={helper}
        error={error}
      >
        {field.type === "textarea" ? (
          <textarea
            value={getPrimitiveInputValue(currentValue, language)}
            onChange={(event) =>
              setPathValue(
                path,
                coercePrimitiveFieldValue(
                  event.target.value,
                  field,
                  currentValue,
                  language,
                ),
              )
            }
            rows={4}
            disabled={disabled}
            placeholder={placeholder || "أدخل القيمة"}
            className={adminFieldClass(
              cn(adminTextareaClass, "text-start placeholder:text-start"),
              Boolean(error),
            )}
          />
        ) : (
          <input
            value={getPrimitiveInputValue(currentValue, language)}
            onChange={(event) =>
              setPathValue(
                path,
                coercePrimitiveFieldValue(
                  event.target.value,
                  field,
                  currentValue,
                  language,
                ),
              )
            }
            type={field.type === "date" ? "date" : fieldType === "number" ? "number" : "text"}
            min={fieldType === "number" ? field.min : undefined}
            max={fieldType === "number" ? field.max : undefined}
            pattern={field.regex}
            disabled={disabled}
            placeholder={placeholder || "أدخل القيمة"}
            className={adminFieldClass(
              cn(adminInputClass, "text-start placeholder:text-start"),
              Boolean(error),
            )}
          />
        )}
      </AdminFormField>
    );
  };

  return (
    <div className="space-y-4">
      {template.fields.map((field) => renderField(field as DynamicTemplateField))}
    </div>
  );
}
