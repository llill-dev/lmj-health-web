"use client";

import { z } from "zod";
import type { AdminContentBlock } from "@/lib/admin/types";

export const CONTENT_BLOCK_TYPE_OPTIONS = [
  { value: "paragraph", label: "فقرة" },
  { value: "heading", label: "عنوان فرعي" },
  { value: "list", label: "قائمة" },
  { value: "callout", label: "تنبيه / صندوق معلومات" },
  { value: "linkCard", label: "بطاقة رابط" },
  { value: "faq", label: "أسئلة شائعة" },
  { value: "divider", label: "فاصل" },
] as const;

export const CALL_OUT_VARIANT_OPTIONS = [
  { value: "info", label: "معلومة" },
  { value: "warn", label: "تنبيه" },
  { value: "danger", label: "تحذير" },
] as const;

export const HEADING_LEVEL_OPTIONS = [
  { value: 2, label: "H2" },
  { value: 3, label: "H3" },
  { value: 4, label: "H4" },
] as const;

export type SupportedBlockType =
  (typeof CONTENT_BLOCK_TYPE_OPTIONS)[number]["value"];

export type FaqFormItem = {
  question: string;
  answer: string;
};

export type BlockFormValue = {
  type: SupportedBlockType;
  text?: string;
  title?: string;
  description?: string;
  url?: string;
  itemsText?: string;
  faqItemsText?: string;
  faqItems?: FaqFormItem[];
  level?: number;
  ordered?: boolean;
  variant?: "info" | "warn" | "danger";
};

export const contentBlockSchema = z.object({
  type: z.enum([
    "paragraph",
    "heading",
    "list",
    "callout",
    "linkCard",
    "faq",
    "divider",
  ]),
  text: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
  itemsText: z.string().optional(),
  faqItemsText: z.string().optional(),
  faqItems: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    )
    .optional(),
  level: z.number().optional(),
  ordered: z.boolean().optional(),
  variant: z.enum(["info", "warn", "danger"]).optional(),
});

export function createEmptyBlock(
  type: SupportedBlockType = "paragraph",
): BlockFormValue {
  return {
    type,
    text: "",
    title: "",
    description: "",
    url: "",
    itemsText: "",
    faqItemsText: "",
    faqItems: [],
    level: type === "heading" ? 2 : undefined,
    ordered: false,
    variant: type === "callout" ? "info" : undefined,
  };
}

function parseFaqItemsText(
  value: string | undefined,
): Array<{ question: string; answer: string }> {
  if (!value?.trim()) return [];

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf("|");
      if (separatorIndex === -1) return null;
      const question = line.slice(0, separatorIndex).trim();
      const answer = line.slice(separatorIndex + 1).trim();
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter(
      (item): item is { question: string; answer: string } => Boolean(item),
    );
}

function normalizeFaqItem(value: unknown): FaqFormItem | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as Record<string, unknown>;
  const question = typeof entry.question === "string" ? entry.question.trim() : "";
  const answer = typeof entry.answer === "string" ? entry.answer.trim() : "";
  if (!question && !answer) return null;
  return { question, answer };
}

function normalizeFaqFormItems(block: BlockFormValue): FaqFormItem[] {
  const fromStructured = Array.isArray(block.faqItems)
    ? block.faqItems
        .map((item) => normalizeFaqItem(item))
        .filter((item): item is FaqFormItem => Boolean(item))
    : [];

  if (fromStructured.length) return fromStructured;
  return parseFaqItemsText(block.faqItemsText);
}

export function faqItemsToText(items: FaqFormItem[] | undefined): string {
  if (!Array.isArray(items) || !items.length) return "";
  return items
    .map((item) => {
      const question = item.question.trim();
      const answer = item.answer.trim();
      return question && answer ? `${question} | ${answer}` : "";
    })
    .filter(Boolean)
    .join("\n");
}

export function getLinkCardUrlValidationMessage(url: string | undefined): string {
  const value = url?.trim();
  if (!value) return "";

  if (value.includes(" ")) {
    return "الرابط يجب ألا يحتوي على مسافات.";
  }

  if (value.startsWith("www.")) {
    return "أضف البروتوكول الكامل للرابط مثل https://";
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "استخدم رابطًا يبدأ بـ http:// أو https:// فقط.";
    }
    return "";
  } catch {
    return "صيغة الرابط غير صحيحة. مثال صحيح: https://example.com";
  }
}

export function isMeaningfulBlock(block: BlockFormValue): boolean {
  if (block.type === "divider") return true;

  if (block.type === "list") {
    return Boolean(
      block.itemsText
        ?.split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean).length,
    );
  }

  if (block.type === "callout") {
    return Boolean(block.title?.trim() || block.text?.trim());
  }

  if (block.type === "linkCard") {
    return Boolean(
      block.title?.trim() || block.description?.trim() || block.url?.trim(),
    );
  }

  if (block.type === "faq") {
    return normalizeFaqFormItems(block).length > 0;
  }

  return Boolean(block.text?.trim());
}

