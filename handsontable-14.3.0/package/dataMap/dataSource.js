"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
require("core-js/modules/es.array.push.js");
var _object = require("../helpers/object");
var _data = require("../helpers/data");
var _array = require("../helpers/array");
var _number = require("../helpers/number");
var _function = require("../helpers/function");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @class DataSource
 * @private
 */
class DataSource {
  constructor(hotInstance) {
    let dataSource = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    /**
     * Instance of Handsontable.
     *
     * @type {Handsontable}
     */
    _defineProperty(this, "hot", void 0);
    /**
     * Data source.
     *
     * @type {Array}
     */
    _defineProperty(this, "data", void 0);
    /**
     * Type of data source.
     *
     * @type {string}
     * @default 'array'
     */
    _defineProperty(this, "dataType", 'array');
    _defineProperty(this, "colToProp", () => {});
    _defineProperty(this, "propToCol", () => {});
    this.hot = hotInstance;
    this.data = dataSource;
  }

  /**
   * Run the `modifyRowData` hook and return either the modified or the source data for the provided row.
   *
   * @private
   * @param {number} rowIndex Row index.
   * @returns {Array|object} Source or modified row of data.
   */
  modifyRowData(rowIndex) {
    let modifyRowData;
    if (this.hot.hasHook('modifyRowData')) {
      modifyRowData = this.hot.runHooks('modifyRowData', rowIndex);
    }
    return modifyRowData !== undefined && !Number.isInteger(modifyRowData) ? modifyRowData : this.data[rowIndex];
  }

  /**
   * Get all data.
   *
   * @param {boolean} [toArray=false] If `true` return source data as an array of arrays even when source data was provided
   *                                  in another format.
   * @returns {Array}
   */
  getData() {
    let toArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    if (!this.data || this.data.length === 0) {
      return this.data;
    }
    return this.getByRange(null, null, toArray);
  }

  /**
   * Set new data source.
   *
   * @param {Array} data The new data.
   */
  setData(data) {
    this.data = data;
  }

  /**
   * Returns array of column values from the data source. `column` is the index of the row in the data source.
   *
   * @param {number} column Visual column index.
   * @returns {Array}
   */
  getAtColumn(column) {
    const result = [];
    (0, _array.arrayEach)(this.data, (row, rowIndex) => {
      const value = this.getAtCell(rowIndex, column);
      result.push(value);
    });
    return result;
  }

  /**
   * Returns a single row of the data or a subset of its columns. If a column range or `toArray` arguments are provided, it
   * operates only on the columns declared by the `columns` setting or the data schema.
   *
   * @param {number} row Physical row index.
   * @param {number} [startColumn] Starting index for the column range (optional).
   * @param {number} [endColumn] Ending index for the column range (optional).
   * @param {boolean} [toArray=false] `true` if the returned value should be forced to be presented as an array.
   * @returns {Array|object}
   */
  getAtRow(row, startColumn, endColumn) {
    let toArray = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    const getAllProps = startColumn === undefined && endColumn === undefined;
    let dataRow = null;
    let newDataRow = null;
    dataRow = this.modifyRowData(row);
    if (Array.isArray(dataRow)) {
      newDataRow = [];
      if (getAllProps) {
        dataRow.forEach((cell, column) => {
          newDataRow[column] = this.getAtPhysicalCell(row, column, dataRow);
        });
      } else {
        // Only the columns from the provided range
        (0, _number.rangeEach)(startColumn, endColumn, column => {
          newDataRow[column - startColumn] = this.getAtPhysicalCell(row, column, dataRow);
        });
      }
    } else if ((0, _object.isObject)(dataRow) || (0, _function.isFunction)(dataRow)) {
      if (toArray) {
        newDataRow = [];
      } else {
        newDataRow = {};
      }
      if (!getAllProps || toArray) {
        const rangeStart = 0;
        const rangeEnd = this.countFirstRowKeys() - 1;
        (0, _number.rangeEach)(rangeStart, rangeEnd, column => {
          const prop = this.colToProp(column);
          if (column >= (startColumn || rangeStart) && column <= (endColumn || rangeEnd) && !Number.isInteger(prop)) {
            const cellValue = this.getAtPhysicalCell(row, prop, dataRow);
            if (toArray) {
              newDataRow.push(cellValue);
            } else {
              (0, _object.setProperty)(newDataRow, prop, cellValue);
            }
          }
        });
      } else {
        (0, _object.objectEach)(dataRow, (value, prop) => {
          (0, _object.setProperty)(newDataRow, prop, this.getAtPhysicalCell(row, prop, dataRow));
        });
      }
    }
    return newDataRow;
  }

