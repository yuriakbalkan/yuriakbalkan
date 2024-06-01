"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
var _element = require("./../../../../helpers/dom/element");
var _orderView = require("./../utils/orderView");
var _base = _interopRequireDefault(require("./_base"));
var _a11y = require("../../../../helpers/a11y");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Cell renderer responsible for managing (inserting, tracking, rendering) TD elements.
 *
 *   <tr> (root node)
 *     ├ <th>   --- RowHeadersRenderer
 *     ├ <td>   \
 *     ├ <td>    \
 *     ├ <td>     - CellsRenderer
 *     ├ <td>    /
 *     └ <td>   /.
 *
 * @class {CellsRenderer}
 */
class CellsRenderer extends _base.default {
  constructor() {
    super('TD');
    /**
     * Cache for OrderView classes connected to specified node.
     *
     * @type {WeakMap}
     */
    _defineProperty(this, "orderViews", new WeakMap());
    /**
     * Row index which specifies the row position of the processed cell.
     *
     * @type {number}
     */
    _defineProperty(this, "sourceRowIndex", 0);
  }

  /**
   * Obtains the instance of the SharedOrderView class which is responsible for rendering the nodes to the root node.
   *
   * @param {HTMLTableRowElement} rootNode The TR element, which is root element for cells (TD).
   * @returns {SharedOrderView}
   */
  obtainOrderView(rootNode) {
    let orderView;
    if (this.orderViews.has(rootNode)) {
      orderView = this.orderViews.get(rootNode);
    } else {
      orderView = new _orderView.SharedOrderView(rootNode, sourceColumnIndex => this.nodesPool.obtain(this.sourceRowIndex, sourceColumnIndex), this.nodeType);
      this.orderViews.set(rootNode, orderView);
    }
    return orderView;
  }

  /**
   * Renders the cells.
   */
  render() {
    const {
      rowsToRender,
      columnsToRender,
      rows,
      rowHeaders
    } = this.table;
    for (let visibleRowIndex = 0; visibleRowIndex < rowsToRender; visibleRowIndex++) {
      const sourceRowIndex = this.table.renderedRowToSource(visibleRowIndex);
      const TR = rows.getRenderedNode(visibleRowIndex);
      this.sourceRowIndex = sourceRowIndex;
      const orderView = this.obtainOrderView(TR);
      const rowHeadersView = rowHeaders.obtainOrderView(TR);

      // @TODO(perf-tip): For cells other than "visual 0" generating diff leads/commands can be skipped. New order view
      // should share state between next orderViews.
      orderView.prependView(rowHeadersView).setSize(columnsToRender).setOffset(this.table.renderedColumnToSource(0)).start();
      for (let visibleColumnIndex = 0; visibleColumnIndex < columnsToRender; visibleColumnIndex++) {
        orderView.render();
        const TD = orderView.getCurrentNode();
        const sourceColumnIndex = this.table.renderedColumnToSource(visibleColumnIndex);
        if (!(0, _element.hasClass)(TD, 'hide')) {
          // Workaround for hidden columns plugin
          TD.className = '';
        }
        TD.removeAttribute('style');
        TD.removeAttribute('dir');

        // Remove all accessibility-related attributes for the cell to start fresh.
        (0, _element.removeAttribute)(TD, [new RegExp('aria-(.*)'), new RegExp('role')]);
        this.table.cellRenderer(sourceRowIndex, sourceColumnIndex, TD);
        if (this.table.isAriaEnabled()) {
          var _this$table$rowUtils$, _this$table$rowUtils;
          (0, _element.setAttribute)(TD, [...(TD.hasAttribute('role') ? [] : [(0, _a11y.A11Y_GRIDCELL)()]), (0, _a11y.A11Y_TABINDEX)(-1),
          // `aria-colindex` is incremented by both tbody and thead rows.
          (0, _a11y.A11Y_COLINDEX)(sourceColumnIndex + ((_this$table$rowUtils$ = (_this$table$rowUtils = this.table.rowUtils) === null || _this$table$rowUtils === void 0 || (_this$table$rowUtils = _this$table$rowUtils.dataAccessObject) === null || _this$table$rowUtils === void 0 ? void 0 : _this$table$rowUtils.rowHeaders.length) !== null && _this$table$rowUtils$ !== void 0 ? _this$table$rowUtils$ : 0) + 1)]);
        }
      }
      orderView.end();
    }
  }
}
exports.default = CellsRenderer;