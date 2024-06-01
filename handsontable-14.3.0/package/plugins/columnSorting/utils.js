"use strict";

exports.__esModule = true;
exports.areValidSortStates = areValidSortStates;
exports.getHeaderSpanElement = getHeaderSpanElement;
exports.getNextSortOrder = getNextSortOrder;
exports.isFirstLevelColumnHeader = isFirstLevelColumnHeader;
exports.wasHeaderClickedProperly = wasHeaderClickedProperly;
var _object = require("../../helpers/object");
var _event = require("../../helpers/dom/event");
const ASC_SORT_STATE = exports.ASC_SORT_STATE = 'asc';
const DESC_SORT_STATE = exports.DESC_SORT_STATE = 'desc';
const HEADER_SPAN_CLASS = exports.HEADER_SPAN_CLASS = 'colHeader';

/**
 * Get if column state is valid.
 *
 * @param {number} columnState Particular column state.
 * @returns {boolean}
 */
function isValidColumnState(columnState) {
  if ((0, _object.isObject)(columnState) === false) {
    return false;
  }
  const {
    column,
    sortOrder
  } = columnState;
  return Number.isInteger(column) && [ASC_SORT_STATE, DESC_SORT_STATE].includes(sortOrder);
}

/**
 * Get if all sorted columns states are valid.
 *
 * @param {Array} sortStates The sort state collection.
 * @returns {boolean}
 */
function areValidSortStates(sortStates) {
  if (sortStates.some(columnState => isValidColumnState(columnState) === false)) {
    return false;
  }
  const sortedColumns = sortStates.map(_ref => {
    let {
      column
    } = _ref;
    return column;
  });

  // Indexes occurs only once.
  return new Set(sortedColumns).size === sortedColumns.length;
}

/**
 * Get next sort order for particular column. The order sequence looks as follows: 'asc' -> 'desc' -> undefined -> 'asc'.
 *
 * @param {string|undefined} sortOrder Sort order (`asc` for ascending, `desc` for descending and undefined for not sorted).
 * @returns {string|undefined} Next sort order (`asc` for ascending, `desc` for descending and undefined for not sorted).
 */
function getNextSortOrder(sortOrder) {
  if (sortOrder === DESC_SORT_STATE) {
    return;
  } else if (sortOrder === ASC_SORT_STATE) {
    return DESC_SORT_STATE;
  }
  return ASC_SORT_STATE;
}

/**
 * Get `span` DOM element inside `th` DOM element.
 *
 * @param {Element} TH Th HTML element.
 * @returns {Element | null}
 */
function getHeaderSpanElement(TH) {
  const headerSpanElement = TH.querySelector(`.${HEADER_SPAN_CLASS}`);
  return headerSpanElement;
}

/**
 *
 * Get if handled header is first level column header.
 *
 * @param {number} column Visual column index.
 * @param {Element} TH Th HTML element.
 * @returns {boolean}
 */
function isFirstLevelColumnHeader(column, TH) {
  if (column < 0 || !TH.parentNode) {
    return false;
  }
  const TRs = TH.parentNode.parentNode.childNodes;
  const headerLevel = Array.from(TRs).indexOf(TH.parentNode) - TRs.length;
  if (headerLevel !== -1) {
    return false;
  }
  return true;
}

/**
 *  Get if header was clicked properly. Click on column header and NOT done by right click return `true`.
 *
 * @param {number} row Visual row index.
 * @param {number} column Visual column index.
 * @param {Event} clickEvent Click event.
 * @returns {boolean}
 */
function wasHeaderClickedProperly(row, column, clickEvent) {
  return row === -1 && column >= 0 && (0, _event.isRightClick)(clickEvent) === false;
}