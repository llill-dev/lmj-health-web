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

export type DynamicTemplateField = AdminContentTemplateField & {
  description?: AdminLocalizedValue;
  placeholder?: AdminLocalizedValue;
  uiHints?: Record<string, unknown>;
  fields?: DynamicTemplateField[];
  itemFields?: DynamicTemplateField[];
  items?: DynamicTemplateField[];
  of?: DynamicTemplateField;
};

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
  switch (field.type) {
    case "text":
    case "textarea":
    case "date":
    case "select":
      return "string";
    default:
      return field.type || "string";
  }
}

export function getNestedTemplateFields(
  field: DynamicTemplateField | undefined,
): DynamicTemplateField[] {
  if (!field) return [];

  if (Array.isArray(field.fields)) return field.fields;
  if (Array.isArray(field.itemFields)) return field.itemFields;

  if (Array.isArray(field.items)) {
    return field.items.filter(
      (item): item is DynamicTemplateField =>
        Boolean(item && typeof item === "object" && "key" in item),
    );
  }

  if (field.of && Array.isArray(field.of.fields)) return field.of.fields;
  return [];
}

export function getArrayItemField(
  field: DynamicTemplateField | undefined,
): DynamicTemplateField | undefined {
  if (!field) return undefined;

  if (field.of && typeof field.of === "object") return field.of;

  const firstItem = Array.isArray(field.items)
    ? field.items.find(
        (item): item is DynamicTemplateField =>
          Boolean(item && typeof item === "object"),
      )
    : undefined;

  if (!firstItem) return undefined;
  if (typeof firstItem.type === "string") return firstItem;
  if (Array.isArray(firstItem.fields)) return { ...firstItem, type: "object" };
  return undefined;
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

function readOptionLabel(
  value: unknown,
  language: "ar" | "en",
  fallback: string,
): string {
  if (typeof value === "string") return value;
  if (isLocalizedRecord(value)) {
    return value[language] || value.ar || value.en || fallback;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.label === "string") return record.label;
    if (isLocalizedRecord(record.label)) {
      return (
        record.label[language] ||
        record.label.ar ||
        record.label.en ||
        fallback
      );
    }
    if (typeof record.name === "string") return record.name;
    if (isLocalizedRecord(record.name)) {
      return (
        record.name[language] ||
        record.name.ar ||
        record.name.en ||
        fallback
      );
    }
  }
  return fallback;
}

function readUiHintOptions(
  field: DynamicTemplateField,
  language: "ar" | "en",
): TemplateFieldSelectOption[] {
  const hints = field.uiHints;
  if (!hints || typeof hints !== "object") return [];
  const record = hints as Record<string, unknown>;
  const raw = Array.isArray(record.options)
    ? record.options
    : Array.isArray(record.enum)
      ? record.enum
      : [];

  return raw
    .map((entry): TemplateFieldSelectOption | null => {
      if (
        typeof entry === "string" ||
        typeof entry === "number" ||
        typeof entry === "boolean"
      ) {
        const scalar = String(entry);
        return { value: scalar, label: scalar };
      }

      if (!entry || typeof entry !== "object") return null;
      const source = entry as Record<string, unknown>;
      const rawValue = source.value ?? source.key ?? source.id;
      if (
        typeof rawValue !== "string" &&
        typeof rawValue !== "number" &&
        typeof rawValue !== "boolean"
      ) {
        return null;
      }
      const value = String(rawValue);
      return {
        value,
        label: readOptionLabel(source.label ?? source.name, language, value),
      };
    })
    .filter((option): option is TemplateFieldSelectOption => Boolean(option));
}

export function getTemplateFieldSelectOptions(
  field: DynamicTemplateField,
  language: "ar" | "en",
): TemplateFieldSelectOption[] {
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

  const options = fromEnum.length ? fromEnum : readUiHintOptions(field, language);
  if (!options.length) return [];

  const unique = new Map<string, TemplateFieldSelectOption>();
  options.forEach((option) => {
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

export function coerceArrayTextareaValue(
  rawValue: string,
  itemField?: DynamicTemplateField,
): AdminContentDynamicValue[] | undefined {
  const entries = rawValue
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!entries.length) return undefined;
  if (getTemplateFieldType(itemField || { key: "", type: "string" }) !== "number") {
    return entries;
  }

  return entries
    .map((entry) => Number(entry))
    .filter((entry) => !Number.isNaN(entry));
}

export function getFieldHelperText(
  field: DynamicTemplateField,
  language: "ar" | "en",
): string | undefined {
  const pieces: string[] = [];
  const description = getLocalizedTemplateText(field.description, language);
  if (description) pieces.push(description);
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

  const visit = (
    fields: DynamicTemplateField[],
    parentPath: string[],
  ): TemplateValidationIssue[] =>
    fields.flatMap((field) => {
      const currentPath = [...parentPath, field.key];
      const fieldValue = getTemplateValueAtPath(value, currentPath);
      const label =
        getLocalizedTemplateText(field.label, language) || currentPath.join(".");
      const nestedFields = getNestedTemplateFields(field);
      const fieldType = getTemplateFieldType(field);
      const path = currentPath.join(".");

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

      if (
        nestedFields.length &&
        fieldType === "object" &&
        isDynamicRecord(fieldValue)
      ) {
        currentErrors.push(...visit(nestedFields, currentPath));
      }

      if (nestedFields.length && fieldType === "array" && Array.isArray(fieldValue)) {
        fieldValue.forEach((entry, index) => {
          if (!isDynamicRecord(entry)) return;
          currentErrors.push(
            ...visit(nestedFields, [...currentPath, String(index)]),
          );
        });
      } else if (fieldType === "array" && Array.isArray(fieldValue)) {
        const itemField = getArrayItemField(field);
        if (itemField) {
          fieldValue.forEach((entry, index) => {
            const itemPath = [...currentPath, String(index)];
            const itemLabel = `${label} (${index + 1})`;
            currentErrors.push(
              ...validateValueAgainstField(
                itemField,
                entry,
                itemPath.join("."),
                itemLabel,
              ),
            );
          });
        }
      }

      return currentErrors;
    });

  return visit(template.fields as DynamicTemplateField[], []);
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
