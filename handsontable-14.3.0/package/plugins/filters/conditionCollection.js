"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
require("core-js/modules/es.array.push.js");
var _array = require("../../helpers/array");
var _object = require("../../helpers/object");
var _templateLiteralTag = require("../../helpers/templateLiteralTag");
var _localHooks = _interopRequireDefault(require("../../mixins/localHooks"));
var _conditionRegisterer = require("./conditionRegisterer");
var _conjunction = require("./logicalOperations/conjunction");
var _logicalOperationRegisterer = require("./logicalOperationRegisterer");
var _mixed = require("../../helpers/mixed");
var _translations = require("../../translations");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const MAP_NAME = 'ConditionCollection.filteringStates';

/**
 * @private
 * @class ConditionCollection
 */
class ConditionCollection {
  constructor(hot) {
    let isMapRegistrable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    /**
     * Handsontable instance.
     *
     * @type {Core}
     */
    _defineProperty(this, "hot", void 0);
    /**
     * Indicates whether the internal IndexMap should be registered or not. Generally,
     * registered Maps responds to the index changes. Within that collection, sometimes
     * this is not necessary.
     *
     * @type {boolean}
     */
    _defineProperty(this, "isMapRegistrable", void 0);
    /**
     * Index map storing filtering states for every column. ConditionCollection write and read to/from element.
     *
     * @type {LinkedPhysicalIndexToValueMap}
     */
    _defineProperty(this, "filteringStates", new _translations.LinkedPhysicalIndexToValueMap());
    this.hot = hot;
    this.isMapRegistrable = isMapRegistrable;
    if (this.isMapRegistrable === true) {
      this.hot.columnIndexMapper.registerMap(MAP_NAME, this.filteringStates);
    } else {
      this.filteringStates.init(this.hot.columnIndexMapper.getNumberOfIndexes());
    }
  }

  /**
   * Check if condition collection is empty (so no needed to filter data).
   *
   * @returns {boolean}
   */
  isEmpty() {
    return this.getFilteredColumns().length === 0;
  }

  /**
   * Check if value is matched to the criteria of conditions chain.
   *
   * @param {object} value Object with `value` and `meta` keys.
   * @param {number} column The physical column index.
   * @returns {boolean}
   */
  isMatch(value, column) {
    var _stateForColumn$condi;
    const stateForColumn = this.filteringStates.getValueAtIndex(column);
    const conditions = (_stateForColumn$condi = stateForColumn === null || stateForColumn === void 0 ? void 0 : stateForColumn.conditions) !== null && _stateForColumn$condi !== void 0 ? _stateForColumn$condi : [];
    const operation = stateForColumn === null || stateForColumn === void 0 ? void 0 : stateForColumn.operation;
    return this.isMatchInConditions(conditions, value, operation);
  }

  /**
   * Check if the value is matches the conditions.
   *
   * @param {Array} conditions List of conditions.
   * @param {object} value Object with `value` and `meta` keys.
   * @param {string} [operationType='conjunction'] Type of conditions operation.
   * @returns {boolean}
   */
  isMatchInConditions(conditions, value) {
    let operationType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _conjunction.OPERATION_ID;
    if (conditions.length) {
      return (0, _logicalOperationRegisterer.getOperationFunc)(operationType)(conditions, value);
    }
    return true;
  }

  /**
   * Add condition to the collection.
   *
   * @param {number} column The physical column index.
   * @param {object} conditionDefinition Object with keys:
   *  * `command` Object, Command object with condition name as `key` property.
   *  * `args` Array, Condition arguments.
   * @param {string} [operation='conjunction'] Type of conditions operation.
   * @param {number} [position] Position to which condition will be added. When argument is undefined
   * the condition will be processed as the last condition.
   * @fires ConditionCollection#beforeAdd
   * @fires ConditionCollection#afterAdd
   */
  addCondition(column, conditionDefinition) {
    let operation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _conjunction.OPERATION_ID;
    let position = arguments.length > 3 ? arguments[3] : undefined;
    const localeForColumn = this.hot.getCellMeta(0, column).locale;
    const args = (0, _array.arrayMap)(conditionDefinition.args, v => typeof v === 'string' ? v.toLocaleLowerCase(localeForColumn) : v);
    const name = conditionDefinition.name || conditionDefinition.command.key;
    this.runLocalHooks('beforeAdd', column);
    const columnType = this.getOperation(column);
    if (columnType) {
      if (columnType !== operation) {
        throw Error((0, _templateLiteralTag.toSingleLine)`The column of index ${column} has been already applied with a \`${columnType}\`\x20
        filter operation. Use \`removeConditions\` to clear the current conditions and then add new ones.\x20
        Mind that you cannot mix different types of operations (for instance, if you use \`conjunction\`,\x20
        use it consequently for a particular column).`);
      }
    } else if ((0, _mixed.isUndefined)(_logicalOperationRegisterer.operations[operation])) {
      throw new Error((0, _templateLiteralTag.toSingleLine)`Unexpected operation named \`${operation}\`. Possible ones are\x20
        \`disjunction\` and \`conjunction\`.`);
    }
    const conditionsForColumn = this.getConditions(column);
    if (conditionsForColumn.length === 0) {
      // Create first condition for particular column.
      this.filteringStates.setValueAtIndex(column, {
        operation,
        conditions: [{
          name,
          args,
          func: (0, _conditionRegisterer.getCondition)(name, args)
        }]
      }, position);
    } else {
      // Add next condition for particular column (by reference).
      conditionsForColumn.push({
        name,
        args,
        func: (0, _conditionRegisterer.getCondition)(name, args)
      });
    }
    this.runLocalHooks('afterAdd', column);
  }

