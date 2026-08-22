import { describe, expect, it } from "vitest";

import { countPatientAppointments } from "@/lib/doctor/dashboard/countPatientAppointments";

describe("countPatientAppointments", () => {
  it("counts total and status breakdown", () => {
    const counts = countPatientAppointments([
      { status: "scheduled" },
      { status: "rescheduled" },
      { status: "completed" },
      { status: "cancelled" },
      { status: "no-show" },
      { status: "no_show" },
    ]);

    expect(counts).toEqual({
      total: 6,
      upcoming: 2,
      completed: 1,
      cancelled: 1,
      noShow: 2,
    });
  });
});
