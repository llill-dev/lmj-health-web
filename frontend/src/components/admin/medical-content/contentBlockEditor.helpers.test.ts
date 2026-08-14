import { describe, expect, it } from "vitest";
import {
  buildContentBlocks,
  createEmptyBlock,
  getBlockValidationMessage,
  HEADING_LEVEL_OPTIONS,
  isMeaningfulBlock,
  type BlockFormValue,
} from "./contentBlockEditor.helpers";

// docs/API.md:9814,9817-9819 — backend block validation the frontend must
// mirror, per the medical-content E2E audit's block-validation matrix.

const t = (key: string, fallback?: string) => fallback ?? key;

describe("heading levels", () => {
  it("offers the full backend-supported H1-H6 range, not just H2-H4", () => {
    const values = HEADING_LEVEL_OPTIONS.map((option) => option.value);
    expect(values).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("callout block — requires both title and text", () => {
  const base: BlockFormValue = { ...createEmptyBlock("callout"), variant: "danger" };

  it("is not meaningful with only a title", () => {
    expect(isMeaningfulBlock({ ...base, title: "Seek help", text: "" })).toBe(false);
  });

  it("is not meaningful with only text", () => {
    expect(isMeaningfulBlock({ ...base, title: "", text: "Some text" })).toBe(false);
  });

  it("is meaningful once both are filled", () => {
    expect(
      isMeaningfulBlock({ ...base, title: "Seek help", text: "Some text" }),
    ).toBe(true);
  });

  it("is dropped from the built payload when only one field is filled", () => {
    const built = buildContentBlocks([{ ...base, title: "Seek help", text: "" }]);
    expect(built).toEqual([]);
  });

  it("surfaces a validation message when incomplete", () => {
    expect(
      getBlockValidationMessage({ ...base, title: "Seek help", text: "" }, t),
    ).not.toBe("");
  });
});

describe("linkCard block — requires both title and url", () => {
  const base: BlockFormValue = createEmptyBlock("linkCard");

  it("is not meaningful with only a description", () => {
    expect(
      isMeaningfulBlock({ ...base, description: "A helpful link", url: "" }),
    ).toBe(false);
  });

  it("is not meaningful with only a title", () => {
    expect(isMeaningfulBlock({ ...base, title: "Trusted source", url: "" })).toBe(
      false,
    );
  });

  it("is meaningful once title and url are both filled", () => {
    expect(
      isMeaningfulBlock({
        ...base,
        title: "Trusted source",
        url: "https://example.com",
      }),
    ).toBe(true);
  });

  it("is dropped from the built payload when only description is filled", () => {
    const built = buildContentBlocks([
      { ...base, description: "A helpful link", url: "" },
    ]);
    expect(built).toEqual([]);
  });
});

describe("faq block — rejects one-sided question/answer pairs", () => {
  it("does not count a pair with only a question as meaningful", () => {
    const block: BlockFormValue = {
      ...createEmptyBlock("faq"),
      faqItems: [{ question: "What is this?", answer: "" }],
    };
    expect(isMeaningfulBlock(block)).toBe(false);
  });

  it("does not count a pair with only an answer as meaningful", () => {
    const block: BlockFormValue = {
      ...createEmptyBlock("faq"),
      faqItems: [{ question: "", answer: "Some answer." }],
    };
    expect(isMeaningfulBlock(block)).toBe(false);
  });

  it("counts a complete pair as meaningful", () => {
    const block: BlockFormValue = {
      ...createEmptyBlock("faq"),
      faqItems: [{ question: "What is this?", answer: "Some answer." }],
    };
    expect(isMeaningfulBlock(block)).toBe(true);
  });

  it("drops one-sided pairs from the built payload even alongside a complete one", () => {
    const block: BlockFormValue = {
      ...createEmptyBlock("faq"),
      faqItems: [
        { question: "Complete?", answer: "Yes." },
        { question: "Incomplete", answer: "" },
      ],
    };
    const built = buildContentBlocks([block]);
    expect(built).toEqual([
      { type: "faq", items: [{ question: "Complete?", answer: "Yes." }] },
    ]);
  });
});
