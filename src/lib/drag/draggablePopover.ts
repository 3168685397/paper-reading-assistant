export interface DragPosition {
  left: number;
  top: number;
}

export interface DragBounds {
  viewportWidth: number;
  viewportHeight: number;
  cardWidth: number;
  cardHeight: number;
  edge?: number;
}

export interface DragState {
  isDragging: boolean;
  hasManualPosition: boolean;
  dragStartPointer?: DragPosition;
  dragStartPosition?: DragPosition;
  currentPosition?: DragPosition;
}

export function clampDragPosition(position: DragPosition, bounds: DragBounds): DragPosition {
  const edge = bounds.edge ?? 8;
  return {
    left: Math.min(Math.max(position.left, edge), Math.max(edge, bounds.viewportWidth - bounds.cardWidth - edge)),
    top: Math.min(Math.max(position.top, edge), Math.max(edge, bounds.viewportHeight - bounds.cardHeight - edge))
  };
}

export function calculateDragPosition(
  startPointer: DragPosition,
  startPosition: DragPosition,
  currentPointer: DragPosition,
  bounds: DragBounds
): DragPosition {
  return clampDragPosition({
    left: startPosition.left + currentPointer.left - startPointer.left,
    top: startPosition.top + currentPointer.top - startPointer.top
  }, bounds);
}

export function isDragHandleTarget(target: EventTarget | null, handle: HTMLElement): boolean {
  return target instanceof Element && handle.contains(target) && !target.closest("button,a,input,textarea,select,[data-no-drag]");
}

export class DraggablePopover {
  private state: DragState = { isDragging: false, hasManualPosition: false };
  private handle?: HTMLElement;
  private frame?: number;
  private pendingPosition?: DragPosition;
  private pointerId?: number;

  constructor(
    private readonly card: HTMLElement,
    private readonly windowRef: Window = window
  ) {
    this.windowRef.addEventListener("resize", this.handleResize);
  }

  get snapshot(): Readonly<DragState> {
    return { ...this.state };
  }

  setHandle(handle: HTMLElement): void {
    this.detachHandle();
    this.handle = handle;
    handle.addEventListener("pointerdown", this.handlePointerDown);
    handle.addEventListener("pointermove", this.handlePointerMove);
    handle.addEventListener("pointerup", this.handlePointerEnd);
    handle.addEventListener("pointercancel", this.handlePointerEnd);
  }

  resetManualPosition(): void {
    this.endDrag();
    this.state = { isDragging: false, hasManualPosition: false };
    this.card.classList.remove("sr-dragging");
  }

  applyAutoPosition(position: DragPosition): void {
    if (this.state.hasManualPosition) return;
    this.applyPosition(position);
  }

  reclamp(): void {
    const rect = this.card.getBoundingClientRect();
    const position = clampDragPosition(
      { left: rect.left, top: rect.top },
      this.bounds(rect)
    );
    this.applyPosition(position);
    if (this.state.hasManualPosition) this.state.currentPosition = position;
  }

  destroy(): void {
    this.detachHandle();
    this.endDrag();
    this.windowRef.removeEventListener("resize", this.handleResize);
    if (this.frame !== undefined) {
      this.windowRef.cancelAnimationFrame(this.frame);
      this.frame = undefined;
    }
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!this.handle || event.button !== 0 || !isDragHandleTarget(event.target, this.handle)) return;
    const rect = this.card.getBoundingClientRect();
    const position = clampDragPosition({ left: rect.left, top: rect.top }, this.bounds(rect));
    this.state = {
      isDragging: true,
      hasManualPosition: true,
      dragStartPointer: { left: event.clientX, top: event.clientY },
      dragStartPosition: position,
      currentPosition: position
    };
    this.pointerId = event.pointerId;
    this.handle.setPointerCapture(event.pointerId);
    this.card.classList.add("sr-dragging");
    event.preventDefault();
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.state.isDragging || event.pointerId !== this.pointerId || !this.state.dragStartPointer || !this.state.dragStartPosition) return;
    const rect = this.card.getBoundingClientRect();
    this.pendingPosition = calculateDragPosition(
      this.state.dragStartPointer,
      this.state.dragStartPosition,
      { left: event.clientX, top: event.clientY },
      this.bounds(rect)
    );
    if (this.frame === undefined) {
      this.frame = this.windowRef.requestAnimationFrame(() => {
        this.frame = undefined;
        if (!this.pendingPosition) return;
        this.applyPosition(this.pendingPosition);
        this.state.currentPosition = this.pendingPosition;
        this.pendingPosition = undefined;
      });
    }
    event.preventDefault();
  };

  private readonly handlePointerEnd = (event: PointerEvent): void => {
    if (!this.state.isDragging || event.pointerId !== this.pointerId) return;
    if (this.handle?.hasPointerCapture(event.pointerId)) this.handle.releasePointerCapture(event.pointerId);
    if (event.type === "pointerup" && this.pendingPosition) {
      this.applyPosition(this.pendingPosition);
      this.state.currentPosition = this.pendingPosition;
    }
    this.endDrag();
  };

  private readonly handleResize = (): void => {
    if (!this.card.hidden) this.reclamp();
  };

  private endDrag(): void {
    if (this.frame !== undefined) {
      this.windowRef.cancelAnimationFrame(this.frame);
      this.frame = undefined;
    }
    this.pendingPosition = undefined;
    this.state.isDragging = false;
    this.pointerId = undefined;
    this.card.classList.remove("sr-dragging");
  }

  private bounds(rect: DOMRect): DragBounds {
    return {
      viewportWidth: this.windowRef.innerWidth,
      viewportHeight: this.windowRef.innerHeight,
      cardWidth: rect.width,
      cardHeight: rect.height,
      edge: 8
    };
  }

  private applyPosition(position: DragPosition): void {
    this.card.style.left = `${position.left}px`;
    this.card.style.top = `${position.top}px`;
  }

  private detachHandle(): void {
    if (!this.handle) return;
    this.handle.removeEventListener("pointerdown", this.handlePointerDown);
    this.handle.removeEventListener("pointermove", this.handlePointerMove);
    this.handle.removeEventListener("pointerup", this.handlePointerEnd);
    this.handle.removeEventListener("pointercancel", this.handlePointerEnd);
    this.handle = undefined;
  }
}
