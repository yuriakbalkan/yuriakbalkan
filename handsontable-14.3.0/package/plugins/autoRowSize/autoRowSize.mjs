import "core-js/modules/es.error.cause.js";
function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
import { BasePlugin } from "../base/index.mjs";
import { arrayEach, arrayFilter } from "../../helpers/array.mjs";
import { cancelAnimationFrame, requestAnimationFrame } from "../../helpers/feature.mjs";
import { isVisible } from "../../helpers/dom/element.mjs";
import GhostTable from "../../utils/ghostTable.mjs";
import { isObject, hasOwnProperty } from "../../helpers/object.mjs";
import { valueAccordingPercent, rangeEach } from "../../helpers/number.mjs";
import SamplesGenerator from "../../utils/samplesGenerator.mjs";
import { isPercentValue } from "../../helpers/string.mjs";
import { PhysicalIndexToValueMap as IndexToValueMap } from "../../translations/index.mjs";
export const PLUGIN_KEY = 'autoRowSize';
export const PLUGIN_PRIORITY = 40;
const ROW_WIDTHS_MAP_NAME = 'autoRowSize';

/* eslint-disable jsdoc/require-description-complete-sentence */
/**
 * @plugin AutoRowSize
 * @class AutoRowSize
 * @description
 * The `AutoRowSize` plugin allows you to set row heights based on their highest cells.
 *
 * By default, the plugin is declared as `undefined`, which makes it disabled (same as if it was declared as `false`).
 * Enabling this plugin may decrease the overall table performance, as it needs to calculate the heights of all cells to
 * resize the rows accordingly.
 * If you experience problems with the performance, try turning this feature off and declaring the row heights manually.
 *
 * But, to display Handsontable's [scrollbar](https://handsontable.com/docs/8.0.0/demo-scrolling.html)
 * in a proper size, you need to enable the `AutoRowSize` plugin,
 * by setting the [`autoRowSize`](@/api/options.md#autoRowSize) option to `true`.
 *
 * Row height calculations are divided into sync and async part. Each of this parts has their own advantages and
 * disadvantages. Synchronous calculations are faster but they block the browser UI, while the slower asynchronous
 * operations don't block the browser UI.
 *
 * To configure the sync/async distribution, you can pass an absolute value (number of rows) or a percentage value to a config object:
 * ```js
 * // as a number (300 rows in sync, rest async)
 * autoRowSize: {syncLimit: 300},
 *
 * // as a string (percent)
 * autoRowSize: {syncLimit: '40%'},
 *
 * // allow sample duplication
 * autoRowSize: {syncLimit: '40%', allowSampleDuplicates: true},
 * ```
 *
 * You can also use the `allowSampleDuplicates` option to allow sampling duplicate values when calculating the row
 * height. __Note__, that this might have a negative impact on performance.
 *
 * To configure this plugin see {@link Options#autoRowSize}.
 *
 * @example
 *
 * ::: only-for javascript
 * ```js
 * const hot = new Handsontable(document.getElementById('example'), {
 *   data: getData(),
 *   autoRowSize: true
 * });
 * // Access to plugin instance:
 * const plugin = hot.getPlugin('autoRowSize');
 *
 * plugin.getRowHeight(4);
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
 *   autoRowSize={true}
 * />
 *
 * ...
 *
 * // Access to plugin instance:
 * const hot = hotRef.current.hotInstance;
 * const plugin = hot.getPlugin('autoRowSize');
 *
 * plugin.getRowHeight(4);
 *
 * if (plugin.isEnabled()) {
 *   // code...
 * }
 * ```
 * :::
 */
