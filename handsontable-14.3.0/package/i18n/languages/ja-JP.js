"use strict";

exports.__esModule = true;
var C = _interopRequireWildcard(require("../constants"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * @preserve
 * Authors: hand-dot
 * Last updated: Jan 9, 2023
 *
 * Description: Definition file for Japanese - Japan language-country.
 */

const dictionary = {
  languageCode: 'ja-JP',
  [C.CONTEXTMENU_ITEMS_ROW_ABOVE]: '行を上に挿入',
  [C.CONTEXTMENU_ITEMS_ROW_BELOW]: '行を下に挿入',
  [C.CONTEXTMENU_ITEMS_INSERT_LEFT]: '列を左に挿入',
  [C.CONTEXTMENU_ITEMS_INSERT_RIGHT]: '列を右に挿入',
  [C.CONTEXTMENU_ITEMS_REMOVE_ROW]: ['行を削除', '行を削除'],
  [C.CONTEXTMENU_ITEMS_REMOVE_COLUMN]: ['列を削除', '列を削除'],
  [C.CONTEXTMENU_ITEMS_UNDO]: '元に戻す',
  [C.CONTEXTMENU_ITEMS_REDO]: 'やり直し',
  [C.CONTEXTMENU_ITEMS_READ_ONLY]: '読み取り専用',
  [C.CONTEXTMENU_ITEMS_CLEAR_COLUMN]: '列をクリア',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT]: '配置',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_LEFT]: '左揃え',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_CENTER]: '中央揃え',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_RIGHT]: '右揃え',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_JUSTIFY]: '両端揃え',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_TOP]: '上揃え',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_MIDDLE]: '中央揃え(垂直)',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_BOTTOM]: '下揃え',
  [C.CONTEXTMENU_ITEMS_FREEZE_COLUMN]: '列を固定',
  [C.CONTEXTMENU_ITEMS_UNFREEZE_COLUMN]: '列の固定を解除',
  [C.CONTEXTMENU_ITEMS_BORDERS]: '枠線',
  [C.CONTEXTMENU_ITEMS_BORDERS_TOP]: '上',
  [C.CONTEXTMENU_ITEMS_BORDERS_RIGHT]: '右',
  [C.CONTEXTMENU_ITEMS_BORDERS_BOTTOM]: '下',
  [C.CONTEXTMENU_ITEMS_BORDERS_LEFT]: '左',
  [C.CONTEXTMENU_ITEMS_REMOVE_BORDERS]: '枠線を削除',
  [C.CONTEXTMENU_ITEMS_ADD_COMMENT]: 'コメントを追加',
  [C.CONTEXTMENU_ITEMS_EDIT_COMMENT]: 'コメントを編集',
  [C.CONTEXTMENU_ITEMS_REMOVE_COMMENT]: 'コメントを削除',
  [C.CONTEXTMENU_ITEMS_READ_ONLY_COMMENT]: '読み取り専用コメント',
  [C.CONTEXTMENU_ITEMS_MERGE_CELLS]: 'セルを結合',
  [C.CONTEXTMENU_ITEMS_UNMERGE_CELLS]: 'セルの結合を解除',
  [C.CONTEXTMENU_ITEMS_COPY]: 'コピー',
  [C.CONTEXTMENU_ITEMS_COPY_WITH_COLUMN_HEADERS]: ['ヘッダ付きでコピー', 'ヘッダ付きでコピー'],
  [C.CONTEXTMENU_ITEMS_COPY_WITH_COLUMN_GROUP_HEADERS]: ['グループヘッダ付きでコピー', 'グループヘッダ付きでコピー'],
  [C.CONTEXTMENU_ITEMS_COPY_COLUMN_HEADERS_ONLY]: ['ヘッダのみコピー', 'ヘッダのみコピー'],
  [C.CONTEXTMENU_ITEMS_CUT]: '切り取り',
  [C.CONTEXTMENU_ITEMS_NESTED_ROWS_INSERT_CHILD]: '子の行を挿入',
  [C.CONTEXTMENU_ITEMS_NESTED_ROWS_DETACH_CHILD]: '親の行と切り離す',
  [C.CONTEXTMENU_ITEMS_HIDE_COLUMN]: ['列を非表示', '列を非表示'],
  [C.CONTEXTMENU_ITEMS_SHOW_COLUMN]: ['列を表示', '列を表示'],
  [C.CONTEXTMENU_ITEMS_HIDE_ROW]: ['行を非表示', '行を非表示'],
  [C.CONTEXTMENU_ITEMS_SHOW_ROW]: ['行を表示', '行を表示'],
  [C.FILTERS_CONDITIONS_NONE]: 'なし',
  [C.FILTERS_CONDITIONS_EMPTY]: '空白',
  [C.FILTERS_CONDITIONS_NOT_EMPTY]: '空白ではない',
  [C.FILTERS_CONDITIONS_EQUAL]: '次と等しい',
  [C.FILTERS_CONDITIONS_NOT_EQUAL]: '次と等しくない',
  [C.FILTERS_CONDITIONS_BEGINS_WITH]: '次で始まる',
  [C.FILTERS_CONDITIONS_ENDS_WITH]: '次で終わる',
  [C.FILTERS_CONDITIONS_CONTAINS]: '次を含む',
  [C.FILTERS_CONDITIONS_NOT_CONTAIN]: '次を含まない',
  [C.FILTERS_CONDITIONS_GREATER_THAN]: '次より大きい',
  [C.FILTERS_CONDITIONS_GREATER_THAN_OR_EQUAL]: '以上',
  [C.FILTERS_CONDITIONS_LESS_THAN]: '次より小さい',
  [C.FILTERS_CONDITIONS_LESS_THAN_OR_EQUAL]: '以下',
  [C.FILTERS_CONDITIONS_BETWEEN]: '次の間にある',
  [C.FILTERS_CONDITIONS_NOT_BETWEEN]: '次の間にない',
  [C.FILTERS_CONDITIONS_AFTER]: '次より後の日付',
  [C.FILTERS_CONDITIONS_BEFORE]: '次より前の日付',
  [C.FILTERS_CONDITIONS_TODAY]: '今日',
  [C.FILTERS_CONDITIONS_TOMORROW]: '明日',
  [C.FILTERS_CONDITIONS_YESTERDAY]: '昨日',
  [C.FILTERS_VALUES_BLANK_CELLS]: '空白のセル',
  [C.FILTERS_DIVS_FILTER_BY_CONDITION]: '条件でフィルタ',
  [C.FILTERS_DIVS_FILTER_BY_VALUE]: '値でフィルタ',
  [C.FILTERS_LABELS_CONJUNCTION]: 'かつ',
  [C.FILTERS_LABELS_DISJUNCTION]: 'もしくは',
  [C.FILTERS_BUTTONS_SELECT_ALL]: 'すべて選択',
  [C.FILTERS_BUTTONS_CLEAR]: 'クリア',
  [C.FILTERS_BUTTONS_OK]: 'OK',
  [C.FILTERS_BUTTONS_CANCEL]: 'キャンセル',
  [C.FILTERS_BUTTONS_PLACEHOLDER_SEARCH]: '検索',
  [C.FILTERS_BUTTONS_PLACEHOLDER_VALUE]: '値',
  [C.FILTERS_BUTTONS_PLACEHOLDER_SECOND_VALUE]: '値2'
};
var _default = exports.default = dictionary;