"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLocalesParentDir = getLocalesParentDir;
exports.intlGetServerSideProps = intlGetServerSideProps;
exports.intlGetStaticProps = intlGetStaticProps;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _utils = require("./utils");
var _config = require("./config");
var localesParentDir;
/**
 * Get the parent directory of the locales directory
 * @returns {string} localesParentDir
 */
function getLocalesParentDir() {
  return localesParentDir || (
  // eslint-disable-next-line no-process-env
  localesParentDir = require('path').dirname(
  // eslint-disable-next-line no-process-env
  process.env.GASKET_INTL_LOCALES_DIR));
}

/**
 * Load locale file(s) for Next.js static pages
 * @type {import('./index').intlGetStaticProps}
 */
function intlGetStaticProps() {
  var localePathPart = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _config.manifest.defaultPath;
  return /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(ctx) {
      var locale, localesProps;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            // provide by next i18n
            locale = ctx.locale; // otherwise, check for locale in path params
            if (!locale) {
              locale = ctx.params.locale;
            }

            /** @type {import('@gasket/helper-intl').LocalesProps} */
            localesProps = _utils.localeUtils.serverLoadData(localePathPart, locale, getLocalesParentDir(), ctx);
            return _context.abrupt("return", {
              props: {
                localesProps: localesProps
              }
            });
          case 4:
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
 * Load locale file(s) for Next.js server-side rendered pages
 * @type {import('./index').intlGetServerSideProps}
 */
function intlGetServerSideProps() {
  var localePathPart = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _config.manifest.defaultPath;
  return /*#__PURE__*/function () {
    var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(ctx) {
      var res, locale, localesProps;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            res = ctx.res; // provide by next i18n
            locale = ctx.locale; // otherwise, check gasketData
            if (!locale && res.locals && res.locals.gasketData && res.locals.gasketData.intl) {
              locale = res.locals.gasketData.intl.locale;
            }

            /** @type {import('@gasket/helper-intl').LocalesProps} */
            localesProps = _utils.localeUtils.serverLoadData(localePathPart, locale, getLocalesParentDir(), ctx);
            return _context2.abrupt("return", {
              props: {
                localesProps: localesProps
              }
            });
          case 5:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }();
}