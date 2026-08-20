import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import { extractFieldValidationErrors, userFacingErrorMessage } from "@/lib/admin/userFacingError";

describe("extractFieldValidationErrors", () => {
  it("returns [] for non-422 errors", () => {
    expect(extractFieldValidationErrors(new Error("boom"))).toEqual([]);
    expect(
      extractFieldValidationErrors(
        new ApiError(500, null, { errors: [{ field: "x", message: "y" }] }, "boom"),
      ),
    ).toEqual([]);
  });

  it("returns [] when the 422 body has no errors array", () => {
    expect(
      extractFieldValidationErrors(new ApiError(422, null, {}, "Validation failed")),
    ).toEqual([]);
  });

  it("extracts errors from the real backend shape ({ path, msg } — express-validator)", () => {
    const err = new ApiError(
      422,
      "errors.validationFailed",
      {
        status: 422,
        messageKey: "errors.validationFailed",
        message: "Validation failed",
        errors: [
          { type: "field", path: "slug", location: "body", msg: "هذا المعرّف مستخدم مسبقًا" },
        ],
      },
      "Validation failed",
    );

    expect(extractFieldValidationErrors(err)).toEqual([
      { field: "slug", message: "هذا المعرّف مستخدم مسبقًا" },
    ]);
  });

  it("still supports the legacy { field, message } shape", () => {
    const err = new ApiError(
      422,
      null,
      { errors: [{ field: "title", message: "العنوان مطلوب" }] },
      "Validation failed",
    );

    expect(extractFieldValidationErrors(err)).toEqual([
      { field: "title", message: "العنوان مطلوب" },
    ]);
  });

  it("replaces a raw technical message with a professional fallback regardless of the shape used", () => {
    const err = new ApiError(
      422,
      null,
      {
        errors: [
          { path: "summary", msg: "Invalid input: expected string, received undefined" },
        ],
      },
      "Validation failed",
    );

    const [issue] = extractFieldValidationErrors(err);
    expect(issue.field).toBe("summary");
    expect(issue.message).not.toContain("Invalid input");
    expect(["يرجى إدخال قيمة صحيحة لهذا الحقل.", "Please enter a valid value for this field."]).toContain(
      issue.message,
    );
  });

  it("drops issues with an empty message after trimming", () => {
    const err = new ApiError(
      422,
      null,
      { errors: [{ path: "title", msg: "   " }, { path: "slug", msg: "مطلوب" }] },
      "Validation failed",
    );

    expect(extractFieldValidationErrors(err)).toEqual([
      { field: "slug", message: "مطلوب" },
    ]);
  });
});

describe("userFacingErrorMessage", () => {
  it("joins field-level 422 messages instead of showing a raw/generic message", () => {
    const err = new ApiError(
      422,
      null,
      {
        errors: [
          { path: "title", msg: "العنوان مطلوب" },
          { path: "slug", msg: "المعرّف غير صالح" },
        ],
      },
      "Validation failed",
    );

    expect(userFacingErrorMessage(err)).toBe("العنوان مطلوب • المعرّف غير صالح");
  });
});
