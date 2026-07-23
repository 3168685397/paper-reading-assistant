import { describe, expect, it } from "vitest";
import { mergeHistory, recordToMarkdown } from "../src/lib/storage";
import type { HistoryRecord } from "../src/types";

const record = (id: string, original = "Evidence suggests."): HistoryRecord => ({
  id, original, translation: { summary: "证据表明某事。", pairs: [{ english: original, chinese: "证据表明。" }] },
  pageTitle: "Paper", pageUrl: "https://www.science.org/x", createdAt: 1
});

describe("history", () => {
  it("按原文去重并将新记录置顶", () => {
    expect(mergeHistory([record("old"), record("other", "Another.")], record("new")).map(x => x.id)).toEqual(["new", "other"]);
  });
  it("最多保留 50 条", () => {
    const old = Array.from({ length: 50 }, (_, i) => record(String(i), `Text ${i}`));
    expect(mergeHistory(old, record("new", "New")).length).toBe(50);
  });
  it("导出完整 Markdown", () => {
    const output = recordToMarkdown(record("1"));
    expect(output).toContain("# 论文精读笔记");
    expect(output).toContain("## 中英对照");
    expect(output).toContain("## 核心意思");
  });
});
