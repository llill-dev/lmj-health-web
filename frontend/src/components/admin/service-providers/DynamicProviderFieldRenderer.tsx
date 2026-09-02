"use client";
import { Plus, X } from "lucide-react";
import type { ServiceTypeField } from "@/lib/admin/types";
import { resolveLabel } from "@/lib/admin/types";
import { useI18n } from "@/i18n/provider";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
} from "@/components/admin/form-field";
import StyledSelect from "@/components/ui/styled-select";
import { cn } from "@/lib/utils/utils";

type Translate = (key: string, params?: Record<string, unknown>) => string;

/**
 * Renders form controls from a ServiceType's `fields` definition (the real backend
 * `ContentTemplateField` shape: key/label/type/required/enum/min/max/regex/isPublic —
 * string|number|boolean|array|object only; no geo_point, no nested object.fields /
 * array.itemFields, since the backend doesn't support them).
 *
 * `array`/`object` fields have no declared inner shape from the backend, so they are
 * edited as a repeatable list of free-text values / a flat key-value list respectively.
 */

export type ProviderFieldErrors = Record<string, string>;

type Props = {
  fields: ServiceTypeField[];
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  errors?: ProviderFieldErrors;
  locale?: "ar" | "en";
  disabled?: boolean;
};

function fieldLabel(field: ServiceTypeField, locale: "ar" | "en"): string {
  return resolveLabel(field.label, locale) || field.key;
}

function fieldHint(field: ServiceTypeField, locale: "ar" | "en", t: Translate): string | undefined {
  const parts: string[] = [];
  const sep = locale === "ar" ? "، " : ", ";
  if (field.enum && field.enum.length > 0) {
    parts.push(
      t("adminServiceProviderDialog.dynamicField.hint.allowed", {
        values: field.enum.join(sep),
      }),
    );
  }
  if (field.min !== undefined || field.max !== undefined) {
    parts.push(
      t("adminServiceProviderDialog.dynamicField.hint.range", {
        min: field.min ?? "—",
        max: field.max ?? "—",
      }),
    );
  }
  if (field.regex) {
    parts.push(
      t("adminServiceProviderDialog.dynamicField.hint.pattern", {
        pattern: field.regex,
      }),
    );
  }
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function setValueAt(
  value: Record<string, unknown>,
  key: string,
  next: unknown,
): Record<string, unknown> {
  return { ...value, [key]: next };
}

export default function DynamicProviderFieldRenderer({
  fields,
  value,
  onChange,
  errors = {},
  locale = "ar",
  disabled = false,
}: Props) {
  const { t } = useI18n();
  if (!fields.length) {
    return (
      <p className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
        {t("adminServiceProviderDialog.dynamicField.noFields")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const raw = value[field.key];
        const error = errors[field.key];
        const label = fieldLabel(field, locale);
        const hint = fieldHint(field, locale, t);
        const inputId = `provider-field-${field.key}`;

        if (field.type === "boolean") {
          return (
            <AdminFormField key={field.key} label={label} hint={hint} required={field.required} error={error}>
              <label className="flex items-center gap-2 font-cairo text-[13px] font-semibold text-[#344054]">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={Boolean(raw)}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange(setValueAt(value, field.key, e.target.checked))
                  }
                  aria-describedby={error ? `${inputId}-error` : undefined}
                />
                {label}
              </label>
            </AdminFormField>
          );
        }

        if (field.type === "number") {
          return (
            <AdminFormField key={field.key} label={label} hint={hint} required={field.required} error={error}>
              <input
                id={inputId}
                type="number"
                min={field.min}
                max={field.max}
                disabled={disabled}
                value={typeof raw === "number" ? raw : (raw as string) ?? ""}
                onChange={(e) =>
                  onChange(
                    setValueAt(
                      value,
                      field.key,
                      e.target.value === "" ? "" : Number(e.target.value),
                    ),
                  )
                }
                aria-describedby={error ? `${inputId}-error` : undefined}
                className={adminFieldClass(adminInputClass, Boolean(error))}
              />
            </AdminFormField>
          );
        }

        if (field.type === "string" && field.enum && field.enum.length > 0) {
          return (
            <AdminFormField key={field.key} label={label} hint={hint} required={field.required} error={error}>
              <StyledSelect
                value={typeof raw === "string" ? raw : ""}
                onChange={(v) => onChange(setValueAt(value, field.key, v))}
                options={field.enum.map((option) => ({
                  value: String(option),
                  label: String(option),
                }))}
                placeholder={t("adminServiceProviderDialog.dynamicField.selectPlaceholder")}
                listboxAriaLabel={label}
              />
            </AdminFormField>
          );
        }

        if (field.type === "string") {
          return (
            <AdminFormField key={field.key} label={label} hint={hint} required={field.required} error={error}>
              <input
                id={inputId}
                type="text"
                disabled={disabled}
                value={typeof raw === "string" ? raw : ""}
                onChange={(e) => onChange(setValueAt(value, field.key, e.target.value))}
                aria-describedby={error ? `${inputId}-error` : undefined}
                className={adminFieldClass(
                  cn(adminInputClass, "text-start placeholder:text-start"),
                  Boolean(error),
                )}
              />
            </AdminFormField>
          );
        }

        if (field.type === "array") {
          const items: string[] = Array.isArray(raw)
            ? raw.map((v) => String(v))
            : [];
          return (
            <AdminFormField key={field.key} label={label} hint={hint} required={field.required} error={error}>
              <ArrayFieldEditor
                items={items}
                disabled={disabled}
                locale={locale}
                onChange={(next) => onChange(setValueAt(value, field.key, next))}
              />
            </AdminFormField>
          );
        }

        // object — backend doesn't declare inner shape; edit as key/value pairs.
        const entries: [string, string][] =
          raw && typeof raw === "object" && !Array.isArray(raw)
            ? Object.entries(raw as Record<string, unknown>).map(([k, v]) => [
                k,
                typeof v === "string" ? v : JSON.stringify(v),
              ])
            : [];
        return (
          <AdminFormField key={field.key} label={label} hint={hint} required={field.required} error={error}>
            <ObjectFieldEditor
              entries={entries}
              disabled={disabled}
              locale={locale}
              onChange={(next) =>
                onChange(
                  setValueAt(
                    value,
                    field.key,
                    Object.fromEntries(next),
                  ),
                )
              }
            />
          </AdminFormField>
        );
      })}
    </div>
  );
}

