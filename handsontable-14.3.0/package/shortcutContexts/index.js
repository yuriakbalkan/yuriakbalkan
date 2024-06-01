"use strict";

exports.__esModule = true;
var _exportNames = {
  registerAllShortcutContexts: true
};
exports.registerAllShortcutContexts = registerAllShortcutContexts;
var _editor = require("./editor");
var _grid = require("./grid");
var _constants = require("./constants");
Object.keys(_constants).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _constants[key]) return;
  exports[key] = _constants[key];
});
/**
 * Register all shortcut contexts.
 *
 * @param {Handsontable} hotInstance The Handsontable instance.
 */
function registerAllShortcutContexts(hotInstance) {
  [_editor.shortcutsEditorContext, _grid.shortcutsGridContext].forEach(context => context(hotInstance));
}