import { describe, expect, it } from "vitest";
import { addExcludedSite, isSiteExcluded, normalizeHostname } from "../src/lib/sites";

describe("site exclusions", () => {
  it("stores only normalized hostnames", () => {
    expect(normalizeHostname("https://Mail.Example.com/inbox?q=private")).toBe("mail.example.com");
    expect(addExcludedSite([], "https://Mail.Example.com/private")).toEqual(["mail.example.com"]);
  });

  it("matches the hostname and its subdomains without matching lookalikes", () => {
    expect(isSiteExcluded("docs.example.com", ["example.com"])).toBe(true);
    expect(isSiteExcluded("notexample.com", ["example.com"])).toBe(false);
  });
});
