// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  calculateDragPosition,
  clampDragPosition,
  DraggablePopover,
  isDragHandleTarget
} from "../src/lib/drag/draggablePopover";

const originalWidth = window.innerWidth;
const originalHeight = window.innerHeight;

function fixture() {
  const card = document.createElement("section");
  const header = document.createElement("header");
  const title = document.createElement("span");
  title.textContent = "翻译";
  const copy = document.createElement("button");
  copy.textContent = "复制";
  const close = document.createElement("button");
  close.textContent = "关闭";
  header.append(title, copy, close);
  card.append(header);
  document.body.append(card);
  Object.defineProperty(card, "getBoundingClientRect", {
    configurable: true,
    value: () => new DOMRect(100, 100, 360, 300)
  });
  Object.defineProperties(header, {
    setPointerCapture: { configurable: true, value: vi.fn() },
    hasPointerCapture: { configurable: true, value: vi.fn(() => false) },
    releasePointerCapture: { configurable: true, value: vi.fn() }
  });
  const draggable = new DraggablePopover(card);
  draggable.setHandle(header);
  return { card, header, title, copy, close, draggable };
}

function pointer(type: string, init: PointerEventInit) {
  return new PointerEvent(type, { bubbles: true, button: 0, pointerId: 7, ...init });
}

afterEach(() => {
  document.body.replaceChildren();
  Object.defineProperty(window, "innerWidth", { configurable: true, value: originalWidth });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: originalHeight });
  vi.restoreAllMocks();
});

describe("draggable popover", () => {
  it("pointerdown 后进入拖动状态并捕获指针", () => {
    const { title, header, draggable } = fixture();
    title.dispatchEvent(pointer("pointerdown", { clientX: 120, clientY: 120 }));
    expect(draggable.snapshot.isDragging).toBe(true);
    expect(draggable.snapshot.hasManualPosition).toBe(true);
    expect(header.setPointerCapture).toHaveBeenCalledWith(7);
    draggable.destroy();
  });

  it("pointermove 根据起点和指针位移计算位置", () => {
    expect(calculateDragPosition(
      { left: 100, top: 100 },
      { left: 200, top: 150 },
      { left: 140, top: 125 },
      { viewportWidth: 1000, viewportHeight: 800, cardWidth: 360, cardHeight: 300 }
    )).toEqual({ left: 240, top: 175 });
  });

  it.each([
    ["左侧", { left: -500, top: 20 }, { left: 8, top: 20 }],
    ["右侧", { left: 900, top: 20 }, { left: 632, top: 20 }],
    ["顶部", { left: 20, top: -400 }, { left: 20, top: 8 }],
    ["底部", { left: 20, top: 900 }, { left: 20, top: 492 }]
  ])("不能拖出%s", (_label, position, expected) => {
    expect(clampDragPosition(position, {
      viewportWidth: 1000, viewportHeight: 800, cardWidth: 360, cardHeight: 300
    })).toEqual(expected);
  });

  it("复制和关闭按钮不会开始拖动", () => {
    const { header, copy, close, draggable } = fixture();
    expect(isDragHandleTarget(copy, header)).toBe(false);
    expect(isDragHandleTarget(close, header)).toBe(false);
    copy.dispatchEvent(pointer("pointerdown", { clientX: 120, clientY: 120 }));
    close.dispatchEvent(pointer("pointerdown", { clientX: 120, clientY: 120 }));
    expect(draggable.snapshot.isDragging).toBe(false);
    draggable.destroy();
  });

  it("pointercancel 正确结束拖动", () => {
    const { title, header, draggable } = fixture();
    title.dispatchEvent(pointer("pointerdown", { clientX: 120, clientY: 120 }));
    header.dispatchEvent(pointer("pointercancel", { clientX: 130, clientY: 130 }));
    expect(draggable.snapshot.isDragging).toBe(false);
    expect(draggable.snapshot.hasManualPosition).toBe(true);
    draggable.destroy();
  });

  it("resize 后将卡片移回视口", () => {
    const { card, draggable } = fixture();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 320 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 240 });
    window.dispatchEvent(new Event("resize"));
    expect(card.style.left).toBe("8px");
    expect(card.style.top).toBe("8px");
    draggable.destroy();
  });

  it("新文本选区会清除旧手动位置", () => {
    const { title, draggable } = fixture();
    title.dispatchEvent(pointer("pointerdown", { clientX: 120, clientY: 120 }));
    expect(draggable.snapshot.hasManualPosition).toBe(true);
    draggable.resetManualPosition();
    expect(draggable.snapshot).toMatchObject({ isDragging: false, hasManualPosition: false });
    draggable.destroy();
  });

  it("销毁后移除标题栏与 resize 监听器", () => {
    const { title, card, draggable } = fixture();
    const initialLeft = card.style.left;
    draggable.destroy();
    title.dispatchEvent(pointer("pointerdown", { clientX: 120, clientY: 120 }));
    window.dispatchEvent(new Event("resize"));
    expect(draggable.snapshot.isDragging).toBe(false);
    expect(card.style.left).toBe(initialLeft);
  });
});
