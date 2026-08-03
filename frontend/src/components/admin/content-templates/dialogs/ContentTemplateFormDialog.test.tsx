import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { HTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContentTemplateFormDialog from "@/components/admin/content-templates/dialogs/ContentTemplateFormDialog";
import { renderWithProviders } from "@/test/renderWithProviders";

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
        name: "قالب متابعة",
        slug: "follow-up-template",
        parentType: "CONDITION",
        fields: [
          {
            key: "followUp",
            label: "ملاحظات المتابعة",
            type: "text",
            required: false,
          },
        ],
      });
    });
  });
});
