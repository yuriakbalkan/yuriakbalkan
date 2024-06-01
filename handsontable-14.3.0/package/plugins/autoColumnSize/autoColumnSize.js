"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
require("core-js/modules/es.array.push.js");
var _base = require("../base");
var _array = require("../../helpers/array");
var _feature = require("../../helpers/feature");
var _ghostTable = _interopRequireDefault(require("../../utils/ghostTable"));
var _pluginHooks = _interopRequireDefault(require("../../pluginHooks"));
var _object = require("../../helpers/object");
var _number = require("../../helpers/number");
var _samplesGenerator = _interopRequireDefault(require("../../utils/samplesGenerator"));
var _string = require("../../helpers/string");
var _src = require("../../3rdparty/walkontable/src");
var _translations = require("../../translations");
var _mixed = require("../../helpers/mixed");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }
function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
_pluginHooks.default.getSingleton().register('modifyAutoColumnSizeSeed');
const PLUGIN_KEY = exports.PLUGIN_KEY = 'autoColumnSize';
const PLUGIN_PRIORITY = exports.PLUGIN_PRIORITY = 10;
const COLUMN_SIZE_MAP_NAME = 'autoColumnSize';

/* eslint-disable jsdoc/require-description-complete-sentence */
/**
 * @plugin AutoColumnSize
 * @class AutoColumnSize
 *
 * @description
 * This plugin allows to set column widths based on their widest cells.
 *
 * By default, the plugin is declared as `undefined`, which makes it enabled (same as if it was declared as `true`).
 * Enabling this plugin may decrease the overall table performance, as it needs to calculate the widths of all cells to
 * resize the columns accordingly.
 * If you experience problems with the performance, try turning this feature off and declaring the column widths manually.
 *
 * Column width calculations are divided into sync and async part. Each of this parts has their own advantages and
 * disadvantages. Synchronous calculations are faster but they block the browser UI, while the slower asynchronous
 * operations don't block the browser UI.
 *
 * To configure the sync/async distribution, you can pass an absolute value (number of columns) or a percentage value to a config object:
 *
 * ```js
 * // as a number (300 columns in sync, rest async)
 * autoColumnSize: {syncLimit: 300},
 *
 * // as a string (percent)
 * autoColumnSize: {syncLimit: '40%'},
 * ```
 *
 * The plugin uses {@link GhostTable} and {@link SamplesGenerator} for calculations.
 * First, {@link SamplesGenerator} prepares samples of data with its coordinates.
 * Next {@link GhostTable} uses coordinates to get cells' renderers and append all to the DOM through DocumentFragment.
 *
 * Sampling accepts additional options:
 * - *samplingRatio* - Defines how many samples for the same length will be used to calculate. Default is `3`.
 *
 * ```js
 *   autoColumnSize: {
 *     samplingRatio: 10,
 *   }
 * ```
 *
 * - *allowSampleDuplicates* - Defines if duplicated values might be used in sampling. Default is `false`.
 *
 * ```js
 *   autoColumnSize: {
 *     allowSampleDuplicates: true,
 *   }
 * ```
 *
 * To configure this plugin see {@link Options#autoColumnSize}.
 *
 * @example
 *
 * ::: only-for javascript
 * ```js
 * const hot = new Handsontable(document.getElementById('example'), {
 *   data: getData(),
 *   autoColumnSize: true
 * });
 * // Access to plugin instance:
 * const plugin = hot.getPlugin('autoColumnSize');
 *
 * plugin.getColumnWidth(4);
 *
 * if (plugin.isEnabled()) {
 *   // code...
 * }
 * ```
 * :::
 *
 * ::: only-for react
 * ```jsx
 * const hotRef = useRef(null);
 *
 * ...
 *
 * // First, let's contruct Handsontable
 * <HotTable
 *   ref={hotRef}
 *   data={getData()}
 *   autoColumnSize={true}
 * />
 *
 * ...
 *
 * // Access to plugin instance:
 * const hot = hotRef.current.hotInstance;
 * const plugin = hot.getPlugin('autoColumnSize');
 *
 * plugin.getColumnWidth(4);
 *
 * if (plugin.isEnabled()) {
 *   // code...
 * }
 * ```
 * :::
 */
