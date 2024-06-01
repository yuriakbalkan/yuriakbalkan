"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
var _object = require("../../../helpers/object");
var _utils = require("../utils");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * The table meta object is a layer that keeps all settings of the Handsontable that was passed in
 * the constructor. That layer contains all default settings inherited from the GlobalMeta layer
 * merged with settings passed by the developer. Adding, removing, or changing property in that
 * object has no direct reflection on any other layers.
 *
 * +-------------+.
 * │ GlobalMeta  │
 * │ (prototype) │
 * +-------------+\
 *       │         \
 *       │          \
 *      \│/         _\|
 * +-------------+    +-------------+.
 * │ TableMeta   │    │ ColumnMeta  │
 * │ (instance)  │    │ (prototype) │
 * +-------------+    +-------------+.
 *                         │
 *                         │
 *                        \│/
 *                    +-------------+.
 *                    │  CellMeta   │
 *                    │ (instance)  │
 *                    +-------------+.
 */
class TableMeta {
  constructor(globalMeta) {
    /**
     * Main object (instance of the internal TableMeta class from GlobalMeta), holder for all settings defined in the table scope.
     *
     * @type {TableMeta}
     */
    _defineProperty(this, "meta", void 0);
    const MetaCtor = globalMeta.getMetaConstructor();
    this.meta = new MetaCtor();
  }

  /**
   * Gets settings object for this layer.
   *
   * @returns {TableMeta}
   */
  getMeta() {
    return this.meta;
  }

  /**
   * Updates table settings object by merging settings with the current state.
   *
   * @param {object} settings An object to merge with.
   */
  updateMeta(settings) {
    (0, _object.extend)(this.meta, settings);
    (0, _utils.extendByMetaType)(this.meta, settings, settings);
  }
}
exports.default = TableMeta;