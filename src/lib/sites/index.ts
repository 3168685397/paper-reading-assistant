export function normalizeHostname(value: string): string | undefined {
  const trimmed = value.trim().toLowerCase().replace(/\.$/, "");
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    if (!["http:", "https:"].includes(url.protocol)) return undefined;
    return url.hostname.replace(/\.$/, "") || undefined;
  } catch {
    return undefined;
  }
}

export function isSiteExcluded(hostname: string, excludedSites: string[]): boolean {
  const current = normalizeHostname(hostname);
  if (!current) return true;
  return excludedSites.some((entry) => {
    const excluded = normalizeHostname(entry);
    return excluded !== undefined && (current === excluded || current.endsWith(`.${excluded}`));
  });
}

export function addExcludedSite(existing: string[], value: string): string[] {
  const hostname = normalizeHostname(value);
  if (!hostname) return existing;
  return Array.from(new Set([...existing.map(normalizeHostname).filter((item): item is string => Boolean(item)), hostname])).sort();
}
