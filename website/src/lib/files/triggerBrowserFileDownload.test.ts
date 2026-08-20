import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  triggerBrowserFileDownload,
  triggerBrowserFileDownloadAndOpen,
} from "@/lib/files/triggerBrowserFileDownload";

describe("triggerBrowserFileDownload", () => {
  const appendChildSpy = vi.spyOn(document.body, "appendChild");
  const removeChildSpy = vi.spyOn(document.body, "removeChild");
  const realCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal(
      "URL",
      Object.assign(URL, {
        createObjectURL: vi.fn(() => "blob:test-url"),
        revokeObjectURL: vi.fn(),
      }),
    );
    vi.spyOn(window, "open").mockImplementation(() => null);
    vi.spyOn(window, "setTimeout").mockImplementation(((fn: TimerHandler) => {
      if (typeof fn === "function") fn();
      return 0;
    }) as typeof window.setTimeout);
    appendChildSpy.mockClear();
    removeChildSpy.mockClear();
  });

  it("downloads through a blob URL when CORS fetch succeeds", async () => {
    const clickSpy = vi.fn();
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const element = realCreateElement(tagName);
      if (tagName === "a") {
        Object.defineProperty(element, "click", {
          value: clickSpy,
          configurable: true,
        });
      }
      return element;
    });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob(["demo"])),
    } as unknown as Response);

    await triggerBrowserFileDownload("https://files.example.test/presigned", "report.pdf");

    expect(fetch).toHaveBeenCalledWith(
      "https://files.example.test/presigned",
      expect.objectContaining({
        method: "GET",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
      }),
    );
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("falls back to direct download when CORS fetch fails", async () => {
    const anchors: HTMLAnchorElement[] = [];
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const element = realCreateElement(tagName);
      if (tagName === "a") {
        anchors.push(element as HTMLAnchorElement);
        Object.defineProperty(element, "click", {
          value: vi.fn(),
          configurable: true,
        });
      }
      return element;
    });

    vi.mocked(fetch).mockRejectedValue(new Error("cors blocked"));

    await triggerBrowserFileDownload("https://files.example.test/presigned", "report.pdf");

    expect(anchors).toHaveLength(1);
    expect(anchors[0]?.href).toBe("https://files.example.test/presigned");
    expect(anchors[0]?.download).toBe("report.pdf");
  });

  it("opens a new tab and triggers download together when requested", async () => {
    const clickSpy = vi.fn();
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const element = realCreateElement(tagName);
      if (tagName === "a") {
        Object.defineProperty(element, "click", {
          value: clickSpy,
          configurable: true,
        });
      }
      return element;
    });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob(["demo"])),
    } as unknown as Response);

    await triggerBrowserFileDownloadAndOpen(
      "https://files.example.test/presigned",
      "report.pdf",
    );

    expect(window.open).toHaveBeenCalledWith(
      "blob:test-url",
      "_blank",
      "noopener,noreferrer",
    );
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
