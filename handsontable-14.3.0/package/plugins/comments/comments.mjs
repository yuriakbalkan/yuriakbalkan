import "core-js/modules/es.error.cause.js";
import "core-js/modules/es.array.push.js";
function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }
function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
import { addClass, closest, isChildOf, hasClass, outerWidth, outerHeight } from "../../helpers/dom/element.mjs";
import { stopImmediatePropagation } from "../../helpers/dom/event.mjs";
import { deepClone, deepExtend, isObject } from "../../helpers/object.mjs";
import { BasePlugin } from "../base/index.mjs";
import CommentEditor from "./commentEditor.mjs";
import DisplaySwitch from "./displaySwitch.mjs";
import { SEPARATOR } from "../contextMenu/predefinedItems/index.mjs";
import addEditCommentItem from "./contextMenuItem/addEditComment.mjs";
import removeCommentItem from "./contextMenuItem/removeComment.mjs";
import readOnlyCommentItem from "./contextMenuItem/readOnlyComment.mjs";
export const PLUGIN_KEY = 'comments';
export const PLUGIN_PRIORITY = 60;
export const META_COMMENT = 'comment';
export const META_COMMENT_VALUE = 'value';
export const META_STYLE = 'style';
export const META_READONLY = 'readOnly';
const SHORTCUTS_GROUP = PLUGIN_KEY;
const SHORTCUTS_CONTEXT_NAME = `plugin:${PLUGIN_KEY}`;

/* eslint-disable jsdoc/require-description-complete-sentence */
/**
 * @plugin Comments
 * @class Comments
 *
 * @description
 * This plugin allows setting and managing cell comments by either an option in the context menu or with the use of
 * the API.
 *
 * To enable the plugin, you'll need to set the comments property of the config object to `true`:
 * ```js
 * comments: true
 * ```
 *
 * or an object with extra predefined plugin config:
 *
 * ```js
 * comments: {
 *   displayDelay: 1000,
 *   readOnly: true,
 *   style: {
 *     width: 300,
 *     height: 100
 *   }
 * }
 * ```
 *
 * To add comments at the table initialization, define the `comment` property in the `cell` config array as in an example below.
 *
 * @example
 * ::: only-for javascript
 * ```js
 * const hot = new Handsontable(document.getElementById('example'), {
 *   data: getData(),
 *   comments: true,
 *   cell: [
 *     {row: 1, col: 1, comment: {value: 'Foo'}},
 *     {row: 2, col: 2, comment: {value: 'Bar'}}
 *   ]
 * });
 *
 * // Access to the Comments plugin instance:
 * const commentsPlugin = hot.getPlugin('comments');
 *
 * // Manage comments programmatically:
 * commentsPlugin.setCommentAtCell(1, 6, 'Comment contents');
 * commentsPlugin.showAtCell(1, 6);
 * commentsPlugin.removeCommentAtCell(1, 6);
 *
 * // You can also set range once and use proper methods:
 * commentsPlugin.setRange({from: {row: 1, col: 6}});
 * commentsPlugin.setComment('Comment contents');
 * commentsPlugin.show();
 * commentsPlugin.removeComment();
 * ```
 * :::
 *
 * ::: only-for react
 * ```jsx
 * const hotRef = useRef(null);
 *
 * ...
 *
 * <HotTable
 *   ref={hotRef}
 *   data={getData()}
 *   comments={true}
 *   cell={[
 *     {row: 1, col: 1, comment: {value: 'Foo'}},
 *     {row: 2, col: 2, comment: {value: 'Bar'}}
 *   ]}
 * />
 *
 * // Access to the Comments plugin instance:
 * const hot = hotRef.current.hotInstance;
 * const commentsPlugin = hot.getPlugin('comments');
 *
 * // Manage comments programmatically:
 * commentsPlugin.setCommentAtCell(1, 6, 'Comment contents');
 * commentsPlugin.showAtCell(1, 6);
 * commentsPlugin.removeCommentAtCell(1, 6);
 *
 * // You can also set range once and use proper methods:
 * commentsPlugin.setRange({from: {row: 1, col: 6}});
 * commentsPlugin.setComment('Comment contents');
 * commentsPlugin.show();
 * commentsPlugin.removeComment();
 * ```
 * :::
 */