/* eslint-enable jsdoc/require-description-complete-sentence */
var _AutoRowSize_brand = /*#__PURE__*/new WeakSet();
export class AutoRowSize extends BasePlugin {
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
    return 500;
  }

  /**
   * Columns header's height cache.
   *
   * @private
   * @type {number}
   */

  constructor(hotInstance) {
    super(hotInstance);
    /**
     * On before view render listener.
     */
    _classPrivateMethodInitSpec(this, _AutoRowSize_brand);
    _defineProperty(this, "headerHeight", null);
    /**
     * Instance of {@link GhostTable} for rows and columns size calculations.
     *
     * @private
     * @type {GhostTable}
     */
    _defineProperty(this, "ghostTable", new GhostTable(this.hot));
    /**
     * Instance of {@link SamplesGenerator} for generating samples necessary for rows height calculations.
     *
     * @private
     * @type {SamplesGenerator}
     */
    _defineProperty(this, "samplesGenerator", new SamplesGenerator((row, column) => {
      const physicalRow = this.hot.toPhysicalRow(row);
      const physicalColumn = this.hot.toPhysicalColumn(column);
      if (this.hot.rowIndexMapper.isHidden(physicalRow) || this.hot.columnIndexMapper.isHidden(physicalColumn)) {
        return false;
      }
      if (row >= 0 && column >= 0) {
        const cellMeta = this.hot.getCellMeta(row, column);
        if (cellMeta.hidden) {
          // do not generate samples for cells that are covered by merged cell (null values)
          return false;
        }
      }
      let cellValue;
      if (row >= 0) {
        cellValue = this.hot.getDataAtCell(row, column);
      } else if (row === -1) {
        cellValue = this.hot.getColHeader(column);
      }
      return {
        value: cellValue
      };
    }));
    /**
     * `true` if only the first calculation was performed.
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
     * Number of already measured rows (we already know their sizes).
     *
     * @type {number}
     */
    _defineProperty(this, "measuredRows", 0);
    /**
     * PhysicalIndexToValueMap to keep and track heights for physical row indexes.
     *
     * @private
     * @type {PhysicalIndexToValueMap}
     */
    _defineProperty(this, "rowHeightsMap", new IndexToValueMap());
    this.hot.rowIndexMapper.registerMap(ROW_WIDTHS_MAP_NAME, this.rowHeightsMap);

    // Leave the listener active to allow auto-sizing the rows when the plugin is disabled.
    // This is necessary for height recalculation for resize handler doubleclick (ManualRowResize).
    this.addHook('beforeRowResize', (size, row, isDblClick) => _assertClassBrand(_AutoRowSize_brand, this, _onBeforeRowResize).call(this, size, row, isDblClick));
  }

  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` then the {@link AutoRowSize#enablePlugin} method is called.
   *
   * @returns {boolean}
   */
  isEnabled() {
    const settings = this.hot.getSettings()[PLUGIN_KEY];
    return settings === true || isObject(settings);
  }

  /**
   * Enables the plugin functionality for this Handsontable instance.
   */
  enablePlugin() {
    var _this = this;
    if (this.enabled) {
      return;
    }
    this.setSamplingOptions();
    this.addHook('afterLoadData', function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return _assertClassBrand(_AutoRowSize_brand, _this, _onAfterLoadData).call(_this, ...args);
    });
    this.addHook('beforeChangeRender', changes => _assertClassBrand(_AutoRowSize_brand, this, _onBeforeChange).call(this, changes));
    this.addHook('beforeColumnResize', () => this.recalculateAllRowsHeight());
    this.addHook('beforeViewRender', force => _assertClassBrand(_AutoRowSize_brand, this, _onBeforeViewRender).call(this, force));
    this.addHook('modifyRowHeight', (height, row) => this.getRowHeight(row, height));
    this.addHook('modifyColumnHeaderHeight', () => this.getColumnHeaderHeight());
    super.enablePlugin();
  }

  /**
   * Disables the plugin functionality for this Handsontable instance.
   */
  disablePlugin() {
    this.headerHeight = null;
    super.disablePlugin();

    // Leave the listener active to allow auto-sizing the rows when the plugin is disabled.
    // This is necesseary for height recalculation for resize handler doubleclick (ManualRowResize).
    this.addHook('beforeRowResize', (size, row, isDblClick) => _assertClassBrand(_AutoRowSize_brand, this, _onBeforeRowResize).call(this, size, row, isDblClick));
  }

  /**
   * Calculate a given rows height.
   *
   * @param {number|object} rowRange Row index or an object with `from` and `to` indexes as a range.
   * @param {number|object} colRange Column index or an object with `from` and `to` indexes as a range.
   * @param {boolean} [force=false] If `true` the calculation will be processed regardless of whether the width exists in the cache.
   */
  calculateRowsHeight() {
    let rowRange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      from: 0,
      to: this.hot.countRows() - 1
    };
    let colRange = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      from: 0,
      to: this.hot.countCols() - 1
    };
    let force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    // eslint-disable-line max-len
    const rowsRange = typeof rowRange === 'number' ? {
      from: rowRange,
      to: rowRange
    } : rowRange;
    const columnsRange = typeof colRange === 'number' ? {
      from: colRange,
      to: colRange
    } : colRange;
    if (this.hot.getColHeader(0) !== null) {
      const samples = this.samplesGenerator.generateRowSamples(-1, columnsRange);
      this.ghostTable.addColumnHeadersRow(samples.get(-1));
    }
    rangeEach(rowsRange.from, rowsRange.to, row => {
      // For rows we must calculate row height even when user had set height value manually.
      // We can shrink column but cannot shrink rows!
      if (force || this.rowHeightsMap.getValueAtIndex(row) === null) {
        const samples = this.samplesGenerator.generateRowSamples(row, columnsRange);
        arrayEach(samples, _ref => {
          let [rowIndex, sample] = _ref;
          return this.ghostTable.addRow(rowIndex, sample);
        });
      }
    });
    if (this.ghostTable.rows.length) {
      this.hot.batchExecution(() => {
        this.ghostTable.getHeights((row, height) => {
          if (row < 0) {
            this.headerHeight = height;
          } else {
            this.rowHeightsMap.setValueAtIndex(this.hot.toPhysicalRow(row), height);
          }
        });
      }, true);
      this.measuredRows = rowsRange.to + 1;
      this.ghostTable.clean();
    }
  }

  /**
   * Calculate all rows heights. The calculated row will be cached in the {@link AutoRowSize#heights} property.
   * To retrieve height for specified row use {@link AutoRowSize#getRowHeight} method.
   *
   * @param {object|number} colRange Row index or an object with `from` and `to` properties which define row range.
   */
  calculateAllRowsHeight() {
    let colRange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      from: 0,
      to: this.hot.countCols() - 1
    };
    let current = 0;
    const length = this.hot.countRows() - 1;
    let timer = null;
    this.inProgress = true;
    const loop = () => {
      // When hot was destroyed after calculating finished cancel frame
      if (!this.hot) {
        cancelAnimationFrame(timer);
        this.inProgress = false;
        return;
      }
      this.calculateRowsHeight({
        from: current,
        to: Math.min(current + AutoRowSize.CALCULATION_STEP, length)
      }, colRange);
      current = current + AutoRowSize.CALCULATION_STEP + 1;
      if (current < length) {
        timer = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(timer);
        this.inProgress = false;

        // @TODO Should call once per render cycle, currently fired separately in different plugins
        this.hot.view.adjustElementsSize(true);

        // tmp
        if (this.hot.view._wt.wtOverlays.inlineStartOverlay.needFullRender) {
          this.hot.view._wt.wtOverlays.inlineStartOverlay.clone.draw();
        }
      }
    };
    const syncLimit = this.getSyncCalculationLimit();

    // sync
    if (this.firstCalculation && syncLimit >= 0) {
      this.calculateRowsHeight({
        from: 0,
        to: syncLimit
      }, colRange);
      this.firstCalculation = false;
      current = syncLimit + 1;
    }
    // async
    if (current < length) {
      loop();
    } else {
      this.inProgress = false;
      this.hot.view.adjustElementsSize(false);
    }
  }

  /**
   * Sets the sampling options.
   *
   * @private
   */
  setSamplingOptions() {
    const setting = this.hot.getSettings()[PLUGIN_KEY];
    const samplingRatio = setting && hasOwnProperty(setting, 'samplingRatio') ? setting.samplingRatio : undefined;
    const allowSampleDuplicates = setting && hasOwnProperty(setting, 'allowSampleDuplicates') ? setting.allowSampleDuplicates : undefined;
    if (samplingRatio && !isNaN(samplingRatio)) {
      this.samplesGenerator.setSampleCount(parseInt(samplingRatio, 10));
    }
    if (allowSampleDuplicates) {
      this.samplesGenerator.setAllowDuplicates(allowSampleDuplicates);
    }
  }

  /**
   * Recalculates all rows height (overwrite cache values).
   */
  recalculateAllRowsHeight() {
    if (isVisible(this.hot.view._wt.wtTable.TABLE)) {
      this.clearCache();
      this.calculateAllRowsHeight();
    }
  }

  /**
   * Gets value which tells how many rows should be calculated synchronously (rest of the rows will be calculated
   * asynchronously). The limit is calculated based on `syncLimit` set to autoRowSize option (see {@link Options#autoRowSize}).
   *
   * @returns {number}
   */
  getSyncCalculationLimit() {
    const settings = this.hot.getSettings()[PLUGIN_KEY];
    /* eslint-disable no-bitwise */
    let limit = AutoRowSize.SYNC_CALCULATION_LIMIT;
    const rowsLimit = this.hot.countRows() - 1;
    if (isObject(settings)) {
      limit = settings.syncLimit;
      if (isPercentValue(limit)) {
        limit = valueAccordingPercent(rowsLimit, limit);
      } else {
        // Force to Number
        limit >>= 0;
      }
    }
    return Math.min(limit, rowsLimit);
  }

  /**
   * Get a row's height, as measured in the DOM.
   *
   * The height returned includes 1 px of the row's bottom border.
   *
   * Mind that this method is different from the
   * [`getRowHeight()`](@/api/core.md#getrowheight) method
   * of Handsontable's [Core](@/api/core.md).
   *
   * @param {number} row A visual row index.
   * @param {number} [defaultHeight] If no height is found, `defaultHeight` is returned instead.
   * @returns {number} The height of the specified row, in pixels.
   */
  getRowHeight(row) {
    let defaultHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    const cachedHeight = row < 0 ? this.headerHeight : this.rowHeightsMap.getValueAtIndex(this.hot.toPhysicalRow(row));
    let height = defaultHeight;
    if (cachedHeight !== null && cachedHeight > (defaultHeight || 0)) {
      height = cachedHeight;
    }
    return height;
  }

  /**
   * Get the calculated column header height.
   *
   * @returns {number|undefined}
   */
  getColumnHeaderHeight() {
    return this.headerHeight;
  }

  /**
   * Get the first visible row.
   *
   * @returns {number} Returns row index, -1 if table is not rendered or if there are no rows to base the the calculations on.
   */
  getFirstVisibleRow() {
    const wot = this.hot.view._wt;
    if (wot.wtViewport.rowsVisibleCalculator) {
      return wot.wtTable.getFirstVisibleRow();
    }
    if (wot.wtViewport.rowsRenderCalculator) {
      return wot.wtTable.getFirstRenderedRow();
    }
    return -1;
  }

  /**
   * Gets the last visible row.
   *
   * @returns {number} Returns row index or -1 if table is not rendered.
   */
  getLastVisibleRow() {
    const wot = this.hot.view._wt;
    if (wot.wtViewport.rowsVisibleCalculator) {
      return wot.wtTable.getLastVisibleRow();
    }
    if (wot.wtViewport.rowsRenderCalculator) {
      return wot.wtTable.getLastRenderedRow();
    }
    return -1;
  }

  /**
   * Clears cached heights.
   */
  clearCache() {
    this.headerHeight = null;
    this.rowHeightsMap.init();
  }

  /**
   * Clears cache by range.
   *
   * @param {object|number} range Row index or an object with `from` and `to` properties which define row range.
   */
  clearCacheByRange(range) {
    const {
      from,
      to
    } = typeof range === 'number' ? {
      from: range,
      to: range
    } : range;
    this.hot.batchExecution(() => {
      rangeEach(Math.min(from, to), Math.max(from, to), row => {
        this.rowHeightsMap.setValueAtIndex(row, null);
      });
    }, true);
  }

  /**
   * Checks if all heights were calculated. If not then return `true` (need recalculate).
   *
   * @returns {boolean}
   */
  isNeedRecalculate() {
    return !!arrayFilter(this.rowHeightsMap.getValues().slice(0, this.measuredRows), item => item === null).length;
  }
  /**
   * Destroys the plugin instance.
   */
  destroy() {
    this.ghostTable.clean();
    super.destroy();
  }
}
function _onBeforeViewRender() {
  const force = this.hot.renderCall;
  const fixedRowsBottom = this.hot.getSettings().fixedRowsBottom;
  const firstVisibleRow = this.getFirstVisibleRow();
  const lastVisibleRow = this.getLastVisibleRow();
  if (firstVisibleRow === -1 || lastVisibleRow === -1) {
    return;
  }
  this.calculateRowsHeight({
    from: firstVisibleRow,
    to: lastVisibleRow
  }, undefined, force);

  // Calculate rows height synchronously for bottom overlay
  if (fixedRowsBottom) {
    const totalRows = this.hot.countRows() - 1;
    this.calculateRowsHeight({
      from: totalRows - fixedRowsBottom,
      to: totalRows
    });
  }
  if (this.isNeedRecalculate() && !this.inProgress) {
    this.calculateAllRowsHeight();
  }
}
/**
 * On before row resize listener.
 *
 * @param {number} size The size of the current row index.
 * @param {number} row Current row index.
 * @param {boolean} isDblClick Indicates if the resize was triggered by doubleclick.
 * @returns {number}
 */
function _onBeforeRowResize(size, row, isDblClick) {
  let newSize = size;
  if (isDblClick) {
    this.calculateRowsHeight(row, undefined, true);
    newSize = this.getRowHeight(row);
  }
  return newSize;
}
/**
 * On after load data listener.
 */
function _onAfterLoadData() {
  if (this.hot.view) {
    this.recalculateAllRowsHeight();
  } else {
    // first load - initialization
    this.hot._registerTimeout(() => {
      if (this.hot) {
        this.recalculateAllRowsHeight();
      }
    });
  }
}
/**
 * On before change listener.
 *
 * @param {Array} changes 2D array containing information about each of the edited cells.
 */
function _onBeforeChange(changes) {
  let range = null;
  if (changes.length === 1) {
    range = changes[0][0];
  } else if (changes.length > 1) {
    range = {
      from: changes[0][0],
      to: changes[changes.length - 1][0]
    };
  }
  if (range !== null) {
    this.clearCacheByRange(range);
  }
}