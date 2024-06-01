"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
var _object = require("../../../helpers/object");
var _base = require("./_base");
function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
/**
 * @private
 * @class LinkUI
 */
var _link = /*#__PURE__*/new WeakMap();
class LinkUI extends _base.BaseUI {
  static get DEFAULTS() {
    return (0, _object.clone)({
      href: '#',
      tagName: 'a',
      tabIndex: -1,
      role: 'button'
    });
  }

  /**
   * The reference to the link element.
   *
   * @type {HTMLLinkElement}
   */

  constructor(hotInstance, options) {
    super(hotInstance, (0, _object.extend)(LinkUI.DEFAULTS, options));
    _classPrivateFieldInitSpec(this, _link, void 0);
  }

  /**
   * Build DOM structure.
   */
  build() {
    super.build();
    _classPrivateFieldSet(_link, this, this._element.firstChild);
  }

  /**
   * Update element.
   */
  update() {
    if (!this.isBuilt()) {
      return;
    }
    _classPrivateFieldGet(_link, this).textContent = this.translateIfPossible(this.options.textContent);
  }

  /**
   * Focus element.
   */
  focus() {
    if (this.isBuilt()) {
      _classPrivateFieldGet(_link, this).focus();
    }
  }

  /**
   * Activate the element.
   */
  activate() {
    _classPrivateFieldGet(_link, this).click();
  }
}
exports.LinkUI = LinkUI;