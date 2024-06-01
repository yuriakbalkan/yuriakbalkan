"use strict";

exports.__esModule = true;
var _element = require("../../../helpers/dom/element");
var _object = require("../../../helpers/object");
var _calculator = require("./calculator");
/**
 * @class Viewport
 */
class Viewport {
  /**
   * @param {ViewportDao} dataAccessObject The Walkontable instance.
   * @param {DomBindings} domBindings Bindings into DOM.
   * @param {Settings} wtSettings The Walkontable settings.
   * @param {EventManager} eventManager The instance event manager.
   * @param {Table} wtTable The table.
   */
  constructor(dataAccessObject, domBindings, wtSettings, eventManager, wtTable) {
    this.dataAccessObject = dataAccessObject;
    // legacy support
    this.wot = dataAccessObject.wot;
    this.instance = this.wot;
    this.domBindings = domBindings;
    this.wtSettings = wtSettings;
    this.wtTable = wtTable;
    this.oversizedRows = [];
    this.oversizedColumnHeaders = [];
    this.hasOversizedColumnHeadersMarked = {};
    this.clientHeight = 0;
    this.containerWidth = NaN;
    this.rowHeaderWidth = NaN;
    this.rowsVisibleCalculator = null;
    this.columnsVisibleCalculator = null;
    this.eventManager = eventManager;
    this.eventManager.addEventListener(this.domBindings.rootWindow, 'resize', () => {
      this.clientHeight = this.getWorkspaceHeight();
    });
  }

  /**
   * @returns {number}
   */
  getWorkspaceHeight() {
    const currentDocument = this.domBindings.rootDocument;
    const trimmingContainer = this.dataAccessObject.topOverlayTrimmingContainer;
    let height = 0;
    if (trimmingContainer === this.domBindings.rootWindow) {
      height = currentDocument.documentElement.clientHeight;
    } else {
      const elemHeight = (0, _element.outerHeight)(trimmingContainer);

      // returns height without DIV scrollbar
      height = elemHeight > 0 && trimmingContainer.clientHeight > 0 ? trimmingContainer.clientHeight : Infinity;
    }
    return height;
  }
  getWorkspaceWidth() {
    const {
      wtSettings
    } = this;
    const {
      rootDocument,
      rootWindow
    } = this.domBindings;
    const trimmingContainer = this.dataAccessObject.inlineStartOverlayTrimmingContainer;
    const docOffsetWidth = rootDocument.documentElement.offsetWidth;
    const totalColumns = wtSettings.getSetting('totalColumns');
    const preventOverflow = wtSettings.getSetting('preventOverflow');
    const isRtl = wtSettings.getSetting('rtlMode');
    const tableRect = this.wtTable.TABLE.getBoundingClientRect();
    const inlineStart = isRtl ? tableRect.right - docOffsetWidth : tableRect.left;
    const tableOffset = docOffsetWidth - inlineStart;
    let width;
    let overflow;
    if (preventOverflow) {
      return (0, _element.outerWidth)(this.wtTable.wtRootElement);
    }
    if (wtSettings.getSetting('freezeOverlays')) {
      width = Math.min(tableOffset, docOffsetWidth);
    } else {
      width = Math.min(this.getContainerFillWidth(), tableOffset, docOffsetWidth);
    }
    if (trimmingContainer === rootWindow && totalColumns > 0 && this.sumColumnWidths(0, totalColumns - 1) > width) {
      // in case sum of column widths is higher than available stylesheet width, let's assume using the whole window
      // otherwise continue below, which will allow stretching
      // this is used in `scroll_window.html`
      // TODO test me
      return rootDocument.documentElement.clientWidth;
    }
    if (trimmingContainer !== rootWindow) {
      overflow = (0, _element.getStyle)(this.dataAccessObject.inlineStartOverlayTrimmingContainer, 'overflow', rootWindow);
      if (overflow === 'scroll' || overflow === 'hidden' || overflow === 'auto') {
        // this is used in `scroll.html`
        // TODO test me
        return Math.max(width, trimmingContainer.clientWidth);
      }
    }
    const stretchSetting = wtSettings.getSetting('stretchH');
    if (stretchSetting === 'none' || !stretchSetting) {
      // if no stretching is used, return the maximum used workspace width
      return Math.max(width, (0, _element.outerWidth)(this.wtTable.TABLE));
    }

    // if stretching is used, return the actual container width, so the columns can fit inside it
    return width;
  }

  /**
   * Checks if viewport has vertical scroll.
   *
   * @returns {boolean}
   */
  hasVerticalScroll() {
    return this.wtTable.hider.offsetHeight > this.getWorkspaceHeight();
  }

