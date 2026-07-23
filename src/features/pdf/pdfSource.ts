export interface LocalPdfSource {
  kind: "local";
  name: string;
  url: string;
  revoke(): void;
}

export function parseRemotePdfUrl(value: string | null): URL | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}

export function isLikelyPdfUrl(value: string): boolean {
  const url = parseRemotePdfUrl(value);
  if (!url) return false;
  return /\.pdf$/i.test(url.pathname)
    || /(?:^|[?&])(format|type|download|file)=(?:pdf|[^&]*\.pdf)(?:&|$)/i.test(url.search);
}

export function isPdfFile(file: Pick<File, "name" | "type">): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

export function createLocalPdfSource(file: File): LocalPdfSource {
  if (!isPdfFile(file)) throw new Error("NOT_PDF");
  const url = URL.createObjectURL(file);
  let revoked = false;
  return {
    kind: "local",
    name: file.name,
    url,
    revoke() {
      if (revoked) return;
      revoked = true;
      URL.revokeObjectURL(url);
    }
  };
}
