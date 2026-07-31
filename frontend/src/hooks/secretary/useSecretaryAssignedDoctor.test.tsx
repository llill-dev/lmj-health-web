import React, { type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiRequestResultMock, apiErrorClass } = vi.hoisted(() => {
  class MockApiError extends Error {
    status: number;

    constructor(status: number) {
      super(`api_${status}`);
      this.status = status;
    }
  }

  return {
    apiRequestResultMock: vi.fn(),
    apiErrorClass: MockApiError,
  };
});

vi.mock("@/lib/api", () => ({
  apiRequestResult: (...args: unknown[]) => apiRequestResultMock(...args),
  ApiError: apiErrorClass,
}));

import { useSecretaryAssignedDoctor } from "@/hooks/secretary/useSecretaryAssignedDoctor";

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useSecretaryAssignedDoctor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the assigned doctor when the endpoint succeeds", async () => {
    apiRequestResultMock.mockResolvedValue({
      ok: true,
      data: {
        doctor: {
          _id: "doctor-1",
          userId: { fullName: "Dr. Demo" },
        },
      },
    });

    const { result } = renderHook(() => useSecretaryAssignedDoctor(), {
      wrapper: createWrapper(new QueryClient()),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.assignedDoctor?._id).toBe("doctor-1");
    expect(result.current.isForbidden).toBe(false);
    expect(result.current.isUnassigned).toBe(false);
  });

  it("maps 403 to a forbidden assignment state", async () => {
    apiRequestResultMock.mockResolvedValue({
      ok: false,
      error: new apiErrorClass(403),
    });

    const { result } = renderHook(() => useSecretaryAssignedDoctor(), {
      wrapper: createWrapper(new QueryClient()),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isForbidden).toBe(true);
    expect(result.current.isUnassigned).toBe(false);
    expect(result.current.assignedDoctor).toBeNull();
  });

  it("maps 404 to an unassigned-doctor state", async () => {
    apiRequestResultMock.mockResolvedValue({
      ok: false,
      error: new apiErrorClass(404),
    });

    const { result } = renderHook(() => useSecretaryAssignedDoctor(), {
      wrapper: createWrapper(new QueryClient()),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isForbidden).toBe(false);
    expect(result.current.isUnassigned).toBe(true);
    expect(result.current.assignedDoctor).toBeNull();
  });
});
