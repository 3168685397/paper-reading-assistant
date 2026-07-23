export const MAX_SELECTION_LENGTH = 5000;

export function cleanSelection(text: string): string {
  return text.replace(/\u00ad/g, "").replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, " ").trim();
}

export function validateSelection(text: string): { ok: boolean; text: string; reason?: string } {
  const cleaned = cleanSelection(text);
  if (cleaned.length < 2) return { ok: false, text: cleaned, reason: "请至少选择 2 个字符。" };
  if (cleaned.length > MAX_SELECTION_LENGTH) return { ok: false, text: cleaned, reason: "所选内容超过 5000 个字符，请缩短选区。" };
  return { ok: true, text: cleaned };
}

export function isLikelyEnglishSelection(text: string): boolean {
  const cleaned = cleanSelection(text);
  const letters = cleaned.match(/[A-Za-z]/g)?.length ?? 0;
  const visible = cleaned.match(/[^\s]/g)?.length ?? 0;
  const hasWord = /[A-Za-z]{2,}/.test(cleaned);
  return visible >= 2 && letters >= 2 && hasWord && letters / visible >= 0.25;
}

export function readTextControlSelection(target: EventTarget | null): string | undefined {
  if (!(target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement)) return undefined;
  if (target instanceof HTMLInputElement && !["text", "search", "email", "url", "tel"].includes(target.type)) return undefined;
  const start = target.selectionStart;
  const end = target.selectionEnd;
  if (start === null || end === null || start === end) return undefined;
  return target.value.slice(start, end);
}

export interface RectLike { right: number; bottom: number }
export function selectionButtonPosition(rect: RectLike, viewportWidth: number, viewportHeight: number) {
  return {
    left: Math.max(8, Math.min(rect.right + 8, viewportWidth - 40)),
    top: Math.max(8, Math.min(rect.bottom + 8, viewportHeight - 40))
  };
}