  /**
   * Checks if viewport has horizontal scroll.
   *
   * @returns {boolean}
   */
  hasHorizontalScroll() {
    return this.wtTable.hider.offsetWidth > this.getWorkspaceWidth();
  }

  /**
   * @param {number} from The visual column index from the width sum is start calculated.
   * @param {number} length The length of the column to traverse.
   * @returns {number}
   */
  sumColumnWidths(from, length) {
    let sum = 0;
    let column = from;
    while (column < length) {
      sum += this.wtTable.getColumnWidth(column);
      column += 1;
    }
    return sum;
  }

  /**
   * @returns {number}
   */
  getContainerFillWidth() {
    if (this.containerWidth) {
      return this.containerWidth;
    }
    const mainContainer = this.wtTable.holder;
    const dummyElement = this.domBindings.rootDocument.createElement('div');
    dummyElement.style.width = '100%';
    dummyElement.style.height = '1px';
    mainContainer.appendChild(dummyElement);
    const fillWidth = dummyElement.offsetWidth;
    this.containerWidth = fillWidth;
    mainContainer.removeChild(dummyElement);
    return fillWidth;
  }

  /**
   * @returns {number}
   */
  getWorkspaceOffset() {
    return (0, _element.offset)(this.wtTable.TABLE);
  }

  /**
   * @returns {number}
   */
  getColumnHeaderHeight() {
    const columnHeaders = this.wtSettings.getSetting('columnHeaders');
    if (!columnHeaders.length) {
      this.columnHeaderHeight = 0;
    } else if (isNaN(this.columnHeaderHeight)) {
      this.columnHeaderHeight = (0, _element.outerHeight)(this.wtTable.THEAD);
    }
    return this.columnHeaderHeight;
  }

  /**
   * @returns {number}
   */
  getViewportHeight() {
    let containerHeight = this.getWorkspaceHeight();
    if (containerHeight === Infinity) {
      return containerHeight;
    }
    const columnHeaderHeight = this.getColumnHeaderHeight();
    if (columnHeaderHeight > 0) {
      containerHeight -= columnHeaderHeight;
    }
    return containerHeight;
  }

  /**
   * @returns {number}
   */
  getRowHeaderWidth() {
    const rowHeadersWidthSetting = this.wtSettings.getSetting('rowHeaderWidth');
    const rowHeaders = this.wtSettings.getSetting('rowHeaders');
    if (rowHeadersWidthSetting) {
      this.rowHeaderWidth = 0;
      for (let i = 0, len = rowHeaders.length; i < len; i++) {
        this.rowHeaderWidth += rowHeadersWidthSetting[i] || rowHeadersWidthSetting;
      }
    }
    if (isNaN(this.rowHeaderWidth)) {
      if (rowHeaders.length) {
        let TH = this.wtTable.TABLE.querySelector('TH');
        this.rowHeaderWidth = 0;
        for (let i = 0, len = rowHeaders.length; i < len; i++) {
          if (TH) {
            this.rowHeaderWidth += (0, _element.outerWidth)(TH);
            TH = TH.nextSibling;
          } else {
            // yes this is a cheat but it worked like that before, just taking assumption from CSS instead of measuring.
            // TODO: proper fix
            this.rowHeaderWidth += 50;
          }
        }
      } else {
        this.rowHeaderWidth = 0;
      }
    }
    this.rowHeaderWidth = this.wtSettings.getSetting('onModifyRowHeaderWidth', this.rowHeaderWidth) || this.rowHeaderWidth;
    return this.rowHeaderWidth;
  }

  /**
   * @returns {number}
   */
  getViewportWidth() {
    const containerWidth = this.getWorkspaceWidth();
    if (containerWidth === Infinity) {
      return containerWidth;
    }
    const rowHeaderWidth = this.getRowHeaderWidth();
    if (rowHeaderWidth > 0) {
      return containerWidth - rowHeaderWidth;
    }
    return containerWidth;
  }

