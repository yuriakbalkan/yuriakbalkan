"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
require("core-js/modules/es.array.at.js");
require("core-js/modules/es.array.push.js");
var _constants = require("./constants");
function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
/**
 * @typedef {object} ViewportRowsCalculatorOptions
 * @property {number} viewportHeight Height of the viewport.
 * @property {number} scrollOffset Current vertical scroll position of the viewport.
 * @property {number} totalRows Total number of rows.
 * @property {Function} rowHeightFn Function that returns the height of the row at a given index (in px).
 * @property {Function} overrideFn Function that changes calculated this.startRow, this.endRow (used by MergeCells plugin).
 * @property {string} calculationType String which describes types of calculation which will be performed.
 * @property {number} horizontalScrollbarHeight The scrollbar height.
 */
/**
 * Calculates indexes of rows to render OR rows that are visible.
 * To redo the calculation, you need to create a new calculator.
 *
 * @class ViewportRowsCalculator
 */
var _options = /*#__PURE__*/new WeakMap();
class ViewportRowsCalculator {
  /**
   * Default row height.
   *
   * @type {number}
   */
  static get DEFAULT_HEIGHT() {
    return 23;
  }

  /**
   * Number of rendered/visible rows.
   *
   * @type {number}
   */

  /**
   * @param {ViewportRowsCalculatorOptions} options Object with all options specified for row viewport calculation.
   */
  constructor(options) {
    _defineProperty(this, "count", 0);
    /**
     * Index of the first rendered/visible row (can be overwritten using overrideFn).
     *
     * @type {number|null}
     */
    _defineProperty(this, "startRow", null);
    /**
     * Index of the last rendered/visible row (can be overwritten using overrideFn).
     *
     * @type {null}
     */
    _defineProperty(this, "endRow", null);
    /**
     * Position of the first rendered/visible row (in px).
     *
     * @type {number|null}
     */
    _defineProperty(this, "startPosition", null);
    /**
     * Determines if the viewport is visible in the trimming container.
     *
     * @type {boolean}
     */
    _defineProperty(this, "isVisibleInTrimmingContainer", false);
    /**
     * The calculator options.
     *
     * @type {ViewportRowsCalculatorOptions}
     */
    _classPrivateFieldInitSpec(this, _options, void 0);
    _classPrivateFieldSet(_options, this, options);
    this.calculate();
  }

  /**
   * Calculates viewport.
   */
  calculate() {
    const {
      calculationType,
      overrideFn,
      rowHeightFn,
      scrollOffset,
      totalRows,
      viewportHeight
    } = _classPrivateFieldGet(_options, this);
    const zeroBasedScrollOffset = Math.max(_classPrivateFieldGet(_options, this).scrollOffset, 0);
    const horizontalScrollbarHeight = _classPrivateFieldGet(_options, this).horizontalScrollbarHeight || 0;
    let sum = 0;
    let needReverse = true;
    const startPositions = [];
    let rowHeight;
    let firstVisibleRowHeight = 0;
    let lastVisibleRowHeight = 0;

    // Calculate the number (start and end index) of rows needed
    for (let i = 0; i < totalRows; i++) {
      rowHeight = rowHeightFn(i);
      if (isNaN(rowHeight)) {
        rowHeight = ViewportRowsCalculator.DEFAULT_HEIGHT;
      }
      if (sum <= zeroBasedScrollOffset && calculationType !== _constants.FULLY_VISIBLE_TYPE) {
        this.startRow = i;
        firstVisibleRowHeight = rowHeight;
      }
      if (sum >= zeroBasedScrollOffset && sum + (calculationType === _constants.FULLY_VISIBLE_TYPE ? rowHeight : 0) <= zeroBasedScrollOffset + viewportHeight - horizontalScrollbarHeight) {
        // eslint-disable-line max-len
        if (this.startRow === null) {
          this.startRow = i;
          firstVisibleRowHeight = rowHeight;
        }
        this.endRow = i;
      }
      startPositions.push(sum);
      sum += rowHeight;
      lastVisibleRowHeight = rowHeight;
      if (calculationType !== _constants.FULLY_VISIBLE_TYPE) {
        this.endRow = i;
      }
      if (sum >= zeroBasedScrollOffset + viewportHeight - horizontalScrollbarHeight) {
        needReverse = false;
        break;
      }
    }
    const mostBottomScrollOffset = scrollOffset + viewportHeight - horizontalScrollbarHeight;
    const topRowOffset = calculationType === _constants.FULLY_VISIBLE_TYPE ? firstVisibleRowHeight : 0;
    const bottomRowOffset = calculationType === _constants.FULLY_VISIBLE_TYPE ? 0 : lastVisibleRowHeight;
    if (mostBottomScrollOffset < topRowOffset || scrollOffset > startPositions.at(-1) + bottomRowOffset) {
      this.isVisibleInTrimmingContainer = false;
    } else {
      this.isVisibleInTrimmingContainer = true;
    }

    // If the estimation has reached the last row and there is still some space available in the viewport,
    // we need to render in reverse in order to fill the whole viewport with rows
    if (this.endRow === totalRows - 1 && needReverse) {
      this.startRow = this.endRow;
      while (this.startRow > 0) {
        // rowHeight is the height of the last row
        const viewportSum = startPositions[this.endRow] + rowHeight - startPositions[this.startRow - 1];
        if (viewportSum <= viewportHeight - horizontalScrollbarHeight || calculationType !== _constants.FULLY_VISIBLE_TYPE) {
          this.startRow -= 1;
        }
        if (viewportSum >= viewportHeight - horizontalScrollbarHeight) {
          break;
        }
      }
    }
    if (calculationType === _constants.RENDER_TYPE && this.startRow !== null && overrideFn) {
      overrideFn(this);
    }
    this.startPosition = startPositions[this.startRow];
    if (this.startPosition === undefined) {
      this.startPosition = null;
    }

    // If totalRows exceeded its total rows size set endRow to the latest item
    if (totalRows < this.endRow) {
      this.endRow = totalRows - 1;
    }
    if (this.startRow !== null) {
      this.count = this.endRow - this.startRow + 1;
    }
  }
}
exports.ViewportRowsCalculator = ViewportRowsCalculator;