"use strict";

exports.__esModule = true;
var _clipboardData = _interopRequireDefault(require("./clipboardData"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * @private
 */
class PasteEvent {
  constructor() {
    this.clipboardData = new _clipboardData.default();
  }
}
exports.default = PasteEvent;