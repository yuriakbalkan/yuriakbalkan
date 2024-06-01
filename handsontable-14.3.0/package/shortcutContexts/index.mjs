import { shortcutsEditorContext } from "./editor.mjs";
import { shortcutsGridContext } from "./grid.mjs";
export * from "./constants.mjs";
/**
 * Register all shortcut contexts.
 *
 * @param {Handsontable} hotInstance The Handsontable instance.
 */
export function registerAllShortcutContexts(hotInstance) {
  [shortcutsEditorContext, shortcutsGridContext].forEach(context => context(hotInstance));
}