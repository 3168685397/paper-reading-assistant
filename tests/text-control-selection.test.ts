// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { readTextControlSelection } from "../src/lib/selection";

describe("text control selections", () => {
  it("reads textarea and text input selections", () => {
    const textarea = document.createElement("textarea");
    textarea.value = "Read selected English text";
    textarea.setSelectionRange(5, 13);
    expect(readTextControlSelection(textarea)).toBe("selected");

    const input = document.createElement("input");
    input.type = "text";
    input.value = "Academic reading";
    input.setSelectionRange(0, 8);
    expect(readTextControlSelection(input)).toBe("Academic");
  });

  it("always ignores password controls", () => {
    const input = document.createElement("input");
    input.type = "password";
    input.value = "never expose this";
    input.setSelectionRange(0, input.value.length);
    expect(readTextControlSelection(input)).toBeUndefined();
  });
});
