import { HIGHLIGHT_ROW_TYPE } from "../../../3rdparty/walkontable/src/index.mjs";
import VisualSelection from "../visualSelection.mjs";
/**
 * Creates the new instance of Selection, responsible for highlighting cells in a rows and
 * row headers.
 * This type of selection can occur multiple times.
 *
 * @param {object} highlightParams A configuration object to create a highlight.
 * @param {string} highlightParams.rowClassName Highlighted row' class name.
 * @returns {Selection}
 */
export function createHighlight(_ref) {
  let {
    rowClassName,
    ...restOptions
  } = _ref;
  return new VisualSelection({
    className: rowClassName,
    ...restOptions,
    selectionType: HIGHLIGHT_ROW_TYPE
  });
}