function ArrayFieldEditor({
  items,
  onChange,
  disabled,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  locale: "ar" | "en";
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={item}
            disabled={disabled}
            onChange={(e) => {
              const next = [...items];
              next[index] = e.target.value;
              onChange(next);
            }}
            className={adminFieldClass(adminInputClass, false)}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            aria-label={t("adminServiceProviderDialog.dynamicField.array.removeItem")}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[#FECACA] text-[#B42318] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange([...items, ""])}
        className="inline-flex items-center gap-1.5 rounded-[8px] border border-primary/30 bg-[#E7FBFA] px-3 py-1.5 font-cairo text-[11px] font-extrabold text-primary disabled:opacity-50"
      >
        <Plus className="h-3.5 w-3.5" />
        {t("adminServiceProviderDialog.dynamicField.array.addItem")}
      </button>
    </div>
  );
}

function ObjectFieldEditor({
  entries,
  onChange,
  disabled,
}: {
  entries: [string, string][];
  onChange: (next: [string, string][]) => void;
  disabled?: boolean;
  locale: "ar" | "en";
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      {entries.map(([key, val], index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={key}
            disabled={disabled}
            placeholder={t("adminServiceProviderDialog.dynamicField.object.keyPlaceholder")}
            onChange={(e) => {
              const next: [string, string][] = [...entries];
              next[index] = [e.target.value, val];
              onChange(next);
            }}
            className={cn(adminFieldClass(adminInputClass, false), "w-1/2")}
            dir="ltr"
          />
          <input
            type="text"
            value={val}
            disabled={disabled}
            placeholder={t("adminServiceProviderDialog.dynamicField.object.valuePlaceholder")}
            onChange={(e) => {
              const next: [string, string][] = [...entries];
              next[index] = [key, e.target.value];
              onChange(next);
            }}
            className={adminFieldClass(adminInputClass, false)}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(entries.filter((_, i) => i !== index))}
            aria-label={t("adminServiceProviderDialog.dynamicField.object.removeEntry")}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[#FECACA] text-[#B42318] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange([...entries, ["", ""]])}
        className="inline-flex items-center gap-1.5 rounded-[8px] border border-primary/30 bg-[#E7FBFA] px-3 py-1.5 font-cairo text-[11px] font-extrabold text-primary disabled:opacity-50"
      >
        <Plus className="h-3.5 w-3.5" />
        {t("adminServiceProviderDialog.dynamicField.object.addProperty")}
      </button>
    </div>
  );
}
