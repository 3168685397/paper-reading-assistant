import { describe, expect, it } from "vitest";
import { cleanSelection, selectionButtonPosition, validateSelection } from "../src/lib/selection";
import { calculatePopoverPosition } from "../src/lib/selection/calculatePopoverPosition";

describe("selection", () => {
  it("清理软连字符、换行和多余空格", () => {
    expect(cleanSelection("  sci\u00adence \n  reader  ")).toBe("science reader");
  });
  it("限制文本长度", () => {
    expect(validateSelection("a").ok).toBe(false);
    expect(validateSelection("a".repeat(5000)).ok).toBe(true);
    expect(validateSelection("a".repeat(5001)).reason).toContain("5000");
  });
  it("将按钮限制在视口内", () => {
    expect(selectionButtonPosition({ right: 990, bottom: 790 }, 1000, 800)).toEqual({ left: 960, top: 760 });
    expect(selectionButtonPosition({ right: -20, bottom: -20 }, 1000, 800)).toEqual({ left: 8, top: 8 });
  });
  it("优先将卡片放在选区右侧", () => {
    const result = calculatePopoverPosition({ left: 100, right: 200, top: 200, bottom: 240, width: 100, height: 40 }, 1200, 800, 360, 300);
    expect(result).toMatchObject({ left: 210, placement: "right" });
  });
  it("右侧不足时放在左侧", () => {
    const result = calculatePopoverPosition({ left: 600, right: 760, top: 200, bottom: 240, width: 160, height: 40 }, 800, 700, 360, 300);
    expect(result).toMatchObject({ left: 230, placement: "left" });
  });
  it("左右不足时放在多行选区下方", () => {
    const result = calculatePopoverPosition({ left: 120, right: 680, top: 100, bottom: 180, width: 560, height: 80 }, 800, 800, 360, 300);
    expect(result).toMatchObject({ top: 190, placement: "bottom" });
  });
  it("底部不足时放在上方", () => {
    const result = calculatePopoverPosition({ left: 80, right: 720, top: 500, bottom: 580, width: 640, height: 80 }, 800, 600, 360, 300);
    expect(result.placement).toBe("top");
    expect(result.top).toBeGreaterThanOrEqual(12);
  });
  it("窄窗口内始终保留边缘距离", () => {
    const result = calculatePopoverPosition({ left: 10, right: 290, top: 120, bottom: 160, width: 280, height: 40 }, 300, 500, 360, 200);
    expect(result.left).toBe(12);
    expect(result.top).toBeGreaterThanOrEqual(12);
  });
});