/* eslint-enable jsdoc/require-description-complete-sentence */
var _cachedColumnHeaders = /*#__PURE__*/new WeakMap();
var _AutoColumnSize_brand = /*#__PURE__*/new WeakSet();
class AutoColumnSize extends _base.BasePlugin {
  static get PLUGIN_KEY() {
    return PLUGIN_KEY;
  }
  static get PLUGIN_PRIORITY() {
    return PLUGIN_PRIORITY;
  }
  static get SETTING_KEYS() {
    return true;
  }
  static get CALCULATION_STEP() {
    return 50;
  }
  static get SYNC_CALCULATION_LIMIT() {
    return 50;
  }

  /**
   * Instance of {@link GhostTable} for rows and columns size calculations.
   *
   * @private
   * @type {GhostTable}
   */

  constructor(hotInstance) {
    super(hotInstance);
    /**
     * On before view render listener.
     */
    _classPrivateMethodInitSpec(this, _AutoColumnSize_brand);
    _defineProperty(this, "ghostTable", new _ghostTable.default(this.hot));
    /**
     * Instance of {@link SamplesGenerator} for generating samples necessary for columns width calculations.
     *
     * @private
     * @type {SamplesGenerator}
     * @fires Hooks#modifyAutoColumnSizeSeed
     */
    _defineProperty(this, "samplesGenerator", new _samplesGenerator.default((row, column) => {
      const physicalRow = this.hot.toPhysicalRow(row);
      const physicalColumn = this.hot.toPhysicalColumn(column);
      if (this.hot.rowIndexMapper.isHidden(physicalRow) || this.hot.columnIndexMapper.isHidden(physicalColumn)) {
        return false;
      }
      const cellMeta = this.hot.getCellMeta(row, column);
      let cellValue = '';
      if (!cellMeta.spanned) {
        cellValue = this.hot.getDataAtCell(row, column);
      }
      let bundleSeed = '';
      if (this.hot.hasHook('modifyAutoColumnSizeSeed')) {
        bundleSeed = this.hot.runHooks('modifyAutoColumnSizeSeed', bundleSeed, cellMeta, cellValue);
      }
      return {
        value: cellValue,
        bundleSeed
      };
    }));
    /**
     * `true` only if the first calculation was performed.
     *
     * @private
     * @type {boolean}
     */
    _defineProperty(this, "firstCalculation", true);
    /**
     * `true` if the size calculation is in progress.
     *
     * @type {boolean}
     */
    _defineProperty(this, "inProgress", false);
    /**
     * Number of already measured columns (we already know their sizes).
     *
     * @type {number}
     */
    _defineProperty(this, "measuredColumns", 0);
    /**
     * PhysicalIndexToValueMap to keep and track widths for physical column indexes.
     *
     * @private
     * @type {PhysicalIndexToValueMap}
     */
    _defineProperty(this, "columnWidthsMap", new _translations.PhysicalIndexToValueMap());
    /**
     * Cached column header names. It is used to diff current column headers with previous state and detect which
     * columns width should be updated.
     *
     * @type {Array}
     */
    _classPrivateFieldInitSpec(this, _cachedColumnHeaders, []);
    this.hot.columnIndexMapper.registerMap(COLUMN_SIZE_MAP_NAME, this.columnWidthsMap);

    // Leave the listener active to allow auto-sizing the columns when the plugin is disabled.
    // This is necessary for width recalculation for resize handler doubleclick (ManualColumnResize).
    this.addHook('beforeColumnResize', (size, column, isDblClick) => _assertClassBrand(_AutoColumnSize_brand, this, _onBeforeColumnResize).call(this, size, column, isDblClick));
  }

  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` then the {@link #enablePlugin} method is called.
   *
   * @returns {boolean}
   */
  isEnabled() {
    return this.hot.getSettings()[PLUGIN_KEY] !== false && !this.hot.getSettings().colWidths;
  }

  /**
   * Enables the plugin functionality for this Handsontable instance.
   */
  enablePlugin() {
    var _this = this;
    if (this.enabled) {
      return;
    }
    const setting = this.hot.getSettings()[PLUGIN_KEY];
    if (setting && setting.useHeaders !== null && setting.useHeaders !== undefined) {
      this.ghostTable.setSetting('useHeaders', setting.useHeaders);
    }
    this.setSamplingOptions();
    this.addHook('afterLoadData', function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return _assertClassBrand(_AutoColumnSize_brand, _this, _onAfterLoadData).call(_this, ...args);
    });
    this.addHook('beforeChangeRender', changes => _assertClassBrand(_AutoColumnSize_brand, this, _onBeforeChange).call(this, changes));
    this.addHook('afterFormulasValuesUpdate', changes => _assertClassBrand(_AutoColumnSize_brand, this, _onAfterFormulasValuesUpdate).call(this, changes));
    this.addHook('beforeViewRender', force => _assertClassBrand(_AutoColumnSize_brand, this, _onBeforeViewRender).call(this, force));
    this.addHook('modifyColWidth', (width, col) => this.getColumnWidth(col, width));
    this.addHook('afterInit', () => _assertClassBrand(_AutoColumnSize_brand, this, _onAfterInit).call(this));
    super.enablePlugin();
  }

  /**
   * Updates the plugin's state. This method is executed when {@link Core#updateSettings} is invoked.
   */
  updatePlugin() {
    const changedColumns = this.findColumnsWhereHeaderWasChanged();
    if (changedColumns.length) {
      this.clearCache(changedColumns);
      this.calculateVisibleColumnsWidth();
    }
    super.updatePlugin();
  }

  /**
   * Disables the plugin functionality for this Handsontable instance.
   */
  disablePlugin() {
    super.disablePlugin();

    // Leave the listener active to allow auto-sizing the columns when the plugin is disabled.
    // This is necessary for width recalculation for resize handler doubleclick (ManualColumnResize).
    this.addHook('beforeColumnResize', (size, column, isDblClick) => _assertClassBrand(_AutoColumnSize_brand, this, _onBeforeColumnResize).call(this, size, column, isDblClick));
  }

  /**
   * Calculates visible columns width.
   */
  calculateVisibleColumnsWidth() {
    const rowsCount = this.hot.countRows();

    // Keep last column widths unchanged for situation when all rows was deleted or trimmed (pro #6)
    if (!rowsCount) {
      return;
    }
    const force = this.hot.renderCall;
    const firstVisibleColumn = this.getFirstVisibleColumn();
    const lastVisibleColumn = this.getLastVisibleColumn();
    if (firstVisibleColumn === -1 || lastVisibleColumn === -1) {
      return;
    }
    this.calculateColumnsWidth({
      from: firstVisibleColumn,
      to: lastVisibleColumn
    }, undefined, force);
  }

  /**
   * Calculates a columns width.
   *
   * @param {number|object} colRange Visual column index or an object with `from` and `to` visual indexes as a range.
   * @param {number|object} rowRange Visual row index or an object with `from` and `to` visual indexes as a range.
   * @param {boolean} [force=false] If `true` the calculation will be processed regardless of whether the width exists in the cache.
   */
  calculateColumnsWidth() {
    let colRange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      from: 0,
      to: this.hot.countCols() - 1
    };
    let rowRange = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      from: 0,
      to: this.hot.countRows() - 1
    };
    let force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    // eslint-disable-line max-len
    const columnsRange = typeof colRange === 'number' ? {
      from: colRange,
      to: colRange
    } : colRange;
    const rowsRange = typeof rowRange === 'number' ? {
      from: rowRange,
      to: rowRange
    } : rowRange;
    (0, _number.rangeEach)(columnsRange.from, columnsRange.to, visualColumn => {
      let physicalColumn = this.hot.toPhysicalColumn(visualColumn);
      if (physicalColumn === null) {
        physicalColumn = visualColumn;
      }
      if (force || this.columnWidthsMap.getValueAtIndex(physicalColumn) === null && !this.hot._getColWidthFromSettings(physicalColumn)) {
        const samples = this.samplesGenerator.generateColumnSamples(visualColumn, rowsRange);
        (0, _array.arrayEach)(samples, _ref => {
          let [column, sample] = _ref;
          return this.ghostTable.addColumn(column, sample);
        });
      }
    });
    if (this.ghostTable.columns.length) {
      this.hot.batchExecution(() => {
        this.ghostTable.getWidths((visualColumn, width) => {
          const physicalColumn = this.hot.toPhysicalColumn(visualColumn);
          this.columnWidthsMap.setValueAtIndex(physicalColumn, width);
        });
      }, true);
      this.measuredColumns = columnsRange.to + 1;
      this.ghostTable.clean();
    }
  }

  /**
   * Calculates all columns width. The calculated column will be cached in the {@link AutoColumnSize#widths} property.
   * To retrieve width for specified column use {@link AutoColumnSize#getColumnWidth} method.
   *
   * @param {object|number} rowRange Row index or an object with `from` and `to` properties which define row range.
   */
  calculateAllColumnsWidth() {
    let rowRange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      from: 0,
      to: this.hot.countRows() - 1
    };
    let current = 0;
    const length = this.hot.countCols() - 1;
    let timer = null;
    this.inProgress = true;
    const loop = () => {
      // When hot was destroyed after calculating finished cancel frame
      if (!this.hot) {
        (0, _feature.cancelAnimationFrame)(timer);
        this.inProgress = false;
        return;
      }
      this.calculateColumnsWidth({
        from: current,
        to: Math.min(current + AutoColumnSize.CALCULATION_STEP, length)
      }, rowRange);
      current = current + AutoColumnSize.CALCULATION_STEP + 1;
      if (current < length) {
        timer = (0, _feature.requestAnimationFrame)(loop);
      } else {
        (0, _feature.cancelAnimationFrame)(timer);
        this.inProgress = false;

        // @TODO Should call once per render cycle, currently fired separately in different plugins
        this.hot.view.adjustElementsSize();
      }
    };
    const syncLimit = this.getSyncCalculationLimit();

    // sync
    if (this.firstCalculation && syncLimit >= 0) {
      this.calculateColumnsWidth({
        from: 0,
        to: syncLimit
      }, rowRange);
      this.firstCalculation = false;
      current = syncLimit + 1;
    }
    // async
    if (current < length) {
      loop();
    } else {
      this.inProgress = false;
    }
  }

  /**
   * Sets the sampling options.
   *
   * @private
   */
  setSamplingOptions() {
    const setting = this.hot.getSettings()[PLUGIN_KEY];
    const samplingRatio = setting && (0, _object.hasOwnProperty)(setting, 'samplingRatio') ? setting.samplingRatio : undefined;
    const allowSampleDuplicates = setting && (0, _object.hasOwnProperty)(setting, 'allowSampleDuplicates') ? setting.allowSampleDuplicates : undefined;
    if (samplingRatio && !isNaN(samplingRatio)) {
      this.samplesGenerator.setSampleCount(parseInt(samplingRatio, 10));
    }
    if (allowSampleDuplicates) {
      this.samplesGenerator.setAllowDuplicates(allowSampleDuplicates);
    }
  }

  /**
   * Recalculates all columns width (overwrite cache values).
   */
  recalculateAllColumnsWidth() {
    if (this.hot.view && this.hot.view._wt.wtTable.isVisible()) {
      this.clearCache();
      this.calculateAllColumnsWidth();
    }
  }

  /**
   * Gets value which tells how many columns should be calculated synchronously (rest of the columns will be calculated
   * asynchronously). The limit is calculated based on `syncLimit` set to `autoColumnSize` option (see {@link Options#autoColumnSize}).
   *
   * @returns {number}
   */
  getSyncCalculationLimit() {
    const settings = this.hot.getSettings()[PLUGIN_KEY];
    /* eslint-disable no-bitwise */
    let limit = AutoColumnSize.SYNC_CALCULATION_LIMIT;
    const colsLimit = this.hot.countCols() - 1;
    if ((0, _object.isObject)(settings)) {
      limit = settings.syncLimit;
      if ((0, _string.isPercentValue)(limit)) {
        limit = (0, _number.valueAccordingPercent)(colsLimit, limit);
      } else {
        // Force to Number
        limit >>= 0;
      }
    }
    return Math.min(limit, colsLimit);
  }

  /**
   * Gets the calculated column width.
   *
   * @param {number} column Visual column index.
   * @param {number} [defaultWidth] Default column width. It will be picked up if no calculated width found.
   * @param {boolean} [keepMinimum=true] If `true` then returned value won't be smaller then 50 (default column width).
   * @returns {number}
   */
  getColumnWidth(column) {
    let defaultWidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    let keepMinimum = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    let width = defaultWidth;
    if (width === undefined) {
      width = this.columnWidthsMap.getValueAtIndex(this.hot.toPhysicalColumn(column));
      if (keepMinimum && typeof width === 'number') {
        width = Math.max(width, _src.ViewportColumnsCalculator.DEFAULT_WIDTH);
      }
    }
    return width;
  }

  /**
   * Gets the first visible column.
   *
   * @returns {number} Returns visual column index, -1 if table is not rendered or if there are no columns to base the the calculations on.
   */
  getFirstVisibleColumn() {
    const wot = this.hot.view._wt;
    if (wot.wtViewport.columnsVisibleCalculator) {
      // Fist fully visible column is stored as renderable index.
      const firstFullyVisibleColumn = wot.wtTable.getFirstVisibleColumn();
      if (firstFullyVisibleColumn !== -1) {
        return this.hot.columnIndexMapper.getVisualFromRenderableIndex(firstFullyVisibleColumn);
      }
    }
    if (wot.wtViewport.columnsRenderCalculator) {
      const firstRenderedColumn = wot.wtTable.getFirstRenderedColumn();

      // There are no rendered column.
      if (firstRenderedColumn !== -1) {
        return this.hot.columnIndexMapper.getVisualFromRenderableIndex(firstRenderedColumn);
      }
    }
    return -1;
  }

  /**
   * Gets the last visible column.
   *
   * @returns {number} Returns visual column index or -1 if table is not rendered.
   */
  getLastVisibleColumn() {
    const wot = this.hot.view._wt;
    if (wot.wtViewport.columnsVisibleCalculator) {
      // Last fully visible column is stored as renderable index.
      const lastFullyVisibleColumn = wot.wtTable.getLastVisibleColumn();
      if (lastFullyVisibleColumn !== -1) {
        return this.hot.columnIndexMapper.getVisualFromRenderableIndex(lastFullyVisibleColumn);
      }
    }
    if (wot.wtViewport.columnsRenderCalculator) {
      // Last fully visible column is stored as renderable index.
      const lastRenderedColumn = wot.wtTable.getLastRenderedColumn();

      // There are no rendered columns.
      if (lastRenderedColumn !== -1) {
        return this.hot.columnIndexMapper.getVisualFromRenderableIndex(lastRenderedColumn);
      }
    }
    return -1;
  }

  /**
   * Collects all columns which titles has been changed in comparison to the previous state.
   *
   * @private
   * @returns {Array} It returns an array of physical column indexes.
   */
  findColumnsWhereHeaderWasChanged() {
    const columnHeaders = this.hot.getColHeader();
    const changedColumns = (0, _array.arrayReduce)(columnHeaders, (acc, columnTitle, physicalColumn) => {
      const cachedColumnsLength = _classPrivateFieldGet(_cachedColumnHeaders, this).length;
      if (cachedColumnsLength - 1 < physicalColumn || _classPrivateFieldGet(_cachedColumnHeaders, this)[physicalColumn] !== columnTitle) {
        acc.push(physicalColumn);
      }
      if (cachedColumnsLength - 1 < physicalColumn) {
        _classPrivateFieldGet(_cachedColumnHeaders, this).push(columnTitle);
      } else {
        _classPrivateFieldGet(_cachedColumnHeaders, this)[physicalColumn] = columnTitle;
      }
      return acc;
    }, []);
    return changedColumns;
  }

  /**
   * Clears cache of calculated column widths. If you want to clear only selected columns pass an array with their indexes.
   * Otherwise whole cache will be cleared.
   *
   * @param {number[]} [columns] List of physical column indexes to clear.
   */
  clearCache() {
    let columns = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    if (columns.length) {
      this.hot.batchExecution(() => {
        (0, _array.arrayEach)(columns, physicalIndex => {
          this.columnWidthsMap.setValueAtIndex(physicalIndex, null);
        });
      }, true);
    } else {
      this.columnWidthsMap.clear();
    }
  }

  /**
   * Checks if all widths were calculated. If not then return `true` (need recalculate).
   *
   * @returns {boolean}
   */
  isNeedRecalculate() {
    return !!(0, _array.arrayFilter)(this.columnWidthsMap.getValues().slice(0, this.measuredColumns), item => item === null).length;
  }
  /**
   * Destroys the plugin instance.
   */
  destroy() {
    this.ghostTable.clean();
    super.destroy();
  }
}
exports.AutoColumnSize = AutoColumnSize;
function _onBeforeViewRender() {
  this.calculateVisibleColumnsWidth();
  if (this.isNeedRecalculate() && !this.inProgress) {
    this.calculateAllColumnsWidth();
  }
}
/**
 * On after load data listener.
 */
function _onAfterLoadData() {
  if (this.hot.view) {
    this.recalculateAllColumnsWidth();
  } else {
    // first load - initialization
    setTimeout(() => {
      if (this.hot) {
        this.recalculateAllColumnsWidth();
      }
    }, 0);
  }
}
/**
 * On before change listener.
 *
 * @param {Array} changes An array of modified data.
 */
function _onBeforeChange(changes) {
  const changedColumns = (0, _array.arrayMap)(changes, _ref2 => {
    let [, columnProperty] = _ref2;
    return this.hot.toPhysicalColumn(this.hot.propToCol(columnProperty));
  });
  this.clearCache(Array.from(new Set(changedColumns)));
}
/**
 * On before column resize listener.
 *
 * @param {number} size Calculated new column width.
 * @param {number} column Visual index of the resized column.
 * @param {boolean} isDblClick  Flag that determines whether there was a double-click.
 * @returns {number}
 */
function _onBeforeColumnResize(size, column, isDblClick) {
  let newSize = size;
  if (isDblClick) {
    this.calculateColumnsWidth(column, undefined, true);
    newSize = this.getColumnWidth(column, undefined, false);
  }
  return newSize;
}
/**
 * On after Handsontable init fill plugin with all necessary values.
 */
function _onAfterInit() {
  _classPrivateFieldSet(_cachedColumnHeaders, this, this.hot.getColHeader());
}
/**
 * After formulas values updated listener.
 *
 * @param {Array} changes An array of modified data.
 */
function _onAfterFormulasValuesUpdate(changes) {
  const filteredChanges = (0, _array.arrayFilter)(changes, change => {
    var _change$address;
    return (0, _mixed.isDefined)((_change$address = change.address) === null || _change$address === void 0 ? void 0 : _change$address.col);
  });
  const changedColumns = (0, _array.arrayMap)(filteredChanges, change => change.address.col);
  this.clearCache(Array.from(new Set(changedColumns)));
}