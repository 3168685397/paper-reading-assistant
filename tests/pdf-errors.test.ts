import { describe, expect, it } from "vitest";
import { pdfHttpError, toPdfReaderError } from "../src/features/pdf/pdfErrors";

describe("PDF errors", () => {
  it("maps authentication and access failures", () => {
    expect(pdfHttpError(401).code).toBe("unauthorized");
    expect(pdfHttpError(403).code).toBe("forbidden");
    expect(pdfHttpError(404).code).toBe("not_found");
    expect(pdfHttpError(429).code).toBe("rate_limited");
  });

  it("maps timeout, password, and damaged PDF states", () => {
    expect(toPdfReaderError(new DOMException("aborted", "AbortError")).code).toBe("timeout");
    expect(toPdfReaderError(Object.assign(new Error(), { name: "PasswordException" })).code).toBe("password");
    expect(toPdfReaderError(Object.assign(new Error(), { name: "InvalidPDFException" })).code).toBe("invalid");
  });
});
