"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = useLocaleRequired;
var _react = require("react");
var _fetch = _interopRequireDefault(require("@gasket/fetch"));
var _config = require("./config");
var _utils = require("./utils");
var _context = require("./context");
/**
 * React that fetches a locale file and returns loading status
 * @type {import('./index').useLocaleRequired}
 */
function useLocaleRequired(localePathParam) {
  var _useContext = (0, _react.useContext)(_context.GasketIntlContext),
    locale = _useContext.locale,
    _useContext$status = _useContext.status,
    status = _useContext$status === void 0 ? {} : _useContext$status,
    dispatch = _useContext.dispatch;
  if (!Array.isArray(localePathParam)) {
    localePathParam = [localePathParam];
  }
  var loadingStatuses = localePathParam.map(function (localePathPart) {
    // thunks are supported but with context will be browser-only (empty object)
    var localePath = _utils.localeUtils.getLocalePath(localePathPart, locale);
    var fileStatus = status[localePath];
    if (fileStatus) return fileStatus;

    // We cannot use dispatch from useReducer during SSR, so exit early.
    // If you want a locale file to be ready, preload it to gasketIntl data
    // or load with getStaticProps or getServerSideProps.
    if (!_config.isBrowser) return _utils.LocaleStatus.LOADING;

    // Mutating status state to avoids an unnecessary render with using dispatch.
    status[localePath] = _utils.LocaleStatus.LOADING;
    var url = _utils.localeUtils.pathToUrl(localePath);

    // Upon fetching, we will dispatch file status and messages to kick off a render.
    (0, _fetch["default"])(url).then(function (r) {
      return r.ok ? r.json() : Promise.reject(new Error("Error loading locale file (".concat(r.status, "): ").concat(url)));
    }).then(function (messages) {
      dispatch({
        type: _utils.LocaleStatus.LOADED,
        payload: {
          locale: locale,
          messages: messages,
          file: localePath
        }
      });
    })["catch"](function (e) {
      console.error(e.message || e); // eslint-disable-line no-console
      dispatch({
        type: _utils.LocaleStatus.ERROR,
        payload: {
          file: localePath
        }
      });
    });
    return _utils.LocaleStatus.LOADING;
  });
  if (loadingStatuses.includes(_utils.LocaleStatus.ERROR)) return _utils.LocaleStatus.ERROR;
  if (loadingStatuses.includes(_utils.LocaleStatus.LOADING)) return _utils.LocaleStatus.LOADING;
  return _utils.LocaleStatus.LOADED;
}