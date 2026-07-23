import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPdfBytes } from "../src/features/pdf/pdfLoader";

describe("remote PDF loading", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns only local PDF bytes and reports progress", async () => {
    const progress = vi.fn();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(new Uint8Array([37, 80, 68, 70]), {
      status: 200,
      headers: { "content-length": "4", "content-type": "application/pdf" }
    })));
    const bytes = await fetchPdfBytes(new URL("https://example.com/paper.pdf"), {
      signal: new AbortController().signal,
      onProgress: progress
    });
    expect([...bytes]).toEqual([37, 80, 68, 70]);
    expect(progress).toHaveBeenCalledWith(4, 4);
  });

  it("surfaces HTTP failures without sending content elsewhere", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 403 })));
    await expect(fetchPdfBytes(new URL("https://example.com/private.pdf"), {
      signal: new AbortController().signal
    })).rejects.toMatchObject({ code: "forbidden" });
  });

  it("supports request cancellation", async () => {
    vi.stubGlobal("fetch", vi.fn(async (_url: URL, init?: RequestInit) => {
      throw init?.signal instanceof AbortSignal && init.signal.aborted
        ? new DOMException("aborted", "AbortError")
        : new TypeError("network");
    }));
    const controller = new AbortController();
    controller.abort();
    await expect(fetchPdfBytes(new URL("https://example.com/paper.pdf"), {
      signal: controller.signal
    })).rejects.toMatchObject({ name: "AbortError" });
  });
});
