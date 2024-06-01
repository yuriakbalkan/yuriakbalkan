import { EDITOR_EDIT_GROUP } from "./constants.mjs";
import { createKeyboardShortcutCommandsPool } from "./commands/index.mjs";
/**
 * The context that defines a base shortcut list available for cells editors.
 *
 * @param {Handsontable} hot The Handsontable instance.
 */
export function shortcutsEditorContext(hot) {
  const context = hot.getShortcutManager().addContext('editor');
  const commandsPool = createKeyboardShortcutCommandsPool(hot);
  const config = {
    group: EDITOR_EDIT_GROUP
  };
  context.addShortcuts([{
    keys: [['Enter'], ['Enter', 'Shift']],
    callback: (event, keys) => commandsPool.editorCloseAndSave(event, keys)
  }, {
    keys: [['Enter', 'Control/Meta'], ['Enter', 'Control/Meta', 'Shift']],
    captureCtrl: true,
    callback: (event, keys) => commandsPool.editorCloseAndSave(event, keys)
  }, {
    keys: [['Escape'], ['Escape', 'Control/Meta']],
    callback: () => commandsPool.editorCloseWithoutSaving()
  }], config);
}