var _editor = /*#__PURE__*/new WeakMap();
var _displaySwitch = /*#__PURE__*/new WeakMap();
var _preventEditorAutoSwitch = /*#__PURE__*/new WeakMap();
var _preventEditorHiding = /*#__PURE__*/new WeakMap();
var _tempEditorDimensions = /*#__PURE__*/new WeakMap();
var _cellBelowCursor = /*#__PURE__*/new WeakMap();
var _commentValueBeforeSave = /*#__PURE__*/new WeakMap();
var _Comments_brand = /*#__PURE__*/new WeakSet();
export class Comments extends BasePlugin {
  constructor() {
    super(...arguments);
    /**
     * `mousedown` event callback.
     *
     * @param {MouseEvent} event The `mousedown` event.
     */
    _classPrivateMethodInitSpec(this, _Comments_brand);
    /**
     * Current cell range, an object with `from` property, with `row` and `col` properties (e.q. `{from: {row: 1, col: 6}}`).
     *
     * @type {object}
     */
    _defineProperty(this, "range", {});
    /**
     * Instance of {@link CommentEditor}.
     *
     * @private
     * @type {CommentEditor}
     */
    _classPrivateFieldInitSpec(this, _editor, null);
    /**
     * Instance of {@link DisplaySwitch}.
     *
     * @private
     * @type {DisplaySwitch}
     */
    _classPrivateFieldInitSpec(this, _displaySwitch, null);
    /**
     * Prevents showing/hiding editor that reacts on the logic triggered by the "mouseover" events.
     *
     * @private
     * @type {boolean}
     */
    _classPrivateFieldInitSpec(this, _preventEditorAutoSwitch, false);
    /**
     * Prevents hiding editor when the table viewport is scrolled and that scroll is triggered by the
     * keyboard shortcut that insert or edits the comment.
     *
     * @private
     * @type {boolean}
     */
    _classPrivateFieldInitSpec(this, _preventEditorHiding, false);
    /**
     * The property for holding editor dimensions for further processing.
     *
     * @private
     * @type {object}
     */
    _classPrivateFieldInitSpec(this, _tempEditorDimensions, {});
    /**
     * The flag that allows processing mousedown event correctly when comments editor is triggered.
     *
     * @private
     * @type {boolean}
     */
    _classPrivateFieldInitSpec(this, _cellBelowCursor, null);
    /**
     * Holds the comment value before it's actually saved to the cell meta.
     *
     * @private
     * @type {string}
     */
    _classPrivateFieldInitSpec(this, _commentValueBeforeSave, '');
  }
  static get PLUGIN_KEY() {
    return PLUGIN_KEY;
  }
  static get PLUGIN_PRIORITY() {
    return PLUGIN_PRIORITY;
  }
  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` then the {@link Comments#enablePlugin} method is called.
   *
   * @returns {boolean}
   */
  isEnabled() {
    return !!this.hot.getSettings()[PLUGIN_KEY];
  }

  /**
   * Enables the plugin functionality for this Handsontable instance.
   */
  enablePlugin() {
    if (this.enabled) {
      return;
    }
    if (!_classPrivateFieldGet(_editor, this)) {
      _classPrivateFieldSet(_editor, this, new CommentEditor(this.hot.rootDocument, this.hot.isRtl()));
    }
    if (!_classPrivateFieldGet(_displaySwitch, this)) {
      _classPrivateFieldSet(_displaySwitch, this, new DisplaySwitch(this.getDisplayDelaySetting()));
    }
    this.addHook('afterContextMenuDefaultOptions', options => this.addToContextMenu(options));
    this.addHook('afterRenderer', (TD, row, col, prop, value, cellProperties) => _assertClassBrand(_Comments_brand, this, _onAfterRenderer).call(this, TD, cellProperties));
    this.addHook('afterScroll', () => _assertClassBrand(_Comments_brand, this, _onAfterScroll).call(this));
    this.addHook('afterBeginEditing', () => this.hide());
    this.addHook('afterDocumentKeyDown', event => _assertClassBrand(_Comments_brand, this, _onAfterDocumentKeyDown).call(this, event));
    _classPrivateFieldGet(_displaySwitch, this).addLocalHook('hide', () => this.hide());
    _classPrivateFieldGet(_displaySwitch, this).addLocalHook('show', (row, col) => this.showAtCell(row, col));
    this.registerShortcuts();
    this.registerListeners();
    super.enablePlugin();
  }

  /**
   * Updates the plugin's state.
   *
   * This method is executed when [`updateSettings()`](@/api/core.md#updatesettings) is invoked with any of the following configuration options:
   *   - [`comments`](@/api/options.md#comments)
   */
  updatePlugin() {
    _classPrivateFieldGet(_displaySwitch, this).updateDelay(this.getDisplayDelaySetting());
    super.updatePlugin();
  }

  /**
   * Disables the plugin functionality for this Handsontable instance.
   */
  disablePlugin() {
    this.unregisterShortcuts();
    super.disablePlugin();
  }

  /**
   * Register shortcuts responsible for toggling context menu.
   *
   * @private
   */
  registerShortcuts() {
    const manager = this.hot.getShortcutManager();
    const gridContext = manager.getContext('grid');
    const pluginContext = manager.addContext(SHORTCUTS_CONTEXT_NAME);
    gridContext.addShortcut({
      keys: [['Control', 'Alt', 'M']],
      callback: () => {
        const range = this.hot.getSelectedRangeLast();
        _classPrivateFieldSet(_preventEditorHiding, this, true);
        this.hot.scrollToFocusedCell(() => {
          this.setRange(range);
          this.show();
          this.focusEditor();
          manager.setActiveContextName(SHORTCUTS_CONTEXT_NAME);
          this.hot._registerTimeout(() => {
            _classPrivateFieldSet(_preventEditorHiding, this, false);
          });
        });
      },
      stopPropagation: true,
      runOnlyIf: () => {
        var _this$hot$getSelected;
        return ((_this$hot$getSelected = this.hot.getSelectedRangeLast()) === null || _this$hot$getSelected === void 0 ? void 0 : _this$hot$getSelected.highlight.isCell()) && !_classPrivateFieldGet(_editor, this).isVisible();
      },
      group: SHORTCUTS_GROUP
    });
    pluginContext.addShortcut({
      keys: [['Escape']],
      callback: () => {
        _classPrivateFieldGet(_editor, this).setValue(_classPrivateFieldGet(_commentValueBeforeSave, this));
        this.hide();
        manager.setActiveContextName('grid');
      },
      runOnlyIf: () => {
        var _this$hot$getSelected2;
        return ((_this$hot$getSelected2 = this.hot.getSelectedRangeLast()) === null || _this$hot$getSelected2 === void 0 ? void 0 : _this$hot$getSelected2.highlight.isCell()) && _classPrivateFieldGet(_editor, this).isVisible();
      },
      group: SHORTCUTS_GROUP
    });
    pluginContext.addShortcut({
      keys: [['Control/Meta', 'Enter']],
      callback: () => {
        this.hide();
        manager.setActiveContextName('grid');
      },
      runOnlyIf: () => {
        var _this$hot$getSelected3;
        return ((_this$hot$getSelected3 = this.hot.getSelectedRangeLast()) === null || _this$hot$getSelected3 === void 0 ? void 0 : _this$hot$getSelected3.highlight.isCell()) && _classPrivateFieldGet(_editor, this).isVisible();
      },
      group: SHORTCUTS_GROUP
    });
  }

  /**
   * Unregister shortcuts responsible for toggling context menu.
   *
   * @private
   */
  unregisterShortcuts() {
    this.hot.getShortcutManager().getContext('grid').removeShortcutsByGroup(SHORTCUTS_GROUP);
  }

  /**
   * Registers all necessary DOM listeners.
   *
   * @private
   */
  registerListeners() {
    const {
      rootDocument
    } = this.hot;
    const editorElement = this.getEditorInputElement();
    this.eventManager.addEventListener(rootDocument, 'mouseover', event => _assertClassBrand(_Comments_brand, this, _onMouseOver).call(this, event));
    this.eventManager.addEventListener(rootDocument, 'mousedown', event => _assertClassBrand(_Comments_brand, this, _onMouseDown).call(this, event));
    this.eventManager.addEventListener(rootDocument, 'mouseup', () => _assertClassBrand(_Comments_brand, this, _onMouseUp).call(this));
    this.eventManager.addEventListener(editorElement, 'focus', () => _assertClassBrand(_Comments_brand, this, _onEditorFocus).call(this));
    this.eventManager.addEventListener(editorElement, 'blur', () => _assertClassBrand(_Comments_brand, this, _onEditorBlur).call(this));
    this.eventManager.addEventListener(editorElement, 'mousedown', event => _assertClassBrand(_Comments_brand, this, _onEditorMouseDown).call(this, event));
    this.eventManager.addEventListener(editorElement, 'mouseup', event => _assertClassBrand(_Comments_brand, this, _onEditorMouseUp).call(this, event));
  }

  /**
   * Sets the current cell range to be able to use general methods like {@link Comments#setComment}, {@link Comments#removeComment}, {@link Comments#show}.
   *
   * @param {object} range Object with `from` property, each with `row` and `col` properties.
   */
  setRange(range) {
    this.range = range;
  }

  /**
   * Clears the currently selected cell.
   */
  clearRange() {
    this.range = {};
  }

  /**
   * Checks if the event target is a cell containing a comment.
   *
   * @private
   * @param {Event} event DOM event.
   * @returns {boolean}
   */
  targetIsCellWithComment(event) {
    const closestCell = closest(event.target, 'TD', 'TBODY');
    return !!(closestCell && hasClass(closestCell, 'htCommentCell') && closest(closestCell, [this.hot.rootElement]));
  }

  /**
   * Checks if the event target is a comment textarea.
   *
   * @private
   * @param {Event} event DOM event.
   * @returns {boolean}
   */
  targetIsCommentTextArea(event) {
    return this.getEditorInputElement() === event.target;
  }

  /**
   * Sets a comment for a cell according to the previously set range (see {@link Comments#setRange}).
   *
   * @param {string} value Comment contents.
   */
  setComment(value) {
    if (!this.range.from) {
      throw new Error('Before using this method, first set cell range (hot.getPlugin("comment").setRange())');
    }
    const editorValue = _classPrivateFieldGet(_editor, this).getValue();
    let comment = '';
    if (value !== null && value !== undefined) {
      comment = value;
    } else if (editorValue !== null && editorValue !== undefined) {
      comment = editorValue;
    }
    const row = this.range.from.row;
    const col = this.range.from.col;
    this.updateCommentMeta(row, col, {
      [META_COMMENT_VALUE]: comment
    });
    this.hot.render();
  }

  /**
   * Sets a comment for a specified cell.
   *
   * @param {number} row Visual row index.
   * @param {number} column Visual column index.
   * @param {string} value Comment contents.
   */
  setCommentAtCell(row, column, value) {
    this.setRange({
      from: this.hot._createCellCoords(row, column)
    });
    this.setComment(value);
  }

  /**
   * Removes a comment from a cell according to previously set range (see {@link Comments#setRange}).
   *
   * @param {boolean} [forceRender=true] If set to `true`, the table will be re-rendered at the end of the operation.
   */
  removeComment() {
    let forceRender = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    if (!this.range.from) {
      throw new Error('Before using this method, first set cell range (hot.getPlugin("comment").setRange())');
    }
    this.hot.setCellMeta(this.range.from.row, this.range.from.col, META_COMMENT);
    if (forceRender) {
      this.hot.render();
    }
    this.hide();
  }

  /**
   * Removes a comment from a specified cell.
   *
   * @param {number} row Visual row index.
   * @param {number} column Visual column index.
   * @param {boolean} [forceRender=true] If `true`, the table will be re-rendered at the end of the operation.
   */
  removeCommentAtCell(row, column) {
    let forceRender = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    this.setRange({
      from: this.hot._createCellCoords(row, column)
    });
    this.removeComment(forceRender);
  }

  /**
   * Gets comment from a cell according to previously set range (see {@link Comments#setRange}).
   *
   * @returns {string|undefined} Returns a content of the comment.
   */
  getComment() {
    const row = this.range.from.row;
    const column = this.range.from.col;
    return this.getCommentMeta(row, column, META_COMMENT_VALUE);
  }

  /**
   * Gets comment from a cell at the provided coordinates.
   *
   * @param {number} row Visual row index.
   * @param {number} column Visual column index.
   * @returns {string|undefined} Returns a content of the comment.
   */
  getCommentAtCell(row, column) {
    return this.getCommentMeta(row, column, META_COMMENT_VALUE);
  }

  /**
   * Shows the comment editor accordingly to the previously set range (see {@link Comments#setRange}).
   *
   * @returns {boolean} Returns `true` if comment editor was shown.
   */
  show() {
    var _ref;
    if (!this.range.from) {
      throw new Error('Before using this method, first set cell range (hot.getPlugin("comment").setRange())');
    }
    const {
      from: {
        row,
        col
      }
    } = this.range;
    if (row < 0 || row > this.hot.countSourceRows() - 1 || col < 0 || col > this.hot.countSourceCols() - 1) {
      return false;
    }
    const meta = this.hot.getCellMeta(this.range.from.row, this.range.from.col);
    _classPrivateFieldGet(_displaySwitch, this).cancelHiding();
    _classPrivateFieldGet(_editor, this).setValue((_ref = meta[META_COMMENT] ? meta[META_COMMENT][META_COMMENT_VALUE] : null) !== null && _ref !== void 0 ? _ref : '');
    _classPrivateFieldGet(_editor, this).show();
    this.refreshEditor(true);
    return true;
  }

  /**
   * Shows comment editor according to cell coordinates.
   *
   * @param {number} row Visual row index.
   * @param {number} column Visual column index.
   * @returns {boolean} Returns `true` if comment editor was shown.
   */
  showAtCell(row, column) {
    this.setRange({
      from: this.hot._createCellCoords(row, column)
    });
    return this.show();
  }

  /**
   * Hides the comment editor.
   */
  hide() {
    _classPrivateFieldGet(_editor, this).hide();
  }

  /**
   * Refreshes comment editor position and styling.
   *
   * @param {boolean} [force=false] If `true` then recalculation will be forced.
   */
  refreshEditor() {
    var _renderableRow, _renderableColumn;
    let force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    if (!force && (!this.range.from || !_classPrivateFieldGet(_editor, this).isVisible())) {
      return;
    }
    const {
      rowIndexMapper,
      columnIndexMapper
    } = this.hot;
    const {
      row: visualRow,
      col: visualColumn
    } = this.range.from;
    let renderableRow = rowIndexMapper.getRenderableFromVisualIndex(visualRow);
    let renderableColumn = columnIndexMapper.getRenderableFromVisualIndex(visualColumn);
    // Used when the requested row is hidden, and the editor needs to be positioned on the previous row's coords.
    const targetingPreviousRow = renderableRow === null;

    // Reset the editor position to (0, 0) so the opening direction calculation wouldn't be influenced by its
    // previous position
    _classPrivateFieldGet(_editor, this).setPosition(0, 0);
    if (renderableRow === null) {
      renderableRow = rowIndexMapper.getRenderableFromVisualIndex(rowIndexMapper.getNearestNotHiddenIndex(visualRow, -1));
    }
    if (renderableColumn === null) {
      renderableColumn = columnIndexMapper.getRenderableFromVisualIndex(columnIndexMapper.getNearestNotHiddenIndex(visualColumn, -1));
    }
    const isBeforeRenderedRows = renderableRow === null;
    const isBeforeRenderedColumns = renderableColumn === null;
    renderableRow = (_renderableRow = renderableRow) !== null && _renderableRow !== void 0 ? _renderableRow : 0;
    renderableColumn = (_renderableColumn = renderableColumn) !== null && _renderableColumn !== void 0 ? _renderableColumn : 0;
    const {
      rootWindow,
      view: {
        _wt: wt
      }
    } = this.hot;
    const {
      wtTable
    } = wt;
    // TODO: Probably using `hot.getCell` would be the best. However, case for showing comment editor for hidden cell
    // potentially should be removed with that change (currently a test for it is passing).
    const TD = wt.getCell({
      row: renderableRow,
      col: renderableColumn
    }, true);
    const commentStyle = this.getCommentMeta(visualRow, visualColumn, META_STYLE);
    if (commentStyle) {
      _classPrivateFieldGet(_editor, this).setSize(commentStyle.width, commentStyle.height);
    } else {
      _classPrivateFieldGet(_editor, this).resetSize();
    }
    const lastColWidth = isBeforeRenderedColumns ? 0 : wtTable.getStretchedColumnWidth(renderableColumn);
    const lastRowHeight = targetingPreviousRow && !isBeforeRenderedRows ? outerHeight(TD) : 0;
    const {
      left,
      top,
      width: cellWidth,
      height: cellHeight
    } = TD.getBoundingClientRect();
    const {
      width: editorWidth,
      height: editorHeight
    } = _classPrivateFieldGet(_editor, this).getSize();
    const {
      innerWidth,
      innerHeight
    } = this.hot.rootWindow;
    const documentElement = this.hot.rootDocument.documentElement;
    let x = left + rootWindow.scrollX + lastColWidth;
    let y = top + rootWindow.scrollY + lastRowHeight;
    if (this.hot.isRtl()) {
      x -= editorWidth + lastColWidth;
    }

    // flip to the right or left the comments editor position when it goes out of browser viewport
    if (this.hot.isLtr() && left + cellWidth + editorWidth > innerWidth) {
      x = left + rootWindow.scrollX - editorWidth - 1;
    } else if (this.hot.isRtl() && x < -(documentElement.scrollWidth - documentElement.clientWidth)) {
      x = left + rootWindow.scrollX + lastColWidth + 1;
    }
    if (top + editorHeight > innerHeight) {
      y -= editorHeight - cellHeight + 1;
    }
    _classPrivateFieldGet(_editor, this).setPosition(x, y);
    _classPrivateFieldGet(_editor, this).setReadOnlyState(this.getCommentMeta(visualRow, visualColumn, META_READONLY));
  }

  /**
   * Focuses the comments editor element.
   */
  focusEditor() {
    _classPrivateFieldGet(_editor, this).focus();
  }

  /**
   * Sets or update the comment-related cell meta.
   *
   * @param {number} row Visual row index.
   * @param {number} column Visual column index.
   * @param {object} metaObject Object defining all the comment-related meta information.
   */
  updateCommentMeta(row, column, metaObject) {
    const oldComment = this.hot.getCellMeta(row, column)[META_COMMENT];
    let newComment;
    if (oldComment) {
      newComment = deepClone(oldComment);
      deepExtend(newComment, metaObject);
    } else {
      newComment = metaObject;
    }
    this.hot.setCellMeta(row, column, META_COMMENT, newComment);
  }

  /**
   * Gets the comment related meta information.
   *
   * @param {number} row Visual row index.
   * @param {number} column Visual column index.
   * @param {string} property Cell meta property.
   * @returns {Mixed}
   */
  getCommentMeta(row, column, property) {
    const cellMeta = this.hot.getCellMeta(row, column);
    if (!cellMeta[META_COMMENT]) {
      return undefined;
    }
    return cellMeta[META_COMMENT][property];
  }
  /**
   * Add Comments plugin options to the Context Menu.
   *
   * @private
   * @param {object} options The menu options.
   */
  addToContextMenu(options) {
    options.items.push({
      name: SEPARATOR
    }, addEditCommentItem(this), removeCommentItem(this), readOnlyCommentItem(this));
  }

  /**
   * Get `displayDelay` setting of comment plugin.
   *
   * @private
   * @returns {number|undefined}
   */
  getDisplayDelaySetting() {
    const commentSetting = this.hot.getSettings()[PLUGIN_KEY];
    if (isObject(commentSetting)) {
      return commentSetting.displayDelay;
    }
  }

  /**
   * Gets the editors input element.
   *
   * @private
   * @returns {HTMLTextAreaElement}
   */
  getEditorInputElement() {
    return _classPrivateFieldGet(_editor, this).getInputElement();
  }

  /**
   * Destroys the plugin instance.
   */
  destroy() {
    if (_classPrivateFieldGet(_editor, this)) {
      _classPrivateFieldGet(_editor, this).destroy();
    }
    if (_classPrivateFieldGet(_displaySwitch, this)) {
      _classPrivateFieldGet(_displaySwitch, this).destroy();
    }
    super.destroy();
  }
}
function _onMouseDown(event) {
  if (!this.hot.view || !this.hot.view._wt) {
    return;
  }
  if (!_classPrivateFieldGet(_preventEditorAutoSwitch, this) && !this.targetIsCommentTextArea(event)) {
    const eventCell = closest(event.target, 'TD', 'TBODY');
    let coordinates = null;
    if (eventCell) {
      coordinates = this.hot.getCoords(eventCell);
    }
    if (!eventCell || this.range.from && coordinates && (this.range.from.row !== coordinates.row || this.range.from.col !== coordinates.col)) {
      this.hide();
    }
  }
}
/**
 * `mouseover` event callback.
 *
 * @param {MouseEvent} event The `mouseover` event.
 */
function _onMouseOver(event) {
  const {
    rootDocument
  } = this.hot;
  if (_classPrivateFieldGet(_preventEditorAutoSwitch, this) || _classPrivateFieldGet(_editor, this).isFocused() || hasClass(event.target, 'wtBorder') || _classPrivateFieldGet(_cellBelowCursor, this) === event.target || !_classPrivateFieldGet(_editor, this)) {
    return;
  }
  _classPrivateFieldSet(_cellBelowCursor, this, rootDocument.elementFromPoint(event.clientX, event.clientY));
  if (this.targetIsCellWithComment(event)) {
    const range = this.hot._createCellRange(this.hot.getCoords(event.target));
    _classPrivateFieldGet(_displaySwitch, this).show(range);
  } else if (isChildOf(event.target, rootDocument) && !this.targetIsCommentTextArea(event)) {
    _classPrivateFieldGet(_displaySwitch, this).hide();
  }
}
/**
 * `mouseup` event callback.
 */
function _onMouseUp() {
  _classPrivateFieldSet(_preventEditorAutoSwitch, this, false);
}
/**
 * The `afterRenderer` hook callback.
 *
 * @param {HTMLTableCellElement} TD The rendered `TD` element.
 * @param {object} cellProperties The rendered cell's property object.
 */
function _onAfterRenderer(TD, cellProperties) {
  if (cellProperties[META_COMMENT] && cellProperties[META_COMMENT][META_COMMENT_VALUE]) {
    addClass(TD, cellProperties.commentedCellClassName);
  }
}
/**
 * Hook observer the "blur" event from the comments editor element. The hook clears the
 * editor content and gives back the keyboard shortcuts control by switching to the "grid" context.
 */
function _onEditorBlur() {
  _classPrivateFieldSet(_commentValueBeforeSave, this, '');
  this.hot.getShortcutManager().setActiveContextName('grid');
  this.setComment();
}
/**
 * Hook observer the "focus" event from the comments editor element. The hook takes the control of
 * the keyboard shortcuts by switching the context to plugins one.
 */
function _onEditorFocus() {
  _classPrivateFieldSet(_commentValueBeforeSave, this, this.getComment());
  this.hot.listen();
  this.hot.getShortcutManager().setActiveContextName(SHORTCUTS_CONTEXT_NAME);
}
/**
 * `mousedown` hook. Along with `onEditorMouseUp` used to simulate the textarea resizing event.
 *
 * @param {MouseEvent} event The `mousedown` event.
 */
function _onEditorMouseDown(event) {
  _classPrivateFieldSet(_tempEditorDimensions, this, {
    width: outerWidth(event.target),
    height: outerHeight(event.target)
  });
}
/**
 * `mouseup` hook. Along with `onEditorMouseDown` used to simulate the textarea resizing event.
 *
 * @param {MouseEvent} event The `mouseup` event.
 */
function _onEditorMouseUp(event) {
  const currentWidth = outerWidth(event.target);
  const currentHeight = outerHeight(event.target);
  if (currentWidth !== _classPrivateFieldGet(_tempEditorDimensions, this).width + 1 || currentHeight !== _classPrivateFieldGet(_tempEditorDimensions, this).height + 2) {
    this.updateCommentMeta(this.range.from.row, this.range.from.col, {
      [META_STYLE]: {
        width: currentWidth,
        height: currentHeight
      }
    });
  }
}
/**
 * Observes the pressed keys and if there is already opened the comment editor prevents open
 * the table editor into the fast edit mode.
 *
 * @param {Event} event The keydown event.
 */
function _onAfterDocumentKeyDown(event) {
  if (_classPrivateFieldGet(_editor, this).isVisible()) {
    stopImmediatePropagation(event);
  }
}
/**
 * Observes the changes in the scroll position if triggered it hides the comment editor.
 */
function _onAfterScroll() {
  if (!_classPrivateFieldGet(_preventEditorHiding, this)) {
    this.hide();
  }
}