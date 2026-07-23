// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { isCloseKey, nextViewForSelection, shouldKeepPopover } from "../src/lib/popover/behavior";
import { mountScienceReaderRoot } from "../src/lib/popover/dom";
import { replaceAbortController } from "../src/lib/llm/requestControl";

describe("popover interaction", () => {
  it("挂载隔离的 Shadow DOM 根节点", () => {
    const mounted = mountScienceReaderRoot(document, ":host{color:#171717}");
    expect(mounted.host.id).toBe("science-reader-root");
    expect(mounted.host.shadowRoot).toBe(mounted.shadow);
    expect(mounted.shadow.querySelector(".sr-trigger")?.textContent).toBe("译");
    mounted.host.remove();
  });
  it("卡片内部点击保持，外部点击关闭", () => {
    expect(shouldKeepPopover(true)).toBe(true);
    expect(shouldKeepPopover(false)).toBe(false);
  });
  it("Escape 是关闭快捷键", () => {
    expect(isCloseKey("Escape")).toBe(true);
    expect(isCloseKey("Enter")).toBe(false);
  });
  it("新有效选区覆盖旧视图", () => {
    expect(nextViewForSelection(true)).toBe("trigger");
    expect(nextViewForSelection(false)).toBe("hidden");
  });
  it("新请求取消旧请求", () => {
    const old = new AbortController();
    const current = replaceAbortController(old);
    expect(old.signal.aborted).toBe(true);
    expect(current.signal.aborted).toBe(false);
  });
});