  /**
   * Get all added conditions from the collection at specified column index.
   *
   * @param {number} column The physical column index.
   * @returns {Array} Returns conditions collection as an array.
   */
  getConditions(column) {
    var _this$filteringStates, _this$filteringStates2;
    return (_this$filteringStates = (_this$filteringStates2 = this.filteringStates.getValueAtIndex(column)) === null || _this$filteringStates2 === void 0 ? void 0 : _this$filteringStates2.conditions) !== null && _this$filteringStates !== void 0 ? _this$filteringStates : [];
  }

  /**
   * Get operation for particular column.
   *
   * @param {number} column The physical column index.
   * @returns {string|undefined}
   */
  getOperation(column) {
    var _this$filteringStates3;
    return (_this$filteringStates3 = this.filteringStates.getValueAtIndex(column)) === null || _this$filteringStates3 === void 0 ? void 0 : _this$filteringStates3.operation;
  }

  /**
   * Get all filtered physical columns in the order in which actions are performed.
   *
   * @returns {Array}
   */
  getFilteredColumns() {
    return this.filteringStates.getEntries().map(_ref => {
      let [physicalColumn] = _ref;
      return physicalColumn;
    });
  }

  /**
   * Gets position in the filtering states stack for the specific column.
   *
   * @param {number} column The physical column index.
   * @returns {number} Returns -1 when the column doesn't exist in the stack.
   */
  getColumnStackPosition(column) {
    return this.getFilteredColumns().indexOf(column);
  }

  /**
   * Export all previously added conditions.
   *
   * @returns {Array}
   */
  exportAllConditions() {
    return (0, _array.arrayReduce)(this.filteringStates.getEntries(), (allConditions, _ref2) => {
      let [column, {
        operation,
        conditions
      }] = _ref2;
      allConditions.push({
        column,
        operation,
        conditions: (0, _array.arrayMap)(conditions, _ref3 => {
          let {
            name,
            args
          } = _ref3;
          return {
            name,
            args
          };
        })
      });
      return allConditions;
    }, []);
  }

  /**
   * Import conditions to the collection.
   *
   * @param {Array} conditions The collection of the conditions.
   */
  importAllConditions(conditions) {
    this.clean();
    (0, _array.arrayEach)(conditions, stack => {
      (0, _array.arrayEach)(stack.conditions, condition => this.addCondition(stack.column, condition));
    });
  }

  /**
   * Remove conditions at given column index.
   *
   * @param {number} column The physical column index.
   * @fires ConditionCollection#beforeRemove
   * @fires ConditionCollection#afterRemove
   */
  removeConditions(column) {
    this.runLocalHooks('beforeRemove', column);
    this.filteringStates.clearValue(column);
    this.runLocalHooks('afterRemove', column);
  }

  /**
   * Clean all conditions collection and reset order stack.
   *
   * @fires ConditionCollection#beforeClean
   * @fires ConditionCollection#afterClean
   */
  clean() {
    this.runLocalHooks('beforeClean');
    this.filteringStates.clear();
    this.runLocalHooks('afterClean');
  }

  /**
   * Check if at least one condition was added at specified column index. And if second parameter is passed then additionally
   * check if condition exists under its name.
   *
   * @param {number} column The physical column index.
   * @param {string} [name] Condition name.
   * @returns {boolean}
   */
  hasConditions(column, name) {
    const conditions = this.getConditions(column);
    if (name) {
      return conditions.some(condition => condition.name === name);
    }
    return conditions.length > 0;
  }

  /**
   * Destroy object.
   */
  destroy() {
    if (this.isMapRegistrable) {
      this.hot.columnIndexMapper.unregisterMap(MAP_NAME);
    }
    this.filteringStates = null;
    this.clearLocalHooks();
  }
}
(0, _object.mixin)(ConditionCollection, _localHooks.default);
var _default = exports.default = ConditionCollection;