  /**
   * Creates:
   * - rowsRenderCalculator (before draw, to qualify rows for rendering)
   * - rowsVisibleCalculator (after draw, to measure which rows are actually visible).
   *
   * @param {number} calculationType The render type ID, which determines for what type of
   *                                 calculation calculator is created.
   * @returns {ViewportRowsCalculator}
   */
  createRowsCalculator() {
    let calculationType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _calculator.RENDER_TYPE;
    const {
      wtSettings,
      wtTable
    } = this;
    if (wtSettings.getSetting('renderAllRows') && calculationType === _calculator.RENDER_TYPE) {
      return new _calculator.RenderAllRowsCalculator({
        totalRows: wtSettings.getSetting('totalRows')
      });
    }
    let height = this.getViewportHeight();
    let scrollbarHeight;
    let fixedRowsHeight;
    this.rowHeaderWidth = NaN;
    let pos = this.dataAccessObject.topScrollPosition - this.dataAccessObject.topParentOffset;
    const fixedRowsTop = wtSettings.getSetting('fixedRowsTop');
    const fixedRowsBottom = wtSettings.getSetting('fixedRowsBottom');
    const totalRows = wtSettings.getSetting('totalRows');
    if (fixedRowsTop && pos >= 0) {
      fixedRowsHeight = this.dataAccessObject.topOverlay.sumCellSizes(0, fixedRowsTop);
      pos += fixedRowsHeight;
      height -= fixedRowsHeight;
    }
    if (fixedRowsBottom && this.dataAccessObject.bottomOverlay.clone) {
      fixedRowsHeight = this.dataAccessObject.bottomOverlay.sumCellSizes(totalRows - fixedRowsBottom, totalRows);
      height -= fixedRowsHeight;
    }
    if (wtTable.holder.clientHeight === wtTable.holder.offsetHeight) {
      scrollbarHeight = 0;
    } else {
      scrollbarHeight = (0, _element.getScrollbarWidth)(this.domBindings.rootDocument);
    }
    return new _calculator.ViewportRowsCalculator({
      viewportHeight: height,
      scrollOffset: pos,
      totalRows: wtSettings.getSetting('totalRows'),
      rowHeightFn: sourceRow => wtTable.getRowHeight(sourceRow),
      overrideFn: wtSettings.getSettingPure('viewportRowCalculatorOverride'),
      calculationType,
      horizontalScrollbarHeight: scrollbarHeight
    });
  }

  /**
   * Creates:
   * - columnsRenderCalculator (before draw, to qualify columns for rendering)
   * - columnsVisibleCalculator (after draw, to measure which columns are actually visible).
   *
   * @param {number} calculationType The render type ID, which determines for what type of
   *                                 calculation calculator is created.
   * @returns {ViewportColumnsCalculator}
   */
  createColumnsCalculator() {
    let calculationType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _calculator.RENDER_TYPE;
    const {
      wtSettings,
      wtTable
    } = this;
    if (wtSettings.getSetting('renderAllColumns') && calculationType === _calculator.RENDER_TYPE) {
      return new _calculator.RenderAllColumnsCalculator({
        totalColumns: wtSettings.getSetting('totalColumns')
      });
    }
    let width = this.getViewportWidth();
    let pos = Math.abs(this.dataAccessObject.inlineStartScrollPosition) - this.dataAccessObject.inlineStartParentOffset;
    this.columnHeaderHeight = NaN;
    const fixedColumnsStart = wtSettings.getSetting('fixedColumnsStart');
    if (fixedColumnsStart && pos >= 0) {
      const fixedColumnsWidth = this.dataAccessObject.inlineStartOverlay.sumCellSizes(0, fixedColumnsStart);
      pos += fixedColumnsWidth;
      width -= fixedColumnsWidth;
    }
    if (wtTable.holder.clientWidth !== wtTable.holder.offsetWidth) {
      width -= (0, _element.getScrollbarWidth)(this.domBindings.rootDocument);
    }
    return new _calculator.ViewportColumnsCalculator({
      viewportWidth: width,
      scrollOffset: pos,
      totalColumns: wtSettings.getSetting('totalColumns'),
      columnWidthFn: sourceCol => wtTable.getColumnWidth(sourceCol),
      overrideFn: wtSettings.getSettingPure('viewportColumnCalculatorOverride'),
      calculationType,
      inlineStartOffset: this.dataAccessObject.inlineStartParentOffset
    });
  }

  /**
   * Creates rowsRenderCalculator and columnsRenderCalculator (before draw, to determine what rows and
   * cols should be rendered).
   *
   * @param {boolean} fastDraw If `true`, will try to avoid full redraw and only update the border positions.
   *                           If `false` or `undefined`, will perform a full redraw.
   * @returns {boolean} The fastDraw value, possibly modified.
   */
  createRenderCalculators() {
    let fastDraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    const {
      wtSettings
    } = this;
    if (fastDraw && !wtSettings.getSetting('renderAllRows')) {
      const proposedRowsVisibleCalculator = this.createRowsCalculator(_calculator.FULLY_VISIBLE_TYPE);
      fastDraw = this.areAllProposedVisibleRowsAlreadyRendered(proposedRowsVisibleCalculator);
    }
    if (fastDraw && !wtSettings.getSetting('renderAllColumns')) {
      const proposedColumnsVisibleCalculator = this.createColumnsCalculator(_calculator.FULLY_VISIBLE_TYPE);
      fastDraw = this.areAllProposedVisibleColumnsAlreadyRendered(proposedColumnsVisibleCalculator);
    }
    if (!fastDraw) {
      this.rowsRenderCalculator = this.createRowsCalculator(_calculator.RENDER_TYPE);
      this.columnsRenderCalculator = this.createColumnsCalculator(_calculator.RENDER_TYPE);
    }

    // delete temporarily to make sure that renderers always use rowsRenderCalculator, not rowsVisibleCalculator
    this.rowsVisibleCalculator = null;
    this.columnsVisibleCalculator = null;
    return fastDraw;
  }

