import { describe, expect, it } from "vitest";
import { getPdfMessages, preferredPdfLocale } from "../src/locales/pdf";

describe("PDF reader locales", () => {
  it("provides matching English and Chinese UI keys", () => {
    expect(Object.keys(getPdfMessages("en")).sort()).toEqual(Object.keys(getPdfMessages("zh-CN")).sort());
  });
  it("selects the locale without affecting document data", () => {
    expect(preferredPdfLocale("zh-CN")).toBe("zh-CN");
    expect(preferredPdfLocale("en-US")).toBe("en");
  });
});
