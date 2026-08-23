"use client";

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
  getArrayTextareaValue,
  getFieldHelperText,
  getLocalizedTemplateText,
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

  const setPathValue = (path: string, nextValue: unknown) => {
    onChange(updateTemplateValueAtPath(recordValue, [path], nextValue));
  };

  // `ContentTemplateField` in docs/openapi.json is a flat list (key/label/
  // type/required/enum/min/max/regex/isPublic) — no nested `fields`, so this
  // renders one control per top-level field rather than recursing.
  const renderField = (field: DynamicTemplateField) => {
    const path = field.key;
    const label = getLocalizedTemplateText(field.label, language) || field.key;
    const helper = getFieldHelperText(field, language);
    const fieldType = getTemplateFieldType(field);
    const currentValue = getTemplateValueAtPath(recordValue, [path]);
    const error = getError?.(path);
    const selectOptions = getTemplateFieldSelectOptions(field, language);

    if (fieldType === "boolean") {
      return (
        <AdminFormField
          key={path}
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
            placeholder={language === "en" ? "Select a value" : "اختر القيمة"}
            listboxAriaLabel={label}
          />
        </AdminFormField>
      );
    }

    if (selectOptions.length > 0) {
      return (
        <AdminFormField
          key={path}
          label={label}
          required={field.required}
          hint={helper}
          error={error}
        >
          <StyledSelect
            value={getTemplateSelectValue(currentValue, language)}
            onChange={(nextValue) => setPathValue(path, nextValue || undefined)}
            options={selectOptions}
            placeholder={language === "en" ? "Select a value" : "اختر القيمة"}
            listboxAriaLabel={label}
          />
        </AdminFormField>
      );
    }

    if (fieldType === "array") {
      return (
        <AdminFormField
          key={path}
          label={label}
          required={field.required}
          hint={
            helper ||
            (language === "en"
              ? "Enter each item on its own line. This input only supports simple lists."
              : "أدخل كل عنصر في سطر مستقل. يدعم هذا الإدخال القوائم البسيطة فقط.")
          }
          error={error}
        >
          <textarea
            value={getArrayTextareaValue(currentValue)}
            onChange={(event) =>
              setPathValue(path, coerceArrayTextareaValue(event.target.value))
            }
            rows={4}
            disabled={disabled}
            placeholder={language === "en" ? "First item&#10;Second item" : "عنصر أول&#10;عنصر ثانٍ"}
            className={adminFieldClass(
              cn(adminTextareaClass, "text-start placeholder:text-start"),
              Boolean(error),
            )}
          />
        </AdminFormField>
      );
    }

    if (fieldType === "object") {
      // The backend gives no sub-schema for `object` fields, so a localized
      // { ar, en } value is the only structured shape we can safely infer
      // without the user hand-writing JSON.
      if (isLocalizedRecord(currentValue)) {
        return (
          <AdminFormField
            key={path}
            label={label}
            required={field.required}
            hint={
              helper ||
              (language === "en"
                ? "Enter the localized values directly instead of editing JSON for this field."
                : "أدخل القيم المحلية مباشرة بدل تحرير JSON لهذا الحقل.")
            }
            error={error}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={currentValue.ar || ""}
                onChange={(event) => {
                  const ar = event.target.value;
                  const en = currentValue.en || "";
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
                value={currentValue.en || ""}
                onChange={(event) => {
                  const en = event.target.value;
                  const ar = currentValue.ar || "";
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
          key={path}
          label={label}
          required={field.required}
          hint={
            helper ||
            (language === "en"
              ? "Enter valid JSON when the template doesn't provide detailed sub-fields for this object."
              : "أدخل JSON صالحًا عندما لا يوفّر القالب حقولاً فرعية مفصلة لهذا الكائن.")
          }
          error={error}
        >
          <textarea
            key={`${path}:${serializedObject}`}
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
            placeholder={'{"key":"value"}'}
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
        key={path}
        label={label}
        required={field.required}
        hint={helper}
        error={error}
      >
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
          type={fieldType === "number" ? "number" : "text"}
          min={fieldType === "number" ? field.min : undefined}
          max={fieldType === "number" ? field.max : undefined}
          pattern={field.regex}
          disabled={disabled}
          placeholder={language === "en" ? "Enter a value" : "أدخل القيمة"}
          className={adminFieldClass(
            cn(adminInputClass, "text-start placeholder:text-start"),
            Boolean(error),
          )}
        />
      </AdminFormField>
    );
  };

  return (
    <div className="space-y-4">
      {template.fields.map((field) => renderField(field as DynamicTemplateField))}
    </div>
  );
}
