// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ROOT_ID } from "../src/lib/popover/dom";
import { startSelectionTranslationUi } from "../src/lib/popover/controller";

type Callback = (reply: unknown) => void;

let translateCallback: Callback | undefined;
let translatePayload: { type: string; payload?: { text?: string } } | undefined;
let translateFailure: Error | undefined;
let translateReply: unknown;

beforeEach(() => {
  document.body.innerHTML = "<main><p id=\"article\">Cambridge Core selected abstract text.</p></main>";
  document.getElementById(ROOT_ID)?.remove();
  translateCallback = undefined;
  translatePayload = undefined;
  translateFailure = undefined;
  translateReply = undefined;
  vi.stubGlobal("chrome", {
    runtime: {
      lastError: undefined,
      sendMessage: (message: { type: string }, callback: Callback) => {
        if (message.type === "GET_CONTENT_SETTINGS") {
          callback({ ok: true, result: { selectionBehavior: "button", excludedSites: [] } });
        } else if (message.type === "CANCEL_REQUEST" || message.type === "OPEN_OPTIONS") {
          callback({ ok: true });
        } else if (message.type === "TRANSLATE") {
          translatePayload = message;
          if (translateFailure) throw translateFailure;
          if (translateReply) callback(translateReply);
          else translateCallback = callback;
        }
      },
      onMessage: { addListener: vi.fn() }
    }
  });
});

afterEach(() => {
  document.getElementById(ROOT_ID)?.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function selectText(text: string): void {
  const paragraph = document.getElementById("article")!;
  paragraph.textContent = text;
  const range = document.createRange();
  range.selectNodeContents(paragraph);
  Object.defineProperty(range, "getBoundingClientRect", {
    value: () => ({ left: 20, top: 20, right: 240, bottom: 50, width: 220, height: 30 })
  });
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  document.dispatchEvent(new Event("selectionchange"));
}

async function mountedTrigger(): Promise<HTMLButtonElement> {
  await startSelectionTranslationUi();
  selectText("Cambridge Core selected abstract text.");
  await new Promise((resolve) => requestAnimationFrame(resolve));
  return document.getElementById(ROOT_ID)!.shadowRoot!.querySelector(".sr-trigger") as HTMLButtonElement;
}

describe("selection trigger integration", () => {
  it("uses cached text after the website collapses Selection and mounts loading immediately", async () => {
    const trigger = await mountedTrigger();
    window.getSelection()!.removeAllRanges();
    document.dispatchEvent(new Event("selectionchange"));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    trigger.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true, composed: true }));
    trigger.click();
    const shadow = document.getElementById(ROOT_ID)!.shadowRoot!;
    expect(translatePayload?.payload?.text).toBe("Cambridge Core selected abstract text.");
    expect(shadow.querySelector<HTMLElement>(".sr-popover")!.hidden).toBe(false);
    expect(shadow.querySelector(".sr-status")?.textContent).toContain("翻译");
  });

  it("is not closed by Cambridge Core-style document click listeners", async () => {
    const trigger = await mountedTrigger();
    document.addEventListener("click", (event) => event.stopPropagation(), { once: true });
    trigger.click();
    expect(document.getElementById(ROOT_ID)!.shadowRoot!.querySelector<HTMLElement>(".sr-popover")!.hidden).toBe(false);
  });

  it("shows context invalidation instead of failing silently", async () => {
    translateFailure = new Error("Extension context invalidated.");
    const trigger = await mountedTrigger();
    trigger.click();
    await Promise.resolve();
    expect(document.getElementById(ROOT_ID)!.shadowRoot!.textContent).toContain("扩展刚刚更新");
  });

  it("shows API configuration errors with an Open Settings action", async () => {
    translateReply = { ok: false, error: "请先在设置中完成模型配置。" };
    const trigger = await mountedTrigger();
    trigger.click();
    await Promise.resolve();
    const shadow = document.getElementById(ROOT_ID)!.shadowRoot!;
    expect(shadow.textContent).toContain("请先在设置中完成模型配置");
    expect(shadow.textContent).toContain("打开设置");
  });

  it("shows the current character count for overlong selections without sending them", async () => {
    await startSelectionTranslationUi();
    selectText(`Cambridge ${"a".repeat(5001)}`);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const shadow = document.getElementById(ROOT_ID)!.shadowRoot!;
    shadow.querySelector<HTMLButtonElement>(".sr-trigger")!.click();
    expect(shadow.textContent).toContain("选中的内容过长");
    expect(shadow.textContent).toContain("5011");
    expect(translatePayload).toBeUndefined();
  });
});
