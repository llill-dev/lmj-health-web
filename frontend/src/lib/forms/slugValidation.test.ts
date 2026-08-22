import { describe, expect, it } from "vitest";
import {
  isValidLatinSlug,
  LATIN_SLUG_MESSAGE,
  optionalLatinSlugSchema,
  requiredLatinSlugSchema,
} from "@/lib/forms/slugValidation";

describe("slugValidation", () => {
  it("accepts lowercase latin slugs separated by hyphens", () => {
    expect(isValidLatinSlug("follow-up-template")).toBe(true);
    expect(isValidLatinSlug("article-2026")).toBe(true);
  });

  it("rejects arabic, spaces, underscores, and uppercase characters", () => {
    expect(isValidLatinSlug("مقال-طبي")).toBe(false);
    expect(isValidLatinSlug("bad slug")).toBe(false);
    expect(isValidLatinSlug("bad_slug")).toBe(false);
    expect(isValidLatinSlug("Bad-Slug")).toBe(false);
  });

  it("allows empty optional slug values and rejects invalid optional values", () => {
    expect(optionalLatinSlugSchema().safeParse("").success).toBe(true);
    expect(optionalLatinSlugSchema().safeParse(undefined).success).toBe(true);

    const invalid = optionalLatinSlugSchema().safeParse("اختبار");
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.error.issues[0]?.message).toBe(LATIN_SLUG_MESSAGE);
    }
  });

  it("requires a value for required slugs and validates its format", () => {
    expect(requiredLatinSlugSchema().safeParse("valid-slug").success).toBe(true);

    const empty = requiredLatinSlugSchema().safeParse("");
    expect(empty.success).toBe(false);

    const invalid = requiredLatinSlugSchema().safeParse("slug_123");
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.error.issues[0]?.message).toBe(LATIN_SLUG_MESSAGE);
    }
  });
});
