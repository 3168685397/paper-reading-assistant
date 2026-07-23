export function replaceAbortController(current?: AbortController): AbortController {
  current?.abort();
  return new AbortController();
}
