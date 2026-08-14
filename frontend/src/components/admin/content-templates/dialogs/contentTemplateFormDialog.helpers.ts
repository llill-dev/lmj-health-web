const SCHEMA_FIELD_TYPES = [
  "string",
  "number",
  "boolean",
  "array",
  "object",
] as const;

export type SchemaFieldType = (typeof SCHEMA_FIELD_TYPES)[number];

type LocalizedTextLike =
  | string
  | {
      ar?: string | null;
      en?: string | null;
    }
  | null
  | undefined;

const LEGACY_FIELD_TYPE_TO_SCHEMA_TYPE: Record<string, SchemaFieldType> = {
  text: "string",
  textarea: "string",
  select: "string",
  date: "string",
  string: "string",
  number: "number",
  boolean: "boolean",
  array: "array",
  object: "object",
};

export function getLocalizedTextParts(value: LocalizedTextLike): {
  ar: string;
  en: string;
} {
  if (typeof value === "string") {
    return { ar: value, en: "" };
  }

  return {
    ar: value?.ar ?? "",
    en: value?.en ?? "",
  };
}

export function getPreferredLocalizedText(value: LocalizedTextLike): string {
  if (typeof value === "string") {
    return value;
  }

  return value?.ar ?? value?.en ?? "";
}

export function normalizeSchemaFieldType(value: unknown): SchemaFieldType {
  return LEGACY_FIELD_TYPE_TO_SCHEMA_TYPE[String(value)] ?? "string";
}

/**
 * Builds the exact `LocalizedInput` shape for docs/openapi.json — an object
 * containing only the locale key(s) that actually have text.
 *
 * This must never fall back to duplicating one locale's text into the
 * other (e.g. `{ar: en}` when ar is blank), and must never collapse to a
 * bare string when only one locale is filled. Both of those previously
 * happened here, and if the backend's own bare-string handling for
 * `LocalizedInput` mirrors the value into both `ar`/`en` on store, the
 * result is the Arabic value silently reappearing in the English input
 * (or vice versa) the next time the record is edited.
 */
export function serializeLocalizedLabel(parts: {
  ar: string;
  en: string;
}): { ar?: string; en?: string } | string {
  const ar = parts.ar.trim();
  const en = parts.en.trim();

  if (ar && en) return { ar, en };
  if (ar) return { ar };
  if (en) return { en };
  return "";
}

/**
 * `ContentTemplateField.enum` (docs/openapi.json) is an untyped array of
 * scalar option values. The form authors it as a single comma-separated
 * text input rather than a repeatable-item widget, matching how
 * tags/categories/riskFlags are authored elsewhere in the medical-content
 * editor.
 */
export function enumToOptionsText(value: unknown[] | undefined): string {
  if (!Array.isArray(value)) return "";
  return value
    .filter(
      (entry): entry is string | number | boolean =>
        typeof entry === "string" ||
        typeof entry === "number" ||
        typeof entry === "boolean",
    )
    .map((entry) => String(entry))
    .join(", ");
}

export function optionsTextToEnum(value: string): string[] | undefined {
  const options = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return options.length ? options : undefined;
}

export function getSchemaFieldTypeOptions(
  t: (key: string, fallback?: string) => string,
): Array<{ value: SchemaFieldType; label: string }> {
  return [
    { value: "string", label: t("contentTemplateDialog.schemaTypes.string", "نص") },
    { value: "number", label: t("contentTemplateDialog.schemaTypes.number", "رقم") },
    {
      value: "boolean",
      label: t("contentTemplateDialog.schemaTypes.boolean", "قيمة منطقية"),
    },
    { value: "array", label: t("contentTemplateDialog.schemaTypes.array", "قائمة") },
    { value: "object", label: t("contentTemplateDialog.schemaTypes.object", "كائن") },
  ];
}
