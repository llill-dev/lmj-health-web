import { describe, expect, it } from "vitest";
import { formatPatientLabel } from "@/components/admin/appointments/appointmentListUtils";

describe("formatPatientLabel", () => {
  it("shows patient full name and public id when both exist", () => {
    expect(
      formatPatientLabel({
        publicId: "P-1024",
        userId: { fullName: "سارة أحمد" },
      } as never),
    ).toBe("سارة أحمد (P-1024)");
  });

  it("falls back to the patient name when public id is missing", () => {
    expect(
      formatPatientLabel({
        userId: { fullName: "سارة أحمد" },
      } as never),
    ).toBe("سارة أحمد");
  });

  it("falls back to a dash when no patient identity is available", () => {
    expect(formatPatientLabel(undefined)).toBe("—");
  });
});
