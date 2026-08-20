import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import {
  getAppointmentBookingErrorMessage,
  getAppointmentStatusMutationErrorMessage,
  getAppointmentWriteErrorMessage,
} from "@/lib/doctor/writeFlowErrors";

function apiError(status: number) {
  return new ApiError(status, null, {}, `api_${status}`);
}

describe("appointment write flow error messages", () => {
  it("maps booking 403/404/422 errors to actionable messages", () => {
    expect(getAppointmentBookingErrorMessage(apiError(403), "en")).toContain(
      "not allowed to book",
    );
    expect(getAppointmentBookingErrorMessage(apiError(404), "en")).toContain(
      "doctor, patient, or appointment type",
    );
    expect(getAppointmentBookingErrorMessage(apiError(422), "en")).toContain(
      "date, time, or appointment type",
    );
  });

  it("maps cancel and reschedule 404/422 errors to action-specific messages", () => {
    expect(
      getAppointmentWriteErrorMessage(apiError(404), "reschedule", "en"),
    ).toContain("requested appointment");
    expect(
      getAppointmentWriteErrorMessage(apiError(422), "cancel", "en"),
    ).toContain("cancel the appointment");
    expect(
      getAppointmentWriteErrorMessage(apiError(422), "reschedule", "en"),
    ).toContain("reschedule the appointment");
  });

  it("currently falls back to the generic API message for cancel/reschedule 403", () => {
    expect(
      getAppointmentWriteErrorMessage(apiError(403), "cancel", "en"),
    ).toBe("api_403");
  });

  it("maps complete and no-show 403/404/422 errors to action-specific messages", () => {
    expect(
      getAppointmentStatusMutationErrorMessage(apiError(403), "complete", "en"),
    ).toContain("not allowed to complete");
    expect(
      getAppointmentStatusMutationErrorMessage(apiError(403), "no-show", "en"),
    ).toContain("mark this appointment as no-show");
    expect(
      getAppointmentStatusMutationErrorMessage(apiError(404), "complete", "en"),
    ).toContain("requested appointment");
    expect(
      getAppointmentStatusMutationErrorMessage(apiError(422), "complete", "en"),
    ).toContain("complete the appointment");
    expect(
      getAppointmentStatusMutationErrorMessage(apiError(422), "no-show", "en"),
    ).toContain("mark the appointment as no-show");
  });
});
