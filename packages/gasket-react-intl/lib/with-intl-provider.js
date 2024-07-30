"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = withIntlProvider;
exports.init = init;
exports.reducer = reducer;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _hoistNonReactStatics = _interopRequireDefault(require("hoist-non-react-statics"));
var _justExtend = _interopRequireDefault(require("just-extend"));
var _reactIntl = require("react-intl");
var _context = require("./context");
var _config = require("./config");
var _utils = require("./utils");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * Merges any initial state from render with that from page props
 * @type {import('./index').init}
 */
function init(localesProps) {
  var _localesProps$message = localesProps.messages,
    messages = _localesProps$message === void 0 ? {} : _localesProps$message,
    status = localesProps.status;
  if (_config.isBrowser) {
    // merge any data set on window with what comes from SSR or static page
    // props
    var _clientData$messages = _config.clientData.messages,
      dataMessages = _clientData$messages === void 0 ? {} : _clientData$messages,
      _clientData$status = _config.clientData.status,
      dataStatus = _clientData$status === void 0 ? {} : _clientData$status;
    // @ts-ignore
    return (0, _justExtend["default"])(true, {}, {
      messages: dataMessages,
      status: dataStatus
    }, {
      messages: messages,
      status: status
    });
  }
  return {
    messages: messages,
    status: status
  };
}

/**
 * Reducer for managing locale file loading status and messages
 * @type {import('./index').reducer}
 */
function reducer(state, action) {
  var type = action.type;
  var _action$payload = action.payload,
    locale = _action$payload.locale,
    messages = _action$payload.messages,
    file = _action$payload.file;
  if (type === _utils.LocaleStatus.LOADED) {
    return _objectSpread(_objectSpread({}, state), {}, {
      messages: _objectSpread(_objectSpread({}, state.messages), {}, (0, _defineProperty2["default"])({}, locale, _objectSpread(_objectSpread({}, state.messages[locale]), messages))),
      status: _objectSpread(_objectSpread({}, state.status), {}, (0, _defineProperty2["default"])({}, file, _utils.LocaleStatus.LOADED))
    });
  }
  return _objectSpread(_objectSpread({}, state), {}, {
    status: _objectSpread(_objectSpread({}, state.status), {}, (0, _defineProperty2["default"])({}, file, type))
  });
}

/**
 * Make an HOC that adds a provider to managing locale files as well as the
 * react-intl Provider. This can be used to wrap a top level React or a Next.js
 * custom App component.
 * @type {import('./index').withIntlProvider}
 */
function withIntlProvider() {
  return function (Component) {
    /**
     * @type {import('./index').IntlProviderWrapper}
     */
    function Wrapper(props) {
      // Support for wrapping Next.js App with data from get server side and
      // static props
      var _props$pageProps = props.pageProps,
        _props$pageProps2 = _props$pageProps === void 0 ? {} : _props$pageProps,
        localesProps = _props$pageProps2.localesProps;
      var _useReducer = (0, _react.useReducer)(reducer, localesProps || {}, init),
        _useReducer2 = (0, _slicedToArray2["default"])(_useReducer, 2),
        state = _useReducer2[0],
        dispatch = _useReducer2[1];

      // If we have incoming pageProps, we need to update state but have to by
      // mutation rather than issuing a dispatch to avoid re-renders and timing
      // issues
      if (localesProps) {
        (0, _justExtend["default"])(true, state, localesProps);
      }
      var locale = (localesProps === null || localesProps === void 0 ? void 0 : localesProps.locale) || (0, _utils.getActiveLocale)();

      /** @type {import('./index').LocaleStatus} */
      // @ts-ignore - the extend() mutation causes types issues
      var status = state.status;
      var messages = (state.messages || {})[locale];

      /** @type {import('./index').GasketIntlContext} */
      var contextValue = {
        locale: locale,
        status: status,
        dispatch: dispatch
      };
      return /*#__PURE__*/(0, _react.createElement)(_context.GasketIntlContext.Provider, {
        value: contextValue
      }, /*#__PURE__*/(0, _react.createElement)(_reactIntl.IntlProvider, {
        locale: locale,
        key: locale,
        messages: messages
      },
      /*#__PURE__*/
      // @ts-ignore
      (0, _react.createElement)(Component, props)));
    }
    Wrapper.displayName = "withIntlProvider(".concat(Component.displayName || Component.name || 'Component', ")");
    Wrapper.propTypes = {
      pageProps: _propTypes["default"].object
    };
    (0, _hoistNonReactStatics["default"])(Wrapper, Component);
    return Wrapper;
  };
}