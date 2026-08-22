import React, { type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";

const { doctorAppointmentsApiMock } = vi.hoisted(() => ({
  doctorAppointmentsApiMock: {
    list: vi.fn(),
    getById: vi.fn(),
    book: vi.fn(),
    cancel: vi.fn(),
    reschedule: vi.fn(),
    complete: vi.fn(),
    markNoShow: vi.fn(),
    listFiles: vi.fn(),
    uploadFile: vi.fn(),
    unlinkFile: vi.fn(),
  },
}));

vi.mock("@/lib/doctor/client", () => ({
  doctorAppointmentsApi: doctorAppointmentsApiMock,
  doctorAppointmentsQueryKeys: {
    all: ["doctor", "appointments"],
    lists: () => ["doctor", "appointments", "list"],
    list: (params: unknown) => ["doctor", "appointments", "list", params],
    details: () => ["doctor", "appointments", "detail"],
    detail: (appointmentId: string) => [
      "doctor",
      "appointments",
      "detail",
      appointmentId,
    ],
    files: (appointmentId: string) => [
      "doctor",
      "appointments",
      "files",
      appointmentId,
    ],
  },
}));

import {
  useBookDoctorAppointmentApi,
  useCancelDoctorAppointmentApi,
  useCompleteDoctorAppointmentApi,
  useNoShowDoctorAppointmentApi,
  useRescheduleDoctorAppointmentApi,
} from "@/hooks/doctor/appointments/useDoctorAppointmentsApi";

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useDoctorAppointmentsApi mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates the appointments list after booking succeeds", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    doctorAppointmentsApiMock.book.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useBookDoctorAppointmentApi(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      doctorId: "doctor-1",
      patientId: "patient-1",
      date: "2026-08-03",
      startTime: "10:30",
      notes: "note",
    });

    await waitFor(() => {
      expect(doctorAppointmentsApiMock.book).toHaveBeenCalledTimes(1);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["doctor", "appointments"],
    });
  });

  it.each([
    ["cancel", useCancelDoctorAppointmentApi, doctorAppointmentsApiMock.cancel],
    [
      "reschedule",
      useRescheduleDoctorAppointmentApi,
      doctorAppointmentsApiMock.reschedule,
    ],
    [
      "complete",
      useCompleteDoctorAppointmentApi,
      doctorAppointmentsApiMock.complete,
    ],
    [
      "no-show",
      useNoShowDoctorAppointmentApi,
      doctorAppointmentsApiMock.markNoShow,
    ],
  ])(
    "invalidates list and detail queries after %s succeeds",
    async (_label, useMutationHook, mutationMock) => {
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      mutationMock.mockResolvedValue({ message: "ok" });

      const appointmentId = "appointment-123";
      const { result } = renderHook(() => useMutationHook(appointmentId), {
        wrapper: createWrapper(queryClient),
      });

      const bodyByAction = {
        cancel: { reason: "Patient requested" },
        reschedule: {
          date: "2026-08-04",
          startTime: "11:00",
          appointmentTypeId: "type-1",
          reason: "Need another slot",
        },
        complete: { notes: "Completed successfully" },
        "no-show": { reason: "Patient absent" },
      } as const;

      result.current.mutate({
        id: appointmentId,
        body: bodyByAction[_label as keyof typeof bodyByAction],
      });

      await waitFor(() => {
        expect(mutationMock).toHaveBeenCalledTimes(1);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["doctor", "appointments"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["doctor", "appointments", "detail", appointmentId],
      });
    },
  );
});
