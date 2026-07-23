// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { isReaderUiEvent, protectTriggerEvent } from "../src/lib/popover/events";

describe("popover event protection", () => {
  it.each(["pointerdown", "mousedown", "click"])("protects trigger %s from page handlers", (type) => {
    const event = new Event(type, { bubbles: true, cancelable: true, composed: true });
    protectTriggerEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(event.cancelBubble).toBe(true);
  });

  it("keeps the popover open when composedPath contains its Shadow host", () => {
    const host = document.createElement("div");
    const trigger = document.createElement("button");
    const popover = document.createElement("section");
    const event = new Event("pointerdown", { composed: true });
    Object.defineProperty(event, "composedPath", { value: () => [trigger, host, document, window] });
    expect(isReaderUiEvent(event, host, trigger, popover)).toBe(true);
  });
});