  /**
   * Creates rowsVisibleCalculator and columnsVisibleCalculator (after draw, to determine what are
   * the actually fully visible rows and columns).
   */
  createVisibleCalculators() {
    this.rowsVisibleCalculator = this.createRowsCalculator(_calculator.FULLY_VISIBLE_TYPE);
    this.columnsVisibleCalculator = this.createColumnsCalculator(_calculator.FULLY_VISIBLE_TYPE);
  }

  /**
   * Creates rowsPartiallyVisibleCalculator and columnsPartiallyVisibleCalculator (after draw, to determine what are
   * the actually partially visible rows and columns).
   */
  createPartiallyVisibleCalculators() {
    this.rowsPartiallyVisibleCalculator = this.createRowsCalculator(_calculator.PARTIALLY_VISIBLE_TYPE);
    this.columnsPartiallyVisibleCalculator = this.createColumnsCalculator(_calculator.PARTIALLY_VISIBLE_TYPE);
  }

  /**
   * Returns information whether proposedRowsVisibleCalculator viewport
   * is contained inside rows rendered in previous draw (cached in rowsRenderCalculator).
   *
   * @param {ViewportRowsCalculator} proposedRowsVisibleCalculator The instance of the viewport calculator to compare with.
   * @returns {boolean} Returns `true` if all proposed visible rows are already rendered (meaning: redraw is not needed).
   *                    Returns `false` if at least one proposed visible row is not already rendered (meaning: redraw is needed).
   */
  areAllProposedVisibleRowsAlreadyRendered(proposedRowsVisibleCalculator) {
    if (!this.rowsVisibleCalculator) {
      return false;
    }
    const {
      startRow,
      endRow,
      isVisibleInTrimmingContainer
    } = proposedRowsVisibleCalculator;

    // if there are no fully visible rows at all, return false
    if (startRow === null && endRow === null) {
      return !isVisibleInTrimmingContainer;
    }
    const {
      startRow: renderedStartRow,
      endRow: renderedEndRow
    } = this.rowsRenderCalculator;
    if (startRow < renderedStartRow || startRow === renderedStartRow && startRow > 0) {
      return false;
    } else if (endRow > renderedEndRow || endRow === renderedEndRow && endRow < this.wtSettings.getSetting('totalRows') - 1) {
      return false;
    }
    return true;
  }

  /**
   * Returns information whether proposedColumnsVisibleCalculator viewport
   * is contained inside column rendered in previous draw (cached in columnsRenderCalculator).
   *
   * @param {ViewportRowsCalculator} proposedColumnsVisibleCalculator The instance of the viewport calculator to compare with.
   * @returns {boolean} Returns `true` if all proposed visible columns are already rendered (meaning: redraw is not needed).
   *                    Returns `false` if at least one proposed visible column is not already rendered (meaning: redraw is needed).
   */
  areAllProposedVisibleColumnsAlreadyRendered(proposedColumnsVisibleCalculator) {
    if (!this.columnsVisibleCalculator) {
      return false;
    }
    const {
      startColumn,
      endColumn,
      isVisibleInTrimmingContainer
    } = proposedColumnsVisibleCalculator;

    // if there are no fully visible columns at all, return false
    if (startColumn === null && endColumn === null) {
      return !isVisibleInTrimmingContainer;
    }
    const {
      startColumn: renderedStartColumn,
      endColumn: renderedEndColumn
    } = this.columnsRenderCalculator;
    if (startColumn < renderedStartColumn || startColumn === renderedStartColumn && startColumn > 0) {
      return false;
    } else if (endColumn > renderedEndColumn || endColumn === renderedEndColumn && endColumn < this.wtSettings.getSetting('totalColumns') - 1) {
      return false;
    }
    return true;
  }

  /**
   * Resets values in keys of the hasOversizedColumnHeadersMarked object after updateSettings.
   */
  resetHasOversizedColumnHeadersMarked() {
    (0, _object.objectEach)(this.hasOversizedColumnHeadersMarked, (value, key, object) => {
      object[key] = undefined;
    });
  }
}
var _default = exports.default = Viewport;