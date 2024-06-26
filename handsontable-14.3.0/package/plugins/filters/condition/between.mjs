import * as C from "../../../i18n/constants.mjs";
import { registerCondition, getCondition } from "../conditionRegisterer.mjs";
import { CONDITION_NAME as CONDITION_DATE_AFTER } from "./date/after.mjs";
import { CONDITION_NAME as CONDITION_DATE_BEFORE } from "./date/before.mjs";
export const CONDITION_NAME = 'between';

/**
 * @param {object} dataRow The object which holds and describes the single cell value.
 * @param {Array} inputValues An array of values to compare with.
 * @param {number} inputValues."0" The minimum value of the range.
 * @param {number} inputValues."1" The maximum value of the range.
 * @returns {boolean}
 */
export function condition(dataRow, _ref) {
  let [from, to] = _ref;
  let fromValue = from;
  let toValue = to;
  if (dataRow.meta.type === 'numeric') {
    const _from = parseFloat(fromValue, 10);
    const _to = parseFloat(toValue, 10);
    fromValue = Math.min(_from, _to);
    toValue = Math.max(_from, _to);
  } else if (dataRow.meta.type === 'date') {
    const dateBefore = getCondition(CONDITION_DATE_BEFORE, [toValue]);
    const dateAfter = getCondition(CONDITION_DATE_AFTER, [fromValue]);
    return dateBefore(dataRow) && dateAfter(dataRow);
  }
  return dataRow.value >= fromValue && dataRow.value <= toValue;
}
registerCondition(CONDITION_NAME, condition, {
  name: C.FILTERS_CONDITIONS_BETWEEN,
  inputsCount: 2,
  showOperators: true
});