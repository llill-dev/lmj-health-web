import { describe, expect, it } from "vitest";
import { hasSeekHelpCallout, toDisplayText } from "./medicalContentDialogHelpers";

describe("toDisplayText", () => {
  // Regression for the P0 audit finding: a localized template `name`/`label`
  // arriving as `{ en }` or `{ en, ar }` must never be handed to React as a
  // child directly (React error #31 — objects are not valid children). Every
  // call site that renders a template name must go through this helper.
  it("never returns the raw object for a localized { en } value", () => {
    const result = toDisplayText({ en: "Condition Template" });
    expect(typeof result).toBe("string");
    expect(result).toBe("Condition Template");
  });

  it("never returns the raw object for a localized { ar, en } value", () => {
    const result = toDisplayText({ ar: "قالب الحالة", en: "Condition Template" });
    expect(typeof result).toBe("string");
    expect(result).toBe("قالب الحالة");
  });

  it("returns an empty string (not an object) for an unrecognized object shape", () => {
    const result = toDisplayText({ foo: "bar" });
    expect(typeof result).toBe("string");
    expect(result).toBe("");
  });

  it("passes plain strings through unchanged", () => {
    expect(toDisplayText("Plain Name")).toBe("Plain Name");
  });
});

describe("hasSeekHelpCallout", () => {
  // docs/API.md:9800 — the real backend gate is a callout block with
  // variant warn/danger and a title containing "seek help" / "متى تراجع
  // الطبيب", not the `requiresSeekHelpBlock` toggle.
  it("returns false when there is no callout block", () => {
    expect(hasSeekHelpCallout([{ type: "paragraph", text: "..." } as never])).toBe(
      false,
    );
  });

  it("returns false for a callout with the wrong variant", () => {
    expect(
      hasSeekHelpCallout([
        {
          type: "callout",
          variant: "info",
          title: "Seek help now",
          text: "...",
        } as never,
      ]),
    ).toBe(false);
  });

  it("returns false for a danger callout without a matching title", () => {
    expect(
      hasSeekHelpCallout([
        { type: "callout", variant: "danger", title: "Note", text: "..." } as never,
      ]),
    ).toBe(false);
  });

  it("returns true for a danger callout with an English seek-help title", () => {
    expect(
      hasSeekHelpCallout([
        {
          type: "callout",
          variant: "danger",
          title: "When to seek help",
          text: "...",
        } as never,
      ]),
    ).toBe(true);
  });

  it("returns true for a warn callout with the Arabic seek-help title", () => {
    expect(
      hasSeekHelpCallout([
        {
          type: "callout",
          variant: "warn",
          title: "متى تراجع الطبيب",
          text: "...",
        } as never,
      ]),
    ).toBe(true);
  });

  it("returns false for undefined/empty blocks", () => {
    expect(hasSeekHelpCallout(undefined)).toBe(false);
    expect(hasSeekHelpCallout([])).toBe(false);
  });
});
