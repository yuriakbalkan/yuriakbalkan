"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
var _element = require("../../../../helpers/dom/element");
var _object = require("../../../../helpers/object");
var _array = require("../../../../helpers/array");
var _console = require("../../../../helpers/console");
var _constants = require("./constants");
var _clone = _interopRequireDefault(require("../core/clone"));
var _a11y = require("../../../../helpers/a11y");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Creates an overlay over the original Walkontable instance. The overlay renders the clone of the original Walkontable
 * and (optionally) implements behavior needed for native horizontal and vertical scrolling.
 *
 * @abstract
 * @class Overlay
 * @property {Walkontable} wot The Walkontable instance.
 */
class Overlay {
  /**
   * @param {Walkontable} wotInstance The Walkontable instance. @TODO refactoring: check if can be deleted.
   * @param {FacadeGetter} facadeGetter Function which return proper facade.
   * @param {CLONE_TYPES_ENUM} type The overlay type name (clone name).
   * @param {Settings} wtSettings The Walkontable settings.
   * @param {DomBindings} domBindings Dom elements bound to the current instance.
   */
  constructor(wotInstance, facadeGetter, type, wtSettings, domBindings) {
    /**
     *  The Walkontable settings.
     *
     * @private
     * @type {Settings}
     */
    _defineProperty(this, "wtSettings", null);
    (0, _object.defineGetter)(this, 'wot', wotInstance, {
      writable: false
    });
    this.domBindings = domBindings;
    this.facadeGetter = facadeGetter;
    this.wtSettings = wtSettings;
    const {
      TABLE,
      hider,
      spreader,
      holder,
      wtRootElement
    } = this.wot.wtTable; // todo ioc

    // legacy support, deprecated in the future
    this.instance = this.wot;
    this.type = type;
    this.mainTableScrollableElement = null;
    this.TABLE = TABLE;
    this.hider = hider;
    this.spreader = spreader;
    this.holder = holder;
    this.wtRootElement = wtRootElement;
    this.trimmingContainer = (0, _element.getTrimmingContainer)(this.hider.parentNode.parentNode);
    this.updateStateOfRendering();
    this.clone = this.makeClone();
  }

  /**
   * Update internal state of object with an information about the need of full rendering of the overlay.
   *
   * @returns {boolean} Returns `true` if the state has changed since the last check.
   */
  updateStateOfRendering() {
    // todo refactoring: conceive introducing final state machine, normal -> changed (once) -> needs-full-render -> ...? -> normal
    const previousState = this.needFullRender;
    this.needFullRender = this.shouldBeRendered();
    const changed = previousState !== this.needFullRender;
    if (changed && !this.needFullRender) {
      this.reset();
    }
    return changed;
  }

  /**
   * Checks if overlay should be fully rendered.
   *
   * @returns {boolean}
   */
  shouldBeRendered() {
    return true;
  }

  /**
   * Update the trimming container.
   */
  updateTrimmingContainer() {
    this.trimmingContainer = (0, _element.getTrimmingContainer)(this.hider.parentNode.parentNode);
  }

  /**
   * Update the main scrollable element.
   */
  updateMainScrollableElement() {
    const {
      wtTable
    } = this.wot;
    const {
      rootWindow
    } = this.domBindings;
    if (rootWindow.getComputedStyle(wtTable.wtRootElement.parentNode).getPropertyValue('overflow') === 'hidden') {
      this.mainTableScrollableElement = this.wot.wtTable.holder;
    } else {
      this.mainTableScrollableElement = (0, _element.getScrollableElement)(wtTable.TABLE);
    }
  }

  /**
   * Calculates coordinates of the provided element, relative to the root Handsontable element.
   * NOTE: The element needs to be a child of the overlay in order for the method to work correctly.
   *
   * @param {HTMLElement} element The cell element to calculate the position for.
   * @param {number} rowIndex Visual row index.
   * @param {number} columnIndex Visual column index.
   * @returns {{top: number, start: number}|undefined}
   */
  getRelativeCellPosition(element, rowIndex, columnIndex) {
    if (this.clone.wtTable.holder.contains(element) === false) {
      (0, _console.warn)(`The provided element is not a child of the ${this.type} overlay`);
      return;
    }
    const windowScroll = this.mainTableScrollableElement === this.domBindings.rootWindow;
    const fixedColumnStart = columnIndex < this.wtSettings.getSetting('fixedColumnsStart');
    const fixedRowTop = rowIndex < this.wtSettings.getSetting('fixedRowsTop');
    const fixedRowBottom = rowIndex >= this.wtSettings.getSetting('totalRows') - this.wtSettings.getSetting('fixedRowsBottom');
    const spreader = this.clone.wtTable.spreader;
    const spreaderOffset = {
      start: this.getRelativeStartPosition(spreader),
      top: spreader.offsetTop
    };
    const elementOffset = {
      start: this.getRelativeStartPosition(element),
      top: element.offsetTop
    };
    let offsetObject = null;
    if (windowScroll) {
      offsetObject = this.getRelativeCellPositionWithinWindow(fixedRowTop, fixedColumnStart, elementOffset, spreaderOffset);
    } else {
      offsetObject = this.getRelativeCellPositionWithinHolder(fixedRowTop, fixedRowBottom, fixedColumnStart, elementOffset, spreaderOffset);
    }
    return offsetObject;
  }

