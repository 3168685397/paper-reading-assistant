// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  EXTENSION_CONTEXT_INVALIDATED_MESSAGE,
  isExtensionContextInvalidated,
  runtimeErrorMessage,
  sendMessage
} from "../src/lib/messaging";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runtime messaging", () => {
  it("maps an invalidated extension context to a bilingual refresh message", () => {
    const error = new Error("Extension context invalidated.");
    expect(isExtensionContextInvalidated(error)).toBe(true);
    expect(runtimeErrorMessage(error)).toBe(EXTENSION_CONTEXT_INVALIDATED_MESSAGE);
  });

  it("captures synchronous sendMessage errors", async () => {
    vi.stubGlobal("chrome", {
      runtime: {
        sendMessage: () => { throw new Error("Extension context invalidated."); },
        lastError: undefined
      }
    });
    await expect(sendMessage({ type: "TEST" })).rejects.toThrow("Extension context invalidated");
  });

  it("captures Promise rejection and runtime.lastError", async () => {
    vi.stubGlobal("chrome", {
      runtime: {
        sendMessage: () => Promise.reject(new Error("message port closed")),
        lastError: undefined
      }
    });
    await expect(sendMessage({ type: "TEST" })).rejects.toThrow("message port closed");

    vi.stubGlobal("chrome", {
      runtime: {
        sendMessage: (_message: unknown, callback: (reply: unknown) => void) => callback(undefined),
        lastError: { message: "Could not establish connection. Receiving end does not exist." }
      }
    });
    await expect(sendMessage({ type: "TEST" })).rejects.toThrow("Receiving end does not exist");
  });

  it("rejects requests that receive no background response", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("chrome", {
      runtime: {
        sendMessage: () => undefined,
        lastError: undefined
      }
    });
    const pending = sendMessage({ type: "TEST" }, 1000);
    const rejection = expect(pending).rejects.toThrow("扩展响应超时");
    await vi.advanceTimersByTimeAsync(1000);
    await rejection;
    vi.useRealTimers();
  });
});
