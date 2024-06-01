"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
var _highlight = _interopRequireWildcard(require("./highlight/highlight"));
var _range = _interopRequireDefault(require("./range"));
var _object = require("./../helpers/object");
var _mixed = require("./../helpers/mixed");
var _number = require("./../helpers/number");
var _array = require("./../helpers/array");
var _localHooks = _interopRequireDefault(require("./../mixins/localHooks"));
var _transformation2 = _interopRequireDefault(require("./transformation"));
var _utils = require("./utils");
var _templateLiteralTag = require("./../helpers/templateLiteralTag");
var _a11y = require("../helpers/a11y");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
/**
 * @class Selection
 * @util
 */
var _transformation = /*#__PURE__*/new WeakMap();
var _focusTransformation = /*#__PURE__*/new WeakMap();
var _isFocusSelectionChanged = /*#__PURE__*/new WeakMap();
var _disableHeadersHighlight = /*#__PURE__*/new WeakMap();
var _selectionSource = /*#__PURE__*/new WeakMap();
var _expectedLayersCount = /*#__PURE__*/new WeakMap();
class Selection {
  constructor(settings, tableProps) {
    var _this = this;
    /**
     * Handsontable settings instance.
     *
     * @type {GridSettings}
     */
    _defineProperty(this, "settings", void 0);
    /**
     * An additional object with dynamically defined properties which describes table state.
     *
     * @type {object}
     */
    _defineProperty(this, "tableProps", void 0);
    /**
     * The flag which determines if the selection is in progress.
     *
     * @type {boolean}
     */
    _defineProperty(this, "inProgress", false);
    /**
     * Selection data layer (handle visual coordinates).
     *
     * @type {SelectionRange}
     */
    _defineProperty(this, "selectedRange", new _range.default((highlight, from, to) => {
      return this.tableProps.createCellRange(highlight, from, to);
    }));
    /**
     * Visualization layer.
     *
     * @type {Highlight}
     */
    _defineProperty(this, "highlight", void 0);
    /**
     * The module for modifying coordinates of the start and end selection.
     *
     * @type {Transformation}
     */
    _classPrivateFieldInitSpec(this, _transformation, void 0);
    /**
     * The module for modifying coordinates of the focus selection.
     *
     * @type {Transformation}
     */
    _classPrivateFieldInitSpec(this, _focusTransformation, void 0);
    /**
     * The collection of the selection layer levels where the whole row was selected using the row header or
     * the corner header.
     *
     * @type {Set<number>}
     */
    _defineProperty(this, "selectedByRowHeader", new Set());
    /**
     * The collection of the selection layer levels where the whole column was selected using the column header or
     * the corner header.
     *
     * @type {Set<number>}
     */
    _defineProperty(this, "selectedByColumnHeader", new Set());
    /**
     * The flag which determines if the focus selection was changed.
     *
     * @type {boolean}
     */
    _classPrivateFieldInitSpec(this, _isFocusSelectionChanged, false);
    /**
     * When sets disable highlighting the headers even when the logical coordinates points on them.
     *
     * @type {boolean}
     */
    _classPrivateFieldInitSpec(this, _disableHeadersHighlight, false);
    /**
     * The source of the selection. It can be one of the following values: `mouse`, `unknown` or any other string.
     *
     * @type {'mouse' | 'unknown' | string}
     */
    _classPrivateFieldInitSpec(this, _selectionSource, 'unknown');
    /**
     * The number of expected layers. It is used mostly to track when the last selection layer of non-contiguous
     * selection is applied, thus the viewport scroll is triggered.
     *
     * @param {number}
     */
    _classPrivateFieldInitSpec(this, _expectedLayersCount, -1);
    this.settings = settings;
    this.tableProps = tableProps;
    this.highlight = new _highlight.default({
      headerClassName: settings.currentHeaderClassName,
      activeHeaderClassName: settings.activeHeaderClassName,
      rowClassName: settings.currentRowClassName,
      columnClassName: settings.currentColClassName,
      cellAttributes: [(0, _a11y.A11Y_SELECTED)()],
      rowIndexMapper: this.tableProps.rowIndexMapper,
      columnIndexMapper: this.tableProps.columnIndexMapper,
      disabledCellSelection: (row, column) => this.tableProps.isDisabledCellSelection(row, column),
      cellCornerVisible: function () {
        return _this.isCellCornerVisible(...arguments);
      },
      areaCornerVisible: function () {
        return _this.isAreaCornerVisible(...arguments);
      },
      visualToRenderableCoords: coords => this.tableProps.visualToRenderableCoords(coords),
      renderableToVisualCoords: coords => this.tableProps.renderableToVisualCoords(coords),
      createCellCoords: (row, column) => this.tableProps.createCellCoords(row, column),
      createCellRange: (highlight, from, to) => this.tableProps.createCellRange(highlight, from, to)
    });
    _classPrivateFieldSet(_transformation, this, new _transformation2.default(this.selectedRange, {
      rowIndexMapper: this.tableProps.rowIndexMapper,
      columnIndexMapper: this.tableProps.columnIndexMapper,
      countRenderableRows: () => this.tableProps.countRenderableRows(),
      countRenderableColumns: () => this.tableProps.countRenderableColumns(),
      visualToRenderableCoords: coords => this.tableProps.visualToRenderableCoords(coords),
      renderableToVisualCoords: coords => this.tableProps.renderableToVisualCoords(coords),
      findFirstNonHiddenRenderableRow: function () {
        return _this.tableProps.findFirstNonHiddenRenderableRow(...arguments);
      },
      findFirstNonHiddenRenderableColumn: function () {
        return _this.tableProps.findFirstNonHiddenRenderableColumn(...arguments);
      },
      createCellCoords: (row, column) => this.tableProps.createCellCoords(row, column),
      fixedRowsBottom: () => settings.fixedRowsBottom,
      minSpareRows: () => settings.minSpareRows,
      minSpareCols: () => settings.minSpareCols,
      autoWrapRow: () => settings.autoWrapRow,
      autoWrapCol: () => settings.autoWrapCol
    }));
    _classPrivateFieldSet(_focusTransformation, this, new _transformation2.default(this.selectedRange, {
      rowIndexMapper: this.tableProps.rowIndexMapper,
      columnIndexMapper: this.tableProps.columnIndexMapper,
      countRenderableRows: () => {
        const range = this.selectedRange.current();
        return this.tableProps.countRenderableRowsInRange(0, range.getOuterBottomEndCorner().row);
      },
      countRenderableColumns: () => {
        const range = this.selectedRange.current();
        return this.tableProps.countRenderableColumnsInRange(0, range.getOuterBottomEndCorner().col);
      },
      visualToRenderableCoords: coords => this.tableProps.visualToRenderableCoords(coords),
      renderableToVisualCoords: coords => this.tableProps.renderableToVisualCoords(coords),
      findFirstNonHiddenRenderableRow: function () {
        return _this.tableProps.findFirstNonHiddenRenderableRow(...arguments);
      },
      findFirstNonHiddenRenderableColumn: function () {
        return _this.tableProps.findFirstNonHiddenRenderableColumn(...arguments);
      },
      createCellCoords: (row, column) => this.tableProps.createCellCoords(row, column),
      fixedRowsBottom: () => 0,
      minSpareRows: () => 0,
      minSpareCols: () => 0,
      autoWrapRow: () => true,
      autoWrapCol: () => true
    }));
    _classPrivateFieldGet(_transformation, this).addLocalHook('beforeTransformStart', function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return _this.runLocalHooks('beforeModifyTransformStart', ...args);
    });
    _classPrivateFieldGet(_transformation, this).addLocalHook('afterTransformStart', function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return _this.runLocalHooks('afterModifyTransformStart', ...args);
    });
    _classPrivateFieldGet(_transformation, this).addLocalHook('beforeTransformEnd', function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      return _this.runLocalHooks('beforeModifyTransformEnd', ...args);
    });
    _classPrivateFieldGet(_transformation, this).addLocalHook('afterTransformEnd', function () {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      return _this.runLocalHooks('afterModifyTransformEnd', ...args);
    });
    _classPrivateFieldGet(_transformation, this).addLocalHook('insertRowRequire', function () {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }
      return _this.runLocalHooks('insertRowRequire', ...args);
    });
    _classPrivateFieldGet(_transformation, this).addLocalHook('insertColRequire', function () {
      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }
      return _this.runLocalHooks('insertColRequire', ...args);
    });
    _classPrivateFieldGet(_transformation, this).addLocalHook('beforeRowWrap', function () {
      for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }
      return _this.runLocalHooks('beforeRowWrap', ...args);
    });
    _classPrivateFieldGet(_transformation, this).addLocalHook('beforeColumnWrap', function () {
      for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }
      return _this.runLocalHooks('beforeColumnWrap', ...args);
    });
    _classPrivateFieldGet(_focusTransformation, this).addLocalHook('beforeTransformStart', function () {
      for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
      }
      return _this.runLocalHooks('beforeModifyTransformFocus', ...args);
    });
    _classPrivateFieldGet(_focusTransformation, this).addLocalHook('afterTransformStart', function () {
      for (var _len10 = arguments.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }
      return _this.runLocalHooks('afterModifyTransformFocus', ...args);
    });
  }

  /**
   * Get data layer for current selection.
   *
   * @returns {SelectionRange}
   */
  getSelectedRange() {
    return this.selectedRange;
  }

  /**
   * Marks the source of the selection. It can be one of the following values: `mouse`, or any other string.
   *
   * @param {'mouse' | 'unknown' | string} sourceName The source name.
   */
  markSource(sourceName) {
    _classPrivateFieldSet(_selectionSource, this, sourceName);
  }

  /**
   * Marks end of the selection source. It restores the selection source to default value which is 'unknown'.
   */
  markEndSource() {
    _classPrivateFieldSet(_selectionSource, this, 'unknown');
  }

  /**
   * Returns the source of the selection.
   *
   * @returns {'mouse' | 'unknown' | string}
   */
  getSelectionSource() {
    return _classPrivateFieldGet(_selectionSource, this);
  }

  /**
   * Set the number of expected layers. The method is not obligatory to call. It is used mostly internally
   * to determine when the last selection layer of non-contiguous is applied, thus the viewport scroll is triggered.
   *
   * @param {number} layersCount The number of expected layers.
   */
  setExpectedLayers(layersCount) {
    _classPrivateFieldSet(_expectedLayersCount, this, layersCount);
  }

  /**
   * Indicate that selection process began. It sets internally `.inProgress` property to `true`.
   */
  begin() {
    this.inProgress = true;
  }

  /**
   * Indicate that selection process finished. It sets internally `.inProgress` property to `false`.
   */
  finish() {
    this.runLocalHooks('afterSelectionFinished', Array.from(this.selectedRange));
    this.inProgress = false;
    _classPrivateFieldSet(_expectedLayersCount, this, -1);
  }

  /**
   * Check if the process of selecting the cell/cells is in progress.
   *
   * @returns {boolean}
   */
  isInProgress() {
    return this.inProgress;
  }

  /**
   * Starts selection range on given coordinate object.
   *
   * @param {CellCoords} coords Visual coords.
   * @param {boolean} [multipleSelection] If `true`, selection will be worked in 'multiple' mode. This option works
   *                                      only when 'selectionMode' is set as 'multiple'. If the argument is not defined
   *                                      the default trigger will be used.
   * @param {boolean} [fragment=false] If `true`, the selection will be treated as a partial selection where the
   *                                   `setRangeEnd` method won't be called on every `setRangeStart` call.
   * @param {CellCoords} [highlightCoords] If set, allows changing the coordinates of the highlight/focus cell.
   */
  setRangeStart(coords, multipleSelection) {
    let fragment = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let highlightCoords = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : coords;
    const isMultipleMode = this.settings.selectionMode === 'multiple';
    const isMultipleSelection = (0, _mixed.isUndefined)(multipleSelection) ? this.tableProps.getShortcutManager().isCtrlPressed() : multipleSelection;
    // We are creating copy. We would like to modify just the start of the selection by below hook. Then original coords
    // should be handled by next methods.
    const coordsClone = coords.clone();
    _classPrivateFieldSet(_isFocusSelectionChanged, this, false);
    this.runLocalHooks(`beforeSetRangeStart${fragment ? 'Only' : ''}`, coordsClone);
    if (!isMultipleMode || isMultipleMode && !isMultipleSelection && (0, _mixed.isUndefined)(multipleSelection)) {
      this.selectedRange.clear();
    }
    this.selectedRange.add(coordsClone).current().setHighlight(highlightCoords.clone());
    if (this.getLayerLevel() === 0) {
      this.selectedByRowHeader.clear();
      this.selectedByColumnHeader.clear();
    }
    if (!fragment) {
      this.setRangeEnd(coords);
    }
  }

  /**
   * Starts selection range on given coordinate object.
   *
   * @param {CellCoords} coords Visual coords.
   * @param {boolean} [multipleSelection] If `true`, selection will be worked in 'multiple' mode. This option works
   *                                      only when 'selectionMode' is set as 'multiple'. If the argument is not defined
   *                                      the default trigger will be used.
   * @param {CellCoords} [highlightCoords] If set, allows changing the coordinates of the highlight/focus cell.
   */
  setRangeStartOnly(coords, multipleSelection) {
    let highlightCoords = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : coords;
    this.setRangeStart(coords, multipleSelection, true, highlightCoords);
  }

  /**
   * Ends selection range on given coordinate object.
   *
   * @param {CellCoords} coords Visual coords.
   */
  setRangeEnd(coords) {
    if (this.selectedRange.isEmpty()) {
      return;
    }
    const coordsClone = coords.clone();
    const countRows = this.tableProps.countRows();
    const countCols = this.tableProps.countCols();
    const isSingle = this.selectedRange.current().clone().setTo(coords).isSingleHeader();

    // Ignore processing the end range when the header selection starts overlapping the corner and
    // the selection is not a single header highlight.
    if ((countRows > 0 || countCols > 0) && (countRows === 0 && coordsClone.col < 0 && !isSingle || countCols === 0 && coordsClone.row < 0 && !isSingle)) {
      return;
    }
    this.runLocalHooks('beforeSetRangeEnd', coordsClone);
    this.begin();
    const cellRange = this.selectedRange.current();
    if (!this.settings.navigableHeaders) {
      cellRange.highlight.normalize();
    }
    if (this.settings.selectionMode === 'single') {
      cellRange.setFrom(cellRange.highlight);
      cellRange.setTo(cellRange.highlight);
    } else {
      const horizontalDir = cellRange.getHorizontalDirection();
      const verticalDir = cellRange.getVerticalDirection();
      const isMultiple = this.isMultiple();
      cellRange.setTo(coordsClone);
      if (isMultiple && (horizontalDir !== cellRange.getHorizontalDirection() || cellRange.getWidth() === 1 && !cellRange.includes(cellRange.highlight))) {
        cellRange.from.assign({
          col: cellRange.highlight.col
        });
      }
      if (isMultiple && (verticalDir !== cellRange.getVerticalDirection() || cellRange.getHeight() === 1 && !cellRange.includes(cellRange.highlight))) {
        cellRange.from.assign({
          row: cellRange.highlight.row
        });
      }
    }

    // Prevent creating "area" selection that overlaps headers.
    if (countRows > 0 && countCols > 0) {
      if (!this.settings.navigableHeaders || this.settings.navigableHeaders && !cellRange.isSingleHeader()) {
        cellRange.to.normalize();
      }
    }
    this.runLocalHooks('beforeHighlightSet');
    this.setRangeFocus(this.selectedRange.current().highlight);
    const layerLevel = this.getLayerLevel();

    // If the next layer level is lower than previous then clear all area and header highlights. This is the
    // indication that the new selection is performing.
    if (layerLevel < this.highlight.layerLevel) {
      (0, _array.arrayEach)(this.highlight.getAreas(), highlight => void highlight.clear());
      (0, _array.arrayEach)(this.highlight.getLayeredAreas(), highlight => void highlight.clear());
      (0, _array.arrayEach)(this.highlight.getRowHeaders(), highlight => void highlight.clear());
      (0, _array.arrayEach)(this.highlight.getColumnHeaders(), highlight => void highlight.clear());
      (0, _array.arrayEach)(this.highlight.getActiveRowHeaders(), highlight => void highlight.clear());
      (0, _array.arrayEach)(this.highlight.getActiveColumnHeaders(), highlight => void highlight.clear());
      (0, _array.arrayEach)(this.highlight.getActiveCornerHeaders(), highlight => void highlight.clear());
      (0, _array.arrayEach)(this.highlight.getRowHighlights(), highlight => void highlight.clear());
      (0, _array.arrayEach)(this.highlight.getColumnHighlights(), highlight => void highlight.clear());
    }
    this.highlight.useLayerLevel(layerLevel);
    const areaHighlight = this.highlight.createArea();
    const layeredAreaHighlight = this.highlight.createLayeredArea();
    const rowHeaderHighlight = this.highlight.createRowHeader();
    const columnHeaderHighlight = this.highlight.createColumnHeader();
    const activeRowHeaderHighlight = this.highlight.createActiveRowHeader();
    const activeColumnHeaderHighlight = this.highlight.createActiveColumnHeader();
    const activeCornerHeaderHighlight = this.highlight.createActiveCornerHeader();
    const rowHighlight = this.highlight.createRowHighlight();
    const columnHighlight = this.highlight.createColumnHighlight();
    areaHighlight.clear();
    layeredAreaHighlight.clear();
    rowHeaderHighlight.clear();
    columnHeaderHighlight.clear();
    activeRowHeaderHighlight.clear();
    activeColumnHeaderHighlight.clear();
    activeCornerHeaderHighlight.clear();
    rowHighlight.clear();
    columnHighlight.clear();
    if (this.highlight.isEnabledFor(_highlight.AREA_TYPE, cellRange.highlight) && (this.isMultiple() || layerLevel >= 1)) {
      areaHighlight.add(cellRange.from).add(cellRange.to).commit();
      layeredAreaHighlight.add(cellRange.from).add(cellRange.to).commit();
      if (layerLevel === 1) {
        // For single cell selection in the same layer, we do not create area selection to prevent blue background.
        // When non-consecutive selection is performed we have to add that missing area selection to the previous layer
        // based on previous coordinates. It only occurs when the previous selection wasn't select multiple cells.
        const previousRange = this.selectedRange.previous();
        this.highlight.useLayerLevel(layerLevel - 1);
        this.highlight.createArea().add(previousRange.from).commit()
        // Range may start with hidden indexes. Commit would not found start point (as we add just the `from` coords).
        .syncWith(previousRange);
        this.highlight.createLayeredArea().add(previousRange.from).commit()
        // Range may start with hidden indexes. Commit would not found start point (as we add just the `from` coords).
        .syncWith(previousRange);
        this.highlight.useLayerLevel(layerLevel);
      }
    }
    if (this.highlight.isEnabledFor(_highlight.HEADER_TYPE, cellRange.highlight)) {
      if (!cellRange.isSingleHeader()) {
        const rowCoordsFrom = this.tableProps.createCellCoords(Math.max(cellRange.from.row, 0), -1);
        const rowCoordsTo = this.tableProps.createCellCoords(cellRange.to.row, -1);
        const columnCoordsFrom = this.tableProps.createCellCoords(-1, Math.max(cellRange.from.col, 0));
        const columnCoordsTo = this.tableProps.createCellCoords(-1, cellRange.to.col);
        if (this.settings.selectionMode === 'single') {
          rowHeaderHighlight.add(rowCoordsFrom).commit();
          columnHeaderHighlight.add(columnCoordsFrom).commit();
          rowHighlight.add(rowCoordsFrom).commit();
          columnHighlight.add(columnCoordsFrom).commit();
        } else {
          rowHeaderHighlight.add(rowCoordsFrom).add(rowCoordsTo).commit();
          columnHeaderHighlight.add(columnCoordsFrom).add(columnCoordsTo).commit();
          rowHighlight.add(rowCoordsFrom).add(rowCoordsTo).commit();
          columnHighlight.add(columnCoordsFrom).add(columnCoordsTo).commit();
        }
      }
      const highlightRowHeaders = !_classPrivateFieldGet(_disableHeadersHighlight, this) && this.isEntireRowSelected() && (countCols > 0 && countCols === cellRange.getWidth() || countCols === 0 && this.isSelectedByRowHeader());
      const highlightColumnHeaders = !_classPrivateFieldGet(_disableHeadersHighlight, this) && this.isEntireColumnSelected() && (countRows > 0 && countRows === cellRange.getHeight() || countRows === 0 && this.isSelectedByColumnHeader());
      if (highlightRowHeaders) {
        activeRowHeaderHighlight.add(this.tableProps.createCellCoords(Math.max(cellRange.from.row, 0), Math.min(-this.tableProps.countRowHeaders(), -1))).add(this.tableProps.createCellCoords(Math.max(cellRange.to.row, 0), -1)).commit();
      }
      if (highlightColumnHeaders) {
        activeColumnHeaderHighlight.add(this.tableProps.createCellCoords(Math.min(-this.tableProps.countColHeaders(), -1), Math.max(cellRange.from.col, 0))).add(this.tableProps.createCellCoords(-1, Math.max(cellRange.to.col, 0))).commit();
      }
      if (highlightRowHeaders && highlightColumnHeaders) {
        activeCornerHeaderHighlight.add(this.tableProps.createCellCoords(-this.tableProps.countColHeaders(), -this.tableProps.countRowHeaders())).add(this.tableProps.createCellCoords(-1, -1)).commit();
      }
    }
    const isLastLayer = _classPrivateFieldGet(_expectedLayersCount, this) === -1 || this.selectedRange.size() === _classPrivateFieldGet(_expectedLayersCount, this);
    this.runLocalHooks('afterSetRangeEnd', coords, isLastLayer);
  }

  /**
   * Sets the selection focus position at the specified coordinates.
   *
   * @param {CellCoords} coords The CellCoords instance with defined visual coordinates.
   */
  setRangeFocus(coords) {
    if (this.selectedRange.isEmpty()) {
      return;
    }
    const cellRange = this.selectedRange.current();
    if (!this.inProgress) {
      this.runLocalHooks('beforeSetFocus', coords);
    }
    const focusHighlight = this.highlight.getFocus();
    focusHighlight.clear();
    cellRange.setHighlight(coords);
    if (!this.inProgress) {
      this.runLocalHooks('beforeHighlightSet');
    }
    if (this.highlight.isEnabledFor(_highlight.FOCUS_TYPE, cellRange.highlight)) {
      focusHighlight.add(cellRange.highlight).commit().syncWith(cellRange);
    }
    if (!this.inProgress) {
      _classPrivateFieldSet(_isFocusSelectionChanged, this, true);
      this.runLocalHooks('afterSetFocus', cellRange.highlight);
    }
  }

  /**
   * Selects cell relative to the current cell (if possible).
   *
   * @param {number} rowDelta Rows number to move, value can be passed as negative number.
   * @param {number} colDelta Columns number to move, value can be passed as negative number.
   * @param {boolean} [createMissingRecords=false] If `true` the new rows/columns will be created if necessary.
   * Otherwise, row/column will be created according to `minSpareRows/minSpareCols` settings of Handsontable.
   */
  transformStart(rowDelta, colDelta) {
    let createMissingRecords = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (this.settings.navigableHeaders) {
      _classPrivateFieldGet(_transformation, this).setOffsetSize({
        x: this.tableProps.countRowHeaders(),
        y: this.tableProps.countColHeaders()
      });
    }
    this.setRangeStart(_classPrivateFieldGet(_transformation, this).transformStart(rowDelta, colDelta, createMissingRecords));
  }

  /**
   * Sets selection end cell relative to the current selection end cell (if possible).
   *
   * @param {number} rowDelta Rows number to move, value can be passed as negative number.
   * @param {number} colDelta Columns number to move, value can be passed as negative number.
   */
  transformEnd(rowDelta, colDelta) {
    if (this.settings.navigableHeaders) {
      _classPrivateFieldGet(_transformation, this).setOffsetSize({
        x: this.tableProps.countRowHeaders(),
        y: this.tableProps.countColHeaders()
      });
    }
    this.setRangeEnd(_classPrivateFieldGet(_transformation, this).transformEnd(rowDelta, colDelta));
  }

  /**
   * Transforms the focus cell selection relative to the current focus position.
   *
   * @param {number} rowDelta Rows number to move, value can be passed as negative number.
   * @param {number} colDelta Columns number to move, value can be passed as negative number.
   */
  transformFocus(rowDelta, colDelta) {
    const range = this.selectedRange.current();
    const {
      row,
      col
    } = range.getOuterTopStartCorner();
    const columnsInRange = this.tableProps.countRenderableColumnsInRange(0, col - 1);
    const rowsInRange = this.tableProps.countRenderableRowsInRange(0, row - 1);
    if (range.highlight.isHeader()) {
      // for header focus selection calculate the new coords based on the selection including headers
      _classPrivateFieldGet(_focusTransformation, this).setOffsetSize({
        x: col < 0 ? Math.abs(col) : -columnsInRange,
        y: row < 0 ? Math.abs(row) : -rowsInRange
      });
    } else {
      // for focus selection in cells calculate the new coords only based on the selected cells
      _classPrivateFieldGet(_focusTransformation, this).setOffsetSize({
        x: col < 0 ? 0 : -columnsInRange,
        y: row < 0 ? 0 : -rowsInRange
      });
    }
    const focusCoords = _classPrivateFieldGet(_focusTransformation, this).transformStart(rowDelta, colDelta);
    this.setRangeFocus(focusCoords.normalize());
  }

  /**
   * Returns currently used layer level.
   *
   * @returns {number} Returns layer level starting from 0. If no selection was added to the table -1 is returned.
   */
  getLayerLevel() {
    return this.selectedRange.size() - 1;
  }

  /**
   * Returns `true` if currently there is a selection on the screen, `false` otherwise.
   *
   * @returns {boolean}
   */
  isSelected() {
    return !this.selectedRange.isEmpty();
  }

  /**
   * Returns information if we have a multi-selection. This method check multi-selection only on the latest layer of
   * the selection.
   *
   * @returns {boolean}
   */
  isMultiple() {
    if (!this.isSelected()) {
      return false;
    }
    const isMultipleListener = (0, _object.createObjectPropListener)(!this.selectedRange.current().isSingle());
    this.runLocalHooks('afterIsMultipleSelection', isMultipleListener);
    return isMultipleListener.value;
  }

  /**
   * Checks if the last selection involves changing the focus cell position only.
   *
   * @returns {boolean}
   */
  isFocusSelectionChanged() {
    return this.isSelected() && _classPrivateFieldGet(_isFocusSelectionChanged, this);
  }

  /**
   * Returns `true` if the selection was applied by clicking to the row header. If the `layerLevel`
   * argument is passed then only that layer will be checked. Otherwise, it checks if any row header
   * was clicked on any selection layer level.
   *
   * @param {number} [layerLevel=this.getLayerLevel()] Selection layer level to check.
   * @returns {boolean}
   */
  isSelectedByRowHeader() {
    let layerLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getLayerLevel();
    return !this.isSelectedByCorner(layerLevel) && (layerLevel === -1 ? this.selectedByRowHeader.size > 0 : this.selectedByRowHeader.has(layerLevel));
  }

  /**
   * Returns `true` if the selection consists of entire rows (including their headers). If the `layerLevel`
   * argument is passed then only that layer will be checked. Otherwise, it checks the selection for all layers.
   *
   * @param {number} [layerLevel=this.getLayerLevel()] Selection layer level to check.
   * @returns {boolean}
   */
  isEntireRowSelected() {
    let layerLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getLayerLevel();
    const tester = range => {
      const {
        col
      } = range.getOuterTopStartCorner();
      const rowHeaders = this.tableProps.countRowHeaders();
      const countCols = this.tableProps.countCols();
      return (rowHeaders > 0 && col < 0 || rowHeaders === 0) && range.getWidth() === countCols;
    };
    if (layerLevel === -1) {
      return Array.from(this.selectedRange).some(range => tester(range));
    }
    const range = this.selectedRange.peekByIndex(layerLevel);
    return range ? tester(range) : false;
  }

  /**
   * Returns `true` if the selection was applied by clicking to the column header. If the `layerLevel`
   * argument is passed then only that layer will be checked. Otherwise, it checks if any column header
   * was clicked on any selection layer level.
   *
   * @param {number} [layerLevel=this.getLayerLevel()] Selection layer level to check.
   * @returns {boolean}
   */
  isSelectedByColumnHeader() {
    let layerLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getLayerLevel();
    return !this.isSelectedByCorner() && (layerLevel === -1 ? this.selectedByColumnHeader.size > 0 : this.selectedByColumnHeader.has(layerLevel));
  }

  /**
   * Returns `true` if the selection consists of entire columns (including their headers). If the `layerLevel`
   * argument is passed then only that layer will be checked. Otherwise, it checks the selection for all layers.
   *
   * @param {number} [layerLevel=this.getLayerLevel()] Selection layer level to check.
   * @returns {boolean}
   */
  isEntireColumnSelected() {
    let layerLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getLayerLevel();
    const tester = range => {
      const {
        row
      } = range.getOuterTopStartCorner();
      const colHeaders = this.tableProps.countColHeaders();
      const countRows = this.tableProps.countRows();
      return (colHeaders > 0 && row < 0 || colHeaders === 0) && range.getHeight() === countRows;
    };
    if (layerLevel === -1) {
      return Array.from(this.selectedRange).some(range => tester(range));
    }
    const range = this.selectedRange.peekByIndex(layerLevel);
    return range ? tester(range) : false;
  }

  /**
   * Returns `true` if the selection was applied by clicking on the row or column header on any layer level.
   *
   * @returns {boolean}
   */
  isSelectedByAnyHeader() {
    return this.isSelectedByRowHeader(-1) || this.isSelectedByColumnHeader(-1) || this.isSelectedByCorner();
  }

  /**
   * Returns `true` if the selection was applied by clicking on the left-top corner overlay.
   *
   * @returns {boolean}
   */
  isSelectedByCorner() {
    return this.selectedByColumnHeader.has(this.getLayerLevel()) && this.selectedByRowHeader.has(this.getLayerLevel());
  }

  /**
   * Returns `true` if coords is within selection coords. This method iterates through all selection layers to check if
   * the coords object is within selection range.
   *
   * @param {CellCoords} coords The CellCoords instance with defined visual coordinates.
   * @returns {boolean}
   */
  inInSelection(coords) {
    return this.selectedRange.includes(coords);
  }

  /**
   * Returns `true` if the cell corner should be visible.
   *
   * @private
   * @returns {boolean} `true` if the corner element has to be visible, `false` otherwise.
   */
  isCellCornerVisible() {
    return this.settings.fillHandle && !this.tableProps.isEditorOpened() && !this.isMultiple();
  }

  /**
   * Returns `true` if the cell coordinates are visible (renderable).
   *
   * @private
   * @param {CellCoords} coords The cell coordinates to check.
   * @returns {boolean}
   */
  isCellVisible(coords) {
    const renderableCoords = this.tableProps.visualToRenderableCoords(coords);
    return renderableCoords.row !== null && renderableCoords.col !== null;
  }

  /**
   * Returns `true` if the area corner should be visible.
   *
   * @param {number} layerLevel The layer level.
   * @returns {boolean} `true` if the corner element has to be visible, `false` otherwise.
   */
  isAreaCornerVisible(layerLevel) {
    if (Number.isInteger(layerLevel) && layerLevel !== this.getLayerLevel()) {
      return false;
    }
    return this.settings.fillHandle && !this.tableProps.isEditorOpened() && this.isMultiple();
  }

  /**
   * Clear the selection by resetting the collected ranges and highlights.
   */
  clear() {
    // TODO: collections selectedByColumnHeader and selectedByRowHeader should be clear too.
    this.selectedRange.clear();
    this.highlight.clear();
  }

  /**
   * Deselects all selected cells.
   */
  deselect() {
    if (!this.isSelected()) {
      return;
    }
    this.inProgress = false;
    this.clear();
    this.runLocalHooks('afterDeselect');
  }

  /**
   * Selects all cells and headers.
   *
   * @param {boolean} [includeRowHeaders=false] `true` If the selection should include the row headers,
   * `false` otherwise.
   * @param {boolean} [includeColumnHeaders=false] `true` If the selection should include the column
   * headers, `false` otherwise.
   * @param {object} [options] Additional object with options.
   * @param {{row: number, col: number} | boolean} [options.focusPosition] The argument allows changing the cell/header
   * focus position. The value takes an object with a `row` and `col` properties from -N to N, where
   * negative values point to the headers and positive values point to the cell range. If `false`, the focus
   * position won't be changed.
   * @param {boolean} [options.disableHeadersHighlight] If `true`, disables highlighting the headers even when
   * the logical coordinates points on them.
   */
  selectAll() {
    var _this$getSelectedRang;
    let includeRowHeaders = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    let includeColumnHeaders = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
      focusPosition: false,
      disableHeadersHighlight: false
    };
    const nrOfRows = this.tableProps.countRows();
    const nrOfColumns = this.tableProps.countCols();
    const countRowHeaders = this.tableProps.countRowHeaders();
    const countColHeaders = this.tableProps.countColHeaders();
    const rowFrom = includeColumnHeaders ? -countColHeaders : 0;
    const columnFrom = includeRowHeaders ? -countRowHeaders : 0;

    // We can't select cells when there is no data.
    if (rowFrom === 0 && columnFrom === 0 && (nrOfRows === 0 || nrOfColumns === 0)) {
      return;
    }
    let highlight = (_this$getSelectedRang = this.getSelectedRange().current()) === null || _this$getSelectedRang === void 0 ? void 0 : _this$getSelectedRang.highlight;
    const {
      focusPosition,
      disableHeadersHighlight
    } = options;
    _classPrivateFieldSet(_disableHeadersHighlight, this, disableHeadersHighlight);
    if (focusPosition && Number.isInteger(focusPosition === null || focusPosition === void 0 ? void 0 : focusPosition.row) && Number.isInteger(focusPosition === null || focusPosition === void 0 ? void 0 : focusPosition.col)) {
      highlight = this.tableProps.createCellCoords((0, _number.clamp)(focusPosition.row, rowFrom, nrOfRows - 1), (0, _number.clamp)(focusPosition.col, columnFrom, nrOfColumns - 1));
    }
    const startCoords = this.tableProps.createCellCoords(rowFrom, columnFrom);
    const endCoords = this.tableProps.createCellCoords(nrOfRows - 1, nrOfColumns - 1);
    this.clear();
    this.setRangeStartOnly(startCoords, undefined, highlight);
    if (columnFrom < 0) {
      this.selectedByRowHeader.add(this.getLayerLevel());
    }
    if (rowFrom < 0) {
      this.selectedByColumnHeader.add(this.getLayerLevel());
    }
    this.setRangeEnd(endCoords);
    this.finish();
    _classPrivateFieldSet(_disableHeadersHighlight, this, false);
  }

  /**
   * Make multiple, non-contiguous selection specified by `row` and `column` values or a range of cells
   * finishing at `endRow`, `endColumn`. The method supports two input formats, first as an array of arrays such
   * as `[[rowStart, columnStart, rowEnd, columnEnd]]` and second format as an array of CellRange objects.
   * If the passed ranges have another format the exception will be thrown.
   *
   * @param {Array[]|CellRange[]} selectionRanges The coordinates which define what the cells should be selected.
   * @returns {boolean} Returns `true` if selection was successful, `false` otherwise.
   */
  selectCells(selectionRanges) {
    var _this2 = this;
    const selectionType = (0, _utils.detectSelectionType)(selectionRanges);
    if (selectionType === _utils.SELECTION_TYPE_EMPTY) {
      return false;
    } else if (selectionType === _utils.SELECTION_TYPE_UNRECOGNIZED) {
      throw new Error((0, _templateLiteralTag.toSingleLine)`Unsupported format of the selection ranges was passed. To select cells pass\x20
        the coordinates as an array of arrays ([[rowStart, columnStart/columnPropStart, rowEnd,\x20
        columnEnd/columnPropEnd]]) or as an array of CellRange objects.`);
    }
    const selectionSchemaNormalizer = (0, _utils.normalizeSelectionFactory)(selectionType, {
      createCellCoords: function () {
        return _this2.tableProps.createCellCoords(...arguments);
      },
      createCellRange: function () {
        return _this2.tableProps.createCellRange(...arguments);
      },
      propToCol: prop => this.tableProps.propToCol(prop),
      keepDirection: true
    });
    const navigableHeaders = this.settings.navigableHeaders;
    const tableParams = {
      countRows: this.tableProps.countRows(),
      countCols: this.tableProps.countCols(),
      countRowHeaders: navigableHeaders ? this.tableProps.countRowHeaders() : 0,
      countColHeaders: navigableHeaders ? this.tableProps.countColHeaders() : 0
    };

    // Check if every layer of the coordinates are valid.
    const isValid = !selectionRanges.some(selection => {
      const cellRange = selectionSchemaNormalizer(selection);
      const rangeValidity = cellRange.isValid(tableParams);
      return !(rangeValidity && !cellRange.containsHeaders() || rangeValidity && cellRange.containsHeaders() && cellRange.isSingleHeader());
    });
    if (isValid) {
      this.clear();
      this.setExpectedLayers(selectionRanges.length);
      (0, _array.arrayEach)(selectionRanges, selection => {
        const {
          from,
          to
        } = selectionSchemaNormalizer(selection);
        this.setRangeStartOnly(from.clone(), false);
        this.setRangeEnd(to.clone());
      });
      this.finish();
    }
    return isValid;
  }

  /**
   * Select column specified by `startColumn` visual index or column property or a range of columns finishing at
   * `endColumn`.
   *
   * @param {number|string} startColumn Visual column index or column property from which the selection starts.
   * @param {number|string} [endColumn] Visual column index or column property from to the selection finishes.
   * @param {number | { row: number, col: number }} [focusPosition=0] The argument allows changing the cell/header focus
   * position. The value can take visual row index from -N to N, where negative values point to the headers and positive
   * values point to the cell range. An object with `row` and `col` properties also can be passed to change the focus
   * position horizontally.
   * @returns {boolean} Returns `true` if selection was successful, `false` otherwise.
   */
  selectColumns(startColumn) {
    let endColumn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : startColumn;
    let focusPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    const start = typeof startColumn === 'string' ? this.tableProps.propToCol(startColumn) : startColumn;
    const end = typeof endColumn === 'string' ? this.tableProps.propToCol(endColumn) : endColumn;
    const countRows = this.tableProps.countRows();
    const countCols = this.tableProps.countCols();
    const countColHeaders = this.tableProps.countColHeaders();
    const columnHeaderLastIndex = countColHeaders === 0 ? 0 : -countColHeaders;
    const fromCoords = this.tableProps.createCellCoords(columnHeaderLastIndex, start);
    const toCoords = this.tableProps.createCellCoords(countRows - 1, end);
    const isValid = this.tableProps.createCellRange(fromCoords, fromCoords, toCoords).isValid({
      countRows,
      countCols,
      countRowHeaders: 0,
      countColHeaders
    });
    if (isValid) {
      let highlightRow = 0;
      let highlightColumn = 0;
      if (Number.isInteger(focusPosition === null || focusPosition === void 0 ? void 0 : focusPosition.row) && Number.isInteger(focusPosition === null || focusPosition === void 0 ? void 0 : focusPosition.col)) {
        highlightRow = (0, _number.clamp)(focusPosition.row, columnHeaderLastIndex, countRows - 1);
        highlightColumn = (0, _number.clamp)(focusPosition.col, Math.min(start, end), Math.max(start, end));
      } else {
        highlightRow = (0, _number.clamp)(focusPosition, columnHeaderLastIndex, countRows - 1);
        highlightColumn = start;
      }
      const highlight = this.tableProps.createCellCoords(highlightRow, highlightColumn);
      const fromRow = countColHeaders === 0 ? 0 : (0, _number.clamp)(highlight.row, columnHeaderLastIndex, -1);
      const toRow = countRows - 1;
      const from = this.tableProps.createCellCoords(fromRow, start);
      const to = this.tableProps.createCellCoords(toRow, end);
      this.runLocalHooks('beforeSelectColumns', from, to, highlight);

      // disallow modifying row axis for that hooks
      from.row = fromRow;
      to.row = toRow;
      this.setRangeStartOnly(from, undefined, highlight);
      this.selectedByColumnHeader.add(this.getLayerLevel());
      this.setRangeEnd(to);
      this.runLocalHooks('afterSelectColumns', from, to, highlight);
      this.finish();
    }
    return isValid;
  }

  /**
   * Select row specified by `startRow` visual index or a range of rows finishing at `endRow`.
   *
   * @param {number} startRow Visual row index from which the selection starts.
   * @param {number} [endRow] Visual row index from to the selection finishes.
   * @param {number | { row: number, col: number }} [focusPosition=0] The argument allows changing the cell/header focus
   * position. The value can take visual row index from -N to N, where negative values point to the headers and positive
   * values point to the cell range. An object with `row` and `col` properties also can be passed to change the focus
   * position horizontally.
   * @returns {boolean} Returns `true` if selection was successful, `false` otherwise.
   */
  selectRows(startRow) {
    let endRow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : startRow;
    let focusPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    const countRows = this.tableProps.countRows();
    const countCols = this.tableProps.countCols();
    const countRowHeaders = this.tableProps.countRowHeaders();
    const rowHeaderLastIndex = countRowHeaders === 0 ? 0 : -countRowHeaders;
    const fromCoords = this.tableProps.createCellCoords(startRow, rowHeaderLastIndex);
    const toCoords = this.tableProps.createCellCoords(endRow, countCols - 1);
    const isValid = this.tableProps.createCellRange(fromCoords, fromCoords, toCoords).isValid({
      countRows,
      countCols,
      countRowHeaders,
      countColHeaders: 0
    });
    if (isValid) {
      let highlightRow = 0;
      let highlightColumn = 0;
      if (Number.isInteger(focusPosition === null || focusPosition === void 0 ? void 0 : focusPosition.row) && Number.isInteger(focusPosition === null || focusPosition === void 0 ? void 0 : focusPosition.col)) {
        highlightRow = (0, _number.clamp)(focusPosition.row, Math.min(startRow, endRow), Math.max(startRow, endRow));
        highlightColumn = (0, _number.clamp)(focusPosition.col, rowHeaderLastIndex, countCols - 1);
      } else {
        highlightRow = startRow;
        highlightColumn = (0, _number.clamp)(focusPosition, rowHeaderLastIndex, countCols - 1);
      }
      const highlight = this.tableProps.createCellCoords(highlightRow, highlightColumn);
      const fromColumn = countRowHeaders === 0 ? 0 : (0, _number.clamp)(highlight.col, rowHeaderLastIndex, -1);
      const toColumn = countCols - 1;
      const from = this.tableProps.createCellCoords(startRow, fromColumn);
      const to = this.tableProps.createCellCoords(endRow, toColumn);
      this.runLocalHooks('beforeSelectRows', from, to, highlight);

      // disallow modifying column axis for that hooks
      from.col = fromColumn;
      to.col = toColumn;
      this.setRangeStartOnly(from, undefined, highlight);
      this.selectedByRowHeader.add(this.getLayerLevel());
      this.setRangeEnd(to);
      this.runLocalHooks('afterSelectRows', from, to, highlight);
      this.finish();
    }
    return isValid;
  }

  /**
   * Rewrite the rendered state of the selection as visual selection may have a new representation in the DOM.
   */
  refresh() {
    const customSelections = this.highlight.getCustomSelections();
    customSelections.forEach(customSelection => {
      customSelection.commit();
    });
    if (!this.isSelected()) {
      return;
    }
    const focusHighlight = this.highlight.getFocus();
    const currentLayer = this.getLayerLevel();
    focusHighlight.commit().syncWith(this.selectedRange.current());

    // Rewriting rendered ranges going through all layers.
    for (let layerLevel = 0; layerLevel < this.selectedRange.size(); layerLevel += 1) {
      this.highlight.useLayerLevel(layerLevel);
      const areaHighlight = this.highlight.createArea();
      const areaLayeredHighlight = this.highlight.createLayeredArea();
      const rowHeaderHighlight = this.highlight.createRowHeader();
      const columnHeaderHighlight = this.highlight.createColumnHeader();
      const activeRowHeaderHighlight = this.highlight.createActiveRowHeader();
      const activeColumnHeaderHighlight = this.highlight.createActiveColumnHeader();
      const activeCornerHeaderHighlight = this.highlight.createActiveCornerHeader();
      const rowHighlight = this.highlight.createRowHighlight();
      const columnHighlight = this.highlight.createColumnHighlight();
      areaHighlight.commit();
      areaLayeredHighlight.commit();
      rowHeaderHighlight.commit();
      columnHeaderHighlight.commit();
      activeRowHeaderHighlight.commit();
      activeColumnHeaderHighlight.commit();
      activeCornerHeaderHighlight.commit();
      rowHighlight.commit();
      columnHighlight.commit();
    }

    // Reverting starting layer for the Highlight.
    this.highlight.useLayerLevel(currentLayer);
  }
}
(0, _object.mixin)(Selection, _localHooks.default);
var _default = exports.default = Selection;