  /**
   * Set the provided value in the source data set at the provided coordinates.
   *
   * @param {number} row Physical row index.
   * @param {number|string} column Property name / physical column index.
   * @param {*} value The value to be set at the provided coordinates.
   */
  setAtCell(row, column, value) {
    if (row >= this.countRows() || column >= this.countFirstRowKeys()) {
      // Not enough rows and/or columns.
      return;
    }
    if (this.hot.hasHook('modifySourceData')) {
      const valueHolder = (0, _object.createObjectPropListener)(value);
      this.hot.runHooks('modifySourceData', row, column, valueHolder, 'set');
      if (valueHolder.isTouched()) {
        value = valueHolder.value;
      }
    }
    if (!Number.isInteger(column)) {
      // column argument is the prop name
      (0, _object.setProperty)(this.data[row], column, value);
    } else {
      this.data[row][column] = value;
    }
  }

  /**
   * Get data from the source data set using the physical indexes.
   *
   * @private
   * @param {number} row Physical row index.
   * @param {string|number|Function} column Physical column index / property / function.
   * @param {Array|object} dataRow A representation of a data row.
   * @returns {*} Value at the provided coordinates.
   */
  getAtPhysicalCell(row, column, dataRow) {
    let result = null;
    if (dataRow) {
      if (typeof column === 'string') {
        result = (0, _object.getProperty)(dataRow, column);
      } else if (typeof column === 'function') {
        result = column(dataRow);
      } else {
        result = dataRow[column];
      }
    }
    if (this.hot.hasHook('modifySourceData')) {
      const valueHolder = (0, _object.createObjectPropListener)(result);
      this.hot.runHooks('modifySourceData', row, column, valueHolder, 'get');
      if (valueHolder.isTouched()) {
        result = valueHolder.value;
      }
    }
    return result;
  }

  /**
   * Returns a single value from the data.
   *
   * @param {number} row Physical row index.
   * @param {number} columnOrProp Visual column index or property.
   * @returns {*}
   */
  getAtCell(row, columnOrProp) {
    const dataRow = this.modifyRowData(row);
    return this.getAtPhysicalCell(row, this.colToProp(columnOrProp), dataRow);
  }

  /**
   * Returns source data by passed range.
   *
   * @param {object} [start] Object with physical `row` and `col` keys (or visual column index, if data type is an array of objects).
   * @param {object} [end] Object with physical `row` and `col` keys (or visual column index, if data type is an array of objects).
   * @param {boolean} [toArray=false] If `true` return source data as an array of arrays even when source data was provided
   *                                  in another format.
   * @returns {Array}
   */
  getByRange() {
    let start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    let end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    let toArray = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let getAllProps = false;
    let startRow = null;
    let startCol = null;
    let endRow = null;
    let endCol = null;
    if (start === null || end === null) {
      getAllProps = true;
      startRow = 0;
      endRow = this.countRows() - 1;
    } else {
      startRow = Math.min(start.row, end.row);
      startCol = Math.min(start.col, end.col);
      endRow = Math.max(start.row, end.row);
      endCol = Math.max(start.col, end.col);
    }
    const result = [];
    (0, _number.rangeEach)(startRow, endRow, currentRow => {
      result.push(getAllProps ? this.getAtRow(currentRow, undefined, undefined, toArray) : this.getAtRow(currentRow, startCol, endCol, toArray));
    });
    return result;
  }

  /**
   * Count number of rows.
   *
   * @returns {number}
   */
  countRows() {
    if (this.hot.hasHook('modifySourceLength')) {
      const modifiedSourceLength = this.hot.runHooks('modifySourceLength');
      if (Number.isInteger(modifiedSourceLength)) {
        return modifiedSourceLength;
      }
    }
    return this.data.length;
  }

  /**
   * Count number of columns.
   *
   * @returns {number}
   */
  countFirstRowKeys() {
    return (0, _data.countFirstRowKeys)(this.data);
  }

  /**
   * Destroy instance.
   */
  destroy() {
    this.data = null;
    this.hot = null;
  }
}
var _default = exports.default = DataSource;