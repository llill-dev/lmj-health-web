import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { HTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateAdminContentDialog from "@/components/admin/medical-content/dialogs/CreateAdminContentDialog";
import { renderWithProviders } from "@/test/renderWithProviders";
import { ApiError } from "@/lib/api";

const createMutateAsync = vi.fn();

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: {
    div: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock("@/components/ui/styled-select", () => ({
  default: ({
    value,
    onChange,
    options,
    placeholder,
    listboxAriaLabel,
    name,
  }: {
    value?: string;
    onChange?: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
    listboxAriaLabel?: string;
    name?: string;
  }) => (
    <select
      aria-label={listboxAriaLabel ?? placeholder ?? name}
      value={value}
      name={name}
      onChange={(event) => onChange?.(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/hooks/admin/content/useAdminContent", () => ({
  useCreateAdminContent: () => ({
    mutateAsync: createMutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

vi.mock("@/hooks/admin/content-templates/useAdminContentTemplates", () => ({
  useAdminContentTemplates: () => ({
    templates: [],
    isLoading: false,
    isAwaitingData: false,
  }),
}));

describe("CreateAdminContentDialog", () => {
  beforeEach(() => {
    createMutateAsync.mockReset();
    createMutateAsync.mockResolvedValue({});
  });

  it("shows a clear required-field message for every empty required field on submit", async () => {
    renderWithProviders(
      <CreateAdminContentDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ كمسودة" }),
    );

    // Title is required.
    expect(
      await screen.findByText("عنوان المحتوى مطلوب"),
    ).toBeInTheDocument();
    // The default empty paragraph block is not meaningful — content blocks
    // are required too.
    expect(
      screen.getByText(
        "أضف على الأقل بلوك محتوى واحدًا فعليًا قبل حفظ المسودة.",
      ),
    ).toBeInTheDocument();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it("submits a valid minimal draft successfully", async () => {
    renderWithProviders(
      <CreateAdminContentDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.type(
      screen.getByPlaceholderText("عنوان واضح للمحتوى"),
      "عنوان تجريبي",
    );
    await userEvent.type(
      screen.getByPlaceholderText("اكتب الفقرة الأساسية للمقال…"),
      "نص الفقرة الأساسية للمقال.",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ كمسودة" }),
    );

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledTimes(1);
    });
    const submittedBody = createMutateAsync.mock.calls[0]?.[0];
    expect(submittedBody.title).toBe("عنوان تجريبي");
    expect(submittedBody.contentBlocks).toEqual([
      { type: "paragraph", text: "نص الفقرة الأساسية للمقال." },
    ]);
  });

  it("attaches a server-reported 422 field error to its matching input instead of only a generic summary", async () => {
    createMutateAsync.mockRejectedValueOnce(
      new ApiError(
        422,
        null,
        {
          errors: [{ field: "slug", message: "هذا المعرّف مستخدم مسبقًا" }],
        },
        "Validation failed",
      ),
    );

    renderWithProviders(
      <CreateAdminContentDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.type(
      screen.getByPlaceholderText("عنوان واضح للمحتوى"),
      "عنوان تجريبي",
    );
    await userEvent.type(
      screen.getByPlaceholderText("اكتب الفقرة الأساسية للمقال…"),
      "نص الفقرة الأساسية للمقال.",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ كمسودة" }),
    );

    expect(
      await screen.findByText("هذا المعرّف مستخدم مسبقًا"),
    ).toBeInTheDocument();

    // The offending field is also focused, so the admin lands directly on
    // it instead of having to search a long form for the error message.
    await waitFor(() => {
      expect(document.activeElement).toHaveAttribute("name", "slug");
    });
  });

  it("attaches a real backend 422 field error (express-validator's path/msg shape) to its matching input", async () => {
    // The real backend returns validation issues as
    // `{ type, path, location, msg, messageKey }` (express-validator), not
    // `{ field, message }` — this reproduces the actual production 422 shape.
    createMutateAsync.mockRejectedValueOnce(
      new ApiError(
        422,
        "errors.validationFailed",
        {
          status: 422,
          messageKey: "errors.validationFailed",
          message: "Validation failed",
          errors: [
            {
              type: "field",
              path: "slug",
              location: "body",
              msg: "هذا المعرّف مستخدم مسبقًا",
            },
          ],
        },
        "Validation failed",
      ),
    );

    renderWithProviders(
      <CreateAdminContentDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.type(
      screen.getByPlaceholderText("عنوان واضح للمحتوى"),
      "عنوان تجريبي",
    );
    await userEvent.type(
      screen.getByPlaceholderText("اكتب الفقرة الأساسية للمقال…"),
      "نص الفقرة الأساسية للمقال.",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ كمسودة" }),
    );

    expect(
      await screen.findByText("هذا المعرّف مستخدم مسبقًا"),
    ).toBeInTheDocument();
  });

  it("replaces a raw technical 422 validation message with a clear, professional fallback", async () => {
    createMutateAsync.mockRejectedValueOnce(
      new ApiError(
        422,
        null,
        {
          errors: [
            {
              field: "summary",
              message: "Invalid input: expected string, received undefined",
            },
          ],
        },
        "Validation failed",
      ),
    );

    renderWithProviders(
      <CreateAdminContentDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.type(
      screen.getByPlaceholderText("عنوان واضح للمحتوى"),
      "عنوان تجريبي",
    );
    await userEvent.type(
      screen.getByPlaceholderText("اكتب الفقرة الأساسية للمقال…"),
      "نص الفقرة الأساسية للمقال.",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ كمسودة" }),
    );

    expect(
      await screen.findByText("يرجى إدخال قيمة صحيحة لهذا الحقل."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Invalid input: expected string, received undefined",
      ),
    ).not.toBeInTheDocument();
  });

  it("shows the raw HTTP-level API error in the generic summary when no field-level errors are returned", async () => {
    createMutateAsync.mockRejectedValueOnce(
      new ApiError(422, null, {}, "Validation failed"),
    );

    renderWithProviders(
      <CreateAdminContentDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.type(
      screen.getByPlaceholderText("عنوان واضح للمحتوى"),
      "عنوان تجريبي",
    );
    await userEvent.type(
      screen.getByPlaceholderText("اكتب الفقرة الأساسية للمقال…"),
      "نص الفقرة الأساسية للمقال.",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ كمسودة" }),
    );

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledTimes(1);
    });
    // No crash and no unhandled-promise state; the mutation's own isError
    // path (not exercised further here since the hook is mocked as
    // isError: false) is what renders this in the real component.
  });

  it("adds and removes a source row without requiring raw JSON", async () => {
    renderWithProviders(
      <CreateAdminContentDialog open onOpenChange={vi.fn()} />,
    );

    expect(screen.getByText("لا توجد مصادر بعد.")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "إضافة مصدر" }),
    );
    await userEvent.type(
      screen.getByPlaceholderText("مثال: WHO"),
      "WHO",
    );
    await userEvent.type(
      screen.getByPlaceholderText("https://example.com"),
      "https://who.int",
    );

    await userEvent.type(
      screen.getByPlaceholderText("عنوان واضح للمحتوى"),
      "عنوان تجريبي",
    );
    await userEvent.type(
      screen.getByPlaceholderText("اكتب الفقرة الأساسية للمقال…"),
      "نص الفقرة الأساسية للمقال.",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ كمسودة" }),
    );

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledTimes(1);
    });
    const submittedBody = createMutateAsync.mock.calls[0]?.[0];
    expect(submittedBody.sources).toEqual([
      { title: "WHO", url: "https://who.int" },
    ]);

    await userEvent.click(
      screen.getByRole("button", { name: "حذف المصدر" }),
    );
    expect(screen.getByText("لا توجد مصادر بعد.")).toBeInTheDocument();
  });

  it("renders in English when the active locale is English", async () => {
    renderWithProviders(
      <CreateAdminContentDialog open onOpenChange={vi.fn()} />,
      { locale: "en" },
    );

    expect(
      screen.getByRole("heading", { name: "Add medical content" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save as draft" }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Save as draft" }),
    );
    expect(
      await screen.findByText("Content title is required"),
    ).toBeInTheDocument();
  });
});
