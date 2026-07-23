// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createLocalPdfSource, isLikelyPdfUrl, isPdfFile, parseRemotePdfUrl } from "../src/features/pdf/pdfSource";

describe("PDF sources", () => {
  afterEach(() => vi.restoreAllMocks());

  it("accepts safe remote PDF URLs and rejects protected schemes", () => {
    expect(parseRemotePdfUrl("https://example.com/paper.pdf")?.protocol).toBe("https:");
    expect(parseRemotePdfUrl("file:///private/paper.pdf")).toBeUndefined();
    expect(parseRemotePdfUrl("javascript:alert(1)")).toBeUndefined();
  });

  it("recognizes PDF paths and PDF query parameters", () => {
    expect(isLikelyPdfUrl("https://example.com/paper.pdf?download=1")).toBe(true);
    expect(isLikelyPdfUrl("https://example.com/download?format=pdf")).toBe(true);
    expect(isLikelyPdfUrl("https://example.com/article")).toBe(false);
  });

  it("accepts PDF files and rejects unrelated files", () => {
    expect(isPdfFile({ name: "paper.pdf", type: "" })).toBe(true);
    expect(isPdfFile({ name: "paper.bin", type: "application/pdf" })).toBe(true);
    expect(isPdfFile({ name: "notes.txt", type: "text/plain" })).toBe(false);
  });

  it("revokes a local object URL exactly once", () => {
    const create = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:paper");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const source = createLocalPdfSource(new File(["pdf"], "paper.pdf", { type: "application/pdf" }));
    source.revoke();
    source.revoke();
    expect(create).toHaveBeenCalledOnce();
    expect(revoke).toHaveBeenCalledOnce();
  });
});
