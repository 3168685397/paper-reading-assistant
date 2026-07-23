import { startSelectionTranslationUi } from "../src/lib/popover/controller";

export default defineContentScript({
  registration: "runtime",
  allFrames: true,
  matchAboutBlank: true,
  matchOriginAsFallback: true,
  main: () => startSelectionTranslationUi()
});
