"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = LocaleRequired;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _config = require("./config");
var _utils = require("./utils");
var _useLocaleRequired = _interopRequireDefault(require("./use-locale-required"));
/**
 * Component that loads a locale file before rendering children
 * @type {import('./index').LocaleRequired}
 */
function LocaleRequired(props) {
  var localesPath = props.localesPath,
    _props$loading = props.loading,
    loading = _props$loading === void 0 ? null : _props$loading,
    children = props.children;
  var loadState = (0, _useLocaleRequired["default"])(localesPath);
  if (loadState === _utils.LocaleStatus.LOADING) return loading;
  return children;
}
LocaleRequired.propTypes = {
  localesPath: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].func]),
  loading: _propTypes["default"].node,
  children: _propTypes["default"].node.isRequired
};
LocaleRequired.defaultProps = {
  localesPathPart: _config.manifest.defaultPath
};