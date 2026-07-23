// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { createAccordion } from "../src/lib/popover/accordion";
import { element } from "../src/lib/popover/dom";
import { popoverCss } from "../src/lib/popover/styles";

const items = [
  { id: "grammar-1", indexLabel: "01", title: "动名词短语作主语", subtitle: "Gerund phrase as subject" },
  { id: "grammar-2", indexLabel: "02", title: "不定式作宾补", subtitle: "Infinitive as object complement" }
];

afterEach(() => document.body.replaceChildren());

describe("learning accordion", () => {
  it("语法知识点默认只展开第一项", () => {
    const mounted = createAccordion(document, items, () => element(document, "div", undefined, "内容"), 0);
    expect(mounted.getExpandedIndex()).toBe(0);
    expect(mounted.root.querySelectorAll('[aria-expanded="true"]')).toHaveLength(1);
  });
  it("点击第二项会关闭第一项", () => {
    const mounted = createAccordion(document, items, () => element(document, "div", undefined, "内容"), 0);
    const buttons = mounted.root.querySelectorAll<HTMLButtonElement>("button");
    buttons[1]!.click();
    expect(mounted.getExpandedIndex()).toBe(1);
    expect(buttons[0]!.getAttribute("aria-expanded")).toBe("false");
  });
  it("Enter 和 Space 可以展开知识点", () => {
    const mounted = createAccordion(document, items, () => element(document, "div", undefined, "内容"));
    const first = mounted.root.querySelector<HTMLButtonElement>("button")!;
    first.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(mounted.getExpandedIndex()).toBe(0);
    first.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(mounted.getExpandedIndex()).toBeUndefined();
  });
  it("学术词汇可以展开和收起", () => {
    const mounted = createAccordion(document, [{ id: "word-1", title: "impose", subtitle: "强加", meta: "v." }], () => element(document, "div", undefined, "语境"));
    const button = mounted.root.querySelector<HTMLButtonElement>("button")!;
    button.click();
    expect(button.getAttribute("aria-expanded")).toBe("true");
    button.click();
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });
  it("长文本样式禁止横向溢出", () => {
    expect(popoverCss).toContain("overflow-x:hidden");
    expect(popoverCss).toContain("overflow-wrap:anywhere");
  });
});