  /**
   * Get inline start value depending of direction.
   *
   * @param {HTMLElement} el Element.
   * @returns {number}
   */
  getRelativeStartPosition(el) {
    return this.isRtl() ? el.offsetParent.offsetWidth - el.offsetLeft - el.offsetWidth : el.offsetLeft;
  }

  /**
   * Calculates coordinates of the provided element, relative to the root Handsontable element within a table with window
   * as a scrollable element.
   *
   * @private
   * @param {boolean} onFixedRowTop `true` if the coordinates point to a place within the top fixed rows.
   * @param {boolean} onFixedColumn `true` if the coordinates point to a place within the fixed columns.
   * @param {number} elementOffset Offset position of the cell element.
   * @param {number} spreaderOffset Offset position of the spreader element.
   * @returns {{top: number, left: number}}
   */
  getRelativeCellPositionWithinWindow(onFixedRowTop, onFixedColumn, elementOffset, spreaderOffset) {
    const absoluteRootElementPosition = this.wot.wtTable.wtRootElement.getBoundingClientRect(); // todo refactoring: DEMETER
    let horizontalOffset = 0;
    let verticalOffset = 0;
    if (!onFixedColumn) {
      horizontalOffset = spreaderOffset.start;
    } else {
      let absoluteRootElementStartPosition = absoluteRootElementPosition.left;
      if (this.isRtl()) {
        absoluteRootElementStartPosition = this.domBindings.rootWindow.innerWidth - (absoluteRootElementPosition.left + absoluteRootElementPosition.width + (0, _element.getScrollbarWidth)());
      }
      horizontalOffset = absoluteRootElementStartPosition <= 0 ? -1 * absoluteRootElementStartPosition : 0;
    }
    if (onFixedRowTop) {
      const absoluteOverlayPosition = this.clone.wtTable.TABLE.getBoundingClientRect();
      verticalOffset = absoluteOverlayPosition.top - absoluteRootElementPosition.top;
    } else {
      verticalOffset = spreaderOffset.top;
    }
    return {
      start: elementOffset.start + horizontalOffset,
      top: elementOffset.top + verticalOffset
    };
  }

  /**
   * Calculates coordinates of the provided element, relative to the root Handsontable element within a table with window
   * as a scrollable element.
   *
   * @private
   * @param {boolean} onFixedRowTop `true` if the coordinates point to a place within the top fixed rows.
   * @param {boolean} onFixedRowBottom `true` if the coordinates point to a place within the bottom fixed rows.
   * @param {boolean} onFixedColumn `true` if the coordinates point to a place within the fixed columns.
   * @param {number} elementOffset Offset position of the cell element.
   * @param {number} spreaderOffset Offset position of the spreader element.
   * @returns {{top: number, left: number}}
   */
  getRelativeCellPositionWithinHolder(onFixedRowTop, onFixedRowBottom, onFixedColumn, elementOffset, spreaderOffset) {
    const tableScrollPosition = {
      horizontal: this.wot.wtOverlays.inlineStartOverlay.getScrollPosition(),
      vertical: this.wot.wtOverlays.topOverlay.getScrollPosition()
    };
    let horizontalOffset = 0;
    let verticalOffset = 0;
    if (!onFixedColumn) {
      horizontalOffset = tableScrollPosition.horizontal - spreaderOffset.start;
    }
    if (onFixedRowBottom) {
      const absoluteRootElementPosition = this.wot.wtTable.wtRootElement.getBoundingClientRect(); // todo refactoring: DEMETER
      const absoluteOverlayPosition = this.clone.wtTable.TABLE.getBoundingClientRect(); // todo refactoring: DEMETER

      verticalOffset = absoluteOverlayPosition.top * -1 + absoluteRootElementPosition.top;
    } else if (!onFixedRowTop) {
      verticalOffset = tableScrollPosition.vertical - spreaderOffset.top;
    }
    return {
      start: elementOffset.start - horizontalOffset,
      top: elementOffset.top - verticalOffset
    };
  }

