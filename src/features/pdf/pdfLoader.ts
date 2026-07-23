import { PdfReaderError, pdfHttpError } from "./pdfErrors";

export const MAX_PDF_BYTES = 150 * 1024 * 1024;

export async function fetchPdfBytes(
  url: URL,
  options: { signal: AbortSignal; onProgress?: (loaded: number, total?: number) => void }
): Promise<Uint8Array> {
  const response = await fetch(url, { credentials: "include", signal: options.signal });
  if (!response.ok) throw pdfHttpError(response.status);
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > MAX_PDF_BYTES) throw new PdfReaderError("too_large", "PDF exceeds the 150 MB limit.");
  if (!response.body) return new Uint8Array(await response.arrayBuffer());
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    loaded += value.byteLength;
    if (loaded > MAX_PDF_BYTES) {
      await reader.cancel();
      throw new PdfReaderError("too_large", "PDF exceeds the 150 MB limit.");
    }
    chunks.push(value);
    options.onProgress?.(loaded, declared || undefined);
  }
  const result = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}
