import { columnHeaderScrollStrategy } from "./scrollStrategies/columnHeaderScroll.mjs";
import { cornerHeaderScrollStrategy } from "./scrollStrategies/cornerHeaderScroll.mjs";
import { focusScrollStrategy } from "./scrollStrategies/focusScroll.mjs";
import { multipleScrollStrategy } from "./scrollStrategies/multipleScroll.mjs";
import { noncontiguousScrollStrategy } from "./scrollStrategies/noncontiguousScroll.mjs";
import { rowHeaderScrollStrategy } from "./scrollStrategies/rowHeaderScroll.mjs";
import { singleScrollStrategy } from "./scrollStrategies/singleScroll.mjs";
/**
 * @typedef ViewportScroller
 * @property {function(): void} resume Resumes the viewport scroller.
 * @property {function(): void} suspend Suspends the viewport scroller until the `resume` method is called.
 * @property {function(): void} skipNextScrollCycle Skip the next scroll cycle.
 * @property {function(CellCoords): void} scrollTo Scroll the viewport to a given cell.
 */
/**
 * Installs a viewport scroller module. The module is responsible for scrolling the viewport to a given cell
 * based on the selection type (single cell selection, multiple cells selection, header selection etc.).
 * It's triggered by the selection module via the `afterSetRangeEnd` hook every time the selection changes.
 *
 * @param {Core} hot The Handsontable instance.
 * @returns {ViewportScroller} The viewport scroller module.
 */
export function createViewportScroller(hot) {
  const {
    selection
  } = hot;
  let skipNextCall = false;
  let isSuspended = false;
  return {
    resume() {
      isSuspended = false;
    },
    suspend() {
      isSuspended = true;
    },
    skipNextScrollCycle() {
      skipNextCall = true;
    },
    scrollTo(cellCoords) {
      var _scrollStrategy;
      if (skipNextCall || isSuspended) {
        skipNextCall = false;
        return;
      }
      let scrollStrategy;
      if (selection.isFocusSelectionChanged()) {
        scrollStrategy = focusScrollStrategy(hot);
      } else if (selection.isSelectedByCorner()) {
        scrollStrategy = cornerHeaderScrollStrategy(hot);
      } else if (selection.isSelectedByRowHeader()) {
        scrollStrategy = rowHeaderScrollStrategy(hot);
      } else if (selection.isSelectedByColumnHeader()) {
        scrollStrategy = columnHeaderScrollStrategy(hot);
      } else if (selection.getSelectedRange().size() === 1 && selection.isMultiple()) {
        scrollStrategy = multipleScrollStrategy(hot);
      } else if (selection.getSelectedRange().size() === 1 && !selection.isMultiple()) {
        scrollStrategy = singleScrollStrategy(hot);
      } else if (selection.getSelectedRange().size() > 1) {
        scrollStrategy = noncontiguousScrollStrategy(hot);
      }
      (_scrollStrategy = scrollStrategy) === null || _scrollStrategy === void 0 || _scrollStrategy(cellCoords);
    }
  };
}