  /**
   * Make a clone of table for overlay.
   *
   * @returns {Clone}
   */
  makeClone() {
    if (_constants.CLONE_TYPES.indexOf(this.type) === -1) {
      throw new Error(`Clone type "${this.type}" is not supported.`);
    }
    const {
      wtTable,
      wtSettings
    } = this.wot;
    const {
      rootDocument,
      rootWindow
    } = this.domBindings;
    const clone = rootDocument.createElement('div');
    const clonedTable = rootDocument.createElement('table');
    const tableParent = wtTable.wtRootElement.parentNode;
    clone.className = `${_constants.CLONE_CLASS_NAMES.get(this.type)} handsontable`;
    clone.setAttribute('dir', this.isRtl() ? 'rtl' : 'ltr');
    clone.style.position = 'absolute';
    clone.style.top = 0;
    clone.style.overflow = 'visible';
    if (this.isRtl()) {
      clone.style.right = 0;
    } else {
      clone.style.left = 0;
    }
    if (wtSettings.getSetting('ariaTags')) {
      (0, _element.setAttribute)(clone, [(0, _a11y.A11Y_PRESENTATION)()]);
    }
    clonedTable.className = wtTable.TABLE.className;

    // Clone the main table's `role` attribute to the cloned table.
    const mainTableRole = wtTable.TABLE.getAttribute('role');
    if (mainTableRole) {
      clonedTable.setAttribute('role', wtTable.TABLE.getAttribute('role'));
    }
    clone.appendChild(clonedTable);
    tableParent.appendChild(clone);
    const preventOverflow = this.wtSettings.getSetting('preventOverflow');
    if (preventOverflow === true || preventOverflow === 'horizontal' && this.type === _constants.CLONE_TOP || preventOverflow === 'vertical' && this.type === _constants.CLONE_INLINE_START) {
      this.mainTableScrollableElement = rootWindow;
    } else if (rootWindow.getComputedStyle(tableParent).getPropertyValue('overflow') === 'hidden') {
      this.mainTableScrollableElement = wtTable.holder;
    } else {
      this.mainTableScrollableElement = (0, _element.getScrollableElement)(wtTable.TABLE);
    }

    // Create a new instance of the Walkontable class
    return new _clone.default(clonedTable, this.wtSettings, {
      // todo ioc factory
      source: this.wot,
      overlay: this,
      viewport: this.wot.wtViewport,
      // todo ioc , or factor func if used only here
      event: this.wot.wtEvent,
      // todo ioc , or factory func if used only here
      selectionManager: this.wot.selectionManager // todo ioc , or factory func if used only here
    });
  }

  /**
   * Refresh/Redraw overlay.
   *
   * @param {boolean} [fastDraw=false] When `true`, try to refresh only the positions of borders without rerendering
   *                                   the data. It will only work if Table.draw() does not force
   *                                   rendering anyway.
   */
  refresh() {
    let fastDraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    // When hot settings are changed we allow to refresh overlay once before blocking
    const nextCycleRenderFlag = this.shouldBeRendered();
    if (this.clone && (this.needFullRender || nextCycleRenderFlag)) {
      this.clone.draw(fastDraw);
    }
    this.needFullRender = nextCycleRenderFlag;
  }

  /**
   * Reset overlay styles to initial values.
   */
  reset() {
    if (!this.clone) {
      return;
    }
    const holder = this.clone.wtTable.holder; // todo refactoring: DEMETER
    const hider = this.clone.wtTable.hider; // todo refactoring: DEMETER
    const holderStyle = holder.style;
    const hiderStyle = hider.style;
    const rootStyle = holder.parentNode.style;
    (0, _array.arrayEach)([holderStyle, hiderStyle, rootStyle], style => {
      style.width = '';
      style.height = '';
    });
  }

  /**
   * Determine if Walkontable is running in RTL mode.
   *
   * @returns {boolean}
   */
  isRtl() {
    return this.wtSettings.getSetting('rtlMode');
  }

  /**
   * Destroy overlay instance.
   */
  destroy() {
    this.clone.eventManager.destroy(); // todo check if it is good place for that operation
  }
}
exports.Overlay = Overlay;