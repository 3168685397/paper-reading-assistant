export interface ViewportRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export type PopoverPlacement = "right" | "left" | "bottom" | "top";

export interface PopoverPosition {
  left: number;
  top: number;
  placement: PopoverPlacement;
}

export const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(Math.max(value, minimum), maximum);

export function calculatePopoverPosition(
  rangeRect: ViewportRect,
  viewportWidth: number,
  viewportHeight: number,
  requestedWidth = 360,
  requestedHeight = 520,
  edge = 12,
  gap = 10
): PopoverPosition {
  const width = Math.min(requestedWidth, Math.max(0, viewportWidth - edge * 2));
  const height = Math.min(requestedHeight, Math.max(0, viewportHeight - edge * 2));
  const centeredTop = clamp(rangeRect.top + rangeRect.height / 2 - height / 2, edge, viewportHeight - height - edge);
  const centeredLeft = clamp(rangeRect.left + rangeRect.width / 2 - width / 2, edge, viewportWidth - width - edge);

  if (viewportWidth - rangeRect.right >= width + gap + edge) {
    return { left: rangeRect.right + gap, top: centeredTop, placement: "right" };
  }
  if (rangeRect.left >= width + gap + edge) {
    return { left: rangeRect.left - width - gap, top: centeredTop, placement: "left" };
  }
  if (viewportHeight - rangeRect.bottom >= height + gap + edge) {
    return { left: centeredLeft, top: rangeRect.bottom + gap, placement: "bottom" };
  }
  return {
    left: centeredLeft,
    top: clamp(rangeRect.top - height - gap, edge, viewportHeight - height - edge),
    placement: "top"
  };
}
