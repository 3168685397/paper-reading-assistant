import { describe, expect, it } from "vitest";
import { grammarPrompt, translationPrompt } from "../src/lib/llm/prompts";
import { defaults, toContentSettings } from "../src/lib/storage";

const selection = {
  text: "Selected English text.",
  title: "Private paper title",
  url: "https://example.com/private",
  selectedAt: 1
};

describe("model and content-script privacy boundaries", () => {
  it("does not include page title or URL in model prompts by default", () => {
    expect(translationPrompt(selection, "简体中文")).not.toContain(selection.title);
    expect(translationPrompt(selection, "简体中文")).not.toContain(selection.url);
    expect(grammarPrompt(selection)).not.toContain(selection.url);
  });

  it("includes page context only after explicit opt-in", () => {
    expect(translationPrompt(selection, "简体中文", true)).toContain(selection.title);
    expect(grammarPrompt(selection, true)).toContain(selection.url);
  });

  it("never exposes API credentials to the content script", () => {
    const settings = toContentSettings({ ...defaults, apiKey: "secret-value" });
    expect(settings).toEqual({
      selectionBehavior: "button",
      excludedSites: []
    });
    expect("apiKey" in settings).toBe(false);
  });
});
