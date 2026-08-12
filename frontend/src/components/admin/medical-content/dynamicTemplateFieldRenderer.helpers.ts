import type {
  AdminContentDynamicRecord,
  AdminContentDynamicValue,
  AdminContentTemplate,
  AdminContentTemplateField,
  AdminContentType,
  AdminLocalizedValue,
} from "@/lib/admin/types";

const TEMPLATE_ENABLED_TYPES = [
  "CONDITION",
  "SYMPTOM",
  "GENERAL_ADVICE",
  "MEDICATION",
] as const;

/**
 * `ContentTemplateField` in docs/openapi.json is flat (`key`/`label`/`type`/
 * `required`/`enum`/`min`/`max`/`regex`/`isPublic` only, `additionalProperties:
 * false`) — there is no nested `fields`/`itemFields`, per-field `uiHints`, or
 * `placeholder`/`description`. This alias used to widen the shape to model
 * those, but nothing in the backend contract or `ContentTemplateFormDialog`
 * ever produces them, so it stayed permanently unreachable. Keep this as a
 * plain alias so the renderer only relies on what the backend actually sends.
 */
export type DynamicTemplateField = AdminContentTemplateField;

export type TemplateFieldSelectOption = {
  value: string;
  label: string;
};

export type TemplateValidationIssue = {
  code: "required" | "enum" | "min" | "max" | "regex";
  path: string;
  label: string;
  message: string;
};

type LocalizedRecord = {
  ar?: string;
  en?: string;
};

export function supportsTemplateSelection(type: AdminContentType): boolean {
  return TEMPLATE_ENABLED_TYPES.includes(
    type as (typeof TEMPLATE_ENABLED_TYPES)[number],
  );
}

export function getTemplateParentType(type: AdminContentType) {
  if (!supportsTemplateSelection(type)) return undefined;
  return type as (typeof TEMPLATE_ENABLED_TYPES)[number];
}

export function getLocalizedTemplateText(
  value: AdminLocalizedValue | undefined,
  language: "ar" | "en",
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.ar || value.en || "";
}

export function isLocalizedRecord(value: unknown): value is LocalizedRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return "ar" in record || "en" in record;
}

export function isDynamicRecord(value: unknown): value is AdminContentDynamicRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function getTemplateFieldType(field: DynamicTemplateField): string {
  return field.type || "string";
}

export function getTemplateValueAtPath(
  value: AdminContentDynamicRecord | undefined,
  path: string[],
): unknown {
  let current: unknown = value;
  for (const segment of path) {
    if (Array.isArray(current)) {
      const index = Number(segment);
      current = Number.isInteger(index) ? current[index] : undefined;
      continue;
    }
    if (!isDynamicRecord(current)) return undefined;
    current = current[segment];
  }
  return current;
}

function isEmptyContainer(value: unknown) {
  if (Array.isArray(value)) return value.length === 0;
  return isDynamicRecord(value) && Object.keys(value).length === 0;
}

function pruneValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    const next = value
      .map((item) => pruneValue(item))
      .filter((item) => item !== undefined);
    return next.length ? next : undefined;
  }

  if (isDynamicRecord(value)) {
    const next = Object.entries(value).reduce<AdminContentDynamicRecord>(
      (acc, [key, entry]) => {
        const pruned = pruneValue(entry);
        if (pruned !== undefined) acc[key] = pruned as AdminContentDynamicValue;
        return acc;
      },
      {},
    );
    return Object.keys(next).length ? next : undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  return value ?? undefined;
}

function isArraySegment(segment: string) {
  return /^\d+$/.test(segment);
}

function setPathValue(
  current: unknown,
  path: string[],
  nextValue: unknown,
): unknown {
  const [head, ...rest] = path;

  if (!head) return current;

  const useArray = isArraySegment(head);
  const clone: any = useArray
    ? Array.isArray(current)
      ? [...current]
      : []
    : isDynamicRecord(current)
      ? { ...current }
      : {};

  if (rest.length === 0) {
    const pruned = pruneValue(nextValue);
    if (useArray) {
      const index = Number(head);
      if (pruned === undefined) clone.splice(index, 1);
      else clone[index] = pruned;
    } else if (pruned === undefined) {
      delete clone[head];
    } else {
      clone[head] = pruned as AdminContentDynamicValue;
    }
    return clone;
  }

  const child = useArray ? clone[Number(head)] : clone[head];
  const nextChild = setPathValue(child, rest, nextValue);

  if (isEmptyContainer(nextChild)) {
    if (useArray) clone.splice(Number(head), 1);
    else delete clone[head];
  } else if (useArray) {
    clone[Number(head)] = nextChild;
  } else {
    clone[head] = nextChild as AdminContentDynamicValue;
  }

  return clone;
}

