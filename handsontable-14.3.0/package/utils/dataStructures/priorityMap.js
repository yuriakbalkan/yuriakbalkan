"use strict";

exports.__esModule = true;
exports.createPriorityMap = createPriorityMap;
require("core-js/modules/es.error.cause.js");
var _number = require("../../helpers/number");
var _function = require("../../helpers/function");
const ASC = exports.ASC = 'asc';
const DESC = exports.DESC = 'desc';
const ORDER_MAP = new Map([[ASC, [-1, 1]], [DESC, [1, -1]]]);
const DEFAULT_ERROR_PRIORITY_EXISTS = priority => `The priority '${priority}' is already declared in a map.`;
const DEFAULT_ERROR_PRIORITY_NAN = priority => `The priority '${priority}' is not a number.`;

/**
 * @typedef {object} PriorityMap
 * @property {Function} addItem Adds items to the priority map.
 * @property {Function} getItems Gets items from the passed map in a ASC or DESC order of priorities.
 */
/**
 * Creates a new priority map.
 *
 * @param {object} config The config for priority map.
 * @param {Function} config.errorPriorityExists The function to generate a custom error message if priority is already taken.
 * @param {Function} config.errorPriorityNaN The function to generate a custom error message if priority is not a number.
 * @returns {PriorityMap}
 */
function createPriorityMap() {
  let {
    errorPriorityExists,
    errorPriorityNaN
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const priorityMap = new Map();
  errorPriorityExists = (0, _function.isFunction)(errorPriorityExists) ? errorPriorityExists : DEFAULT_ERROR_PRIORITY_EXISTS;
  errorPriorityNaN = (0, _function.isFunction)(errorPriorityNaN) ? errorPriorityNaN : DEFAULT_ERROR_PRIORITY_NAN;

  /**
   * Adds items to priority map. Throws an error if `priority` is not a number or if is already added.
   *
   * @param {number} priority The priority for adding item.
   * @param {*} item The adding item.
   */
  function addItem(priority, item) {
    if (!(0, _number.isNumeric)(priority)) {
      throw new Error(errorPriorityNaN(priority));
    }
    if (priorityMap.has(priority)) {
      throw new Error(errorPriorityExists(priority));
    }
    priorityMap.set(priority, item);
  }

  /**
   * Gets items from the passed map in a ASC or DESC order of priorities.
   *
   * @param {string} [order] The order for getting items. ASC is an default.
   * @returns {*}
   */
  function getItems() {
    let order = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ASC;
    const [left, right] = ORDER_MAP.get(order) || ORDER_MAP.get(ASC);
    return [...priorityMap]
    // we want to be sure we sort over a priority key
    // if we are sure we can remove custom compare function
    // then we should replace next line with a default `.sort()`
    .sort((a, b) => a[0] < b[0] ? left : right).map(item => item[1]);
  }
  return {
    addItem,
    getItems
  };
}