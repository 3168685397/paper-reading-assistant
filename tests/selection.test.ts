import { describe, expect, it } from "vitest";
import { cleanSelection, isLikelyEnglishSelection, selectionButtonPosition, validateSelection } from "../src/lib/selection";
import { calculatePopoverPosition } from "../src/lib/selection/calculatePopoverPosition";

describe("selection", () => {
  it("cleans soft hyphens, line breaks, and repeated spaces", () => {
    expect(cleanSelection("  univer\u00adsal \n  reader  ")).toBe("universal reader");
  });
  it("enforces selection length", () => {
    expect(validateSelection("a").ok).toBe(false);
    expect(validateSelection("a".repeat(5000)).ok).toBe(true);
    expect(validateSelection("a".repeat(5001)).reason).toContain("5000");
  });
  it("keeps the trigger inside the viewport", () => {
    expect(selectionButtonPosition({ right: 990, bottom: 790 }, 1000, 800)).toEqual({ left: 960, top: 760 });
    expect(selectionButtonPosition({ right: -20, bottom: -20 }, 1000, 800)).toEqual({ left: 8, top: 8 });
  });
  it("prefers the right side of a selection", () => {
    const result = calculatePopoverPosition({ left: 100, right: 200, top: 200, bottom: 240, width: 100, height: 40 }, 1200, 800, 360, 300);
    expect(result).toMatchObject({ left: 210, placement: "right" });
  });
  it("uses the left side when the right side is unavailable", () => {
    const result = calculatePopoverPosition({ left: 600, right: 760, top: 200, bottom: 240, width: 160, height: 40 }, 800, 700, 360, 300);
    expect(result).toMatchObject({ left: 230, placement: "left" });
  });
  it("uses the bottom for wide multi-line selections", () => {
    const result = calculatePopoverPosition({ left: 120, right: 680, top: 100, bottom: 180, width: 560, height: 80 }, 800, 800, 360, 300);
    expect(result).toMatchObject({ top: 190, placement: "bottom" });
  });
  it("uses the top when the bottom is unavailable", () => {
    const result = calculatePopoverPosition({ left: 80, right: 720, top: 500, bottom: 580, width: 640, height: 80 }, 800, 600, 360, 300);
    expect(result.placement).toBe("top");
    expect(result.top).toBeGreaterThanOrEqual(12);
  });
  it("keeps viewport margins in a narrow window", () => {
    const result = calculatePopoverPosition({ left: 10, right: 290, top: 120, bottom: 160, width: 280, height: 40 }, 300, 500, 360, 200);
    expect(result.left).toBe(12);
    expect(result.top).toBeGreaterThanOrEqual(12);
  });
  it("recognizes English and mixed selections while rejecting Chinese and numbers", () => {
    expect(isLikelyEnglishSelection("Selected English text")).toBe(true);
    expect(isLikelyEnglishSelection("本文讨论 cognitive load 的影响")).toBe(true);
    expect(isLikelyEnglishSelection("这是纯中文内容")).toBe(false);
    expect(isLikelyEnglishSelection("12345 ...")).toBe(false);
  });
});
