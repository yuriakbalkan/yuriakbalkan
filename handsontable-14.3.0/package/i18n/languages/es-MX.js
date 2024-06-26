"use strict";

exports.__esModule = true;
var C = _interopRequireWildcard(require("../constants"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * @preserve
 * Authors: Handsoncode, Enrique Enciso
 * Last updated: Nov 18, 2022
 *
 * Description: Definition file for Spanish - Mexico language-country.
 */

const dictionary = {
  languageCode: 'es-MX',
  [C.CONTEXTMENU_ITEMS_ROW_ABOVE]: 'Insertar fila arriba',
  [C.CONTEXTMENU_ITEMS_ROW_BELOW]: 'Insertar fila abajo',
  [C.CONTEXTMENU_ITEMS_INSERT_LEFT]: 'Insertar columna izquierda',
  [C.CONTEXTMENU_ITEMS_INSERT_RIGHT]: 'Insertar columna derecha',
  [C.CONTEXTMENU_ITEMS_REMOVE_ROW]: ['Eliminar fila', 'Eliminar filas'],
  [C.CONTEXTMENU_ITEMS_REMOVE_COLUMN]: ['Eliminar columna', 'Eliminar columnas'],
  [C.CONTEXTMENU_ITEMS_UNDO]: 'Deshacer',
  [C.CONTEXTMENU_ITEMS_REDO]: 'Rehacer',
  [C.CONTEXTMENU_ITEMS_READ_ONLY]: 'Solo lectura',
  [C.CONTEXTMENU_ITEMS_CLEAR_COLUMN]: 'Limpiar columna',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT]: 'Alineación',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_LEFT]: 'Izquierda',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_CENTER]: 'Centro',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_RIGHT]: 'Derecha',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_JUSTIFY]: 'Justificar',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_TOP]: 'Superior',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_MIDDLE]: 'Medio',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_BOTTOM]: 'Inferior',
  [C.CONTEXTMENU_ITEMS_FREEZE_COLUMN]: 'Congelar columna',
  [C.CONTEXTMENU_ITEMS_UNFREEZE_COLUMN]: 'Descongelar columna',
  [C.CONTEXTMENU_ITEMS_BORDERS]: 'Bordes',
  [C.CONTEXTMENU_ITEMS_BORDERS_TOP]: 'Superior',
  [C.CONTEXTMENU_ITEMS_BORDERS_RIGHT]: 'Derecho',
  [C.CONTEXTMENU_ITEMS_BORDERS_BOTTOM]: 'Inferior',
  [C.CONTEXTMENU_ITEMS_BORDERS_LEFT]: 'Izquierdo',
  [C.CONTEXTMENU_ITEMS_REMOVE_BORDERS]: 'Quitar borde(s)',
  [C.CONTEXTMENU_ITEMS_ADD_COMMENT]: 'Agregar comentario',
  [C.CONTEXTMENU_ITEMS_EDIT_COMMENT]: 'Editar comentario',
  [C.CONTEXTMENU_ITEMS_REMOVE_COMMENT]: 'Borrar comentario',
  [C.CONTEXTMENU_ITEMS_READ_ONLY_COMMENT]: 'Comentario Solo de lectura',
  [C.CONTEXTMENU_ITEMS_MERGE_CELLS]: 'Unir celdas',
  [C.CONTEXTMENU_ITEMS_UNMERGE_CELLS]: 'Separar celdas',
  [C.CONTEXTMENU_ITEMS_COPY]: 'Copiar',
  [C.CONTEXTMENU_ITEMS_COPY_WITH_COLUMN_HEADERS]: ['Copiar con encabezado', 'Copiar con encabezados'],
  [C.CONTEXTMENU_ITEMS_COPY_WITH_COLUMN_GROUP_HEADERS]: ['Copiar con encabezado de grupo', 'Copiar con encabezados de grupos'],
  [C.CONTEXTMENU_ITEMS_COPY_COLUMN_HEADERS_ONLY]: ['Copiar solo el encabezado', 'Copiar solo los encabezados'],
  [C.CONTEXTMENU_ITEMS_CUT]: 'Cortar',
  [C.CONTEXTMENU_ITEMS_NESTED_ROWS_INSERT_CHILD]: 'Insertar fila hija',
  [C.CONTEXTMENU_ITEMS_NESTED_ROWS_DETACH_CHILD]: 'Separar del padre',
  [C.CONTEXTMENU_ITEMS_HIDE_COLUMN]: ['Esconder columna', 'Esconder columnas'],
  [C.CONTEXTMENU_ITEMS_SHOW_COLUMN]: ['Mostrar columna', 'Mostrar columnas'],
  [C.CONTEXTMENU_ITEMS_HIDE_ROW]: ['Esconder fila', 'Esconder filas'],
  [C.CONTEXTMENU_ITEMS_SHOW_ROW]: ['Mostrar fila', 'Mostrar filas'],
  [C.FILTERS_CONDITIONS_NONE]: 'Ninguna',
  [C.FILTERS_CONDITIONS_EMPTY]: 'Está vacío',
  [C.FILTERS_CONDITIONS_NOT_EMPTY]: 'No está vacío',
  [C.FILTERS_CONDITIONS_EQUAL]: 'Es igual a',
  [C.FILTERS_CONDITIONS_NOT_EQUAL]: 'No es igual a',
  [C.FILTERS_CONDITIONS_BEGINS_WITH]: 'Comienza con',
  [C.FILTERS_CONDITIONS_ENDS_WITH]: 'Termina con',
  [C.FILTERS_CONDITIONS_CONTAINS]: 'Contiene',
  [C.FILTERS_CONDITIONS_NOT_CONTAIN]: 'No contiene',
  [C.FILTERS_CONDITIONS_GREATER_THAN]: 'Mayor que',
  [C.FILTERS_CONDITIONS_GREATER_THAN_OR_EQUAL]: 'Mayor o igual que',
  [C.FILTERS_CONDITIONS_LESS_THAN]: 'Menor que',
  [C.FILTERS_CONDITIONS_LESS_THAN_OR_EQUAL]: 'Menor o igual que',
  [C.FILTERS_CONDITIONS_BETWEEN]: 'Es entre',
  [C.FILTERS_CONDITIONS_NOT_BETWEEN]: 'No es entre',
  [C.FILTERS_CONDITIONS_AFTER]: 'Después',
  [C.FILTERS_CONDITIONS_BEFORE]: 'Antes',
  [C.FILTERS_CONDITIONS_TODAY]: 'Hoy',
  [C.FILTERS_CONDITIONS_TOMORROW]: 'Mañana',
  [C.FILTERS_CONDITIONS_YESTERDAY]: 'Ayer',
  [C.FILTERS_VALUES_BLANK_CELLS]: 'Celdas vacías',
  [C.FILTERS_DIVS_FILTER_BY_CONDITION]: 'Filtrar por condición',
  [C.FILTERS_DIVS_FILTER_BY_VALUE]: 'Filtrar por valor',
  [C.FILTERS_LABELS_CONJUNCTION]: 'Y',
  [C.FILTERS_LABELS_DISJUNCTION]: 'O',
  [C.FILTERS_BUTTONS_SELECT_ALL]: 'Seleccionar todo',
  [C.FILTERS_BUTTONS_CLEAR]: 'Borrar',
  [C.FILTERS_BUTTONS_OK]: 'OK',
  [C.FILTERS_BUTTONS_CANCEL]: 'Cancelar',
  [C.FILTERS_BUTTONS_PLACEHOLDER_SEARCH]: 'Buscar',
  [C.FILTERS_BUTTONS_PLACEHOLDER_VALUE]: 'Valor',
  [C.FILTERS_BUTTONS_PLACEHOLDER_SECOND_VALUE]: 'Valor secundario'
};
var _default = exports.default = dictionary;