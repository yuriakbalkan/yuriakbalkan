"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * TableRenderer class collects all renderers and properties necessary for table creation. It's
 * responsible for adjusting and rendering each renderer.
 *
 * Below is a diagram of the renderers together with an indication of what they are responisble for.
 *   <table>
 *     <colgroup>  \ (root node)
 *       <col>      \
 *       <col>       \___ ColGroupRenderer
 *       <col>       /
 *       <col>      /
 *     </colgroup> /
 *     <thead>     \ (root node)
 *       <tr>       \
 *         <th>      \
 *         <th>       \____ ColumnHeadersRenderer
 *         <th>       /
 *         <th>      /
 *       </tr>      /
 *     </thead>    /
 *     <tbody>   ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\ (root node)
 *       <tr>   (root node)          \
 *         <th>  --- RowHeadersRenderer
 *         <td>  \                     \
 *         <td>   -- CellsRenderer      \
 *         <td>  /                       \
 *       </tr>                            \
 *       <tr>   (root node)                \
 *         <th>  --- RowHeadersRenderer     \
 *         <td>  \                           \___ RowsRenderer
 *         <td>   -- CellsRenderer           /
 *         <td>  /                          /
 *       </tr>                             /
 *       <tr>   (root node)               /
 *         <th>  --- RowHeadersRenderer  /
 *         <td>  \                      /
 *         <td>   -- CellsRenderer     /
 *         <td>  /                    /
 *       </tr>                       /
 *     </tbody>  ___________________/
 *   </table>.
 *
 * @class {RowsRenderer}
 */
class TableRenderer {
  constructor(rootNode) {
    let {
      cellRenderer
    } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    /**
     * Table element which will be used to render the children element.
     *
     * @type {HTMLTableElement}
     */
    _defineProperty(this, "rootNode", void 0);
    /**
     * Document owner of the root node.
     *
     * @type {HTMLDocument}
     */
    _defineProperty(this, "rootDocument", void 0);
    /**
     * Renderer class responsible for rendering row headers.
     *
     * @type {RowsRenderer}
     */
    _defineProperty(this, "rowHeaders", null);
    /**
     * Renderer class responsible for rendering column headers.
     *
     * @type {ColumnHeadersRenderer}
     */
    _defineProperty(this, "columnHeaders", null);
    /**
     * Renderer class responsible for rendering col in colgroup.
     *
     * @type {ColGroupRenderer}
     */
    _defineProperty(this, "colGroup", null);
    /**
     * Renderer class responsible for rendering rows in tbody.
     *
     * @type {RowsRenderer}
     */
    _defineProperty(this, "rows", null);
    /**
     * Renderer class responsible for rendering cells.
     *
     * @type {CellsRenderer}
     */
    _defineProperty(this, "cells", null);
    /**
     * Row filter which contains all necessary information about row index transformation.
     *
     * @type {RowFilter}
     */
    _defineProperty(this, "rowFilter", null);
    /**
     * Column filter which contains all necessary information about column index transformation.
     *
     * @type {ColumnFilter}
     */
    _defineProperty(this, "columnFilter", null);
    /**
     * Row utils class which contains all necessary information about sizes of the rows.
     *
     * @type {RowUtils}
     */
    _defineProperty(this, "rowUtils", null);
    /**
     * Column utils class which contains all necessary information about sizes of the columns.
     *
     * @type {ColumnUtils}
     */
    _defineProperty(this, "columnUtils", null);
    /**
     * Indicates how much rows should be rendered to fill whole table viewport.
     *
     * @type {number}
     */
    _defineProperty(this, "rowsToRender", 0);
    /**
     * Indicates how much columns should be rendered to fill whole table viewport.
     *
     * @type {number}
     */
    _defineProperty(this, "columnsToRender", 0);
    /**
     * An array of functions to be used as a content factory to row headers.
     *
     * @type {Function[]}
     */
    _defineProperty(this, "rowHeaderFunctions", []);
    /**
     * Count of the function used to render row headers.
     *
     * @type {number}
     */
    _defineProperty(this, "rowHeadersCount", 0);
    /**
     * An array of functions to be used as a content factory to column headers.
     *
     * @type {Function[]}
     */
    _defineProperty(this, "columnHeaderFunctions", []);
    /**
     * Count of the function used to render column headers.
     *
     * @type {number}
     */
    _defineProperty(this, "columnHeadersCount", 0);
    /**
     * Cell renderer used to render cells content.
     *
     * @type {Function}
     */
    _defineProperty(this, "cellRenderer", void 0);
    this.rootNode = rootNode;
    this.rootDocument = this.rootNode.ownerDocument;
    this.cellRenderer = cellRenderer;
  }