export function updateTemplateValueAtPath(
  source: AdminContentDynamicRecord | undefined,
  path: string[],
  nextValue: unknown,
): AdminContentDynamicRecord {
  const nextRecord = setPathValue(source ? { ...source } : {}, path, nextValue);
  return isDynamicRecord(nextRecord) ? nextRecord : {};
}

export function getPrimitiveInputValue(
  value: unknown,
  language: "ar" | "en",
): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (isLocalizedRecord(value)) {
    return value[language] || value.ar || value.en || "";
  }
  return "";
}

/**
 * `ContentTemplateField.enum` is the only backend-supported source of select
 * options — there is no per-field `uiHints` in the contract (see the
 * `DynamicTemplateField` alias comment above).
 */
export function getTemplateFieldSelectOptions(
  field: DynamicTemplateField,
  language: "ar" | "en",
): TemplateFieldSelectOption[] {
  void language; // reserved for when the backend supports localized enum labels
  const fromEnum = (Array.isArray(field.enum) ? field.enum : [])
    .map((entry): TemplateFieldSelectOption | null => {
      if (
        typeof entry !== "string" &&
        typeof entry !== "number" &&
        typeof entry !== "boolean"
      ) {
        return null;
      }
      const scalar = String(entry);
      return { value: scalar, label: scalar };
    })
    .filter((option): option is TemplateFieldSelectOption => Boolean(option));

  const unique = new Map<string, TemplateFieldSelectOption>();
  fromEnum.forEach((option) => {
    if (!unique.has(option.value)) unique.set(option.value, option);
  });
  return Array.from(unique.values());
}

export function getTemplateSelectValue(
  value: unknown,
  language: "ar" | "en",
): string {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (isLocalizedRecord(value)) {
    return value[language] || value.ar || value.en || "";
  }
  return "";
}

export function coercePrimitiveFieldValue(
  rawValue: string,
  field: DynamicTemplateField,
  currentValue: unknown,
  language: "ar" | "en",
): unknown {
  const type = getTemplateFieldType(field);

  if (type === "number") {
    if (!rawValue.trim()) return undefined;
    const parsed = Number(rawValue);
    return Number.isNaN(parsed) ? currentValue : parsed;
  }

  if (!rawValue.trim()) {
    if (isLocalizedRecord(currentValue)) {
      const next = { ...currentValue, [language]: "" };
      if (!next.ar?.trim() && !next.en?.trim()) return undefined;
      return next;
    }
    return undefined;
  }

  if (isLocalizedRecord(currentValue)) {
    return { ...currentValue, [language]: rawValue };
  }

  return rawValue;
}

export function getArrayTextareaValue(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "number") return String(item);
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

/**
 * The backend's `array` field type carries no item-type metadata, so array
 * values are authored as newline-separated strings — there is no `itemFields`
 * concept in `ContentTemplateField` to coerce items to another primitive.
 */
export function coerceArrayTextareaValue(
  rawValue: string,
): AdminContentDynamicValue[] | undefined {
  const entries = rawValue
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return entries.length ? entries : undefined;
}

export function getFieldHelperText(
  field: DynamicTemplateField,
  language: "ar" | "en",
): string | undefined {
  void language; // reserved for when the backend adds a localized description
  const pieces: string[] = [];
  if (typeof field.min === "number" && typeof field.max === "number") {
    pieces.push(`Range: ${field.min} - ${field.max}`);
  } else if (typeof field.min === "number") {
    pieces.push(`Minimum: ${field.min}`);
  } else if (typeof field.max === "number") {
    pieces.push(`Maximum: ${field.max}`);
  }
  if (field.regex) pieces.push(`Pattern: ${field.regex}`);
  if (field.isPublic === false) pieces.push("Hidden from patient-facing display.");
  return pieces.length ? pieces.join(" ") : undefined;
}

