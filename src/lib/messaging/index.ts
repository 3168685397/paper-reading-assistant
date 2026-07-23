export const EXTENSION_CONTEXT_INVALIDATED_MESSAGE =
  "扩展刚刚更新，请刷新当前网页后重试。\nThe extension was recently updated. Refresh this page and try again.";

export const MESSAGE_TIMEOUT = "扩展响应超时，请稍后重试。";

export function isExtensionContextInvalidated(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /extension context invalidated|receiving end does not exist|message port closed/i.test(message);
}

export function runtimeErrorMessage(error: unknown): string {
  if (isExtensionContextInvalidated(error)) return EXTENSION_CONTEXT_INVALIDATED_MESSAGE;
  return error instanceof Error && error.message ? error.message : "扩展通信失败，请刷新网页后重试。";
}

export function sendMessage<T>(message: unknown, timeoutMs = 35_000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(MESSAGE_TIMEOUT));
    }, timeoutMs);
    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      action();
    };
    try {
      const send = chrome.runtime.sendMessage as unknown as (
        request: unknown,
        callback: (response: T) => void
      ) => unknown;
      const pending = send(message, (response: T) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          finish(() => reject(new Error(lastError.message)));
          return;
        }
        finish(() => resolve(response));
      });
      if (pending && typeof (pending as Promise<T>).then === "function") {
        void (pending as Promise<T>).then(
          (response) => finish(() => resolve(response)),
          (error) => finish(() => reject(error))
        );
      }
    } catch (error) {
      finish(() => reject(error));
    }
  });
}