  /**
   * Set row and column util classes.
   *
   * @param {RowUtils} rowUtils RowUtils instance which provides useful methods related to row sizes.
   * @param {ColumnUtils} columnUtils ColumnUtils instance which provides useful methods related to row sizes.
   */
  setAxisUtils(rowUtils, columnUtils) {
    this.rowUtils = rowUtils;
    this.columnUtils = columnUtils;
  }

  /**
   * Sets viewport size of the table.
   *
   * @param {number} rowsCount An amount of rows to render.
   * @param {number} columnsCount An amount of columns to render.
   */
  setViewportSize(rowsCount, columnsCount) {
    this.rowsToRender = rowsCount;
    this.columnsToRender = columnsCount;
  }

  /**
   * Sets row and column filter instances.
   *
   * @param {RowFilter} rowFilter Row filter instance which contains all necessary information about row index transformation.
   * @param {ColumnFilter} columnFilter Column filter instance which contains all necessary information about row
   * index transformation.
   */
  setFilters(rowFilter, columnFilter) {
    this.rowFilter = rowFilter;
    this.columnFilter = columnFilter;
  }

  /**
   * Sets row and column header functions.
   *
   * @param {Function[]} rowHeaders Row header functions. Factories for creating content for row headers.
   * @param {Function[]} columnHeaders Column header functions. Factories for creating content for column headers.
   */
  setHeaderContentRenderers(rowHeaders, columnHeaders) {
    this.rowHeaderFunctions = rowHeaders;
    this.rowHeadersCount = rowHeaders.length;
    this.columnHeaderFunctions = columnHeaders;
    this.columnHeadersCount = columnHeaders.length;
  }

  /**
   * Sets table renderers.
   *
   * @param {renderers} renderers The renderer units.
   * @param {RowHeadersRenderer} renderers.rowHeaders Row headers renderer.
   * @param {ColumnHeadersRenderer} renderers.columnHeaders Column headers renderer.
   * @param {ColGroupRenderer} renderers.colGroup Col group renderer.
   * @param {RowsRenderer} renderers.rows Rows renderer.
   * @param {CellsRenderer} renderers.cells Cells renderer.
   */
  setRenderers() {
    let {
      rowHeaders,
      columnHeaders,
      colGroup,
      rows,
      cells
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    rowHeaders.setTable(this);
    columnHeaders.setTable(this);
    colGroup.setTable(this);
    rows.setTable(this);
    cells.setTable(this);
    this.rowHeaders = rowHeaders;
    this.columnHeaders = columnHeaders;
    this.colGroup = colGroup;
    this.rows = rows;
    this.cells = cells;
  }

  /**
   * Transforms visual/rendered row index to source index.
   *
   * @param {number} rowIndex Rendered index.
   * @returns {number}
   */
  renderedRowToSource(rowIndex) {
    return this.rowFilter.renderedToSource(rowIndex);
  }

  /**
   * Transforms visual/rendered column index to source index.
   *
   * @param {number} columnIndex Rendered index.
   * @returns {number}
   */
  renderedColumnToSource(columnIndex) {
    return this.columnFilter.renderedToSource(columnIndex);
  }

  /**
   * Returns `true` if the accessibility-related ARIA tags should be added to the table, `false` otherwise.
   *
   * @returns {boolean}
   */
  isAriaEnabled() {
    return this.rowUtils.wtSettings.getSetting('ariaTags');
  }

  /**
   * Renders the table.
   */
  render() {
    this.colGroup.adjust();
    this.columnHeaders.adjust();
    this.rows.adjust();
    this.rowHeaders.adjust();
    this.columnHeaders.render();
    this.rows.render();
    this.rowHeaders.render();
    this.cells.render();

    // After the cells are rendered calculate columns width (or columns stretch width) to prepare proper values
    // for colGroup renderer (which renders COL elements).
    this.columnUtils.calculateWidths();
    this.colGroup.render();
    const {
      rowsToRender,
      rows
    } = this;

    // Fix for multi-line content and for supporting `rowHeights` option.
    for (let visibleRowIndex = 0; visibleRowIndex < rowsToRender; visibleRowIndex++) {
      const TR = rows.getRenderedNode(visibleRowIndex);
      if (TR.firstChild) {
        const sourceRowIndex = this.renderedRowToSource(visibleRowIndex);
        const rowHeight = this.rowUtils.getHeight(sourceRowIndex);
        if (rowHeight) {
          // Decrease height. 1 pixel will be "replaced" by 1px border top
          TR.firstChild.style.height = `${rowHeight - 1}px`;
        } else {
          TR.firstChild.style.height = '';
        }
      }
    }
  }
}
exports.default = TableRenderer;