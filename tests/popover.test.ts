// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { isCloseKey, nextViewForSelection, shouldKeepPopover } from "../src/lib/popover/behavior";
import { hasReaderRoot, mountScienceReaderRoot, ROOT_ID } from "../src/lib/popover/dom";
import { replaceAbortController } from "../src/lib/llm/requestControl";

describe("popover interaction", () => {
  it("mounts an isolated Shadow DOM root", () => {
    const mounted = mountScienceReaderRoot(document, ":host{color:#171717}");
    expect(mounted.host.id).toBe(ROOT_ID);
    expect(mounted.host.shadowRoot).toBe(mounted.shadow);
    expect(mounted.shadow.querySelector(".sr-trigger")?.textContent).toBe("译");
    mounted.host.remove();
  });
  it("detects an existing root so reinjection does not duplicate UI or requests", () => {
    const mounted = mountScienceReaderRoot(document, "");
    expect(hasReaderRoot(document)).toBe(true);
    expect(document.querySelectorAll(`#${ROOT_ID}`)).toHaveLength(1);
    mounted.host.remove();
  });
  it("keeps internal clicks and closes on outside clicks", () => {
    expect(shouldKeepPopover(true)).toBe(true);
    expect(shouldKeepPopover(false)).toBe(false);
  });
  it("uses Escape as the close shortcut", () => {
    expect(isCloseKey("Escape")).toBe(true);
    expect(isCloseKey("Enter")).toBe(false);
  });
  it("replaces the old view after a new selection", () => {
    expect(nextViewForSelection(true)).toBe("trigger");
    expect(nextViewForSelection(false)).toBe("hidden");
  });
  it("cancels the previous request", () => {
    const old = new AbortController();
    const current = replaceAbortController(old);
    expect(old.signal.aborted).toBe(true);
    expect(current.signal.aborted).toBe(false);
  });
});
