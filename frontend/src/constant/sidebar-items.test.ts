import { describe, expect, it } from "vitest";
import {
  dataEntrySidebarItems,
  getSectionBackNavigation,
  secretarySidebarItems,
  sidebarItems,
} from "@/constant/sidebar-items";

describe("getSectionBackNavigation", () => {
  it("returns doctor section back navigation for nested pages", () => {
    expect(
      getSectionBackNavigation(
        "/doctor/appointments/details/42",
        "/doctor",
        sidebarItems,
      ),
    ).toEqual({
      href: "/doctor/appointments",
      label: "المواعيد",
    });
  });

  it("returns secretary section back navigation for nested pages", () => {
    expect(
      getSectionBackNavigation(
        "/secretary/patients/profile/15",
        "/secretary",
        secretarySidebarItems,
      ),
    ).toEqual({
      href: "/secretary/patients",
      label: "المرضى",
    });
  });

  it("returns data entry section back navigation for nested pages", () => {
    expect(
      getSectionBackNavigation(
        "/data-entry/content-templates/edit/8",
        "/data-entry",
        dataEntrySidebarItems,
      ),
    ).toEqual({
      href: "/data-entry/content-templates",
      label: "قوالب المحتوى",
    });
  });

  it("returns null for top-level pages", () => {
    expect(
      getSectionBackNavigation("/doctor/appointments", "/doctor", sidebarItems),
    ).toBeNull();
  });
});
