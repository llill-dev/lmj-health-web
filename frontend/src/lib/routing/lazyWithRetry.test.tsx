import { render, screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lazyWithRetry } from "@/lib/routing/lazyWithRetry";

describe("lazyWithRetry", () => {
  const reloadSpy = vi.fn();

  beforeEach(() => {
    window.sessionStorage.clear();
    reloadSpy.mockClear();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload: reloadSpy },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the component when the import succeeds", async () => {
    const Comp = lazyWithRetry(async () => ({
      default: () => <div>loaded</div>,
    }));

    render(
      <Suspense fallback="loading">
        <Comp />
      </Suspense>,
    );

    expect(await screen.findByText("loaded")).toBeInTheDocument();
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it("reloads the page once on a stale-chunk import failure instead of throwing", async () => {
    const Comp = lazyWithRetry(async () => {
      throw new Error("Failed to fetch dynamically imported module");
    });

    render(
      <Suspense fallback="loading">
        <Comp />
      </Suspense>,
    );

    await waitFor(() => expect(reloadSpy).toHaveBeenCalledTimes(1));
    expect(window.sessionStorage.getItem("lmj:chunk-reload-attempted")).toBe("1");
  });

  it("does not reload a second time if the failure persists after a reload", async () => {
    window.sessionStorage.setItem("lmj:chunk-reload-attempted", "1");

    const Comp = lazyWithRetry(async () => {
      throw new Error("Failed to fetch dynamically imported module");
    });

    const onError = vi.fn();
    class Boundary extends Error {}
    void Boundary;

    // React logs the thrown error to console.error via its default reporting; suppress
    // noise for this expected-failure assertion.
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    let caught: unknown;
    class ErrorBoundary extends (await import("react")).Component<
      { children: React.ReactNode },
      { hasError: boolean }
    > {
      state = { hasError: false };
      static getDerivedStateFromError(error: unknown) {
        caught = error;
        onError(error);
        return { hasError: true };
      }
      render() {
        return this.state.hasError ? "error" : this.props.children;
      }
    }

    render(
      <ErrorBoundary>
        <Suspense fallback="loading">
          <Comp />
        </Suspense>
      </ErrorBoundary>,
    );

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(reloadSpy).not.toHaveBeenCalled();
    expect(caught).toBeInstanceOf(Error);

    consoleSpy.mockRestore();
  });
});
