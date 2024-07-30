"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = withLocaleRequired;
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _hoistNonReactStatics = _interopRequireDefault(require("hoist-non-react-statics"));
var _config = require("./config");
var _utils = require("./utils");
var _useLocaleRequired = _interopRequireDefault(require("./use-locale-required"));
var _excluded = ["forwardedRef", "localePathPart"];
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var defaultLocale = _config.manifest.defaultLocale,
  defaultPath = _config.manifest.defaultPath;

/**
 * Sets up and attaches the getInitialProps static method which preloads locale
 * files during SSR for Next.js pages. For browser routing, the locale files
 * will be fetched as normal.
 * @type {import('./index').attachGetInitialProps}
 */
function attachGetInitialProps(Wrapper, localePathPart) {
  var WrappedComponent = Wrapper.WrappedComponent;

  /** @type {import('./index').attachedGetInitialProps} */
  // @ts-ignore - attaches getInitialProps to Wrapper
  Wrapper.getInitialProps = /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(ctx) {
      var res, localesProps, resolvedLocalePathPart, _resolvedLocalePathPa, _ref2, _ref2$locale, locale, localesParentDir;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            res = ctx.res;
            if (typeof localePathPart === 'function') {
              // While this can be resolved by serverLoadData, we will do it here and
              // return in it in props to avoid having to re-resolve during hydrate
              // under different context
              resolvedLocalePathPart = _utils.localeUtils.resolveLocalePathPart(localePathPart, ctx);
            }
            if (res && res.locals && res.locals.gasketData) {
              _ref2 = res.locals.gasketData.intl || {}, _ref2$locale = _ref2.locale, locale = _ref2$locale === void 0 ? defaultLocale : _ref2$locale;
              localesParentDir = require('path').dirname(res.locals.localesDir);
              localesProps = _utils.localeUtils.serverLoadData((_resolvedLocalePathPa = resolvedLocalePathPart) !== null && _resolvedLocalePathPa !== void 0 ? _resolvedLocalePathPa : localePathPart, locale, localesParentDir);
            }
            _context.t0 = _objectSpread;
            _context.t1 = _objectSpread(_objectSpread({}, resolvedLocalePathPart ? {
              localePathPart: resolvedLocalePathPart
            } : {}), localesProps ? {
              localesProps: localesProps
            } : {});
            if (!WrappedComponent.getInitialProps) {
              _context.next = 11;
              break;
            }
            _context.next = 8;
            return WrappedComponent.getInitialProps(ctx);
          case 8:
            _context.t2 = _context.sent;
            _context.next = 12;
            break;
          case 11:
            _context.t2 = {};
          case 12:
            _context.t3 = _context.t2;
            return _context.abrupt("return", (0, _context.t0)(_context.t1, _context.t3));
          case 14:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();
}

/**
 * Make an HOC that loads a locale file before rendering wrapped component
 * @type {import('./index').withLocaleRequired}
 */
function withLocaleRequired() {
  var localePathPart = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultPath;
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$loading = options.loading,
    loading = _options$loading === void 0 ? null : _options$loading,
    _options$initialProps = options.initialProps,
    initialProps = _options$initialProps === void 0 ? false : _options$initialProps,
    _options$forwardRef = options.forwardRef,
    forwardRef = _options$forwardRef === void 0 ? false : _options$forwardRef;
  // eslint-disable-next-line max-statements
  return function (Component) {
    var displayName = Component.displayName || Component.name || 'Component';

    /**
     * @type {import('./index').LocaleRequiredWrapper}
     */
    function Wrapper(props) {
      var forwardedRef = props.forwardedRef,
        resolvedLocalePathPart = props.localePathPart,
        rest = (0, _objectWithoutProperties2["default"])(props, _excluded);
      var loadState = (0, _useLocaleRequired["default"])(resolvedLocalePathPart !== null && resolvedLocalePathPart !== void 0 ? resolvedLocalePathPart : localePathPart);
      if (loadState === _utils.LocaleStatus.LOADING) return loading;

      // @ts-ignore
      return /*#__PURE__*/(0, _react.createElement)(Component, _objectSpread(_objectSpread({}, rest), {}, {
        ref: forwardedRef
      }));
    }
    Wrapper.propTypes = {
      forwardedRef: _propTypes["default"].bool,
      localePathPart: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].func])
    };
    (0, _hoistNonReactStatics["default"])(Wrapper, Component);
    Wrapper.displayName = "withLocaleRequired(".concat(displayName, ")");
    Wrapper.WrappedComponent = Component;

    // Forward ref through the HOC
    if (!forwardRef) {
      if (initialProps || 'getInitialProps' in Component) {
        attachGetInitialProps(Wrapper, localePathPart);
      }
      return Wrapper;
    }
    var Result = /*#__PURE__*/_react["default"].forwardRef(function (props, ref) {
      return (
        /*#__PURE__*/
        // @ts-ignore
        (0, _react.createElement)(Wrapper, _objectSpread(_objectSpread({}, props), {}, {
          forwardedRef: ref
        }))
      );
    });
    (0, _hoistNonReactStatics["default"])(Result, Component);
    Result.displayName = "ForwardRef(withLocaleRequired/".concat(displayName, "))");
    // @ts-ignore
    Result.WrappedComponent = Component;
    if (initialProps || 'getInitialProps' in Component) {
      attachGetInitialProps(Result, localePathPart);
    }
    return Result;
  };
}