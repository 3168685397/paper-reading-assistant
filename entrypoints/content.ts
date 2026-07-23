import { calculatePopoverPosition, type ViewportRect } from "../src/lib/selection/calculatePopoverPosition";
import { isLikelyEnglishSelection, readTextControlSelection, selectionButtonPosition, validateSelection } from "../src/lib/selection";
import { element, hasReaderRoot, mountScienceReaderRoot } from "../src/lib/popover/dom";
import { popoverCss } from "../src/lib/popover/styles";
import { DraggablePopover } from "../src/lib/drag/draggablePopover";
import { createAccordion } from "../src/lib/popover/accordion";
import type { GrammarResult, TranslationResult } from "../src/lib/llm/schemas";
import { isSiteExcluded } from "../src/lib/sites";
import type { ContentSettings, RuntimeRequest, SelectionPayload } from "../src/types";

type Reply<T> = { ok: true; result: T; saved?: boolean } | { ok: false; error: string };

function rectValue(rect: DOMRect): ViewportRect {
  return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
}

export default defineContentScript({
  registration: "runtime",
  allFrames: true,
  matchAboutBlank: true,
  matchOriginAsFallback: true,
  async main() {
    if (hasReaderRoot(document)) return;
    const settingsReply = await chrome.runtime.sendMessage({ type: "GET_CONTENT_SETTINGS" }) as Reply<ContentSettings>;
    if (!settingsReply.ok || settingsReply.result.selectionBehavior === "disabled" || isSiteExcluded(location.hostname, settingsReply.result.excludedSites)) return;
    const selectionBehavior = settingsReply.result.selectionBehavior;
    const ui = mountScienceReaderRoot(document, popoverCss);
    const draggable = new DraggablePopover(ui.popover);
    let payload: SelectionPayload | undefined;
    let rangeRect: ViewportRect | undefined;
    let selectionRange: Range | undefined;
    let translation: TranslationResult | undefined;
    let grammar: GrammarResult | undefined;
    let requestVersion = 0;
    let interacting = false;

    const cancelRequest = () => {
      requestVersion += 1;
      void chrome.runtime.sendMessage({ type: "CANCEL_REQUEST" });
    };

    const positionTrigger = () => {
      if (!rangeRect) return;
      const point = selectionButtonPosition(rangeRect, innerWidth, innerHeight);
      ui.trigger.style.left = `${point.left}px`;
      ui.trigger.style.top = `${point.top}px`;
    };

    const positionPopover = () => {
      if (!rangeRect || ui.popover.hidden) return;
      const width = Math.min(Math.min(500, Math.max(440, innerWidth * 0.29)), Math.max(0, innerWidth - 24));
      const height = Math.min(620, Math.max(190, ui.popover.scrollHeight));
      const point = calculatePopoverPosition(rangeRect, innerWidth, innerHeight, width, height);
      draggable.applyAutoPosition({ left: point.left, top: point.top });
      ui.popover.dataset.placement = point.placement;
    };

    const button = (text: string, className: string, handler: () => void) => {
      const node = element(document, "button", className, text);
      node.type = "button";
      node.addEventListener("click", handler);
      return node;
    };

    const close = () => {
      cancelRequest();
      ui.trigger.hidden = true;
      ui.popover.hidden = true;
      payload = undefined;
      rangeRect = undefined;
      selectionRange = undefined;
      translation = undefined;
      grammar = undefined;
      draggable.resetManualPosition();
    };

    const renderShell = () => {
      ui.popover.replaceChildren();
      const header = element(document, "header", "sr-header");
      header.append(element(document, "strong", "sr-title", "翻译"));
      const tools = element(document, "div", "sr-tools");
      tools.append(
        button("复制", "sr-icon", () => void copyNote()),
        button("关闭", "sr-icon", close)
      );
      header.append(tools);
      draggable.setHandle(header);
      const body = element(document, "div", "sr-body");
      ui.popover.append(header, body);
      return body;
    };

    const copyNote = async () => {
      if (!payload) return;
      const pairs = translation?.pairs.map((pair) => `${pair.chinese}\n\n${pair.english}`).join("\n\n---\n\n") ?? payload.text;
      const summary = translation ? `\n\n## 核心意思\n\n${translation.summary}` : "";
      await navigator.clipboard.writeText(`# 论文精读笔记\n\n## 翻译\n\n${pairs}${summary}`);
    };

    const renderLoading = (label = "翻译中") => {
      const body = renderShell();
      const status = element(document, "div", "sr-status");
      status.append(element(document, "span", "sr-dots", `${label}···`));
      body.append(status);
      ui.popover.hidden = false;
      requestAnimationFrame(() => {
        positionPopover();
        draggable.reclamp();
      });
    };

    const renderError = (message: string, retry: () => void) => {
      const body = renderShell();
      body.append(element(document, "div", "sr-error", message));
      const actions = element(document, "div", "sr-actions");
      actions.append(
        button("重试", "sr-action sr-action-primary", retry),
        button("打开设置", "sr-action", () => void chrome.runtime.sendMessage({ type: "OPEN_OPTIONS" }))
      );
      body.append(actions);
      ui.popover.hidden = false;
      requestAnimationFrame(() => {
        positionPopover();
        draggable.reclamp();
      });
    };

    const addSection = (body: HTMLElement, label: string, content: string, className: string, variant: string) => {
      const section = element(document, "section", `sr-section sr-section-${variant}`);
      section.append(element(document, "h3", "sr-label", label), element(document, "p", className, content));
      body.append(section);
    };

    const renderGrammar = (body: HTMLElement, result: GrammarResult) => {
      const area = element(document, "section", "sr-analysis");
      area.append(element(document, "h3", "sr-analysis-title", "句子主干"));
      for (const sentence of result.sentences) {
        const sentenceBlock = element(document, "section", "sr-sentence-frame");
        sentenceBlock.append(element(document, "p", "sr-sentence-source", sentence.sentence));
        const facts = element(document, "dl", "sr-skeleton-grid");
        const rows = [
          ["结构", sentence.mainStructure],
          ["主语", sentence.subject.text],
          ["谓语", sentence.predicate.text],
          ["宾语/补语", sentence.objectOrComplement.text]
        ];
        for (const [term, description] of rows) facts.append(element(document, "dt", undefined, term), element(document, "dd", undefined, description));
        sentenceBlock.append(facts);
        area.append(sentenceBlock);
      }

      const field = (label: string, content: string, english = false) => {
        const block = element(document, "div", "sr-learning-field");
        block.append(
          element(document, "div", "sr-learning-label", label),
          element(document, "div", english ? "sr-learning-source" : "sr-learning-copy", content)
        );
        return block;
      };

      area.append(element(document, "h3", "sr-learning-heading", "语法知识点"));
      const grammarAccordion = createAccordion(
        document,
        result.grammarPoints.map((point, index) => ({
          id: point.id,
          title: point.nameZh,
          subtitle: point.nameEn,
          indexLabel: String(index + 1).padStart(2, "0")
        })),
        (_item, index) => {
          const point = result.grammarPoints[index]!;
          const panel = element(document, "div");
          panel.append(
            field("原文结构", point.source, true),
            field("在句中的作用", point.functionInSentence),
            field("结构说明", point.explanation)
          );
          if (point.breakdown.length) {
            const breakdown = element(document, "div", "sr-learning-field");
            breakdown.append(element(document, "div", "sr-learning-label", "结构拆分"));
            for (const part of point.breakdown) {
              const row = element(document, "div", "sr-breakdown-row");
              row.append(
                element(document, "div", "sr-learning-source", part.text),
                element(document, "div", "sr-learning-copy", part.role)
              );
              breakdown.append(row);
            }
            panel.append(breakdown);
          }
          const example = element(document, "div", "sr-learning-field");
          example.append(
            element(document, "div", "sr-learning-label", "简短例句"),
            element(document, "div", "sr-learning-source", point.example),
            element(document, "div", "sr-learning-copy", point.exampleZh)
          );
          panel.append(example);
          return panel;
        },
        result.grammarPoints.length ? 0 : undefined
      );
      area.append(grammarAccordion.root);

      area.append(element(document, "h3", "sr-learning-heading", "学术词汇"));
      const vocabularyAccordion = createAccordion(
        document,
        result.vocabulary.map((item, index) => ({
          id: `vocabulary-${index + 1}`,
          title: item.term,
          subtitle: item.meaning,
          meta: item.partOfSpeech
        })),
        (_item, index) => {
          const item = result.vocabulary[index]!;
          const panel = element(document, "div");
          panel.append(
            field("原文语境", item.source, true),
            field("本文含义", item.meaningInContext)
          );
          if (item.collocations.length) {
            const collocations = element(document, "div", "sr-learning-field");
            collocations.append(element(document, "div", "sr-learning-label", "常用搭配"));
            for (const collocation of item.collocations) {
              const row = element(document, "div", "sr-collocation-row");
              row.append(
                element(document, "div", "sr-learning-source", collocation.english),
                element(document, "div", "sr-learning-copy", collocation.chinese)
              );
              collocations.append(row);
            }
            panel.append(collocations);
          }
          return panel;
        }
      );
      area.append(vocabularyAccordion.root);
      body.append(area);
    };

    const renderSuccess = (saved = false) => {
      if (!payload || !translation) return;
      const body = renderShell();
      addSection(body, "中文翻译", translation.pairs.map((pair) => pair.chinese).join("\n"), "sr-chinese", "chinese");
      addSection(body, "核心意思", translation.summary, "sr-summary", "summary");
      addSection(body, "英文原文", payload.text, "sr-english", "english");
      const actions = element(document, "div", "sr-actions");
      actions.append(
        button(grammar ? "已分析语法" : "分析语法", "sr-action sr-action-primary", () => void analyze()),
        button("复制", "sr-action", () => void copyNote())
      );
      body.append(actions);
      if (grammar) renderGrammar(body, grammar);
      if (saved) body.append(element(document, "p", "sr-saved", "已保存到最近记录"));
      ui.popover.hidden = false;
      requestAnimationFrame(() => {
        positionPopover();
        draggable.reclamp();
      });
    };

    const translate = async () => {
      if (!payload) return;
      cancelRequest();
      const version = requestVersion;
      ui.trigger.hidden = true;
      translation = undefined;
      grammar = undefined;
      draggable.resetManualPosition();
      renderLoading();
      const reply = await chrome.runtime.sendMessage({ type: "TRANSLATE", payload }) as Reply<TranslationResult>;
      if (version !== requestVersion) return;
      if (!reply.ok) return renderError(reply.error, () => void translate());
      translation = reply.result;
      renderSuccess(reply.saved);
    };

    const analyze = async () => {
      if (!payload || !translation || grammar) return;
      cancelRequest();
      const version = requestVersion;
      renderLoading("分析语法中");
      const reply = await chrome.runtime.sendMessage({ type: "ANALYZE", payload }) as Reply<GrammarResult>;
      if (version !== requestVersion) return;
      if (!reply.ok) return renderError(reply.error, () => void analyze());
      grammar = reply.result;
      renderSuccess(true);
    };

    const useSelection = (text: string, rect: ViewportRect, range?: Range) => {
      const validated = validateSelection(text);
      if (!validated.ok || !isLikelyEnglishSelection(validated.text)) return close();
      cancelRequest();
      payload = { text: validated.text, title: document.title, url: location.href, selectedAt: Date.now() };
      rangeRect = rect;
      selectionRange = range?.cloneRange();
      translation = undefined;
      grammar = undefined;
      ui.popover.hidden = true;
      ui.trigger.hidden = false;
      positionTrigger();
      if (selectionBehavior === "auto") void translate();
    };

    const readSelection = (target?: EventTarget | null) => {
      if (interacting) return;
      const controlText = readTextControlSelection(target ?? document.activeElement);
      if (controlText) {
        const control = (target ?? document.activeElement) as HTMLInputElement | HTMLTextAreaElement;
        const rect = control.getBoundingClientRect();
        useSelection(controlText, rectValue(rect));
        return;
      }
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return close();
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      if (!rect.width && !rect.height) return close();
      useSelection(selection.toString(), rectValue(rect), selection.getRangeAt(0));
    };

    ui.trigger.addEventListener("click", () => void translate());
    ui.host.addEventListener("pointerdown", () => { interacting = true; });
    ui.host.addEventListener("pointerup", () => { queueMicrotask(() => { interacting = false; }); });
    ui.host.addEventListener("pointercancel", () => { interacting = false; });
    document.addEventListener("selectionchange", () => requestAnimationFrame(() => readSelection()));
    document.addEventListener("pointerup", (event) => requestAnimationFrame(() => readSelection(event.target)), true);
    document.addEventListener("keyup", (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        requestAnimationFrame(() => readSelection(event.target));
      }
    }, true);
    document.addEventListener("pointerdown", (event) => {
      if (event.composedPath().includes(ui.host)) return;
      close();
    }, true);
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); }, true);
    const refreshRangeRect = () => {
      if (selectionRange) rangeRect = rectValue(selectionRange.getBoundingClientRect());
    };
    addEventListener("resize", () => {
      refreshRangeRect();
      if (!ui.popover.hidden) {
        if (!draggable.snapshot.hasManualPosition) positionPopover();
        draggable.reclamp();
      } else positionTrigger();
    }, { passive: true });
    addEventListener("scroll", () => {
      if (!rangeRect) return;
      refreshRangeRect();
      if (!rangeRect) return;
      if (rangeRect.bottom < 0 || rangeRect.top > innerHeight || rangeRect.right < 0 || rangeRect.left > innerWidth) close();
      else if (!ui.popover.hidden && !draggable.snapshot.hasManualPosition) positionPopover();
      else positionTrigger();
    }, { passive: true, capture: true });

    chrome.runtime.onMessage.addListener((message: RuntimeRequest) => {
      if (message.type !== "CONTEXT_SELECTION") return;
      const selection = window.getSelection();
      const rect = selection?.rangeCount ? rectValue(selection.getRangeAt(0).getBoundingClientRect()) : {
        left: innerWidth / 2, right: innerWidth / 2, top: innerHeight / 2, bottom: innerHeight / 2, width: 0, height: 0
      };
      useSelection(message.payload.text, rect, selection?.rangeCount ? selection.getRangeAt(0) : undefined);
      void translate();
    });
    addEventListener("pagehide", () => draggable.destroy(), { once: true });
  }
});
