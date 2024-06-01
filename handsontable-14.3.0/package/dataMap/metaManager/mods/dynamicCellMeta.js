"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
var _pluginHooks = _interopRequireDefault(require("../../../pluginHooks"));
var _object = require("../../../helpers/object");
var _function = require("../../../helpers/function");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @class DynamicCellMetaMod
 *
 * The `DynamicCellMetaMod` modifier allows for extending cell meta objects
 * (returned by `getCellMeta()` from `MetaManager`)
 * by user-specific properties.
 *
 * The user-specific properties can be added and changed dynamically,
 * either by Handsontable's hooks (`beforeGetCellMeta` and`afterGetCellMeta`),
 * or by Handsontable's `cells` option.
 *
 * The `getCellMeta()` method is used widely throughout the source code.
 * To boost the method's execution time,
 * the logic is triggered only once per one Handsontable slow render cycle.
 */
class DynamicCellMetaMod {
  constructor(metaManager) {
    /**
     * @type {MetaManager}
     */
    _defineProperty(this, "metaManager", void 0);
    /**
     * @type {Map}
     */
    _defineProperty(this, "metaSyncMemo", new Map());
    this.metaManager = metaManager;
    metaManager.addLocalHook('afterGetCellMeta', cellMeta => this.extendCellMeta(cellMeta));
    _pluginHooks.default.getSingleton().add('beforeRender', forceFullRender => {
      if (forceFullRender) {
        this.metaSyncMemo.clear();
      }
    }, this.metaManager.hot);
  }

  /**
   * Extends the cell meta object by user-specific properties.
   *
   * The cell meta object can be extended dynamically,
   * either by Handsontable's hooks (`beforeGetCellMeta` and`afterGetCellMeta`),
   * or by Handsontable's `cells` option.
   *
   * To boost performance, the extending process is triggered only once per one slow Handsontable render cycle.
   *
   * @param {object} cellMeta The cell meta object.
   */
  extendCellMeta(cellMeta) {
    var _this$metaSyncMemo$ge;
    const {
      row: physicalRow,
      col: physicalColumn
    } = cellMeta;
    if ((_this$metaSyncMemo$ge = this.metaSyncMemo.get(physicalRow)) !== null && _this$metaSyncMemo$ge !== void 0 && _this$metaSyncMemo$ge.has(physicalColumn)) {
      return;
    }
    const {
      visualRow,
      visualCol
    } = cellMeta;
    const hot = this.metaManager.hot;
    const prop = hot.colToProp(visualCol);
    cellMeta.prop = prop;
    hot.runHooks('beforeGetCellMeta', visualRow, visualCol, cellMeta);

    // extend a `type` value, added or changed in the `beforeGetCellMeta` hook
    const cellType = (0, _object.hasOwnProperty)(cellMeta, 'type') ? cellMeta.type : null;
    let cellSettings = (0, _function.isFunction)(cellMeta.cells) ? cellMeta.cells(physicalRow, physicalColumn, prop) : null;
    if (cellType) {
      if (cellSettings) {
        var _cellSettings$type;
        cellSettings.type = (_cellSettings$type = cellSettings.type) !== null && _cellSettings$type !== void 0 ? _cellSettings$type : cellType;
      } else {
        cellSettings = {
          type: cellType
        };
      }
    }
    if (cellSettings) {
      this.metaManager.updateCellMeta(physicalRow, physicalColumn, cellSettings);
    }
    hot.runHooks('afterGetCellMeta', visualRow, visualCol, cellMeta);
    if (!this.metaSyncMemo.has(physicalRow)) {
      this.metaSyncMemo.set(physicalRow, new Set());
    }
    this.metaSyncMemo.get(physicalRow).add(physicalColumn);
  }
}
exports.DynamicCellMetaMod = DynamicCellMetaMod;