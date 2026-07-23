export type PdfErrorCode = "unauthorized" | "forbidden" | "not_found" | "rate_limited" | "timeout" | "network" | "password" | "invalid" | "too_large" | "unknown";

export class PdfReaderError extends Error {
  constructor(public readonly code: PdfErrorCode, message: string) {
    super(message);
  }
}

export function pdfHttpError(status: number): PdfReaderError {
  if (status === 401) return new PdfReaderError("unauthorized", "PDF authentication is required.");
  if (status === 403) return new PdfReaderError("forbidden", "PDF access was denied.");
  if (status === 404) return new PdfReaderError("not_found", "PDF was not found.");
  if (status === 429) return new PdfReaderError("rate_limited", "The PDF server is temporarily rate limited.");
  return new PdfReaderError("network", `PDF request failed (HTTP ${status}).`);
}

export function toPdfReaderError(error: unknown): PdfReaderError {
  if (error instanceof PdfReaderError) return error;
  if (error instanceof DOMException && error.name === "AbortError") return new PdfReaderError("timeout", "PDF loading timed out.");
  const name = error instanceof Error ? error.name : "";
  if (name === "PasswordException") return new PdfReaderError("password", "Password required.");
  if (name === "InvalidPDFException" || name === "FormatError") return new PdfReaderError("invalid", "Invalid or damaged PDF.");
  if (error instanceof TypeError) return new PdfReaderError("network", "Unable to load the PDF.");
  return new PdfReaderError("unknown", error instanceof Error ? error.message : "Unable to load the PDF.");
}
