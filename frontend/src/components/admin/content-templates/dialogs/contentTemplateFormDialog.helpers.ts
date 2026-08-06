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

export function serializeLocalizedLabel(parts: {
  ar: string;
  en: string;
}): string | { ar: string; en: string } {
  const ar = parts.ar.trim();
  const en = parts.en.trim();

  if (!en) {
    return ar;
  }

  return {
    ar: ar || en,
    en,
  };
}

export const schemaFieldTypeOptions: Array<{
  value: SchemaFieldType;
  label: string;
}> = [
  { value: "string", label: "نص" },
  { value: "number", label: "رقم" },
  { value: "boolean", label: "قيمة منطقية" },
  { value: "array", label: "قائمة" },
  { value: "object", label: "كائن" },
];
