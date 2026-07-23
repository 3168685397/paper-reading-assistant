export function protectTriggerEvent(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
}

export function isReaderUiEvent(
  event: Event,
  host: EventTarget,
  trigger: EventTarget,
  popover: EventTarget
): boolean {
  const path = event.composedPath();
  return path.includes(host) || path.includes(trigger) || path.includes(popover);
}