export function hasTemplateValue(value: unknown): boolean {
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "string") return Boolean(value.trim());
  if (Array.isArray(value)) return value.some((item) => hasTemplateValue(item));
  if (isLocalizedRecord(value)) {
    return Boolean(value.ar?.trim() || value.en?.trim());
  }
  if (isDynamicRecord(value)) {
    return Object.values(value).some((entry) => hasTemplateValue(entry));
  }
  return value !== undefined && value !== null;
}

function validateValueAgainstField(
  field: DynamicTemplateField,
  value: unknown,
  path: string,
  label: string,
): TemplateValidationIssue[] {
  const issues: TemplateValidationIssue[] = [];
  const fieldType = getTemplateFieldType(field);

  if (!hasTemplateValue(value)) return issues;

  if (Array.isArray(field.enum) && field.enum.length > 0) {
    const enumValues = field.enum
      .filter(
        (entry) =>
          typeof entry === "string" ||
          typeof entry === "number" ||
          typeof entry === "boolean",
      )
      .map((entry) => String(entry));
    if (enumValues.length && !enumValues.includes(String(value))) {
      issues.push({
        code: "enum",
        path,
        label,
        message: `${label} يجب أن تكون قيمة ضمن الخيارات المحددة.`,
      });
    }
  }

  if (fieldType === "number" && typeof value === "number" && !Number.isNaN(value)) {
    if (typeof field.min === "number" && value < field.min) {
      issues.push({
        code: "min",
        path,
        label,
        message: `${label} يجب أن تكون أكبر من أو تساوي ${field.min}.`,
      });
    }
    if (typeof field.max === "number" && value > field.max) {
      issues.push({
        code: "max",
        path,
        label,
        message: `${label} يجب أن تكون أصغر من أو تساوي ${field.max}.`,
      });
    }
  }

  if (typeof value === "string") {
    if (typeof field.min === "number" && value.length < field.min) {
      issues.push({
        code: "min",
        path,
        label,
        message: `${label} يجب أن يحتوي على ${field.min} أحرف على الأقل.`,
      });
    }
    if (typeof field.max === "number" && value.length > field.max) {
      issues.push({
        code: "max",
        path,
        label,
        message: `${label} يجب ألا يتجاوز ${field.max} أحرف.`,
      });
    }
    if (field.regex) {
      try {
        if (!new RegExp(field.regex).test(value)) {
          issues.push({
            code: "regex",
            path,
            label,
            message: `${label} لا يطابق النمط المطلوب.`,
          });
        }
      } catch {
        // Ignore invalid regex definitions coming from malformed schemas.
      }
    }
  }

  return issues;
}

export function collectTemplateFieldValidationIssues(
  template: AdminContentTemplate | undefined,
  value: AdminContentDynamicRecord | undefined,
  language: "ar" | "en",
): TemplateValidationIssue[] {
  if (!template?.fields?.length) return [];

  // Fields are flat per the backend's `ContentTemplateField` schema — no
  // nested traversal is needed (see `DynamicTemplateField` alias comment).
  return (template.fields as DynamicTemplateField[]).flatMap((field) => {
    const path = field.key;
    const fieldValue = getTemplateValueAtPath(value, [path]);
    const label = getLocalizedTemplateText(field.label, language) || path;

    const currentErrors: TemplateValidationIssue[] = [];
    if (field.required && !hasTemplateValue(fieldValue)) {
      currentErrors.push({
        code: "required",
        path,
        label,
        message: `${label} مطلوب`,
      });
    }

    currentErrors.push(
      ...validateValueAgainstField(field, fieldValue, path, label),
    );

    return currentErrors;
  });
}

export function collectMissingRequiredTemplateFields(
  template: AdminContentTemplate | undefined,
  value: AdminContentDynamicRecord | undefined,
  language: "ar" | "en",
): Array<{ path: string; label: string }> {
  return collectTemplateFieldValidationIssues(template, value, language)
    .filter((issue) => issue.code === "required")
    .map((issue) => ({ path: issue.path, label: issue.label }));
}
