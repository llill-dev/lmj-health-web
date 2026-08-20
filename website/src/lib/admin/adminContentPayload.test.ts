import { describe, expect, it, vi } from "vitest";

const postMock = vi.fn().mockResolvedValue({ contentItem: {} });
const patchMock = vi.fn().mockResolvedValue({ contentItem: {} });

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    post: postMock,
    patch: patchMock,
  };
});

// Imported after the mock so `adminApi` picks up the mocked post/patch.
const { adminApi } = await import("@/lib/admin/client");

describe("adminApi.content.create / update — news payload shaping", () => {
  it("sends an empty `news` object on create for non-NEWS types (backend rejects null with 422 and omitting the key with 500)", async () => {
    postMock.mockClear();
    postMock.mockResolvedValue({ contentItem: {} });

    await adminApi.content.create({
      type: "GENERAL_ADVICE",
      title: "عنوان",
      language: "ar",
      contentBlocks: [{ type: "paragraph", text: "نص" }],
    } as Parameters<typeof adminApi.content.create>[0]);

    const [, body] = postMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(body.news).toEqual({});
  });

  it("sends a real `news` object on create when type is NEWS", async () => {
    postMock.mockClear();
    postMock.mockResolvedValue({ contentItem: {} });

    await adminApi.content.create({
      type: "NEWS",
      title: "خبر",
      language: "ar",
      sourceName: "WHO",
      sourceUrl: "https://who.int/news/1",
      originalTitle: "خبر أصلي",
    } as Parameters<typeof adminApi.content.create>[0]);

    const [, body] = postMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(body.news).toMatchObject({ sourceName: "WHO" });
  });

  it("sends an empty `news` object on update for non-NEWS types, to clear a previously-saved news object", async () => {
    patchMock.mockClear();
    patchMock.mockResolvedValue({ contentItem: {} });

    await adminApi.content.update("64f0c0000000000000000001", {
      type: "GENERAL_ADVICE",
    } as Parameters<typeof adminApi.content.update>[1]);

    const [, body] = patchMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(body.news).toEqual({});
  });
});
