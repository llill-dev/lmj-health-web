import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { HTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContentTemplateFormDialog from "@/components/admin/content-templates/dialogs/ContentTemplateFormDialog";
import { renderWithProviders } from "@/test/renderWithProviders";
import { ApiError } from "@/lib/api";

const createMutateAsync = vi.fn();
const updateMutateAsync = vi.fn();

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

vi.mock("@/hooks/admin/content-templates/useAdminContentTemplates", () => ({
  useCreateAdminContentTemplate: () => ({
    mutateAsync: createMutateAsync,
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  }),
  useUpdateAdminContentTemplate: () => ({
    mutateAsync: updateMutateAsync,
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  }),
}));

describe("ContentTemplateFormDialog", () => {
  beforeEach(() => {
    createMutateAsync.mockReset();
    updateMutateAsync.mockReset();
    createMutateAsync.mockResolvedValue({});
    updateMutateAsync.mockResolvedValue({});
  });

  it("auto-suggests a slug from the English name until the slug is edited manually", async () => {
    renderWithProviders(
      <ContentTemplateFormDialog open onOpenChange={vi.fn()} />,
    );

    const slugInput = screen.getByPlaceholderText("my-template");
    await userEvent.type(
      screen.getByPlaceholderText("Clear template name"),
      "Condition Template!",
    );
    await waitFor(() => {
      expect(slugInput).toHaveValue("condition-template");
    });

    await userEvent.clear(slugInput);
    await userEvent.type(slugInput, "my-custom-slug");
    await userEvent.type(
      screen.getByPlaceholderText("Clear template name"),
      " Extra",
    );

    // Manual edits must not be overwritten by further name changes.
    expect(slugInput).toHaveValue("my-custom-slug");
  });

  it("shows validation errors when submitting without required data", async () => {
    renderWithProviders(
      <ContentTemplateFormDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ القالب" }),
    );

    expect(await screen.findByText("اسم القالب مطلوب")).toBeInTheDocument();
    expect(
      screen.getByText("أضف حقلاً واحداً على الأقل"),
    ).toBeInTheDocument();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it("shows the 'add a field' error even when only the name is filled in", async () => {
    renderWithProviders(
      <ContentTemplateFormDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.type(
      screen.getByPlaceholderText("اسم واضح للقالب"),
      "قالب متابعة",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ القالب" }),
    );

    expect(
      await screen.findByText("أضف حقلاً واحداً على الأقل"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("اسم القالب مطلوب"),
    ).not.toBeInTheDocument();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it("prevents submit when field label is missing", async () => {
    renderWithProviders(
      <ContentTemplateFormDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.type(
      screen.getByPlaceholderText("اسم واضح للقالب"),
      "قالب متابعة",
    );
    await userEvent.click(screen.getByRole("button", { name: "إضافة حقل" }));
    await userEvent.type(screen.getByPlaceholderText("fieldKey"), "followUp");

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ القالب" }),
    );

    expect(await screen.findByText("تسمية الحقل مطلوبة")).toBeInTheDocument();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it("prevents submit when field key is missing but the Arabic label is filled", async () => {
    renderWithProviders(
      <ContentTemplateFormDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.type(
      screen.getByPlaceholderText("اسم واضح للقالب"),
      "قالب متابعة",
    );
    await userEvent.click(screen.getByRole("button", { name: "إضافة حقل" }));
    await userEvent.type(
      screen.getByPlaceholderText("تسمية ظاهرة للحقل"),
      "ملاحظات المتابعة",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ القالب" }),
    );

    expect(await screen.findByText("مفتاح الحقل مطلوب")).toBeInTheDocument();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it("rejects arabic slug input before submitting", async () => {
    renderWithProviders(
      <ContentTemplateFormDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.type(
      screen.getByPlaceholderText("اسم واضح للقالب"),
      "قالب متابعة",
    );
    await userEvent.type(screen.getByPlaceholderText("my-template"), "قالب-متابعة");
    await userEvent.click(screen.getByRole("button", { name: "إضافة حقل" }));
    await userEvent.type(screen.getByPlaceholderText("fieldKey"), "followUp");
    await userEvent.type(
      screen.getByPlaceholderText("تسمية ظاهرة للحقل"),
      "ملاحظات المتابعة",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ القالب" }),
    );

    expect(
      await screen.findByText(
        "المعرّف يجب أن يحتوي على أحرف لاتينية صغيرة وأرقام وشرطات فقط",
      ),
    ).toBeInTheDocument();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it("submits a trimmed payload when the form is valid", async () => {
    renderWithProviders(
      <ContentTemplateFormDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.type(
      screen.getByPlaceholderText("اسم واضح للقالب"),
      "  قالب متابعة  ",
    );
    await userEvent.type(screen.getByPlaceholderText("my-template"), "follow-up-template");
    await userEvent.click(screen.getByRole("button", { name: "إضافة حقل" }));
    await userEvent.type(screen.getByPlaceholderText("fieldKey"), "followUp");
    await userEvent.type(
      screen.getByPlaceholderText("تسمية ظاهرة للحقل"),
      "  ملاحظات المتابعة  ",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ القالب" }),
    );

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith({
        // Only the Arabic locale was filled — must be sent as an explicit
        // { ar } object, never a bare string. A bare string here previously
        // caused the backend to echo the same text back into the English
        // field on the next edit (see the "does not leak the Arabic value
        // into the English input" test below).
        name: { ar: "قالب متابعة" },
        slug: "follow-up-template",
        parentType: "CONDITION",
        fields: [
          {
            key: "followUp",
            label: { ar: "ملاحظات المتابعة" },
            type: "string",
            required: false,
          },
        ],
      });
    });
  });

  it("does not leak the Arabic value into the English name/label on next edit", async () => {
    // Regression test: serializeLocalizedLabel must never duplicate one
    // locale's text into the other locale.
    const { serializeLocalizedLabel, getLocalizedTextParts } = await import(
      "./contentTemplateFormDialog.helpers"
    );

    const submitted = serializeLocalizedLabel({ ar: "قالب متابعة", en: "" });
    expect(submitted).toEqual({ ar: "قالب متابعة" });

    const hydrated = getLocalizedTextParts(submitted);
    expect(hydrated).toEqual({ ar: "قالب متابعة", en: "" });
  });

  it("maps comma-separated options to an enum array on submit", async () => {
    renderWithProviders(
      <ContentTemplateFormDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.type(
      screen.getByPlaceholderText("اسم واضح للقالب"),
      "قالب متابعة",
    );
    await userEvent.click(screen.getByRole("button", { name: "إضافة حقل" }));
    await userEvent.type(screen.getByPlaceholderText("fieldKey"), "severity");
    await userEvent.type(
      screen.getByPlaceholderText("تسمية ظاهرة للحقل"),
      "الشدة",
    );
    await userEvent.type(
      screen.getByPlaceholderText("option1, option2, option3"),
      "low, medium, high",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ القالب" }),
    );

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: [
            expect.objectContaining({
              key: "severity",
              enum: ["low", "medium", "high"],
            }),
          ],
        }),
      );
    });
  });

  it("hydrates existing enum options back into the options input", async () => {
    renderWithProviders(
      <ContentTemplateFormDialog
        open
        onOpenChange={vi.fn()}
        template={{
          _id: "tpl-1",
          name: "Condition Template",
          slug: "condition-template",
          parentType: "CONDITION",
          fields: [
            {
              key: "severity",
              label: "الشدة",
              type: "string",
              required: false,
              enum: ["low", "medium", "high"],
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByPlaceholderText("option1, option2, option3"),
    ).toHaveValue("low, medium, high");
  });

  it("hydrates a bilingual template name into separate Arabic/English inputs", async () => {
    renderWithProviders(
      <ContentTemplateFormDialog
        open
        onOpenChange={vi.fn()}
        template={{
          _id: "tpl-1",
          name: { ar: "قالب الحالة", en: "Condition Template" },
          slug: "condition-template",
          parentType: "CONDITION",
          fields: [],
        }}
      />,
    );

    expect(
      screen.getByPlaceholderText("اسم واضح للقالب"),
    ).toHaveValue("قالب الحالة");
    expect(
      screen.getByPlaceholderText("Clear template name"),
    ).toHaveValue("Condition Template");
    expect(screen.queryByText("[object Object]")).not.toBeInTheDocument();
  });

  it("submits both locales when editing a bilingual template name", async () => {
    renderWithProviders(
      <ContentTemplateFormDialog
        open
        onOpenChange={vi.fn()}
        template={{
          _id: "tpl-1",
          name: { ar: "قالب الحالة", en: "Condition Template" },
          slug: "condition-template",
          parentType: "CONDITION",
          fields: [
            {
              key: "notes",
              label: "ملاحظات",
              type: "string",
              required: false,
            },
          ],
        }}
      />,
    );

    // Edit an unrelated field (slug) and save — both name locales must survive.
    const slugInput = screen.getByPlaceholderText("my-template");
    await userEvent.clear(slugInput);
    await userEvent.type(slugInput, "condition-template-v2");

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ التعديلات" }),
    );

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        id: "tpl-1",
        body: expect.objectContaining({
          name: { ar: "قالب الحالة", en: "Condition Template" },
          slug: "condition-template-v2",
        }),
      });
    });
  });

  it("requires at least one name locale", async () => {
    renderWithProviders(
      <ContentTemplateFormDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ القالب" }),
    );

    expect(await screen.findByText("اسم القالب مطلوب")).toBeInTheDocument();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it("renders in English when the active locale is English", async () => {
    renderWithProviders(
      <ContentTemplateFormDialog open onOpenChange={vi.fn()} />,
      { locale: "en" },
    );

    expect(
      screen.getByRole("heading", { name: "Add data template" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Template name (Arabic)")).toBeInTheDocument();
    expect(screen.getByText("Template name (English)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add field" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save template" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Add field" }));
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("attaches a server-reported 422 field error to its matching input", async () => {
    createMutateAsync.mockRejectedValueOnce(
      new ApiError(
        422,
        null,
        {
          errors: [
            { field: "slug", message: "هذا المعرّف مستخدم مسبقًا" },
          ],
        },
        "Validation failed",
      ),
    );

    renderWithProviders(
      <ContentTemplateFormDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.type(
      screen.getByPlaceholderText("اسم واضح للقالب"),
      "قالب متابعة",
    );
    await userEvent.type(
      screen.getByPlaceholderText("my-template"),
      "follow-up-template",
    );
    await userEvent.click(screen.getByRole("button", { name: "إضافة حقل" }));
    await userEvent.type(screen.getByPlaceholderText("fieldKey"), "followUp");
    await userEvent.type(
      screen.getByPlaceholderText("تسمية ظاهرة للحقل"),
      "ملاحظات المتابعة",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ القالب" }),
    );

    expect(
      await screen.findByText("هذا المعرّف مستخدم مسبقًا"),
    ).toBeInTheDocument();
  });

  it("replaces a raw technical 422 message with a clear Arabic fallback", async () => {
    createMutateAsync.mockRejectedValueOnce(
      new ApiError(
        422,
        null,
        {
          errors: [
            {
              field: "slug",
              message: "Invalid input: expected string, received undefined",
            },
          ],
        },
        "Validation failed",
      ),
    );

    renderWithProviders(
      <ContentTemplateFormDialog open onOpenChange={vi.fn()} />,
    );

    await userEvent.type(
      screen.getByPlaceholderText("اسم واضح للقالب"),
      "قالب متابعة",
    );
    await userEvent.click(screen.getByRole("button", { name: "إضافة حقل" }));
    await userEvent.type(screen.getByPlaceholderText("fieldKey"), "followUp");
    await userEvent.type(
      screen.getByPlaceholderText("تسمية ظاهرة للحقل"),
      "ملاحظات المتابعة",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "حفظ القالب" }),
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
});
