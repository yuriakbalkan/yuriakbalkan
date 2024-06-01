import "core-js/modules/es.error.cause.js";
import "core-js/modules/es.array.push.js";
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { arrayEach, arrayMap, arrayReduce } from "../../helpers/array.mjs";
import { mixin } from "../../helpers/object.mjs";
import { toSingleLine } from "../../helpers/templateLiteralTag.mjs";
import localHooks from "../../mixins/localHooks.mjs";
import { getCondition } from "./conditionRegisterer.mjs";
import { OPERATION_ID as OPERATION_AND } from "./logicalOperations/conjunction.mjs";
import { operations, getOperationFunc } from "./logicalOperationRegisterer.mjs";
import { isUndefined } from "../../helpers/mixed.mjs";
import { LinkedPhysicalIndexToValueMap as IndexToValueMap } from "../../translations/index.mjs";
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
    _defineProperty(this, "filteringStates", new IndexToValueMap());
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
    let operationType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : OPERATION_AND;
    if (conditions.length) {
      return getOperationFunc(operationType)(conditions, value);
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
    let operation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : OPERATION_AND;
    let position = arguments.length > 3 ? arguments[3] : undefined;
    const localeForColumn = this.hot.getCellMeta(0, column).locale;
    const args = arrayMap(conditionDefinition.args, v => typeof v === 'string' ? v.toLocaleLowerCase(localeForColumn) : v);
    const name = conditionDefinition.name || conditionDefinition.command.key;
    this.runLocalHooks('beforeAdd', column);
    const columnType = this.getOperation(column);
    if (columnType) {
      if (columnType !== operation) {
        throw Error(toSingleLine`The column of index ${column} has been already applied with a \`${columnType}\`\x20
        filter operation. Use \`removeConditions\` to clear the current conditions and then add new ones.\x20
        Mind that you cannot mix different types of operations (for instance, if you use \`conjunction\`,\x20
        use it consequently for a particular column).`);
      }
    } else if (isUndefined(operations[operation])) {
      throw new Error(toSingleLine`Unexpected operation named \`${operation}\`. Possible ones are\x20
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
          func: getCondition(name, args)
        }]
      }, position);
    } else {
      // Add next condition for particular column (by reference).
      conditionsForColumn.push({
        name,
        args,
        func: getCondition(name, args)
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
    return arrayReduce(this.filteringStates.getEntries(), (allConditions, _ref2) => {
      let [column, {
        operation,
        conditions
      }] = _ref2;
      allConditions.push({
        column,
        operation,
        conditions: arrayMap(conditions, _ref3 => {
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
    arrayEach(conditions, stack => {
      arrayEach(stack.conditions, condition => this.addCondition(stack.column, condition));
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
mixin(ConditionCollection, localHooks);
export default ConditionCollection;