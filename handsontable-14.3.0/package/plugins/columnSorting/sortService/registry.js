"use strict";

exports.__esModule = true;
exports.getCompareFunctionFactory = getCompareFunctionFactory;
var _default = require("../sortFunction/default");
var _numeric = require("../sortFunction/numeric");
var _checkbox = require("../sortFunction/checkbox");
var _date = require("../sortFunction/date");
var _staticRegister = _interopRequireDefault(require("../../../utils/staticRegister"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const {
  register: registerCompareFunctionFactory,
  getItem: getGloballyCompareFunctionFactory,
  hasItem: hasGloballyCompareFunctionFactory
} = (0, _staticRegister.default)('sorting.compareFunctionFactory');
const {
  register: registerRootComparator,
  getItem: getRootComparator
} = (0, _staticRegister.default)('sorting.mainSortComparator');

/**
 * Gets sort function for the particular column basing on it's data type.
 *
 * @param {string} type The data type.
 * @returns {Function}
 */
exports.getRootComparator = getRootComparator;
exports.registerRootComparator = registerRootComparator;
function getCompareFunctionFactory(type) {
  if (hasGloballyCompareFunctionFactory(type)) {
    return getGloballyCompareFunctionFactory(type);
  }
  return getGloballyCompareFunctionFactory(_default.COLUMN_DATA_TYPE);
}
registerCompareFunctionFactory(_numeric.COLUMN_DATA_TYPE, _numeric.compareFunctionFactory);
registerCompareFunctionFactory(_checkbox.COLUMN_DATA_TYPE, _checkbox.compareFunctionFactory);
registerCompareFunctionFactory(_date.COLUMN_DATA_TYPE, _date.compareFunctionFactory);
registerCompareFunctionFactory(_default.COLUMN_DATA_TYPE, _default.compareFunctionFactory);