export function buildContentBlocks(
  blocks: BlockFormValue[],
): AdminContentBlock[] {
  return blocks
    .map((block) => {
      if (block.type === "divider") return { type: "divider" };

      if (block.type === "heading") {
        const text = block.text?.trim();
        return text
          ? { type: "heading", level: block.level || 2, text }
          : null;
      }

      if (block.type === "list") {
        const items =
          block.itemsText
            ?.split(/\r?\n/)
            .map((item) => item.trim())
            .filter(Boolean) ?? [];

        return items.length
          ? { type: "list", items, ordered: Boolean(block.ordered) }
          : null;
      }

      if (block.type === "callout") {
        const title = block.title?.trim();
        const text = block.text?.trim();

        return title || text
          ? {
              type: "callout",
              variant: block.variant || "info",
              ...(title ? { title } : {}),
              ...(text ? { text } : {}),
            }
          : null;
      }

      if (block.type === "linkCard") {
        const title = block.title?.trim();
        const description = block.description?.trim();
        const url = block.url?.trim();

        return title || description || url
          ? {
              type: "linkCard",
              ...(title ? { title } : {}),
              ...(description ? { description } : {}),
              ...(url ? { url } : {}),
            }
          : null;
      }

      if (block.type === "faq") {
        const items = normalizeFaqFormItems(block);
        return items.length ? { type: "faq", items } : null;
      }

      const text = block.text?.trim();
      return text ? { type: "paragraph", text } : null;
    })
    .filter((block): block is AdminContentBlock => Boolean(block));
}

export function normalizeContentBlocksForForm(
  blocks: AdminContentBlock[] | undefined,
): BlockFormValue[] {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return [createEmptyBlock()];
  }

  const normalized = blocks.map((block) => {
    if (block.type === "heading") {
      return {
        type: "heading",
        text: typeof block.text === "string" ? block.text : "",
        level: typeof block.level === "number" ? block.level : 2,
      } satisfies BlockFormValue;
    }

    if (block.type === "list") {
      return {
        type: "list",
        itemsText: Array.isArray(block.items) ? block.items.join("\n") : "",
        ordered: Boolean(block.ordered),
      } satisfies BlockFormValue;
    }

    if (block.type === "callout") {
      return {
        type: "callout",
        title: typeof block.title === "string" ? block.title : "",
        text: typeof block.text === "string" ? block.text : "",
        variant:
          block.variant === "warn" || block.variant === "danger"
            ? block.variant
            : "info",
      } satisfies BlockFormValue;
    }

    if (block.type === "linkCard") {
      return {
        type: "linkCard",
        title: typeof block.title === "string" ? block.title : "",
        description:
          typeof block.description === "string" ? block.description : "",
        url: typeof block.url === "string" ? block.url : "",
      } satisfies BlockFormValue;
    }

    if (block.type === "faq") {
      const faqItems = Array.isArray(block.items)
        ? block.items
            .map((item) => {
              if (!item || typeof item !== "object") return null;
              const question =
                typeof item.question === "string" ? item.question.trim() : "";
              const answer = typeof item.answer === "string" ? item.answer.trim() : "";
              if (!question && !answer) return null;
              return { question, answer };
            })
            .filter((item): item is FaqFormItem => Boolean(item))
        : [];
      return {
        type: "faq",
        faqItems,
        faqItemsText: faqItemsToText(faqItems),
      } satisfies BlockFormValue;
    }

    if (block.type === "divider") {
      return createEmptyBlock("divider");
    }

    return {
      type: "paragraph",
      text: typeof block.text === "string" ? block.text : "",
    } satisfies BlockFormValue;
  });

  return normalized.length ? normalized : [createEmptyBlock()];
}

export function getBlockValidationMessage(block: BlockFormValue): string {
  if (block.type === "heading" && !block.text?.trim()) {
    return "أدخل نص العنوان الفرعي.";
  }

  if (block.type === "paragraph" && !block.text?.trim()) {
    return "أدخل نص الفقرة.";
  }

  if (
    block.type === "list" &&
    !block.itemsText
      ?.split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean).length
  ) {
    return "أضف عنصرًا واحدًا على الأقل في القائمة.";
  }

  if (block.type === "callout" && !block.title?.trim() && !block.text?.trim()) {
    return "أدخل عنوان التنبيه أو نصه.";
  }

  if (
    block.type === "linkCard" &&
    !block.title?.trim() &&
    !block.description?.trim() &&
    !block.url?.trim()
  ) {
    return "أدخل عنوان البطاقة أو وصفها أو الرابط.";
  }

  if (
    block.type === "linkCard" &&
    getLinkCardUrlValidationMessage(block.url)
  ) {
    return getLinkCardUrlValidationMessage(block.url);
  }

  if (block.type === "faq" && normalizeFaqFormItems(block).length === 0) {
    return "أضف سؤالًا وإجابة واحدة على الأقل.";
  }

  return "";
}
